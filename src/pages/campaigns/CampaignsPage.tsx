import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Icon, icons } from '../../lib/icons'
import {
  type Campaign,
  type CampaignMember,
  type CampaignStatus,
  type MemberStatus,
  type OutreachTemplate,
  CAMPAIGN_STATUS_LABELS,
  DEMO_CAMPAIGNS,
  DEMO_TEMPLATES,
  loadWorkspace,
  saveWorkspace,
} from '../../lib/workspaceStore'

// ─── Shared contact data for campaign creation ────────────────────────────────

type SelectableContact = {
  id: string
  name: string
  companyId: string
  companyName: string
  role: string
}

const SELECTABLE_CONTACTS: SelectableContact[] = [
  { id: 'alex-obi', name: 'Alex Obi', companyId: 'kuda', companyName: 'Kuda', role: 'Head of Engineering' },
  { id: 'priya-mehta', name: 'Priya Mehta', companyId: 'stripe', companyName: 'Stripe', role: 'Engineering Manager' },
  { id: 'james-wu', name: 'James Wu', companyId: 'stripe', companyName: 'Stripe', role: 'Staff Software Engineer' },
  { id: 'sara-okonkwo', name: 'Sara Okonkwo', companyId: 'stripe', companyName: 'Stripe', role: 'Senior Backend Engineer' },
  { id: 'dele-adeyemi', name: 'Dele Adeyemi', companyId: 'paystack', companyName: 'Paystack', role: 'Engineering Manager' },
  { id: 'amara-nwosu', name: 'Amara Nwosu', companyId: 'paystack', companyName: 'Paystack', role: 'Senior Product Manager' },
]

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<CampaignStatus, { color: string; bg: string; border: string; dot: string }> = {
  DRAFT: { color: '#374151', bg: '#F3F4F6', border: '#E5E7EB', dot: '#9CA3AF' },
  READY: { color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', dot: '#3B82F6' },
  SENDING: { color: '#92400E', bg: '#FEF3C7', border: '#FDE68A', dot: '#F59E0B' },
  ACTIVE: { color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981' },
  PAUSED: { color: '#92400E', bg: '#FFF7ED', border: '#FED7AA', dot: '#F97316' },
  COMPLETED: { color: '#374151', bg: '#F3F4F6', border: '#E5E7EB', dot: '#6B7280' },
}

const MONOGRAM_COLORS: Record<string, { bg: string; text: string }> = {
  kuda: { bg: '#1B4DFF', text: '#fff' },
  stripe: { bg: '#635BFF', text: '#fff' },
  paystack: { bg: '#00C3F7', text: '#fff' },
  vercel: { bg: '#0E1726', text: '#fff' },
  flutterwave: { bg: '#F5A623', text: '#fff' },
}

// ─── Member status summary ─────────────────────────────────────────────────────

function getMemberSummary(members: CampaignMember[]): string {
  const total = members.length
  if (total === 0) return 'No members'
  const sent = members.filter(m => ['SENT', 'REPLIED', 'FOLLOW_UP_DUE', 'STOPPED', 'COMPLETED'].includes(m.status)).length
  const replied = members.filter(m => m.status === 'REPLIED').length
  if (replied > 0) return `${sent} sent · ${replied} replied`
  if (sent > 0) return `${sent} of ${total} sent`
  return `${total} member${total !== 1 ? 's' : ''}`
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 px-8">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}>
        <Icon d={icons.campaigns} size={26} strokeWidth={1.5} />
      </div>
      <div className="text-center max-w-100">
        <h2 className="text-[20px] font-bold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          No campaigns yet
        </h2>
        <p className="text-[14px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          Create a campaign when you're ready to reach multiple people with a reusable outreach message.
        </p>
      </div>
      <button
        onClick={onCreate}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
        style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
      >
        <Icon d={icons.plus} size={15} /> Create campaign
      </button>
    </div>
  )
}

// ─── Campaign card ────────────────────────────────────────────────────────────

function CampaignCard({ campaign, onClick }: { campaign: Campaign; onClick: () => void }) {
  const cfg = STATUS_CFG[campaign.status]
  const summary = getMemberSummary(campaign.members)
  const replied = campaign.members.filter(m => m.status === 'REPLIED').length
  const followUpDue = campaign.members.filter(m => m.status === 'FOLLOW_UP_DUE').length

  return (
    <div
      className="rounded-xl p-5 cursor-pointer transition-all"
      style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(79,70,229,0.07)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold truncate" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {campaign.name}
          </h3>
          {campaign.templateName && (
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
              Template: {campaign.templateName}
            </p>
          )}
        </div>
        <span
          className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
          {CAMPAIGN_STATUS_LABELS[campaign.status]}
        </span>
      </div>

      {/* Member avatars */}
      {campaign.members.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex -space-x-2">
            {campaign.members.slice(0, 4).map(m => (
              <div
                key={m.id}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-white"
                style={{ background: MONOGRAM_COLORS[m.companyId]?.bg ?? 'var(--color-muted)', color: MONOGRAM_COLORS[m.companyId]?.text ?? 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                title={`${m.contactName} · ${m.companyName}`}
              >
                {m.contactName[0]}
              </div>
            ))}
            {campaign.members.length > 4 && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-white" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}>
                +{campaign.members.length - 4}
              </div>
            )}
          </div>
          <span className="text-[12px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{summary}</span>
        </div>
      )}

      {/* Attention callouts */}
      {(replied > 0 || followUpDue > 0) && (
        <div className="flex gap-2 mb-3">
          {replied > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}>
              {replied} {replied === 1 ? 'reply' : 'replies'}
            </span>
          )}
          {followUpDue > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>
              {followUpDue} follow-up{followUpDue > 1 ? 's' : ''} due
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-[12px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          {campaign.members.length} member{campaign.members.length !== 1 ? 's' : ''}
        </span>
        <span className="text-[12px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          {campaign.lastActivity}
        </span>
      </div>
    </div>
  )
}

// ─── Create wizard ────────────────────────────────────────────────────────────

type WizardStep = 'name' | 'template' | 'contacts' | 'review'

function CreateWizard({ templates, onSave, onClose }: {
  templates: OutreachTemplate[]
  onSave: (campaign: Campaign) => void
  onClose: () => void
}) {
  const [step, setStep] = useState<WizardStep>('name')
  const [name, setName] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set())

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) ?? null

  function toggleContact(id: string) {
    setSelectedContacts(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleCreate() {
    const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    const members: CampaignMember[] = SELECTABLE_CONTACTS
      .filter(c => selectedContacts.has(c.id))
      .map(c => ({
        id: `mem-${c.companyId}-${c.id}-${Date.now()}`,
        personId: `contact-${c.id}`,
        contactName: c.name,
        companyId: c.companyId,
        companyName: c.companyName,
        status: 'READY' as MemberStatus,
        lastActivity: 'Just now',
        personalizedSubject: selectedTemplate?.subject.replace('{{company}}', c.companyName) ?? '',
        personalizedBody: selectedTemplate?.body
          .replace(/{{firstName}}/g, c.name.split(' ')[0])
          .replace(/{{company}}/g, c.companyName)
          .replace(/{{role}}/g, c.role) ?? '',
      }))

    const campaign: Campaign = {
      id: 'campaign-' + Date.now(),
      name,
      status: 'READY',
      templateId: selectedTemplateId ?? undefined,
      templateName: selectedTemplate?.name,
      members,
      createdAt: now,
      lastActivity: 'Just now',
    }
    onSave(campaign)
  }

  const canProceedName = name.trim().length >= 2
  const canProceedContacts = selectedContacts.size > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-[540px] rounded-2xl overflow-hidden flex flex-col" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', maxHeight: '90vh' }}>
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <h2 className="text-[17px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Create campaign
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              {(['name', 'template', 'contacts', 'review'] as WizardStep[]).map((s, i) => (
                <div key={s} className="flex items-center gap-1.5">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{
                      background: s === step ? 'var(--color-accent)' : step === 'review' || (['name', 'template', 'contacts'] as WizardStep[]).indexOf(s) < (['name', 'template', 'contacts', 'review'] as WizardStep[]).indexOf(step) ? '#10B981' : 'var(--color-muted)',
                      color: s === step || step === 'review' || (['name', 'template', 'contacts'] as WizardStep[]).indexOf(s) < (['name', 'template', 'contacts', 'review'] as WizardStep[]).indexOf(step) ? 'white' : 'var(--color-muted-fg)',
                    }}
                  >
                    {(['name', 'template', 'contacts', 'review'] as WizardStep[]).indexOf(s) < (['name', 'template', 'contacts', 'review'] as WizardStep[]).indexOf(step) ? '✓' : i + 1}
                  </span>
                  {i < 3 && <div className="w-4 h-px" style={{ background: 'var(--color-border)' }} />}
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--color-muted-fg)' }}>
            <Icon d={icons.x} size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 'name' && (
            <div>
              <label className="block text-[13px] font-semibold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Campaign name
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Fintech Engineering Outreach"
                autoFocus
                className="w-full px-3 py-2.5 rounded-lg text-[13.5px] outline-none transition-all"
                style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
                onFocus={e => (e.currentTarget.style.border = '1px solid var(--color-accent)')}
                onBlur={e => (e.currentTarget.style.border = '1px solid var(--color-border)')}
                onKeyDown={e => { if (e.key === 'Enter' && canProceedName) setStep('template') }}
              />
              <p className="text-[12px] mt-1.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                A descriptive name helps you identify the campaign purpose later.
              </p>
            </div>
          )}

          {step === 'template' && (
            <div>
              <p className="text-[13px] font-semibold mb-3" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Choose a template
              </p>
              {templates.filter(t => !t.isArchived).length === 0 ? (
                <div className="rounded-lg p-4 text-center" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                  <p className="text-[13px]" style={{ color: 'var(--color-muted-fg)' }}>No templates yet — you can skip this step and add one later.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {templates.filter(t => !t.isArchived).map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplateId(selectedTemplateId === t.id ? null : t.id)}
                      className="flex items-start gap-3 p-3.5 rounded-lg text-left transition-all"
                      style={{
                        background: selectedTemplateId === t.id ? '#EEF2FF' : 'var(--color-muted)',
                        border: selectedTemplateId === t.id ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border)',
                      }}
                    >
                      <div className="w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center"
                        style={{ borderColor: selectedTemplateId === t.id ? 'var(--color-accent)' : 'var(--color-border)' }}>
                        {selectedTemplateId === t.id && <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent)' }} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold" style={{ color: selectedTemplateId === t.id ? 'var(--color-accent)' : 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                          {t.name}
                        </p>
                        <p className="text-[12px] mt-0.5 truncate" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                          {t.subject}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <p className="text-[12px] mt-3" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                Each recipient will receive a personalized version. You can skip this and add a template later.
              </p>
            </div>
          )}

          {step === 'contacts' && (
            <div>
              <p className="text-[13px] font-semibold mb-3" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Select contacts
              </p>
              <div className="flex flex-col gap-2">
                {SELECTABLE_CONTACTS.map(c => {
                  const isSelected = selectedContacts.has(c.id)
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleContact(c.id)}
                      className="flex items-center gap-3 p-3 rounded-lg text-left transition-all"
                      style={{
                        background: isSelected ? '#EEF2FF' : 'var(--color-muted)',
                        border: isSelected ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border)',
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                        style={{ background: isSelected ? 'var(--color-accent)' : 'transparent', border: isSelected ? 'none' : '2px solid var(--color-border)' }}
                      >
                        {isSelected && <Icon d={icons.check} size={11} strokeWidth={2.5} className="text-white" />}
                      </div>
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0"
                        style={{ background: MONOGRAM_COLORS[c.companyId]?.bg ?? 'var(--color-muted)', color: MONOGRAM_COLORS[c.companyId]?.text ?? 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                      >
                        {c.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold" style={{ color: isSelected ? 'var(--color-accent)' : 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                          {c.name}
                        </p>
                        <p className="text-[11.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                          {c.role} · {c.companyName}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
              {selectedContacts.size > 0 && (
                <p className="text-[12px] mt-3 font-medium" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {selectedContacts.size} contact{selectedContacts.size !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          )}

          {step === 'review' && (
            <div className="flex flex-col gap-4">
              <div className="rounded-lg p-4" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                <p className="text-[10.5px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
                  Campaign summary
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Name', value: name },
                    { label: 'Template', value: selectedTemplate?.name ?? 'None' },
                    { label: 'Members', value: `${selectedContacts.size} contact${selectedContacts.size !== 1 ? 's' : ''}` },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-[12px] font-medium" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{row.label}</span>
                      <span className="text-[12.5px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[12px] font-semibold mb-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Members</p>
                <div className="flex flex-col gap-1.5">
                  {SELECTABLE_CONTACTS.filter(c => selectedContacts.has(c.id)).map(c => (
                    <div key={c.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0"
                        style={{ background: MONOGRAM_COLORS[c.companyId]?.bg ?? 'var(--color-muted)', color: MONOGRAM_COLORS[c.companyId]?.text ?? 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                      >
                        {c.name[0]}
                      </div>
                      <div>
                        <span className="text-[13px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{c.name}</span>
                        <span className="text-[12px] ml-1.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{c.companyName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={() => {
              const steps: WizardStep[] = ['name', 'template', 'contacts', 'review']
              const idx = steps.indexOf(step)
              if (idx > 0) setStep(steps[idx - 1])
              else onClose()
            }}
            className="text-[13px] font-medium"
            style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {step === 'name' ? 'Cancel' : '← Back'}
          </button>
          {step === 'review' ? (
            <button
              onClick={handleCreate}
              disabled={!canProceedContacts}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
              style={{
                background: canProceedContacts ? 'var(--color-primary)' : 'var(--color-muted)',
                color: canProceedContacts ? 'white' : 'var(--color-muted-fg)',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
              onMouseEnter={e => { if (canProceedContacts) e.currentTarget.style.background = '#1E2D4A' }}
              onMouseLeave={e => { if (canProceedContacts) e.currentTarget.style.background = 'var(--color-primary)' }}
            >
              <Icon d={icons.check} size={14} strokeWidth={2.5} /> Create campaign
            </button>
          ) : (
            <button
              onClick={() => {
                const steps: WizardStep[] = ['name', 'template', 'contacts', 'review']
                const idx = steps.indexOf(step)
                if (step === 'name' && !canProceedName) return
                if (step === 'contacts' && !canProceedContacts) return
                setStep(steps[idx + 1])
              }}
              disabled={(step === 'name' && !canProceedName) || (step === 'contacts' && !canProceedContacts)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
              style={{
                background: (step === 'name' && !canProceedName) || (step === 'contacts' && !canProceedContacts) ? 'var(--color-muted)' : 'var(--color-accent)',
                color: (step === 'name' && !canProceedName) || (step === 'contacts' && !canProceedContacts) ? 'var(--color-muted-fg)' : 'white',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              {step === 'template' ? 'Next →' : 'Next →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function CampaignsPage() {
  const navigate = useNavigate()
  const [ws, setWs] = useState(() => {
    const w = loadWorkspace()
    // Load demo campaigns if demo is loaded and campaigns list is empty
    if (w.isDemoLoaded && w.campaigns.length === 0) {
      const updated = { ...w, campaigns: DEMO_CAMPAIGNS }
      saveWorkspace(updated)
      return updated
    }
    return w
  })
  const [showCreate, setShowCreate] = useState(false)

  // Ensure templates are available for the wizard
  const templates = ws.templates.length === 0 && ws.isDemoLoaded
    ? DEMO_TEMPLATES
    : ws.templates

  function handleCreate(campaign: Campaign) {
    const updated = { ...ws, campaigns: [campaign, ...ws.campaigns] }
    saveWorkspace(updated)
    setWs(updated)
    setShowCreate(false)
    navigate(`/campaigns/${campaign.id}`)
  }

  const campaigns = ws.campaigns

  return (
    <div className="max-w-245 mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Campaigns
          </h1>
          <p className="text-[14px] mt-1" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            Create and manage outreach campaigns across multiple contacts.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
          style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
        >
          <Icon d={icons.plus} size={14} /> Create campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <EmptyState onCreate={() => setShowCreate(true)} />
      ) : (
        <>
          {/* Status filter bar */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {(['ACTIVE', 'READY', 'DRAFT', 'COMPLETED'] as CampaignStatus[]).map(s => {
              const count = campaigns.filter(c => c.status === s).length
              if (count === 0) return null
              const cfg = STATUS_CFG[s]
              return (
                <span key={s} className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                  {CAMPAIGN_STATUS_LABELS[s]} · {count}
                </span>
              )
            })}
          </div>

          {/* Campaign grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map(c => (
              <CampaignCard key={c.id} campaign={c} onClick={() => navigate(`/campaigns/${c.id}`)} />
            ))}
          </div>
        </>
      )}

      {showCreate && (
        <CreateWizard
          templates={templates}
          onSave={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}

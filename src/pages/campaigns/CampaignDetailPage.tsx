import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Icon, icons } from '../../lib/icons'
import {
  type Campaign,
  type CampaignMember,
  type CampaignStatus,
  type MemberStatus,
  type SenderAccount,
  type Integration,
  CAMPAIGN_STATUS_LABELS,
  MEMBER_STATUS_LABELS,
  DEMO_CAMPAIGNS,
  loadWorkspace,
  saveWorkspace,
} from '../../lib/workspaceStore'

// ─── Status configs ────────────────────────────────────────────────────────────

const CAMPAIGN_STATUS_CFG: Record<CampaignStatus, { color: string; bg: string; border: string; dot: string }> = {
  DRAFT: { color: '#374151', bg: '#F3F4F6', border: '#E5E7EB', dot: '#9CA3AF' },
  READY: { color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', dot: '#3B82F6' },
  SENDING: { color: '#92400E', bg: '#FEF3C7', border: '#FDE68A', dot: '#F59E0B' },
  ACTIVE: { color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981' },
  PAUSED: { color: '#92400E', bg: '#FFF7ED', border: '#FED7AA', dot: '#F97316' },
  COMPLETED: { color: '#374151', bg: '#F3F4F6', border: '#E5E7EB', dot: '#6B7280' },
}

const MEMBER_STATUS_CFG: Record<MemberStatus, { color: string; bg: string; border: string; dot: string }> = {
  PENDING: { color: '#374151', bg: '#F3F4F6', border: '#E5E7EB', dot: '#9CA3AF' },
  READY: { color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', dot: '#3B82F6' },
  SENT: { color: '#5B21B6', bg: '#F5F3FF', border: '#DDD6FE', dot: '#8B5CF6' },
  REPLIED: { color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981' },
  FOLLOW_UP_DUE: { color: '#92400E', bg: '#FEF3C7', border: '#FDE68A', dot: '#F59E0B' },
  STOPPED: { color: '#991B1B', bg: '#FEF2F2', border: '#FECACA', dot: '#EF4444' },
  COMPLETED: { color: '#374151', bg: '#F3F4F6', border: '#E5E7EB', dot: '#6B7280' },
}

const MONOGRAM_COLORS: Record<string, { bg: string; text: string }> = {
  kuda: { bg: '#1B4DFF', text: '#fff' },
  stripe: { bg: '#635BFF', text: '#fff' },
  paystack: { bg: '#00C3F7', text: '#fff' },
  vercel: { bg: '#0E1726', text: '#fff' },
  flutterwave: { bg: '#F5A623', text: '#fff' },
}

function getNextAction(status: MemberStatus): string {
  switch (status) {
    case 'REPLIED': return 'Continue conversation'
    case 'FOLLOW_UP_DUE': return 'Review follow-up'
    case 'SENT': return 'Awaiting reply'
    case 'READY': return 'Ready to send'
    case 'PENDING': return 'Prepare message'
    case 'STOPPED': return 'View history'
    case 'COMPLETED': return 'View outcome'
  }
}

// ─── Campaign stats ────────────────────────────────────────────────────────────

function CampaignStats({ members }: { members: CampaignMember[] }) {
  const total = members.length
  const sent = members.filter(m => ['SENT', 'REPLIED', 'FOLLOW_UP_DUE', 'STOPPED', 'COMPLETED'].includes(m.status)).length
  const replied = members.filter(m => m.status === 'REPLIED').length
  const followUpDue = members.filter(m => m.status === 'FOLLOW_UP_DUE').length
  const stopped = members.filter(m => m.status === 'STOPPED').length

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: 'Members', value: total, color: 'var(--color-primary)' },
        { label: 'Sent', value: sent, color: '#8B5CF6' },
        { label: 'Replied', value: replied, color: '#10B981' },
        { label: 'Follow-up due', value: followUpDue, color: '#F59E0B' },
      ].map(stat => (
        <div key={stat.label} className="rounded-xl p-4" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <p className="text-[28px] font-bold leading-none mb-1" style={{ color: stat.color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {stat.value}
          </p>
          <p className="text-[12px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  )
}

// ─── Member card ──────────────────────────────────────────────────────────────

function MemberCard({ member, onNavigate }: {
  member: CampaignMember
  onNavigate: (companyId: string, memberStatus: MemberStatus) => void
}) {
  const cfg = MEMBER_STATUS_CFG[member.status]
  const nextAction = getNextAction(member.status)
  const isActionable = member.status !== 'SENT' && member.status !== 'PENDING'

  return (
    <div
      className="rounded-xl p-4 transition-all"
      style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[13px] shrink-0"
            style={{ background: MONOGRAM_COLORS[member.companyId]?.bg ?? 'var(--color-muted)', color: MONOGRAM_COLORS[member.companyId]?.text ?? 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {member.contactName[0]}
          </div>
          <div>
            <p className="text-[14px] font-semibold leading-snug" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {member.contactName}
            </p>
            <button
              onClick={() => onNavigate(member.companyId, member.status)}
              className="text-[12px] font-medium transition-colors"
              style={{ color: 'var(--color-accent)', fontFamily: 'Inter, sans-serif' }}
            >
              {member.companyName} ↗
            </button>
          </div>
        </div>
        <span
          className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
          {MEMBER_STATUS_LABELS[member.status]}
        </span>
      </div>

      {/* Message preview */}
      {member.personalizedSubject && (
        <div className="rounded-lg px-3 py-2 mb-3" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
          <p className="text-[11px] font-semibold mb-0.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Subject</p>
          <p className="text-[12.5px] truncate" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
            {member.personalizedSubject}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-[12px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          {member.sentAt ? `Sent ${member.sentAt}` : member.lastActivity}
        </span>
        {isActionable ? (
          <button
            onClick={() => onNavigate(member.companyId, member.status)}
            className="text-[12px] font-semibold flex items-center gap-1"
            style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {nextAction} <Icon d={icons.arrowRight} size={11} />
          </button>
        ) : (
          <span className="text-[12px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{nextAction}</span>
        )}
      </div>
    </div>
  )
}

// ─── Message preview modal ────────────────────────────────────────────────────

function MessagePreviewModal({ member, onClose }: { member: CampaignMember; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-[540px] rounded-2xl overflow-hidden flex flex-col" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', maxHeight: '80vh' }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <h3 className="text-[15px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {member.contactName} · {member.companyName}
            </h3>
            <p className="text-[12px]" style={{ color: 'var(--color-muted-fg)' }}>{MEMBER_STATUS_LABELS[member.status]}</p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--color-muted-fg)' }}><Icon d={icons.x} size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {member.personalizedSubject && (
            <div className="mb-4">
              <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Subject</p>
              <p className="text-[14px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{member.personalizedSubject}</p>
            </div>
          )}
          {member.personalizedBody && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Message</p>
              <div className="rounded-lg p-4" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                {member.personalizedBody.split('\n').map((line, i) => (
                  <p key={i} className={`text-[13.5px] leading-relaxed ${line === '' ? 'mb-3' : ''}`}
                    style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
                    {line || ' '}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Sender account review ────────────────────────────────────────────────────

function SenderReview({ senderAccount, integration, onClear }: { senderAccount: SenderAccount; integration?: Integration; onClear: () => void }) {
  const fields = [
    { label: 'From', value: `${senderAccount.name} <${senderAccount.email}>` },
    { label: 'Reply-to', value: senderAccount.replyTo ?? senderAccount.email },
    { label: 'Via', value: integration?.name ?? 'Unknown integration' },
  ]
  return (
    <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11.5px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Sender identity</p>
        <button onClick={onClear} className="text-[11.5px] font-medium" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Change</button>
      </div>
      <div className="flex flex-col gap-1.5">
        {fields.map(f => (
          <div key={f.label} className="flex items-baseline gap-2">
            <span className="text-[11.5px] font-semibold w-14 shrink-0" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{f.label}</span>
            <span className="text-[13px]" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Sending simulation ───────────────────────────────────────────────────────

function SendSimulation({ campaign, onComplete }: { campaign: Campaign; onComplete: (updated: Campaign) => void }) {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const total = campaign.members.length

  function startSend() {
    let count = 0
    const interval = setInterval(() => {
      count++
      setProgress(count)
      if (count >= total) {
        clearInterval(interval)
        setDone(true)
        const updatedCampaign: Campaign = {
          ...campaign,
          status: 'ACTIVE',
          lastActivity: 'Just now',
          members: campaign.members.map(m => ({
            ...m,
            status: m.status === 'READY' ? 'SENT' : m.status,
            sentAt: 'Just now',
            lastActivity: 'Just now',
          })),
        }
        setTimeout(() => onComplete(updatedCampaign), 800)
      }
    }, 300)
  }

  if (done) {
    return (
      <div className="text-center py-3">
        <div className="flex items-center justify-center gap-2">
          <Icon d={icons.checkCircle} size={18} strokeWidth={2} className="text-green-600" />
          <span className="text-[14px] font-semibold" style={{ color: '#065F46', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Campaign active</span>
        </div>
      </div>
    )
  }

  if (progress > 0) {
    return (
      <div className="text-center py-2">
        <p className="text-[13px] mb-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          Sending campaign… {progress} of {total} prepared
        </p>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-muted)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${(progress / total) * 100}%`, background: 'var(--color-accent)' }}
          />
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={startSend}
      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
      style={{ background: 'var(--color-accent)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#4338CA')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
    >
      <Icon d={icons.send} size={14} /> Send campaign
    </button>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [campaign, setCampaign] = useState<Campaign | null>(() => {
    const ws = loadWorkspace()
    let found = ws.campaigns.find(c => c.id === id) ?? null
    if (!found) {
      const demoFound = DEMO_CAMPAIGNS.find(c => c.id === id)
      if (demoFound) {
        const updated = { ...ws, campaigns: [...ws.campaigns, demoFound] }
        saveWorkspace(updated)
        found = demoFound
      }
    }
    return found
  })

  const [previewMember, setPreviewMember] = useState<CampaignMember | null>(null)
  const [showSend, setShowSend] = useState(false)
  const [selectedSenderId, setSelectedSenderId] = useState<string>(() => {
    const ws = loadWorkspace()
    const defaultAcc = ws.senderAccounts.find(a => a.isDefault) ?? ws.senderAccounts[0]
    return defaultAcc?.id ?? ''
  })

  const senderAccounts = loadWorkspace().senderAccounts
  const integrations = loadWorkspace().integrations
  const selectedSender = senderAccounts.find(a => a.id === selectedSenderId) ?? null
  const selectedIntegration = selectedSender ? integrations.find(i => i.id === selectedSender.integrationId) : null

  function updateCampaign(updated: Campaign) {
    const ws = loadWorkspace()
    const withSender = selectedSenderId ? { ...updated, senderAccountId: selectedSenderId } : updated
    const exists = ws.campaigns.some(c => c.id === updated.id)
    const campaigns = exists
      ? ws.campaigns.map(c => c.id === updated.id ? withSender : c)
      : [...ws.campaigns, withSender]
    saveWorkspace({ ...ws, campaigns })
    setCampaign(withSender)
    setShowSend(false)
  }

  if (!campaign) {
    return (
      <div className="max-w-245 mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-[16px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Campaign not found</p>
        <button onClick={() => navigate('/campaigns')} className="mt-3 text-[13px] font-semibold flex items-center gap-1 mx-auto" style={{ color: 'var(--color-accent)' }}>
          <Icon d={icons.arrowLeft} size={13} /> Back to Campaigns
        </button>
      </div>
    )
  }

  const statusCfg = CAMPAIGN_STATUS_CFG[campaign.status]
  const readyMembers = campaign.members.filter(m => m.status === 'READY').length
  const attentionMembers = campaign.members.filter(m => ['REPLIED', 'FOLLOW_UP_DUE'].includes(m.status))

  return (
    <div className="max-w-245 mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/campaigns')}
        className="flex items-center gap-1.5 text-[13px] font-medium mb-5 transition-colors"
        style={{ color: 'var(--color-muted-fg)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted-fg)')}
      >
        <Icon d={icons.arrowLeft} size={13} /> Campaigns
      </button>

      {/* Header */}
      <div className="rounded-xl p-5 mb-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--color-accent)', color: 'white' }}>
              <Icon d={icons.campaigns} size={18} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[20px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {campaign.name}
                </h1>
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusCfg.dot }} />
                  {CAMPAIGN_STATUS_LABELS[campaign.status]}
                </span>
                {campaign.isDemo && (
                  <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded" style={{ background: '#FEF9C3', color: '#713F12' }}>Demo</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-[12.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                  {campaign.members.length} member{campaign.members.length !== 1 ? 's' : ''}
                </span>
                {campaign.templateName && (
                  <span className="text-[12.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                    Template: {campaign.templateName}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {campaign.status === 'READY' && !showSend && readyMembers > 0 && (
              <button
                onClick={() => setShowSend(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
                style={{ background: 'var(--color-accent)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#4338CA')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
              >
                <Icon d={icons.send} size={14} /> Send campaign
              </button>
            )}
          </div>
        </div>

        {/* Send flow */}
        {showSend && campaign.status === 'READY' && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
            <p className="text-[12.5px] mb-4" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
              {readyMembers} member{readyMembers !== 1 ? 's' : ''} ready · {readyMembers === campaign.members.length ? 'All ready' : `${readyMembers} of ${campaign.members.length} ready`}
            </p>

            {/* Sender account selection */}
            {senderAccounts.length === 0 ? (
              <div className="rounded-xl p-4 mb-4 flex items-start gap-3" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
                <span style={{ color: '#D97706', flexShrink: 0, marginTop: 1, display: 'flex' }}><Icon d={icons.alertCircle} size={16} /></span>
                <div>
                  <p className="text-[13px] font-semibold mb-0.5" style={{ color: '#92400E', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>No sender account configured</p>
                  <p className="text-[12.5px]" style={{ color: '#92400E', fontFamily: 'Inter, sans-serif' }}>
                    <button onClick={() => navigate('/sender-accounts')} className="underline font-semibold">Create a sender account</button> before sending this campaign.
                  </p>
                </div>
              </div>
            ) : selectedSender ? (
              <SenderReview
                senderAccount={selectedSender}
                integration={selectedIntegration ?? undefined}
                onClear={() => setSelectedSenderId('')}
              />
            ) : (
              <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                <p className="text-[12.5px] font-semibold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Choose sender account</p>
                <div className="flex flex-col gap-2">
                  {senderAccounts.map(a => {
                    const intg = integrations.find(i => i.id === a.integrationId)
                    return (
                      <button
                        key={a.id}
                        onClick={() => setSelectedSenderId(a.id)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all"
                        style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                      >
                        <div>
                          <p className="text-[13px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{a.name} &lt;{a.email}&gt;</p>
                          <p className="text-[12px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>via {intg?.name ?? 'integration'}</p>
                        </div>
                        {a.isDefault && <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>Default</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {senderAccounts.length > 0 && selectedSender && (
              <SendSimulation campaign={campaign} onComplete={updateCampaign} />
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mb-5">
        <CampaignStats members={campaign.members} />
      </div>

      {/* Needs attention */}
      {attentionMembers.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-[13.5px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em' }}>
              Needs attention
            </h2>
            <span className="text-[11.5px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'var(--color-accent)', color: 'white' }}>
              {attentionMembers.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {attentionMembers.map(m => (
              <MemberCard key={m.id} member={m} onNavigate={(cid, status) => {
                const conversationStatuses: MemberStatus[] = ['REPLIED', 'FOLLOW_UP_DUE', 'STOPPED', 'COMPLETED']
                navigate(conversationStatuses.includes(status) ? `/conversations/${cid}` : `/companies/${cid}`)
              }} />
            ))}
          </div>
        </div>
      )}

      {/* All members */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13.5px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em' }}>
            All members
          </h2>
          <span className="text-[12px]" style={{ color: 'var(--color-muted-fg)' }}>{campaign.members.length} total</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {campaign.members.map(m => (
            <div
              key={m.id}
              className="relative rounded-xl overflow-hidden"
            >
              <MemberCard key={m.id} member={m} onNavigate={(cid, status) => {
                const conversationStatuses: MemberStatus[] = ['REPLIED', 'FOLLOW_UP_DUE', 'STOPPED', 'COMPLETED']
                navigate(conversationStatuses.includes(status) ? `/conversations/${cid}` : `/companies/${cid}`)
              }} />
              <button
                onClick={() => setPreviewMember(m)}
                className="absolute top-3 right-3 text-[11px] font-medium flex items-center gap-1 transition-colors"
                style={{ color: 'var(--color-muted-fg)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted-fg)')}
                title="Preview message"
              >
                <Icon d={icons.eye} size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {previewMember && (
        <MessagePreviewModal member={previewMember} onClose={() => setPreviewMember(null)} />
      )}
    </div>
  )
}

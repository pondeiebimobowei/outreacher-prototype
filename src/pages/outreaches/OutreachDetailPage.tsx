import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Icon, icons } from '../../lib/icons'
import {
  type OutreachStatus,
  type Outreach,
  loadWorkspace,
  saveWorkspace,
  DEMO_OUTREACHES,
  DEMO_PEOPLE,
  DEMO_PERSON_COMPANY_ASSOCIATIONS,
  DEMO_CAMPAIGNS,
  DEMO_TEMPLATES,
  DEMO_SENDER_ACCOUNTS,
  DEMO_INTEGRATIONS,
} from '../../lib/workspaceStore'

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<OutreachStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  DRAFT: { label: 'Draft', color: '#374151', bg: '#F3F4F6', border: '#E5E7EB', dot: '#9CA3AF' },
  READY: { label: 'Ready', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', dot: '#3B82F6' },
  SENT: { label: 'Sent', color: '#5B21B6', bg: '#F5F3FF', border: '#DDD6FE', dot: '#8B5CF6' },
  ARCHIVED: { label: 'Archived', color: '#374151', bg: '#F3F4F6', border: '#E5E7EB', dot: '#6B7280' },
}

// ─── Sidebar row ──────────────────────────────────────────────────────────────

function SidebarRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="text-[11px] font-bold uppercase tracking-wide"
        style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}
      >
        {label}
      </span>
      <div
        className="text-[13px]"
        style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
      >
        {children}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

function initWorkspace() {
  const w = loadWorkspace()
  if (w.isDemoLoaded) {
    let updated = { ...w }
    let dirty = false
    if (w.outreaches.length === 0) { updated = { ...updated, outreaches: DEMO_OUTREACHES }; dirty = true }
    if (w.people.length === 0) { updated = { ...updated, people: DEMO_PEOPLE }; dirty = true }
    if (w.personCompanyAssociations.length === 0) { updated = { ...updated, personCompanyAssociations: DEMO_PERSON_COMPANY_ASSOCIATIONS }; dirty = true }
    if (w.campaigns.length === 0) { updated = { ...updated, campaigns: DEMO_CAMPAIGNS }; dirty = true }
    if (w.templates.length === 0) { updated = { ...updated, templates: DEMO_TEMPLATES }; dirty = true }
    if (w.senderAccounts.length === 0) { updated = { ...updated, senderAccounts: DEMO_SENDER_ACCOUNTS }; dirty = true }
    if (w.integrations.length === 0) { updated = { ...updated, integrations: DEMO_INTEGRATIONS }; dirty = true }
    if (dirty) saveWorkspace(updated)
    return updated
  }
  return w
}

export function OutreachDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [ws, setWs] = useState(initWorkspace)
  const [editing, setEditing] = useState(false)
  const [editSubject, setEditSubject] = useState('')
  const [editMessage, setEditMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const patchOutreach = useCallback((patch: Partial<Outreach>) => {
    const updated = loadWorkspace()
    const newOutreaches = updated.outreaches.map(o => o.id === id ? { ...o, ...patch } : o)
    const saved = { ...updated, outreaches: newOutreaches }
    saveWorkspace(saved)
    setWs(saved)
  }, [id])

  const outreach = ws.outreaches.find(o => o.id === id) ?? null

  if (!outreach) {
    return (
      <div className="max-w-245 mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p
          className="text-[16px] font-bold"
          style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          Outreach not found
        </p>
        <button
          onClick={() => navigate('/outreaches')}
          className="mt-3 text-[13px] font-semibold flex items-center gap-1 mx-auto"
          style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          <Icon d={icons.arrowLeft} size={13} /> Back to Outreaches
        </button>
      </div>
    )
  }

  const contact = ws.people.find(c => c.id === outreach.personId)
  const company = ws.companies.find(c => c.id === outreach.companyId)
  const assoc = outreach.personCompanyAssociationId
    ? ws.personCompanyAssociations.find(a => a.id === outreach.personCompanyAssociationId)
    : ws.personCompanyAssociations.find(a => a.personId === outreach.personId && a.companyId === outreach.companyId)
  const campaign = outreach.campaignId
    ? ws.campaigns.find(c => c.id === outreach.campaignId)
    : undefined
  const template = outreach.templateId
    ? ws.templates.find(t => t.id === outreach.templateId)
    : undefined
  const senderAccount = outreach.senderAccountId
    ? ws.senderAccounts.find(a => a.id === outreach.senderAccountId)
    : undefined
  const integration = senderAccount
    ? ws.integrations.find(i => i.id === senderAccount.integrationId)
    : undefined

  const contactName = contact
    ? `${contact.firstName} ${contact.lastName}`
    : outreach.personId
  const contactInitials = contact?.avatarInitials ?? contactName.slice(0, 2).toUpperCase()
  const contactAvatarBg = contact?.avatarBg ?? '#6B7280'
  const contactRole = assoc?.title ?? ''
  const companyName = company?.name ?? outreach.companyId

  const statusCfg = STATUS_CFG[outreach.status]

  function handleStartEdit() {
    if (!outreach) return
    setEditSubject(outreach.subject)
    setEditMessage(outreach.message)
    setEditing(true)
  }

  function handleSaveEdit() {
    patchOutreach({ subject: editSubject, message: editMessage })
    setEditing(false)
  }

  function handleMarkReady() {
    patchOutreach({ status: 'READY' })
  }

  function handleSend() {
    if (!outreach) return
    const currentWs = loadWorkspace()
    const sender = outreach.senderAccountId
      ? currentWs.senderAccounts.find(a => a.id === outreach.senderAccountId)
      : currentWs.senderAccounts[0]

    if (sender?.dailyLimit && (sender.sentToday ?? 0) >= sender.dailyLimit) {
      setSendError(`Daily limit reached for ${sender.name} (${sender.sentToday}/${sender.dailyLimit})`)
      return
    }

    setSendError(null)
    setSending(true)
    setTimeout(() => {
      const ws2 = loadWorkspace()
      const now = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      const newOutreaches = ws2.outreaches.map(o =>
        o.id === id ? { ...o, status: 'SENT' as OutreachStatus, sentAt: now } : o
      )
      const newAccounts = sender
        ? ws2.senderAccounts.map(a =>
          a.id === sender.id ? { ...a, sentToday: (a.sentToday ?? 0) + 1 } : a
        )
        : ws2.senderAccounts
      const saved = { ...ws2, outreaches: newOutreaches, senderAccounts: newAccounts }
      saveWorkspace(saved)
      setWs(saved)
      setSending(false)
    }, 1400)
  }

  return (
    <div className="max-w-245 mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/outreaches')}
        className="flex items-center gap-1.5 text-[13px] font-medium mb-5 transition-colors"
        style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted-fg)')}
      >
        <Icon d={icons.arrowLeft} size={13} /> Outreaches
      </button>

      {/* Header card */}
      <div
        className="rounded-xl p-5 mb-5"
        style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-[14px] font-bold shrink-0"
              style={{ background: contactAvatarBg, color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {contactInitials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1
                  className="text-[18px] font-bold"
                  style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  {contactName}
                </h1>
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: statusCfg.bg,
                    color: statusCfg.color,
                    border: `1px solid ${statusCfg.border}`,
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusCfg.dot }} />
                  {statusCfg.label}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {contactRole && (
                  <span
                    className="text-[12.5px]"
                    style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}
                  >
                    {contactRole}
                  </span>
                )}
                {contactRole && company && (
                  <span style={{ color: 'var(--color-border)' }}>·</span>
                )}
                {company && (
                  <button
                    onClick={() => navigate(`/companies/${company.id}`)}
                    className="text-[12.5px] font-semibold transition-colors"
                    style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    {companyName} ↗
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {outreach.status !== 'SENT' && (
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {outreach.status === 'DRAFT' && !editing && (
                <>
                  <button
                    onClick={handleStartEdit}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-medium transition-all"
                    style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted-fg)', background: 'var(--color-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-primary)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-muted-fg)' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleMarkReady}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold transition-all"
                    style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#DBEAFE')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#EFF6FF')}
                  >
                    Mark ready
                  </button>
                </>
              )}
              {outreach.status === 'READY' && (
                <>
                  <button
                    onClick={handleStartEdit}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-medium transition-all"
                    style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted-fg)', background: 'var(--color-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-primary)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-muted-fg)' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-semibold transition-all"
                    style={{ background: sending ? 'var(--color-muted)' : 'var(--color-primary)', color: sending ? 'var(--color-muted-fg)' : 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                    onMouseEnter={e => { if (!sending) e.currentTarget.style.background = '#1E2D4A' }}
                    onMouseLeave={e => { if (!sending) e.currentTarget.style.background = 'var(--color-primary)' }}
                  >
                    {sending ? 'Sending…' : 'Send outreach'}
                    {!sending && <Icon d={icons.outreach} size={13} />}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Send error */}
        {sendError && (
          <div className="mt-3 flex items-center gap-2 px-3.5 py-2.5 rounded-lg" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
            <span style={{ color: '#DC2626', display: 'flex' }}><Icon d={icons.alertCircle} size={14} /></span>
            <p className="text-[12.5px]" style={{ color: '#991B1B', fontFamily: 'Inter, sans-serif' }}>{sendError}</p>
          </div>
        )}

        {/* Inline edit form */}
        {editing && (
          <div className="mt-4 flex flex-col gap-3" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Subject</label>
              <input
                value={editSubject}
                onChange={e => setEditSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg text-[13.5px] outline-none"
                style={{ border: '1px solid var(--color-border)', background: 'var(--color-muted)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Message</label>
              <textarea
                value={editMessage}
                onChange={e => setEditMessage(e.target.value)}
                rows={8}
                className="w-full px-3.5 py-2.5 rounded-lg text-[13.5px] outline-none resize-none"
                style={{ border: '1px solid var(--color-border)', background: 'var(--color-muted)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-lg text-[12.5px] font-semibold transition-all"
                style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
              >
                Save changes
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-lg text-[12.5px] font-medium"
                style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main layout: message + sidebar */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left: message card */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Message card */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
          >
            <div
              className="px-5 py-4"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <p
                className="text-[11px] font-bold uppercase tracking-wide mb-1"
                style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}
              >
                Subject
              </p>
              <h2
                className="text-[16px] font-bold"
                style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                {outreach.subject}
              </h2>
            </div>
            <div className="px-5 py-5">
              <p
                className="text-[11px] font-bold uppercase tracking-wide mb-3"
                style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}
              >
                Message
              </p>
              <p
                className="text-[13.5px] leading-relaxed whitespace-pre-wrap"
                style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
              >
                {outreach.message}
              </p>
            </div>
          </div>

          {/* Conversation section */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span style={{ color: 'var(--color-muted-fg)', display: 'flex' }}>
                <Icon d={icons.replies} size={16} strokeWidth={1.6} />
              </span>
              <h3
                className="text-[13.5px] font-bold"
                style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                Conversation
              </h3>
            </div>
            {outreach.conversationId ? (
              <div className="flex items-center justify-between">
                <p
                  className="text-[13px]"
                  style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}
                >
                  This outreach has an active conversation thread.
                </p>
                <button
                  onClick={() => navigate(`/conversations/${outreach.conversationId}`)}
                  className="flex items-center gap-1.5 text-[13px] font-semibold shrink-0 ml-3"
                  style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  View conversation
                  <Icon d={icons.arrowRight} size={13} />
                </button>
              </div>
            ) : (
              <p
                className="text-[13px]"
                style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}
              >
                No reply yet.
              </p>
            )}
          </div>
        </div>

        {/* Right: sidebar context */}
        <div className="lg:w-70 shrink-0 flex flex-col gap-4">
          {/* Why this person */}
          {assoc?.whyThisPerson && (
            <div
              className="rounded-xl p-4"
              style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
            >
              <p
                className="text-[11px] font-bold uppercase tracking-wide mb-2"
                style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}
              >
                Why this person
              </p>
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
              >
                {assoc.whyThisPerson}
              </p>
            </div>
          )}

          {/* Context details */}
          <div
            className="rounded-xl p-4 flex flex-col gap-4"
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
          >
            <SidebarRow label="Company">
              {company ? (
                <button
                  onClick={() => navigate(`/companies/${company.id}`)}
                  className="font-semibold transition-opacity"
                  style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  {companyName} ↗
                </button>
              ) : (
                <span>{companyName}</span>
              )}
            </SidebarRow>

            <SidebarRow label="Campaign">
              {campaign ? (
                <button
                  onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  className="font-semibold transition-opacity"
                  style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  {campaign.name} ↗
                </button>
              ) : (
                <span style={{ color: 'var(--color-muted-fg)' }}>Individual outreach</span>
              )}
            </SidebarRow>

            <SidebarRow label="Sender">
              {senderAccount ? (
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{senderAccount.name} &lt;{senderAccount.email}&gt;</span>
                  {integration && (
                    <span style={{ color: 'var(--color-muted-fg)', fontSize: '12px' }}>
                      Via: {integration.name}
                    </span>
                  )}
                </div>
              ) : (
                <span style={{ color: 'var(--color-muted-fg)' }}>Not configured</span>
              )}
            </SidebarRow>

            {template && (
              <SidebarRow label="Template">
                <span className="font-medium">{template.name}</span>
              </SidebarRow>
            )}

            <SidebarRow label="Created">
              <span style={{ color: 'var(--color-muted-fg)' }}>{outreach.createdAt}</span>
            </SidebarRow>

            {outreach.sentAt && (
              <SidebarRow label="Sent">
                <span style={{ color: 'var(--color-muted-fg)' }}>{outreach.sentAt}</span>
              </SidebarRow>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

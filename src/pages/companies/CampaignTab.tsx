import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Icon, icons } from '../../lib/icons'
import type { CompanyEntry, ConvMessage } from '../../lib/workspaceStore'
import { calcFollowUpDueAt, loadWorkspace } from '../../lib/workspaceStore'
import { getContactData } from './ContactsTab'
import type { CompanyContactView } from './ContactsTab'

// ─── Opportunity config ───────────────────────────────────────────────────────

const OPP_CFG = {
  CONFIRMED: {
    color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981',
    label: 'CONFIRMED',
    description: 'There is direct evidence of a potential opening. Your message references this opportunity without assuming it is guaranteed.',
  },
  PROACTIVE: {
    color: '#3730A3', bg: '#EEF2FF', border: '#C7D2FE', dot: '#4F46E5',
    label: 'PROACTIVE',
    description: 'No confirmed opening found. This is relationship-oriented outreach focused on genuine interest in the engineering work.',
  },
  UNCLASSIFIED: {
    color: '#713F12', bg: '#FEFCE8', border: '#FDE68A', dot: '#F59E0B',
    label: 'UNCLASSIFIED',
    description: '',
  },
}

// ─── Reusable gate card ───────────────────────────────────────────────────────

function GateCard({ icon, heading, body, cta, onCta, ctaVariant = 'default' }: {
  icon: string | string[]
  heading: string
  body: string
  cta?: string
  onCta?: () => void
  ctaVariant?: 'default' | 'amber'
}) {
  const ctaBg = ctaVariant === 'amber' ? '#78350F' : 'var(--color-primary)'
  const ctaBgHover = ctaVariant === 'amber' ? '#92400E' : '#1E2D4A'
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-8">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}
      >
        <Icon d={icon} size={20} strokeWidth={1.7} />
      </div>
      <div className="text-center max-w-100">
        <p className="text-[17px] font-bold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {heading}
        </p>
        <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          {body}
        </p>
      </div>
      {cta && onCta && (
        <button
          onClick={onCta}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
          style={{ background: ctaBg, color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = ctaBgHover)}
          onMouseLeave={e => (e.currentTarget.style.background = ctaBg)}
        >
          {cta} <Icon d={icons.arrowRight} size={14} />
        </button>
      )}
    </div>
  )
}

// ─── Campaign Setup ───────────────────────────────────────────────────────────

function CampaignSetup({ entry, contact, onUpdate, onNavigate }: {
  entry: CompanyEntry
  contact: CompanyContactView
  onUpdate: (patch: Partial<CompanyEntry>) => void
  onNavigate: (tab: string) => void
}) {
  const defaultName = `Outreach to ${contact.name.split(' ')[0]} at ${entry.name}`
  const [campaignName, setCampaignName] = useState(entry.campaignName ?? defaultName)
  const oppCfg = OPP_CFG[entry.oppStatus]

  function handleCreate() {
    const finalName = campaignName.trim() || defaultName
    onUpdate({ campaignStage: 'READY', campaignName: finalName, lastActivity: 'Just now' })
  }

  return (
    <div className="p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-[16px] shrink-0"
          style={{ background: contact.avatarBg, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          {contact.avatarInitials}
        </div>
        <div>
          <p
            className="text-[10.5px] font-bold uppercase tracking-wide mb-0.5"
            style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}
          >
            Create campaign
          </p>
          <p className="text-[18px] font-bold leading-snug" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {contact.name}
          </p>
          <p className="text-[13px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            {contact.role} · {entry.name}
          </p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-5">
        {/* Left: name + message */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Campaign name */}
          <div className="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <label
              htmlFor="campaign-name"
              className="text-[10.5px] font-bold uppercase tracking-wide mb-3 block"
              style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}
            >
              Campaign name
            </label>
            <input
              id="campaign-name"
              type="text"
              value={campaignName}
              onChange={e => setCampaignName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg text-[14px] outline-none transition-all"
              style={{
                background: 'var(--color-muted)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-primary)',
                fontFamily: 'Inter, sans-serif',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              placeholder={defaultName}
              aria-label="Campaign name"
            />
            <p className="text-[11.5px] mt-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
              Give this campaign a memorable name. The default is fine to keep.
            </p>
          </div>

          {/* Approved message preview */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}
          >
            <div
              className="px-5 py-3.5 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-muted)' }}
            >
              <p className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
                Approved message
              </p>
              <button
                onClick={() => onNavigate('Outreach')}
                className="text-[11.5px] font-medium transition-all"
                style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#4338CA')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-accent)')}
              >
                Edit outreach
              </button>
            </div>
            <div className="p-5">
              <p className="text-[13.5px] font-semibold mb-3" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
                {entry.outreachSubject}
              </p>
              <p
                className="text-[13px] leading-relaxed whitespace-pre-wrap"
                style={{
                  color: 'var(--color-muted-fg)',
                  fontFamily: 'Inter, sans-serif',
                  display: '-webkit-box',
                  WebkitLineClamp: 6,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {entry.outreachMessage}
              </p>
            </div>
          </div>
        </div>

        {/* Right: recipient + opportunity */}
        <div className="xl:w-70 shrink-0 flex flex-col gap-4">
          {/* Recipient */}
          <div className="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <p
              className="text-[10.5px] font-bold uppercase tracking-wide mb-3"
              style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}
            >
              Recipient
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[12px] shrink-0"
                style={{ background: contact.avatarBg, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                {contact.avatarInitials}
              </div>
              <div>
                <p className="text-[14px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {contact.name}
                </p>
                <p className="text-[12px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                  {contact.role}
                </p>
                <p className="text-[12px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                  {entry.name}
                </p>
              </div>
            </div>
          </div>

          {/* Opportunity */}
          <div className="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <p
              className="text-[10.5px] font-bold uppercase tracking-wide mb-3"
              style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}
            >
              Opportunity
            </p>
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-2.5"
              style={{ background: oppCfg.bg, color: oppCfg.color, border: `1px solid ${oppCfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: oppCfg.dot }} />
              {oppCfg.label}
            </span>
            <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
              {oppCfg.description}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-5 py-3 rounded-lg text-[14px] font-semibold transition-all"
          style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
        >
          Create campaign <Icon d={icons.arrowRight} size={15} />
        </button>
        <button
          onClick={() => onNavigate('Outreach')}
          className="flex items-center gap-1.5 px-4 py-3 rounded-lg text-[13.5px] font-medium transition-all"
          style={{ color: 'var(--color-muted-fg)', background: 'var(--color-muted)', border: '1px solid var(--color-border)', fontFamily: 'Inter, sans-serif' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.borderColor = 'var(--color-accent)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted-fg)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
        >
          <Icon d={icons.arrowLeft} size={14} /> Back to outreach
        </button>
      </div>
    </div>
  )
}

// ─── Sending animation ────────────────────────────────────────────────────────

function SendingView({ contactName }: { contactName: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20 px-8" role="status" aria-live="polite">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
        <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </div>
      <div className="text-center max-w-85">
        <p className="text-[17px] font-bold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Sending outreach to {contactName}…
        </p>
        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          Prototype mode — no email will actually be sent.
        </p>
      </div>
    </div>
  )
}

// ─── Campaign Sent state ──────────────────────────────────────────────────────

function CampaignSent({ entry, contact, onNavigate }: {
  entry: CompanyEntry
  contact: CompanyContactView
  onNavigate: (tab: string) => void
}) {
  return (
    <div className="p-5 sm:p-6 flex flex-col gap-5">
      <div
        className="rounded-xl p-5 flex items-start gap-4"
        style={{ background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)', border: '1px solid #A7F3D0' }}
        role="status"
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <span style={{ color: 'white' }}><Icon d={icons.campaigns} size={18} /></span>
        </div>
        <div>
          <p className="text-[16px] font-bold text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Outreach sent
          </p>
          <p className="text-[13px] mt-0.5" style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter, sans-serif' }}>
            Your outreach to {contact.name} at {entry.name} was sent
            {entry.sentAt ? ` at ${entry.sentAt}` : ''}.
            Prototype mode — no real email was sent.
          </p>
        </div>
      </div>

      <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            Campaign
          </p>
          <p className="text-[14px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {entry.campaignName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[12px] shrink-0" style={{ background: contact.avatarBg, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {contact.avatarInitials}
          </div>
          <div>
            <p className="text-[13.5px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {contact.name}
            </p>
            <p className="text-[12px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
              {contact.role} · {entry.name}
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('Conversation')}
          className="flex items-center gap-2 px-5 py-3 rounded-lg text-[14px] font-semibold transition-all self-start"
          style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
        >
          View conversation <Icon d={icons.arrowRight} size={15} />
        </button>
      </div>
    </div>
  )
}

// ─── Pre-Send Review (campaign READY) ─────────────────────────────────────────

function PreSendReview({ entry, contact, onUpdate, onNavigate }: {
  entry: CompanyEntry
  contact: CompanyContactView
  onUpdate: (patch: Partial<CompanyEntry>) => void
  onNavigate: (tab: string) => void
}) {
  const [showEditWarning, setShowEditWarning] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [sendPhase, setSendPhase] = useState<'review' | 'confirming' | 'sending'>('review')
  const defaultName = `Outreach to ${contact.name.split(' ')[0]} at ${entry.name}`
  const [campaignName, setCampaignName] = useState(entry.campaignName ?? defaultName)
  const oppCfg = OPP_CFG[entry.oppStatus]

  function handleSaveName() {
    onUpdate({ campaignName: campaignName.trim() || defaultName })
    setEditingName(false)
  }

  function handleEditOutreach() {
    onUpdate({ outreachStage: 'DRAFT', campaignStage: undefined })
    onNavigate('Outreach')
  }

  function handleConfirmSend() {
    setSendPhase('sending')
    setTimeout(() => {
      const now = new Date()
      const sentAt =
        now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) +
        ' · ' +
        now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      const outreachMsg: ConvMessage = {
        id: 'msg_' + Date.now(),
        direction: 'outbound',
        kind: 'outreach',
        subject: entry.outreachSubject ?? '',
        body: entry.outreachMessage ?? '',
        timestamp: sentAt,
      }
      onUpdate({
        campaignStage: 'SENT',
        outreachStage: 'SENT',
        convStage: 'NONE',
        sentAt,
        lastActivity: 'Just now',
        followUpStage: 'NONE',
        followUpDueAt: calcFollowUpDueAt(now),
        followUpCount: 0,
        conversationMessages: [outreachMsg],
      })
      onNavigate('Conversation')
    }, 2200)
  }

  if (sendPhase === 'sending') {
    return <SendingView contactName={contact.name} />
  }

  return (
    <div className="p-5 sm:p-6 flex flex-col gap-5">
      {/* Confirmation banner — subdued, not celebratory */}
      <div
        className="rounded-xl p-4 flex items-start gap-3"
        style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}
        role="status"
        aria-live="polite"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: '#E0F2FE', color: '#0369A1' }}
        >
          <Icon d={icons.campaigns} size={16} />
        </div>
        <div>
          <p className="text-[14px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Campaign created
          </p>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            Your approved outreach is ready for final review.{' '}
            <strong style={{ color: 'var(--color-primary)' }}>Nothing has been sent.</strong>
          </p>
        </div>
      </div>

      {/* Review heading */}
      <div>
        <h2 className="text-[22px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Ready to send
        </h2>
        <p className="text-[13.5px] mt-1" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          Review everything below before sending. Nothing has been sent yet.
        </p>
      </div>

      {/* Two-column on xl */}
      <div className="flex flex-col xl:flex-row gap-5">

        {/* Left: context */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Campaign name */}
          <div className="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <div className="flex items-center justify-between mb-1">
              <p
                className="text-[10.5px] font-bold uppercase tracking-wide"
                style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}
              >
                Campaign
              </p>
              {!editingName && (
                <button
                  onClick={() => setEditingName(true)}
                  className="text-[11.5px] font-medium transition-all"
                  style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#4338CA')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-accent)')}
                >
                  Edit name
                </button>
              )}
            </div>
            {editingName ? (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={campaignName}
                  onChange={e => setCampaignName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg text-[13.5px] outline-none transition-all"
                  style={{
                    background: 'var(--color-muted)',
                    border: '1px solid var(--color-accent)',
                    color: 'var(--color-primary)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false) }}
                  aria-label="Campaign name"
                />
                <button
                  onClick={handleSaveName}
                  className="px-3 py-2 rounded-lg text-[12.5px] font-semibold transition-all"
                  style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all"
                  style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p className="text-[15px] font-semibold mt-1" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {entry.campaignName ?? defaultName}
              </p>
            )}
          </div>

          {/* Recipient */}
          <div className="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <p
              className="text-[10.5px] font-bold uppercase tracking-wide mb-3"
              style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}
            >
              Recipient
            </p>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[13px] shrink-0"
                style={{ background: contact.avatarBg, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                {contact.avatarInitials}
              </div>
              <div>
                <p className="text-[15px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {contact.name}
                </p>
                <p className="text-[12.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                  {contact.role} · {entry.name}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('Contacts')}
              className="text-[12px] font-medium transition-all flex items-center gap-1"
              style={{ color: 'var(--color-accent)', fontFamily: 'Inter, sans-serif' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#4338CA')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-accent)')}
            >
              View contact <Icon d={icons.arrowRight} size={12} />
            </button>
          </div>

          {/* Opportunity */}
          <div className="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <p
              className="text-[10.5px] font-bold uppercase tracking-wide mb-3"
              style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}
            >
              Opportunity
            </p>
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-3"
              style={{ background: oppCfg.bg, color: oppCfg.color, border: `1px solid ${oppCfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: oppCfg.dot }} />
              {oppCfg.label}
            </span>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
              {oppCfg.description}
            </p>
          </div>

          {/* Why this person */}
          <div className="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <p
              className="text-[10.5px] font-bold uppercase tracking-wide mb-3"
              style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}
            >
              Why this person
            </p>
            <p className="text-[13px] leading-relaxed mb-3" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
              {contact.relevanceSummary}
            </p>
            {contact.evidence.slice(0, 3).map((ev, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 py-2"
                style={{ borderTop: i === 0 ? '1px solid var(--color-border)' : undefined }}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: 'var(--color-accent)' }} />
                <div className="min-w-0">
                  <p className="text-[12.5px] leading-snug" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
                    {ev.text}
                  </p>
                  {ev.source && (
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-accent)', fontFamily: 'Inter, sans-serif' }}>
                      {ev.source}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: message + actions */}
        <div className="xl:w-90 shrink-0 flex flex-col gap-4">

          {/* Message preview */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}
            aria-label="Message to be sent"
          >
            <div
              className="px-5 py-3.5 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-muted)' }}
            >
              <p className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
                Message
              </p>
              <span className="text-[11.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                Not yet sent.
              </span>
            </div>
            {/* To */}
            <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <span className="text-[11.5px] font-semibold w-14 shrink-0" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                To:
              </span>
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center font-bold text-[9px] shrink-0"
                  style={{ background: contact.avatarBg, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  {contact.avatarInitials}
                </div>
                <span className="text-[13px]" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
                  {contact.name}
                </span>
              </div>
            </div>
            {/* Subject */}
            <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <span className="text-[11.5px] font-semibold" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Subject:{' '}
              </span>
              <span className="text-[13px] font-medium" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
                {entry.outreachSubject}
              </span>
            </div>
            {/* Body */}
            <div className="p-5">
              <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
                {entry.outreachMessage}
              </p>
            </div>
          </div>

          {/* Send action */}
          <div className="rounded-xl p-5 flex flex-col gap-3" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            {sendPhase === 'confirming' ? (
              <>
                <div className="rounded-lg p-3.5 flex items-start gap-2.5" style={{ background: '#EDE9FE', border: '1px solid #DDD6FE' }}>
                  <span className="shrink-0 mt-0.5" style={{ color: '#7C3AED' }}>
                    <Icon d={icons.alertCircle} size={15} />
                  </span>
                  <p className="text-[12.5px] leading-relaxed" style={{ color: '#4C1D95', fontFamily: 'Inter, sans-serif' }}>
                    You're about to send outreach to <strong>{contact.name}</strong> at <strong>{entry.name}</strong>.
                    Prototype mode — no real email will be sent.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleConfirmSend}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
                    style={{ background: '#7C3AED', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#6D28D9')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#7C3AED')}
                  >
                    Confirm — send outreach <Icon d={icons.campaigns} size={14} />
                  </button>
                  <button
                    onClick={() => setSendPhase('review')}
                    className="px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all"
                    style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted-fg)')}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setSendPhase('confirming')}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-[14px] font-semibold transition-all"
                  style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
                >
                  <Icon d={icons.campaigns} size={16} />
                  Send outreach
                </button>
                <p className="text-[12px] text-center leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                  Prototype mode · No real email will be sent.
                </p>
              </>
            )}
          </div>

          {/* Edit outreach */}
          <div className="rounded-xl p-4" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
            {showEditWarning ? (
              <div>
                <div className="flex items-start gap-2.5 mb-3">
                  <span className="shrink-0 mt-0.5" style={{ color: '#92400E' }}>
                    <Icon d={icons.alertCircle} size={15} />
                  </span>
                  <p className="text-[12.5px] leading-relaxed" style={{ color: '#78350F', fontFamily: 'Inter, sans-serif' }}>
                    Editing will remove this campaign. After re-approving the updated draft, you'll need to create a new campaign.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleEditOutreach}
                    className="px-3.5 py-2 rounded-lg text-[12.5px] font-semibold transition-all"
                    style={{ background: '#FEF3C7', color: '#78350F', border: '1px solid #FDE68A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#FDE68A')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#FEF3C7')}
                  >
                    Confirm — edit outreach
                  </button>
                  <button
                    onClick={() => setShowEditWarning(false)}
                    className="px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all"
                    style={{ color: '#92400E', fontFamily: 'Inter, sans-serif' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-[12.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                  Need to change the message?
                </p>
                <button
                  onClick={() => setShowEditWarning(true)}
                  className="text-[13px] font-medium transition-all flex items-center gap-1"
                  style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#4338CA')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-accent)')}
                >
                  Edit outreach <Icon d={icons.arrowRight} size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Back */}
          <button
            onClick={() => onNavigate('Overview')}
            className="flex items-center gap-1.5 text-[13px] font-medium transition-all self-start"
            style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted-fg)')}
          >
            <Icon d={icons.arrowLeft} size={14} /> Back to company
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Campaign domain link banner ──────────────────────────────────────────────

function CampaignDomainBanner({ entry, onViewCampaign }: {
  entry: CompanyEntry
  onViewCampaign: () => void
}) {
  const ws = loadWorkspace()
  const campaign = ws.campaigns.find(c => c.id === entry.campaignId)
  const name = campaign?.name ?? entry.campaignName ?? 'Campaign'
  return (
    <div
      className="mx-5 sm:mx-6 mt-5 rounded-xl p-4 flex items-center justify-between gap-3"
      style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#DBEAFE', color: '#1D4ED8' }}>
          <Icon d={icons.campaigns} size={15} />
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-bold" style={{ color: '#1E40AF', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Part of campaign
          </p>
          <p className="text-[13px] font-semibold truncate" style={{ color: '#1D4ED8', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {name}
          </p>
        </div>
      </div>
      <button
        onClick={onViewCampaign}
        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all"
        style={{ background: '#1D4ED8', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#1E40AF')}
        onMouseLeave={e => (e.currentTarget.style.background = '#1D4ED8')}
      >
        View campaign <Icon d={icons.arrowRight} size={12} />
      </button>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function CampaignTab({ entry, onUpdate, onNavigate }: {
  entry: CompanyEntry
  onUpdate: (patch: Partial<CompanyEntry>) => void
  onNavigate: (tab: string) => void
}) {
  const navigate = useNavigate()

  function viewCampaign() {
    if (entry.campaignId) navigate(`/campaigns/${entry.campaignId}`)
  }

  // Gate: research not complete
  if (entry.researchStage !== 'COMPLETE') {
    return (
      <GateCard
        icon={icons.search}
        heading="Complete research first"
        body={
          entry.researchStage === 'IN_PROGRESS'
            ? 'Research is currently running. Complete research before creating a campaign.'
            : 'Complete company research before creating a campaign. Research provides the foundation for credible outreach.'
        }
        cta={entry.researchStage !== 'IN_PROGRESS' ? 'Continue research' : undefined}
        onCta={() => onNavigate('Research')}
      />
    )
  }

  // Gate: opportunity not classified
  if (entry.oppStatus === 'UNCLASSIFIED') {
    return (
      <GateCard
        icon={icons.opportunities}
        heading="Establish an opportunity state"
        body="Establish an opportunity state before creating a campaign. Review the research findings and classify this as CONFIRMED or PROACTIVE."
        cta="Review opportunity"
        onCta={() => onNavigate('Opportunities')}
        ctaVariant="amber"
      />
    )
  }

  // Gate: no contact selected
  if (entry.contactStage !== 'SELECTED' || !entry.selectedContactId) {
    return (
      <GateCard
        icon={icons.contacts}
        heading="Select a contact first"
        body="Select a contact before creating a campaign. A campaign is tied to a specific person — their role and relevance matter."
        cta={entry.contactStage === 'NOT_DISCOVERED' ? 'Find contacts' : 'Review contacts'}
        onCta={() => onNavigate('Contacts')}
      />
    )
  }

  // SENT campaign — show sent confirmation
  if (entry.campaignStage === 'SENT') {
    const contact = getContactData(entry.id, entry.selectedContactId)
    if (!contact) {
      return (
        <div>
          {entry.campaignId && <CampaignDomainBanner entry={entry} onViewCampaign={viewCampaign} />}
          <GateCard
            icon={icons.campaigns}
            heading="Outreach sent"
            body="Your campaign outreach was sent. View the conversation to track the reply."
            cta="View conversation"
            onCta={() => onNavigate('Conversation')}
          />
        </div>
      )
    }
    return (
      <div>
        {entry.campaignId && <CampaignDomainBanner entry={entry} onViewCampaign={viewCampaign} />}
        <CampaignSent
          entry={entry}
          contact={contact}
          onNavigate={onNavigate}
        />
      </div>
    )
  }

  // Gate: outreach sent without going through campaign (legacy / Kuda-style)
  if (entry.outreachStage === 'SENT') {
    return (
      <div>
        {entry.campaignId && <CampaignDomainBanner entry={entry} onViewCampaign={viewCampaign} />}
        <GateCard
          icon={icons.campaigns}
          heading="Outreach sent"
          body="This outreach was sent directly. View the conversation to see its current status."
          cta="View conversation"
          onCta={() => onNavigate('Conversation')}
        />
      </div>
    )
  }

  if (entry.outreachStage !== 'READY') {
    return (
      <GateCard
        icon={icons.mail}
        heading="Approve your outreach first"
        body="Approve the outreach draft before creating a campaign. The campaign is based on the approved message — there's nothing to campaign with until you approve it."
        cta={entry.outreachStage === 'DRAFT' ? 'Review draft' : 'Prepare outreach'}
        onCta={() => onNavigate('Outreach')}
      />
    )
  }

  const contact = getContactData(entry.id, entry.selectedContactId)

  if (!contact) {
    return (
      <GateCard
        icon={icons.contacts}
        heading="Contact not found"
        body="The selected contact could not be found. Return to Contacts to reselect."
        cta="Go to contacts"
        onCta={() => onNavigate('Contacts')}
      />
    )
  }

  // Show SETUP form when no campaign yet or in SETUP state
  if (!entry.campaignStage || entry.campaignStage === 'SETUP') {
    return (
      <CampaignSetup
        entry={entry}
        contact={contact}
        onUpdate={onUpdate}
        onNavigate={onNavigate}
      />
    )
  }

  // READY — pre-send review
  return (
    <PreSendReview
      entry={entry}
      contact={contact}
      onUpdate={onUpdate}
      onNavigate={onNavigate}
    />
  )
}

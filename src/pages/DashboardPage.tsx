import { useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { useWorkspace } from '../context/WorkspaceContext'
import { Icon, icons } from '../lib/icons'
import {
  type CompanyEntry,
  loadWorkspace,
  deriveStateLabel,
  deriveRelationshipStatus,
  CONV_OUTCOME_LABELS,
} from '../lib/workspaceStore'
import { getContactData } from './companies/ContactsTab'

// ─── Needs your attention ─────────────────────────────────────────────────────

type AttentionItem = {
  id: string
  icon: string | string[]
  iconBg: string
  iconColor: string
  text: string
  detail: string
  cta: string
  route: string
  priority: number
}

function NeedsAttentionSection() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const ws = loadWorkspace()

  const items: AttentionItem[] = []

  // Profile incomplete
  const hasHeadline = !!ws.careerProfile?.professionalHeadline?.trim()
  const hasTargetRole = !!user?.targetRole?.trim()
  const profileComplete = hasHeadline || (hasTargetRole && !!user?.skills?.length)
  if (!profileComplete) {
    items.push({
      id: 'profile',
      icon: icons.user, iconBg: '#EEF2FF', iconColor: '#4F46E5',
      text: 'Complete your career profile',
      detail: 'Your profile shapes how Outreacher researches and frames your outreach.',
      cta: 'Go to profile', route: '/profile', priority: 9,
    })
  }

  // No sender account
  const hasSender = ws.senderAccounts.length > 0
  const needsSender = !hasSender && ws.companies.some(c => c.contactStage === 'SELECTED' || c.outreachStage !== 'NOT_STARTED')
  if (needsSender) {
    items.push({
      id: 'sender',
      icon: icons.atSign, iconBg: '#FFFBEB', iconColor: '#D97706',
      text: 'Set up a sender account',
      detail: 'You have outreach ready but no sender account configured.',
      cta: 'Configure sender', route: '/sender-accounts', priority: 8,
    })
  }

  // Draft outreaches waiting review
  const drafts = ws.outreaches.filter(o => o.status === 'DRAFT')
  if (drafts.length > 0) {
    items.push({
      id: 'drafts',
      icon: icons.outreach, iconBg: '#F5F3FF', iconColor: '#7C3AED',
      text: `${drafts.length} outreach draft${drafts.length > 1 ? 's' : ''} waiting for review`,
      detail: drafts.length === 1 ? 'Review and approve before sending.' : `${drafts.length} drafts need your attention before anything is sent.`,
      cta: 'Review drafts', route: '/outreaches', priority: 7,
    })
  }

  // Companies not yet researched
  const unresearched = ws.companies.filter(c => c.researchStage === 'NOT_STARTED' && c.companyStatus !== 'ARCHIVED')
  if (unresearched.length > 0) {
    const first = unresearched[0]
    items.push({
      id: `research-${first.id}`,
      icon: icons.search, iconBg: '#EFF6FF', iconColor: '#1D4ED8',
      text: unresearched.length === 1 ? `Research ${first.name}` : `${unresearched.length} companies not yet researched`,
      detail: unresearched.length === 1
        ? 'Research helps determine whether there is a credible reason to reach out.'
        : `${first.name}${unresearched.length > 1 ? ` and ${unresearched.length - 1} other${unresearched.length > 2 ? 's' : ''}` : ''} need research before outreach can proceed.`,
      cta: 'Start research', route: `/companies/${first.id}`, priority: 5,
    })
  }

  // Opportunities awaiting classification
  const unclassified = ws.companies.filter(c => c.researchStage === 'COMPLETE' && c.oppStatus === 'UNCLASSIFIED' && c.companyStatus !== 'ARCHIVED')
  if (unclassified.length > 0) {
    const first = unclassified[0]
    items.push({
      id: `opp-${first.id}`,
      icon: icons.opportunities, iconBg: '#FEFCE8', iconColor: '#B45309',
      text: unclassified.length === 1 ? `Review opportunity at ${first.name}` : `${unclassified.length} opportunities await classification`,
      detail: 'Research is complete — classify as CONFIRMED or PROACTIVE before proceeding.',
      cta: 'Review opportunity', route: `/companies/${first.id}`, priority: 6,
    })
  }

  // Contacts selected but outreach not started
  const readyForOutreach = ws.companies.filter(c => c.contactStage === 'SELECTED' && c.outreachStage === 'NOT_STARTED' && c.companyStatus !== 'ARCHIVED')
  if (readyForOutreach.length > 0) {
    const first = readyForOutreach[0]
    items.push({
      id: `outreach-${first.id}`,
      icon: icons.outreach, iconBg: '#ECFDF5', iconColor: '#059669',
      text: `Prepare outreach for ${first.name}`,
      detail: 'A contact is selected — the next step is to prepare your outreach message.',
      cta: 'Prepare outreach', route: `/companies/${first.id}`, priority: 6,
    })
  }

  if (items.length === 0) return null

  const sorted = items.sort((a, b) => b.priority - a.priority).slice(0, 5)

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13.5px] font-bold tracking-wide uppercase"
          style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em' }}>
          Needs your attention
        </h2>
        <span className="text-[12px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--color-accent)', color: 'white' }}>
          {sorted.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {sorted.map(item => (
          <div
            key={item.id}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all cursor-pointer"
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
            onClick={() => navigate(item.route)}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: item.iconBg }}
            >
              <span style={{ color: item.iconColor, display: 'flex' }}>
                <Icon d={item.icon} size={15} strokeWidth={1.8} />
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-semibold leading-snug" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {item.text}
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                {item.detail}
              </p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); navigate(item.route) }}
              className="flex items-center gap-1 text-[12.5px] font-semibold flex-shrink-0 transition-colors"
              style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              {item.cta} <Icon d={icons.arrowRight} size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Contextual banners (legacy — kept as thin fallback) ─────────────────────

function ContextBanners() {
  // Replaced by NeedsAttentionSection — kept for compatibility
  return null
  const navigate = useNavigate()
  const { user } = useAuth()
  const ws = loadWorkspace()

  const profileIncomplete = !user?.summary?.trim() || !user?.targetRole?.trim() || !user?.skills?.length
  const draftOutreaches = ws.outreaches.filter(o => o.status === 'DRAFT').length
  const senderAccountsMissing = ws.senderAccounts.length === 0 && ws.companies.some(c => c.contactStage === 'SELECTED')

  if (!profileIncomplete && draftOutreaches === 0 && !senderAccountsMissing) return null

  return (
    <div className="flex flex-col gap-2.5 mb-6">
      {profileIncomplete && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl"
          style={{ background: '#EEF2FF', border: '1px solid #C7D2FE' }}>
          <div className="flex items-center gap-3">
            <span style={{ color: '#4F46E5' }}><Icon d={icons.user} size={16} /></span>
            <p className="text-[13px]" style={{ color: '#3730A3', fontFamily: 'Inter, sans-serif' }}>
              Your career profile is incomplete. A complete profile improves outreach personalisation.
            </p>
          </div>
          <button onClick={() => navigate('/profile')}
            className="text-[12.5px] font-semibold flex-shrink-0 transition-colors"
            style={{ color: '#4F46E5', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#3730A3')}
            onMouseLeave={e => (e.currentTarget.style.color = '#4F46E5')}>
            Complete profile →
          </button>
        </div>
      )}
      {draftOutreaches > 0 && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl"
          style={{ background: '#FDF4FF', border: '1px solid #E9D5FF' }}>
          <div className="flex items-center gap-3">
            <span style={{ color: '#7C3AED' }}><Icon d={icons.outreach ?? icons.campaigns} size={16} /></span>
            <p className="text-[13px]" style={{ color: '#6D28D9', fontFamily: 'Inter, sans-serif' }}>
              {draftOutreaches} outreach draft{draftOutreaches > 1 ? 's' : ''} waiting for your review.
            </p>
          </div>
          <button onClick={() => navigate('/outreaches')}
            className="text-[12.5px] font-semibold flex-shrink-0 transition-colors"
            style={{ color: '#7C3AED', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#6D28D9')}
            onMouseLeave={e => (e.currentTarget.style.color = '#7C3AED')}>
            Review outreaches →
          </button>
        </div>
      )}
      {senderAccountsMissing && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl"
          style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
          <div className="flex items-center gap-3">
            <span style={{ color: '#D97706' }}><Icon d={icons.atSign} size={16} /></span>
            <p className="text-[13px]" style={{ color: '#92400E', fontFamily: 'Inter, sans-serif' }}>
              No sender account configured. Add one to send outreach.
            </p>
          </div>
          <button onClick={() => navigate('/sender-accounts')}
            className="text-[12.5px] font-semibold flex-shrink-0 transition-colors"
            style={{ color: '#D97706', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#92400E')}
            onMouseLeave={e => (e.currentTarget.style.color = '#D97706')}>
            Set up sender →
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Derived prioritization ────────────────────────────────────────────────────

function getUrgency(entry: CompanyEntry): number {
  // Completed journeys with outcome drop out of the main queue
  if (entry.convOutcome) {
    const rel = deriveRelationshipStatus(entry)
    if (rel === 'OPPORTUNITY') return 9  // still needs attention
    if (rel === 'NURTURE')     return 2  // goes to "Keep in touch" section
    if (rel === 'CLOSED')      return 1  // terminal
  }
  if (entry.convStage === 'REPLIED') return 10
  if (entry.convStage === 'ACTIVE') return 9
  if (entry.followUpStage === 'DUE') return 8
  if (entry.followUpStage === 'DRAFT') return 8
  if (entry.outreachStage === 'DRAFT') return 7
  if (entry.campaignStage === 'READY') return 7
  if (entry.campaignStage === 'SETUP') return 7
  if (entry.outreachStage === 'SENT') return 6
  if (entry.contactStage === 'DISCOVERED') return 6
  if (entry.outreachStage === 'READY') return 6
  if (entry.contactStage === 'SELECTED') return 5
  if (entry.researchStage === 'COMPLETE' && entry.oppStatus !== 'UNCLASSIFIED') return 5
  if (entry.researchStage === 'COMPLETE') return 4
  if (entry.contactStage === 'DISCOVERING') return 3
  if (entry.researchStage === 'IN_PROGRESS') return 3
  return 1
}

function getReasonText(entry: CompanyEntry, contactName?: string): string {
  const name = contactName ?? 'your contact'
  if (entry.convOutcome) {
    const rel = deriveRelationshipStatus(entry)
    if (rel === 'OPPORTUNITY') return `Outcome recorded: ${CONV_OUTCOME_LABELS[entry.convOutcome]}. Continue the relationship.`
  }
  if (entry.convStage === 'REPLIED') return `${name} replied to your outreach.`
  if (entry.convStage === 'ACTIVE') return `Conversation with ${name} is active.`
  if (entry.followUpStage === 'DUE') {
    const num = (entry.followUpCount ?? 0) + 1
    return `Follow-up #${num} is due — review before sending.`
  }
  if (entry.followUpStage === 'DRAFT') {
    const num = (entry.followUpCount ?? 0) + 1
    return `Follow-up #${num} draft is ready to review.`
  }
  if (entry.campaignStage === 'READY') return 'Your outreach is ready to send.'
  if (entry.campaignStage === 'SETUP') return 'Complete your campaign setup to continue.'
  if (entry.outreachStage === 'DRAFT') return 'Your outreach draft is ready for review.'
  if (entry.outreachStage === 'READY') return 'Draft approved — create a campaign to send.'
  if (entry.contactStage === 'DISCOVERED') return 'Contacts have been identified — review and select one.'
  if (entry.contactStage === 'SELECTED') return 'A contact has been selected — prepare your outreach.'
  if (entry.researchStage === 'COMPLETE' && entry.oppStatus !== 'UNCLASSIFIED') return 'Research complete — find the right contact to approach.'
  if (entry.researchStage === 'COMPLETE') return 'Research complete — classify the opportunity.'
  return deriveStateLabel(entry)
}

function getHeroCtaLabel(entry: CompanyEntry): string {
  if (entry.convStage === 'STOPPED') return 'View conversation'
  if (entry.convStage === 'REPLIED') return 'View reply'
  if (entry.convStage === 'ACTIVE') return 'View conversation'
  if (entry.followUpStage === 'DUE') return 'Review follow-up'
  if (entry.followUpStage === 'DRAFT') return 'Review follow-up draft'
  if (entry.outreachStage === 'SENT') return 'View conversation'
  if (entry.outreachStage === 'DRAFT') return 'Review draft'
  if (entry.campaignStage === 'READY') return 'Send outreach'
  if (entry.campaignStage === 'SETUP') return 'Complete campaign setup'
  if (entry.outreachStage === 'READY') return 'Create campaign'
  if (entry.contactStage === 'DISCOVERED') return 'Review contacts'
  if (entry.contactStage === 'SELECTED') return 'Prepare outreach'
  if (entry.researchStage === 'COMPLETE' && entry.oppStatus !== 'UNCLASSIFIED') return 'Find contacts'
  if (entry.researchStage === 'COMPLETE') return 'Review opportunity'
  return 'Continue research'
}

function getQueueStatus(entry: CompanyEntry): 'reply' | 'review' | 'research' {
  if (entry.convStage === 'REPLIED' || entry.convStage === 'ACTIVE') return 'reply'
  if (entry.followUpStage === 'DUE' || entry.followUpStage === 'DRAFT') return 'review'
  if (entry.outreachStage === 'SENT') return 'reply'
  if (entry.campaignStage) return 'review'
  if (entry.contactStage === 'DISCOVERED') return 'review'
  return 'research'
}

const MONOGRAM_COLORS: Record<string, { bg: string; text: string }> = {
  kuda:        { bg: '#1B4DFF', text: '#fff' },
  stripe:      { bg: '#635BFF', text: '#fff' },
  paystack:    { bg: '#00C3F7', text: '#fff' },
  vercel:      { bg: '#0E1726', text: '#fff' },
  flutterwave: { bg: '#F5A623', text: '#fff' },
  linear:      { bg: '#5E6AD2', text: '#fff' },
  moniepoint:  { bg: '#0066FF', text: '#fff' },
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyDashboard({ onAddCompany }: { onAddCompany: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 px-8">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}
      >
        <Icon d={icons.companies} size={30} strokeWidth={1.5} />
      </div>
      <div className="text-center max-w-[420px]">
        <h2 className="text-[22px] font-bold mb-2.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          You haven't started pursuing a company yet
        </h2>
        <p className="text-[14.5px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          Add a company you genuinely want to work with. Outreacher will help you research it, find the right person, and reach out with evidence.
        </p>
      </div>
      <div className="flex flex-col items-center gap-3 w-full max-w-[360px]">
        <button
          onClick={onAddCompany}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-[14px] font-semibold transition-all"
          style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
        >
          <Icon d={icons.plus} size={16} /> Add your first company
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-[600px] mt-2">
        {[
          { icon: icons.search, title: 'Research', desc: 'Gather company signals and evidence before deciding to pursue.' },
          { icon: icons.contacts, title: 'Identify contacts', desc: 'Find the right person — not just any person.' },
          { icon: icons.campaigns, title: 'Reach out', desc: 'Send evidence-backed outreach grounded in research.' },
        ].map((step, i) => (
          <div key={i} className="rounded-xl p-4" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}>
              <Icon d={step.icon} size={16} />
            </div>
            <p className="text-[13px] font-semibold mb-1" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {step.title}
            </p>
            <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Queue row ────────────────────────────────────────────────────────────────

const queueStatusConfig = {
  review: { label: 'Review needed', dot: '#F59E0B', bg: '#FFFBEB', text: '#92400E' },
  reply:  { label: 'Reply received', dot: '#10B981', bg: '#ECFDF5', text: '#065F46' },
  research: { label: 'Research ready', dot: '#4F46E5', bg: '#EEF2FF', text: '#3730A3' },
} as const

function QueueRow({ entry, onClick }: { entry: CompanyEntry; onClick: () => void }) {
  const status = getQueueStatus(entry)
  const cfg = queueStatusConfig[status]
  const ctaLabel = getHeroCtaLabel(entry)
  const contact = entry.selectedContactId ? getContactData(entry.id, entry.selectedContactId) : null
  const reasonText = getReasonText(entry, contact?.name)

  return (
    <div
      className="flex items-start gap-3 px-5 py-4 cursor-pointer transition-all"
      style={{ borderBottom: '1px solid var(--color-border)' }}
      onClick={onClick}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[14px] flex-shrink-0 mt-0.5"
        style={{ background: MONOGRAM_COLORS[entry.id]?.bg ?? 'var(--color-muted)', color: MONOGRAM_COLORS[entry.id]?.text ?? 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      >
        {entry.name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="font-semibold text-[14px]" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {entry.name}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1.5"
            style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.dot}22` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
            {cfg.label}
          </span>
        </div>
        {contact && (
          <p className="text-[12px] font-medium mb-0.5" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {contact.name}
          </p>
        )}
        <p className="text-[12.5px] leading-snug" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{reasonText}</p>
        <button
          onClick={e => { e.stopPropagation(); onClick() }}
          className="mt-2 text-[12px] font-semibold flex items-center gap-1 transition-colors"
          style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          {ctaLabel} <Icon d={icons.arrowRight} size={11} />
        </button>
      </div>
      <span className="text-[11.5px] flex-shrink-0 mt-1" style={{ color: 'var(--color-muted-fg)' }}>{entry.lastActivity}</span>
    </div>
  )
}

// ─── Keep in touch section ────────────────────────────────────────────────────

function NurtureRow({ entry, onClick }: { entry: CompanyEntry; onClick: () => void }) {
  const outcomeLabel = entry.convOutcome ? CONV_OUTCOME_LABELS[entry.convOutcome] : null
  const reasonText = entry.convOutcome === 'FOLLOW_UP_LATER'
    ? 'Reconnect when a relevant opportunity arises.'
    : entry.convOutcome === 'NOT_HIRING'
    ? 'Watch for future hiring activity.'
    : 'Keep this relationship warm.'

  return (
    <div
      className="flex items-start gap-3 px-5 py-4 cursor-pointer transition-all"
      style={{ borderBottom: '1px solid var(--color-border)' }}
      onClick={onClick}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[14px] flex-shrink-0 mt-0.5"
        style={{ background: MONOGRAM_COLORS[entry.id]?.bg ?? 'var(--color-muted)', color: MONOGRAM_COLORS[entry.id]?.text ?? 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      >
        {entry.name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[14px] mb-0.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {entry.name}
        </p>
        {outcomeLabel && (
          <p className="text-[12px] font-medium mb-0.5" style={{ color: '#B45309', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {outcomeLabel}
          </p>
        )}
        <p className="text-[12.5px] leading-snug" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{reasonText}</p>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onClick() }}
        className="flex-shrink-0 mt-1 text-[12px] font-semibold flex items-center gap-1 transition-colors"
        style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted-fg)')}
      >
        View <Icon d={icons.arrowRight} size={11} />
      </button>
    </div>
  )
}

function KeepInTouchSection({ entries, onNavigate }: { entries: CompanyEntry[]; onNavigate: (id: string) => void }) {
  const nurtureEntries = entries.filter(e => deriveRelationshipStatus(e) === 'NURTURE')
  if (nurtureEntries.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13.5px] font-bold tracking-wide uppercase"
          style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em' }}>
          Keep in touch
        </h2>
        <span className="text-[12px] px-2 py-0.5 rounded-full font-semibold" style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>
          {nurtureEntries.length}
        </span>
      </div>
      <p className="text-[12.5px] mb-3" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
        {nurtureEntries.length === 1 ? '1 relationship' : `${nurtureEntries.length} relationships`} worth revisiting when the timing is right.
      </p>
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        {nurtureEntries.map(entry => (
          <NurtureRow key={entry.id} entry={entry} onClick={() => onNavigate(entry.id)} />
        ))}
      </div>
    </section>
  )
}

// ─── Hero "continue" card ─────────────────────────────────────────────────────

const oppConfig = {
  CONFIRMED:    { color: '#A5B4FC', bg: 'rgba(79,70,229,0.35)' },
  PROACTIVE:    { color: '#A5B4FC', bg: 'rgba(79,70,229,0.25)' },
  UNCLASSIFIED: { color: '#FDE68A', bg: 'rgba(245,158,11,0.25)' },
} as const

function HeroCard({ entry, onClick }: { entry: CompanyEntry; onClick: () => void }) {
  const ctaLabel = getHeroCtaLabel(entry)
  const stateLabel = deriveStateLabel(entry)
  const ocfg = oppConfig[entry.oppStatus]
  const monoColors = MONOGRAM_COLORS[entry.id] ?? { bg: 'rgba(255,255,255,0.12)', text: 'white' }

  return (
    <section>
      <h2 className="text-[13.5px] font-bold tracking-wide uppercase mb-3"
        style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em' }}>
        Continue where you left off
      </h2>
      <div
        className="rounded-xl p-6 relative overflow-hidden cursor-pointer"
        style={{ background: 'linear-gradient(135deg, #0E1726 0%, #1E2D4A 60%, #2D3B5E 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
        onClick={onClick}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
      >
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 70% 30%, #4F46E5, transparent)' }} />
        <div className="relative z-10">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[15px] flex-shrink-0"
              style={{ background: monoColors.bg, color: monoColors.text, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {entry.name[0]}
            </div>
            <div>
              <h3 className="text-[20px] font-bold text-white leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {entry.name}
              </h3>
              <span className="text-[11px] font-bold tracking-widest uppercase px-2 py-0.5 rounded"
                style={{ background: ocfg.bg, color: ocfg.color, letterSpacing: '0.1em' }}>
                {entry.oppStatus}
              </span>
            </div>
          </div>
          <p className="text-[14px] mt-2" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {stateLabel}
          </p>
          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={e => { e.stopPropagation(); onClick() }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-[13.5px] transition-all"
              style={{ background: 'var(--color-accent)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#4338CA')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
            >
              {ctaLabel} <Icon d={icons.arrowRight} size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Opportunity summary ──────────────────────────────────────────────────────

function OpportunitySummary({ entries }: { entries: CompanyEntry[] }) {
  const counts = {
    CONFIRMED:    entries.filter(e => e.oppStatus === 'CONFIRMED').length,
    PROACTIVE:    entries.filter(e => e.oppStatus === 'PROACTIVE').length,
    UNCLASSIFIED: entries.filter(e => e.oppStatus === 'UNCLASSIFIED').length,
  }
  const configs = [
    { type: 'CONFIRMED' as const, color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981' },
    { type: 'PROACTIVE' as const, color: '#3730A3', bg: '#EEF2FF', border: '#C7D2FE', dot: '#4F46E5' },
    { type: 'UNCLASSIFIED' as const, color: '#713F12', bg: '#FEFCE8', border: '#FDE68A', dot: '#F59E0B' },
  ]
  return (
    <section>
      <h2 className="text-[13.5px] font-bold tracking-wide uppercase mb-3"
        style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em' }}>
        Your opportunities
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {configs.map(cfg => (
          <div key={cfg.type}
            className="rounded-xl p-4 transition-all"
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = cfg.border)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
            <div className="flex items-start justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold tracking-wide px-2 py-0.5 rounded-full"
                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />{cfg.type}
              </span>
            </div>
            <p className="text-[28px] font-bold leading-none" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {counts[cfg.type]}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Activity item ────────────────────────────────────────────────────────────

function ActivityItem({ company, event, detail, time, isLast }: { company: string; event: string; detail: string; time: string; isLast?: boolean }) {
  return (
    <div className="flex gap-4 relative">
      {!isLast && <div className="absolute left-[11px] top-6 bottom-0 w-px" style={{ background: 'var(--color-border)' }} />}
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 relative z-10"
        style={{ background: 'var(--color-muted)', border: '2px solid var(--color-border)' }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
      </div>
      <div className="flex-1 pb-5">
        <p className="text-[13.5px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {event} <span style={{ color: 'var(--color-accent)' }}>{company}</span>
        </p>
        <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--color-muted-fg)' }}>{detail}</p>
        <p className="text-[11.5px] mt-1 flex items-center gap-1" style={{ color: 'var(--color-muted-fg)' }}>
          <Icon d={icons.clock} size={12} /> {time}
        </p>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { user } = useAuth()
  const { activeWorkspaceName } = useWorkspace()
  const navigate = useNavigate()
  const firstName = user?.firstName ?? user?.email?.split('@')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const { companies } = loadWorkspace()

  if (companies.length === 0) {
    return (
      <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        <div className="mb-8">
          <h1 className="text-[26px] font-bold tracking-tight" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {greeting}, {firstName}
          </h1>
          <p className="text-[15px] mt-1" style={{ color: 'var(--color-muted-fg)' }}>
            Let's get started — <span style={{ color: 'var(--color-primary)', opacity: 0.6 }}>{activeWorkspaceName}</span>
          </p>
        </div>
        <EmptyDashboard onAddCompany={() => navigate('/companies')} />
      </div>
    )
  }

  // Sort by urgency descending
  const sorted = [...companies].sort((a, b) => getUrgency(b) - getUrgency(a))
  const heroEntry = sorted[0]

  // Queue: entries with clear next actions (top 5 max, urgency >= 5, no NURTURE/CLOSED outcomes)
  const queueEntries = sorted
    .filter(e => getUrgency(e) >= 5)
    .slice(0, 5)

  function getEntryDestination(entry: CompanyEntry): string {
    if (entry.convStage === 'REPLIED' || entry.convStage === 'ACTIVE' || entry.outreachStage === 'SENT') {
      return `/conversations/${entry.id}`
    }
    if (entry.researchStage === 'COMPLETE' && entry.contactStage === 'NOT_DISCOVERED') {
      return `/opportunities/${entry.id}`
    }
    return `/companies/${entry.id}`
  }

  // Derive a concise activity list from actual workspace state
  type ActivityLine = { company: string; event: string; detail: string; time: string }
  const activityLines: ActivityLine[] = sorted
    .flatMap(entry => {
      const lines: ActivityLine[] = []
      const contact = entry.selectedContactId ? getContactData(entry.id, entry.selectedContactId) : null
      const contactName = contact?.name ?? 'contact'
      if (entry.convOutcome) {
        lines.push({ company: entry.name, event: 'Outcome recorded at', detail: CONV_OUTCOME_LABELS[entry.convOutcome], time: entry.lastActivity })
      } else if (entry.convStage === 'ACTIVE' || entry.convStage === 'REPLIED') {
        lines.push({ company: entry.name, event: 'Reply received from', detail: contactName, time: entry.lastActivity })
      } else if (entry.outreachStage === 'SENT' && entry.campaignStage === 'SENT') {
        lines.push({ company: entry.name, event: 'Outreach sent to', detail: contactName, time: entry.sentAt ?? entry.lastActivity })
      } else if (entry.contactStage === 'DISCOVERED' || entry.contactStage === 'SELECTED') {
        lines.push({ company: entry.name, event: 'Contacts identified at', detail: entry.name, time: entry.lastActivity })
      } else if (entry.researchStage === 'COMPLETE') {
        lines.push({ company: entry.name, event: 'Research complete at', detail: entry.name, time: entry.lastActivity })
      } else {
        lines.push({ company: entry.name, event: 'Added to workspace:', detail: entry.name, time: entry.addedAt })
      }
      return lines
    })
    .slice(0, 5)

  return (
    <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      <div className="mb-8">
        <h1 className="text-[26px] font-bold tracking-tight" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {greeting}, {firstName}
        </h1>
        <p className="text-[15px] mt-1" style={{ color: 'var(--color-muted-fg)' }}>
          {queueEntries.length > 0 ? "Here's what needs your attention." : 'Keep going — your workspace is building up.'}{' '}
          <span className="text-[13px]" style={{ color: 'var(--color-muted-fg)', opacity: 0.6 }}>{activeWorkspaceName}</span>
        </p>
      </div>

      <NeedsAttentionSection />

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-6">

          {/* Company queue */}
          {queueEntries.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[13.5px] font-bold tracking-wide uppercase"
                  style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em' }}>
                  Company pipeline
                </h2>
                <span className="text-[12px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--color-accent)', color: 'white' }}>
                  {queueEntries.length}
                </span>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
                {queueEntries.map(entry => (
                  <QueueRow key={entry.id} entry={entry} onClick={() => navigate(getEntryDestination(entry))} />
                ))}
              </div>
            </section>
          )}

          {/* Hero card */}
          <HeroCard entry={heroEntry} onClick={() => navigate(getEntryDestination(heroEntry))} />

          {/* Keep in touch */}
          <KeepInTouchSection entries={companies} onNavigate={id => navigate(`/companies/${id}`)} />

          {/* Opportunity summary */}
          <OpportunitySummary entries={companies} />
        </div>

        {/* Right: activity */}
        <div className="w-full xl:w-[260px] flex-shrink-0">
          <div className="sticky top-0">
            <h2 className="text-[13.5px] font-bold tracking-wide uppercase mb-3"
              style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em' }}>
              Recent activity
            </h2>
            <div className="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
              {activityLines.map((line, i) => (
                <ActivityItem
                  key={i}
                  company={line.company}
                  event={line.event}
                  detail={line.detail}
                  time={line.time}
                  isLast={i === activityLines.length - 1}
                />
              ))}
              <button
                onClick={() => navigate('/companies')}
                className="mt-1 text-[12.5px] font-semibold flex items-center gap-1"
                style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                View all companies <Icon d={icons.arrowRight} size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Icon, icons } from '../../lib/icons'
import type {
  CompanyEntry,
  ConvOutcome,
  ConvMessage,
  OppStatus,
  FollowUpStage,
  RelationshipStatus,
} from '../../lib/workspaceStore'
import {
  getConversationMessages,
  calcFollowUpDueAt,
  deriveRelationshipStatus,
  CONV_OUTCOME_LABELS,
} from '../../lib/workspaceStore'
import { getContactData } from './ContactsTab'
import type { CompanyContactView } from './ContactsTab'

// ─── Simulated reply content ──────────────────────────────────────────────────

const REPLY_MAP: Record<string, { confirmed: string; proactive: string }> = {
  kuda: {
    confirmed: `Hi,\n\nGood to hear from you — your timing is good. We are building out the engineering team here and there are some real challenges to solve.\n\nYour background in distributed systems and financial platform engineering sounds relevant to what we're working on. I'd be happy to find 30 minutes to talk through the specifics.\n\nLet me send over a calendar link and we can connect this week.\n\nAlex`,
    proactive: `Hi,\n\nThanks for the note. We're not actively hiring right now, but I'm always open to interesting conversations.\n\nLet's find 20 minutes — I'll send over a link.\n\nAlex`,
  },
  stripe: {
    confirmed: `Hi,\n\nThanks for reaching out — your timing is good. We've been growing the platform engineering team and your background in distributed systems sounds relevant.\n\nI'd like to understand more about the specific work you've done. A 30-minute call could be a useful starting point.\n\nBest,\nAlexis`,
    proactive: `Hi,\n\nAppreciate the thoughtful note. We're not hiring for a specific role right now, but I'm always open to learning about interesting people.\n\nYour infrastructure background sounds relevant to some of our longer-term bets. Happy to connect.\n\nAlexis`,
  },
  paystack: {
    confirmed: `Hi,\n\nThanks for the note. We are actively building and your background sounds like it might be relevant.\n\nLet's schedule a call — drop me a time that works this week or next.\n\nBest,\nEmeka`,
    proactive: `Hi,\n\nThanks for taking the time to write — it's clear you've done your homework on Paystack's work.\n\nWe're not filling anything specific right now, but I'd be open to a short conversation. Send me a time that works.\n\nEmeka`,
  },
  vercel: {
    confirmed: `Hi,\n\nGood to hear from you. The team is growing and we're looking at a few directions — your profile sounds like it could be interesting.\n\nI'll send over a link to book time.\n\nThanks,\nSophia`,
    proactive: `Hi,\n\nThanks for following what we're building. We're not hiring for anything specific right now, but I like talking to people who follow the frontend infra space closely.\n\nHappy to connect.\n\nSophia`,
  },
}

function getSimulatedReply(companyId: string, contact: CompanyContactView, oppStatus: OppStatus): string {
  const firstName = contact.name.split(' ')[0]
  const entry = REPLY_MAP[companyId]
  if (entry) return oppStatus === 'CONFIRMED' ? entry.confirmed : entry.proactive
  return oppStatus === 'CONFIRMED'
    ? `Hi,\n\nThanks for reaching out — your timing works well. We are building out the team and your background sounds relevant.\n\nLet's find 30 minutes to connect. I'll send over a scheduling link.\n\nBest,\n${firstName}`
    : `Hi,\n\nThanks for the thoughtful note. We're not actively hiring right now, but I'm always happy to connect with interesting people.\n\nLet's find 20 minutes.\n\n${firstName}`
}

// ─── Follow-up content ────────────────────────────────────────────────────────

const FOLLOWUP_MAP: Record<string, {
  first: { subject: string; body: string }
  second: { subject: string; body: string }
}> = {
  kuda: {
    first: {
      subject: 'Re: Engineering interest at Kuda',
      body: `Hi Alex,\n\nFollowing up on my note from earlier this week. I know the team is busy — I'll keep this short.\n\nI remain genuinely interested in the infrastructure challenges Kuda is solving. If a short call makes sense, I'd still welcome it.\n\n[Your name]`,
    },
    second: {
      subject: 'Re: Engineering interest at Kuda',
      body: `Hi Alex,\n\nOne last note — I won't persist beyond this. If the timing is ever right to connect, I'd still welcome it.\n\n[Your name]`,
    },
  },
  stripe: {
    first: {
      subject: 'Re: Platform engineering interest at Stripe',
      body: `Hi,\n\nFollowing up briefly on my earlier message. I'm still very interested in the platform engineering work at Stripe.\n\nIf there's a moment for a short call, I'd appreciate the chance to share more about my background.\n\n[Your name]`,
    },
    second: {
      subject: 'Re: Platform engineering interest at Stripe',
      body: `Hi,\n\nLast note from me. I remain genuinely interested in contributing to Stripe's infrastructure work — feel free to reach out whenever the timing changes.\n\n[Your name]`,
    },
  },
  paystack: {
    first: {
      subject: 'Re: Engineering interest at Paystack',
      body: `Hi,\n\nFollowing up briefly on my earlier note. I'm still interested in connecting and happy to find time that works for you.\n\n[Your name]`,
    },
    second: {
      subject: 'Re: Engineering interest at Paystack',
      body: `Hi,\n\nLast follow-up from me. I remain genuinely interested in Paystack's work — reach out whenever the timing is right.\n\n[Your name]`,
    },
  },
  vercel: {
    first: {
      subject: 'Re: Frontend infrastructure interest at Vercel',
      body: `Hi,\n\nFollowing up on my earlier message. I remain interested in connecting with the team at Vercel.\n\nIf there's a good moment for a brief call, I'd welcome it.\n\n[Your name]`,
    },
    second: {
      subject: 'Re: Frontend infrastructure interest at Vercel',
      body: `Hi,\n\nOne last follow-up — I won't persist further. If timing is ever right, I'd still welcome a conversation.\n\n[Your name]`,
    },
  },
}

function getFollowUpContent(
  companyId: string,
  companyName: string,
  contact: CompanyContactView,
  _oppStatus: OppStatus,
  followUpNumber: 1 | 2,
  outreachSubject?: string,
): { subject: string; body: string } {
  const specific = FOLLOWUP_MAP[companyId]
  if (specific) return followUpNumber === 1 ? specific.first : specific.second
  const firstName = contact.name.split(' ')[0]
  const subject = outreachSubject ? `Re: ${outreachSubject}` : `Following up — ${companyName}`
  const body = followUpNumber === 1
    ? `Hi ${firstName},\n\nFollowing up briefly on my earlier message. I remain genuinely interested in ${companyName}'s work and happy to connect.\n\n[Your name]`
    : `Hi ${firstName},\n\nOne last follow-up — I won't persist beyond this. If the timing is ever right to connect, I'd still welcome it.\n\n[Your name]`
  return { subject, body }
}

// ─── Opportunity config ───────────────────────────────────────────────────────

const OPP_CFG = {
  CONFIRMED:    { color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981', label: 'CONFIRMED' },
  PROACTIVE:    { color: '#3730A3', bg: '#EEF2FF', border: '#C7D2FE', dot: '#4F46E5', label: 'PROACTIVE' },
  UNCLASSIFIED: { color: '#713F12', bg: '#FEFCE8', border: '#FDE68A', dot: '#F59E0B', label: 'UNCLASSIFIED' },
}

// ─── Outcome options ──────────────────────────────────────────────────────────

const OUTCOME_OPTIONS: { value: ConvOutcome; label: string; desc: string; dot: string }[] = [
  { value: 'INTERESTED',      label: CONV_OUTCOME_LABELS.INTERESTED,      desc: 'Open to connecting or exploring further',  dot: '#10B981' },
  { value: 'FOLLOW_UP_LATER', label: CONV_OUTCOME_LABELS.FOLLOW_UP_LATER, desc: 'Not now, but open to future contact',      dot: '#4F46E5' },
  { value: 'REFERRED',        label: CONV_OUTCOME_LABELS.REFERRED,        desc: 'Suggested another person or team',         dot: '#8B5CF6' },
  { value: 'APPLICATION',     label: CONV_OUTCOME_LABELS.APPLICATION,     desc: 'Identified a specific role to apply for',  dot: '#0369A1' },
  { value: 'NOT_A_FIT',       label: CONV_OUTCOME_LABELS.NOT_A_FIT,       desc: 'Timing or role mismatch',                  dot: '#F59E0B' },
  { value: 'NOT_HIRING',      label: CONV_OUTCOME_LABELS.NOT_HIRING,      desc: 'No openings at this time',                 dot: '#EA580C' },
  { value: 'NO_RESPONSE',     label: CONV_OUTCOME_LABELS.NO_RESPONSE,     desc: 'No reply after outreach and follow-ups',   dot: '#94A3B8' },
  { value: 'CLOSED',          label: CONV_OUTCOME_LABELS.CLOSED,          desc: 'Conversation concluded',                   dot: '#64748B' },
]

const OUTCOME_DOTS: Record<ConvOutcome, string> = {
  INTERESTED:      '#10B981',
  FOLLOW_UP_LATER: '#4F46E5',
  REFERRED:        '#8B5CF6',
  APPLICATION:     '#0369A1',
  NOT_A_FIT:       '#F59E0B',
  NOT_HIRING:      '#EA580C',
  NO_RESPONSE:     '#94A3B8',
  CLOSED:          '#64748B',
}

const REL_STATUS_CFG: Record<NonNullable<RelationshipStatus>, { label: string; color: string; bg: string; border: string; dot: string }> = {
  OPEN:        { label: 'Active',       color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981' },
  OPPORTUNITY: { label: 'Opportunity',  color: '#92400E', bg: '#FFFBEB', border: '#FDE68A', dot: '#F59E0B' },
  NURTURE:     { label: 'Nurture',      color: '#3730A3', bg: '#EEF2FF', border: '#C7D2FE', dot: '#4F46E5' },
  CLOSED:      { label: 'Closed',       color: '#374151', bg: 'var(--color-muted)', border: 'var(--color-border)', dot: '#94A3B8' },
}

// ─── Gate card ────────────────────────────────────────────────────────────────

function GateCard({ icon, heading, body, cta, onCta }: {
  icon: string | string[]
  heading: string
  body: string
  cta?: string
  onCta?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-8">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}>
        <Icon d={icon} size={20} strokeWidth={1.7} />
      </div>
      <div className="text-center max-w-[400px]">
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
          style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
        >
          {cta} <Icon d={icons.arrowRight} size={14} />
        </button>
      )}
    </div>
  )
}

// ─── Context panel ────────────────────────────────────────────────────────────

function ContextPanel({ entry, contact }: { entry: CompanyEntry; contact: CompanyContactView }) {
  const oppCfg = OPP_CFG[entry.oppStatus]

  return (
    <div className="xl:w-[280px] flex-shrink-0">
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <p className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
          Context
        </p>
      </div>

      <div className="p-5 flex flex-col gap-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            Contact
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[12px] flex-shrink-0"
              style={{ background: contact.avatarBg, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {contact.avatarInitials}
            </div>
            <div>
              <p className="text-[14px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {contact.name}
              </p>
              <p className="text-[11.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                {contact.role} · {entry.name}
              </p>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--color-border)' }} />

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            Why this person
          </p>
          <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
            {contact.relevanceSummary}
          </p>
        </div>

        <div style={{ height: 1, background: 'var(--color-border)' }} />

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            Opportunity
          </p>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-2"
            style={{ background: oppCfg.bg, color: oppCfg.color, border: `1px solid ${oppCfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: oppCfg.dot }} />
            {oppCfg.label}
          </span>
          <p className="text-[12px] leading-relaxed mt-1" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            {entry.oppStatus === 'CONFIRMED'
              ? 'Direct evidence of a potential opening.'
              : 'Proactive outreach — no confirmed opening.'}
          </p>
        </div>

        {entry.campaignName && (
          <>
            <div style={{ height: 1, background: 'var(--color-border)' }} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
                Campaign
              </p>
              <p className="text-[12.5px] font-medium" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
                {entry.campaignName}
              </p>
              {entry.sentAt && (
                <p className="text-[11.5px] mt-1" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                  Sent {entry.sentAt}
                </p>
              )}
            </div>
          </>
        )}

        {entry.convOutcome && (() => {
          const relStatus = deriveRelationshipStatus(entry)
          const relCfg = relStatus ? REL_STATUS_CFG[relStatus] : null
          return (
            <>
              <div style={{ height: 1, background: 'var(--color-border)' }} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
                  Outcome
                </p>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: OUTCOME_DOTS[entry.convOutcome] }} />
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {CONV_OUTCOME_LABELS[entry.convOutcome]}
                  </span>
                </div>
                {entry.convOutcomeNote && (
                  <p className="text-[11.5px] leading-relaxed italic mb-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                    "{entry.convOutcomeNote}"
                  </p>
                )}
                {relCfg && (
                  <span
                    className="inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: relCfg.bg, color: relCfg.color, border: `1px solid ${relCfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: relCfg.dot }} />
                    {relCfg.label}
                  </span>
                )}
              </div>
            </>
          )
        })()}
      </div>
    </div>
  )
}

// ─── Message bubbles ──────────────────────────────────────────────────────────

function OutgoingBubble({ message, contact }: { message: ConvMessage; contact: CompanyContactView }) {
  const isFollowUp = message.kind === 'followup'
  const isUserReply = message.kind === 'user-reply'
  const kindLabel = isFollowUp ? 'Follow-up' : isUserReply ? 'Your reply' : 'Outreach'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 justify-between flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            {isUserReply ? 'You replied' : `You → ${contact.name}`}
          </span>
          {!isUserReply && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{
                background: isFollowUp ? '#EDE9FE' : 'var(--color-muted)',
                color: isFollowUp ? '#7C3AED' : 'var(--color-muted-fg)',
              }}
            >
              {kindLabel}
            </span>
          )}
        </div>
        <span className="text-[11px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          {message.timestamp}
        </span>
      </div>
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}
      >
        {message.subject && (
          <>
            <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-muted)' }}>
              <div
                className="w-5 h-5 rounded flex items-center justify-center font-bold text-[9px] flex-shrink-0"
                style={{ background: contact.avatarBg, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                {contact.avatarInitials}
              </div>
              <span className="text-[12.5px]" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
                {contact.name}
              </span>
            </div>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <span className="text-[11.5px] font-semibold" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Subject: </span>
              <span className="text-[13px] font-medium" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>{message.subject}</span>
            </div>
          </>
        )}
        <div className="px-4 py-4">
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
            {message.body}
          </p>
        </div>
      </div>
    </div>
  )
}

function IncomingBubble({ message, contact }: { message: ConvMessage; contact: CompanyContactView }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 justify-between flex-wrap">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] flex-shrink-0"
            style={{ background: contact.avatarBg, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {contact.avatarInitials}
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            {contact.name.split(' ')[0]} replied
          </span>
        </div>
        <span className="text-[11px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          {message.timestamp}
        </span>
      </div>
      <div className="rounded-xl p-4" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
        <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: '#14532D', fontFamily: 'Inter, sans-serif' }}>
          {message.body}
        </p>
      </div>
    </div>
  )
}

function MessageTimeline({ messages, contact }: { messages: ConvMessage[]; contact: CompanyContactView }) {
  if (messages.length === 0) return null
  return (
    <div className="flex flex-col gap-5">
      {messages.map(msg =>
        msg.direction === 'outbound'
          ? <OutgoingBubble key={msg.id} message={msg} contact={contact} />
          : <IncomingBubble key={msg.id} message={msg} contact={contact} />
      )}
    </div>
  )
}

// ─── Stop follow-ups ──────────────────────────────────────────────────────────

function StopFollowUps({ entry, contact, onUpdate }: {
  entry: CompanyEntry
  contact: CompanyContactView
  onUpdate: (patch: Partial<CompanyEntry>) => void
}) {
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
        <div className="flex items-start gap-2.5">
          <span className="flex-shrink-0 mt-0.5" style={{ color: '#92400E' }}>
            <Icon d={icons.alertCircle} size={15} />
          </span>
          <p className="text-[12.5px] leading-relaxed" style={{ color: '#78350F', fontFamily: 'Inter, sans-serif' }}>
            Stop follow-up activity with <strong>{contact.name}</strong>? The conversation history will be preserved.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onUpdate({ convStage: 'STOPPED', followUpStage: 'NONE', lastActivity: 'Just now' })}
            className="px-3.5 py-2 rounded-lg text-[12.5px] font-semibold transition-all"
            style={{ background: '#FEF3C7', color: '#78350F', border: '1px solid #FDE68A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#FDE68A')}
            onMouseLeave={e => (e.currentTarget.style.background = '#FEF3C7')}
          >
            Confirm — stop follow-ups
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="px-3 py-2 rounded-lg text-[12.5px] font-medium"
            style={{ color: '#92400E', fontFamily: 'Inter, sans-serif' }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
      <p className="text-[12.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
        No longer pursuing this conversation?
      </p>
      <button
        onClick={() => setConfirming(true)}
        className="text-[12.5px] font-medium transition-all"
        style={{ color: '#92400E', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        Stop follow-ups
      </button>
    </div>
  )
}

// ─── Record outcome ───────────────────────────────────────────────────────────

function RecordOutcome({ entry, onUpdate }: {
  entry: CompanyEntry
  onUpdate: (patch: Partial<CompanyEntry>) => void
}) {
  const [selected, setSelected] = useState<ConvOutcome | null>(null)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [editingNote, setEditingNote] = useState(false)
  const [noteText, setNoteText] = useState(entry.convOutcomeNote ?? '')

  if (entry.convOutcome) {
    const relStatus = deriveRelationshipStatus(entry)
    const relCfg = relStatus ? REL_STATUS_CFG[relStatus] : null
    return (
      <div className="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <p className="text-[10.5px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
          Outcome recorded
        </p>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: OUTCOME_DOTS[entry.convOutcome] }} />
          <span className="text-[14px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {CONV_OUTCOME_LABELS[entry.convOutcome]}
          </span>
          {relCfg && (
            <span
              className="ml-1 inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: relCfg.bg, color: relCfg.color, border: `1px solid ${relCfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: relCfg.dot }} />
              {relCfg.label}
            </span>
          )}
          <button
            onClick={() => onUpdate({ convOutcome: undefined, convOutcomeNote: undefined })}
            className="ml-auto text-[12px] font-medium transition-all"
            style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted-fg)')}
          >
            Change
          </button>
        </div>

        {/* Note */}
        {editingNote ? (
          <div className="flex flex-col gap-2 mt-2">
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Add a note about this outcome..."
              rows={2}
              className="w-full resize-none px-3 py-2 rounded-lg text-[12.5px] leading-relaxed outline-none transition-all"
              style={{
                background: 'var(--color-muted)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-primary)',
                fontFamily: 'Inter, sans-serif',
              }}
              onFocus={e => (e.currentTarget.style.border = '1px solid var(--color-accent)')}
              onBlur={e => (e.currentTarget.style.border = '1px solid var(--color-border)')}
            />
            <div className="flex gap-2">
              <button
                onClick={() => { onUpdate({ convOutcomeNote: noteText.trim() || undefined }); setEditingNote(false) }}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                Save note
              </button>
              <button
                onClick={() => { setNoteText(entry.convOutcomeNote ?? ''); setEditingNote(false) }}
                className="px-3 py-1.5 text-[12px] font-medium"
                style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : entry.convOutcomeNote ? (
          <div className="mt-1 flex items-start justify-between gap-2">
            <p className="text-[12px] leading-relaxed italic" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
              "{entry.convOutcomeNote}"
            </p>
            <button
              onClick={() => { setNoteText(entry.convOutcomeNote ?? ''); setEditingNote(true) }}
              className="text-[11px] flex-shrink-0 font-medium"
              style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}
            >
              Edit
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingNote(true)}
            className="text-[12px] font-medium flex items-center gap-1 mt-1"
            style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            + Add a note
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
      <p className="text-[10.5px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
        Record outcome
      </p>
      <p className="text-[12.5px] mb-4" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
        How did this conversation go?
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {OUTCOME_OPTIONS.map(opt => {
          const isSelected = selected === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => setSelected(isSelected ? null : opt.value)}
              className="flex items-start gap-3 p-3 rounded-lg text-left transition-all"
              style={{
                background: isSelected ? '#EEF2FF' : 'var(--color-muted)',
                border: isSelected ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border)',
              }}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: opt.dot }} />
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold leading-snug" style={{ color: isSelected ? 'var(--color-accent)' : 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {opt.label}
                </p>
                <p className="text-[11.5px] mt-0.5 leading-snug" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                  {opt.desc}
                </p>
              </div>
            </button>
          )
        })}
      </div>
      {selected && (
        <div className="mb-4">
          <label className="block text-[10.5px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            Note <span className="font-normal normal-case tracking-normal" style={{ color: 'var(--color-muted-fg)' }}>(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="What did you learn? What should you remember about this person?"
            rows={2}
            className="w-full resize-none px-3 py-2 rounded-lg text-[12.5px] leading-relaxed outline-none transition-all"
            style={{
              background: 'var(--color-muted)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-primary)',
              fontFamily: 'Inter, sans-serif',
            }}
            onFocus={e => (e.currentTarget.style.border = '1px solid var(--color-accent)')}
            onBlur={e => (e.currentTarget.style.border = '1px solid var(--color-border)')}
          />
        </div>
      )}
      <button
        onClick={() => {
          if (selected && !saved) {
            setSaved(true)
            onUpdate({ convOutcome: selected, convOutcomeNote: note.trim() || undefined, lastActivity: 'Just now' })
          }
        }}
        disabled={!selected || saved}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
        style={{
          background: selected && !saved ? 'var(--color-primary)' : 'var(--color-muted)',
          color: selected && !saved ? 'white' : 'var(--color-muted-fg)',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          cursor: selected && !saved ? 'pointer' : 'not-allowed',
        }}
        onMouseEnter={e => { if (selected && !saved) e.currentTarget.style.background = '#1E2D4A' }}
        onMouseLeave={e => { if (selected && !saved) e.currentTarget.style.background = 'var(--color-primary)' }}
      >
        <Icon d={icons.check} size={14} strokeWidth={2.5} />
        Save outcome
      </button>
    </div>
  )
}

// ─── Reply composer (ACTIVE state) ───────────────────────────────────────────

function ReplyComposer({ entry, contact, onUpdate }: {
  entry: CompanyEntry
  contact: CompanyContactView
  onUpdate: (patch: Partial<CompanyEntry>) => void
}) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setSending(true)
    setTimeout(() => {
      const newMsg: ConvMessage = {
        id: 'msg_' + Date.now(),
        direction: 'outbound',
        kind: 'user-reply',
        body: trimmed,
        timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) +
          ' · ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      }
      const existing = getConversationMessages(entry)
      onUpdate({ conversationMessages: [...existing, newMsg], lastActivity: 'Just now' })
      setText('')
      setSending(false)
    }, 600)
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-muted)' }}>
        <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
          Reply to {contact.name.split(' ')[0]}
        </p>
      </div>
      <div className="p-4">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write a reply..."
          rows={4}
          className="w-full resize-none rounded-lg px-3 py-2.5 text-[13.5px] leading-relaxed outline-none transition-all"
          style={{
            background: 'var(--color-muted)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-primary)',
            fontFamily: 'Inter, sans-serif',
          }}
          onFocus={e => (e.currentTarget.style.border = '1px solid var(--color-accent)')}
          onBlur={e => (e.currentTarget.style.border = '1px solid var(--color-border)')}
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-[11.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            Prototype — stored locally only.
          </p>
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all"
            style={{
              background: text.trim() && !sending ? 'var(--color-primary)' : 'var(--color-muted)',
              color: text.trim() && !sending ? 'white' : 'var(--color-muted-fg)',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              cursor: text.trim() && !sending ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={e => { if (text.trim() && !sending) e.currentTarget.style.background = '#1E2D4A' }}
            onMouseLeave={e => { if (text.trim() && !sending) e.currentTarget.style.background = 'var(--color-primary)' }}
          >
            {sending ? 'Sending…' : <>Send reply <Icon d={icons.arrowRight} size={13} /></>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Follow-up draft panel ────────────────────────────────────────────────────

function FollowUpDraftPanel({ entry, contact, onUpdate }: {
  entry: CompanyEntry
  contact: CompanyContactView
  onUpdate: (patch: Partial<CompanyEntry>) => void
}) {
  const followUpNumber = ((entry.followUpCount ?? 0) + 1) as 1 | 2
  const generated = getFollowUpContent(
    entry.id, entry.name, contact, entry.oppStatus, followUpNumber, entry.outreachSubject,
  )
  const [subject, setSubject] = useState(entry.followUpSubject ?? generated.subject)
  const [body, setBody] = useState(entry.followUpMessage ?? generated.body)
  const [sendPhase, setSendPhase] = useState<'draft' | 'confirming' | 'sending'>('draft')

  function handleSend() {
    setSendPhase('sending')
    setTimeout(() => {
      const now = new Date()
      const ts = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) +
        ' · ' + now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      const followUpMsg: ConvMessage = {
        id: 'msg_' + Date.now(),
        direction: 'outbound',
        kind: 'followup',
        subject,
        body,
        timestamp: ts,
      }
      const existing = getConversationMessages(entry)
      const newCount = (entry.followUpCount ?? 0) + 1
      const nextStage: FollowUpStage = newCount >= 2 ? 'SENT' : 'NONE'
      onUpdate({
        conversationMessages: [...existing, followUpMsg],
        followUpStage: nextStage,
        followUpCount: newCount,
        followUpSubject: undefined,
        followUpMessage: undefined,
        followUpDueAt: nextStage === 'NONE' ? calcFollowUpDueAt(now) : undefined,
        lastActivity: 'Just now',
      })
    }, 1400)
  }

  if (sendPhase === 'sending') {
    return (
      <div className="rounded-xl p-8 flex flex-col items-center gap-4" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
        <div className="w-10 h-10 rounded-full border-2 border-current border-t-transparent animate-spin" style={{ color: 'var(--color-accent)' }} />
        <p className="text-[13.5px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Sending follow-up…
        </p>
        <p className="text-[12px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          Prototype — nothing is sent in reality.
        </p>
      </div>
    )
  }

  if (sendPhase === 'confirming') {
    return (
      <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
        <div className="flex items-start gap-2.5">
          <span className="flex-shrink-0 mt-0.5" style={{ color: '#92400E' }}>
            <Icon d={icons.alertCircle} size={15} />
          </span>
          <div>
            <p className="text-[13px] font-semibold mb-1" style={{ color: '#78350F', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Send follow-up #{followUpNumber} to {contact.name.split(' ')[0]}?
            </p>
            <p className="text-[12px]" style={{ color: '#92400E', fontFamily: 'Inter, sans-serif' }}>
              {followUpNumber >= 2 ? 'This is the final follow-up. No further follow-ups will be scheduled.' : 'A second follow-up will be available after this one.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSend}
            className="px-4 py-2 rounded-lg text-[12.5px] font-semibold transition-all"
            style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
          >
            Confirm — send follow-up
          </button>
          <button
            onClick={() => setSendPhase('draft')}
            className="px-3 py-2 rounded-lg text-[12.5px] font-medium"
            style={{ color: '#92400E', fontFamily: 'Inter, sans-serif' }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-muted)' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
            <Icon d={icons.campaigns} size={12} />
          </div>
          <p className="text-[12px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Follow-up #{followUpNumber} draft
          </p>
        </div>
        <button
          onClick={() => onUpdate({ followUpStage: 'DUE' })}
          className="text-[11.5px] font-medium"
          style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}
        >
          ← Back
        </button>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div>
          <label className="block text-[10.5px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-[13px] outline-none transition-all"
            style={{
              background: 'var(--color-muted)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-primary)',
              fontFamily: 'Inter, sans-serif',
            }}
            onFocus={e => (e.currentTarget.style.border = '1px solid var(--color-accent)')}
            onBlur={e => (e.currentTarget.style.border = '1px solid var(--color-border)')}
          />
        </div>
        <div>
          <label className="block text-[10.5px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            Message
          </label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={7}
            className="w-full resize-none px-3 py-2.5 rounded-lg text-[13px] leading-relaxed outline-none transition-all"
            style={{
              background: 'var(--color-muted)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-primary)',
              fontFamily: 'Inter, sans-serif',
            }}
            onFocus={e => (e.currentTarget.style.border = '1px solid var(--color-accent)')}
            onBlur={e => (e.currentTarget.style.border = '1px solid var(--color-border)')}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSendPhase('confirming')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
            style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
          >
            Send follow-up <Icon d={icons.arrowRight} size={14} />
          </button>
          <button
            onClick={() => onUpdate({ followUpSubject: subject, followUpMessage: body })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-medium transition-all"
            style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-border)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-muted)')}
          >
            <Icon d={icons.check} size={14} />
            Save draft
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Awaiting reply view ──────────────────────────────────────────────────────

function AwaitingReplyView({ entry, contact, onUpdate, messages }: {
  entry: CompanyEntry
  contact: CompanyContactView
  onUpdate: (patch: Partial<CompanyEntry>) => void
  messages: ConvMessage[]
}) {
  const followUpCount = entry.followUpCount ?? 0
  const allFollowUpsSent = entry.followUpStage === 'SENT' || followUpCount >= 2
  const canSimulateFollowUpDue = !allFollowUpsSent && entry.followUpStage === 'NONE'

  function handleSimulateReply() {
    const replyText = getSimulatedReply(entry.id, contact, entry.oppStatus)
    const replyMsg: ConvMessage = {
      id: 'msg_' + Date.now(),
      direction: 'inbound',
      kind: 'contact-reply',
      body: replyText,
      timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) +
        ' · ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    }
    const existing = getConversationMessages(entry)
    onUpdate({
      convStage: 'REPLIED',
      followUpStage: 'NONE',
      conversationMessages: [...existing, replyMsg],
      lastActivity: 'Just now',
    })
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-5 xl:px-6 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-2.5 flex-wrap">
          <p className="text-[14px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Awaiting reply
          </p>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
            style={{ background: '#EDE9FE', color: '#7C3AED', border: '1px solid #DDD6FE', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#8B5CF6' }} />
            {allFollowUpsSent
              ? `${followUpCount} follow-up${followUpCount > 1 ? 's' : ''} sent`
              : followUpCount > 0 ? 'Follow-up sent' : 'Sent'}
          </span>
          {entry.followUpDueAt && !allFollowUpsSent && (
            <span className="text-[11.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
              Next follow-up due {entry.followUpDueAt}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 xl:p-6 flex flex-col gap-5">
        <MessageTimeline messages={messages} contact={contact} />

        {allFollowUpsSent && (
          <div
            className="rounded-xl p-4 flex items-start gap-3"
            style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}
          >
            <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-border)', color: 'var(--color-muted-fg)' }}>
              <Icon d={icons.check} size={12} strokeWidth={2.5} />
            </div>
            <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
              All follow-ups have been sent. No further follow-ups are scheduled.
            </p>
          </div>
        )}

        <div
          className="rounded-xl p-5 flex flex-col gap-4"
          style={{ background: 'var(--color-muted)', border: '1px dashed var(--color-border)' }}
        >
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
              <Icon d={icons.campaigns} size={14} />
            </div>
            <div>
              <p className="text-[12.5px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Prototype simulation
              </p>
              <p className="text-[12px] mt-0.5 leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                Nothing has been sent in reality. Use these controls to simulate events and explore the experience.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSimulateReply}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all"
              style={{ background: '#7C3AED', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#6D28D9')}
              onMouseLeave={e => (e.currentTarget.style.background = '#7C3AED')}
            >
              <Icon d={icons.replies} size={14} />
              Simulate reply
            </button>
            {canSimulateFollowUpDue && (
              <button
                onClick={() => onUpdate({ followUpStage: 'DUE', lastActivity: 'Just now' })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all"
                style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-card)')}
              >
                <Icon d={icons.clock} size={14} />
                Simulate follow-up due
              </button>
            )}
          </div>
        </div>

        <StopFollowUps entry={entry} contact={contact} onUpdate={onUpdate} />
      </div>
    </div>
  )
}

// ─── Follow-up due view ───────────────────────────────────────────────────────

function FollowUpDueView({ entry, contact, onUpdate, messages }: {
  entry: CompanyEntry
  contact: CompanyContactView
  onUpdate: (patch: Partial<CompanyEntry>) => void
  messages: ConvMessage[]
}) {
  const followUpNumber = ((entry.followUpCount ?? 0) + 1) as 1 | 2

  function handleSimulateReply() {
    const replyText = getSimulatedReply(entry.id, contact, entry.oppStatus)
    const replyMsg: ConvMessage = {
      id: 'msg_' + Date.now(),
      direction: 'inbound',
      kind: 'contact-reply',
      body: replyText,
      timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) +
        ' · ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    }
    const existing = getConversationMessages(entry)
    onUpdate({
      convStage: 'REPLIED',
      followUpStage: 'NONE',
      conversationMessages: [...existing, replyMsg],
      lastActivity: 'Just now',
    })
  }

  function handleOpenDraft() {
    const generated = getFollowUpContent(
      entry.id, entry.name, contact, entry.oppStatus, followUpNumber, entry.outreachSubject,
    )
    onUpdate({
      followUpStage: 'DRAFT',
      followUpSubject: entry.followUpSubject ?? generated.subject,
      followUpMessage: entry.followUpMessage ?? generated.body,
    })
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-5 xl:px-6 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-2.5 flex-wrap">
          <p className="text-[14px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Follow-up #{followUpNumber} due
          </p>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
            style={{ background: '#FFFBEB', color: '#78350F', border: '1px solid #FDE68A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#F59E0B' }} />
            Follow-up due
          </span>
        </div>
      </div>

      <div className="p-5 xl:p-6 flex flex-col gap-5">
        <MessageTimeline messages={messages} contact={contact} />

        <div
          className="rounded-xl p-5 flex flex-col gap-4"
          style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
        >
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: '#FEF3C7', color: '#92400E' }}>
              <Icon d={icons.clock} size={14} />
            </div>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: '#78350F', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Time to follow up with {contact.name.split(' ')[0]}
              </p>
              <p className="text-[12px] mt-0.5 leading-relaxed" style={{ color: '#92400E', fontFamily: 'Inter, sans-serif' }}>
                Four business days have passed without a reply. A draft follow-up is ready to review and send.
                {followUpNumber >= 2 && ' This will be your final follow-up.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenDraft}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all self-start"
            style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
          >
            Review follow-up draft <Icon d={icons.arrowRight} size={14} />
          </button>
        </div>

        <div
          className="rounded-xl p-4 flex flex-col gap-3"
          style={{ background: 'var(--color-muted)', border: '1px dashed var(--color-border)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
              <Icon d={icons.campaigns} size={11} />
            </div>
            <p className="text-[11.5px] font-semibold" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Prototype — simulate a reply arriving instead
            </p>
          </div>
          <button
            onClick={handleSimulateReply}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold transition-all self-start"
            style={{ background: '#7C3AED', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#6D28D9')}
            onMouseLeave={e => (e.currentTarget.style.background = '#7C3AED')}
          >
            <Icon d={icons.replies} size={13} />
            Simulate reply
          </button>
        </div>

        <StopFollowUps entry={entry} contact={contact} onUpdate={onUpdate} />
      </div>
    </div>
  )
}

// ─── Follow-up draft view ─────────────────────────────────────────────────────

function FollowUpDraftView({ entry, contact, onUpdate, messages }: {
  entry: CompanyEntry
  contact: CompanyContactView
  onUpdate: (patch: Partial<CompanyEntry>) => void
  messages: ConvMessage[]
}) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="px-5 xl:px-6 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-2.5 flex-wrap">
          <p className="text-[14px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Follow-up draft
          </p>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
            style={{ background: '#EDE9FE', color: '#7C3AED', border: '1px solid #DDD6FE', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#8B5CF6' }} />
            Draft
          </span>
        </div>
      </div>

      <div className="p-5 xl:p-6 flex flex-col gap-5">
        {messages.length > 0 && <MessageTimeline messages={messages} contact={contact} />}
        <FollowUpDraftPanel entry={entry} contact={contact} onUpdate={onUpdate} />
        <StopFollowUps entry={entry} contact={contact} onUpdate={onUpdate} />
      </div>
    </div>
  )
}

// ─── Reply received view ──────────────────────────────────────────────────────

function ReplyReceivedView({ entry, contact, onUpdate, messages }: {
  entry: CompanyEntry
  contact: CompanyContactView
  onUpdate: (patch: Partial<CompanyEntry>) => void
  messages: ConvMessage[]
}) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="px-5 xl:px-6 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-2.5 flex-wrap">
          <p className="text-[14px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Conversation
          </p>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
            style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />
            Reply received
          </span>
        </div>
      </div>

      <div className="p-5 xl:p-6 flex flex-col gap-5">
        <MessageTimeline messages={messages} contact={contact} />

        <button
          onClick={() => onUpdate({ convStage: 'ACTIVE', lastActivity: 'Just now' })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all self-start"
          style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
        >
          Continue conversation <Icon d={icons.arrowRight} size={14} />
        </button>

        <RecordOutcome entry={entry} onUpdate={onUpdate} />
        <StopFollowUps entry={entry} contact={contact} onUpdate={onUpdate} />
      </div>
    </div>
  )
}

// ─── Active conversation view ─────────────────────────────────────────────────

function ActiveConversationView({ entry, contact, onUpdate, messages }: {
  entry: CompanyEntry
  contact: CompanyContactView
  onUpdate: (patch: Partial<CompanyEntry>) => void
  messages: ConvMessage[]
}) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="px-5 xl:px-6 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-2.5 flex-wrap">
          <p className="text-[14px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Conversation
          </p>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
            style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />
            Active
          </span>
        </div>
      </div>

      <div className="p-5 xl:p-6 flex flex-col gap-5">
        <MessageTimeline messages={messages} contact={contact} />
        <ReplyComposer entry={entry} contact={contact} onUpdate={onUpdate} />
        <RecordOutcome entry={entry} onUpdate={onUpdate} />
        <StopFollowUps entry={entry} contact={contact} onUpdate={onUpdate} />
      </div>
    </div>
  )
}

// ─── Stopped view ─────────────────────────────────────────────────────────────

function StoppedView({ entry, contact, onUpdate, messages }: {
  entry: CompanyEntry
  contact: CompanyContactView
  onUpdate: (patch: Partial<CompanyEntry>) => void
  messages: ConvMessage[]
}) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="px-5 xl:px-6 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-2.5 flex-wrap">
          <p className="text-[14px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Conversation
          </p>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
            style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)', border: '1px solid var(--color-border)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-muted-fg)' }} />
            Stopped
          </span>
        </div>
      </div>

      <div className="p-5 xl:p-6 flex flex-col gap-5">
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}
        >
          <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-border)', color: 'var(--color-muted-fg)' }}>
            <Icon d={icons.clock} size={14} />
          </div>
          <div>
            <p className="text-[13.5px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Follow-ups stopped
            </p>
            <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
              This conversation has been closed. The history is preserved below.
            </p>
          </div>
        </div>

        <MessageTimeline messages={messages} contact={contact} />
        <RecordOutcome entry={entry} onUpdate={onUpdate} />
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ConversationTab({ entry, onUpdate, onNavigate }: {
  entry: CompanyEntry
  onUpdate: (patch: Partial<CompanyEntry>) => void
  onNavigate: (tab: string) => void
}) {
  if (entry.outreachStage !== 'SENT') {
    return (
      <GateCard
        icon={icons.campaigns}
        heading="No conversation yet"
        body="Send your outreach campaign to start the conversation. A conversation will appear here once your outreach has been sent."
        cta={entry.campaignStage === 'READY' ? 'Send outreach' : entry.outreachStage === 'READY' ? 'Create campaign' : undefined}
        onCta={() => onNavigate('Campaign')}
      />
    )
  }

  const contact = getContactData(entry.id, entry.selectedContactId ?? '')
  if (!contact) {
    return (
      <GateCard
        icon={icons.contacts}
        heading="Contact not found"
        body="The contact for this conversation could not be found."
      />
    )
  }

  const messages = getConversationMessages(entry)
  const followUpStage = entry.followUpStage ?? 'NONE'

  function renderContent() {
    switch (entry.convStage) {
      case 'STOPPED':
        return <StoppedView entry={entry} contact={contact!} onUpdate={onUpdate} messages={messages} />
      case 'ACTIVE':
        return <ActiveConversationView entry={entry} contact={contact!} onUpdate={onUpdate} messages={messages} />
      case 'REPLIED':
        return <ReplyReceivedView entry={entry} contact={contact!} onUpdate={onUpdate} messages={messages} />
      case 'NONE':
      default:
        if (followUpStage === 'DRAFT') {
          return <FollowUpDraftView entry={entry} contact={contact!} onUpdate={onUpdate} messages={messages} />
        }
        if (followUpStage === 'DUE') {
          return <FollowUpDueView entry={entry} contact={contact!} onUpdate={onUpdate} messages={messages} />
        }
        return <AwaitingReplyView entry={entry} contact={contact!} onUpdate={onUpdate} messages={messages} />
    }
  }

  return (
    <div
      className="flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <ContextPanel entry={entry} contact={contact} />
      {renderContent()}
    </div>
  )
}

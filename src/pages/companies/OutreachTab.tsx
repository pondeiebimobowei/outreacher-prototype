import { useState, useEffect } from 'react'
import { Icon, icons } from '../../lib/icons'
import type { CompanyEntry, OppStatus } from '../../lib/workspaceStore'
import { loadWorkspace } from '../../lib/workspaceStore'
import { getContactData } from './ContactsTab'
import type { CompanyContactView } from './ContactsTab'
import { getResearchData } from './ResearchTab'

// ─── Prototype draft generation ───────────────────────────────────────────────

function generateDraft(
  companyId: string,
  companyName: string,
  contact: CompanyContactView,
  oppStatus: OppStatus,
  variant: number,
): { subject: string; message: string } {
  const firstName = contact.name.split(' ')[0]
  const isConfirmed = oppStatus === 'CONFIRMED'

  const domainByCompany: Record<string, string> = {
    stripe: 'distributed systems and platform reliability',
    kuda: 'financial platform engineering and high-throughput systems',
    paystack: 'backend platform architecture and payment processing at scale',
    vercel: 'frontend infrastructure and developer tooling',
    linear: 'developer tooling and productivity infrastructure',
  }
  const companyContextByCompany: Record<string, string> = {
    paystack: "work on payments infrastructure across Africa",
    vercel: "approach to the frontend developer platform",
    linear: "approach to software development tooling",
    kuda: "work on digital banking infrastructure",
    stripe: "payments infrastructure work",
  }
  const domainContext = domainByCompany[companyId] ?? 'platform engineering and distributed systems'
  const companyContext = companyContextByCompany[companyId] ?? 'engineering work'

  if (isConfirmed) {
    const subjects = [
      `Engineering interest at ${companyName}`,
      `${companyName} — ${contact.team.toLowerCase()}`,
      `Platform engineering background — ${companyName}`,
    ]
    const subject = subjects[variant % subjects.length]
    const openingSignal = contact.opportunityConnection.toLowerCase().startsWith('active')
      ? 'an opening on your team that looks relevant to my background'
      : 'activity that suggests investment in your team'
    const message = `Hi ${firstName},\n\nI've been following ${companyName}'s engineering work for some time and noticed ${openingSignal}.\n\n${contact.roleRelevance}\n\nMy background is in ${domainContext}. I find the problems your team is working on genuinely interesting, and I'd like to understand more about the work before deciding whether it's the right fit.\n\nWould you be open to a short conversation?\n\nBest,\n[Your name]`
    return { subject, message }
  } else {
    const subjects = [
      `Connecting about engineering at ${companyName}`,
      `${companyName}'s engineering work`,
      `Engineering conversation — ${companyName}`,
    ]
    const subject = subjects[variant % subjects.length]
    const message = `Hi ${firstName},\n\n${companyName}'s ${companyContext} has been on my radar for a while. There isn't a specific role I'm responding to — I'm reaching out because the engineering work here is something I follow with genuine interest.\n\n${contact.roleRelevance}\n\nMy background is in ${domainContext}. I think there's likely relevant overlap, though I'm happy to let you judge that.\n\nWould a short conversation make sense?\n\nBest,\n[Your name]`
    return { subject, message }
  }
}

function getOutreachReasoning(companyName: string, contact: CompanyContactView, oppStatus: OppStatus) {
  return {
    companySignal: contact.opportunityConnection,
    companySource: contact.evidence[0]?.source ?? 'Research findings',
    contactRelevance: contact.roleRelevance,
    opportunityContext:
      oppStatus === 'CONFIRMED'
        ? `CONFIRMED — there is direct evidence of a potential opening. The message references this opportunity without assuming the position is guaranteed.`
        : `PROACTIVE — no confirmed opening found at ${companyName}. The message is relationship-oriented, focusing on genuine interest in the engineering work rather than implying an open position.`,
  }
}

// ─── Generation animation ─────────────────────────────────────────────────────

const GENERATION_STEPS = [
  { label: 'Reviewing company research', detail: 'Reading research findings and signals' },
  { label: 'Checking opportunity context', detail: 'Confirming opportunity classification' },
  { label: 'Connecting contact evidence', detail: 'Linking contact relevance to message structure' },
  { label: 'Drafting message', detail: 'Constructing a credible opening' },
]

function GenerationView({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 600),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 1800),
      setTimeout(() => {
        setDone(true)
        setTimeout(onComplete, 400)
      }, 2200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-14 px-8" role="status" aria-live="polite">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: done ? '#ECFDF5' : '#EDE9FE', color: done ? '#10B981' : '#7C3AED' }}
      >
        {done ? (
          <Icon d={icons.checkCircle} size={22} strokeWidth={1.7} />
        ) : (
          <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        )}
      </div>
      <div className="text-center">
        <p className="text-[16px] font-bold mb-1" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {done ? 'Draft ready for review' : 'Building your outreach'}
        </p>
        <p className="text-[13px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          {done ? 'Review the draft and approve when ready.' : 'Connecting research, evidence, and contact context.'}
        </p>
      </div>
      <div className="w-full max-w-[360px] flex flex-col gap-2.5">
        {GENERATION_STEPS.map((s, i) => {
          const isActive = i === step && !done
          const isComplete = i < step || done
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
              style={{
                background: isActive ? '#EDE9FE' : isComplete ? '#F0FDF4' : 'var(--color-muted)',
                border: isActive ? '1px solid #DDD6FE' : isComplete ? '1px solid #BBF7D0' : '1px solid var(--color-border)',
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: isComplete ? '#10B981' : isActive ? '#8B5CF6' : 'var(--color-border)', color: 'white' }}
              >
                {isComplete ? (
                  <Icon d={icons.check} size={10} strokeWidth={2.5} />
                ) : isActive ? (
                  <span className="w-2 h-2 rounded-full bg-white" />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[13px] font-medium"
                  style={{
                    color: isComplete ? '#15803D' : isActive ? '#7C3AED' : 'var(--color-muted-fg)',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                  }}
                >
                  {s.label}
                </p>
                {(isActive || isComplete) && (
                  <p className="text-[11.5px]" style={{ color: isComplete ? '#16A34A' : 'rgba(139,92,246,0.7)', fontFamily: 'Inter, sans-serif' }}>
                    {s.detail}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Pre-generation view ──────────────────────────────────────────────────────

const OPP_CFG = {
  CONFIRMED:    { color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981', label: 'CONFIRMED OPPORTUNITY' },
  PROACTIVE:    { color: '#3730A3', bg: '#EEF2FF', border: '#C7D2FE', dot: '#4F46E5', label: 'PROACTIVE OUTREACH' },
  UNCLASSIFIED: { color: '#713F12', bg: '#FEFCE8', border: '#FDE68A', dot: '#F59E0B', label: 'UNCLASSIFIED' },
}

function OutreachNotStarted({ contact, entry, onGenerate, onNavigate }: {
  contact: CompanyContactView
  entry: CompanyEntry
  onGenerate: () => void
  onNavigate: (tab: string) => void
}) {
  const cfg = OPP_CFG[entry.oppStatus]
  const researchData = getResearchData(entry.id, entry.name)
  const careerProfile = loadWorkspace().careerProfile ?? {}
  const profileHeadline = careerProfile.professionalHeadline
  const targetIndustries = careerProfile.targetIndustries ?? []

  // Pick top 2 evidence items from research to show as "Based on"
  const keyEvidence = researchData?.evidence.slice(0, 2) ?? []

  return (
    <div className="p-5 sm:p-6 flex flex-col gap-4">
      {/* Preparation context header */}
      <div>
        <p className="text-[16px] font-bold mb-0.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>No outreach yet</p>
        <p className="text-[13px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          Review the context below. When ready, generate a draft grounded in this information.
        </p>
      </div>

      {/* Company + opportunity */}
      <div className="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Company</p>
            <p className="text-[15px] font-bold mt-0.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{entry.name}</p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
            {cfg.label}
          </span>
        </div>

        {/* Why this company (research relevance) */}
        {researchData && (
          <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <p className="text-[10.5px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Why this company</p>
            <ul className="flex flex-col gap-1.5">
              {[researchData.relevance.goalAlignment, researchData.relevance.conversationAngle].map((reason, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--color-accent)' }} />
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>{reason}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Profile match (if careerProfile data available) */}
        {(profileHeadline || targetIndustries.length > 0) && (
          <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <p className="text-[10.5px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Your profile</p>
            {profileHeadline && (
              <p className="text-[12.5px] mb-1.5 font-medium" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>{profileHeadline}</p>
            )}
            {targetIndustries.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {targetIndustries.slice(0, 3).map(ind => (
                  <span key={ind} className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: '#EEF2FF', color: '#3730A3', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{ind}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contact identity + why this person */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[13px] flex-shrink-0"
            style={{ background: contact.avatarBg, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {contact.avatarInitials}
          </div>
          <div>
            <p className="text-[14px] font-bold leading-snug" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{contact.name}</p>
            <p className="text-[12.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{contact.role} · {contact.team}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Why this person</p>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>{contact.roleRelevance}</p>
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Conversation angle</p>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>{contact.conversationAngle}</p>
          </div>
        </div>
      </div>

      {/* Key evidence */}
      {keyEvidence.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
          <p className="text-[10.5px] font-bold uppercase tracking-wide mb-2.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            Based on
          </p>
          <div className="flex flex-col gap-2">
            {keyEvidence.map(ev => (
              <div key={ev.id} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#10B981' }} />
                <div>
                  <p className="text-[12.5px] font-medium leading-snug" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>{ev.title}</p>
                  <p className="text-[11.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{ev.sourceType} · {ev.recency}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate CTA */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.12)' }}
      >
        <p className="text-[12px] font-semibold mb-1" style={{ color: '#7C3AED', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          AI-generated draft — review before sending
        </p>
        <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
          Outreacher will draft a message using the context above. You will review and edit before anything is sent.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onGenerate}
          className="flex items-center gap-2 px-5 py-3 rounded-lg text-[14px] font-semibold transition-all"
          style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
        >
          Generate outreach <Icon d={icons.arrowRight} size={15} />
        </button>
        <button
          onClick={() => onNavigate('Contacts')}
          className="flex items-center gap-1.5 px-4 py-3 rounded-lg text-[13.5px] font-medium transition-all"
          style={{ color: 'var(--color-muted-fg)', background: 'var(--color-muted)', border: '1px solid var(--color-border)', fontFamily: 'Inter, sans-serif' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.borderColor = 'var(--color-accent)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted-fg)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
        >
          <Icon d={icons.arrowLeft} size={14} /> Back to contacts
        </button>
      </div>
    </div>
  )
}

// ─── Context panel (left in two-column layout) ────────────────────────────────

function ContextPanel({ contact, entry, reasoning, showReasoning, onToggleReasoning }: {
  contact: CompanyContactView
  entry: CompanyEntry
  reasoning: ReturnType<typeof getOutreachReasoning>
  showReasoning: boolean
  onToggleReasoning: () => void
}) {
  const cfg = OPP_CFG[entry.oppStatus]
  return (
    <div className="xl:w-[280px] flex-shrink-0">
      {/* Section header */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <p className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
          Context
        </p>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Contact */}
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

        {/* Why this person */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            Why this person
          </p>
          <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
            {contact.relevanceSummary}
          </p>
        </div>

        <div style={{ height: 1, background: 'var(--color-border)' }} />

        {/* Company signal */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            Relevant company signal
          </p>
          <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
            {contact.opportunityConnection}
          </p>
          {contact.evidence[0] && (
            <p className="text-[11px] mt-1.5" style={{ color: 'var(--color-accent)', fontFamily: 'Inter, sans-serif' }}>
              {contact.evidence[0].source}
            </p>
          )}
        </div>

        <div style={{ height: 1, background: 'var(--color-border)' }} />

        {/* Opportunity */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            Opportunity
          </p>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-2"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
            {entry.oppStatus}
          </span>
          <p className="text-[12px] leading-relaxed mt-1" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            {entry.oppStatus === 'CONFIRMED'
              ? 'Direct evidence of a potential opening. The message references this opportunity without assuming it is guaranteed.'
              : 'No confirmed opening found. The message focuses on establishing a relationship based on genuine interest in the engineering work.'}
          </p>
        </div>

        <div style={{ height: 1, background: 'var(--color-border)' }} />

        {/* Why this message? expandable */}
        <div>
          <button
            onClick={onToggleReasoning}
            className="w-full flex items-center justify-between gap-2 text-left"
            aria-expanded={showReasoning}
          >
            <span className="text-[12.5px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Why this message?
            </span>
            <span
              className="flex-shrink-0 transition-transform"
              style={{ transform: showReasoning ? 'rotate(90deg)' : 'rotate(0deg)', color: 'var(--color-muted-fg)' }}
            >
              <Icon d={icons.chevronRight} size={15} />
            </span>
          </button>

          {showReasoning && (
            <div className="mt-4 flex flex-col gap-3">
              <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
                Message reasoning
              </p>
              {[
                { label: 'Company signal', text: reasoning.companySignal, source: reasoning.companySource },
                { label: 'Contact relevance', text: reasoning.contactRelevance, source: 'linkedin.com' },
                { label: 'Opportunity context', text: reasoning.opportunityContext, source: null },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                  <p className="text-[9.5px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
                    {item.label}
                  </p>
                  <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
                    {item.text}
                  </p>
                  {item.source && (
                    <p className="text-[10.5px] mt-1.5" style={{ color: 'var(--color-accent)', fontFamily: 'Inter, sans-serif' }}>
                      {item.source}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Message panel (right in two-column layout) ───────────────────────────────

function MessagePanel({
  contact, subject, message, entry, generatedSubject, generatedMessage,
  onSubjectChange, onMessageChange, onApprove, onRegenerate,
}: {
  contact: CompanyContactView
  subject: string
  message: string
  entry: CompanyEntry
  generatedSubject: string
  generatedMessage: string
  onSubjectChange: (s: string) => void
  onMessageChange: (m: string) => void
  onApprove: () => void
  onRegenerate: () => void
}) {
  const isDirty = subject !== generatedSubject || message !== generatedMessage

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      {/* Header */}
      <div
        className="px-5 xl:px-6 py-4 flex flex-wrap items-center justify-between gap-2"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2.5">
          <p className="text-[14px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Your message
          </p>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
            style={{ background: '#EDE9FE', color: '#7C3AED', border: '1px solid #DDD6FE', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#8B5CF6' }} />
            Draft ready for review
          </span>
        </div>
        <p className="text-[12px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          Nothing has been sent.
        </p>
      </div>

      {/* Email composer */}
      <div className="flex-1 p-5 xl:p-6 flex flex-col gap-0">
        {/* To: */}
        <div className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <span className="text-[12px] font-semibold flex-shrink-0 w-16" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            To:
          </span>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] flex-shrink-0"
              style={{ background: contact.avatarBg, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {contact.avatarInitials}
            </div>
            <span className="text-[13px]" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
              {contact.name}
            </span>
            <span className="text-[12px] hidden sm:inline" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
              · {contact.role}, {entry.name}
            </span>
          </div>
        </div>

        {/* Subject */}
        <div className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <label htmlFor="outreach-subject" className="text-[12px] font-semibold flex-shrink-0 w-16" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Subject:
          </label>
          <input
            id="outreach-subject"
            type="text"
            value={subject}
            onChange={e => onSubjectChange(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[13.5px]"
            style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
            aria-label="Email subject line"
          />
        </div>

        {/* Message body */}
        <div className="flex-1 pt-4">
          <label htmlFor="outreach-message" className="sr-only">Message body</label>
          <textarea
            id="outreach-message"
            value={message}
            onChange={e => onMessageChange(e.target.value)}
            rows={14}
            className="w-full resize-none outline-none bg-transparent text-[13.5px] leading-relaxed"
            style={{
              color: 'var(--color-primary)',
              fontFamily: 'Inter, sans-serif',
              minHeight: '220px',
            }}
            aria-label="Message body"
          />
        </div>
      </div>

      {/* Action bar */}
      <div
        className="px-5 xl:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
        style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-muted)' }}
      >
        <button
          onClick={onApprove}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
          style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
          aria-label="Save this draft"
        >
          Save draft <Icon d={icons.check} size={14} strokeWidth={2.5} />
        </button>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all"
            style={{ color: 'var(--color-muted-fg)', background: 'transparent', border: '1px solid var(--color-border)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-muted-fg)' }}
            aria-label="Regenerate the draft"
          >
            Regenerate
          </button>
          {isDirty && (
            <button
              onClick={() => { onSubjectChange(generatedSubject); onMessageChange(generatedMessage) }}
              className="text-[12.5px] font-medium transition-all"
              style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted-fg)')}
              aria-label="Reset to generated draft"
            >
              Reset to generated draft
            </button>
          )}
        </div>
        <p className="text-[11.5px] ml-auto hidden lg:block" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          AI generated the starting point. You decide what gets sent.
        </p>
      </div>
    </div>
  )
}

// ─── Saved / Approved state ────────────────────────────────────────────────────

function OutreachApproved({ contact, entry, subject, message, onNavigate, onEdit, onUpdate }: {
  contact: CompanyContactView
  entry: CompanyEntry
  subject: string
  message: string
  onNavigate: (tab: string) => void
  onEdit: () => void
  onUpdate: (patch: Partial<CompanyEntry>) => void
}) {
  const [sendPhase, setSendPhase] = useState<'review' | 'sending'>('review')
  const isSent = entry.outreachStage === 'SENT'

  const bannerTitle = isSent ? 'Outreach sent' : 'Draft saved'
  const bannerSubtext = isSent
    ? 'Your outreach has been sent. View the conversation to track replies.'
    : 'Your outreach is ready. Review the final message below before sending.'

  function handleSend() {
    setSendPhase('sending')
    setTimeout(() => {
      const now = new Date()
      const sentAt =
        now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) +
        ' · ' +
        now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      
      const outreachMsg = {
        id: 'msg_' + Date.now(),
        direction: 'outbound' as const,
        kind: 'outreach' as const,
        subject: subject,
        body: message,
        timestamp: sentAt,
      }
      
      onUpdate({
        outreachStage: 'SENT',
        convStage: 'NONE',
        sentAt,
        conversationMessages: [outreachMsg],
      })
      onNavigate('Conversation')
    }, 600)
  }

  return (
    <div className="p-5 sm:p-6 flex flex-col gap-5">
      {/* Approval banner */}
      <div
        className="rounded-xl p-5"
        style={{ background: isSent ? '#EFF6FF' : 'linear-gradient(135deg, #065F46 0%, #047857 100%)', border: isSent ? '1px solid #BFDBFE' : '1px solid #A7F3D0' }}
        role="status"
      >
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: isSent ? '#DBEAFE' : 'rgba(255,255,255,0.15)' }}
          >
            <span style={{ color: isSent ? '#1D4ED8' : 'white' }}>
              <Icon d={isSent ? icons.campaigns : icons.check} size={18} strokeWidth={2.5} />
            </span>
          </div>
          <div>
            <p className="text-[16px] font-bold" style={{ color: isSent ? '#1E3A8A' : 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {bannerTitle}
            </p>
            <p className="text-[13px] mt-0.5" style={{ color: isSent ? '#1E3A8A' : 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>
              {bannerSubtext}
            </p>
          </div>
        </div>
      </div>

      {/* Message preview */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}
        aria-label="Approved message preview"
      >
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-muted)' }}>
          <p className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            Final message
          </p>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <span className="text-[11.5px] font-semibold" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>To:</span>
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded flex items-center justify-center font-bold text-[9px] flex-shrink-0"
                style={{ background: contact.avatarBg, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                {contact.avatarInitials}
              </div>
              <span className="text-[13px]" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
                {contact.name}
              </span>
              <span className="text-[12px] hidden sm:inline" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                · {contact.role}, {entry.name}
              </span>
            </div>
          </div>
          <p className="text-[13.5px] font-semibold mb-3" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
            {subject}
          </p>
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
            {message}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {isSent ? (
          <button
            onClick={() => onNavigate('Conversation')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
            style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
          >
            View conversation <Icon d={icons.arrowRight} size={14} />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={sendPhase === 'sending'}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all relative overflow-hidden group"
            style={{
              background: sendPhase === 'sending' ? 'var(--color-accent)' : 'var(--color-primary)',
              color: 'white',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              opacity: sendPhase === 'sending' ? 0.9 : 1
            }}
            onMouseEnter={e => { if (sendPhase === 'review') e.currentTarget.style.background = '#1E2D4A' }}
            onMouseLeave={e => { if (sendPhase === 'review') e.currentTarget.style.background = 'var(--color-primary)' }}
          >
            <span className={`flex items-center gap-2 transition-transform duration-300 ${sendPhase === 'sending' ? 'translate-y-[-30px]' : ''}`}>
              Send outreach <Icon d={icons.send} size={14} />
            </span>
            <span className={`absolute inset-0 flex items-center justify-center gap-2 transition-transform duration-300 ${sendPhase === 'sending' ? 'translate-y-0' : 'translate-y-[30px]'}`}>
              Sending...
            </span>
          </button>
        )}
        <button
          onClick={() => onNavigate('Contacts')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-medium transition-all"
          style={{ color: 'var(--color-muted-fg)', background: 'var(--color-muted)', border: '1px solid var(--color-border)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.borderColor = 'var(--color-accent)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted-fg)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
        >
          <Icon d={icons.arrowLeft} size={14} /> Back to contacts
        </button>
        {!isSent && (
          <button
            onClick={onEdit}
            className="text-[13px] font-medium transition-all"
            style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#4338CA')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-accent)')}
          >
            Edit draft
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Sent state ───────────────────────────────────────────────────────────────

function OutreachSent({ contact, entry, onNavigate }: {
  contact: CompanyContactView
  entry: CompanyEntry
  onNavigate: (tab: string) => void
}) {
  const hasReply = entry.convStage === 'REPLIED' || entry.convStage === 'ACTIVE' || entry.convStage === 'STOPPED'

  return (
    <div className="p-5 sm:p-6 flex flex-col gap-4">
      <div
        className="rounded-xl p-5 flex items-start gap-4"
        style={hasReply
          ? { background: '#ECFDF5', border: '1px solid #A7F3D0' }
          : { background: '#EDE9FE', border: '1px solid #DDD6FE' }
        }
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={hasReply ? { background: '#10B981', color: 'white' } : { background: '#8B5CF6', color: 'white' }}
        >
          <Icon d={hasReply ? icons.replies : icons.campaigns} size={16} />
        </div>
        <div>
          <p
            className="text-[14px] font-bold"
            style={{ color: hasReply ? '#065F46' : '#4C1D95', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {hasReply ? `Reply received from ${contact.name}` : 'Outreach sent'}
          </p>
          <p
            className="text-[13px] mt-0.5"
            style={{ color: hasReply ? '#047857' : '#6D28D9', fontFamily: 'Inter, sans-serif' }}
          >
            {hasReply
              ? 'A reply was received. The conversation is in progress.'
              : `Outreach was sent to ${contact.name} and is awaiting a reply.`}
          </p>
        </div>
      </div>
      <button
        onClick={() => onNavigate('Conversation')}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all self-start"
        style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
      >
        View conversation <Icon d={icons.arrowRight} size={14} />
      </button>
    </div>
  )
}

// ─── Gate states ──────────────────────────────────────────────────────────────

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

// ─── Main workspace (handles GENERATING/DRAFT/READY states) ──────────────────

function OutreachWorkspace({ entry, contact, onUpdate, onNavigate }: {
  entry: CompanyEntry
  contact: CompanyContactView
  onUpdate: (patch: Partial<CompanyEntry>) => void
  onNavigate: (tab: string) => void
}) {
  const [generating, setGenerating] = useState(false)
  const [regenerateVariant, setRegenerateVariant] = useState(0)
  const [showReasoning, setShowReasoning] = useState(false)

  // Live editing state — initialized from persisted workspace values
  const [subject, setSubject] = useState(entry.outreachSubject ?? '')
  const [message, setMessage] = useState(entry.outreachMessage ?? '')

  // Track "original generated" content for reset/dirty detection
  const [generatedSubject, setGeneratedSubject] = useState(entry.outreachSubject ?? '')
  const [generatedMessage, setGeneratedMessage] = useState(entry.outreachMessage ?? '')

  const reasoning = getOutreachReasoning(entry.name, contact, entry.oppStatus)

  function startGeneration(isRegen = false) {
    const nextVariant = isRegen ? regenerateVariant + 1 : regenerateVariant
    if (isRegen) setRegenerateVariant(nextVariant)
    setGenerating(true)

    setTimeout(() => {
      const draft = generateDraft(entry.id, entry.name, contact, entry.oppStatus, nextVariant)
      setSubject(draft.subject)
      setMessage(draft.message)
      setGeneratedSubject(draft.subject)
      setGeneratedMessage(draft.message)
      setGenerating(false)
      onUpdate({
        outreachStage: 'DRAFT',
        outreachSubject: draft.subject,
        outreachMessage: draft.message,
        lastActivity: 'Just now',
      })
    }, 2600)
  }

  function handleSubjectChange(s: string) {
    setSubject(s)
    onUpdate({ outreachSubject: s })
  }

  function handleMessageChange(m: string) {
    setMessage(m)
    onUpdate({ outreachMessage: m })
  }

  function handleApprove() {
    onUpdate({ outreachStage: 'READY', outreachSubject: subject, outreachMessage: message, lastActivity: 'Just now' })
  }

  function handleEditFromApproved() {
    onUpdate({ outreachStage: 'DRAFT', campaignStage: undefined })
  }



  // NOT_STARTED
  if (entry.outreachStage === 'NOT_STARTED' && !generating) {
    return (
      <OutreachNotStarted
        contact={contact}
        entry={entry}
        onGenerate={() => startGeneration(false)}
        onNavigate={onNavigate}
      />
    )
  }

  // GENERATING
  if (generating) {
    return <GenerationView onComplete={() => {/* handled by setTimeout above */}} />
  }

  // SENT
  if (entry.outreachStage === 'SENT') {
    return <OutreachSent contact={contact} entry={entry} onNavigate={onNavigate} />
  }

  // READY (approved)
  if (entry.outreachStage === 'READY') {
    return (
      <OutreachApproved
        contact={contact}
        entry={entry}
        subject={entry.outreachSubject ?? subject}
        message={entry.outreachMessage ?? message}
        onNavigate={onNavigate}
        onEdit={handleEditFromApproved}
        onUpdate={onUpdate}
      />
    )
  }

  // DRAFT — two-column review layout
  return (
    <div className="flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x" style={{ borderColor: 'var(--color-border)' }}>
      <ContextPanel
        contact={contact}
        entry={entry}
        reasoning={reasoning}
        showReasoning={showReasoning}
        onToggleReasoning={() => setShowReasoning(v => !v)}
      />
      <MessagePanel
        contact={contact}
        subject={subject}
        message={message}
        entry={entry}
        generatedSubject={generatedSubject}
        generatedMessage={generatedMessage}
        onSubjectChange={handleSubjectChange}
        onMessageChange={handleMessageChange}
        onApprove={handleApprove}
        onRegenerate={() => startGeneration(true)}
      />
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function OutreachTab({ entry, onUpdate, onNavigate }: {
  entry: CompanyEntry
  onUpdate: (patch: Partial<CompanyEntry>) => void
  onNavigate: (tab: string) => void
}) {
  // Gate: research not complete
  if (entry.researchStage !== 'COMPLETE') {
    return (
      <GateCard
        icon={icons.search}
        heading="Complete research first"
        body={
          entry.researchStage === 'IN_PROGRESS'
            ? 'Research is currently running. Complete company research before generating outreach.'
            : 'Complete company research before generating outreach. Research provides the evidence needed to draft a credible message.'
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
        body="Establish an opportunity state before generating outreach. Review the research findings and classify this as CONFIRMED or PROACTIVE."
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
        body="Select a contact before generating outreach. Outreach is written for a specific person — their role, evidence, and relevance inform the draft."
        cta={entry.contactStage === 'NOT_DISCOVERED' ? 'Find contacts' : 'Review contacts'}
        onCta={() => onNavigate('Contacts')}
      />
    )
  }

  const contact = getContactData(entry.id, entry.selectedContactId)

  if (!contact) {
    return (
      <GateCard
        icon={icons.contacts}
        heading="Contact not found"
        body="The selected contact could not be found. Return to the Contacts tab to reselect."
        cta="Go to contacts"
        onCta={() => onNavigate('Contacts')}
      />
    )
  }

  return (
    <OutreachWorkspace
      entry={entry}
      contact={contact}
      onUpdate={onUpdate}
      onNavigate={onNavigate}
    />
  )
}

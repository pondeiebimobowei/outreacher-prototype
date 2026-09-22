import { useState } from 'react'
import { Icon, icons } from '../../lib/icons'
import { useAuth } from '../../context/AuthContext'
import { type OppStatus, loadWorkspace } from '../../lib/workspaceStore'

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkspaceTab = 'Research' | 'Contacts'

type OppSummary = {
  whyExists: string
  whatSupports: string
  whatUncertain: string
  whatToDoNext: string
}

type Opening = {
  role: string
  team: string
  location: string
  openingStatus: string
  source: string
  sourceDomain: string
  dateDiscovered: string
  requirements: string[]
}

type ProactiveSignal = {
  type: string
  finding: string
  source: string
}

type ProactiveCase = {
  signals: ProactiveSignal[]
  toStrengthen: string[]
}

type ProfileRelevance = {
  roleMatch: string
  skills: string[]
  goalConnection: string
  conversationAngle: string
}

export type EvidenceItem = {
  finding: string
  source: string
  recency: string
  confidence: 'high' | 'medium' | 'unverified'
}

export type OppData = {
  stateExplanation: string
  lastUpdated: string
  primaryCta: string
  summary: OppSummary
  opening?: Opening
  proactiveCase?: ProactiveCase
  relevance?: ProfileRelevance
  evidence: EvidenceItem[]
  hasResearch: boolean
}

// ─── Prototype data ───────────────────────────────────────────────────────────

export function getOpportunityData(companyId: string, companyName: string, status: OppStatus, hasResearch: boolean): OppData {
  const ws = loadWorkspace()
  const opp = ws.opportunities.find(o => o.companyId === companyId)
  const evidence = ws.evidence.filter(e => e.companyId === companyId)

  if (!hasResearch && !opp && evidence.length === 0) {
    return {
      stateExplanation: 'Research has not been completed. Opportunity classification requires research evidence.',
      lastUpdated: '—',
      primaryCta: 'Review research',
      hasResearch: false,
      summary: {
        whyExists: 'No research evidence is available yet.',
        whatSupports: '—',
        whatUncertain: 'Everything — research has not been completed.',
        whatToDoNext: 'Start research on this company to gather evidence before classifying the opportunity.',
      },
      evidence: [],
    }
  }

  const mappedEvidence: EvidenceItem[] = evidence.map(e => ({
    finding: e.claim,
    source: e.sourceName ?? 'Unknown source',
    recency: e.collectedAt ?? 'Recently',
    confidence: e.classification === 'FACT' ? 'high' : 'medium'
  }))

  const isConfirmed = opp?.type === 'CONFIRMED' || status === 'CONFIRMED'
  const isProactive = opp?.type === 'PROACTIVE' || status === 'PROACTIVE'

  return {
    stateExplanation: isConfirmed
      ? 'An active, relevant opening was found. This is a direct reason to pursue a conversation.'
      : isProactive
        ? 'No confirmed opening found. Company signals provide a credible basis for reaching out before a listing exists.'
        : 'Research did not return sufficient evidence to classify this opportunity responsibly.',
    lastUpdated: 'Recently',
    primaryCta: isConfirmed ? 'Review opening' : isProactive ? 'Build a proactive case' : 'Review research',
    hasResearch: true,
    summary: {
      whyExists: isConfirmed ? `Research found an active listing for ${opp?.roleTitle ?? 'a role'} at ${companyName}.` : isProactive ? `${companyName} is actively investing in engineering.` : 'Research ran but did not find sufficient evidence.',
      whatSupports: evidence.length > 0 ? evidence.slice(0, 2).map(e => e.claim).join(' and ') : 'No specific evidence.',
      whatUncertain: 'The specific team and hiring manager have not been identified. This is the next blocker before outreach.',
      whatToDoNext: isConfirmed ? 'Review the opening details, then proceed to contact discovery to find the right person to reach.' : 'Review the evidence, then proceed to contact discovery.',
    },
    opening: isConfirmed ? {
      role: opp?.roleTitle ?? 'Engineering Role',
      team: 'Engineering',
      location: opp?.roleLocation ?? 'Remote',
      openingStatus: opp?.status ?? 'Active',
      source: opp?.openingSourceUrl ?? `${companyName} Careers`,
      sourceDomain: opp?.openingSourceUrl ? (opp.openingSourceUrl.includes('://') ? new URL(opp.openingSourceUrl).hostname : opp.openingSourceUrl) : 'careers page',
      dateDiscovered: 'Recently',
      requirements: opp?.roleDescription ? [opp.roleDescription] : ['Relevant engineering background'],
    } : undefined,
    proactiveCase: isProactive ? {
      signals: evidence.map(e => ({ type: e.sourceName ?? 'Signal', finding: e.claim, source: e.sourceUrl ?? 'unknown' })),
      toStrengthen: ['Identify a specific relevant engineering contact', 'Find clearer evidence of team ownership'],
    } : undefined,
    relevance: {
      roleMatch: isConfirmed ? 'This opening is a match to your target role.' : 'No confirmed opening. PROACTIVE classification.',
      skills: ['Engineering', 'Infrastructure'],
      goalConnection: 'Aligns with your engineering goals.',
      conversationAngle: 'Reference the collected evidence in your outreach.',
    },
    evidence: mappedEvidence,
  }
}

// ─── Shared constants ─────────────────────────────────────────────────────────

const OPP_CONFIG = {
  CONFIRMED:    { color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981' },
  PROACTIVE:    { color: '#3730A3', bg: '#EEF2FF', border: '#C7D2FE', dot: '#4F46E5' },
  UNCLASSIFIED: { color: '#713F12', bg: '#FEFCE8', border: '#FDE68A', dot: '#F59E0B' },
}

const CONF_CONFIG = {
  high:       { label: 'High confidence', color: '#10B981' },
  medium:     { label: 'Medium confidence', color: '#F59E0B' },
  unverified: { label: 'Unverified', color: '#94A3B8' },
}

const STATUS_LABELS: Record<OppStatus, { headline: string; description: string }> = {
  CONFIRMED:    { headline: 'Confirmed opportunity', description: 'There is actual evidence of a relevant opening at this company.' },
  PROACTIVE:    { headline: 'Proactive opportunity', description: 'No confirmed opening found. Company signals provide a credible basis for outreach before a listing exists.' },
  UNCLASSIFIED: { headline: 'Unclassified', description: 'There is not enough evidence to responsibly classify this opportunity yet.' },
}

// ─── Opportunity Summary ──────────────────────────────────────────────────────

function OpportunitySummary({ summary }: { summary: OppSummary }) {
  const items = [
    { label: 'Why this opportunity exists', text: summary.whyExists },
    { label: 'What evidence supports it', text: summary.whatSupports },
    { label: 'What remains uncertain', text: summary.whatUncertain, muted: true },
    { label: 'What to do next', text: summary.whatToDoNext, accent: true },
  ]
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
      <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-muted)' }}>
        <p className="text-[11.5px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
          Opportunity summary
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x" style={{ borderColor: 'var(--color-border)' }}>
        {items.map((item, i) => (
          <div
            key={i}
            className="px-5 py-4"
            style={item.accent ? { background: 'rgba(79,70,229,0.03)' } : undefined}
          >
            <p className="text-[10.5px] font-bold uppercase tracking-wide mb-2" style={{ color: item.accent ? 'var(--color-accent)' : 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
              {item.label}
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: item.muted ? 'var(--color-muted-fg)' : 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Opening Card (CONFIRMED) ─────────────────────────────────────────────────

function OpeningCard({ opening, companyName }: { opening: Opening; companyName: string }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
      <div
        className="px-5 py-4 flex items-start justify-between gap-4"
        style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-muted)' }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              The opening
            </span>
            <span
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
              style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {opening.openingStatus}
            </span>
          </div>
          <h3 className="text-[17px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {opening.role}
          </h3>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-muted-fg)' }}>
            {companyName} · {opening.team}
          </p>
        </div>
        <a
          href="#"
          onClick={e => e.preventDefault()}
          className="flex items-center gap-1.5 text-[12.5px] font-medium px-3 py-2 rounded-lg flex-shrink-0 transition-all"
          style={{ border: '1px solid var(--color-border)', color: 'var(--color-accent)', background: 'var(--color-card)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.background = '#EEF2FF' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-card)' }}
        >
          View on {opening.source}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x" style={{ borderColor: 'var(--color-border)' }}>
        {[
          { label: 'Location', value: opening.location },
          { label: 'Source', value: opening.source },
          { label: 'Discovered', value: opening.dateDiscovered },
        ].map((row, i) => (
          <div key={i} className="px-5 py-3.5">
            <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>{row.label}</p>
            <p className="text-[13px] font-medium" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>{row.value}</p>
          </div>
        ))}
      </div>
      {opening.requirements.length > 0 && (
        <div className="px-5 py-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            Role signals
          </p>
          <div className="flex flex-wrap gap-2">
            {opening.requirements.map((req, i) => (
              <span key={i} className="text-[12.5px] px-3 py-1.5 rounded-lg" style={{ background: 'var(--color-muted)', color: 'var(--color-primary)', border: '1px solid var(--color-border)', fontFamily: 'Inter, sans-serif' }}>
                {req}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Proactive Case (PROACTIVE) ───────────────────────────────────────────────

function ProactiveCaseCard({ proactiveCase, companyName }: { proactiveCase: ProactiveCase; companyName: string }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Signals */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-muted)' }}>
          <p className="text-[13px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Why pursue {companyName} now
          </p>
          <p className="text-[11.5px] mt-0.5" style={{ color: 'var(--color-muted-fg)' }}>
            Evidence-based signals — not inferred claims
          </p>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
          {proactiveCase.signals.map((signal, i) => (
            <div key={i} className="px-5 py-4 flex items-start gap-3">
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5 whitespace-nowrap"
                style={{ background: '#EEF2FF', color: '#3730A3', border: '1px solid #C7D2FE', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                {signal.type}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
                  {signal.finding}
                </p>
                <a
                  href="#"
                  onClick={e => e.preventDefault()}
                  className="text-[12px] mt-1 inline-flex items-center gap-1 transition-colors"
                  style={{ color: 'var(--color-accent)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#4338CA')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-accent)')}
                >
                  {signal.source}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What would strengthen */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #FDE68A', background: '#FFFBEB' }}>
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #FDE68A' }}>
          <p className="text-[13px] font-bold" style={{ color: '#78350F', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            What would strengthen this case
          </p>
        </div>
        <div className="px-5 py-4">
          <ul className="flex flex-col gap-2.5">
            {proactiveCase.toStrengthen.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[11px] font-bold" style={{ background: '#FDE68A', color: '#78350F', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {i + 1}
                </span>
                <p className="text-[13px] leading-relaxed" style={{ color: '#78350F', fontFamily: 'Inter, sans-serif' }}>{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// ─── Relevance Panel (sidebar) ────────────────────────────────────────────────

function RelevancePanel({ relevance, targetRole, userSkills }: {
  relevance: ProfileRelevance
  targetRole: string
  userSkills: string[]
}) {
  const displaySkills = userSkills.length > 0 ? userSkills.slice(0, 4) : relevance.skills
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
      <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <p className="text-[13px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Why this matters for you
        </p>
      </div>
      <div className="px-5 py-4 flex flex-col gap-4">
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            Target role
          </p>
          <p className="text-[13px] font-medium" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
            {targetRole || 'Not set in your profile'}
          </p>
          <p className="text-[12.5px] mt-1 leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            {relevance.roleMatch}
          </p>
        </div>
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            Relevant skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {displaySkills.map((s, i) => (
              <span key={i} className="text-[11.5px] font-medium px-2.5 py-1 rounded-full" style={{ background: '#EEF2FF', color: '#3730A3', border: '1px solid #C7D2FE', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {s}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            Goal alignment
          </p>
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            {relevance.goalConnection}
          </p>
        </div>
        <div className="p-3.5 rounded-lg" style={{ background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.12)' }}>
          <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            Conversation angle
          </p>
          <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
            {relevance.conversationAngle}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Evidence Traceability ────────────────────────────────────────────────────

function EvidenceTraceability({ evidence }: { evidence: EvidenceItem[] }) {
  if (evidence.length === 0) return null
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
      <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-muted)' }}>
        <p className="text-[13px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Supporting evidence
        </p>
        <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-muted-fg)' }}>
          Conclusion → Evidence → Source
        </p>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
        {evidence.map((item, i) => {
          const conf = CONF_CONFIG[item.confidence]
          return (
            <div key={i} className="px-5 py-3.5 flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: conf.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] leading-snug font-medium" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
                  {item.finding}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <a
                    href="#"
                    onClick={e => e.preventDefault()}
                    className="text-[11.5px] transition-colors"
                    style={{ color: 'var(--color-accent)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#4338CA')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-accent)')}
                  >
                    {item.source}
                  </a>
                  <span style={{ color: 'var(--color-border)' }}>·</span>
                  <span className="text-[11.5px]" style={{ color: 'var(--color-muted-fg)' }}>{item.recency}</span>
                  <span style={{ color: 'var(--color-border)' }}>·</span>
                  <span className="flex items-center gap-1 text-[11.5px]" style={{ color: 'var(--color-muted-fg)' }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: conf.color }} />
                    {conf.label}
                  </span>
                </div>
              </div>
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded flex-shrink-0 cursor-pointer transition-colors"
                style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)', border: '1px solid var(--color-border)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                From research →
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Classification Card ──────────────────────────────────────────────────────

function ClassificationCard({ status, onChangeStart }: { status: OppStatus; onChangeStart: () => void }) {
  const cfg = OPP_CONFIG[status]
  const info = STATUS_LABELS[status]
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
      <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <p className="text-[13px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Classification
        </p>
      </div>
      <div className="px-5 py-4">
        <span
          className="inline-flex items-center gap-1.5 text-[11.5px] font-bold px-3 py-1.5 rounded-full mb-3"
          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.04em' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
          {status}
        </span>
        <p className="text-[12.5px] leading-relaxed mb-4" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          {info.description}
        </p>
        <button
          onClick={onChangeStart}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all"
          style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-muted-fg)' }}
        >
          Change classification
        </button>
      </div>
    </div>
  )
}

// ─── Change Classification Panel ──────────────────────────────────────────────

function ChangeClassificationPanel({ current, onConfirm, onCancel }: {
  current: OppStatus
  onConfirm: (next: OppStatus, reason: string) => void
  onCancel: () => void
}) {
  const [selected, setSelected] = useState<OppStatus>(current)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const options: { status: OppStatus; label: string; description: string }[] = [
    { status: 'CONFIRMED', label: 'Confirmed', description: 'There is actual evidence of a relevant opening.' },
    { status: 'PROACTIVE', label: 'Proactive', description: 'No confirmed opening, but company signals support pursuing this company.' },
    { status: 'UNCLASSIFIED', label: 'Unclassified', description: 'Not enough evidence to classify responsibly.' },
  ]

  function handleConfirm() {
    if (!reason.trim()) { setError('Please explain why you\'re changing the classification.'); return }
    if (selected === current) { setError('The selected classification is the same as the current one.'); return }
    onConfirm(selected, reason.trim())
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-accent)', background: 'var(--color-card)' }}>
      <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <p className="text-[13px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Change classification
        </p>
        <button
          onClick={onCancel}
          className="w-6 h-6 rounded flex items-center justify-center transition-colors"
          style={{ color: 'var(--color-muted-fg)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Icon d={icons.x} size={14} />
        </button>
      </div>
      <div className="px-5 py-4 flex flex-col gap-3">
        {options.map(opt => {
          const cfg = OPP_CONFIG[opt.status]
          const isSelected = selected === opt.status
          const isCurrent = opt.status === current
          return (
            <button
              key={opt.status}
              onClick={() => { setSelected(opt.status); setError('') }}
              className="flex items-start gap-3 p-3 rounded-lg text-left transition-all"
              style={{
                border: isSelected ? `1.5px solid ${cfg.dot}` : '1.5px solid var(--color-border)',
                background: isSelected ? cfg.bg : 'transparent',
              }}
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center"
                style={{ borderColor: isSelected ? cfg.dot : 'var(--color-border)' }}
              >
                {isSelected && <span className="w-2 h-2 rounded-full" style={{ background: cfg.dot }} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold" style={{ color: isSelected ? cfg.color : 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {opt.label}
                  </p>
                  {isCurrent && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}>Current</span>
                  )}
                </div>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                  {opt.description}
                </p>
              </div>
            </button>
          )
        })}

        <div>
          <label className="block text-[11.5px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            Why are you changing this?
          </label>
          <textarea
            value={reason}
            onChange={e => { setReason(e.target.value); setError('') }}
            placeholder="E.g. Found a direct listing while browsing, or evidence is stronger than research suggested."
            rows={3}
            className="w-full px-3 py-2.5 text-[13px] rounded-lg outline-none resize-none transition-all"
            style={{
              border: error ? '1px solid #EF4444' : '1px solid var(--color-border)',
              color: 'var(--color-primary)',
              background: 'var(--color-card)',
              fontFamily: 'Inter, sans-serif',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
            onBlur={e => (e.currentTarget.style.borderColor = error ? '#EF4444' : 'var(--color-border)')}
          />
          {error && <p className="text-[12px] mt-1" style={{ color: '#EF4444' }}>{error}</p>}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
            style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
          >
            Confirm change
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg text-[13.5px] font-medium transition-all"
            style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted-fg)')}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Next Step Handoff ────────────────────────────────────────────────────────

function NextStepHandoff({ status, onNavigate }: { status: OppStatus; onNavigate: (tab: WorkspaceTab) => void }) {
  if (status === 'UNCLASSIFIED') {
    return (
      <div
        className="rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
      >
        <div>
          <p className="text-[14px] font-bold" style={{ color: '#78350F', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            More research needed
          </p>
          <p className="text-[13px] mt-0.5" style={{ color: '#92400E', fontFamily: 'Inter, sans-serif' }}>
            Classification requires more evidence. Run research again to look for new signals.
          </p>
        </div>
        <button
          onClick={() => onNavigate('Research')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all flex-shrink-0"
          style={{ background: '#78350F', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#92400E')}
          onMouseLeave={e => (e.currentTarget.style.background = '#78350F')}
        >
          Continue research <Icon d={icons.arrowRight} size={13} />
        </button>
      </div>
    )
  }
  return (
    <div
      className="rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      style={{ background: 'linear-gradient(135deg, #0E1726 0%, #1E2D4A 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
          Next step
        </p>
        <p className="text-[15px] font-bold" style={{ color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Discover relevant contacts
        </p>
        <p className="text-[13px] mt-0.5" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif' }}>
          {status === 'CONFIRMED'
            ? 'Identify the right person at this company to reach. Use the open listing as context for who to approach.'
            : 'Identify the right person to reach for a proactive conversation. The evidence gathered here will inform the outreach.'}
        </p>
      </div>
      <button
        onClick={() => onNavigate('Contacts')}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all flex-shrink-0"
        style={{ background: 'var(--color-accent)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#4338CA')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
      >
        Find relevant contacts <Icon d={icons.arrowRight} size={13} />
      </button>
    </div>
  )
}

// ─── Unclassified view ────────────────────────────────────────────────────────

function UnclassifiedNoResearch({ companyName, onNavigate }: { companyName: string; onNavigate: (tab: WorkspaceTab) => void }) {
  return (
    <div className="rounded-xl flex flex-col items-center justify-center gap-5 py-16 px-8 text-center" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#FFFBEB', color: '#F59E0B' }}>
        <Icon d={icons.alertCircle} size={22} strokeWidth={1.7} />
      </div>
      <div className="max-w-[400px]">
        <p className="text-[17px] font-bold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Research required before classification
        </p>
        <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          The opportunity cannot be classified without research evidence. Outreacher does not make assumptions about {companyName} without gathering data first.
        </p>
      </div>
      <div className="max-w-[380px] w-full rounded-xl p-4" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
        <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          Once research is complete, Outreacher will classify the opportunity as CONFIRMED, PROACTIVE, or return it as insufficient evidence.
        </p>
      </div>
      <button
        onClick={() => onNavigate('Research')}
        className="flex items-center gap-2 px-6 py-3 rounded-lg text-[14px] font-semibold transition-all"
        style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
      >
        <Icon d={icons.search} size={15} /> Start research
      </button>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function OpportunitiesTab({ id, companyName, status, hasResearch, onNavigate, onStatusChange }: {
  id: string
  companyName: string
  status: OppStatus
  hasResearch: boolean
  onNavigate: (tab: WorkspaceTab) => void
  onStatusChange: (status: OppStatus) => void
}) {
  const auth = useAuth()
  const targetRole = auth.user?.targetRole ?? ''
  const userSkills = auth.user?.skills ?? []

  const data = getOpportunityData(id, companyName, status, hasResearch)

  // If no research has been done and no specific data, show unclassified view
  if (!data.hasResearch) {
    return <UnclassifiedNoResearch companyName={companyName} onNavigate={onNavigate} />
  }

  const [changingClassification, setChangingClassification] = useState(false)
  const [classificationOverride, setClassificationOverride] = useState<OppStatus | null>(null)
  const [changeNote, setChangeNote] = useState<{ from: OppStatus; to: OppStatus; reason: string } | null>(null)

  const displayStatus = classificationOverride ?? status
  const cfg = OPP_CONFIG[displayStatus]

  function handleConfirmChange(next: OppStatus, reason: string) {
    setChangeNote({ from: displayStatus, to: next, reason })
    setClassificationOverride(next)
    setChangingClassification(false)
    onStatusChange(next)
  }

  const isKudaConversation = id === 'kuda'

  return (
    <div className="px-0">
      {/* Classification change banner */}
      {changeNote && (
        <div
          className="flex items-start gap-3 px-5 py-3.5 rounded-xl mb-4"
          style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}
        >
          <span className="text-[#10B981]"><Icon d={icons.checkCircle} size={16} /></span>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: '#065F46', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Classification updated to {changeNote.to}
            </p>
            <p className="text-[12.5px]" style={{ color: '#047857', fontFamily: 'Inter, sans-serif' }}>
              "{changeNote.reason}"
            </p>
          </div>
          <button onClick={() => setChangeNote(null)} className="ml-auto flex-shrink-0" style={{ color: '#10B981' }}>
            <Icon d={icons.x} size={13} />
          </button>
        </div>
      )}

      {/* Opportunity header */}
      <div
        className="rounded-xl p-5 mb-4"
        style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <p className="text-[16px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Opportunity · {companyName}
              </p>
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.04em' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                {displayStatus}
              </span>
            </div>
            <p className="text-[13.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
              {data.stateExplanation}
            </p>
            <p className="text-[12px] mt-1.5" style={{ color: 'var(--color-muted-fg)' }}>
              Last updated {data.lastUpdated}
            </p>
          </div>
          <button
            onClick={() => isKudaConversation ? onNavigate('Contacts') : onNavigate(displayStatus === 'UNCLASSIFIED' ? 'Research' : 'Contacts')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all flex-shrink-0 self-start"
            style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
          >
            {data.primaryCta} <Icon d={icons.arrowRight} size={13} />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-4">
        <OpportunitySummary summary={data.summary} />
      </div>

      {/* Two-column content */}
      <div className="flex flex-col xl:flex-row gap-5 items-start">
        {/* Main column */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* CONFIRMED: Opening card */}
          {displayStatus === 'CONFIRMED' && data.opening && (
            <OpeningCard opening={data.opening} companyName={companyName} />
          )}

          {/* PROACTIVE: Proactive case */}
          {displayStatus === 'PROACTIVE' && data.proactiveCase && (
            <ProactiveCaseCard proactiveCase={data.proactiveCase} companyName={companyName} />
          )}

          {/* UNCLASSIFIED: Explanation card */}
          {displayStatus === 'UNCLASSIFIED' && (
            <div
              className="rounded-xl p-5"
              style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FDE68A', color: '#78350F' }}>
                  <Icon d={icons.alertCircle} size={16} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[14px] font-bold mb-1" style={{ color: '#78350F', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Insufficient evidence for classification
                  </p>
                  <p className="text-[13.5px] leading-relaxed" style={{ color: '#92400E', fontFamily: 'Inter, sans-serif' }}>
                    Research did not return enough evidence to responsibly classify this opportunity. Outreacher will not classify a company without a basis for doing so.
                  </p>
                  <p className="text-[13px] mt-2" style={{ color: '#78350F' }}>
                    Run research again or return once the company signals have changed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Evidence traceability */}
          <EvidenceTraceability evidence={data.evidence} />
        </div>

        {/* Sidebar */}
        <div className="w-full xl:w-[256px] flex-shrink-0 flex flex-col gap-4">
          {data.relevance && (
            <RelevancePanel relevance={data.relevance} targetRole={targetRole} userSkills={userSkills} />
          )}
          {changingClassification ? (
            <ChangeClassificationPanel
              current={displayStatus}
              onConfirm={handleConfirmChange}
              onCancel={() => setChangingClassification(false)}
            />
          ) : (
            <ClassificationCard status={displayStatus} onChangeStart={() => setChangingClassification(true)} />
          )}
        </div>
      </div>

      {/* Next step handoff */}
      <div className="mt-4">
        <NextStepHandoff status={displayStatus} onNavigate={onNavigate} />
      </div>
    </div>
  )
}

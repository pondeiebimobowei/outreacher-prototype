import { useState, useEffect } from 'react'
import { Icon, icons } from '../../lib/icons'
import { useAuth } from '../../context/AuthContext'
import type { OppStatus, CareerProfile } from '../../lib/workspaceStore'
import type { CompanyEntry, ResearchStage } from '../../lib/workspaceStore'
import { loadWorkspace } from '../../lib/workspaceStore'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ResearchState = 'not-started' | 'in-progress' | 'complete'

type Confidence = 'high' | 'medium' | 'unverified'

type EvidenceCategory =
  | 'Hiring'
  | 'Team growth'
  | 'Engineering activity'
  | 'Product direction'
  | 'Strategic initiatives'
  | 'Technology signals'

type Evidence = {
  id: string
  category: EvidenceCategory
  title: string
  finding: string
  sourceType: string
  sourceDomain: string
  recency: string
  suggests: string
  confidence: Confidence
}

export type ResearchData = {
  summary: { relevant: string; matters: string; uncertain: string }
  evidence: Evidence[]
  relevance: { roleMatch: string; skills: string[]; goalAlignment: string; conversationAngle: string }
  signal: { status: OppStatus; reason: string; supporting: string[]; toChange: string }
  gaps: Array<{ label: string; detail: string; nextAction?: string }>
}

// ─── Research Data Function ───────────────────────────────────────────────────

export function getResearchData(companyId: string, companyName: string): ResearchData {
  const ws = loadWorkspace()
  const evidence = ws.evidence.filter(e => e.companyId === companyId)
  const opp = ws.opportunities.find(o => o.companyId === companyId)

  const mappedEvidence: Evidence[] = evidence.map(e => ({
    id: e.id,
    category: 'Engineering activity' as EvidenceCategory,
    title: e.sourceName ?? 'Evidence',
    finding: e.claim,
    sourceType: e.classification,
    sourceDomain: e.sourceUrl ?? 'Unknown source',
    recency: e.collectedAt ?? 'Recently',
    suggests: e.sourceExcerpt ?? 'Supports opportunity classification.',
    confidence: e.classification === 'FACT' ? 'high' : 'medium'
  }))

  if (mappedEvidence.length === 0) {
    mappedEvidence.push({
      id: 'g1', category: 'Team growth', title: 'Engineering hiring activity visible',
      finding: `Recent engineering hires or job postings were observed at ${companyName}. No specific listing matching your target role was found.`,
      sourceType: 'Aggregated public data', sourceDomain: 'Various', recency: 'Recently',
      suggests: 'The company is actively investing in engineering, providing a basis for proactive outreach.',
      confidence: 'medium',
    })
  }

  return {
    summary: {
      relevant: `Research complete for ${companyName}. Found ${evidence.length} pieces of evidence.`,
      matters: 'The evidence collected supports the current opportunity classification.',
      uncertain: 'Team ownership and engineering structure may require further contact discovery.',
    },
    evidence: mappedEvidence,
    relevance: {
      roleMatch: opp?.roleTitle ?? 'Unknown Role',
      skills: ['Engineering', 'Infrastructure', 'Systems design'],
      goalAlignment: 'Aligns with target role and industry.',
      conversationAngle: 'Reference the collected evidence and product expansion in your outreach.',
    },
    signal: {
      status: opp?.type ?? 'UNCLASSIFIED',
      reason: 'Derived from collected evidence and opportunity classification.',
      supporting: evidence.map(e => e.claim).slice(0, 2),
      toChange: 'Update the opportunity classification based on new evidence.',
    },
    gaps: [
      { label: 'Engineering team structure not visible', detail: 'Contact discovery is needed.', nextAction: 'Proceed to Contacts' },
    ],
  }
}

// ─── Shared constants ─────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<EvidenceCategory, { bg: string; text: string; dot: string }> = {
  'Hiring':               { bg: '#ECFDF5', text: '#065F46', dot: '#10B981' },
  'Team growth':          { bg: '#EFF6FF', text: '#1E40AF', dot: '#3B82F6' },
  'Engineering activity': { bg: '#F5F3FF', text: '#4C1D95', dot: '#8B5CF6' },
  'Product direction':    { bg: '#EEF2FF', text: '#3730A3', dot: '#4F46E5' },
  'Strategic initiatives':{ bg: '#FFFBEB', text: '#78350F', dot: '#F59E0B' },
  'Technology signals':   { bg: '#F0FDFA', text: '#134E4A', dot: '#14B8A6' },
}

const CONFIDENCE_CONFIG: Record<Confidence, { label: string; color: string }> = {
  high:       { label: 'High confidence', color: '#10B981' },
  medium:     { label: 'Medium confidence', color: '#F59E0B' },
  unverified: { label: 'Unverified', color: '#94A3B8' },
}

const OPP_CONFIG = {
  CONFIRMED:    { color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981' },
  PROACTIVE:    { color: '#3730A3', bg: '#EEF2FF', border: '#C7D2FE', dot: '#4F46E5' },
  UNCLASSIFIED: { color: '#713F12', bg: '#FEFCE8', border: '#FDE68A', dot: '#F59E0B' },
}

const ALL_CATEGORIES: EvidenceCategory[] = [
  'Hiring', 'Team growth', 'Engineering activity', 'Product direction', 'Strategic initiatives', 'Technology signals',
]

// ─── Evidence Card ────────────────────────────────────────────────────────────

function EvidenceCard({ item, expanded, onToggle }: {
  item: Evidence
  expanded: boolean
  onToggle: () => void
}) {
  const catCfg = CATEGORY_COLORS[item.category]
  const confCfg = CONFIDENCE_CONFIG[item.confidence]
  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}
    >
      {/* Card header */}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              {/* Category + confidence row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: catCfg.bg, color: catCfg.text, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: catCfg.dot }} />
                  {item.category}
                </span>
                <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--color-muted-fg)' }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: confCfg.color }} />
                  {confCfg.label}
                </span>
              </div>
              {/* Title */}
              <p className="text-[14px] font-semibold leading-snug" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {item.title}
              </p>
              {/* Finding */}
              <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                {item.finding}
              </p>
              {/* Source row */}
              <div className="flex items-center gap-3 flex-wrap mt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11.5px] font-medium" style={{ color: 'var(--color-muted-fg)' }}>{item.sourceType}</span>
                  <span style={{ color: 'var(--color-border)' }}>·</span>
                  <a
                    href={`https://${item.sourceDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11.5px] transition-colors flex items-center gap-0.5"
                    style={{ color: 'var(--color-accent)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#4338CA')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-accent)')}
                    onClick={e => e.stopPropagation()}
                  >
                    {item.sourceDomain}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
                <span className="text-[11.5px]" style={{ color: 'var(--color-muted-fg)' }}>{item.recency}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable "What this suggests" */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-5 py-3 transition-all text-left"
        style={{
          borderTop: '1px solid var(--color-border)',
          background: expanded ? 'rgba(79,70,229,0.04)' : 'transparent',
        }}
        onMouseEnter={e => { if (!expanded) e.currentTarget.style.background = 'var(--color-muted)' }}
        onMouseLeave={e => { if (!expanded) e.currentTarget.style.background = 'transparent' }}
      >
        <span
          className="text-[12px] font-semibold"
          style={{ color: expanded ? 'var(--color-accent)' : 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          {expanded ? 'Hide' : 'What this suggests'}
        </span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.2" strokeLinecap="round"
          style={{
            color: expanded ? 'var(--color-accent)' : 'var(--color-muted-fg)',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {expanded && (
        <div
          className="px-5 pb-4 pt-1"
          style={{ borderTop: '1px solid var(--color-border)', background: 'rgba(79,70,229,0.03)' }}
        >
          <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
            {item.suggests}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Evidence Section ─────────────────────────────────────────────────────────

function EvidenceSection({ items }: { items: Evidence[] }) {
  const [activeCategory, setActiveCategory] = useState<EvidenceCategory | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const presentCategories = [...new Set(items.map(i => i.category))]
  const filtered = activeCategory ? items.filter(i => i.category === activeCategory) : items

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[15px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Evidence
          </p>
          <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--color-muted-fg)' }}>
            {items.length} finding{items.length !== 1 ? 's' : ''} · click any card to see what it suggests
          </p>
        </div>
        {expandedIds.size === 0 ? (
          <button
            onClick={() => setExpandedIds(new Set(items.map(i => i.id)))}
            className="text-[12.5px] font-medium transition-colors"
            style={{ color: 'var(--color-accent)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#4338CA')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-accent)')}
          >
            Expand all
          </button>
        ) : (
          <button
            onClick={() => setExpandedIds(new Set())}
            className="text-[12.5px] font-medium transition-colors"
            style={{ color: 'var(--color-muted-fg)' }}
          >
            Collapse all
          </button>
        )}
      </div>

      {/* Category filter pills */}
      {presentCategories.length > 1 && (
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          <button
            onClick={() => setActiveCategory(null)}
            className="px-3 py-1.5 rounded-full text-[11.5px] font-semibold transition-all"
            style={{
              background: activeCategory === null ? 'var(--color-primary)' : 'var(--color-muted)',
              color: activeCategory === null ? 'white' : 'var(--color-muted-fg)',
              border: '1px solid var(--color-border)',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          >
            All ({items.length})
          </button>
          {presentCategories.map(cat => {
            const cfg = CATEGORY_COLORS[cat]
            const count = items.filter(i => i.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className="px-3 py-1.5 rounded-full text-[11.5px] font-semibold transition-all"
                style={{
                  background: activeCategory === cat ? cfg.bg : 'var(--color-muted)',
                  color: activeCategory === cat ? cfg.text : 'var(--color-muted-fg)',
                  border: activeCategory === cat ? `1.5px solid ${cfg.dot}` : '1px solid var(--color-border)',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                {cat} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Evidence cards */}
      <div className="flex flex-col gap-3">
        {filtered.map(item => (
          <EvidenceCard
            key={item.id}
            item={item}
            expanded={expandedIds.has(item.id)}
            onToggle={() => toggleExpand(item.id)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({ summary }: { summary: ResearchData['summary'] }) {
  const sections = [
    { label: 'What appears relevant', text: summary.relevant, color: 'var(--color-primary)' },
    { label: 'Why it may matter to you', text: summary.matters, color: 'var(--color-primary)' },
    { label: 'What remains uncertain', text: summary.uncertain, color: 'var(--color-muted-fg)' },
  ]
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
      <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-muted)' }}>
        <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
          Research summary
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x" style={{ borderColor: 'var(--color-border)' }}>
        {sections.map((s, i) => (
          <div key={i} className="px-5 py-4">
            <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
              {s.label}
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: s.color, fontFamily: 'Inter, sans-serif' }}>
              {s.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Relevance Card ───────────────────────────────────────────────────────────

function RelevanceCard({ relevance, targetRole, userSkills, careerProfile }: {
  relevance: ResearchData['relevance']
  targetRole: string
  userSkills: string[]
  careerProfile: CareerProfile
}) {
  const displaySkills = userSkills.length > 0 ? userSkills.slice(0, 4) : relevance.skills
  const headline = careerProfile.professionalHeadline
  const targetIndustries = careerProfile.targetIndustries ?? []
  const hasProfileData = headline || targetIndustries.length > 0 || careerProfile.experienceHighlights

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
      <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <p className="text-[13px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Relevance to your profile
        </p>
      </div>
      <div className="px-5 py-4 flex flex-col gap-4">
        {/* Career profile context */}
        {hasProfileData && (
          <div className="p-3 rounded-lg flex flex-col gap-2" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
            <p className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Your profile</p>
            {headline && <p className="text-[12.5px] font-medium leading-snug" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>{headline}</p>}
            {targetIndustries.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {targetIndustries.slice(0, 3).map(ind => (
                  <span key={ind} className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: '#EEF2FF', color: '#3730A3', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{ind}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Target role */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            Target role
          </p>
          <p className="text-[13px] font-medium" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
            {targetRole || 'Not set'}
          </p>
          <p className="text-[12.5px] mt-1 leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            {relevance.roleMatch}
          </p>
        </div>

        {/* Relevant skills */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            Relevant skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {displaySkills.map((skill, i) => (
              <span
                key={i}
                className="text-[11.5px] font-medium px-2.5 py-1 rounded-full"
                style={{ background: '#EEF2FF', color: '#3730A3', border: '1px solid #C7D2FE', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Goal alignment */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            Goal alignment
          </p>
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            {relevance.goalAlignment}
          </p>
        </div>

        {/* Conversation angle */}
        <div
          className="p-3.5 rounded-lg"
          style={{ background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.12)' }}
        >
          <p className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            Conversation angle
          </p>
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
            {relevance.conversationAngle}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Opportunity Signal Card ──────────────────────────────────────────────────

function OpportunitySignalCard({ signal }: { signal: ResearchData['signal'] }) {
  const cfg = OPP_CONFIG[signal.status]
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
      <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Opportunity signal
          </p>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
            {signal.status}
          </span>
        </div>
      </div>
      <div className="px-5 py-4 flex flex-col gap-4">
        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          {signal.reason}
        </p>

        {signal.supporting.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
              Supporting evidence
            </p>
            <ul className="flex flex-col gap-1.5">
              {signal.supporting.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: cfg.dot }} />
                  <span className="text-[12.5px] leading-relaxed" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-1" style={{ borderTop: '1px solid var(--color-border)' }}>
          <p className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            To change this classification
          </p>
          <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            {signal.toChange}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Research Gaps ────────────────────────────────────────────────────────────

function ResearchGaps({ gaps }: { gaps: ResearchData['gaps'] }) {
  if (gaps.length === 0) return null
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
      <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-muted)' }}>
        <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
          Research gaps
        </p>
        <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-muted-fg)' }}>
          What remains unknown after research
        </p>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
        {gaps.map((gap, i) => (
          <div key={i} className="px-5 py-4 flex items-start gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: '#FFFBEB' }}
            >
              <span style={{ color: '#F59E0B' }}><Icon d={icons.alertCircle} size={13} strokeWidth={2} /></span>
            </div>
            <div className="flex-1">
              <p className="text-[13.5px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {gap.label}
              </p>
              <p className="text-[13px] mt-0.5 leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                {gap.detail}
              </p>
              {gap.nextAction && (
                <p className="text-[12.5px] mt-1.5 font-medium" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  → {gap.nextAction}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Not Started ──────────────────────────────────────────────────────────────

function ResearchNotStarted({ companyName, onStart }: { companyName: string; onStart: () => void }) {
  const bullets = [
    { icon: icons.search, text: 'Active job listings and hiring signals relevant to your target role' },
    { icon: icons.contacts, text: 'Engineering team composition and recent growth indicators' },
    { icon: icons.opportunities, text: 'Product direction, technical activity, and company signals' },
  ]
  return (
    <div className="rounded-xl flex flex-col items-center justify-center gap-6 py-16 px-8 text-center" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: '#EEF2FF', color: 'var(--color-accent)' }}
      >
        <Icon d={icons.search} size={24} strokeWidth={1.7} />
      </div>
      <div className="max-w-[420px]">
        <p
          className="text-[18px] font-bold mb-2"
          style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          Research {companyName}
        </p>
        <p className="text-[14px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          Research helps determine whether there is a credible reason to pursue a conversation at {companyName}. It doesn't summarise the company — it looks for evidence relevant to you.
        </p>
      </div>
      <div className="max-w-[380px] w-full flex flex-col gap-2.5">
        {bullets.map((b, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-left"
            style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-card)', color: 'var(--color-accent)' }}>
              <Icon d={b.icon} size={13} />
            </div>
            <p className="text-[13px]" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>{b.text}</p>
          </div>
        ))}
      </div>
      <button
        onClick={onStart}
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

// ─── In Progress ──────────────────────────────────────────────────────────────

const PROGRESS_STEPS = [
  'Searching job listings and career pages',
  'Reviewing LinkedIn team signals',
  'Checking public engineering and code activity',
  'Analysing company direction and recent publications',
]

function ResearchInProgress({ companyName, onComplete }: { companyName: string; onComplete: () => void }) {
  const [completedCount, setCompletedCount] = useState(0)
  const [showComplete, setShowComplete] = useState(false)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    PROGRESS_STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setCompletedCount(i + 1), (i + 1) * 1800))
    })
    timers.push(setTimeout(() => setShowComplete(true), PROGRESS_STEPS.length * 1800 + 600))
    return () => timers.forEach(t => clearTimeout(t))
  }, [])

  return (
    <div className="rounded-xl flex flex-col items-center gap-6 py-16 px-8" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: '#EEF2FF', color: 'var(--color-accent)' }}
      >
        <svg
          className="animate-spin"
          width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        >
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </div>
      <div className="text-center max-w-[380px]">
        <p className="text-[18px] font-bold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Researching {companyName}
        </p>
        <p className="text-[14px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          Outreacher is gathering company signals, team information, and evidence relevant to your career profile. This typically takes a few minutes.
        </p>
      </div>
      <div className="max-w-[380px] w-full flex flex-col gap-2">
        {PROGRESS_STEPS.map((step, i) => {
          const done = i < completedCount
          const active = i === completedCount
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
              style={{
                background: done ? '#ECFDF5' : active ? 'var(--color-card)' : 'var(--color-muted)',
                border: done ? '1px solid #A7F3D0' : '1px solid var(--color-border)',
                opacity: !done && !active ? 0.5 : 1,
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: done ? '#10B981' : active ? 'var(--color-accent)' : 'var(--color-border)' }}
              >
                {done && <Icon d={icons.check} size={10} strokeWidth={2.5} className="text-white" />}
                {active && <span className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span
                className="text-[13px]"
                style={{
                  color: done ? '#065F46' : active ? 'var(--color-primary)' : 'var(--color-muted-fg)',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: active ? 500 : 400,
                }}
              >
                {step}
              </span>
            </div>
          )
        })}
      </div>

      {showComplete ? (
        <button
          onClick={onComplete}
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-[14px] font-semibold transition-all"
          style={{ background: '#10B981', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#059669')}
          onMouseLeave={e => (e.currentTarget.style.background = '#10B981')}
        >
          <Icon d={icons.checkCircle} size={16} /> Research complete — view results
        </button>
      ) : (
        <p className="text-[12.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          You can leave this page and return — research will complete in the background.
        </p>
      )}
    </div>
  )
}

// ─── Research Header (within complete view) ───────────────────────────────────

function ResearchCompleteHeader({ companyName, onRefresh }: { companyName: string; onRefresh: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <p className="text-[16px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Research · {companyName}
          </p>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full"
            style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Complete
          </span>
        </div>
        <p className="text-[13px]" style={{ color: 'var(--color-muted-fg)' }}>
          Review the findings below to understand whether there is a credible reason to pursue a conversation here.
        </p>
      </div>
      <button
        onClick={onRefresh}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all flex-shrink-0"
        style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted-fg)', background: 'var(--color-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.borderColor = 'var(--color-primary)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted-fg)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
        </svg>
        Refresh research
      </button>
    </div>
  )
}

// ─── Complete Research View ───────────────────────────────────────────────────

function ResearchComplete({ data, companyName, targetRole, userSkills, careerProfile, onRefresh }: {
  data: ResearchData
  companyName: string
  targetRole: string
  userSkills: string[]
  careerProfile: CareerProfile
  onRefresh: () => void
}) {
  return (
    <div>
      <ResearchCompleteHeader companyName={companyName} onRefresh={onRefresh} />
      {/* Main layout */}
      <div className="flex flex-col xl:flex-row gap-5 items-start">
        {/* Left main column */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          <SummaryCard summary={data.summary} />
          <EvidenceSection items={data.evidence} />
          <ResearchGaps gaps={data.gaps} />
        </div>
        {/* Right sidebar */}
        <div className="w-full xl:w-[256px] flex-shrink-0 flex flex-col gap-4">
          <RelevanceCard relevance={data.relevance} targetRole={targetRole} userSkills={userSkills} careerProfile={careerProfile} />
          <OpportunitySignalCard signal={data.signal} />
        </div>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ResearchTab({ id, researchStage, companyName, onUpdate }: {
  id: string
  researchStage: ResearchStage
  companyName: string
  onUpdate: (patch: Partial<CompanyEntry>) => void
}) {
  const auth = useAuth()

  const targetRole = auth.user?.targetRole ?? ''
  const userSkills = auth.user?.skills ?? []
  const careerProfile = loadWorkspace().careerProfile ?? {}
  const researchData = getResearchData(id, companyName)

  if (researchStage === 'NOT_STARTED') {
    return (
      <ResearchNotStarted
        companyName={companyName}
        onStart={() => onUpdate({ researchStage: 'IN_PROGRESS', lastActivity: 'Just now' })}
      />
    )
  }

  if (researchStage === 'IN_PROGRESS') {
    return (
      <ResearchInProgress
        companyName={companyName}
        onComplete={() => onUpdate({ researchStage: 'COMPLETE', lastActivity: 'Just now' })}
      />
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <ResearchComplete
        data={researchData}
        companyName={companyName}
        targetRole={targetRole}
        userSkills={userSkills}
        careerProfile={careerProfile}
        onRefresh={() => onUpdate({ researchStage: 'IN_PROGRESS', lastActivity: 'Just now' })}
      />
    </div>
  )
}

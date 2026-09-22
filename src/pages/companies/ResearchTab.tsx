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

// ─── Prototype research data ──────────────────────────────────────────────────

export const RESEARCH: Record<string, ResearchData> = {
  stripe: {
    summary: {
      relevant: 'Stripe has an active infrastructure engineering listing and shows consistent team growth in platform roles over the past 60 days.',
      matters: 'Your target role maps directly to the open listing. The evidence supports a CONFIRMED classification — there is a specific, relevant opportunity to respond to.',
      uncertain: 'Team structure ownership is not clear from public sources. The hiring manager has not been identified.',
    },
    evidence: [
      {
        id: 's1', category: 'Hiring', title: 'Active infrastructure engineering listing',
        finding: 'An open role for Senior Infrastructure Engineer was found on Stripe\'s careers page, posted approximately 25 days ago.',
        sourceType: 'Job listing', sourceDomain: 'stripe.com/jobs', recency: '25 days ago',
        suggests: 'A direct, specific reason to reach out. The listing provides context for an outreach message without cold-approach framing.',
        confidence: 'high',
      },
      {
        id: 's2', category: 'Team growth', title: 'Infrastructure team scaling',
        finding: 'LinkedIn activity shows 12+ new engineering hires in the past 60 days, concentrated in infrastructure and reliability roles.',
        sourceType: 'LinkedIn', sourceDomain: 'linkedin.com', recency: '60 days',
        suggests: 'Hiring budget and organizational support are active. Growth at this rate suggests backfill or new-project scaling, not opportunistic hiring.',
        confidence: 'medium',
      },
      {
        id: 's3', category: 'Engineering activity', title: 'Distributed systems work in public repos',
        finding: 'Recent commits to Stripe\'s open-source infrastructure tooling show sustained distributed systems work, including reliability and observability tooling.',
        sourceType: 'GitHub', sourceDomain: 'github.com/stripe', recency: 'Last 2 weeks',
        suggests: 'The team is actively working in areas consistent with your stated background. A specific technical angle is available for outreach.',
        confidence: 'high',
      },
      {
        id: 's4', category: 'Product direction', title: 'Engineering blog: platform investment',
        finding: 'Stripe\'s engineering blog published a post describing ongoing investment in developer-facing infrastructure and platform reliability for 2026.',
        sourceType: 'Blog post', sourceDomain: 'stripe.com/blog', recency: '2 months ago',
        suggests: 'Organizational commitment to the engineering area. Useful context for a message framing around long-term platform contribution.',
        confidence: 'medium',
      },
    ],
    relevance: {
      roleMatch: 'Senior Infrastructure Engineer — direct match to the active listing found.',
      skills: ['Distributed systems', 'Reliability engineering', 'Observability'],
      goalAlignment: 'Your stated goal of working on high-scale infrastructure aligns directly with Stripe\'s active platform investment and the open role described in the listing.',
      conversationAngle: 'The active listing is a strong anchor. You can reference the specific role and align your message to the platform work visible in their engineering blog and public repos.',
    },
    signal: {
      status: 'CONFIRMED',
      reason: 'A current, specific infrastructure engineering listing was found on Stripe\'s careers page. Combined with team growth signals, this supports a CONFIRMED classification.',
      supporting: ['Active listing (25 days old, high confidence)', 'Team growth: 12+ engineering hires in 60 days'],
      toChange: 'Already CONFIRMED. The next step is contact discovery.',
    },
    gaps: [
      { label: 'Hiring manager not identified', detail: 'The listing does not name the team or hiring manager. Outreach will require a contact discovery step before a message can be sent.', nextAction: 'Proceed to Contacts' },
      { label: 'Team structure unclear', detail: 'It is not clear from public sources which specific team this listing belongs to or how the infrastructure org is divided.' },
    ],
  },

  kuda: {
    summary: {
      relevant: 'A confirmed engineering opening at Kuda was found during research. The listing aligned directly with your target role and team signals supported an active hiring phase.',
      matters: 'Research led to a CONFIRMED classification and outreach was initiated. The opportunity is now in active conversation.',
      uncertain: 'This research is historical. An active conversation is underway — further research is not the priority.',
    },
    evidence: [
      {
        id: 'k1', category: 'Hiring', title: 'Engineering role matching target profile',
        finding: 'An open engineering role was found on Kuda\'s careers page at the time of research. The listing described work in the platform team.',
        sourceType: 'Job listing', sourceDomain: 'kuda.com/careers', recency: 'At time of research',
        suggests: 'Provided the direct basis for a CONFIRMED classification. The listing was used as context for the outreach message.',
        confidence: 'high',
      },
      {
        id: 'k2', category: 'Team growth', title: 'Engineering team expansion visible on LinkedIn',
        finding: 'LinkedIn showed 5 new engineering hires at Kuda in the 45 days prior to research. The pattern suggested active hiring rather than isolated backfill.',
        sourceType: 'LinkedIn', sourceDomain: 'linkedin.com', recency: 'At time of research',
        suggests: 'Supported the CONFIRMED classification by indicating the team had both budget and momentum for hiring.',
        confidence: 'medium',
      },
      {
        id: 'k3', category: 'Product direction', title: 'Business banking product investment',
        finding: 'Kuda published announcements about expanding its business banking product, with engineering implications for the platform team.',
        sourceType: 'Press release', sourceDomain: 'techcabal.com', recency: 'At time of research',
        suggests: 'Product expansion creates engineering demand. Useful context for framing the outreach message around contribution to a growing area.',
        confidence: 'medium',
      },
    ],
    relevance: {
      roleMatch: 'Platform engineering — matched the active listing at time of research.',
      skills: ['Backend engineering', 'Platform engineering', 'API design'],
      goalAlignment: 'Kuda\'s product trajectory — expanding into business banking — aligned with your interest in working on financially significant infrastructure.',
      conversationAngle: 'The message referenced the active listing and Kuda\'s product direction. Alex Obi replied — this conversation angle was effective.',
    },
    signal: {
      status: 'CONFIRMED',
      reason: 'An active listing was found and confirmed at the time of research. The opportunity has progressed to an active conversation.',
      supporting: ['Active listing (confirmed at research time)', 'Engineering team growth (5 hires in 45 days)'],
      toChange: 'CONFIRMED. Conversation is active — research is not the current bottleneck.',
    },
    gaps: [
      { label: 'Research is historical', detail: 'This research was completed before outreach. The active conversation with Alex Obi is the current focus — research gaps are no longer the priority.' },
    ],
  },

  vercel: {
    summary: {
      relevant: 'Vercel is actively investing in edge and platform infrastructure. Recent hiring and engineering activity point to a growing team, but no confirmed opening was found for your target role.',
      matters: 'The company\'s technical direction aligns with your background. A proactive approach — reaching out before a listing exists — has a plausible basis here.',
      uncertain: 'No specific opening confirmed. The strength of a proactive reach depends on identifying the right engineering contact.',
    },
    evidence: [
      {
        id: 'v1', category: 'Strategic initiatives', title: 'Edge runtime infrastructure investment',
        finding: 'Vercel\'s engineering blog describes significant investment in edge runtime infrastructure, with multiple posts covering performance, reliability, and developer tooling.',
        sourceType: 'Blog post', sourceDomain: 'vercel.com/blog', recency: '3 months ago',
        suggests: 'The company is building in areas relevant to your engineering background. This gives a specific, non-generic topic to reference in outreach.',
        confidence: 'high',
      },
      {
        id: 'v2', category: 'Team growth', title: 'Infrastructure hires visible on LinkedIn',
        finding: '3 recent infrastructure and platform engineering hires found on LinkedIn in the past 90 days. No public listing matching your target role was found.',
        sourceType: 'LinkedIn', sourceDomain: 'linkedin.com', recency: '90 days',
        suggests: 'Active hiring in adjacent roles suggests the team is growing. No open listing found, but growth at this pace makes future headcount likely.',
        confidence: 'medium',
      },
      {
        id: 'v3', category: 'Engineering activity', title: 'Sustained infrastructure work in public repos',
        finding: 'Vercel\'s public GitHub repositories show sustained recent work on TypeScript and Rust-based infrastructure tooling.',
        sourceType: 'GitHub', sourceDomain: 'github.com/vercel', recency: 'Last 30 days',
        suggests: 'If your background includes systems-level infrastructure work, this is a specific and credible conversation angle that avoids a generic cold-approach.',
        confidence: 'medium',
      },
    ],
    relevance: {
      roleMatch: 'No confirmed opening — PROACTIVE approach supported by team growth and technical signals.',
      skills: ['Platform engineering', 'Edge systems', 'Infrastructure tooling'],
      goalAlignment: 'Vercel\'s technical direction and growth stage align with an interest in working at the infrastructure layer of developer tools.',
      conversationAngle: 'Reference Vercel\'s edge runtime investment directly. A message grounded in their public technical work is more credible than a generic interest approach.',
    },
    signal: {
      status: 'PROACTIVE',
      reason: 'No confirmed opening was found. Evidence of team growth and technical direction supports pursuing this company proactively.',
      supporting: ['Infrastructure hiring activity (3 recent hires)', 'Edge runtime investment (engineering blog)'],
      toChange: 'A CONFIRMED classification would require finding a specific, relevant open listing or direct confirmation of open headcount.',
    },
    gaps: [
      { label: 'No confirmed open role', detail: 'No listing matching your target role was found on Vercel\'s careers page or aggregators.', nextAction: 'Decide whether to proceed proactively' },
      { label: 'Relevant engineering team owner not identified', detail: 'The team structure at Vercel is not clearly visible from public sources. Contact discovery is needed.', nextAction: 'Proceed to Contacts' },
    ],
  },

  paystack: {
    summary: {
      relevant: 'Paystack is in an active growth phase following Stripe\'s acquisition. Engineering team signals and product expansion point to ongoing platform investment.',
      matters: 'No confirmed opening found, but the hiring pace and technical trajectory support a proactive approach for the right engineering profile.',
      uncertain: 'Team structure and engineering leadership are not clearly visible from public sources. No verified opening for your target role.',
    },
    evidence: [
      {
        id: 'p1', category: 'Team growth', title: 'Engineering hiring across multiple teams',
        finding: 'LinkedIn shows 8 new engineering hires at Paystack in the past 90 days, spread across backend, infrastructure, and product engineering.',
        sourceType: 'LinkedIn', sourceDomain: 'linkedin.com', recency: '90 days',
        suggests: 'Active and broad hiring suggests budget availability and organizational growth. No single team is obviously the right target — contact discovery will help narrow this.',
        confidence: 'medium',
      },
      {
        id: 'p2', category: 'Product direction', title: 'Commerce and enterprise product expansion',
        finding: 'Paystack has announced new enterprise and commerce features, indicating product investment beyond the core payments API.',
        sourceType: 'Blog post', sourceDomain: 'paystack.com/blog', recency: '2 months ago',
        suggests: 'Product expansion typically creates engineering demand. This is a credible angle for a proactive message — the company is building, not in maintenance mode.',
        confidence: 'medium',
      },
      {
        id: 'p3', category: 'Technology signals', title: 'Backend and API infrastructure work in public repos',
        finding: 'Paystack\'s engineering team maintains public tooling with recent commits to backend libraries and API infrastructure.',
        sourceType: 'GitHub', sourceDomain: 'github.com/PaystackHQ', recency: 'Last 45 days',
        suggests: 'The team is active and building. If your background includes API infrastructure or backend systems, this creates a specific conversation angle.',
        confidence: 'medium',
      },
    ],
    relevance: {
      roleMatch: 'No confirmed opening — PROACTIVE classification based on team growth and product trajectory.',
      skills: ['Backend engineering', 'API infrastructure', 'Systems design'],
      goalAlignment: 'Paystack\'s position in African fintech infrastructure, combined with active product expansion, aligns with an interest in working on high-impact payments systems.',
      conversationAngle: 'Reference Paystack\'s product expansion and the backend infrastructure visible in their public work. A specific, informed message is more credible than a general expression of interest.',
    },
    signal: {
      status: 'PROACTIVE',
      reason: 'No confirmed opening found for your target role. Engineering team growth and product expansion support a proactive approach.',
      supporting: ['Team growth: 8 engineering hires in 90 days', 'Product expansion announcements'],
      toChange: 'A CONFIRMED classification would require finding a specific, relevant open listing.',
    },
    gaps: [
      { label: 'No confirmed open role', detail: 'No listing matching your target role was found on Paystack\'s careers page.', nextAction: 'Decide whether to proceed proactively' },
      { label: 'Engineering team structure not visible', detail: 'It is not clear from public sources how the engineering team is organised or who leads relevant teams.', nextAction: 'Proceed to Contacts' },
    ],
  },
}

// Generic research result for companies that complete interactively
export function makeGenericResearch(companyName: string): ResearchData {
  return {
    summary: {
      relevant: `Research found engineering team signals and product activity at ${companyName}. No confirmed opening was identified for your target role.`,
      matters: 'The company shows signs of active engineering investment. A proactive approach may be worth considering depending on how closely the team signals match your background.',
      uncertain: 'Team ownership and engineering structure are not clear from public sources. Contact discovery will be needed before outreach can proceed.',
    },
    evidence: [
      {
        id: 'g1', category: 'Team growth', title: 'Engineering hiring activity visible',
        finding: `Recent LinkedIn activity shows new engineering hires at ${companyName} in the past 90 days. No specific listing for your target role was found.`,
        sourceType: 'LinkedIn', sourceDomain: 'linkedin.com', recency: '90 days',
        suggests: 'Active hiring suggests the engineering team is growing. No confirmed opening found, but growth at this rate makes a proactive approach plausible.',
        confidence: 'medium',
      },
      {
        id: 'g2', category: 'Engineering activity', title: 'Engineering work visible in public sources',
        finding: `Public engineering outputs from ${companyName} show active technical work in the past 30 days.`,
        sourceType: 'GitHub', sourceDomain: 'github.com', recency: 'Last 30 days',
        suggests: 'The team is active. If your background aligns with their technical area, this provides a credible conversation angle beyond a generic cold approach.',
        confidence: 'medium',
      },
      {
        id: 'g3', category: 'Product direction', title: 'Product activity and company communication',
        finding: `${companyName} has published product updates and engineering content suggesting active development investment.`,
        sourceType: 'Blog post', sourceDomain: companyName.toLowerCase().replace(' ', '') + '.com',
        recency: '2 months ago',
        suggests: 'Product activity suggests the company is in a building phase. This context is useful for framing outreach around contribution rather than opportunism.',
        confidence: 'medium',
      },
    ],
    relevance: {
      roleMatch: `No confirmed opening — PROACTIVE approach supported by team growth signals at ${companyName}.`,
      skills: ['Software engineering', 'Platform engineering', 'Systems design'],
      goalAlignment: `The company's active engineering investment aligns with a career goal focused on building impactful software systems.`,
      conversationAngle: 'Reference the company\'s visible technical work and product direction rather than making a generic cold approach. Specificity increases response rate.',
    },
    signal: {
      status: 'PROACTIVE',
      reason: 'No confirmed opening was found. Engineering activity and hiring signals support a proactive classification.',
      supporting: ['Engineering hiring activity (LinkedIn)', 'Active product development'],
      toChange: 'A CONFIRMED classification would require finding a specific, relevant open listing.',
    },
    gaps: [
      { label: 'No confirmed open role', detail: 'No listing matching your target role was found.', nextAction: 'Decide whether to proceed proactively' },
      { label: 'Engineering team structure not identified', detail: 'Team ownership is unclear from public sources.', nextAction: 'Proceed to Contacts' },
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
  const researchData = RESEARCH[id] ?? makeGenericResearch(companyName)

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

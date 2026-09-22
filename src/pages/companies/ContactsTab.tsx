import { useState, useEffect } from 'react'
import { Icon, icons } from '../../lib/icons'
import { type CompanyEntry, type OppStatus, loadWorkspace, saveWorkspace } from '../../lib/workspaceStore'

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkspaceTab = 'Research' | 'Opportunities' | 'Outreach'

export type ProtoContact = {
  id: string
  name: string
  role: string
  team: string
  fn: string
  avatarInitials: string
  avatarBg: string
  relevanceSummary: string
  roleRelevance: string
  opportunityConnection: string
  evidence: Array<{ text: string; source: string; recency: string }>
  conversationAngle: string
  known: string[]
  maybeRelevant: string[]
}

// ─── Prototype contact data ───────────────────────────────────────────────────

const CONTACTS: Record<string, ProtoContact[]> = {
  stripe: [
    {
      id: 'priya-mehta',
      name: 'Priya Mehta',
      role: 'Engineering Manager',
      team: 'Platform Infrastructure',
      fn: 'Engineering Leadership',
      avatarInitials: 'PM',
      avatarBg: '#635BFF',
      relevanceSummary: "Manages Stripe's Platform Infrastructure team — the team most likely responsible for the active Senior Infrastructure Engineer opening.",
      roleRelevance: "Priya manages the platform infrastructure org at Stripe. The active listing for Senior Infrastructure Engineer sits within or adjacent to her team.",
      opportunityConnection: 'Active listing: Senior Infrastructure Engineer · Platform Engineering · Posted 25 days ago',
      evidence: [
        { text: 'Engineering Manager, Platform Infrastructure — title listed publicly', source: 'linkedin.com', recency: 'Current' },
        { text: 'Joined Stripe ~3 years ago from Google infrastructure org', source: 'linkedin.com', recency: '3 years ago' },
        { text: 'Named in 2025 Stripe engineering blog post on platform reliability', source: 'stripe.com/blog', recency: '10 months ago' },
      ],
      conversationAngle: "Your message can reference the active listing and demonstrate a direct understanding of platform infrastructure work. An EM approached with relevant specificity responds better than one approached generically.",
      known: [
        'Engineering Manager, Platform Infrastructure at Stripe',
        'Joined from Google engineering ~3 years ago',
        'Named in public Stripe engineering content',
      ],
      maybeRelevant: [
        'Likely manages headcount for the active listing — not confirmed',
        'Exact team scope relative to the listing is not confirmed',
      ],
    },
    {
      id: 'james-wu',
      name: 'James Wu',
      role: 'Staff Infrastructure Engineer',
      team: 'Platform Engineering',
      fn: 'Engineering',
      avatarInitials: 'JW',
      avatarBg: '#0E1726',
      relevanceSummary: "Senior technical contributor in Stripe's platform engineering space. A technical peer to the target role — useful for understanding the team before the EM approach.",
      roleRelevance: "James is a Staff-level engineer in platform engineering — a technical peer to the target role. A peer message can open a different door than approaching the EM directly.",
      opportunityConnection: 'Active GitHub commits to distributed systems components. Infrastructure blog contributor. 5-year tenure.',
      evidence: [
        { text: 'Staff Engineer, Platform — active LinkedIn profile', source: 'linkedin.com', recency: 'Current' },
        { text: 'Recent commits to distributed systems libraries in public repos', source: 'github.com/stripe', recency: 'Last 2 weeks' },
        { text: '5-year tenure at Stripe', source: 'linkedin.com', recency: 'Current' },
      ],
      conversationAngle: "A peer message referencing specific infrastructure work (the distributed systems commits) is more effective than approaching via job listing alone. James can provide context about the team's technical work even if not the hiring decision-maker.",
      known: [
        'Staff Infrastructure Engineer at Stripe',
        '5+ year tenure',
        'Active contributor to public GitHub repositories',
      ],
      maybeRelevant: [
        'May have input on hiring decisions for the relevant team — not confirmed',
        'Team placement relative to the active listing is not confirmed',
      ],
    },
    {
      id: 'sara-okonkwo',
      name: 'Sara Okonkwo',
      role: 'Director of Engineering',
      team: 'Platform',
      fn: 'Engineering Leadership',
      avatarInitials: 'SO',
      avatarBg: '#10B981',
      relevanceSummary: "Leads the broader Platform engineering org. Relevant if the EM approach doesn't progress, or if you want to establish a higher-level relationship.",
      roleRelevance: "Director-level for the platform org. A higher-signal approach for a senior candidate — but requires a stronger case than the listing alone.",
      opportunityConnection: "Likely owns headcount approval for the active listing. Leads the broader platform engineering org including Priya's team.",
      evidence: [
        { text: 'Director of Engineering, Platform — LinkedIn', source: 'linkedin.com', recency: 'Current' },
        { text: 'Speaker at Stripe engineering summit (2025)', source: 'stripe.com/events', recency: '8 months ago' },
        { text: 'Joined Stripe 4 years ago', source: 'linkedin.com', recency: 'Current' },
      ],
      conversationAngle: "Reaching a Director requires a more compelling narrative than approaching an EM. Lead with specificity about the infrastructure domain and the value you bring — the listing alone is insufficient context at this level.",
      known: [
        'Director of Engineering, Platform org',
        '4+ year tenure at Stripe',
        'Public speaker at Stripe engineering events',
      ],
      maybeRelevant: [
        'Exact reporting structure for the active listing is not confirmed',
        'Whether director-level outreach is appropriate for this role level is uncertain',
      ],
    },
  ],

  paystack: [
    {
      id: 'dele-adeyemi',
      name: 'Dele Adeyemi',
      role: 'Engineering Manager',
      team: 'Backend Platform',
      fn: 'Engineering',
      avatarInitials: 'DA',
      avatarBg: '#00C3F7',
      relevanceSummary: "Manages Paystack's Backend Platform team. Given the product expansion direction, this team likely owns the infrastructure most aligned with a platform engineering role.",
      roleRelevance: "Backend Platform EM at Paystack — likely responsible for the team most aligned with your target role, given the product expansion signals.",
      opportunityConnection: "Paystack's commerce and enterprise expansion signals backend platform demand. Dele's team sits in that critical path.",
      evidence: [
        { text: 'Engineering Manager, Backend Platform — LinkedIn', source: 'linkedin.com', recency: 'Current' },
        { text: 'Previously at Interswitch as a backend infrastructure engineer', source: 'linkedin.com', recency: '3 years ago' },
        { text: 'Visible in Paystack Lagos engineering team page', source: 'paystack.com/careers', recency: 'Recent' },
      ],
      conversationAngle: "Reference Paystack's product expansion and the backend platform's role in enabling it. A message demonstrating understanding of their growth challenges is more credible than a generic interest framing.",
      known: [
        'Engineering Manager, Backend Platform at Paystack',
        'Based in Lagos, Nigeria',
        'Prior background in fintech infrastructure (Interswitch)',
      ],
      maybeRelevant: [
        'Specific team headcount plans are not public',
        'Whether Backend Platform has current openings is unconfirmed',
      ],
    },
    {
      id: 'amara-nwosu',
      name: 'Amara Nwosu',
      role: 'Senior Staff Engineer',
      team: 'API Platform',
      fn: 'Engineering',
      avatarInitials: 'AN',
      avatarBg: '#0066FF',
      relevanceSummary: "Senior technical lead for Paystack's API platform — the layer powering the merchant ecosystem. A peer approach with technical substance.",
      roleRelevance: "Staff-level engineer on API Platform. A technical peer route — and a way to understand team structure better before the EM approach.",
      opportunityConnection: 'Active API infrastructure work visible on GitHub. Team growth signals align with platform investment.',
      evidence: [
        { text: 'Senior Staff Engineer, API Platform — LinkedIn', source: 'linkedin.com', recency: 'Current' },
        { text: 'Active commits to PaystackHQ public repositories', source: 'github.com/PaystackHQ', recency: 'Last 45 days' },
        { text: '2-year tenure at Paystack', source: 'linkedin.com', recency: 'Current' },
      ],
      conversationAngle: "Technical specificity matters here. Reference the API infrastructure work or specific challenges in the Paystack developer ecosystem. A peer-to-peer technical message outperforms a role-interest framing.",
      known: [
        'Senior Staff Engineer, API Platform at Paystack',
        'Active open-source contributor',
        '2-year tenure',
      ],
      maybeRelevant: [
        'Scope relative to open positions is not confirmed',
        'Involvement in hiring decisions is unknown',
      ],
    },
  ],

  kuda: [
    {
      id: 'alex-obi',
      name: 'Alex Obi',
      role: 'Head of Engineering',
      team: 'Platform Engineering',
      fn: 'Engineering Leadership',
      avatarInitials: 'AO',
      avatarBg: '#1B4DFF',
      relevanceSummary: "Leads platform engineering at Kuda. This contact is selected — an active reply has been received following your outreach on the confirmed platform opening.",
      roleRelevance: "Alex leads the platform engineering org at Kuda — the team responsible for the confirmed opening. Outreach was targeted to this role directly.",
      opportunityConnection: 'Confirmed opening: Platform Engineer · Kuda · Active at time of research · Conversation now active.',
      evidence: [
        { text: 'Head of Engineering, Platform — confirmed from Kuda careers page', source: 'kuda.com/careers', recency: 'At time of research' },
        { text: 'Engineering leadership profile on LinkedIn', source: 'linkedin.com', recency: 'Current' },
        { text: "Cited in Kuda's engineering team communication", source: 'techcabal.com', recency: '4 months ago' },
      ],
      conversationAngle: "Conversation is active. Alex replied to your outreach. The next step is responding to the reply — not writing a new message.",
      known: [
        'Head of Platform Engineering at Kuda',
        'Replied to your outreach message',
        'Leads the team that posted the relevant listing',
      ],
      maybeRelevant: [
        "Next steps in the conversation are unknown until you read the reply",
        'Whether the listing remains open at this point is not confirmed',
      ],
    },
  ],
}

export function getContactData(companyId: string, contactId: string): ProtoContact | null {
  const list = CONTACTS[companyId] ?? getGenericContacts(companyId)
  return list.find(c => c.id === contactId) ?? null
}

export function getContactsForCompany(companyId: string): ProtoContact[] {
  return CONTACTS[companyId] ?? []
}

function getGenericContacts(companyName: string): ProtoContact[] {
  return [
    {
      id: 'generic-em',
      name: 'Engineering Manager',
      role: 'Engineering Manager',
      team: 'Platform / Backend',
      fn: 'Engineering',
      avatarInitials: 'EM',
      avatarBg: '#4F46E5',
      relevanceSummary: `Likely manages the engineering team most relevant to your target role at ${companyName}.`,
      roleRelevance: 'This is a placeholder contact. For real outreach, verify the specific EM using LinkedIn.',
      opportunityConnection: 'Based on company research and publicly available team structure information.',
      evidence: [
        { text: 'Role inferred from company research and LinkedIn signals', source: 'linkedin.com', recency: 'Recent' },
      ],
      conversationAngle: `Reference specific company signals from your research to make the message credible. Generic outreach to an unknown contact is unlikely to land.`,
      known: ['Role type likely exists based on company size and stage'],
      maybeRelevant: ['Specific name and contact details require LinkedIn research', 'Availability not confirmed'],
    },
  ]
}

// ─── Evidence panel ───────────────────────────────────────────────────────────

function EvidencePanel({ contact, onBackToResearch }: {
  contact: ProtoContact
  onBackToResearch: () => void
}) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}
    >
      <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-muted)' }}>
        <p className="text-[11.5px] font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
          Supporting evidence
        </p>
        <p className="text-[12px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          Contact → Reason → Evidence → Source
        </p>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
        {contact.evidence.map((ev, i) => (
          <div key={i} className="px-5 py-3.5 flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#4F46E5' }} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium leading-snug" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
                {ev.text}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[11.5px]" style={{ color: 'var(--color-accent)' }}>{ev.source}</span>
                <span style={{ color: 'var(--color-border)' }}>·</span>
                <span className="text-[11.5px]" style={{ color: 'var(--color-muted-fg)' }}>{ev.recency}</span>
              </div>
            </div>
            <button
              onClick={onBackToResearch}
              className="text-[11px] font-medium px-2 py-0.5 rounded flex-shrink-0 transition-colors"
              style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)', border: '1px solid var(--color-border)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-muted-fg)' }}
            >
              From research →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Contact review panel ─────────────────────────────────────────────────────

function ContactReview({ contact, companyName, oppStatus, isSelected, onSelect, onBack, onBackToResearch }: {
  contact: ProtoContact
  companyName: string
  oppStatus: OppStatus
  isSelected: boolean
  onSelect: (id: string) => void
  onBack: () => void
  onBackToResearch: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Back + header */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-medium mb-4 transition-colors"
          style={{ color: 'var(--color-muted-fg)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted-fg)')}
        >
          <Icon d={icons.arrowLeft} size={14} /> Back to contacts
        </button>

        {/* Contact identity */}
        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-[16px] flex-shrink-0"
              style={{ background: contact.avatarBg, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {contact.avatarInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-[18px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {contact.name}
                </h2>
                {isSelected && (
                  <span
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  >
                    <Icon d={icons.check} size={11} strokeWidth={2.5} /> Selected
                  </span>
                )}
              </div>
              <p className="text-[13.5px] mt-0.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                {contact.role} · {contact.team}
              </p>
              <a
                href="#"
                onClick={e => e.preventDefault()}
                className="inline-flex items-center gap-1.5 mt-1.5 text-[12px] font-medium transition-colors"
                style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#4338CA')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-accent)')}
              >
                <Icon d={icons.linkedin} size={13} /> View LinkedIn profile
              </a>
            </div>
          </div>
          <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            {contact.relevanceSummary}
          </p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 items-start">
        {/* Main column */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Why this person */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}
          >
            <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-muted)' }}>
              <p className="text-[11.5px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
                Why this person?
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x" style={{ borderColor: 'var(--color-border)' }}>
              {[
                { label: 'Role relevance', text: contact.roleRelevance },
                { label: 'Opportunity connection', text: contact.opportunityConnection },
              ].map((item, i) => (
                <div key={i} className="px-5 py-4">
                  <p className="text-[10.5px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
                    {item.label}
                  </p>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Conversation angle */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'rgba(79,70,229,0.04)', border: '1px solid rgba(79,70,229,0.12)' }}
          >
            <p className="text-[10.5px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
              Conversation angle
            </p>
            <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
              {contact.conversationAngle}
            </p>
          </div>

          {/* Known / Unknown */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}
          >
            <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-muted)' }}>
              <p className="text-[11.5px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
                Known vs inferred
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x" style={{ borderColor: 'var(--color-border)' }}>
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#10B981' }} />
                  <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#10B981', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
                    Known
                  </p>
                </div>
                <ul className="flex flex-col gap-2">
                  {contact.known.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span style={{ color: '#10B981' }} className="flex-shrink-0 mt-0.5"><Icon d={icons.check} size={13} strokeWidth={2.5} /></span>
                      <p className="text-[12.5px] leading-snug" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
                        {item}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#F59E0B' }} />
                  <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#92400E', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
                    Potentially relevant because
                  </p>
                </div>
                <ul className="flex flex-col gap-2">
                  {contact.maybeRelevant.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#F59E0B' }} />
                      <p className="text-[12.5px] leading-snug" style={{ color: '#92400E', fontFamily: 'Inter, sans-serif' }}>
                        {item}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: evidence + select */}
        <div className="w-full xl:w-[256px] flex-shrink-0 flex flex-col gap-4">
          <EvidencePanel contact={contact} onBackToResearch={onBackToResearch} />

          {isSelected ? (
            <div
              className="rounded-xl p-5 flex items-start gap-3"
              style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#10B981', color: 'white' }}>
                <Icon d={icons.check} size={15} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[13.5px] font-bold" style={{ color: '#065F46', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Outreach prepared
                </p>
                <p className="text-[12.5px] mt-0.5" style={{ color: '#047857', fontFamily: 'Inter, sans-serif' }}>
                  {contact.name} is your selected contact. An outreach draft has been created for review.
                </p>
              </div>
            </div>
          ) : (
            <div
              className="rounded-xl p-5"
              style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
            >
              <p className="text-[13px] font-bold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Prepare outreach
              </p>
              <p className="text-[12.5px] mb-4 leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                This creates an outreach draft for {contact.name} that you review before anything is sent. You'll be able to personalise and approve the message.
              </p>
              <button
                onClick={() => onSelect(contact.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
                style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
              >
                Prepare outreach to {contact.name.split(' ')[0]} <Icon d={icons.arrowRight} size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Discovery animation ──────────────────────────────────────────────────────

const DISCOVERY_STEPS = [
  { label: 'Looking for relevant teams', detail: 'Mapping the engineering org structure' },
  { label: 'Identifying likely roles', detail: 'Matching team functions to the target role' },
  { label: 'Evaluating professional relevance', detail: 'Checking LinkedIn and public profiles' },
  { label: 'Gathering supporting evidence', detail: 'Linking contacts to research findings' },
]

function DiscoveryAnimation({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const delays = [0, 1600, 3200, 4600]
    const timers = delays.map((d, i) =>
      setTimeout(() => setStep(i), d),
    )
    const finalTimer = setTimeout(() => {
      setDone(true)
      setTimeout(onComplete, 500)
    }, 5800)
    return () => { timers.forEach(clearTimeout); clearTimeout(finalTimer) }
  }, [onComplete])

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-14 px-8">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: done ? '#ECFDF5' : '#EEF2FF', color: done ? '#10B981' : 'var(--color-accent)' }}
      >
        {done
          ? <Icon d={icons.checkCircle} size={22} strokeWidth={1.7} />
          : <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
        }
      </div>
      <div className="text-center">
        <p className="text-[16px] font-bold mb-1" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {done ? 'Discovery complete' : 'Discovering contacts'}
        </p>
        <p className="text-[13px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          {done ? 'Relevant contacts have been identified.' : 'Finding people relevant to your research and target role.'}
        </p>
      </div>
      <div className="w-full max-w-[360px] flex flex-col gap-2.5">
        {DISCOVERY_STEPS.map((s, i) => {
          const isActive = i === step && !done
          const isComplete = i < step || done
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
              style={{
                background: isActive ? '#EEF2FF' : isComplete ? '#F0FDF4' : 'var(--color-muted)',
                border: isActive ? '1px solid #C7D2FE' : isComplete ? '1px solid #BBF7D0' : '1px solid var(--color-border)',
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: isComplete ? '#10B981' : isActive ? 'var(--color-accent)' : 'var(--color-border)',
                  color: 'white',
                }}
              >
                {isComplete
                  ? <Icon d={icons.check} size={10} strokeWidth={2.5} />
                  : isActive
                  ? <span className="w-2 h-2 rounded-full bg-white" />
                  : null}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[13px] font-medium"
                  style={{
                    color: isComplete ? '#15803D' : isActive ? 'var(--color-accent)' : 'var(--color-muted-fg)',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                  }}
                >
                  {s.label}
                </p>
                {(isActive || isComplete) && (
                  <p className="text-[11.5px]" style={{ color: isComplete ? '#16A34A' : 'rgba(79,70,229,0.7)', fontFamily: 'Inter, sans-serif' }}>
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

// ─── Contact card ─────────────────────────────────────────────────────────────

function ContactCard({ contact, isSelected, onReview }: {
  contact: ProtoContact
  isSelected: boolean
  onReview: () => void
}) {
  return (
    <div
      className="flex items-start gap-4 p-5 rounded-xl transition-all cursor-pointer"
      style={{
        border: isSelected ? '1.5px solid #10B981' : '1px solid var(--color-border)',
        background: isSelected ? '#F0FDF4' : 'var(--color-card)',
      }}
      onClick={onReview}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-accent)' }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-border)' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[14px] flex-shrink-0"
        style={{ background: contact.avatarBg, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      >
        {contact.avatarInitials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <p className="text-[14.5px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {contact.name}
          </p>
          {isSelected && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              <Icon d={icons.check} size={9} strokeWidth={2.5} /> Selected
            </span>
          )}
        </div>
        <p className="text-[12.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          {contact.role} · {contact.team}
        </p>
        <p className="text-[12.5px] mt-2 leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          {contact.relevanceSummary}
        </p>
        <div className="flex items-center gap-3 mt-3">
          <a
            href="#"
            onClick={e => { e.stopPropagation(); e.preventDefault() }}
            className="inline-flex items-center gap-1 text-[12px] font-medium transition-colors"
            style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#4338CA')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-accent)')}
          >
            <Icon d={icons.linkedin} size={13} /> LinkedIn
          </a>
          <span style={{ color: 'var(--color-border)' }}>·</span>
          <span
            className="inline-flex items-center gap-1 text-[11.5px] font-medium"
            style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {contact.evidence.length} evidence {contact.evidence.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 self-center">
        <button
          onClick={e => { e.stopPropagation(); onReview() }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all"
          style={{ background: 'var(--color-muted)', color: 'var(--color-primary)', border: '1px solid var(--color-border)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-primary)' }}
        >
          Review <Icon d={icons.arrowRight} size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── Post-selection state ─────────────────────────────────────────────────────

function ContactSelectedBanner({ contact, onPrepareOutreach }: { contact: ProtoContact; onPrepareOutreach: () => void }) {
  return (
    <div
      className="rounded-xl p-5 mb-4"
      style={{ background: 'linear-gradient(135deg, #0E1726 0%, #1E2D4A 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[14px] flex-shrink-0"
            style={{ background: contact.avatarBg, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {contact.avatarInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[14.5px] font-bold text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {contact.name} selected
              </p>
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(16,185,129,0.2)', color: '#34D399', border: '1px solid rgba(16,185,129,0.3)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                <Icon d={icons.check} size={9} strokeWidth={2.5} /> Contact selected
              </span>
            </div>
            <p className="text-[12.5px] mt-0.5" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif' }}>
              {contact.role} · {contact.team}
            </p>
          </div>
        </div>
        <button
          onClick={onPrepareOutreach}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all flex-shrink-0"
          style={{ background: 'var(--color-accent)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#4338CA')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
        >
          Prepare outreach <Icon d={icons.arrowRight} size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ContactsTab({ entry, onUpdate, onNavigate, companyName }: {
  entry: CompanyEntry
  onUpdate: (patch: Partial<CompanyEntry>) => void
  onNavigate: (tab: WorkspaceTab) => void
  companyName: string
}) {
  const [reviewingId, setReviewingId] = useState<string | null>(null)

  const researchDone = entry.researchStage === 'COMPLETE'
  const oppClassified = entry.oppStatus !== 'UNCLASSIFIED'
  const contactStage = entry.contactStage

  const contacts = CONTACTS[entry.id] ?? getGenericContacts(companyName)
  const reviewingContact = reviewingId ? contacts.find(c => c.id === reviewingId) ?? null : null
  const selectedContact = entry.selectedContactId ? contacts.find(c => c.id === entry.selectedContactId) ?? null : null

  // ── Gate: research not complete ─────────────────────────────────────────────
  if (!researchDone) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 px-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}>
          <Icon d={icons.contacts} size={22} strokeWidth={1.7} />
        </div>
        <div className="text-center max-w-[420px]">
          <p className="text-[17px] font-bold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Complete research first
          </p>
          <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            Contacts become useful once we have enough company evidence to know what team or problem matters.
            {entry.researchStage === 'IN_PROGRESS'
              ? ' Research is currently running — check back once it completes.'
              : ' Start research to gather the company signals needed to identify a relevant contact.'}
          </p>
        </div>
        {entry.researchStage !== 'IN_PROGRESS' && (
          <button
            onClick={() => onNavigate('Research')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
            style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
          >
            Continue research <Icon d={icons.arrowRight} size={14} />
          </button>
        )}
        {entry.researchStage === 'IN_PROGRESS' && (
          <div className="flex items-center gap-2" style={{ color: 'var(--color-muted-fg)' }}>
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
            <span className="text-[13px]" style={{ fontFamily: 'Inter, sans-serif' }}>Research running · Check back shortly</span>
          </div>
        )}
      </div>
    )
  }

  // ── Gate: opportunity not classified ────────────────────────────────────────
  if (!oppClassified) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 px-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#FFFBEB', color: '#F59E0B' }}>
          <Icon d={icons.opportunities} size={22} strokeWidth={1.7} />
        </div>
        <div className="text-center max-w-[420px]">
          <p className="text-[17px] font-bold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Review the opportunity first
          </p>
          <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            Contact discovery should follow opportunity evaluation. Review the research findings and classify this opportunity before identifying who to contact.
          </p>
        </div>
        <button
          onClick={() => onNavigate('Opportunities')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
          style={{ background: '#78350F', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#92400E')}
          onMouseLeave={e => (e.currentTarget.style.background = '#78350F')}
        >
          Review opportunity <Icon d={icons.arrowRight} size={14} />
        </button>
      </div>
    )
  }

  // ── Ready to discover ────────────────────────────────────────────────────────
  if (contactStage === 'NOT_DISCOVERED') {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-14 px-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: '#EEF2FF', color: 'var(--color-accent)' }}
        >
          <Icon d={icons.contacts} size={26} strokeWidth={1.6} />
        </div>
        <div className="text-center max-w-[440px]">
          <p className="text-[18px] font-bold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Find relevant people
          </p>
          <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            Outreacher will identify people at {companyName} who may be worth contacting — based on role relevance, team alignment, and the evidence gathered during research.
          </p>
        </div>
        <div
          className="max-w-[400px] w-full rounded-xl p-4"
          style={{ background: entry.oppStatus === 'CONFIRMED' ? '#ECFDF5' : '#EEF2FF', border: `1px solid ${entry.oppStatus === 'CONFIRMED' ? '#A7F3D0' : '#C7D2FE'}` }}
        >
          <p className="text-[12.5px] leading-relaxed" style={{ color: entry.oppStatus === 'CONFIRMED' ? '#065F46' : '#3730A3', fontFamily: 'Inter, sans-serif' }}>
            {entry.oppStatus === 'CONFIRMED'
              ? 'Confirmed opportunity · Discovery will focus on people relevant to the active opening.'
              : 'Proactive opportunity · Discovery will focus on people most aligned with your target role and company context.'}
          </p>
        </div>
        <button
          onClick={() => onUpdate({ contactStage: 'DISCOVERING', lastActivity: 'Just now' })}
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-[14px] font-semibold transition-all"
          style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
        >
          Find relevant people <Icon d={icons.arrowRight} size={15} />
        </button>
      </div>
    )
  }

  // ── Discovering ──────────────────────────────────────────────────────────────
  if (contactStage === 'DISCOVERING') {
    return (
      <DiscoveryAnimation
        onComplete={() => onUpdate({ contactStage: 'DISCOVERED', lastActivity: 'Just now' })}
      />
    )
  }

  // ── Discovered / Selected ────────────────────────────────────────────────────

  // Show review panel if user clicked "Review" on a contact
  if (reviewingContact) {
    return (
      <div className="p-5">
        <ContactReview
          contact={reviewingContact}
          companyName={companyName}
          oppStatus={entry.oppStatus}
          isSelected={entry.selectedContactId === reviewingContact.id}
          onSelect={(id) => {
            onUpdate({ contactStage: 'SELECTED', selectedContactId: id, lastActivity: 'Just now' })
            // Create a real Outreach record in the store (DRAFT status)
            const ws = loadWorkspace()
            const contact = contacts.find(c => c.id === id)
            if (contact) {
              const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              const outreachId = `outreach-${entry.id}-${id}-${Date.now()}`
              // Resolve Person and PersonCompanyAssociation from canonical store
              const personId = `contact-${id}`
              const assoc = ws.personCompanyAssociations.find(a => a.personId === personId && a.companyId === entry.id)
              const existing = ws.outreaches.find(o => o.companyId === entry.id && o.personId === personId && o.status === 'DRAFT')
              if (!existing) {
                const draft = {
                  id: outreachId,
                  companyId: entry.id,
                  personId,
                  personCompanyAssociationId: assoc?.id,
                  subject: `Re: ${contact.name.split(' ')[0]} — ${entry.name}`,
                  message: `Hi ${contact.name.split(' ')[0]},\n\n[Draft message — edit before sending]\n\nBest,\n[Your name]`,
                  status: 'DRAFT' as const,
                  createdAt: now,
                }
                saveWorkspace({ ...ws, outreaches: [...ws.outreaches, draft] })
              }
            }
          }}
          onBack={() => setReviewingId(null)}
          onBackToResearch={() => onNavigate('Research')}
        />
      </div>
    )
  }

  return (
    <div className="p-5">
      {/* Selected contact banner */}
      {contactStage === 'SELECTED' && selectedContact && (
        <ContactSelectedBanner
          contact={selectedContact}
          onPrepareOutreach={() => onNavigate('Outreach')}
        />
      )}

      {/* List header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[15px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {contacts.length} contact{contacts.length !== 1 ? 's' : ''} identified
          </p>
          <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            {contactStage === 'SELECTED'
              ? 'One contact has been selected for outreach. You can review others or change your selection.'
              : 'Review relevance and evidence for each contact before selecting one for outreach.'}
          </p>
        </div>
        {contactStage === 'SELECTED' && (
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            <Icon d={icons.check} size={11} strokeWidth={2.5} /> Contact selected
          </span>
        )}
      </div>

      {/* Contact cards */}
      <div className="flex flex-col gap-3 mb-5">
        {contacts.map(contact => (
          <ContactCard
            key={contact.id}
            contact={contact}
            isSelected={entry.selectedContactId === contact.id}
            onReview={() => setReviewingId(contact.id)}
          />
        ))}
      </div>

      {/* Evidence traceability note */}
      <div
        className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
        style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}
      >
        <span style={{ color: 'var(--color-muted-fg)' }} className="flex-shrink-0 mt-0.5"><Icon d={icons.link} size={15} /></span>
        <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          Every contact recommendation traces back to research evidence. Use the <strong style={{ color: 'var(--color-primary)' }}>Review</strong> panel to see the specific evidence behind each contact before selecting one.
        </p>
      </div>
    </div>
  )
}

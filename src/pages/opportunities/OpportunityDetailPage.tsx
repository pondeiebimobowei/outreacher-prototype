import { useParams, useNavigate, Link } from 'react-router'
import { Icon, icons } from '../../lib/icons'
import { type OppStatus, loadWorkspace } from '../../lib/workspaceStore'
import { getContactsForCompany, getContactData } from '../companies/ContactsTab'
import { getOpportunityData, type OppData } from '../companies/OpportunitiesTab'
import { LIFECYCLE_CFG } from '../contacts/ContactsPage'

// ─── Status config ────────────────────────────────────────────────────────────

const OPP_CFG: Record<OppStatus, { label: string; color: string; bg: string; border: string; dot: string; desc: string }> = {
  CONFIRMED:    { label: 'Confirmed',    color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981', desc: 'Actual evidence of a relevant opening exists.' },
  PROACTIVE:    { label: 'Proactive',    color: '#3730A3', bg: '#EEF2FF', border: '#C7D2FE', dot: '#4F46E5', desc: 'No confirmed opening, but company signals provide a credible reason to reach out.' },
  UNCLASSIFIED: { label: 'Unclassified', color: '#92400E', bg: '#FEF3C7', border: '#FDE68A', dot: '#F59E0B', desc: 'Not enough evidence yet to classify. Research must be complete before classification.' },
}

const CONFIDENCE_CFG = {
  high:       { label: 'High',       color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0' },
  medium:     { label: 'Medium',     color: '#92400E', bg: '#FEF3C7', border: '#FDE68A' },
  unverified: { label: 'Unverified', color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB' },
}

// ─── Evidence card ────────────────────────────────────────────────────────────

function EvidenceCard({ evidence }: { evidence: OppData['evidence'] }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
      <div className="px-5 py-3.5" style={{ background: 'var(--color-muted)', borderBottom: '1px solid var(--color-border)' }}>
        <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
          Evidence
        </p>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
        {evidence.map((ev, i) => {
          const cfg = CONFIDENCE_CFG[ev.confidence]
          return (
            <div key={i} className="px-5 py-3.5 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] mb-1" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>{ev.finding}</p>
                <p className="text-[12px]" style={{ color: 'var(--color-accent)', fontFamily: 'Inter, sans-serif' }}>{ev.source} · {ev.recency}</p>
              </div>
              <span className="flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {cfg.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Contacts section ─────────────────────────────────────────────────────────

function ContactsSection({ companyId, companyName, entry }: { companyId: string; companyName: string; entry: ReturnType<typeof loadWorkspace>['companies'][0] }) {
  const contacts = getContactsForCompany(companyId)

  if (contacts.length === 0) {
    return (
      <div className="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
          Contacts
        </p>
        <p className="text-[13px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          No contacts discovered yet. <Link to={`/companies/${companyId}`} className="underline" style={{ color: 'var(--color-accent)' }}>Find contacts →</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
      <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: 'var(--color-muted)', borderBottom: '1px solid var(--color-border)' }}>
        <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
          Contacts · {contacts.length}
        </p>
        <Link to="/contacts" className="text-[12px] font-medium" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          View all contacts →
        </Link>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
        {contacts.map(contact => {
          const isSelected = entry.selectedContactId === contact.id
          const lifecycle = isSelected ? (() => {
            // Derive from workspaceStore logic inline
            if (entry.convStage === 'ACTIVE') return 'ACTIVE' as const
            if (entry.convStage === 'REPLIED') return 'REPLIED' as const
            if (entry.outreachStage === 'SENT') return 'CONTACTED' as const
            return 'SELECTED' as const
          })() : 'DISCOVERED' as const
          const lcfg = LIFECYCLE_CFG[lifecycle]

          return (
            <div key={contact.id} className="px-5 py-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: contact.avatarBg, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {contact.avatarInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{contact.name}</p>
                <p className="text-[12px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{contact.role} · {contact.team}</p>
              </div>
              <span className="flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: lcfg.bg, color: lcfg.color, border: `1px solid ${lcfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {lcfg.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const ws = loadWorkspace()
  const entry = ws.companies.find(c => c.id === id)

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Icon d={icons.alertCircle} size={24} />
        <p className="text-[17px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Opportunity not found</p>
        <button onClick={() => navigate('/opportunities')} className="text-[13px] font-medium flex items-center gap-1.5" style={{ color: 'var(--color-accent)' }}>
          <Icon d={icons.arrowLeft} size={13} /> Back to opportunities
        </button>
      </div>
    )
  }

  const oppData = getOpportunityData(entry.id, entry.name, entry.oppStatus, entry.researchStage === 'COMPLETE')
  const cfg = OPP_CFG[entry.oppStatus]

  // Related campaigns
  const relatedCampaigns = ws.campaigns.filter(c => c.members.some(m => m.companyId === entry.id))

  return (
    <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12.5px] mb-5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
        <button onClick={() => navigate('/opportunities')} className="hover:underline" style={{ color: 'var(--color-accent)' }}>Opportunities</button>
        <Icon d={icons.chevronRight} size={12} />
        <span style={{ color: 'var(--color-primary)' }}>{entry.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[16px] font-bold" style={{ background: 'var(--color-muted)', color: 'var(--color-primary)', border: '1px solid var(--color-border)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {entry.name[0]}
          </div>
          <div>
            <h1 className="text-[22px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {entry.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />{cfg.label}
              </span>
              <span className="text-[12px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>Updated {oppData.lastUpdated}</span>
            </div>
          </div>
        </div>
        <Link
          to={`/companies/${entry.id}`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
          style={{ background: 'var(--color-muted)', color: 'var(--color-primary)', border: '1px solid var(--color-border)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          <Icon d={icons.companies} size={14} /> View company
        </Link>
      </div>

      {/* State explanation */}
      <div className="rounded-xl p-4 mb-6 flex items-start gap-3" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: cfg.dot }} />
        <p className="text-[13.5px] leading-relaxed" style={{ color: cfg.color, fontFamily: 'Inter, sans-serif' }}>{oppData.stateExplanation}</p>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col xl:flex-row gap-5">
        {/* Main */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Opening (CONFIRMED) */}
          {oppData.opening && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
              <div className="px-5 py-3.5" style={{ background: 'var(--color-muted)', borderBottom: '1px solid var(--color-border)' }}>
                <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
                  Opening
                </p>
              </div>
              <div className="p-5">
                <p className="text-[17px] font-bold mb-1" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{oppData.opening.role}</p>
                <p className="text-[13.5px] mb-3" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{oppData.opening.team} · {oppData.opening.location}</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em' }}>Status</p>
                    <p className="text-[13px]" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>{oppData.opening.openingStatus}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em' }}>Source</p>
                    <p className="text-[13px]" style={{ color: 'var(--color-accent)', fontFamily: 'Inter, sans-serif' }}>{oppData.opening.sourceDomain}</p>
                  </div>
                </div>
                {oppData.opening.requirements.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {oppData.opening.requirements.map((req, i) => (
                      <span key={i} className="text-[12px] px-2.5 py-1 rounded-full" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{req}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Evidence */}
          {entry.researchStage === 'COMPLETE' && <EvidenceCard evidence={oppData.evidence} />}

          {/* Why this is an opportunity summary */}
          {oppData.summary && (
            <div className="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
                Why this is an opportunity
              </p>
              {[
                { label: 'Reason', text: oppData.summary.whyExists },
                { label: 'What supports it', text: oppData.summary.whatSupports },
                { label: "What's uncertain", text: oppData.summary.whatUncertain },
                { label: 'Next step', text: oppData.summary.whatToDoNext },
              ].map(item => (
                <div key={item.label} className="mb-4 last:mb-0">
                  <p className="text-[11.5px] font-semibold uppercase mb-1" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.05em' }}>{item.label}</p>
                  <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>{item.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Contacts */}
          <ContactsSection companyId={entry.id} companyName={entry.name} entry={entry} />
        </div>

        {/* Sidebar */}
        <div className="xl:w-[280px] flex-shrink-0 flex flex-col gap-4">
          {/* Opportunity status */}
          <div className="rounded-xl p-4" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
              Classification
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full mb-2" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />{cfg.label}
            </span>
            <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{cfg.desc}</p>
            <button
              onClick={() => navigate(`/companies/${entry.id}`)}
              className="mt-3 text-[12px] font-medium flex items-center gap-1"
              style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Change in workspace <Icon d={icons.arrowRight} size={11} />
            </button>
          </div>

          {/* Related campaigns */}
          {relatedCampaigns.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
                Outreach
              </p>
              <div className="flex flex-col gap-3">
                {relatedCampaigns.map(c => (
                  <div key={c.id}>
                    <p className="text-[13px] font-semibold mb-0.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{c.name}</p>
                    <p className="text-[12px] mb-1.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{c.members.length} contact{c.members.length !== 1 ? 's' : ''}</p>
                    <Link to={`/campaigns/${c.id}`} className="inline-flex items-center gap-1 text-[12px] font-semibold" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      View campaign <Icon d={icons.arrowRight} size={11} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active conversation */}
          {entry.outreachStage === 'SENT' && (
            <div className="rounded-xl p-4" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
                Conversation
              </p>
              <p className="text-[12.5px] mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {entry.convStage === 'ACTIVE' ? 'Active — reply received' : entry.convStage === 'REPLIED' ? 'Replied' : 'Outreach sent'}
              </p>
              <Link to={`/conversations/${entry.id}`} className="inline-flex items-center gap-1 text-[12px] font-semibold" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Open conversation <Icon d={icons.arrowRight} size={11} />
              </Link>
            </div>
          )}

          {/* Company link */}
          <div className="rounded-xl p-4" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
            <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
              Company
            </p>
            <p className="text-[13.5px] font-semibold mb-0.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{entry.name}</p>
            <p className="text-[12px] mb-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{entry.domain}</p>
            <Link to={`/companies/${entry.id}`} className="inline-flex items-center gap-1 text-[12.5px] font-semibold" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              View workspace <Icon d={icons.arrowRight} size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

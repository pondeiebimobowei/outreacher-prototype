import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { Icon, icons } from '../../lib/icons'
import { type OppStatus, type CompanyEntry, loadWorkspace } from '../../lib/workspaceStore'
import { getContactsForCompany, getContactData } from '../companies/ContactsTab'

// ─── Status config ────────────────────────────────────────────────────────────

const OPP_CFG: Record<OppStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  CONFIRMED:    { label: 'Confirmed',    color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981' },
  PROACTIVE:    { label: 'Proactive',    color: '#3730A3', bg: '#EEF2FF', border: '#C7D2FE', dot: '#4F46E5' },
  UNCLASSIFIED: { label: 'Unclassified', color: '#92400E', bg: '#FEF3C7', border: '#FDE68A', dot: '#F59E0B' },
}

// ─── Evidence preview ─────────────────────────────────────────────────────────

function getEvidenceSnippet(entry: CompanyEntry): string {
  const ws = loadWorkspace()
  const opp = ws.opportunities.find(o => o.companyId === entry.id)
  
  if (opp) {
    if (opp.roleTitle && opp.roleTitle.trim().length > 0 && opp.roleTitle !== 'Unknown — Research In Progress') {
      return `Active opportunity: ${opp.roleTitle}`
    }
    const evidence = ws.evidence.filter(e => e.companyId === entry.id)
    if (evidence.length > 0) {
      return `${evidence.length} piece${evidence.length > 1 ? 's' : ''} of evidence found`
    }
  }

  return entry.researchStage === 'COMPLETE' ? 'Research complete' : (entry.researchStage === 'IN_PROGRESS' ? 'Research in progress' : 'Research not started')
}

// ─── Opportunity card ─────────────────────────────────────────────────────────

function OppCard({ entry, onClick }: { entry: CompanyEntry; onClick: () => void }) {
  const cfg = OPP_CFG[entry.oppStatus]
  const contacts = getContactsForCompany(entry.id)
  const selectedContact = entry.selectedContactId ? getContactData(entry.id, entry.selectedContactId) : null

  const primaryContacts = selectedContact
    ? [selectedContact]
    : contacts.slice(0, 2)

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-5 transition-all"
      style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold" style={{ background: 'var(--color-muted)', color: 'var(--color-primary)', border: '1px solid var(--color-border)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {entry.name[0]}
          </div>
          <div>
            <p className="text-[15px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{entry.name}</p>
            <p className="text-[12px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{entry.domain}</p>
          </div>
        </div>
        <span
          className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
          {cfg.label}
        </span>
      </div>

      {/* Evidence snippet */}
      <p className="text-[12.5px] mb-3 leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
        {getEvidenceSnippet(entry)}
      </p>

      {/* Contacts */}
      {primaryContacts.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex -space-x-1.5">
            {primaryContacts.map(c => (
              <div
                key={c.id}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border-2"
                style={{ background: c.avatarBg, color: '#fff', borderColor: 'var(--color-card)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                {c.avatarInitials}
              </div>
            ))}
            {contacts.length > 2 && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border-2" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)', borderColor: 'var(--color-card)' }}>
                +{contacts.length - 2}
              </div>
            )}
          </div>
          <p className="text-[12px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            {selectedContact ? `${selectedContact.name} · ${selectedContact.role}` : `${contacts.length} contact${contacts.length !== 1 ? 's' : ''} discovered`}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[11.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          Updated {entry.lastActivity}
        </span>
        <span className="text-[12px] font-medium flex items-center gap-1" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          View opportunity <Icon d={icons.arrowRight} size={11} />
        </span>
      </div>
    </button>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 px-8">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}>
        <Icon d={icons.opportunities} size={26} strokeWidth={1.5} />
      </div>
      <div className="text-center max-w-[400px]">
        <h2 className="text-[20px] font-bold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>No opportunities yet</h2>
        <p className="text-[14px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          Opportunities appear when your company research gives you a credible reason to pursue a relationship.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/companies')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
          style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
        >
          Research a company
        </button>
        <button
          onClick={() => navigate('/companies')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-medium transition-all"
          style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)', border: '1px solid var(--color-border)', fontFamily: 'Inter, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted-fg)')}
        >
          View companies
        </button>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type OppFilter = 'ALL' | OppStatus

export function OpportunitiesPage() {
  const navigate = useNavigate()
  const ws = loadWorkspace()
  const [filter, setFilter] = useState<OppFilter>('ALL')
  const [search, setSearch] = useState('')

  // Only show companies that have started research (have some opportunity context)
  const withOpportunities = ws.companies.filter(e => e.researchStage !== 'NOT_STARTED' || e.oppStatus !== 'UNCLASSIFIED')

  const filtered = withOpportunities.filter(e => {
    const matchFilter = filter === 'ALL' || e.oppStatus === filter
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.domain.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const counts = {
    ALL: withOpportunities.length,
    CONFIRMED: withOpportunities.filter(e => e.oppStatus === 'CONFIRMED').length,
    PROACTIVE: withOpportunities.filter(e => e.oppStatus === 'PROACTIVE').length,
    UNCLASSIFIED: withOpportunities.filter(e => e.oppStatus === 'UNCLASSIFIED').length,
  }

  return (
    <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Opportunities
          </h1>
          <p className="text-[14px] mt-1" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            Evidence-backed reasons to pursue a relationship with each company.
          </p>
        </div>
      </div>

      {withOpportunities.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted-fg)' }}>
                <Icon d={icons.search} size={15} />
              </span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search companies…"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg text-[13.5px] outline-none"
                style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
              />
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {(['ALL', 'CONFIRMED', 'PROACTIVE', 'UNCLASSIFIED'] as OppFilter[]).map(f => {
              const count = counts[f]
              if (f !== 'ALL' && count === 0) return null
              const isActive = filter === f
              const cfg = f !== 'ALL' ? OPP_CFG[f] : null
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="text-[12px] font-semibold px-2.5 py-1 rounded-full transition-all"
                  style={{
                    background: isActive ? (cfg?.bg ?? 'var(--color-primary)') : 'var(--color-muted)',
                    color: isActive ? (cfg?.color ?? 'white') : 'var(--color-muted-fg)',
                    border: isActive ? `1px solid ${cfg?.border ?? 'transparent'}` : '1px solid var(--color-border)',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                  }}
                >
                  {f === 'ALL' ? 'All' : OPP_CFG[f].label} <span className="opacity-70">· {count}</span>
                </button>
              )
            })}
          </div>

          {/* Cards grid */}
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[14px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>No opportunities match your filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(entry => (
                <OppCard key={entry.id} entry={entry} onClick={() => navigate(`/opportunities/${entry.id}`)} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

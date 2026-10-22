import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Icon, icons } from '../../lib/icons'
import {
  type Outreach,
  type OutreachStatus,
  loadWorkspace,
  saveWorkspace,
  DEMO_OUTREACHES,
  DEMO_PEOPLE,
  DEMO_PERSON_COMPANY_ASSOCIATIONS,
  DEMO_CAMPAIGNS,
} from '../../lib/workspaceStore'

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<OutreachStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  DRAFT: { label: 'Draft', color: '#374151', bg: '#F3F4F6', border: '#E5E7EB', dot: '#9CA3AF' },
  READY: { label: 'Ready', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', dot: '#3B82F6' },
  SENT: { label: 'Sent', color: '#5B21B6', bg: '#F5F3FF', border: '#DDD6FE', dot: '#8B5CF6' },
  ARCHIVED: { label: 'Archived', color: '#374151', bg: '#F3F4F6', border: '#E5E7EB', dot: '#6B7280' },
}

type FilterStatus = 'ALL' | OutreachStatus

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onExplore }: { onExplore: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 px-8">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}
      >
        <Icon d={icons.send} size={26} strokeWidth={1.5} />
      </div>
      <div className="text-center max-w-100">
        <h2
          className="text-[20px] font-bold mb-2"
          style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          No outreaches yet
        </h2>
        <p
          className="text-[14px] leading-relaxed"
          style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}
        >
          Outreaches are created when you prepare messages for contacts at companies you're tracking.
        </p>
      </div>
      <button
        onClick={onExplore}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
        style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
      >
        <Icon d={icons.companies} size={14} /> Explore companies
      </button>
    </div>
  )
}

// ─── Outreach card ────────────────────────────────────────────────────────────

type OutreachCardProps = {
  outreach: Outreach
  contactName: string
  contactInitials: string
  contactAvatarBg: string
  contactRole: string
  companyName: string
  campaignName?: string
  onClick: () => void
}

function OutreachCard({
  outreach,
  contactName,
  contactInitials,
  contactAvatarBg,
  contactRole,
  companyName,
  campaignName,
  onClick,
}: OutreachCardProps) {
  const cfg = STATUS_CFG[outreach.status]
  const messagePreview = outreach.message.replace(/\n/g, ' ').slice(0, 80) + (outreach.message.length > 80 ? '…' : '')
  const timestamp = outreach.sentAt ?? outreach.createdAt

  return (
    <div
      className="rounded-xl p-5 cursor-pointer transition-all"
      style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
      onClick={onClick}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--color-accent)'
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(79,70,229,0.07)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--color-border)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Header row: avatar + contact info + status badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-bold shrink-0"
            style={{ background: contactAvatarBg, color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {contactInitials}
          </div>
          <div className="min-w-0">
            <p
              className="text-[14px] font-bold truncate"
              style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {contactName}
            </p>
            <p
              className="text-[12px] truncate"
              style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}
            >
              {contactRole ? `${contactRole} · ` : ''}{companyName}
            </p>
          </div>
        </div>
        <span
          className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
          style={{
            background: cfg.bg,
            color: cfg.color,
            border: `1px solid ${cfg.border}`,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
          {cfg.label}
        </span>
      </div>

      {/* Subject */}
      <p
        className="text-[13px] font-semibold truncate mb-1"
        style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      >
        {outreach.subject}
      </p>

      {/* Message preview */}
      <p
        className="text-[12.5px] leading-relaxed mb-3"
        style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}
      >
        {messagePreview}
      </p>

      {/* Footer row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {campaignName && (
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: '#EEF2FF', color: '#4338CA', border: '1px solid #C7D2FE' }}
            >
              {campaignName}
            </span>
          )}
          {outreach.conversationId && (
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}
            >
              Conversation active
            </span>
          )}
        </div>
        <span
          className="text-[11.5px]"
          style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}
        >
          {timestamp}
        </span>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function OutreachesPage() {
  const navigate = useNavigate()

  const [ws] = useState(() => {
    const w = loadWorkspace()
    if (w.isDemoLoaded) {
      let updated = { ...w }
      let dirty = false
      if (w.outreaches.length === 0) {
        updated = { ...updated, outreaches: DEMO_OUTREACHES }
        dirty = true
      }
      if (w.people.length === 0) {
        updated = { ...updated, people: DEMO_PEOPLE }
        dirty = true
      }
      if (w.personCompanyAssociations.length === 0) {
        updated = { ...updated, personCompanyAssociations: DEMO_PERSON_COMPANY_ASSOCIATIONS }
        dirty = true
      }
      if (w.campaigns.length === 0) {
        updated = { ...updated, campaigns: DEMO_CAMPAIGNS }
        dirty = true
      }
      if (dirty) saveWorkspace(updated)
      return updated
    }
    return w
  })

  const [filter, setFilter] = useState<FilterStatus>('ALL')

  const outreaches = ws.outreaches

  const counts: Record<FilterStatus, number> = {
    ALL: outreaches.length,
    DRAFT: outreaches.filter(o => o.status === 'DRAFT').length,
    READY: outreaches.filter(o => o.status === 'READY').length,
    SENT: outreaches.filter(o => o.status === 'SENT').length,
    ARCHIVED: outreaches.filter(o => o.status === 'ARCHIVED').length,
  }

  const visibleOutreaches = filter === 'ALL'
    ? outreaches
    : outreaches.filter(o => o.status === filter)

  const filters: { key: FilterStatus; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'DRAFT', label: 'Draft' },
    { key: 'READY', label: 'Ready' },
    { key: 'SENT', label: 'Sent' },
  ]

  return (
    <div className="max-w-245 mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-[24px] font-bold tracking-tight"
            style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Outreaches
          </h1>
          <p
            className="text-[14px] mt-1"
            style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}
          >
            All outreach messages across your pipeline.
          </p>
        </div>
        <button
          disabled
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold opacity-40 cursor-not-allowed"
          style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          <Icon d={icons.plus} size={14} /> New outreach
        </button>
      </div>

      {outreaches.length === 0 ? (
        <EmptyState onExplore={() => navigate('/companies')} />
      ) : (
        <>
          {/* Status filter pills */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {filters.map(f => {
              const isActive = filter === f.key
              const count = counts[f.key]
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className="flex items-center gap-1.5 text-[12.5px] font-semibold px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                    color: isActive ? 'white' : 'var(--color-muted-fg)',
                    border: isActive ? '1px solid transparent' : '1px solid var(--color-border)',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                  }}
                >
                  {f.label}
                  <span
                    className="text-[11px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--color-border)',
                      color: isActive ? 'white' : 'var(--color-muted-fg)',
                    }}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {visibleOutreaches.length === 0 ? (
            <div
              className="rounded-xl p-8 text-center"
              style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
            >
              <p
                className="text-[14px]"
                style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}
              >
                No {filter.toLowerCase()} outreaches.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleOutreaches.map(outreach => {
                const contact = ws.people.find(c => c.id === outreach.personId)
                const company = ws.companies.find(c => c.id === outreach.companyId)
                const assoc = outreach.personCompanyAssociationId
                  ? ws.personCompanyAssociations.find(a => a.id === outreach.personCompanyAssociationId)
                  : ws.personCompanyAssociations.find(a => a.personId === outreach.personId && a.companyId === outreach.companyId)
                const campaign = outreach.campaignId
                  ? ws.campaigns.find(c => c.id === outreach.campaignId)
                  : undefined

                const contactName = contact
                  ? `${contact.firstName} ${contact.lastName}`
                  : outreach.personId
                const contactInitials = contact?.avatarInitials ?? contactName.slice(0, 2).toUpperCase()
                const contactAvatarBg = contact?.avatarBg ?? '#6B7280'
                const contactRole = assoc?.title ?? ''
                const companyName = company?.name ?? outreach.companyId

                return (
                  <OutreachCard
                    key={outreach.id}
                    outreach={outreach}
                    contactName={contactName}
                    contactInitials={contactInitials}
                    contactAvatarBg={contactAvatarBg}
                    contactRole={contactRole}
                    companyName={companyName}
                    campaignName={campaign?.name}
                    onClick={() => navigate(`/outreaches/${outreach.id}`)}
                  />
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

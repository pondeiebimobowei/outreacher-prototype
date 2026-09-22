import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { Icon, icons } from '../../lib/icons'
import {
  type CompanyEntry,
  type ConvStage,
  loadWorkspace,
  deriveRelationshipStatus,
  CONV_OUTCOME_LABELS,
} from '../../lib/workspaceStore'
import { getContactData } from '../companies/ContactsTab'

// ─── Status config ────────────────────────────────────────────────────────────

const CONV_STATE_CFG: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  ACTIVE:         { label: 'Active',          color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', dot: '#059669' },
  REPLIED:        { label: 'Replied',          color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981' },
  FOLLOW_UP_DUE:  { label: 'Follow-up due',   color: '#92400E', bg: '#FEF3C7', border: '#FDE68A', dot: '#F59E0B' },
  NONE:           { label: 'Sent',             color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', dot: '#3B82F6' },
  STOPPED:        { label: 'Stopped',          color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB', dot: '#9CA3AF' },
  NURTURE:        { label: 'Nurture',          color: '#92400E', bg: '#FFF7ED', border: '#FED7AA', dot: '#F59E0B' },
  OUTCOME:        { label: 'Outcome recorded', color: '#374151', bg: '#F3F4F6', border: '#E5E7EB', dot: '#6B7280' },
}

function getConvStateKey(entry: CompanyEntry): string {
  if (entry.convOutcome) return 'OUTCOME'
  if (entry.convStage === 'STOPPED') return 'STOPPED'
  if (entry.followUpStage === 'DUE' || entry.followUpStage === 'DRAFT') return 'FOLLOW_UP_DUE'
  return entry.convStage
}

function getNextAction(entry: CompanyEntry): string {
  if (entry.convOutcome) return 'View outcome'
  if (entry.convStage === 'ACTIVE') return 'Continue conversation'
  if (entry.convStage === 'REPLIED') return 'View reply'
  if (entry.convStage === 'STOPPED') return 'View journey'
  if (entry.followUpStage === 'DUE') return 'Review follow-up'
  if (entry.followUpStage === 'DRAFT') return 'Review draft'
  return 'View conversation'
}

function getLastInteraction(entry: CompanyEntry): string {
  if (entry.convStage === 'ACTIVE') return `Active reply · ${entry.lastActivity}`
  if (entry.convStage === 'REPLIED') return `Reply received · ${entry.lastActivity}`
  if (entry.convStage === 'STOPPED') return `Conversation stopped · ${entry.lastActivity}`
  if (entry.convOutcome) return `Outcome: ${CONV_OUTCOME_LABELS[entry.convOutcome]}`
  return entry.sentAt ? `Sent ${entry.sentAt}` : `Sent · ${entry.lastActivity}`
}

// ─── Conversation row ─────────────────────────────────────────────────────────

function ConvRow({ entry }: { entry: CompanyEntry }) {
  const navigate = useNavigate()
  const contact = entry.selectedContactId ? getContactData(entry.id, entry.selectedContactId) : null
  const lastMsg = entry.conversationMessages?.at(-1)
  const stateKey = getConvStateKey(entry)
  const cfg = CONV_STATE_CFG[stateKey] ?? CONV_STATE_CFG.NONE

  return (
    <button
      onClick={() => navigate(`/conversations/${entry.id}`)}
      className="w-full text-left px-4 sm:px-5 py-4 flex items-start gap-3.5 transition-all"
      style={{ borderBottom: '1px solid var(--color-border)' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[12px] flex-shrink-0"
        style={{ background: contact?.avatarBg ?? 'var(--color-muted)', color: contact ? '#fff' : 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif', border: contact ? 'none' : '1px solid var(--color-border)' }}
      >
        {contact?.avatarInitials ?? entry.name[0]}
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <span className="text-[14px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {contact?.name ?? 'Contact'}
            </span>
            <span className="text-[13px] ml-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
              {contact?.role ?? ''} · {entry.name}
            </span>
          </div>
          <span
            className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
            {cfg.label}
          </span>
        </div>
        {lastMsg && (
          <p className="text-[12.5px] mb-1 truncate" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            {lastMsg.direction === 'inbound' ? '← ' : '→ '}{lastMsg.body.slice(0, 120)}
          </p>
        )}
        <div className="flex items-center justify-between gap-4">
          <p className="text-[12px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            {getLastInteraction(entry)}
          </p>
          <span className="text-[12px] font-medium flex-shrink-0 flex items-center gap-1" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {getNextAction(entry)} <Icon d={icons.arrowRight} size={11} />
          </span>
        </div>
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
        <Icon d={icons.replies} size={26} strokeWidth={1.5} />
      </div>
      <div className="text-center max-w-[400px]">
        <h2 className="text-[20px] font-bold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>No conversations yet</h2>
        <p className="text-[14px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          Conversations appear here once you've sent outreach to a contact. The complete message history and relationship timeline live here.
        </p>
      </div>
      <button
        onClick={() => navigate('/companies')}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
        style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
      >
        View companies
      </button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type ConvFilter = 'ALL' | 'ACTIVE' | 'REPLIED' | 'FOLLOW_UP_DUE' | 'STOPPED' | 'OUTCOME'

export function ConversationsPage() {
  const ws = loadWorkspace()
  const [filter, setFilter] = useState<ConvFilter>('ALL')
  const [search, setSearch] = useState('')

  // All entries with outreach sent
  const convEntries = ws.companies.filter(e => e.outreachStage === 'SENT')

  const filtered = convEntries.filter(e => {
    const contact = e.selectedContactId ? getContactData(e.id, e.selectedContactId) : null
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (contact?.name ?? '').toLowerCase().includes(search.toLowerCase())
    const stateKey = getConvStateKey(e)
    const matchFilter =
      filter === 'ALL' ||
      (filter === 'ACTIVE' && stateKey === 'ACTIVE') ||
      (filter === 'REPLIED' && stateKey === 'REPLIED') ||
      (filter === 'FOLLOW_UP_DUE' && stateKey === 'FOLLOW_UP_DUE') ||
      (filter === 'STOPPED' && stateKey === 'STOPPED') ||
      (filter === 'OUTCOME' && stateKey === 'OUTCOME')
    return matchSearch && matchFilter
  })

  const counts: Record<ConvFilter, number> = {
    ALL: convEntries.length,
    ACTIVE: convEntries.filter(e => getConvStateKey(e) === 'ACTIVE').length,
    REPLIED: convEntries.filter(e => getConvStateKey(e) === 'REPLIED').length,
    FOLLOW_UP_DUE: convEntries.filter(e => getConvStateKey(e) === 'FOLLOW_UP_DUE').length,
    STOPPED: convEntries.filter(e => getConvStateKey(e) === 'STOPPED').length,
    OUTCOME: convEntries.filter(e => getConvStateKey(e) === 'OUTCOME').length,
  }

  const FILTER_LABELS: Record<ConvFilter, string> = {
    ALL: 'All',
    ACTIVE: 'Active',
    REPLIED: 'Replied',
    FOLLOW_UP_DUE: 'Follow-up due',
    STOPPED: 'Stopped',
    OUTCOME: 'Outcome recorded',
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[24px] font-bold tracking-tight" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Conversations
        </h1>
        <p className="text-[14px] mt-1" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          All outreach conversations, follow-ups, and replies — tracked by relationship.
        </p>
      </div>

      {convEntries.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted-fg)' }}>
                <Icon d={icons.search} size={15} />
              </span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by contact or company…"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg text-[13.5px] outline-none"
                style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
              />
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(Object.keys(FILTER_LABELS) as ConvFilter[]).map(f => {
              const count = counts[f]
              if (f !== 'ALL' && count === 0) return null
              const isActive = filter === f
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="text-[12px] font-semibold px-2.5 py-1 rounded-full transition-all"
                  style={{
                    background: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                    color: isActive ? 'white' : 'var(--color-muted-fg)',
                    border: isActive ? 'none' : '1px solid var(--color-border)',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                  }}
                >
                  {FILTER_LABELS[f]} {count > 0 && <span className="opacity-70">· {count}</span>}
                </button>
              )
            })}
          </div>

          {/* List */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
            {filtered.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-[14px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>No conversations match your filter.</p>
              </div>
            ) : (
              filtered.map(entry => <ConvRow key={entry.id} entry={entry} />)
            )}
          </div>
        </>
      )}
    </div>
  )
}

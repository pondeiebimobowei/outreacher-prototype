import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Icon, icons } from '../../lib/icons'
import {
  type Person,
  type PersonCompanyAssociation,
  type CompanyEntry,
  type ContactLifecycleState,
  type RelationshipStatus,
  loadWorkspace,
  deriveContactLifecycle,
  deriveRelationshipStatus,
  CONV_OUTCOME_LABELS,
} from '../../lib/workspaceStore'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContactListItem = {
  personId: string
  person: Person
  primaryAssoc: PersonCompanyAssociation
  primaryEntry: CompanyEntry
  allAssocs: PersonCompanyAssociation[]
  isSelected: boolean
  lifecycle: ContactLifecycleState
  relStatus: RelationshipStatus | null
}

// ─── Config ───────────────────────────────────────────────────────────────────

export const LIFECYCLE_CFG: Record<ContactLifecycleState, { label: string; color: string; bg: string; border: string; dot: string }> = {
  DISCOVERED: { label: 'Discovered', color: '#374151', bg: '#F3F4F6', border: '#E5E7EB', dot: '#9CA3AF' },
  SELECTED: { label: 'Selected', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', dot: '#3B82F6' },
  CONTACTED: { label: 'Contacted', color: '#5B21B6', bg: '#F5F3FF', border: '#DDD6FE', dot: '#7C3AED' },
  REPLIED: { label: 'Replied', color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981' },
  ACTIVE: { label: 'Active', color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', dot: '#059669' },
  NURTURE: { label: 'Nurture', color: '#92400E', bg: '#FFF7ED', border: '#FED7AA', dot: '#F59E0B' },
  CLOSED: { label: 'Closed', color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB', dot: '#9CA3AF' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLastInteraction(entry: CompanyEntry, isSelected: boolean): string {
  if (!isSelected) return 'Discovered'
  if (entry.convStage === 'ACTIVE') return 'Replied · Conversation active'
  if (entry.convStage === 'REPLIED') return 'Replied — awaiting response'
  if (entry.convStage === 'STOPPED') return 'Conversation stopped'
  if (entry.convOutcome) return `Outcome recorded · ${CONV_OUTCOME_LABELS[entry.convOutcome]}`
  if (entry.outreachStage === 'SENT') return `Outreach sent · ${entry.sentAt ?? 'Awaiting reply'}`
  if (entry.contactStage === 'SELECTED') return 'Selected for outreach'
  return `Discovered · ${entry.lastActivity}`
}

function getNextAction(lifecycle: ContactLifecycleState, isSelected: boolean): string {
  if (!isSelected) return 'Review contact'
  if (lifecycle === 'ACTIVE') return 'Continue conversation'
  if (lifecycle === 'REPLIED') return 'View reply'
  if (lifecycle === 'CONTACTED') return 'Awaiting reply'
  if (lifecycle === 'NURTURE') return 'Reconnect when ready'
  if (lifecycle === 'CLOSED') return 'View journey'
  if (lifecycle === 'SELECTED') return 'Prepare outreach'
  return 'Review contact'
}

function buildContactList(
  people: Person[],
  assocs: PersonCompanyAssociation[],
  companies: CompanyEntry[],
): ContactListItem[] {
  const companyMap = new Map(companies.map(c => [c.id, c]))
  const items: ContactListItem[] = []

  for (const person of people) {
    const personAssocs = assocs.filter(a => a.personId === person.id)
    if (personAssocs.length === 0) continue

    // Derive legacy short ID used by CompanyEntry.selectedContactId
    const legacyId = person.id.replace(/^contact-/, '')

    // Pick primary association — prefer the one where the company entry has this person selected
    const primaryAssoc =
      personAssocs.find(a => {
        const entry = companyMap.get(a.companyId)
        return entry?.selectedContactId === legacyId
      }) ?? personAssocs[0]

    const primaryEntry = companyMap.get(primaryAssoc.companyId)
    if (!primaryEntry) continue

    const isSelected = primaryEntry.selectedContactId === legacyId
    const lifecycle = isSelected ? deriveContactLifecycle(primaryEntry) : 'DISCOVERED'
    const relStatus = isSelected ? deriveRelationshipStatus(primaryEntry) : null

    items.push({ personId: person.id, person, primaryAssoc, primaryEntry, allAssocs: personAssocs, isSelected, lifecycle, relStatus })
  }

  return items.sort((a, b) => (b.isSelected ? 1 : 0) - (a.isSelected ? 1 : 0))
}

// ─── Contact row ──────────────────────────────────────────────────────────────

function ContactRow({ item, onClick }: { item: ContactListItem; onClick: () => void }) {
  const lcfg = LIFECYCLE_CFG[item.lifecycle]
  const lastInteraction = getLastInteraction(item.primaryEntry, item.isSelected)
  const nextAction = getNextAction(item.lifecycle, item.isSelected)
  const fullName = `${item.person.firstName} ${item.person.lastName}`

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 sm:px-5 py-4 flex items-start gap-3.5 transition-all"
      style={{ borderBottom: '1px solid var(--color-border)' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[12px] shrink-0"
        style={{ background: item.person.avatarBg, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      >
        {item.person.avatarInitials}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <span className="text-[14px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {fullName}
            </span>
            <span className="text-[13px] ml-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
              {item.primaryAssoc.title} · {item.primaryEntry.name}
              {item.allAssocs.length > 1 && (
                <span className="ml-1.5 text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}>
                  +{item.allAssocs.length - 1} more
                </span>
              )}
            </span>
          </div>
          <span
            className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: lcfg.bg, color: lcfg.color, border: `1px solid ${lcfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: lcfg.dot }} />
            {lcfg.label}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-[12.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            {lastInteraction}
          </p>
          <span className="text-[12px] font-medium shrink-0 flex items-center gap-1" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {nextAction} <Icon d={icons.arrowRight} size={11} />
          </span>
        </div>
      </div>
    </button>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const nav = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 px-8">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}>
        <Icon d={icons.contacts} size={26} strokeWidth={1.5} />
      </div>
      <div className="text-center max-w-100">
        <h2 className="text-[20px] font-bold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>No contacts yet</h2>
        <p className="text-[14px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          Contacts appear here when you discover people while researching companies, or when you add them directly.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
          style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          <Icon d={icons.plus} size={15} />
          Add contact
        </button>
        <button
          onClick={() => nav('/companies')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
          style={{ background: 'var(--color-muted)', color: 'var(--color-primary)', border: '1px solid var(--color-border)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-border)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-muted)')}
        >
          Explore companies
        </button>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type LifecycleFilter = 'ALL' | ContactLifecycleState

export function ContactsPage() {
  const navigate = useNavigate()
  const ws = loadWorkspace()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<LifecycleFilter>('ALL')
  const [showAddModal, setShowAddModal] = useState(false)

  const allContacts = buildContactList(ws.people, ws.personCompanyAssociations, ws.companies)

  const filtered = allContacts.filter(item => {
    const fullName = `${item.person.firstName} ${item.person.lastName}`
    const matchSearch =
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      item.primaryEntry.name.toLowerCase().includes(search.toLowerCase()) ||
      item.primaryAssoc.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.person.email ?? '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'ALL' || item.lifecycle === filter
    return matchSearch && matchFilter
  })

  const filterCounts: Partial<Record<LifecycleFilter, number>> = { ALL: allContacts.length }
  for (const item of allContacts) {
    filterCounts[item.lifecycle] = (filterCounts[item.lifecycle] ?? 0) + 1
  }

  return (
    <div className="max-w-225 mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Contacts
          </h1>
          <p className="text-[14px] mt-1" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            People you've researched, contacted, or want to build relationships with.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all shrink-0"
          style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          <Icon d={icons.plus} size={15} />
          Add contact
        </button>
      </div>

      {allContacts.length === 0 ? (
        <EmptyState onAdd={() => setShowAddModal(true)} />
      ) : (
        <>
          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted-fg)' }}>
                <Icon d={icons.search} size={15} />
              </span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, company, or role…"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg text-[13.5px] outline-none"
                style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
              />
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(['ALL', 'ACTIVE', 'REPLIED', 'CONTACTED', 'SELECTED', 'NURTURE', 'DISCOVERED', 'CLOSED'] as LifecycleFilter[]).map(f => {
              const count = filterCounts[f] ?? 0
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
                  {f === 'ALL' ? 'All' : LIFECYCLE_CFG[f as ContactLifecycleState].label}{' '}
                  {count > 0 && <span className="opacity-70">· {count}</span>}
                </button>
              )
            })}
          </div>

          {/* List */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
            {filtered.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-[14px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>No contacts match your search.</p>
              </div>
            ) : (
              filtered.map(item => (
                <ContactRow
                  key={item.personId}
                  item={item}
                  onClick={() => navigate(`/contacts/${item.personId}`)}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Add Contact Modal */}
      {showAddModal && (
        <AddContactModal
          people={ws.people}
          companies={ws.companies}
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); window.location.reload() }}
        />
      )}
    </div>
  )
}

// ─── Inline AddContactModal (imported lazily to avoid circular deps) ───────────

import { AddContactModal } from './AddContactModal'

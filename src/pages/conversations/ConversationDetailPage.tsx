import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { Icon, icons } from '../../lib/icons'
import {
  type CompanyEntry,
  type Workspace,
  loadWorkspace,
  saveWorkspace,
  deriveRelationshipStatus,
  CONV_OUTCOME_LABELS,
} from '../../lib/workspaceStore'
import { getContactData } from '../companies/ContactsTab'
import { ConversationTab } from '../companies/ConversationTab'

// ─── Relationship status badge ────────────────────────────────────────────────

const REL_CFG = {
  OPEN: { label: 'Open', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', dot: '#3B82F6' },
  OPPORTUNITY: { label: 'Opportunity', color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981' },
  NURTURE: { label: 'Nurture', color: '#92400E', bg: '#FFF7ED', border: '#FED7AA', dot: '#F59E0B' },
  CLOSED: { label: 'Closed', color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB', dot: '#9CA3AF' },
}

// ─── Context links bar ────────────────────────────────────────────────────────

function ContextLinks({ entry, ws }: { entry: CompanyEntry; ws: Workspace }) {
  const campaigns = ws.campaigns.filter(c => c.members.some(m => m.companyId === entry.id))

  return (
    <div className="flex flex-wrap items-center gap-3 py-3 px-4 sm:px-5" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-muted)' }}>
      <Link to={`/companies/${entry.id}`} className="inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        onMouseOver={e => (e.currentTarget.style.color = 'var(--color-primary)')}
        onMouseOut={e => (e.currentTarget.style.color = 'var(--color-muted-fg)')}
      >
        <Icon d={icons.companies} size={12} />{entry.name}
      </Link>
      <span style={{ color: 'var(--color-border)' }}>·</span>
      <Link to={`/opportunities/${entry.id}`} className="inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        onMouseOver={e => (e.currentTarget.style.color = 'var(--color-primary)')}
        onMouseOut={e => (e.currentTarget.style.color = 'var(--color-muted-fg)')}
      >
        <Icon d={icons.opportunities} size={12} />Opportunity
      </Link>
      {entry.selectedContactId && (
        <>
          <span style={{ color: 'var(--color-border)' }}>·</span>
          <Link
            to={`/contacts/${entry.id}--${entry.selectedContactId}`}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors"
            style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseOver={e => (e.currentTarget.style.color = 'var(--color-primary)')}
            onMouseOut={e => (e.currentTarget.style.color = 'var(--color-muted-fg)')}
          >
            <Icon d={icons.contacts} size={12} />Contact
          </Link>
        </>
      )}
      {campaigns.map(c => (
        <span key={c.id} className="flex items-center gap-1.5">
          <span style={{ color: 'var(--color-border)' }}>·</span>
          <Link to={`/campaigns/${c.id}`} className="inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseOver={e => (e.currentTarget.style.color = 'var(--color-primary)')}
            onMouseOut={e => (e.currentTarget.style.color = 'var(--color-muted-fg)')}
          >
            <Icon d={icons.campaigns} size={12} />{c.name}
          </Link>
        </span>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ConversationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [ws, setWs] = useState(() => loadWorkspace())
  const entry = ws.companies.find(c => c.id === id) ?? null
  const contact = entry?.selectedContactId ? getContactData(entry.id, entry.selectedContactId) : null

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}>
          <Icon d={icons.alertCircle} size={20} />
        </div>
        <div className="text-center">
          <p className="text-[17px] font-bold mb-1" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Conversation not found</p>
          <p className="text-[13.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>This conversation may have been removed or the URL is invalid.</p>
        </div>
        <button onClick={() => navigate('/conversations')} className="text-[13px] font-medium flex items-center gap-1.5" style={{ color: 'var(--color-accent)' }}>
          <Icon d={icons.arrowLeft} size={13} /> Back to conversations
        </button>
      </div>
    )
  }

  const resolvedEntry: CompanyEntry = entry!
  const relStatus = deriveRelationshipStatus(resolvedEntry)
  const relCfg = relStatus ? REL_CFG[relStatus] : null

  function updateEntry(patch: Partial<CompanyEntry>) {
    const updated: CompanyEntry = { ...resolvedEntry, ...patch }
    setWs(prev => {
      const newWs = {
        ...prev,
        companies: prev.companies.map(c => c.id === resolvedEntry.id ? updated : c),
      }
      saveWorkspace(newWs)
      return newWs
    })
  }

  function handleNavigate(tab: string) {
    if (tab === 'Overview') navigate(`/companies/${resolvedEntry.id}`)
    else if (tab === 'Contacts') navigate(`/contacts`)
    else if (tab === 'Opportunities') navigate(`/opportunities/${resolvedEntry.id}`)
    else if (tab === 'Campaign') navigate(resolvedEntry.campaignId ? `/campaigns/${resolvedEntry.campaignId}` : '/campaigns')
    else if (tab === 'Conversation') { /* stay here */ }
    else navigate(`/companies/${resolvedEntry.id}`)
  }

  const currentEntry: CompanyEntry = (ws.companies.find(c => c.id === id) as CompanyEntry | undefined) ?? resolvedEntry

  return (
    <div className="flex flex-col h-full max-w-225 mx-auto">
      {/* Breadcrumb + page header */}
      <div className="px-4 sm:px-5 pt-5 pb-4">
        <div className="flex items-center gap-1.5 text-[12.5px] mb-4" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          <button onClick={() => navigate('/conversations')} className="hover:underline" style={{ color: 'var(--color-accent)' }}>Conversations</button>
          <Icon d={icons.chevronRight} size={12} />
          <span style={{ color: 'var(--color-primary)' }}>{contact?.name ?? resolvedEntry.name}</span>
        </div>

        {/* Person header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-[13px] shrink-0"
              style={{ background: contact?.avatarBg ?? 'var(--color-muted)', color: contact ? '#fff' : 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif', border: contact ? 'none' : '1px solid var(--color-border)' }}
            >
              {contact?.avatarInitials ?? resolvedEntry.name[0]}
            </div>
            <div>
              <h1 className="text-[19px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {contact?.name ?? 'Conversation'}
              </h1>
              <p className="text-[13px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                {contact?.role ?? ''}{contact?.role ? ' · ' : ''}<Link to={`/companies/${resolvedEntry.id}`} className="hover:underline" style={{ color: 'var(--color-accent)' }}>{resolvedEntry.name}</Link>
              </p>
            </div>
          </div>
          {relCfg && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: relCfg.bg, color: relCfg.color, border: `1px solid ${relCfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: relCfg.dot }} />{relCfg.label}
            </span>
          )}
        </div>
      </div>

      {/* Context links */}
      <ContextLinks entry={currentEntry} ws={ws} />

      {/* ConversationTab body */}
      <div className="flex-1 overflow-y-auto">
        <ConversationTab
          entry={currentEntry}
          onUpdate={updateEntry}
          onNavigate={handleNavigate}
        />
      </div>
    </div>
  )
}

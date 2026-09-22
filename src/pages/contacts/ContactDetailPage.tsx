import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { Icon, icons } from '../../lib/icons'
import {
  type Person,
  type PersonCompanyAssociation,
  type CompanyEntry,
  loadWorkspace,
  deriveContactLifecycle,
  deriveRelationshipStatus,
  CONV_OUTCOME_LABELS,
} from '../../lib/workspaceStore'
import { getContactData } from '../companies/ContactsTab'
import { LIFECYCLE_CFG } from './ContactsPage'

// ─── Timeline ─────────────────────────────────────────────────────────────────

type TimelineEvent = {
  icon: string | string[]
  iconBg: string
  iconColor: string
  text: string
  time: string
}

function deriveTimeline(entry: CompanyEntry, legacyContactId: string): TimelineEvent[] {
  const events: TimelineEvent[] = []
  if (entry.contactStage !== 'NOT_DISCOVERED') {
    events.push({ icon: icons.contacts, iconBg: '#EFF6FF', iconColor: '#1D4ED8', text: 'Contact discovered during company research', time: entry.addedAt })
  }
  if (entry.selectedContactId === legacyContactId) {
    events.push({ icon: icons.check, iconBg: '#F0FDF4', iconColor: '#16A34A', text: 'Selected as primary contact for outreach', time: entry.addedAt })
  }
  if (entry.outreachStage === 'SENT') {
    events.push({ icon: icons.send, iconBg: '#F5F3FF', iconColor: '#7C3AED', text: `Outreach sent${entry.sentAt ? ` · ${entry.sentAt}` : ''}`, time: entry.sentAt ?? entry.lastActivity })
  } else if (entry.outreachStage === 'READY') {
    events.push({ icon: icons.mail, iconBg: '#FFF7ED', iconColor: '#D97706', text: 'Outreach draft approved — ready to send', time: entry.lastActivity })
  }
  if (entry.followUpCount && entry.followUpCount > 0) {
    for (let i = 0; i < entry.followUpCount; i++) {
      events.push({ icon: icons.send, iconBg: '#F5F3FF', iconColor: '#7C3AED', text: `Follow-up #${i + 1} sent`, time: entry.lastActivity })
    }
  }
  if (entry.convStage === 'REPLIED' || entry.convStage === 'ACTIVE') {
    events.push({ icon: icons.replies, iconBg: '#ECFDF5', iconColor: '#059669', text: 'Contact replied to your outreach', time: entry.lastActivity })
  }
  if (entry.convStage === 'ACTIVE') {
    events.push({ icon: icons.replies, iconBg: '#ECFDF5', iconColor: '#059669', text: 'Conversation continued', time: entry.lastActivity })
  }
  if (entry.convStage === 'STOPPED') {
    events.push({ icon: icons.x, iconBg: '#FEF2F2', iconColor: '#DC2626', text: 'Conversation stopped', time: entry.lastActivity })
  }
  if (entry.convOutcome) {
    events.push({ icon: icons.checkCircle, iconBg: '#F0FDF4', iconColor: '#16A34A', text: `Outcome recorded: ${CONV_OUTCOME_LABELS[entry.convOutcome]}${entry.convOutcomeNote ? ` — "${entry.convOutcomeNote}"` : ''}`, time: entry.lastActivity })
  }
  return events
}

// ─── Sidebar cards ────────────────────────────────────────────────────────────

function CompanyCard({ entry }: { entry: CompanyEntry }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
      <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Company</p>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold flex-shrink-0" style={{ background: 'var(--color-muted)', color: 'var(--color-primary)', border: '1px solid var(--color-border)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {entry.name[0]}
        </div>
        <div>
          <p className="text-[14px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{entry.name}</p>
          <p className="text-[12px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{entry.domain}</p>
        </div>
      </div>
      <Link to={`/companies/${entry.id}`} className="inline-flex items-center gap-1 text-[12.5px] font-semibold" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        View company <Icon d={icons.arrowRight} size={12} />
      </Link>
    </div>
  )
}

function OpportunityCard({ entry }: { entry: CompanyEntry }) {
  const statusCfg = {
    CONFIRMED:    { color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981' },
    PROACTIVE:    { color: '#3730A3', bg: '#EEF2FF', border: '#C7D2FE', dot: '#4F46E5' },
    UNCLASSIFIED: { color: '#92400E', bg: '#FEF3C7', border: '#FDE68A', dot: '#F59E0B' },
  }[entry.oppStatus]
  if (entry.researchStage !== 'COMPLETE') return null
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
      <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Opportunity</p>
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full mb-2" style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusCfg.dot }} />
        {entry.oppStatus}
      </span>
      <p className="text-[12.5px] leading-relaxed mb-3" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
        {entry.oppStatus === 'CONFIRMED' ? 'Active evidence-backed opportunity at this company.' : 'Proactive approach — building a relationship before an opening is confirmed.'}
      </p>
      <Link to={`/opportunities/${entry.id}`} className="inline-flex items-center gap-1 text-[12.5px] font-semibold" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        View opportunity <Icon d={icons.arrowRight} size={12} />
      </Link>
    </div>
  )
}

function CampaignCard({ entry }: { entry: CompanyEntry }) {
  const ws = loadWorkspace()
  const memberships = ws.campaigns.filter(c => c.members.some(m => m.companyId === entry.id)).map(c => ({ campaign: c, member: c.members.find(m => m.companyId === entry.id)! }))
  if (memberships.length === 0) return null
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
      <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Campaigns</p>
      <div className="flex flex-col gap-2.5">
        {memberships.map(({ campaign, member }) => (
          <div key={campaign.id}>
            <p className="text-[13px] font-semibold mb-0.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{campaign.name}</p>
            <p className="text-[12px] mb-1" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>Member status: {member.status}</p>
            <Link to={`/campaigns/${campaign.id}`} className="inline-flex items-center gap-1 text-[12px] font-semibold" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              View campaign <Icon d={icons.arrowRight} size={11} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

function ConversationCard({ entry }: { entry: CompanyEntry }) {
  if (entry.outreachStage !== 'SENT') return null
  const stateLabels: Record<string, string> = {
    ACTIVE: 'Active — reply received', REPLIED: 'Replied — awaiting response', STOPPED: 'Stopped', NONE: 'Outreach sent · Awaiting reply',
  }
  const lastMsg = entry.conversationMessages?.at(-1)
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
      <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Conversation</p>
      <p className="text-[12.5px] font-medium mb-1" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{stateLabels[entry.convStage] ?? 'In progress'}</p>
      {lastMsg && <p className="text-[12px] mb-3 line-clamp-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{lastMsg.body.slice(0, 100)}{lastMsg.body.length > 100 ? '…' : ''}</p>}
      <Link to={`/conversations/${entry.id}`} className="inline-flex items-center gap-1 text-[12.5px] font-semibold" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        Open conversation <Icon d={icons.arrowRight} size={12} />
      </Link>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ContactDetailPage() {
  const { contactKey } = useParams<{ contactKey: string }>()
  const navigate = useNavigate()
  const ws = loadWorkspace()

  // ── Resolve contact + association ──────────────────────────────────────────

  // Support both legacy "{companyId}--{contactId}" and new "contact-*" IDs
  const isLegacy = (contactKey ?? '').includes('--')
  const [legacyCompanyId, legacyContactId] = isLegacy ? (contactKey ?? '').split('--') : ['', '']

  // New model
  const newContact: Person | null = isLegacy ? null : (ws.people.find(c => c.id === contactKey) ?? null)
  const newAssocs: PersonCompanyAssociation[] = newContact
    ? ws.personCompanyAssociations.filter(a => a.personId === newContact.id)
    : []

  // Company selector state (for multi-company contacts)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(() =>
    newAssocs.length > 0 ? newAssocs[0].companyId : ''
  )
  const activeAssoc = newAssocs.find(a => a.companyId === selectedCompanyId) ?? newAssocs[0] ?? null

  // Legacy model — map to equivalent display fields
  const legacyEntry = isLegacy ? ws.companies.find(c => c.id === legacyCompanyId) ?? null : null
  const legacyContact = isLegacy && legacyEntry ? getContactData(legacyCompanyId, legacyContactId) : null

  // ── Derived display data ────────────────────────────────────────────────────

  // Which company entry to use for lifecycle/timeline
  const primaryEntry: CompanyEntry | null = newContact
    ? ws.companies.find(c => c.id === (activeAssoc?.companyId ?? '')) ?? null
    : legacyEntry

  const resolvedContactId = newContact
    ? newContact.id.replace(/^contact-/, '')
    : legacyContactId

  const isSelected = primaryEntry
    ? primaryEntry.selectedContactId === resolvedContactId || primaryEntry.selectedContactId === legacyContactId
    : false

  const lifecycle = (primaryEntry && isSelected) ? deriveContactLifecycle(primaryEntry) : ('DISCOVERED' as const)
  const _relStatus = primaryEntry ? deriveRelationshipStatus(primaryEntry) : null
  void _relStatus
  const lcfg = LIFECYCLE_CFG[lifecycle]
  const timeline = (primaryEntry && isSelected) ? deriveTimeline(primaryEntry, resolvedContactId) : []

  // Display fields
  const displayName = newContact ? `${newContact.firstName} ${newContact.lastName}` : (legacyContact?.name ?? '')
  const displayTitle = activeAssoc?.title ?? legacyContact?.role ?? ''
  const displayTeam = activeAssoc?.team ?? legacyContact?.team ?? ''
  const displayFn = activeAssoc?.fn ?? legacyContact?.fn ?? ''
  const displayAvatarBg = newContact?.avatarBg ?? legacyContact?.avatarBg ?? '#7C3AED'
  const displayAvatarInitials = newContact?.avatarInitials ?? legacyContact?.avatarInitials ?? '?'
  const displayCompanyName = primaryEntry?.name ?? ''

  // "Why this person" — company-specific from association, or legacy contact field
  const whyThisPerson = activeAssoc?.whyThisPerson ?? legacyContact?.relevanceSummary ?? ''
  const evidence = activeAssoc?.evidence ?? legacyContact?.evidence ?? []
  const conversationAngle = activeAssoc?.conversationAngle ?? legacyContact?.conversationAngle
  const known = activeAssoc?.known ?? legacyContact?.known ?? []
  const roleDescription = legacyContact?.roleRelevance ?? whyThisPerson

  if (!displayName || !primaryEntry) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}>
          <Icon d={icons.alertCircle} size={20} />
        </div>
        <div className="text-center">
          <p className="text-[17px] font-bold mb-1" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Contact not found</p>
          <p className="text-[13.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>This contact may have been removed or the URL is invalid.</p>
        </div>
        <button onClick={() => navigate('/contacts')} className="text-[13px] font-medium flex items-center gap-1.5" style={{ color: 'var(--color-accent)' }}>
          <Icon d={icons.arrowLeft} size={13} /> Back to contacts
        </button>
      </div>
    )
  }

  function getPrimaryAction(): { label: string; href?: string } {
    if (!isSelected) return { label: 'View company workspace', href: `/companies/${primaryEntry?.id}` }
    if (lifecycle === 'ACTIVE') return { label: 'Open conversation', href: `/conversations/${primaryEntry?.id}` }
    if (lifecycle === 'REPLIED') return { label: 'View reply', href: `/conversations/${primaryEntry?.id}` }
    if (lifecycle === 'NURTURE') return { label: 'View conversation', href: `/conversations/${primaryEntry?.id}` }
    if (lifecycle === 'CLOSED') return { label: 'View journey', href: `/companies/${primaryEntry?.id}` }
    if (lifecycle === 'CONTACTED') return { label: 'View conversation', href: `/conversations/${primaryEntry?.id}` }
    if (lifecycle === 'SELECTED') return { label: 'Prepare outreach', href: `/companies/${primaryEntry?.id}` }
    return { label: 'View company', href: `/companies/${primaryEntry?.id}` }
  }

  const primaryAction = getPrimaryAction()

  return (
    <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12.5px] mb-5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
        <button onClick={() => navigate('/contacts')} className="hover:underline" style={{ color: 'var(--color-accent)' }}>Contacts</button>
        <Icon d={icons.chevronRight} size={12} />
        <span style={{ color: 'var(--color-primary)' }}>{displayName}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-[18px] flex-shrink-0" style={{ background: displayAvatarBg, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {displayAvatarInitials}
          </div>
          <div>
            <h1 className="text-[22px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {displayName}
            </h1>
            <p className="text-[14px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
              {displayTitle}
              {displayCompanyName && (
                <> · <Link to={`/companies/${primaryEntry.id}`} className="hover:underline" style={{ color: 'var(--color-accent)' }}>{displayCompanyName}</Link></>
              )}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: lcfg.bg, color: lcfg.color, border: `1px solid ${lcfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: lcfg.dot }} />{lcfg.label}
              </span>
              {displayFn && <span className="text-[12px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{displayFn}</span>}
            </div>
          </div>
        </div>
        {primaryAction.href && (
          <Link to={primaryAction.href} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all" style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {primaryAction.label} <Icon d={icons.arrowRight} size={13} />
          </Link>
        )}
      </div>

      {/* Company selector (for multi-company contacts) */}
      {newAssocs.length > 1 && (
        <div className="mb-5 flex items-center gap-3">
          <span className="text-[12.5px] font-semibold" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Viewing context for:</span>
          <div className="flex gap-2">
            {newAssocs.map(a => {
              const co = ws.companies.find(c => c.id === a.companyId)
              if (!co) return null
              const isActive = a.companyId === selectedCompanyId
              return (
                <button
                  key={a.companyId}
                  onClick={() => setSelectedCompanyId(a.companyId)}
                  className="px-3 py-1 rounded-lg text-[12.5px] font-semibold transition-all"
                  style={{ background: isActive ? 'var(--color-primary)' : 'var(--color-muted)', color: isActive ? 'white' : 'var(--color-muted-fg)', border: isActive ? 'none' : '1px solid var(--color-border)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  {co.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Contact details (email, phone, linkedin) for new contacts */}
      {newContact && (newContact.email || newContact.phone || newContact.linkedinUrl) && (
        <div className="mb-5 flex flex-wrap gap-4">
          {newContact.email && (
            <a href={`mailto:${newContact.email}`} className="flex items-center gap-1.5 text-[13px]" style={{ color: 'var(--color-accent)', fontFamily: 'Inter, sans-serif' }}>
              <Icon d={icons.mail} size={14} />{newContact.email}
            </a>
          )}
          {newContact.linkedinUrl && (
            <a href={`https://${newContact.linkedinUrl.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[13px]" style={{ color: 'var(--color-accent)', fontFamily: 'Inter, sans-serif' }}>
              <Icon d={icons.linkedin} size={14} />LinkedIn
            </a>
          )}
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex flex-col xl:flex-row gap-5">
        {/* Main column */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* About */}
          {(roleDescription || known.length > 0) && (
            <div className="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>About this person</p>
              {roleDescription && (
                <p className="text-[13.5px] leading-relaxed mb-3" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>{roleDescription}</p>
              )}
              {known.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {known.map((fact, i) => (
                    <span key={i} className="text-[12px] px-2.5 py-1 rounded-full" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{fact}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Why this person (company-specific) */}
          {(whyThisPerson || evidence.length > 0 || conversationAngle) && (
            <div className="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Why this person</p>
                {newAssocs.length > 0 && activeAssoc && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)', border: '1px solid var(--color-border)', fontFamily: 'Inter, sans-serif' }}>
                    for {displayCompanyName}
                  </span>
                )}
              </div>
              {whyThisPerson && (
                <p className="text-[13.5px] leading-relaxed mb-4" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>{whyThisPerson}</p>
              )}
              {evidence.length > 0 && (
                <div className="flex flex-col gap-2">
                  {evidence.map((ev, i) => (
                    <div key={i} className="flex items-start gap-2.5 py-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: 'var(--color-accent)' }} />
                      <div>
                        <p className="text-[13px] leading-snug" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>{ev.text}</p>
                        <p className="text-[11.5px] mt-0.5" style={{ color: 'var(--color-accent)', fontFamily: 'Inter, sans-serif' }}>{ev.source} · {ev.recency}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {conversationAngle && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <p className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Conversation angle</p>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>{conversationAngle}</p>
                </div>
              )}
            </div>
          )}

          {/* Notes (MANUAL contacts) */}
          {newContact?.notes && (
            <div className="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Notes</p>
              <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>{newContact.notes}</p>
            </div>
          )}

          {/* Timeline */}
          {timeline.length > 0 && (
            <div className="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Relationship timeline</p>
              <div className="flex flex-col gap-4">
                {timeline.map((event, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: event.iconBg, color: event.iconColor }}>
                      <Icon d={event.icon} size={13} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-[13px]" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>{event.text}</p>
                      <p className="text-[11.5px] mt-0.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state for manual contacts with no associations */}
          {newContact && newAssocs.length === 0 && !newContact.notes && (
            <div className="rounded-xl p-5 text-center" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
              <p className="text-[13.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                This contact has no company association or notes yet.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="xl:w-[280px] flex-shrink-0 flex flex-col gap-4">
          <CompanyCard entry={primaryEntry} />
          <OpportunityCard entry={primaryEntry} />
          <CampaignCard entry={primaryEntry} />
          {isSelected && <ConversationCard entry={primaryEntry} />}

          {/* Source badge */}
          {newContact && (
            <div className="rounded-xl p-4" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Source</p>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: newContact.source === 'MANUAL' ? '#1D4ED8' : '#065F46', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <Icon d={newContact.source === 'MANUAL' ? icons.edit : icons.search} size={13} />
                {newContact.source === 'MANUAL' ? 'Added manually' : 'Discovered via research'}
              </span>
              <p className="text-[11.5px] mt-1" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{newContact.createdAt}</p>
            </div>
          )}

          {/* Associations list (multi-company) */}
          {newAssocs.length > 1 && (
            <div className="rounded-xl p-4" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Also at</p>
              {newAssocs.filter(a => a.companyId !== selectedCompanyId).map(a => {
                const co = ws.companies.find(c => c.id === a.companyId)
                if (!co) return null
                return (
                  <button key={a.companyId} onClick={() => setSelectedCompanyId(a.companyId)} className="flex items-center gap-2 w-full mb-2 text-left" style={{ color: 'var(--color-primary)' }}>
                    <div className="w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                      {co.name[0]}
                    </div>
                    <span className="text-[12.5px] font-medium hover:underline" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{co.name}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

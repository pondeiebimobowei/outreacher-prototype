import type { Workspace, ConvStage } from './workspaceStore'
import { deriveContactLifecycle } from './workspaceStore'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SearchResultType = 'company' | 'contact' | 'opportunity' | 'conversation' | 'campaign' | 'template' | 'outreach'

export type SearchableItem = {
  id: string
  type: SearchResultType
  title: string
  subtitle: string
  meta?: string
  statusLabel?: string
  statusColor?: string
  statusBg?: string
  route: string
  keywords: string
}

export type SearchGroup = {
  type: SearchResultType
  label: string
  items: SearchableItem[]
}

// ─── Config ───────────────────────────────────────────────────────────────────

export const GROUP_LABELS: Record<SearchResultType, string> = {
  company:      'Companies',
  contact:      'People',
  opportunity:  'Opportunities',
  conversation: 'Conversations',
  campaign:     'Campaigns',
  template:     'Templates',
  outreach:     'Outreaches',
}

export const GROUP_ORDER: SearchResultType[] = [
  'company', 'contact', 'opportunity', 'conversation', 'campaign', 'template', 'outreach',
]

const OPP_STATUS_CFG = {
  CONFIRMED:    { label: 'Confirmed',    color: '#065F46', bg: '#ECFDF5' },
  PROACTIVE:    { label: 'Proactive',    color: '#3730A3', bg: '#EEF2FF' },
  UNCLASSIFIED: { label: 'Unclassified', color: '#92400E', bg: '#FEF9C3' },
}

const CONV_STAGE_CFG: Record<ConvStage, { label: string; color: string; bg: string }> = {
  NONE:    { label: 'Sent',    color: '#1D4ED8', bg: '#EFF6FF' },
  REPLIED: { label: 'Replied', color: '#065F46', bg: '#ECFDF5' },
  ACTIVE:  { label: 'Active',  color: '#065F46', bg: '#ECFDF5' },
  STOPPED: { label: 'Stopped', color: '#6B7280', bg: '#F3F4F6' },
}

const LIFECYCLE_LABELS: Record<string, string> = {
  DISCOVERED: 'Discovered',
  SELECTED:   'Selected',
  CONTACTED:  'Contacted',
  REPLIED:    'Replied',
  ACTIVE:     'Active',
  NURTURE:    'Nurture',
  CLOSED:     'Closed',
}

const CAMPAIGN_STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:     { label: 'Draft',      color: '#374151', bg: '#F3F4F6' },
  READY:     { label: 'Ready',      color: '#1D4ED8', bg: '#EFF6FF' },
  SENDING:   { label: 'Sending',    color: '#92400E', bg: '#FEF3C7' },
  ACTIVE:    { label: 'Active',     color: '#065F46', bg: '#ECFDF5' },
  PAUSED:    { label: 'Paused',     color: '#92400E', bg: '#FFF7ED' },
  COMPLETED: { label: 'Completed',  color: '#374151', bg: '#F3F4F6' },
}

// ─── Contact data helper ──────────────────────────────────────────────────────

// Prototype contact data — kept here so search.ts doesn't import from page modules.
// This mirrors the CONTACTS structure in ContactsTab.tsx.
type ContactRecord = { name: string; role: string; team: string }

const CONTACT_INDEX: Record<string, ContactRecord[]> = {
  stripe:   [
    { name: 'Priya Mehta', role: 'Engineering Manager', team: 'Platform Infrastructure' },
    { name: 'James Wu', role: 'Staff Infrastructure Engineer', team: 'Platform Engineering' },
    { name: 'Sara Okonkwo', role: 'Director of Engineering', team: 'Platform' },
  ],
  paystack: [
    { name: 'Dele Adeyemi', role: 'Engineering Manager', team: 'Backend Platform' },
    { name: 'Amara Nwosu', role: 'Senior Staff Engineer', team: 'API Platform' },
  ],
  kuda: [
    { name: 'Alex Obi', role: 'Head of Engineering', team: 'Platform Engineering' },
  ],
}

const CONTACT_IDS: Record<string, string[]> = {
  stripe:   ['priya-mehta', 'james-wu', 'sara-okonkwo'],
  paystack: ['dele-adeyemi', 'amara-nwosu'],
  kuda:     ['alex-obi'],
}

// ─── Index builder ────────────────────────────────────────────────────────────

export function buildSearchIndex(ws: Workspace): SearchableItem[] {
  const items: SearchableItem[] = []

  for (const entry of ws.companies) {
    // Company
    const oppCfg = OPP_STATUS_CFG[entry.oppStatus]
    items.push({
      id: entry.id,
      type: 'company',
      title: entry.name,
      subtitle: entry.domain,
      statusLabel: oppCfg.label,
      statusColor: oppCfg.color,
      statusBg: oppCfg.bg,
      route: `/companies/${entry.id}`,
      keywords: [entry.name, entry.domain, entry.oppStatus].join(' ').toLowerCase(),
    })

    // Contacts for this company (if discovered)
    if (entry.contactStage !== 'NOT_DISCOVERED') {
      const contacts = CONTACT_INDEX[entry.id] ?? []
      const ids = CONTACT_IDS[entry.id] ?? []
      contacts.forEach((c, i) => {
        const contactId = ids[i] ?? `contact-${i}`
        const isSelected = entry.selectedContactId === contactId
        const lifecycle = isSelected ? deriveContactLifecycle(entry) : 'DISCOVERED'
        items.push({
          id: `${entry.id}--${contactId}`,
          type: 'contact',
          title: c.name,
          subtitle: `${c.role} · ${entry.name}`,
          meta: c.team,
          statusLabel: LIFECYCLE_LABELS[lifecycle],
          route: `/contacts/${entry.id}--${contactId}`,
          keywords: [c.name, c.role, c.team, entry.name].join(' ').toLowerCase(),
        })
      })
    }

    // Opportunity (if has any research/classification)
    if (entry.researchStage !== 'NOT_STARTED' || entry.oppStatus !== 'UNCLASSIFIED') {
      const opp = OPP_STATUS_CFG[entry.oppStatus]
      const researchMeta =
        entry.researchStage === 'COMPLETE' ? 'Research complete' :
        entry.researchStage === 'IN_PROGRESS' ? 'Research in progress' : undefined
      items.push({
        id: `opp-${entry.id}`,
        type: 'opportunity',
        title: entry.name,
        subtitle: opp.label,
        meta: researchMeta,
        statusLabel: opp.label,
        statusColor: opp.color,
        statusBg: opp.bg,
        route: `/opportunities/${entry.id}`,
        keywords: [entry.name, entry.domain, opp.label, 'opportunity'].join(' ').toLowerCase(),
      })
    }

    // Conversation (if outreach sent)
    if (entry.outreachStage === 'SENT') {
      const convCfg = CONV_STAGE_CFG[entry.convStage] ?? CONV_STAGE_CFG.NONE
      const contactRecord = CONTACT_INDEX[entry.id]?.find(
        (_, i) => (CONTACT_IDS[entry.id] ?? [])[i] === entry.selectedContactId,
      )
      const lastMsg = entry.conversationMessages?.at(-1)
      items.push({
        id: `conv-${entry.id}`,
        type: 'conversation',
        title: contactRecord?.name ?? entry.name,
        subtitle: contactRecord ? `${contactRecord.role} · ${entry.name}` : entry.name,
        meta: lastMsg?.body.slice(0, 80),
        statusLabel: convCfg.label,
        statusColor: convCfg.color,
        statusBg: convCfg.bg,
        route: `/conversations/${entry.id}`,
        keywords: [
          contactRecord?.name ?? '', entry.name, entry.convStage,
          lastMsg?.body.slice(0, 120) ?? '',
        ].join(' ').toLowerCase(),
      })
    }
  }

  // Campaigns
  for (const campaign of ws.campaigns) {
    const companies = [...new Set(campaign.members.map(m => m.companyName))].slice(0, 3).join(', ')
    const cfg = CAMPAIGN_STATUS_CFG[campaign.status] ?? CAMPAIGN_STATUS_CFG.DRAFT
    items.push({
      id: campaign.id,
      type: 'campaign',
      title: campaign.name,
      subtitle: companies || `${campaign.members.length} member${campaign.members.length !== 1 ? 's' : ''}`,
      statusLabel: cfg.label,
      statusColor: cfg.color,
      statusBg: cfg.bg,
      route: `/campaigns/${campaign.id}`,
      keywords: [campaign.name, campaign.status, companies].join(' ').toLowerCase(),
    })
  }

  // Templates
  for (const template of ws.templates) {
    if (template.isArchived) continue
    items.push({
      id: template.id,
      type: 'template',
      title: template.name,
      subtitle: template.subject,
      meta: template.category,
      route: `/templates`,
      keywords: [template.name, template.category, template.subject].join(' ').toLowerCase(),
    })
  }

  // Outreaches
  const OUTREACH_STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
    DRAFT:    { label: 'Draft',    color: '#374151', bg: '#F3F4F6' },
    READY:    { label: 'Ready',    color: '#1D4ED8', bg: '#EFF6FF' },
    SENT:     { label: 'Sent',     color: '#5B21B6', bg: '#F5F3FF' },
    ARCHIVED: { label: 'Archived', color: '#374151', bg: '#F3F4F6' },
  }
  for (const outreach of ws.outreaches) {
    const contact = ws.people.find(c => c.id === outreach.personId)
    const company = ws.companies.find(c => c.id === outreach.companyId)
    const contactName = contact ? `${contact.firstName} ${contact.lastName}` : outreach.personId
    const companyName = company?.name ?? outreach.companyId
    const cfg = OUTREACH_STATUS_CFG[outreach.status] ?? OUTREACH_STATUS_CFG.DRAFT
    items.push({
      id: outreach.id,
      type: 'outreach',
      title: outreach.subject || `Outreach to ${contactName}`,
      subtitle: `${contactName} · ${companyName}`,
      statusLabel: cfg.label,
      statusColor: cfg.color,
      statusBg: cfg.bg,
      route: `/outreaches/${outreach.id}`,
      keywords: [outreach.subject, contactName, companyName, outreach.status, outreach.message?.slice(0, 100) ?? ''].join(' ').toLowerCase(),
    })
  }

  // Workspace contacts (supplement CONTACT_INDEX entries already added above)
  const alreadyIndexedContactIds = new Set(
    items.filter(i => i.type === 'contact').map(i => i.id)
  )
  for (const contact of ws.people) {
    const assoc = ws.personCompanyAssociations.find(a => a.personId === contact.id)
    const compositeId = assoc ? `${assoc.companyId}--${contact.id}` : contact.id
    if (alreadyIndexedContactIds.has(compositeId)) continue
    const company = assoc ? ws.companies.find(c => c.id === assoc.companyId) : undefined
    items.push({
      id: compositeId,
      type: 'contact',
      title: `${contact.firstName} ${contact.lastName}`,
      subtitle: assoc ? `${assoc.title} · ${company?.name ?? assoc.companyId}` : (contact.email ?? ''),
      meta: assoc?.team,
      statusLabel: 'Contact',
      route: assoc ? `/contacts/${assoc.companyId}--${contact.id}` : `/contacts/${contact.id}`,
      keywords: [contact.firstName, contact.lastName, contact.email ?? '', assoc?.title ?? '', company?.name ?? ''].join(' ').toLowerCase(),
    })
  }

  return items
}

// ─── Search + rank ────────────────────────────────────────────────────────────

export function searchItems(items: SearchableItem[], query: string): SearchableItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  type Ranked = { item: SearchableItem; score: number }
  const ranked: Ranked[] = []

  for (const item of items) {
    const title = item.title.toLowerCase()
    const subtitle = (item.subtitle ?? '').toLowerCase()
    const kw = item.keywords

    let score = 0
    if (title === q) score = 100
    else if (title.startsWith(q)) score = 80
    else if (title.includes(q)) score = 60
    else if (subtitle.includes(q)) score = 40
    else {
      // word-by-word match against all keywords
      const words = q.split(/\s+/).filter(Boolean)
      const allInKw = words.every(w => kw.includes(w))
      if (allInKw) score = 20
    }

    if (score > 0) ranked.push({ item, score })
  }

  return ranked.sort((a, b) => b.score - a.score).map(r => r.item)
}

export function groupSearchResults(items: SearchableItem[], maxPerGroup = 4): SearchGroup[] {
  const groups: SearchGroup[] = []
  for (const type of GROUP_ORDER) {
    const groupItems = items.filter(i => i.type === type)
    if (groupItems.length > 0) {
      groups.push({ type, label: GROUP_LABELS[type], items: groupItems.slice(0, maxPerGroup) })
    }
  }
  return groups
}

// ─── Recent items ─────────────────────────────────────────────────────────────

export function getRecentItems(ws: Workspace): SearchableItem[] {
  const recents: SearchableItem[] = []

  // Most recently active conversation
  const activeConv = ws.companies
    .filter(e => e.outreachStage === 'SENT')
    .sort((a, b) => (a.convStage === 'REPLIED' || a.convStage === 'ACTIVE' ? -1 : 1))[0]
  if (activeConv) {
    const opp = OPP_STATUS_CFG[activeConv.oppStatus]
    const convCfg = CONV_STAGE_CFG[activeConv.convStage] ?? CONV_STAGE_CFG.NONE
    const contactRecord = CONTACT_INDEX[activeConv.id]?.find(
      (_, i) => (CONTACT_IDS[activeConv.id] ?? [])[i] === activeConv.selectedContactId,
    )
    recents.push({
      id: `recent-conv-${activeConv.id}`,
      type: 'conversation',
      title: contactRecord?.name ?? activeConv.name,
      subtitle: contactRecord ? `${contactRecord.role} · ${activeConv.name}` : activeConv.name,
      statusLabel: convCfg.label,
      statusColor: convCfg.color,
      statusBg: convCfg.bg,
      route: `/conversations/${activeConv.id}`,
      keywords: '',
    })
  }

  // Most recently modified company
  const recentCompany = ws.companies[0]
  if (recentCompany && (!activeConv || recentCompany.id !== activeConv.id)) {
    const opp = OPP_STATUS_CFG[recentCompany.oppStatus]
    recents.push({
      id: `recent-co-${recentCompany.id}`,
      type: 'company',
      title: recentCompany.name,
      subtitle: recentCompany.domain,
      statusLabel: opp.label,
      statusColor: opp.color,
      statusBg: opp.bg,
      route: `/companies/${recentCompany.id}`,
      keywords: '',
    })
  }

  return recents.slice(0, 3)
}

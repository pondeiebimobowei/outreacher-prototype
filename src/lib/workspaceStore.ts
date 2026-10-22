// ─── Types ────────────────────────────────────────────────────────────────────

export type TemplateCategory = 'NETWORKING' | 'REFERRAL' | 'HIRING_MANAGER' | 'RECRUITER' | 'FOLLOW_UP' | 'GENERAL'

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  NETWORKING:     'Networking',
  REFERRAL:       'Referral',
  HIRING_MANAGER: 'Hiring manager',
  RECRUITER:      'Recruiter',
  FOLLOW_UP:      'Follow-up',
  GENERAL:        'General',
}

export type OutreachTemplate = {
  id: string
  name: string
  category: TemplateCategory
  subject: string
  body: string
  createdAt: string
  updatedAt: string
  isArchived?: boolean
  isDemo?: boolean
}

export type CampaignStatus = 'DRAFT' | 'READY' | 'SENDING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED'

export type MemberStatus = 'PENDING' | 'READY' | 'SENT' | 'REPLIED' | 'FOLLOW_UP_DUE' | 'STOPPED' | 'COMPLETED'

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  DRAFT:     'Draft',
  READY:     'Ready',
  SENDING:   'Sending',
  ACTIVE:    'Active',
  PAUSED:    'Paused',
  COMPLETED: 'Completed',
}

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  PENDING:        'Pending',
  READY:          'Ready to send',
  SENT:           'Sent',
  REPLIED:        'Replied',
  FOLLOW_UP_DUE:  'Follow-up due',
  STOPPED:        'Stopped',
  COMPLETED:      'Completed',
}

export type CampaignMember = {
  id: string
  personId: string
  contactName: string
  companyId: string
  companyName: string
  status: MemberStatus
  personalizedSubject?: string
  personalizedBody?: string
  sentAt?: string
  lastActivity: string
  convOutcome?: ConvOutcome
}

export type Campaign = {
  id: string
  name: string
  status: CampaignStatus
  templateId?: string
  templateName?: string
  senderAccountId?: string
  members: CampaignMember[]
  createdAt: string
  lastActivity: string
  isDemo?: boolean
}

// ─── Person / PersonCompanyAssociation model ──────────────────────────────────

export type ContactSource = 'MANUAL' | 'DISCOVERED'
export type ContactType = 'PERSON' | 'ROLE_ADDRESS'

/** Canonical domain type for an individual person. */
export type Person = {
  id: string
  contactType: ContactType
  firstName: string
  lastName: string
  displayName?: string
  email?: string
  phone?: string
  linkedinUrl?: string
  websiteUrl?: string
  /** @deprecated use websiteUrl */
  referenceUrl?: string
  note?: string
  /** @deprecated use note */
  notes?: string
  source: ContactSource
  avatarInitials: string
  avatarBg: string
  createdAt: string
}

export type ContactEvidence = { text: string; source: string; recency: string }

/** Company-specific context for a Person ↔ Company relationship. */
export type PersonCompanyAssociation = {
  id: string
  personId: string
  companyId: string
  /** Display role title */
  title: string
  role?: string
  team?: string
  fn?: string
  whyThisPerson?: string
  evidence?: ContactEvidence[]
  conversationAngle?: string
  known?: string[]
  maybeRelevant?: string[]
  source: ContactSource
  createdAt: string
}

// ─── Research, Evidence, Opportunity ─────────────────────────────────────────

export type ResearchStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE' | 'FAILED'

export type Research = {
  id: string
  companyId: string
  status: ResearchStatus
  startedAt?: string
  completedAt?: string
  provider?: string
}

export type EvidenceClassification = 'FACT' | 'INFERENCE' | 'UNKNOWN'

export type Evidence = {
  id: string
  companyId: string
  opportunityId?: string
  personId?: string
  researchId?: string
  claim: string
  classification: EvidenceClassification
  sourceName?: string
  sourceUrl?: string
  sourceExcerpt?: string
  collectedAt?: string
}

export type OpportunityStatus = 'ACTIVE' | 'CLOSED' | 'SUPERSEDED'

export type Opportunity = {
  id: string
  companyId: string
  researchId?: string
  type: OppStatus
  status: OpportunityStatus
  roleTitle?: string
  roleUrl?: string
  roleLocation?: string
  roleDescription?: string
  openingSourceUrl?: string
}

// ─── Integration + Sender Account ─────────────────────────────────────────────

export type IntegrationProvider = 'RESEND' | 'SMTP'
export type IntegrationStatus = 'CONNECTED' | 'DISCONNECTED' | 'FAILED' | 'PENDING'

export type Integration = {
  id: string
  provider: IntegrationProvider
  name: string
  status: IntegrationStatus
  apiKey?: string
  smtpHost?: string
  smtpPort?: string
  smtpUsername?: string
  createdAt: string
}

export type SenderAccount = {
  id: string
  name: string
  email: string
  replyTo?: string
  integrationId: string
  isDefault?: boolean
  dailyLimit?: number
  sentToday?: number
  createdAt: string
}

// ─── Outreach domain ──────────────────────────────────────────────────────────

export type OutreachStatus = 'DRAFT' | 'READY' | 'SENT' | 'ARCHIVED'

export type Outreach = {
  id: string
  companyId: string
  personId: string
  personCompanyAssociationId: string
  campaignId?: string
  templateId?: string
  senderAccountId?: string
  subject: string
  message: string
  status: OutreachStatus
  createdAt: string
  sentAt?: string
  conversationId?: string
  isDemo?: boolean
}

// ─── Career Profile ───────────────────────────────────────────────────────────

export type CareerProfile = {
  professionalHeadline?: string
  backgroundAndPositioning?: string
  experienceHighlights?: string
  targetIndustries?: string[]
  targetLocations?: string[]
  /** @deprecated use professionalHeadline */
  headline?: string
}

export function computeCareerProfileCompletion(cp: CareerProfile): { score: number; total: number; done: string[] } {
  const fields: { key: keyof CareerProfile; label: string }[] = [
    { key: 'professionalHeadline', label: 'Professional headline' },
    { key: 'backgroundAndPositioning', label: 'Background & positioning' },
    { key: 'experienceHighlights', label: 'Experience highlights' },
    { key: 'targetIndustries', label: 'Target industries' },
    { key: 'targetLocations', label: 'Target locations' },
  ]
  const done = fields
    .filter(f => {
      const v = cp[f.key]
      if (Array.isArray(v)) return (v as string[]).length > 0
      return typeof v === 'string' && v.trim().length > 0
    })
    .map(f => f.label)
  return { score: done.length, total: fields.length, done }
}

export type OppStatus = 'UNCLASSIFIED' | 'PROACTIVE' | 'CONFIRMED'
export type ResearchStage = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE'
export type ContactStage = 'NOT_DISCOVERED' | 'DISCOVERING' | 'DISCOVERED' | 'SELECTED'
export type OutreachStage = 'NOT_STARTED' | 'DRAFT' | 'READY' | 'SENT'
export type ConvStage = 'NONE' | 'NO_REPLY' | 'REPLIED' | 'ACTIVE' | 'STOPPED'
export type CampaignStage = 'SETUP' | 'READY' | 'SENT'
export type FollowUpStage = 'NONE' | 'DUE' | 'DRAFT' | 'SENT'
export type ConvOutcome =
  | 'INTERESTED'
  | 'FOLLOW_UP_LATER'
  | 'REFERRED'
  | 'APPLICATION'
  | 'NOT_A_FIT'
  | 'NOT_HIRING'
  | 'NO_RESPONSE'
  | 'CLOSED'

export type ConvMessage = {
  id: string
  direction: 'outbound' | 'inbound'
  kind: 'outreach' | 'followup' | 'user-reply' | 'contact-reply'
  body: string
  subject?: string
  timestamp: string
}

export type RelationshipStatus = 'OPEN' | 'NURTURE' | 'OPPORTUNITY' | 'CLOSED'

export const CONV_OUTCOME_LABELS: Record<ConvOutcome, string> = {
  INTERESTED:      'Interested',
  FOLLOW_UP_LATER: 'Asked to follow up later',
  REFERRED:        'Referred me to someone else',
  APPLICATION:     'Application opportunity',
  NOT_A_FIT:       'Not a fit',
  NOT_HIRING:      'Not hiring currently',
  NO_RESPONSE:     'No response',
  CLOSED:          'Closed',
}

export type CompanyStatus = 'ACTIVE' | 'ARCHIVED'

export type CompanyEntry = {
  id: string
  name: string
  domain: string
  industry?: string
  location?: string
  description?: string
  companyStatus?: CompanyStatus
  addedAt: string
  lastActivity: string
  oppStatus: OppStatus
  researchStage: ResearchStage
  contactStage: ContactStage
  selectedContactId?: string
  outreachStage: OutreachStage
  outreachSubject?: string
  outreachMessage?: string
  campaignStage?: CampaignStage
  campaignName?: string
  campaignId?: string
  convStage: ConvStage
  sentAt?: string
  convReplyText?: string
  convOutcome?: ConvOutcome
  convOutcomeNote?: string
  conversationMessages?: ConvMessage[]
  followUpStage?: FollowUpStage
  followUpDueAt?: string
  followUpCount?: number
  followUpSubject?: string
  followUpMessage?: string
  isDemo?: boolean
}

/** Per-workspace payload. Canonical field names. */
export type Workspace = {
  companies: CompanyEntry[]
  campaigns: Campaign[]
  templates: OutreachTemplate[]
  people: Person[]
  personCompanyAssociations: PersonCompanyAssociation[]
  researches: Research[]
  evidence: Evidence[]
  opportunities: Opportunity[]
  integrations: Integration[]
  senderAccounts: SenderAccount[]
  outreaches: Outreach[]
  careerProfile: CareerProfile
  isDemoLoaded: boolean
}

/** Per-workspace record with identity. Extends Workspace — so loadWorkspace() callers
 *  continue to receive a fully assignable value. */
export type WorkspaceRecord = Workspace & {
  id: string
  name: string
  createdAt: string
}

// ─── App-level multi-workspace state ─────────────────────────────────────────

type AppState = {
  version: 2
  activeWorkspaceId: string
  workspaces: WorkspaceRecord[]
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const APP_KEY    = 'outreacher_app_v2'
const LEGACY_KEY = 'outreacher_workspace_v1'

// ─── Internal helpers ─────────────────────────────────────────────────────────

function stripUndefined<T extends object>(obj: T): T {
  const result: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) result[k] = v
  }
  return result as T
}

function cleanRecord(ws: WorkspaceRecord): WorkspaceRecord {
  return {
    ...stripUndefined(ws),
    companies: ws.companies.map(stripUndefined),
    campaigns: (ws.campaigns ?? []).map(c => ({ ...stripUndefined(c), members: c.members.map(stripUndefined) })),
    templates: (ws.templates ?? []).map(stripUndefined),
    people: (ws.people ?? []).map(stripUndefined),
    personCompanyAssociations: (ws.personCompanyAssociations ?? []).map(stripUndefined),
    researches: (ws.researches ?? []).map(stripUndefined),
    evidence: (ws.evidence ?? []).map(stripUndefined),
    opportunities: (ws.opportunities ?? []).map(stripUndefined),
    integrations: (ws.integrations ?? []).map(stripUndefined),
    senderAccounts: (ws.senderAccounts ?? []).map(stripUndefined),
    outreaches: (ws.outreaches ?? []).map(stripUndefined),
    careerProfile: ws.careerProfile ?? {},
  }
}

function emptyRecord(id: string, name: string): WorkspaceRecord {
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  return {
    id, name, createdAt: today,
    companies: [], campaigns: [], templates: [],
    people: [], personCompanyAssociations: [],
    researches: [], evidence: [], opportunities: [],
    integrations: [], senderAccounts: [],
    outreaches: [], careerProfile: {}, isDemoLoaded: false,
  }
}

// ─── Migration from v1 ────────────────────────────────────────────────────────

function normalizeRecord(p: Record<string, unknown>): Omit<WorkspaceRecord, 'id' | 'name' | 'createdAt'> {
  const raw = p as Record<string, unknown>

  // Support legacy field names (contacts/contactAssociations → people/personCompanyAssociations)
  const people: Person[] = ((raw.people ?? raw.contacts) as Person[] | undefined) ?? []

  type LegacyPCA = { personId?: string; contactId?: string; [k: string]: unknown }
  const rawPcas: LegacyPCA[] = ((raw.personCompanyAssociations ?? raw.contactAssociations) as LegacyPCA[] | undefined) ?? []
  // Migrate: populate personId from contactId, then drop contactId so canonical objects are clean
  const personCompanyAssociations: PersonCompanyAssociation[] = rawPcas.map(({ contactId, ...rest }) => ({
    ...rest,
    personId: (rest.personId ?? contactId ?? '') as string,
  } as PersonCompanyAssociation))

  type LegacyOutreach = { personId?: string; contactId?: string; personCompanyAssociationId?: string; associationId?: string; [k: string]: unknown }
  const rawOutreaches: LegacyOutreach[] = ((raw.outreaches) as LegacyOutreach[] | undefined) ?? []
  // Migrate: promote contactId → personId, associationId → personCompanyAssociationId
  const outreaches: Outreach[] = rawOutreaches.map(({ contactId, associationId, ...rest }) => ({
    ...rest,
    personId: (rest.personId ?? contactId ?? '') as string,
    personCompanyAssociationId: (rest.personCompanyAssociationId ?? associationId ?? '') as string,
  } as Outreach))

  // Migrate legacy CampaignMember.contactId → personId
  type LegacyCampaign = { members?: Array<{ contactId?: string; personId?: string; [k: string]: unknown }>; [k: string]: unknown }
  const campaigns: Campaign[] = ((raw.campaigns as LegacyCampaign[]) ?? []).map(c => ({
    ...c,
    members: (c.members ?? []).map(({ contactId, ...m }) => ({
      ...m,
      personId: (m.personId ?? contactId ?? '') as string,
    })),
  })) as Campaign[]

  return {
    companies: (raw.companies as CompanyEntry[]) ?? [],
    campaigns,
    templates: (raw.templates as OutreachTemplate[]) ?? [],
    people,
    personCompanyAssociations,
    researches: (raw.researches as Research[]) ?? [],
    evidence: (raw.evidence as Evidence[]) ?? [],
    opportunities: (raw.opportunities as Opportunity[]) ?? [],
    integrations: (raw.integrations as Integration[]) ?? [],
    senderAccounts: (raw.senderAccounts as SenderAccount[]) ?? [],
    outreaches,
    careerProfile: (raw.careerProfile as CareerProfile) ?? {},
    isDemoLoaded: (raw.isDemoLoaded as boolean) ?? false,
  }
}

function migrateFromV1(): AppState | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as Record<string, unknown>
    const ws: WorkspaceRecord = {
      id: 'workspace-personal', name: 'Personal Career Workspace', createdAt: '1 Jan 2026',
      ...normalizeRecord(p),
    }
    return { version: 2, activeWorkspaceId: 'workspace-personal', workspaces: [ws] }
  } catch { return null }
}

// ─── AppState load / save ─────────────────────────────────────────────────────

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(APP_KEY)
    if (raw) {
      const p = JSON.parse(raw) as Partial<AppState>
      if (p.version === 2 && Array.isArray(p.workspaces) && p.workspaces.length > 0) {
        // Normalize each workspace in case it was saved with old field names
        const normalized: AppState = {
          ...p as AppState,
          workspaces: p.workspaces.map((w: Record<string, unknown>) => ({
            id: w.id as string,
            name: w.name as string,
            createdAt: w.createdAt as string,
            ...normalizeRecord(w),
          })),
        }
        return normalized
      }
    }
  } catch { /* fall through */ }
  const migrated = migrateFromV1()
  if (migrated) { saveAppState(migrated); return migrated }
  const initial = buildInitialAppState()
  saveAppState(initial)
  return initial
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(APP_KEY, JSON.stringify({ ...state, workspaces: state.workspaces.map(cleanRecord) }))
  } catch { /* ignore */ }
}

// ─── Active-workspace backward-compatible accessors ───────────────────────────

export function loadWorkspace(): Workspace {
  const state = loadAppState()
  return state.workspaces.find(w => w.id === state.activeWorkspaceId) ?? state.workspaces[0] ?? emptyRecord('default', 'Workspace')
}

export function saveWorkspace(ws: Workspace): void {
  const state = loadAppState()
  const idx = state.workspaces.findIndex(w => w.id === state.activeWorkspaceId)
  if (idx === -1) return
  state.workspaces[idx] = { ...state.workspaces[idx], ...ws }
  saveAppState(state)
}

// ─── Workspace management ─────────────────────────────────────────────────────

export function getActiveWorkspaceId(): string { return loadAppState().activeWorkspaceId }

export function getWorkspaceName(id?: string): string {
  const state = loadAppState()
  return state.workspaces.find(w => w.id === (id ?? state.activeWorkspaceId))?.name ?? 'Workspace'
}

export function listWorkspaces(): Pick<WorkspaceRecord, 'id' | 'name' | 'createdAt'>[] {
  return loadAppState().workspaces.map(({ id, name, createdAt }) => ({ id, name, createdAt }))
}

export function switchWorkspace(id: string): void {
  const state = loadAppState()
  if (state.workspaces.find(w => w.id === id)) saveAppState({ ...state, activeWorkspaceId: id })
}

export function createWorkspace(name: string): WorkspaceRecord {
  const state = loadAppState()
  const ws = emptyRecord(`workspace-${Date.now()}`, name.trim() || 'New Workspace')
  saveAppState({ ...state, activeWorkspaceId: ws.id, workspaces: [...state.workspaces, ws] })
  return ws
}

export function renameWorkspace(id: string, name: string): void {
  const state = loadAppState()
  saveAppState({ ...state, workspaces: state.workspaces.map(w => w.id === id ? { ...w, name: name.trim() || w.name } : w) })
}

// ─── Initial two-workspace demo state ─────────────────────────────────────────

function buildInitialAppState(): AppState {
  const wsA: WorkspaceRecord = {
    id: 'workspace-personal', name: 'Personal Career Workspace', createdAt: '10 Sep 2026',
    careerProfile: {
      professionalHeadline: 'Senior backend engineer · fintech & payments infrastructure',
      backgroundAndPositioning: 'Built distributed payment systems and core banking APIs at scale. Looking for senior engineering roles at fintech and developer-tooling companies where technical depth matters.',
      targetIndustries: ['Fintech', 'Developer Tools', 'Infrastructure'],
      targetLocations: ['Remote', 'Lagos', 'London'],
    },
    companies: DEMO_ENTRIES,
    people: DEMO_PEOPLE,
    personCompanyAssociations: DEMO_PERSON_COMPANY_ASSOCIATIONS,
    researches: DEMO_RESEARCHES,
    evidence: DEMO_EVIDENCE,
    opportunities: DEMO_OPPORTUNITIES,
    campaigns: DEMO_CAMPAIGNS,
    templates: DEMO_TEMPLATES,
    outreaches: DEMO_OUTREACHES,
    integrations: DEMO_INTEGRATIONS,
    senderAccounts: DEMO_SENDER_ACCOUNTS,
    isDemoLoaded: true,
  }
  const wsB: WorkspaceRecord = {
    id: 'workspace-product-eng', name: 'Product Engineering Search', createdAt: '20 Sep 2026',
    careerProfile: {},
    companies: [
      { id: 'moniepoint-b', name: 'Moniepoint', domain: 'moniepoint.com', addedAt: '20 Sep 2026', lastActivity: 'Just now', oppStatus: 'UNCLASSIFIED', researchStage: 'NOT_STARTED', contactStage: 'NOT_DISCOVERED', outreachStage: 'NOT_STARTED', convStage: 'NONE' },
      { id: 'chimoney-b', name: 'Chimoney', domain: 'chimoney.io', addedAt: '20 Sep 2026', lastActivity: 'Just now', oppStatus: 'UNCLASSIFIED', researchStage: 'NOT_STARTED', contactStage: 'NOT_DISCOVERED', outreachStage: 'NOT_STARTED', convStage: 'NONE' },
    ],
    people: [], personCompanyAssociations: [],
    researches: [], evidence: [], opportunities: [],
    campaigns: [], templates: [],
    outreaches: [], integrations: [], senderAccounts: [], isDemoLoaded: false,
  }
  return { version: 2, activeWorkspaceId: 'workspace-personal', workspaces: [wsA, wsB] }
}

export function newCompanyEntry(
  id: string,
  name: string,
  domain: string,
  status: OppStatus,
  extra?: { industry?: string; location?: string; description?: string },
): CompanyEntry {
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  return {
    id, name, domain,
    industry: extra?.industry,
    location: extra?.location,
    description: extra?.description,
    companyStatus: 'ACTIVE',
    addedAt: today, lastActivity: 'Just now',
    oppStatus: status,
    researchStage: 'NOT_STARTED',
    contactStage: 'NOT_DISCOVERED',
    outreachStage: 'NOT_STARTED',
    convStage: 'NONE',
  }
}

// ─── Demo entries ─────────────────────────────────────────────────────────────

export const DEMO_ENTRIES: CompanyEntry[] = [
  {
    id: 'kuda', name: 'Kuda', domain: 'kuda.com',
    addedAt: '12 Sep 2026', lastActivity: '1 hr ago',
    oppStatus: 'CONFIRMED', researchStage: 'COMPLETE',
    contactStage: 'SELECTED', selectedContactId: 'alex-obi',
    outreachStage: 'SENT', campaignStage: 'SENT',
    campaignName: 'Fintech Engineering Outreach',
    campaignId: 'demo-campaign-1',
    sentAt: '10:14 · 17 Sep 2026',
    convStage: 'ACTIVE',
    followUpStage: 'NONE',
    followUpCount: 0,
    conversationMessages: [
      {
        id: 'kuda_msg1',
        direction: 'outbound',
        kind: 'outreach',
        subject: 'Engineering interest at Kuda',
        body: `Hi Alex,\n\nI've been following Kuda's work on financial infrastructure for the African market — the move from USSD to full-stack banking at scale is technically interesting work.\n\nI noticed Kuda is growing the engineering team. My background is in distributed systems and financial platform engineering, including work on payment rails and core banking APIs.\n\nWould you be open to a short conversation? I'd value the chance to learn more about the technical direction and share a bit about what I've been building.\n\n[Your name]`,
        timestamp: '10:14 · 17 Sep 2026',
      },
      {
        id: 'kuda_msg2',
        direction: 'inbound',
        kind: 'contact-reply',
        body: `Hi,\n\nGood to hear from you — your timing is good. We are building out the engineering team here and there are some real challenges to solve.\n\nYour background in distributed systems and financial platform engineering sounds relevant to what we're working on. I'd be happy to find 30 minutes to talk through the specifics.\n\nLet me send over a calendar link and we can connect this week.\n\nAlex`,
        timestamp: '14:30 · 19 Sep 2026',
      },
    ],
    convReplyText: `Hi,\n\nGood to hear from you — your timing is good. We are building out the engineering team here and there are some real challenges to solve.\n\nYour background in distributed systems and financial platform engineering sounds relevant to what we're working on. I'd be happy to find 30 minutes to talk through the specifics.\n\nLet me send over a calendar link and we can connect this week.\n\nAlex`,
    isDemo: true,
  },
  {
    id: 'stripe', name: 'Stripe', domain: 'stripe.com',
    addedAt: '15 Sep 2026', lastActivity: '2 hr ago',
    oppStatus: 'CONFIRMED', researchStage: 'COMPLETE',
    contactStage: 'DISCOVERED',
    outreachStage: 'NOT_STARTED', convStage: 'NONE', isDemo: true,
  },
  {
    id: 'paystack', name: 'Paystack', domain: 'paystack.com',
    addedAt: '10 Sep 2026', lastActivity: 'Yesterday',
    oppStatus: 'PROACTIVE', researchStage: 'COMPLETE',
    contactStage: 'DISCOVERED',
    outreachStage: 'NOT_STARTED', convStage: 'NONE', isDemo: true,
  },
  {
    id: 'vercel', name: 'Vercel', domain: 'vercel.com',
    addedAt: '16 Sep 2026', lastActivity: '12 min ago',
    oppStatus: 'PROACTIVE', researchStage: 'COMPLETE',
    contactStage: 'NOT_DISCOVERED',
    outreachStage: 'NOT_STARTED', convStage: 'NONE', isDemo: true,
  },
  {
    id: 'flutterwave', name: 'Flutterwave', domain: 'flutterwave.com',
    addedAt: '17 Sep 2026', lastActivity: '3 hr ago',
    oppStatus: 'UNCLASSIFIED', researchStage: 'IN_PROGRESS',
    contactStage: 'NOT_DISCOVERED',
    outreachStage: 'NOT_STARTED', convStage: 'NONE', isDemo: true,
  },
  {
    id: 'linear', name: 'Linear', domain: 'linear.app',
    addedAt: '18 Sep 2026', lastActivity: '2 days ago',
    oppStatus: 'PROACTIVE', researchStage: 'NOT_STARTED',
    contactStage: 'NOT_DISCOVERED',
    outreachStage: 'NOT_STARTED', convStage: 'NONE', isDemo: true,
  },
  {
    id: 'moniepoint', name: 'Moniepoint', domain: 'moniepoint.com',
    addedAt: '17 Sep 2026', lastActivity: '3 days ago',
    oppStatus: 'UNCLASSIFIED', researchStage: 'NOT_STARTED',
    contactStage: 'NOT_DISCOVERED',
    outreachStage: 'NOT_STARTED', convStage: 'NONE', isDemo: true,
  },
]

// ─── Demo templates ───────────────────────────────────────────────────────────

export const DEMO_TEMPLATES: OutreachTemplate[] = [
  {
    id: 'demo-template-1',
    name: 'Fintech Engineering Intro',
    category: 'NETWORKING',
    subject: 'Engineering interest at {{company}}',
    body: `Hi {{firstName}},\n\nI've been following {{company}}'s work on financial infrastructure — the technical challenges at scale are exactly the kind of work I find compelling.\n\nMy background is in distributed systems and financial platform engineering. I've built payment rails and core banking APIs and would love to learn more about how your engineering team is structured.\n\nWould you be open to a short conversation? I'd value the chance to understand the technical direction.\n\n[Your name]`,
    createdAt: '12 Sep 2026',
    updatedAt: '17 Sep 2026',
    isDemo: true,
  },
  {
    id: 'demo-template-2',
    name: 'Hiring Manager Direct',
    category: 'HIRING_MANAGER',
    subject: 'Senior engineering inquiry — {{company}}',
    body: `Hi {{firstName}},\n\nI noticed {{company}} is growing the engineering team and wanted to reach out directly.\n\nI'm an experienced backend engineer with a focus on scalable APIs and infrastructure. I've led platform work at two fintech companies and built systems handling millions of transactions daily.\n\nI'd love a short call to understand whether there might be a fit. Happy to send a CV or portfolio at your request.\n\nBest,\n[Your name]`,
    createdAt: '14 Sep 2026',
    updatedAt: '14 Sep 2026',
    isDemo: true,
  },
]

// ─── Demo campaigns ───────────────────────────────────────────────────────────

export const DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: 'demo-campaign-1',
    name: 'Fintech Engineering Outreach',
    status: 'ACTIVE',
    templateId: 'demo-template-1',
    templateName: 'Fintech Engineering Intro',
    createdAt: '16 Sep 2026',
    lastActivity: '1 hr ago',
    isDemo: true,
    members: [
      {
        id: 'mem-kuda-alex',
        personId: 'contact-alex-obi',
        contactName: 'Alex Obi',
        companyId: 'kuda',
        companyName: 'Kuda',
        status: 'REPLIED',
        sentAt: '10:14 · 17 Sep 2026',
        lastActivity: '1 hr ago',
        personalizedSubject: 'Engineering interest at Kuda',
        personalizedBody: `Hi Alex,\n\nI've been following Kuda's work on financial infrastructure for the African market — the move from USSD to full-stack banking at scale is technically interesting work.\n\nI noticed Kuda is growing the engineering team. My background is in distributed systems and financial platform engineering, including work on payment rails and core banking APIs.\n\nWould you be open to a short conversation? I'd value the chance to learn more about the technical direction and share a bit about what I've been building.\n\n[Your name]`,
      },
      {
        id: 'mem-paystack-dele',
        personId: 'contact-dele-adeyemi',
        contactName: 'Dele Adeyemi',
        companyId: 'paystack',
        companyName: 'Paystack',
        status: 'SENT',
        sentAt: '10:16 · 17 Sep 2026',
        lastActivity: 'Yesterday',
        personalizedSubject: 'Engineering interest at Paystack',
        personalizedBody: `Hi Dele,\n\nI've been following Paystack's work on online and offline payments for African businesses. The infrastructure challenges at the scale you operate are genuinely interesting.\n\nMy background is in financial platform engineering, and I've built payment integrations and APIs in regulated environments. I noticed Paystack is expanding the engineering team.\n\nWould you be open to a short conversation?\n\n[Your name]`,
      },
      {
        id: 'mem-stripe-priya',
        personId: 'contact-priya-mehta',
        contactName: 'Priya Mehta',
        companyId: 'stripe',
        companyName: 'Stripe',
        status: 'SENT',
        sentAt: '10:18 · 17 Sep 2026',
        lastActivity: 'Yesterday',
        personalizedSubject: 'Engineering interest at Stripe',
        personalizedBody: `Hi Priya,\n\nI've been following Stripe's work on financial infrastructure for the internet. The engineering problems at Stripe's scale are among the most interesting in the industry.\n\nMy background is in distributed systems and financial platform engineering. I'd love to learn more about how your engineering team is structured and whether there might be relevant opportunities.\n\nWould you be open to a short conversation?\n\n[Your name]`,
      },
    ],
  },
  {
    id: 'demo-campaign-2',
    name: 'Developer Relations Network',
    status: 'READY',
    templateId: 'demo-template-2',
    templateName: 'Hiring Manager Direct',
    createdAt: '19 Sep 2026',
    lastActivity: '2 hr ago',
    isDemo: true,
    members: [
      {
        id: 'mem-stripe-james',
        personId: 'contact-james-wu',
        contactName: 'James Wu',
        companyId: 'stripe',
        companyName: 'Stripe',
        status: 'READY',
        lastActivity: '2 hr ago',
        personalizedSubject: 'Senior engineering inquiry — Stripe',
        personalizedBody: `Hi James,\n\nI noticed Stripe is growing the engineering team and wanted to reach out directly.\n\nI'm an experienced backend engineer with a focus on scalable APIs and infrastructure. I've led platform work at two fintech companies and built systems handling millions of transactions daily.\n\nI'd love a short call to understand whether there might be a fit.\n\nBest,\n[Your name]`,
      },
      {
        id: 'mem-paystack-amara',
        personId: 'contact-amara-nwosu',
        contactName: 'Amara Nwosu',
        companyId: 'paystack',
        companyName: 'Paystack',
        status: 'READY',
        lastActivity: '2 hr ago',
        personalizedSubject: 'Senior engineering inquiry — Paystack',
        personalizedBody: `Hi Amara,\n\nI noticed Paystack is growing the team and wanted to reach out directly.\n\nI'm an experienced backend engineer with a focus on scalable APIs and infrastructure. I've led platform work at two fintech companies and built systems handling millions of transactions daily.\n\nI'd love a short call to understand whether there might be a fit.\n\nBest,\n[Your name]`,
      },
    ],
  },
]

// ─── Demo contacts ────────────────────────────────────────────────────────────

export const DEMO_PEOPLE: Person[] = [
  { id: 'contact-priya-mehta',    contactType: 'PERSON', firstName: 'Priya',  lastName: 'Mehta',    email: 'priya.mehta@stripe.com',    source: 'DISCOVERED', avatarInitials: 'PM', avatarBg: '#7C3AED', createdAt: '15 Sep 2026' },
  { id: 'contact-james-wu',       contactType: 'PERSON', firstName: 'James',  lastName: 'Wu',       email: 'james.wu@stripe.com',       source: 'DISCOVERED', avatarInitials: 'JW', avatarBg: '#0F766E', createdAt: '15 Sep 2026' },
  { id: 'contact-sara-okonkwo',   contactType: 'PERSON', firstName: 'Sara',   lastName: 'Okonkwo',  email: 'sara.okonkwo@stripe.com',   source: 'DISCOVERED', avatarInitials: 'SO', avatarBg: '#B45309', createdAt: '15 Sep 2026' },
  { id: 'contact-dele-adeyemi',   contactType: 'PERSON', firstName: 'Dele',   lastName: 'Adeyemi',  email: 'dele.adeyemi@paystack.com', source: 'DISCOVERED', avatarInitials: 'DA', avatarBg: '#0369A1', createdAt: '10 Sep 2026' },
  { id: 'contact-amara-nwosu',    contactType: 'PERSON', firstName: 'Amara',  lastName: 'Nwosu',    email: 'amara.nwosu@paystack.com',  source: 'DISCOVERED', avatarInitials: 'AN', avatarBg: '#BE185D', createdAt: '10 Sep 2026' },
  { id: 'contact-alex-obi',       contactType: 'PERSON', firstName: 'Alex',   lastName: 'Obi',      email: 'alex.obi@kuda.com',         source: 'DISCOVERED', avatarInitials: 'AO', avatarBg: '#1D4ED8', createdAt: '12 Sep 2026' },
]

export const DEMO_PERSON_COMPANY_ASSOCIATIONS: PersonCompanyAssociation[] = [
  {
    id: 'assoc-priya-stripe', personId: 'contact-priya-mehta', companyId: 'stripe',
    title: 'Engineering Manager', team: 'Engineering', fn: 'Engineering Management',
    whyThisPerson: 'Priya leads the engineering team responsible for hiring senior engineers. She has the context to evaluate technical backgrounds and the authority to move candidates forward in the process.',
    evidence: [
      { text: 'Posted about growing the engineering team on LinkedIn',         source: 'LinkedIn', recency: '2 weeks ago' },
      { text: 'Mentioned interest in distributed systems at Stripe Dev Summit', source: 'Conference', recency: '1 month ago' },
    ],
    conversationAngle: 'Focus on distributed systems experience and interest in payments infrastructure at scale.',
    known: ['Engineering Management', 'Distributed Systems', 'Team Building'],
    maybeRelevant: ['Open Source Contributions', 'Payment Systems'],
    source: 'DISCOVERED', createdAt: '15 Sep 2026',
  },
  {
    id: 'assoc-james-stripe', personId: 'contact-james-wu', companyId: 'stripe',
    title: 'Senior Software Engineer', team: 'Engineering', fn: 'Engineering',
    whyThisPerson: 'James is a senior engineer on the infrastructure team. He can provide ground-level insight into the technical environment and may refer strong candidates to the hiring manager.',
    evidence: [
      { text: 'Published technical blog post on Stripe infrastructure', source: 'Stripe Blog', recency: '3 weeks ago' },
    ],
    conversationAngle: 'Share interest in infrastructure engineering and ask about team culture.',
    known: ['Infrastructure', 'Go', 'Kubernetes'],
    source: 'DISCOVERED', createdAt: '15 Sep 2026',
  },
  {
    id: 'assoc-sara-stripe', personId: 'contact-sara-okonkwo', companyId: 'stripe',
    title: 'Technical Recruiter', team: 'Talent', fn: 'Recruiting',
    whyThisPerson: 'Sara manages technical recruiting for the engineering org. She is the gateway for formal applications and can also guide informally when the timing is right.',
    evidence: [
      { text: 'Actively posting engineering roles on LinkedIn', source: 'LinkedIn', recency: '1 week ago' },
    ],
    conversationAngle: 'Express interest in engineering roles and ask about the best path to connect with the team.',
    known: ['Technical Recruiting', 'Engineering Hiring'],
    source: 'DISCOVERED', createdAt: '15 Sep 2026',
  },
  {
    id: 'assoc-dele-paystack', personId: 'contact-dele-adeyemi', companyId: 'paystack',
    title: 'Head of Engineering', team: 'Engineering', fn: 'Engineering Leadership',
    whyThisPerson: 'Dele leads engineering at Paystack and is actively expanding the platform team. He is the right person to reach for senior technical conversations.',
    evidence: [
      { text: 'Gave a keynote at AfricaTech 2026 about Paystack engineering culture', source: 'Conference', recency: '2 months ago' },
      { text: 'Tweeted about hiring senior engineers for the platform team',             source: 'Twitter',    recency: '3 weeks ago' },
    ],
    conversationAngle: 'Focus on payment systems engineering and building infrastructure in high-growth markets.',
    known: ['Engineering Leadership', 'Platform Engineering', 'Payments'],
    maybeRelevant: ['Open Source', 'DevRel'],
    source: 'DISCOVERED', createdAt: '10 Sep 2026',
  },
  {
    id: 'assoc-amara-paystack', personId: 'contact-amara-nwosu', companyId: 'paystack',
    title: 'Software Engineer', team: 'Backend', fn: 'Engineering',
    whyThisPerson: 'Amara works on Paystack\'s core payment APIs. A peer connection who can share team culture and potentially refer strong candidates to Dele.',
    evidence: [
      { text: 'Active contributor to open-source payment tooling on GitHub', source: 'GitHub', recency: '1 month ago' },
    ],
    conversationAngle: 'Connect peer-to-peer on backend engineering and payment API design.',
    known: ['Python', 'REST APIs', 'Payments'],
    source: 'DISCOVERED', createdAt: '10 Sep 2026',
  },
  {
    id: 'assoc-alex-kuda', personId: 'contact-alex-obi', companyId: 'kuda',
    title: 'VP of Engineering', team: 'Engineering', fn: 'Engineering Leadership',
    whyThisPerson: 'Alex leads Kuda\'s engineering organisation and is building out the team that handles core banking infrastructure. He has direct hiring authority for senior engineering roles.',
    evidence: [
      { text: 'Shared a post about scaling mobile banking infrastructure in Africa', source: 'LinkedIn', recency: '1 week ago' },
      { text: 'Kuda engineering blog article on distributed systems challenges',        source: 'Blog',     recency: '1 month ago' },
    ],
    conversationAngle: 'Lead with distributed systems and core banking API experience. Reference the specific challenge of building banking infrastructure for mobile-first markets.',
    known: ['Engineering Leadership', 'Core Banking', 'Mobile Infrastructure'],
    maybeRelevant: ['Fintech Regulation', 'Team Scaling'],
    source: 'DISCOVERED', createdAt: '12 Sep 2026',
  },
]

export const DEMO_RESEARCHES: Research[] = [
  { id: 'research-stripe-1',   companyId: 'stripe',   status: 'COMPLETE',   startedAt: '14 Sep 2026', completedAt: '15 Sep 2026', provider: 'internal' },
  { id: 'research-paystack-1', companyId: 'paystack', status: 'COMPLETE',   startedAt: '09 Sep 2026', completedAt: '10 Sep 2026', provider: 'internal' },
  { id: 'research-kuda-1',     companyId: 'kuda',     status: 'IN_PROGRESS', startedAt: '12 Sep 2026', provider: 'internal' },
]

export const DEMO_EVIDENCE: Evidence[] = [
  {
    id: 'ev-stripe-hiring',  companyId: 'stripe',  researchId: 'research-stripe-1',
    claim: 'Stripe is actively hiring senior engineers across infrastructure and payments teams.',
    classification: 'FACT', sourceName: 'Stripe Careers', collectedAt: '15 Sep 2026',
  },
  {
    id: 'ev-stripe-growth',  companyId: 'stripe',  researchId: 'research-stripe-1',
    claim: 'Engineering headcount grew ~20% in 2026, with particular depth in distributed systems.',
    classification: 'INFERENCE', sourceName: 'LinkedIn', collectedAt: '15 Sep 2026',
  },
  {
    id: 'ev-paystack-hiring', companyId: 'paystack', researchId: 'research-paystack-1',
    claim: 'Paystack is expanding the platform engineering team following Stripe acquisition integration.',
    classification: 'FACT', sourceName: 'Twitter / X', collectedAt: '10 Sep 2026',
  },
  {
    id: 'ev-paystack-platform', companyId: 'paystack', researchId: 'research-paystack-1',
    claim: 'Platform team is rebuilding internal tooling for cross-border payment orchestration.',
    classification: 'INFERENCE', sourceName: 'Engineering Blog', collectedAt: '10 Sep 2026',
  },
  {
    id: 'ev-kuda-infra', companyId: 'kuda', researchId: 'research-kuda-1',
    claim: 'Kuda is scaling core banking infrastructure to support rapid user growth in West Africa.',
    classification: 'FACT', sourceName: 'LinkedIn', collectedAt: '12 Sep 2026',
  },
]

export const DEMO_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-stripe-1', companyId: 'stripe', researchId: 'research-stripe-1',
    type: 'CONFIRMED', status: 'ACTIVE',
    roleTitle: 'Senior Software Engineer – Infrastructure',
    roleLocation: 'Remote / San Francisco',
    roleDescription: 'Senior engineering role on the infrastructure team building highly-reliable payment processing systems.',
    openingSourceUrl: 'https://stripe.com/jobs',
  },
  {
    id: 'opp-paystack-1', companyId: 'paystack', researchId: 'research-paystack-1',
    type: 'PROACTIVE', status: 'ACTIVE',
    roleTitle: 'Platform Engineer',
    roleLocation: 'Lagos / Remote',
    roleDescription: 'Platform engineering opportunity identified through team expansion signals. No formal posting found yet.',
  },
  {
    id: 'opp-kuda-1', companyId: 'kuda', researchId: 'research-kuda-1',
    type: 'UNCLASSIFIED', status: 'ACTIVE',
    roleTitle: 'Unknown — Research In Progress',
    roleDescription: 'Kuda research is in progress. Opportunity classification pending evidence review.',
  },
]

export const DEMO_INTEGRATIONS: Integration[] = [
  {
    id: 'demo-integration-resend',
    provider: 'RESEND',
    name: 'Resend',
    status: 'CONNECTED',
    apiKey: 're_••••••••••••••••••••••',
    createdAt: '16 Sep 2026',
  },
]

export const DEMO_SENDER_ACCOUNTS: SenderAccount[] = [
  {
    id: 'demo-sender-1',
    name: 'Your Name',
    email: 'yourname@example.com',
    replyTo: 'yourname@example.com',
    integrationId: 'demo-integration-resend',
    isDefault: true,
    dailyLimit: 50,
    sentToday: 3,
    createdAt: '16 Sep 2026',
  },
]

export const DEMO_OUTREACHES: Outreach[] = [
  {
    id: 'demo-outreach-kuda-alex',
    companyId: 'kuda',
    personId: 'contact-alex-obi',
    personCompanyAssociationId: 'assoc-alex-kuda',
    campaignId: 'demo-campaign-1',
    templateId: 'demo-template-1',
    senderAccountId: 'demo-sender-1',
    subject: 'Engineering interest at Kuda',
    message: `Hi Alex,\n\nI've been following Kuda's work on financial infrastructure for the African market — the move from USSD to full-stack banking at scale is technically interesting work.\n\nI noticed Kuda is growing the engineering team. My background is in distributed systems and financial platform engineering, including work on payment rails and core banking APIs.\n\nWould you be open to a short conversation? I'd value the chance to learn more about the technical direction and share a bit about what I've been building.\n\n[Your name]`,
    status: 'SENT',
    createdAt: '16 Sep 2026',
    sentAt: '10:14 · 17 Sep 2026',
    conversationId: 'kuda',
    isDemo: true,
  },
  {
    id: 'demo-outreach-paystack-dele',
    companyId: 'paystack',
    personId: 'contact-dele-adeyemi',
    personCompanyAssociationId: 'assoc-dele-paystack',
    campaignId: 'demo-campaign-1',
    templateId: 'demo-template-1',
    senderAccountId: 'demo-sender-1',
    subject: 'Engineering interest at Paystack',
    message: `Hi Dele,\n\nI've been following Paystack's work on online and offline payments for African businesses. The infrastructure challenges at the scale you operate are genuinely interesting.\n\nMy background is in financial platform engineering, and I've built payment integrations and APIs in regulated environments. I noticed Paystack is expanding the engineering team.\n\nWould you be open to a short conversation?\n\n[Your name]`,
    status: 'SENT',
    createdAt: '16 Sep 2026',
    sentAt: '10:16 · 17 Sep 2026',
    isDemo: true,
  },
  {
    id: 'demo-outreach-stripe-priya',
    companyId: 'stripe',
    personId: 'contact-priya-mehta',
    personCompanyAssociationId: 'assoc-priya-stripe',
    campaignId: 'demo-campaign-1',
    templateId: 'demo-template-1',
    senderAccountId: 'demo-sender-1',
    subject: 'Engineering interest at Stripe',
    message: `Hi Priya,\n\nI've been following Stripe's work on financial infrastructure for the internet. The engineering problems at Stripe's scale are among the most interesting in the industry.\n\nMy background is in distributed systems and financial platform engineering. I'd love to learn more about how your engineering team is structured and whether there might be relevant opportunities.\n\nWould you be open to a short conversation?\n\n[Your name]`,
    status: 'SENT',
    createdAt: '16 Sep 2026',
    sentAt: '10:18 · 17 Sep 2026',
    isDemo: true,
  },
  {
    id: 'demo-outreach-stripe-james-draft',
    companyId: 'stripe',
    personId: 'contact-james-wu',
    personCompanyAssociationId: 'assoc-james-stripe',
    templateId: 'demo-template-2',
    subject: 'Senior engineering inquiry — Stripe',
    message: `Hi James,\n\nI noticed Stripe is growing the engineering team and wanted to reach out directly.\n\nI'm an experienced backend engineer with a focus on scalable APIs and infrastructure. I've led platform work at two fintech companies and built systems handling millions of transactions daily.\n\nI'd love a short call to understand whether there might be a fit.\n\nBest,\n[Your name]`,
    status: 'READY',
    createdAt: '19 Sep 2026',
    isDemo: true,
  },
]

// ─── Business-day helpers ─────────────────────────────────────────────────────

export function addBusinessDays(date: Date, days: number): Date {
  let count = 0
  const d = new Date(date.getTime())
  while (count < days) {
    d.setDate(d.getDate() + 1)
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) count++
  }
  return d
}

export function calcFollowUpDueAt(fromDate: Date): string {
  const due = addBusinessDays(fromDate, 4)
  return due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Conversation message helpers ─────────────────────────────────────────────

export function getConversationMessages(entry: CompanyEntry): ConvMessage[] {
  if (entry.conversationMessages && entry.conversationMessages.length > 0) {
    return entry.conversationMessages
  }
  // backward compat: synthesize from legacy single-field storage
  const msgs: ConvMessage[] = []
  if (entry.outreachSubject && entry.outreachMessage) {
    msgs.push({
      id: 'compat_outreach',
      direction: 'outbound',
      kind: 'outreach',
      subject: entry.outreachSubject,
      body: entry.outreachMessage,
      timestamp: entry.sentAt ?? 'Sent',
    })
  }
  if (entry.convReplyText) {
    msgs.push({
      id: 'compat_reply',
      direction: 'inbound',
      kind: 'contact-reply',
      body: entry.convReplyText,
      timestamp: entry.lastActivity ?? 'Recently',
    })
  }
  return msgs
}

// ─── Derived display helpers ──────────────────────────────────────────────────

export function deriveStateLabel(entry: CompanyEntry): string {
  if (entry.convStage === 'STOPPED') return 'Conversation stopped'
  if (entry.convStage === 'ACTIVE') return 'Reply received · Conversation active'
  if (entry.convStage === 'REPLIED') return 'Reply received · Awaiting response'
  if (entry.followUpStage === 'DUE') return 'Follow-up due · Review before sending'
  if (entry.followUpStage === 'DRAFT') return 'Follow-up drafted · Ready to send'
  if (entry.followUpStage === 'SENT') return 'Follow-up sent · Awaiting reply'
  if (entry.outreachStage === 'SENT') return 'Outreach sent · Awaiting reply'
  if (entry.campaignStage === 'READY') return 'Campaign ready · Ready to send'
  if (entry.campaignStage === 'SETUP') return 'Campaign setup in progress'
  if (entry.outreachStage === 'READY') return 'Draft approved · Create campaign'
  if (entry.outreachStage === 'DRAFT') return 'Outreach draft ready for review'
  if (entry.contactStage === 'SELECTED') return 'Contact selected · Ready for outreach'
  if (entry.contactStage === 'DISCOVERED') return 'Contacts identified · Awaiting review'
  if (entry.contactStage === 'DISCOVERING') return 'Contact discovery in progress'
  if (entry.researchStage === 'COMPLETE' && entry.oppStatus !== 'UNCLASSIFIED') return 'Research complete · Opportunity classified'
  if (entry.researchStage === 'COMPLETE') return 'Research complete · Review findings'
  if (entry.researchStage === 'IN_PROGRESS') return 'Research in progress'
  return 'Newly added'
}

export function deriveNextAction(entry: CompanyEntry): string {
  if (entry.convStage === 'STOPPED') return 'View conversation'
  if (entry.convStage === 'ACTIVE') return 'Continue conversation'
  if (entry.convStage === 'REPLIED') return 'View reply'
  if (entry.followUpStage === 'DUE') return 'Send follow-up'
  if (entry.followUpStage === 'DRAFT') return 'Review follow-up'
  if (entry.followUpStage === 'SENT') return 'Awaiting reply'
  if (entry.outreachStage === 'SENT') return 'Awaiting reply'
  if (entry.campaignStage === 'READY') return 'Send outreach'
  if (entry.campaignStage === 'SETUP') return 'Complete setup'
  if (entry.outreachStage === 'READY') return 'Create campaign'
  if (entry.outreachStage === 'DRAFT') return 'Review draft'
  if (entry.contactStage === 'SELECTED') return 'Prepare outreach'
  if (entry.contactStage === 'DISCOVERED') return 'Review contacts'
  if (entry.contactStage === 'DISCOVERING') return 'Discovery running'
  if (entry.researchStage === 'COMPLETE' && entry.oppStatus !== 'UNCLASSIFIED') return 'Find contacts'
  if (entry.researchStage === 'COMPLETE') return 'Review opportunity'
  if (entry.researchStage === 'IN_PROGRESS') return 'Awaiting research'
  return 'Start research'
}

export function deriveActionable(entry: CompanyEntry): boolean {
  return entry.researchStage !== 'IN_PROGRESS' && entry.contactStage !== 'DISCOVERING'
}

export type ContactLifecycleState = 'DISCOVERED' | 'SELECTED' | 'CONTACTED' | 'REPLIED' | 'ACTIVE' | 'NURTURE' | 'CLOSED'

export function deriveContactLifecycle(entry: CompanyEntry): ContactLifecycleState {
  if (entry.convOutcome) {
    const rel = deriveRelationshipStatus(entry)
    if (rel === 'CLOSED') return 'CLOSED'
    if (rel === 'NURTURE') return 'NURTURE'
    if (rel === 'OPPORTUNITY') return 'ACTIVE'
  }
  if (entry.convStage === 'STOPPED') return 'CLOSED'
  if (entry.convStage === 'ACTIVE') return 'ACTIVE'
  if (entry.convStage === 'REPLIED') return 'REPLIED'
  if (entry.outreachStage === 'SENT') return 'CONTACTED'
  if (entry.contactStage === 'SELECTED') return 'SELECTED'
  return 'DISCOVERED'
}

export function deriveRelationshipStatus(entry: CompanyEntry): RelationshipStatus | null {
  switch (entry.convOutcome) {
    case 'INTERESTED':
    case 'APPLICATION':
    case 'REFERRED':
      return 'OPPORTUNITY'
    case 'FOLLOW_UP_LATER':
    case 'NOT_HIRING':
      return 'NURTURE'
    case 'NOT_A_FIT':
    case 'CLOSED':
    case 'NO_RESPONSE':
      return 'CLOSED'
  }
  if (entry.convStage === 'ACTIVE' || entry.convStage === 'REPLIED') return 'OPEN'
  if (entry.outreachStage === 'SENT') return 'OPEN'
  return null
}

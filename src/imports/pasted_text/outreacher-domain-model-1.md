# Outreacher Prototype — Complete the Production-Aligned Domain Model

The previous implementation successfully added the Workspace layer.

**Do not undo or redesign that work.**

The current implementation now has:

* `AppState`
* `activeWorkspaceId`
* multiple workspaces
* workspace switching
* workspace creation
* workspace renaming
* workspace-scoped persistence
* old-storage migration
* workspace switcher UI
* active workspace displayed in the application
* TypeScript passing

Keep all of that.

However, the previous implementation explicitly deferred part of the requested domain-model alignment:

* Person / Contact → Person + PersonCompanyAssociation
* explicit Research
* explicit Evidence
* explicit Opportunity

Complete those pieces now.

This is still a **Figma Make prototype**.

Do NOT add production backend complexity.

The goal is:

> **Production-aligned domain concepts, simplified prototype implementation.**

---

# 1. DO NOT REBUILD THE WORKSPACE ARCHITECTURE

Treat the existing Workspace implementation as the foundation.

Do not:

* replace AppState again
* redesign the workspace switcher
* remove workspace switching
* change the localStorage strategy unnecessarily
* introduce backend APIs
* introduce Prisma
* introduce database code
* introduce real authentication
* introduce queues
* introduce real research workers
* introduce real email infrastructure

Only make the domain model changes necessary to align the prototype with production.

---

# 2. THE TARGET PROTOTYPE DOMAIN

The prototype should conceptually contain:

```text
Workspace
├── CareerProfile
├── Companies
├── Research
├── Evidence
├── Opportunities
├── People
├── PersonCompanyAssociations
├── Outreaches
├── Campaigns
├── CampaignMembers
├── EmailTemplates
├── ConversationMessages
├── Integrations
└── SenderAccounts
```

These are the product-level concepts.

They do NOT need to reproduce the full production Prisma schema.

---

# 3. PERSON / CONTACT MODEL MUST BE CORRECTED

This is the most important remaining domain correction.

The prototype currently has legacy `contacts` / `contactAssociations`.

Do not leave that as the conceptual source of truth.

Introduce:

```ts
Person {
  id
  workspaceId

  firstName
  lastName
  email?
  websiteUrl?
  linkedinUrl?

  source?
  sourceUrl?
  note?
}
```

And:

```ts
PersonCompanyAssociation {
  id

  workspaceId
  personId
  companyId

  role?
  team?

  whyThisPerson?
  conversationAngle?
}
```

The relationship is:

```text
Workspace
   │
   ├── Person
   │
   └── Company
          │
          └── PersonCompanyAssociation
```

A person is global within the workspace.

Their company-specific context belongs to the association.

---

# 4. IMPORTANT PERSON RULE

Do NOT model this:

```text
Company A
  └── Jane Doe

Company B
  └── Jane Doe
```

as two separate people.

It must conceptually be:

```text
Person
└── Jane Doe
      │
      ├── Association → Company A
      │      ├── Role
      │      ├── Team
      │      ├── Why this person
      │      └── Conversation angle
      │
      └── Association → Company B
             ├── Role
             ├── Team
             ├── Why this person
             └── Conversation angle
```

This must be reflected in the actual prototype behavior, not just TypeScript types.

---

# 5. MIGRATE EXISTING CONTACT DATA

Do not throw away existing prototype/demo data.

Create a migration/normalization path from:

```text
contacts
contactAssociations
```

to:

```text
people
personCompanyAssociations
```

Where an existing contact represents the same person across multiple companies:

* create one Person
* create one association per company

Move company-specific fields such as:

* title / role
* team
* whyThisPerson
* conversationAngle

onto the association.

Global fields such as:

* name
* email
* LinkedIn
* website

belong to Person.

---

# 6. CONTACTS UI MUST REMAIN GLOBAL

The existing `/contacts` route should continue to work.

But it should now operate from `people`.

Global Contacts should show one person once.

Example:

```text
Jane Doe
Engineering Manager
2 companies
```

Clicking Jane opens:

```text
/contacts/:id
```

Her detail page should show her company relationships.

---

# 7. COMPANY CONTACTS MUST USE ASSOCIATIONS

Inside:

```text
Company → Contacts
```

the UI should display People through their association with that company.

The company page should therefore show:

```text
Jane Doe
Engineering Manager
Why this person...
Conversation angle...
```

but this information comes from:

```text
Person
+
PersonCompanyAssociation for this company
```

not from a company-owned duplicate Contact.

---

# 8. CONTACT DETAIL COMPANY SWITCHING

If a person has multiple company associations, the existing company selector should work against the new association model.

Example:

```text
Jane Doe

Company:
[ Moniepoint ▾ ]
```

Selecting Flutterwave changes:

* role
* team
* why this person
* conversation angle
* company context
* company-specific timeline/context

without changing Jane's global identity.

---

# 9. RESEARCH MUST BECOME AN EXPLICIT DOMAIN ENTITY

The prototype already has a research lifecycle.

Keep that experience.

But represent Research explicitly:

```ts
Research {
  id
  workspaceId
  companyId

  status

  startedAt?
  completedAt?

  provider?
}
```

Status:

```text
NOT_STARTED
IN_PROGRESS
COMPLETE
FAILED
```

If the existing prototype calls this something else, normalize it rather than creating two competing research models.

There should be one canonical Research representation.

---

# 10. EVIDENCE MUST BE EXPLICIT

Create/use:

```ts
Evidence {
  id
  workspaceId

  companyId

  opportunityId?
  personId?
  researchId?

  claim

  classification

  sourceName?
  sourceUrl?
  sourceExcerpt?

  collectedAt?
}
```

Classification:

```text
FACT
INFERENCE
UNKNOWN
```

The existing research UI should consume this structure.

Do not create a second evidence system.

---

# 11. EVIDENCE RELATIONSHIPS

Evidence can support:

```text
Company
Opportunity
Person
Research
```

Examples:

```text
Evidence
  → Company
```

means:

> something factual about the company.

```text
Evidence
  → Opportunity
```

means:

> evidence supporting an opportunity classification.

```text
Evidence
  → Person
```

means:

> evidence relevant to why this person may matter.

The prototype does not need complicated graph infrastructure.

Simple IDs/references are sufficient.

---

# 12. OPPORTUNITY MUST BE EXPLICIT

Use:

```ts
Opportunity {
  id
  workspaceId
  companyId

  researchId?

  type
  status

  roleTitle?
  roleUrl?
  roleLocation?
  roleDescription?

  openingSourceUrl?
}
```

Type:

```text
CONFIRMED
PROACTIVE
UNCLASSIFIED
```

Status:

```text
ACTIVE
CLOSED
SUPERSEDED
```

The existing Opportunities UI should operate on this entity.

---

# 13. PRESERVE OPPORTUNITY SEMANTICS

Do not change these definitions.

### CONFIRMED

Requires evidence of an actual relevant opening.

### PROACTIVE

No confirmed opening, but enough company-fit/context exists to justify relationship-building.

### UNCLASSIFIED

There isn't enough evidence to classify the opportunity.

Career-profile matching alone must NOT make an opportunity CONFIRMED.

---

# 14. RESEARCH → EVIDENCE → OPPORTUNITY

The domain relationship should now be explicit:

```text
Company
   ↓
Research
   ↓
Evidence
   ↓
Opportunity
```

An opportunity may reference the research that produced it.

Evidence may reference both the research and opportunity.

The UI should continue showing the user-facing relationship:

```text
What we found
↓
Evidence
↓
What it might mean
↓
Opportunity
```

---

# 15. OUTREACH MUST USE THE NEW PERSON MODEL

Update Outreach so its conceptual references are:

```ts
Outreach {
  id

  workspaceId
  companyId
  personId
  personCompanyAssociationId

  campaignId?
  templateId?
  senderAccountId?

  subject
  message

  status
}
```

This matters because the outreach is not merely addressed to:

> Jane Doe

It is addressed to:

> Jane Doe, in the context of her relationship with Company A.

The selected association determines:

* role
* why this person
* conversation angle
* company context

---

# 16. OUTREACH PREPARATION

The existing preparation experience should therefore resolve:

```text
Workspace
↓
Company
↓
Opportunity
↓
Person
↓
PersonCompanyAssociation
↓
Evidence
↓
Outreach
```

Before generation, show the user:

### Company

Why this company is relevant.

### Opportunity

Confirmed / Proactive / Unclassified and why.

### Person

Why this person.

### Association

Their company-specific role and conversation angle.

### Evidence

The supporting evidence.

Then allow:

```text
Prepare outreach
↓
Generate
↓
Edit
↓
Ready
↓
Send
```

Do not expose hidden AI chain-of-thought.

Only show concise user-facing reasoning and evidence.

---

# 17. CAMPAIGN ALIGNMENT

Keep the existing Campaign domain.

Conceptually:

```ts
Campaign {
  id
  workspaceId

  companyId?
  senderAccountId?
  templateId?

  name
  status
  followUpDelayBusinessDays
}
```

CampaignMember can remain simplified:

```ts
CampaignMember {
  id
  campaignId
  personId
  status

  targetRole?
  outreachReason?
  currentSubject?
  currentBody?

  selectedOpportunityId?
}
```

Do not add production email queue mechanics.

---

# 18. CONVERSATION ALIGNMENT

Keep the current first-class Conversations domain.

Conceptually:

```text
Outreach
   ↓
Conversation
   ↓
ConversationMessages
```

The existing prototype conversation lifecycle remains valid:

```text
NO_REPLY
REPLIED
ACTIVE
STOPPED
```

Preserve these invariants:

* REPLIED does not automatically become ACTIVE
* Continue conversation is explicit
* STOPPED is terminal

---

# 19. INTEGRATION / SENDER ACCOUNT ALIGNMENT

Keep the existing concepts:

```text
Integration
   ↓
SenderAccount
   ↓
Campaign / Outreach
```

Simplified:

```ts
Integration {
  id
  workspaceId
  provider
  name
  status
}
```

```ts
SenderAccount {
  id
  workspaceId
  integrationId

  fromName
  fromEmail
  replyTo?

  status
  dailyLimit
}
```

No real credentials.

No actual provider calls.

---

# 20. REMOVE LEGACY DUPLICATION

After migration, audit the prototype for competing models.

Avoid situations such as:

```text
contacts
people
contactAssociations
personCompanyAssociations
```

all simultaneously acting as sources of truth.

The desired state is:

```text
people
personCompanyAssociations
```

Likewise avoid multiple competing:

```text
research
researchRuns
researchData
```

models if they represent the same product concept.

Use one prototype-level representation per domain.

Legacy names may remain temporarily inside migration code, but UI and new mutations should use the canonical models.

---

# 21. DO NOT OVER-NORMALIZE

Do NOT turn the prototype into a miniature database.

It is fine to have straightforward arrays and references.

For example:

```ts
people: Person[]
personCompanyAssociations: PersonCompanyAssociation[]
companies: Company[]
```

is sufficient.

We do not need:

* repository classes
* domain services
* persistence adapters
* event buses
* CQRS
* entity managers
* Prisma
* API layers

This is a prototype.

---

# 22. KEEP WORKSPACE ISOLATION

All of these entities must belong to the active workspace:

```text
CareerProfile
Company
Research
Evidence
Opportunity
Person
PersonCompanyAssociation
Outreach
Campaign
CampaignMember
Template
ConversationMessage
Integration
SenderAccount
```

Switching workspace must switch all of them.

No data leakage between workspaces.

---

# 23. VALIDATION SCENARIO

After implementation, manually verify this exact scenario.

### Workspace A

Create:

```text
Company A
Jane Doe
```

Associate Jane:

```text
Company A
Role: Engineering Manager
Why this person: ...
Conversation angle: ...
```

Create:

```text
Research A
Evidence A
Opportunity A
```

Create an outreach to Jane.

---

### Add Jane to Company B

Do NOT create another Person.

Create another association:

```text
Jane Doe
   ↓
Company B
Role: Product Engineering Manager
Why this person: different
Conversation angle: different
```

Verify Jane still appears only once globally.

---

### Prepare outreach for Company A

Verify the preparation context uses:

```text
Jane
Company A association
Company A opportunity
Company A evidence
```

It must NOT accidentally use Company B's role or conversation angle.

---

### Switch Workspace

Switch to Workspace B.

Verify none of the above records are visible.

Switch back.

Verify they return.

---

# 24. UI PRESERVATION

Do not redesign the application unnecessarily.

Keep:

* existing sidebar
* existing workspace switcher
* existing dashboard
* existing company workspace
* existing research experience
* existing opportunity experience
* existing contacts experience
* existing outreach experience
* existing campaigns
* existing conversations
* existing templates
* existing integrations
* existing sender accounts

This is a **domain alignment pass**, not a visual redesign.

---

# 25. RESPONSIVE BEHAVIOR

Do not regress existing responsive behavior.

Verify:

### Desktop

Persistent sidebar + workspace switcher.

### Tablet

Overlay/drawer behavior remains coherent.

### Mobile

Workspace switching works through the mobile shell/drawer without requiring a desktop sidebar.

Contacts, company associations, opportunities and outreach preparation must remain usable on small screens.

---

# 26. ACCESSIBILITY

Preserve:

* keyboard navigation
* visible focus
* accessible workspace controls
* modal focus management
* Escape behavior
* touch-sized controls

Do not introduce inaccessible custom selectors.

---

# 27. FINAL IMPLEMENTATION STANDARD

The goal is NOT:

> "We copied the production Prisma schema."

The goal is:

> "If someone understands the production Outreacher domain, the prototype's product model makes sense to them."

The prototype should now communicate:

```text
Workspace
   ↓
Career Profile

Workspace
   ↓
Companies
   ↓
Research
   ↓
Evidence
   ↓
Opportunities

Workspace
   ↓
People
   ↓
Person ↔ Company Associations

Workspace
   ↓
Outreach
   ↓
Campaign
   ↓
Conversation
```

with:

```text
Integration
   ↓
Sender Account
   ↓
Outreach / Campaign
```

---

# 28. FINAL REPORT

When finished, report:

1. What was retained from the existing Workspace implementation
2. Person/Contact model changes
3. Research model changes
4. Evidence model changes
5. Opportunity model changes
6. Outreach relationship changes
7. Campaign/conversation alignment
8. Legacy data migration
9. Workspace isolation validation
10. Multi-company person validation
11. Responsive/accessibility validation
12. TypeScript/build result
13. Any remaining prototype-only limitations

Do not claim production readiness.

This is the final structural alignment pass for the prototype.

After this, stop implementation unless a genuine product/UX issue is discovered.

The target state is:

**Production-synced domain model + prototype-level implementation + coherent Workspace UX.**

# Outreacher Prototype: Workspace Model + Production-Synced Domain Structure

We are continuing work on the **Outreacher Figma Make prototype**.

This is a **prototype, not the production application**.

Do not build production backend infrastructure, real integrations, real email delivery, queues, jobs, webhooks, database migrations, API clients, or authentication infrastructure.

The goal of this task is different:

> Make the prototype's **product model and UI concepts structurally consistent with the production Outreacher domain**, while keeping the prototype model dramatically simpler.

The prototype should communicate the same concepts that the production system will eventually implement, so that we don't design ourselves into a different product.

---

# 1. FIRST PRINCIPLE: WORKSPACE IS A REAL PRODUCT CONCEPT

The current prototype does not fully capture the concept of a workspace.

Fix that.

A Workspace is the user's working environment in Outreacher.

The mental model should become:

```text
User
  ↓
Workspace
  ↓
Career Profile
  ↓
Companies
  ↓
Research
  ↓
Opportunities
  ↓
People / Contacts
  ↓
Outreach
  ↓
Campaigns
  ↓
Conversations
```

Workspace is not just an internal object in `workspaceStore`.

It should be visible in the product experience where appropriate.

The user should understand:

> "I am currently working inside this workspace."

---

# 2. WORKSPACE UX

Introduce a lightweight workspace identity into the application shell.

Do NOT turn this into an enterprise-style workspace-management product.

This is a career outreach product, so workspace should remain lightweight.

## Desktop

The sidebar/header should expose the current workspace in a restrained way.

For example:

```text
OUTREACHER

[ Workspace Name ▾ ]

Dashboard
Companies
Contacts
Opportunities
Outreach
Campaigns
Conversations
Templates
...
```

Or place the workspace switcher in the top/header area if that produces a cleaner hierarchy.

The important thing is that the current workspace is visible and recognizable.

Example:

```text
Pondei's Workspace ▾
```

or:

```text
Personal Career Workspace ▾
```

Do not add unnecessary enterprise terminology such as:

* Organizations
* Teams
* Tenants
* Workspaces administration
* Billing
* Seats
* Roles management

Those are production concerns, not necessary prototype UX.

---

# 3. WORKSPACE SWITCHER

Add a lightweight workspace switcher interaction.

The prototype should support multiple simulated workspaces so the concept is demonstrable.

For example:

```text
Personal Career Workspace
─────────────────────────
Personal Career Workspace ✓
Product Engineering Search
─────────────────────────
+ Create workspace
```

Selecting another workspace should visibly change the active context.

The prototype may persist the active workspace in localStorage.

Do not implement real authentication or authorization.

---

# 4. WORKSPACE CREATION

Provide a lightweight "Create workspace" interaction.

Example:

```text
Create workspace

Workspace name
[ Personal Career Workspace       ]

[ Cancel ] [ Create workspace ]
```

When created:

1. create a simulated Workspace object
2. make it the active workspace
3. initialize its empty workspace data
4. navigate to the workspace dashboard

Do not require complex setup.

The workspace can begin with:

* empty career profile
* no companies
* no contacts
* no opportunities
* no outreach
* no campaigns

This should reinforce the product's state-driven behavior.

---

# 5. WORKSPACE DATA ISOLATION

This is important.

Even though this is only a prototype, the data model should behave as if each workspace owns its data.

Do not have one giant global collection that every workspace implicitly shares.

Instead structure the prototype state approximately like:

```ts
Workspace {
  id
  name
  createdAt

  careerProfile
  companies[]
  people[]
  personCompanyAssociations[]
  research[]
  opportunities[]
  evidence[]
  outreaches[]
  campaigns[]
  templates[]
  conversations[]
  integrations[]
  senderAccounts[]
}
```

The active workspace determines what the application displays.

When switching workspaces:

* dashboard changes
* companies change
* contacts change
* opportunities change
* outreach changes
* campaigns change
* conversations change
* templates change
* sender accounts change
* integrations change
* career profile changes

Nothing from Workspace A should accidentally appear inside Workspace B.

---

# 6. SIMPLIFIED PRODUCTION DOMAIN MODEL

Use the production Prisma model provided in the task as the **domain authority**.

Do NOT copy its entire technical complexity into the prototype.

The prototype should model the following simplified structure.

---

## User

A user represents the person using Outreacher.

```ts
User {
  id
  firstName
  lastName
  email
}
```

Authentication provider details are not necessary in the prototype.

Do not model:

* password hashes
* auth identities
* OAuth provider IDs

unless already needed by the existing prototype authentication flow.

The existing simulated authentication can remain.

---

# 7. WORKSPACE

```ts
Workspace {
  id
  name
  createdAt

  memberIds[]
}
```

For the prototype, every workspace can have one owner/member.

You may retain a simplified:

```ts
WorkspaceMember {
  workspaceId
  userId
  role: "OWNER"
}
```

Do not build workspace administration.

---

# 8. CAREER PROFILE

CareerProfile belongs to the workspace.

```ts
CareerProfile {
  id
  workspaceId

  headline
  summary
  currentRole

  targetRoles[]
  yearsExperience
  careerGoals

  targetIndustries[]
  targetLocations[]
  skills[]

  experienceSummary

  portfolioUrl
  githubUrl
  linkedinUrl
  websiteUrl

  backgroundAndPositioning
}
```

The current prototype already has many of these concepts.

Preserve them.

The important production alignment is:

```text
Workspace
   ↓
CareerProfile
```

not:

```text
User
   ↓
CareerProfile
```

The UI may still feel like the profile belongs to the person, but its persistence/context belongs to the active workspace.

---

# 9. COMPANY

Simplify production Company to:

```ts
Company {
  id
  workspaceId

  name
  websiteUrl
  domain

  description
  industry
  location

  linkedinUrl

  status
}
```

Company status:

```text
ACTIVE
ARCHIVED
```

Keep the existing prototype company experience.

A company belongs to exactly one workspace in the prototype.

Do not implement:

* normalizedName internals
* phoneNumber unless the UI already uses it
* database indexes
* cascade behavior
* backend-specific constraints

The important relationship is:

```text
Workspace
   ↓
Company
```

---

# 10. RESEARCH

Production has ResearchRun.

For the prototype, simplify this to a research record attached to a company.

```ts
Research {
  id
  workspaceId
  companyId

  status

  startedAt
  completedAt

  provider
}
```

Status:

```text
NOT_STARTED
IN_PROGRESS
COMPLETE
FAILED
```

The existing prototype may already use this lifecycle.

Keep the existing UX.

Do not introduce production queue states such as:

```text
QUEUED
RUNNING
PARTIAL
```

unless they materially improve the prototype experience.

The prototype is demonstrating the user experience, not the research worker architecture.

---

# 11. EVIDENCE

Evidence is one of the most important domain concepts.

Keep it explicit.

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

  sourceName
  sourceUrl
  sourceExcerpt

  collectedAt
}
```

Classification:

```text
FACT
INFERENCE
UNKNOWN
```

The prototype should use evidence throughout the experience.

Evidence can support:

* company research
* opportunity classification
* person reasoning
* outreach reasoning

Do not replace evidence with generic AI summaries.

---

# 12. OPPORTUNITY

Simplify production Opportunity to:

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

Opportunity type:

```text
CONFIRMED
PROACTIVE
UNCLASSIFIED
```

Opportunity status:

```text
ACTIVE
CLOSED
SUPERSEDED
```

Preserve the existing Outreacher meaning:

### CONFIRMED

There is actual evidence of a relevant opening.

### PROACTIVE

There is no confirmed opening, but there is sufficient company-fit/context to justify relationship-building.

### UNCLASSIFIED

There is insufficient evidence to determine the opportunity state.

Do not allow career-profile matching alone to magically turn an opportunity into CONFIRMED.

---

# 13. PERSON / CONTACT

This is extremely important.

The prototype should align with the intended production concept:

> A person is a person. Their relationship to a company is separate.

Do NOT model contacts as simply:

```text
Company → Contacts
```

with the person duplicated for every company.

Use:

```text
Person
   ↓
PersonCompanyAssociation
   ↓
Company
```

---

# 14. PERSON

Simplified:

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

A person exists once inside the workspace.

---

# 15. PERSON-COMPANY ASSOCIATION

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

This is where company-specific context belongs.

For example:

```text
Jane Doe

Person:
- Jane Doe
- jane@example.com
- LinkedIn

Company relationship:
- Company: Moniepoint
- Role: Engineering Manager
- Team: Platform
- Why this person: Leads the team closest to the user's target area
- Conversation angle: Recent platform expansion
```

If Jane is associated with another company:

```text
Jane Doe

Company:
Flutterwave

Role:
Product Engineering Manager

Why this person:
...

Conversation angle:
...
```

Those association-specific fields must not overwrite each other.

---

# 16. CONTACT UI

The existing `/contacts` experience should remain global.

A person should appear once in global Contacts.

The contact detail page should expose their company relationships.

Example:

```text
Jane Doe
Engineering Manager

Companies

Moniepoint
Engineering Manager
Why this person...
Conversation angle...

Flutterwave
Product Engineering Manager
Why this person...
Conversation angle...
```

Selecting a company changes the association context.

Company workspace Contacts should show the same Person through the relevant company association.

This is critical for keeping the prototype aligned with production.

---

# 17. OUTREACH

Simplify production Outreach to:

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
  createdAt
  updatedAt
}
```

Status:

```text
DRAFT
SCHEDULED
SENDING
SENT
FAILED
CANCELLED
```

For the prototype, it is acceptable for sending to be simulated.

The important thing is that an Outreach knows:

```text
Workspace
Company
Person
Person ↔ Company relationship
Campaign (optional)
Template (optional)
Sender Account
```

This prevents the prototype from treating outreach as an isolated email draft.

---

# 18. CAMPAIGN

Simplify production Campaign:

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

Status:

```text
DRAFT
SCHEDULED
ACTIVE
PAUSED
COMPLETED
ARCHIVED
```

A campaign can contain multiple people/outreaches.

Do not recreate every backend campaign mechanism.

The prototype only needs to demonstrate:

```text
Campaign
  ↓
People / Outreach
  ↓
Messages
  ↓
Replies / Conversation
```

---

# 19. CAMPAIGN MEMBERS

If the current prototype needs a campaign-member concept, simplify it to:

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

Status can use the production vocabulary where useful:

```text
PENDING
READY
SCHEDULED
SENDING
SENT
FOLLOW_UP_DUE
REPLIED
COMPLETED
SUPPRESSED
FAILED
ARCHIVED
```

Do not implement the underlying email queue behavior.

---

# 20. EMAIL TEMPLATES

Keep:

```ts
EmailTemplate {
  id
  workspaceId

  name
  subject
  body

  isArchived
}
```

Templates belong to the workspace.

They should therefore change when the active workspace changes.

---

# 21. CONVERSATIONS

The prototype currently has Conversations as a first-class domain.

Keep that.

Conceptually:

```text
Outreach
   ↓
Conversation
   ↓
Messages
```

Simplified:

```ts
ConversationMessage {
  id

  workspaceId
  outreachId

  direction
  kind

  subject
  body

  createdAt
}
```

Direction:

```text
INBOUND
OUTBOUND
```

Kind:

```text
EMAIL
LINKEDIN
```

The prototype may continue to use its existing conversation lifecycle:

```text
NO_REPLY
REPLIED
ACTIVE
STOPPED
```

Remember the existing invariant:

**REPLIED must not automatically become ACTIVE.**

The user must explicitly continue the conversation.

STOPPED remains terminal.

---

# 22. INTEGRATIONS + SENDER ACCOUNTS

Keep the two concepts separate.

```text
Integration
    ↓
Sender Account
    ↓
Outreach / Campaign
```

Simplified Integration:

```ts
Integration {
  id
  workspaceId

  provider
  name
  status
}
```

Provider:

```text
RESEND
SES
SMTP
```

Status:

```text
ACTIVE
INVALID_CREDENTIALS
DISABLED
```

No real credentials.

No secret storage.

No webhook handling.

---

# 23. SENDER ACCOUNT

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

Status:

```text
ACTIVE
PAUSED
DISABLED
```

Campaigns and outreaches should reference sender accounts conceptually.

The prototype can continue simulating sending.

---

# 24. DO NOT MODEL THESE PRODUCTION BACKEND CONCERNS

Do NOT add prototype entities for:

* Job
* IdempotencyRecord
* EmailEvent
* Suppression
* provider webhook processing
* queue workers
* retry infrastructure
* leases
* dead-letter queues
* provider message IDs
* reply correlation tokens
* secret references
* database indexes
* database constraints
* Prisma-specific relation mechanics
* actual authentication identities

These belong to production infrastructure.

They should not pollute the Figma Make domain model.

---

# 25. IMPORTANT: DO NOT BLINDLY COPY THE PRISMA SCHEMA

The supplied production schema is the **domain reference**, not a literal prototype implementation specification.

The prototype should preserve:

### Production concepts

```text
Workspace
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
EmailTemplate
ConversationMessage
Integration
SenderAccount
```

But simplify their implementation.

The prototype should communicate the same relationships without reproducing backend complexity.

---

# 26. REFACTOR THE CURRENT WORKSPACESTORE

Audit `src/lib/workspaceStore.ts`.

Refactor its structure toward the simplified domain above.

Do not rewrite working UI unnecessarily.

The goal is to make the store conceptually resemble production.

Prefer something approximately like:

```ts
WorkspaceState {
  activeWorkspaceId
  workspaces: Workspace[]

  careerProfiles: CareerProfile[]
  companies: Company[]
  research: Research[]
  evidence: Evidence[]
  opportunities: Opportunity[]

  people: Person[]
  personCompanyAssociations: PersonCompanyAssociation[]

  outreaches: Outreach[]

  campaigns: Campaign[]
  campaignMembers: CampaignMember[]

  templates: EmailTemplate[]

  conversationMessages: ConversationMessage[]

  integrations: Integration[]
  senderAccounts: SenderAccount[]
}
```

You may use nested workspace data if that is cleaner.

Do not optimize for database normalization.

Optimize for:

1. domain clarity
2. state correctness
3. easy prototype persistence
4. production conceptual alignment

---

# 27. ACTIVE WORKSPACE CONTEXT

Every major route should derive its data from the active workspace.

Examples:

```text
/dashboard
/companies
/contacts
/opportunities
/outreaches
/campaigns
/conversations
/templates
/integrations
/sender-accounts
```

If Workspace A is active, these routes show Workspace A data.

Switch to Workspace B:

```text
/dashboard
```

now reflects Workspace B.

This is the most important functional requirement of this task.

---

# 28. WORKSPACE EMPTY STATE

A newly created workspace should feel genuinely empty.

For example:

```text
Welcome to Product Engineering Search

Build your first opportunity.

[ Complete career profile ]
[ Add a company ]
```

Do not automatically seed every new workspace with demo companies.

Existing sample/demo data can remain available through an explicit:

```text
Explore sample workspace
```

or equivalent mechanism.

Do not silently mix demo data with real workspace data.

---

# 29. WORKSPACE DASHBOARD

The dashboard should clearly establish the active workspace.

Example:

```text
Product Engineering Search

Turn target companies into real opportunities.

Needs your attention
...
```

The dashboard's action system must operate against the active workspace.

---

# 30. WORKSPACE SETTINGS

Add a lightweight workspace section to Settings.

It can contain:

```text
Workspace

Name
[ Product Engineering Search ]

Created
...

Owner
Pondei

[ Rename workspace ]
```

Do not build a full team administration interface.

---

# 31. WORKSPACE CREATION / SWITCHING SHOULD FEEL REAL

The user should be able to:

1. create a workspace
2. switch workspace
3. see empty workspace state
4. add a company
5. complete the career profile
6. research the company
7. create an opportunity
8. add/select a person
9. prepare outreach
10. create/send a simulated outreach
11. see the conversation

All of this should happen within the currently selected workspace.

---

# 32. EXISTING PRODUCT FLOW MUST NOT BREAK

Preserve the current Outreacher experience.

Do not redesign unrelated screens merely because the underlying model changes.

Preserve:

```text
Career Profile
→ Company
→ Research
→ Evidence
→ Opportunity
→ Contact
→ Outreach
→ Campaign
→ Conversation
→ Follow-up
→ Outcome
```

The task is to give that flow a correct Workspace context.

---

# 33. GLOBAL SEARCH

Update global search so that it searches the active workspace only.

Search domains:

```text
Companies
Contacts
Opportunities
Outreaches
Campaigns
Conversations
Templates
```

Do not surface records belonging to another workspace.

---

# 34. NOTIFICATIONS / ATTENTION

Notifications and dashboard attention items should also be workspace-scoped.

For example:

```text
Workspace A:
Research completed for Moniepoint
```

must not appear after switching to Workspace B.

---

# 35. DEMO DATA

Create at least two coherent simulated workspaces for validation.

Example:

### Workspace A

```text
Personal Career Workspace
```

Contains the existing mature Outreacher example data.

### Workspace B

```text
Product Engineering Search
```

Starts relatively empty.

Use these to prove that workspace switching actually works.

Do not duplicate all data unnecessarily.

---

# 36. RESPONSIVE UX

Workspace functionality must work on:

* desktop
* tablet
* mobile

On mobile, do not force a permanent sidebar.

Use the existing mobile drawer/header pattern.

The workspace switcher should be accessible from the mobile shell without creating a huge header.

---

# 37. ACCESSIBILITY

Workspace switching must support:

* keyboard navigation
* visible focus
* accessible labels
* Escape to close menus/modals
* sensible focus restoration
* touch-friendly targets
* screen-reader-friendly names

Do not create a custom interaction that only works with a mouse.

---

# 38. VISUAL DIRECTION

Keep the existing Outreacher visual language.

Do not turn Workspace into an enterprise SaaS dashboard.

The experience should still feel like:

> a focused career intelligence and outreach workspace

rather than:

> a generic multi-tenant business management application.

Workspace should be visible but subordinate to the user's actual goal: creating meaningful opportunities.

---

# 39. IMPLEMENTATION RULE

Before changing code:

1. Inspect the existing workspaceStore.
2. Inspect the current AppShell/sidebar/header.
3. Inspect routing.
4. Inspect current domain types.
5. Identify where workspace data is currently implicit.
6. Identify duplicate/legacy data structures.
7. Refactor only where necessary.

Do not throw away working prototype behavior.

Do not create parallel competing models.

There must be one canonical prototype representation for:

* Workspace
* Company
* Person
* PersonCompanyAssociation
* Opportunity
* Evidence
* Outreach
* Campaign
* Conversation
* Integration
* SenderAccount

---

# 40. MIGRATION / BACKWARD COMPATIBILITY

Existing localStorage data may use the older structure.

Add a lightweight migration/normalization layer if necessary.

Do not simply break existing prototype data.

If old data has:

```text
contacts
```

convert it into:

```text
people
personCompanyAssociations
```

where possible.

If old data has company-owned contacts, preserve their information while creating the appropriate Person + association representation.

Do not lose existing demo data.

---

# 41. IMPORTANT CONTACT MIGRATION RULE

If an existing contact is associated with a company:

```text
Contact
  companyId
  role
  whyThisPerson
  conversationAngle
```

convert conceptually to:

```text
Person
  id
  name
  email
  linkedin

PersonCompanyAssociation
  personId
  companyId
  role
  whyThisPerson
  conversationAngle
```

Global person information stays on Person.

Company-specific information moves to PersonCompanyAssociation.

This is a critical domain correction.

---

# 42. VALIDATION SCENARIO

After implementation, validate the following manually in the prototype.

### Scenario 1: Workspace creation

Create:

```text
Workspace A
```

Complete some profile information.

Add:

```text
Company A
```

Verify the data exists.

---

### Scenario 2: Create second workspace

Create:

```text
Workspace B
```

Verify it does NOT show:

* Company A
* Workspace A career profile
* Workspace A contacts
* Workspace A opportunities
* Workspace A outreach

It should have its own empty state.

---

### Scenario 3: Switch back

Switch to Workspace A.

Verify all previous data returns.

---

### Scenario 4: Global person

Inside Workspace A:

Create:

```text
Jane Doe
```

Associate Jane with:

```text
Company A
```

Then associate the same Jane with:

```text
Company B
```

Verify:

```text
Contacts
```

shows Jane once.

Jane's detail page shows two company relationships.

Changing the Company A association must not modify the Company B association.

---

### Scenario 5: Outreach

Create an outreach to Jane for Company A.

Verify it knows:

```text
Workspace A
Company A
Jane
Jane ↔ Company A association
```

The outreach should not accidentally use Jane's Company B context.

---

### Scenario 6: Workspace search

Search for Jane.

Verify the result belongs to the active workspace.

Switch workspace.

Verify Jane is no longer searchable unless she also exists there.

---

# 43. FINAL QUALITY BAR

Do not report completion merely because TypeScript passes.

The implementation is complete only when:

### Domain

The prototype's model clearly resembles the production domain.

### Workspace

Workspace is a visible, usable application context.

### Isolation

Workspace data does not leak across workspace switches.

### Person model

People are global within a workspace and company-specific context lives in the association.

### Lifecycle

Existing Outreacher lifecycle behavior remains intact.

### Navigation

Cross-domain navigation still works.

### Persistence

Workspace switching and prototype state survive reload where the existing prototype expects persistence.

### Responsive

Desktop/tablet/mobile behavior remains coherent.

### Accessibility

Workspace controls are keyboard and focus accessible.

### Prototype scope

No unnecessary production backend complexity has been introduced.

---

# 44. FINAL REPORT

At the end, report:

1. Workspace UX added
2. Workspace state/data model added
3. Workspace switching behavior
4. Workspace isolation behavior
5. Simplified production-aligned domain model
6. Person / company-association migration
7. Routes/components changed
8. Existing prototype flows preserved
9. Validation performed
10. Any remaining prototype-only limitations

Do not claim the prototype is production-ready.

The goal is:

> **Production-aligned product modeling, prototype-level implementation.**

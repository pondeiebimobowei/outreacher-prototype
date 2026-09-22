# DOMAIN INTEGRITY + LIFECYCLE AUDIT

## Objective

The previous implementation promoted Contacts, Opportunities, and Conversations into first-class routes:

* `/contacts`
* `/contacts/:id`
* `/opportunities`
* `/opportunities/:id`
* `/conversations`
* `/conversations/:id`

Campaigns and Templates are also now first-class domains.

Before adding more product capabilities, we need to establish that these domains are **actually coherent parts of one persisted product model**, rather than independent pages reconstructing information from Company Workspace state and static demo constants.

This task is therefore a combined:

1. architecture audit
2. lifecycle/state audit
3. cross-domain relationship audit
4. persistence audit
5. implementation repair
6. UX consistency pass

Do NOT stop after identifying problems.

**Inspect → identify → fix → verify → continue.**

The goal is to leave the repository in a stronger state than you found it.

---

# 1. READ THE AUTHORITATIVE DOCUMENTATION FIRST

Before modifying implementation, inspect the relevant project documentation.

At minimum read:

* `docs/experience/README.md`
* relevant files under `docs/experience/`
* `docs/experience/company.md`
* `docs/experience/research.md`
* `docs/experience/auth-onboarding.md`
* `docs/experience/12-settings.md` if relevant to shared navigation/shell
* `docs/execution-backlog.md`
* `docs/AGENT.md`
* relevant technical/product requirement documents
* current implementation documentation for the workspace/domain model

Respect the existing authority hierarchy:

**Product Requirements > Technical specs + Experience specs > approved visual designs > implementation**

If an Experience Contract is marked `APPROVED`, implementation must conform to it.

Do not invent or silently create missing Experience Contracts.

---

# 2. SURVEY THE CURRENT IMPLEMENTATION

Inspect the current implementation rather than assuming the previous agent's summary is accurate.

Specifically inspect:

* `src/lib/workspaceStore.ts`
* routing configuration
* global navigation
* Company Workspace
* `ContactsTab.tsx`
* `OpportunitiesTab.tsx`
* `ConversationTab.tsx`
* Contacts pages
* Opportunities pages
* Conversations pages
* Campaign pages
* Template pages
* Dashboard
* relevant shared components
* demo/sample data
* any domain types/interfaces
* any persistence/localStorage logic

Search the repository for:

* `CONTACTS`
* `OPP_DATA`
* `CompanyEntry`
* `conversation`
* `campaignId`
* `contactId`
* `opportunityId`
* `convStage`
* `convOutcome`
* `relationship`
* `outreachStage`
* `followUp`
* `localStorage`
* route definitions
* navigation definitions

Do not assume that a type or helper is canonical merely because it is exported.

---

# 3. ESTABLISH THE CANONICAL DOMAIN GRAPH

The product's conceptual relationship graph is:

Company
↓
Opportunity
↓
Contact
↓
Outreach
↓
Campaign Member
↓
Conversation
↓
Outcome
↓
Relationship

However, users must be able to enter the product from any major node.

The implementation should therefore support this graph coherently:

```text
Company
  ├── Opportunities
  ├── Contacts
  ├── Campaigns
  └── Conversations

Opportunity
  ├── Company
  ├── Evidence
  ├── Contacts
  ├── Campaigns
  └── Conversations

Contact
  ├── Company
  ├── Opportunities
  ├── Campaign memberships
  ├── Outreach
  └── Conversations

Campaign
  ├── Campaign members
  ├── Contacts
  ├── Companies
  └── Conversations

Conversation
  ├── Contact
  ├── Company
  ├── Opportunity where applicable
  ├── Campaign where applicable
  ├── Messages
  ├── Follow-ups
  ├── Outcome
  └── Relationship state
```

Do not introduce an artificial database-style abstraction merely for appearance.

This is a prototype and the existing workspace store can remain the persistence mechanism.

The important requirement is:

> There must be one coherent source of truth for relationships and lifecycle state.

Views may derive projections from that source of truth, but individual pages must not maintain competing versions of the same state.

---

# 4. IDENTIFY AND FIX STATIC-DATA DEPENDENCIES

The previous implementation reportedly uses:

* `CONTACTS` from `ContactsTab.tsx`
* `OPP_DATA` from `OpportunitiesTab.tsx`

Investigate whether these are being treated as canonical domain data.

If they are merely demo/reference data, make that explicit.

Do NOT allow this architecture:

```text
ContactsPage → CONTACTS static data
CompanyPage → another contact representation
ContactDetailPage → reconstructed contact
WorkspaceStore → another contact state
```

or:

```text
OpportunitiesPage → OPP_DATA
Company Workspace → CompanyEntry.oppStatus
OpportunityDetail → reconstructed OPP_DATA + CompanyEntry
```

Instead establish a clear pattern such as:

```text
workspaceStore
    ↓
canonical workspace state
    ↓
domain selectors / derived projections
    ↓
pages/components
```

If existing static data is useful for demo seeding, keep it as demo seed data.

Do not confuse demo seed data with the runtime domain model.

---

# 5. CONTACT DOMAIN AUDIT

Audit:

```text
/contacts
/contacts/:id
```

Verify that a Contact:

* has a stable identity
* is associated with a company
* can be selected independently
* can participate in multiple campaigns
* can have multiple conversations over time if the product model permits it
* can be associated with one or more opportunities where appropriate
* preserves relationship/outcome history
* can be reached directly from other domains

Verify the Contacts list is a projection of workspace state.

Verify the Contact detail page does not lose state when the user navigates away and returns.

Verify contact lifecycle is not incorrectly inferred only from the current Company Workspace tab.

Audit the current lifecycle model:

```text
DISCOVERED
SELECTED
CONTACTED
REPLIED
ACTIVE
NURTURE
CLOSED
```

Only use states that are actually meaningful in the current implementation.

Do not introduce meaningless lifecycle states simply to fill UI.

If lifecycle should instead be derived from multiple existing fields, centralize that derivation in one selector/helper.

---

# 6. OPPORTUNITY DOMAIN AUDIT

Audit:

```text
/opportunities
/opportunities/:id
```

Opportunity states must remain:

```text
UNCLASSIFIED
PROACTIVE
CONFIRMED
```

Definitions:

### UNCLASSIFIED

Insufficient evidence to establish a meaningful opportunity.

### PROACTIVE

No confirmed relevant opening, but company-fit/evidence provides a legitimate reason to pursue a relationship.

### CONFIRMED

Actual evidence of a relevant opening exists.

Verify these definitions are reflected in both logic and UI.

An Opportunity must retain:

* company relationship
* state
* evidence
* relevant contacts
* campaign associations where applicable
* conversation associations where applicable

Verify that changing opportunity state updates every relevant projection.

For example:

```text
Opportunity detail
Company Workspace
Contacts
Dashboard
Campaign context
```

must not disagree about the current opportunity state.

---

# 7. CONVERSATION DOMAIN AUDIT

Audit:

```text
/conversations
/conversations/:id
```

The existing `ConversationTab.tsx` contains important behavior.

Do NOT accidentally break or duplicate that logic.

Verify:

### Conversation stages

```text
NO_REPLY
REPLIED
ACTIVE
STOPPED
```

Critical invariants:

1. `REPLIED` must NOT automatically become `ACTIVE`.
2. User must explicitly choose to continue the conversation.
3. `STOPPED` is terminal.
4. There is no "Reopen" action after STOPPED.
5. A reply cancels any pending follow-up.
6. Maximum of two follow-ups.
7. Follow-up is due four business days after the relevant outbound message.
8. Outcome is independent from conversation stage.
9. Recording an outcome must not accidentally alter the conversation stage unless explicitly intended by the existing product rules.
10. Structured `conversationMessages[]` is the source of truth.
11. Legacy `convReplyText` must remain only as compatibility fallback if still required.

Verify the standalone Conversation Detail page and the Company Workspace conversation experience use the same underlying state.

There must not be two competing conversation implementations with different behavior.

If the standalone page wraps `ConversationTab`, determine whether that creates undesirable coupling.

If duplication exists, refactor shared conversation logic into reusable selectors/actions/components where appropriate.

Do not perform a giant unnecessary rewrite merely for architectural purity.

---

# 8. CAMPAIGN RELATIONSHIP AUDIT

Campaigns are first-class domains.

The implementation must preserve:

```text
Campaign
  ↓
Campaign Member
  ↓
Contact + Company
  ↓
recipient-specific Outreach
  ↓
Conversation
```

A campaign is NOT:

```text
Campaign = one contact
```

and NOT:

```text
Campaign = one company
```

Verify that:

* a campaign can contain multiple contacts
* contacts can belong to multiple campaigns
* campaigns can span multiple companies
* each campaign member can have its own personalized message
* applying a template does not mutate the underlying template
* editing a member's personalized message does not mutate other members
* campaign-level and member-level state are not incorrectly conflated

Campaign-level states:

```text
DRAFT
READY
SENDING
ACTIVE
PAUSED
COMPLETED
```

Member-level states:

```text
PENDING
READY
SENT
REPLIED
FOLLOW_UP_DUE
STOPPED
COMPLETED
```

If the current implementation only partially supports this, fix the hidden assumptions.

---

# 9. TEMPLATE RELATIONSHIP AUDIT

Templates are reusable starting points.

Categories:

```text
NETWORKING
REFERRAL
HIRING_MANAGER
RECRUITER
FOLLOW_UP
GENERAL
```

Variables currently supported:

```text
{{firstName}}
{{company}}
{{role}}
```

Verify:

```text
Template
    ↓
Campaign member
    ↓
resolved personalized message
```

Editing the personalized message must NOT mutate the template.

Duplicating a template should create an independent template.

Archiving should not destroy historical campaign messages.

Do not allow historical sent messages to suddenly change because a template was edited.

---

# 10. OUTREACH DOMAIN AUDIT

Inspect how outreach artifacts are represented.

The product distinction should remain:

```text
Template
    =
reusable starting point

Outreach
    =
recipient-specific message artifact

Campaign Member
    =
delivery/context relationship
```

Do not collapse these into one object.

Verify that the current implementation does not accidentally use a campaign template as the historical source of truth for a sent message.

A sent message must remain historically stable even if its template changes later.

---

# 11. DASHBOARD CONSISTENCY AUDIT

The dashboard should be a projection of actual workspace state.

Verify:

```text
Needs your attention
Keep in touch
Activity
Opportunity pipeline
Continue where you left off
```

are all derived from persisted state.

No generic hardcoded activity should be presented as if it actually happened.

No fake notification counts.

No dashboard status should disagree with the canonical domain state.

For example:

If a contact replied:

```text
Dashboard
Contacts
Conversations
Company Workspace
Contact detail
```

must all reflect that reply.

---

# 12. CROSS-DOMAIN NAVIGATION AUDIT

Every important relationship should have a canonical destination.

Verify links such as:

```text
Company
→ Opportunity

Company
→ Contact

Company
→ Campaign

Company
→ Conversation

Opportunity
→ Company

Opportunity
→ Contact

Opportunity
→ Campaign

Opportunity
→ Conversation

Contact
→ Company

Contact
→ Opportunity

Contact
→ Campaign

Contact
→ Conversation

Campaign
→ Contact

Campaign
→ Company

Campaign
→ Conversation

Conversation
→ Contact

Conversation
→ Company

Conversation
→ Opportunity

Conversation
→ Campaign
```

The user must not be trapped inside Company Workspace.

Company Workspace is a contextual workspace, not the owner of every domain.

---

# 13. ROUTING AUDIT

Verify all canonical routes.

Expected:

```text
/dashboard

/companies
/companies/:id

/opportunities
/opportunities/:id

/contacts
/contacts/:id

/campaigns
/campaigns/:id

/templates
/templates/:id

/conversations
/conversations/:id
```

If existing architecture uses a different detail route, preserve the established convention consistently.

Direct navigation to every route must work.

Refreshing the page must not unexpectedly erase the domain state.

Unknown IDs should produce an appropriate empty/not-found state rather than a broken screen.

---

# 14. IDENTITY AND ID AUDIT

The current implementation reportedly uses compound contact keys such as:

```text
companyId--contactId
```

Audit whether this is being used as an actual identity or merely as a route key.

Do not let a route serialization format become the canonical domain ID accidentally.

Prefer:

```text
contact.id
```

as the domain identity.

A route may encode enough information to resolve it, but the underlying contact identity should remain stable.

If changing this now would create unnecessary migration complexity, preserve the current prototype approach but isolate the route parsing from the domain model.

Document the decision in code where appropriate.

---

# 15. EMPTY / LOADING / ERROR / SUCCESS STATES

While auditing the domains, perform a focused lifecycle-state UX pass.

For:

* Contacts
* Contact detail
* Opportunities
* Opportunity detail
* Conversations
* Conversation detail
* Campaigns
* Campaign detail
* Templates

verify:

### Empty

The user understands:

* what is empty
* why it is empty
* what action can populate it

### Loading

The page communicates that work is occurring.

### Error

The user knows what failed and what they can do next.

### Success

Important actions provide visible confirmation.

### Disabled

Controls explain why they cannot currently be used.

### Destructive

Stopping a conversation, archiving a template, etc. requires appropriate confirmation where necessary.

Maintain WCAG 2.2 AA expectations already defined by the Experience Contracts.

---

# 16. DEMO DATA RULE

Do not silently populate a normal user's workspace with fake mature data.

The product should support:

### New user

Mostly empty workspace.

### Returning user

Their persisted work.

### Explicit demo/sample mode

Clearly labelled sample workspace if the existing implementation supports it.

Demo data must not become indistinguishable from user-created data.

Audit the current seeding behavior carefully.

If a demo seed currently runs merely because a page was opened, fix it.

---

# 17. STATE TRANSITION MATRIX

Create or update a central mental/model representation of important transitions.

At minimum verify:

```text
Company
NOT_ADDED
    ↓
ADDED
    ↓
RESEARCHING
    ↓
RESEARCH_COMPLETE
```

Opportunity:

```text
UNCLASSIFIED
   ├──→ PROACTIVE
   └──→ CONFIRMED
```

Contacts:

```text
NOT_DISCOVERED
    ↓
DISCOVERED
    ↓
SELECTED
    ↓
CONTACTED
    ↓
REPLIED
    ↓
ACTIVE
```

Relationship outcomes may branch into:

```text
NURTURE
CLOSED
```

Conversation:

```text
NO_REPLY
    ↓
REPLIED
    ↓
ACTIVE

NO_REPLY / ACTIVE / REPLIED
    ↓
STOPPED
```

Do not force this diagram literally into one enum if the actual domain needs multiple independent dimensions.

In particular:

**conversation stage and relationship outcome are independent dimensions.**

---

# 18. HIDDEN-INVARIANT SEARCH

This is important.

Search for implementation shortcuts that bypass the intended domain model.

Look specifically for code like:

```text
entry.contacts
entry.opportunity
entry.conversation
entry.campaign
```

being assumed to be one-to-one when the product now supports many-to-many relationships.

Look for:

* first contact assumptions
* one campaign per contact assumptions
* one company per campaign assumptions
* one conversation per company assumptions
* one opportunity per company assumptions
* page-local state masquerading as persistence
* static constants being treated as runtime state
* route parameters being treated as database IDs
* navigation that only works after entering Company Workspace
* duplicate relationship derivation logic
* duplicated outcome labels
* duplicated lifecycle calculations
* stale state after navigation
* state updates that mutate the wrong entity
* components directly modifying objects instead of going through workspace actions

Fix any hidden invariant that contradicts the current product model.

---

# 19. REFACTOR ONLY WHERE IT IMPROVES THE MODEL

Do not rewrite the entire application.

Prefer incremental improvements:

```text
existing workspace state
        ↓
canonical selectors/actions
        ↓
domain pages
        ↓
shared UI
```

Examples of appropriate refactoring:

* centralize contact lifecycle derivation
* centralize opportunity selectors
* centralize conversation selectors
* centralize relationship status derivation
* centralize outcome labels
* create reusable domain lookup helpers
* extract shared conversation timeline logic
* normalize cross-domain link generation

Avoid speculative backend architecture.

This is still a frontend prototype with local persistence.

---

# 20. VISUAL CONSISTENCY

Use the existing design system and approved Experience Contracts.

The first-class domain pages should feel like one product.

They should share:

* shell
* typography
* spacing
* page header conventions
* filter controls
* badges
* cards
* tables/list rows
* empty states
* contextual sidebars
* breadcrumbs
* action patterns

Do not turn Contacts into a sales CRM.

Do not turn Opportunities into a generic sales pipeline.

Do not turn Conversations into a generic email client.

The product remains:

> A career relationship and opportunity workspace.

The visual language should support:

**Company → Evidence → Opportunity → Person → Conversation**

---

# 21. RESPONSIVE BEHAVIOR

Audit desktop, tablet and mobile behavior.

Desktop:

* persistent sidebar
* main content area
* contextual two-column layouts where appropriate

Tablet:

* collapsible/overlay navigation
* avoid overly wide tables
* preserve contextual relationships

Mobile:

* compact header
* drawer navigation
* stacked detail layouts
* horizontally scrollable filter controls where necessary
* no desktop two-column layout forced into a narrow viewport
* touch targets approximately 44px or larger

Check specifically:

* contacts table/list
* opportunity cards
* conversation timeline
* contact detail sidebar
* opportunity evidence
* campaign member views
* template editor/preview

---

# 22. IMPLEMENTATION REQUIREMENT

Do not simply produce an audit document.

Actually modify the implementation wherever a problem is found.

The desired sequence is:

```text
Inspect
↓
Map current architecture
↓
Identify inconsistencies
↓
Fix them
↓
Run typecheck
↓
Run available tests
↓
Run/build the app if possible
↓
Manually inspect affected routes
↓
Fix resulting issues
↓
Final consistency pass
```

If a discovered issue is genuinely out of scope, document it clearly rather than silently ignoring it.

But prioritize fixing issues that affect:

1. canonical state
2. lifecycle correctness
3. cross-domain navigation
4. data persistence
5. user-visible inconsistencies

---

# 23. VALIDATION SCENARIOS

After implementation, manually validate these flows.

## Scenario A — New company

```text
Add Company
→ Research
→ Evidence
→ Opportunity
→ Discover contacts
→ Select contact
```

Verify each action changes persisted state.

---

## Scenario B — Outreach

```text
Select contact
→ Generate outreach
→ Edit
→ Create campaign
→ Pre-send review
→ Send
```

Verify:

* campaign exists independently
* campaign member exists
* personalized outreach is preserved
* template remains unchanged

---

## Scenario C — Reply

```text
Conversation
→ Receive reply
```

Verify:

* conversation becomes `REPLIED`
* follow-up is cancelled
* it does NOT automatically become `ACTIVE`
* Contacts reflects reply
* Dashboard reflects reply
* Company Workspace reflects reply

---

## Scenario D — Continue conversation

```text
REPLIED
→ Continue conversation
```

Verify:

```text
REPLIED → ACTIVE
```

only after explicit user action.

---

## Scenario E — Stop conversation

```text
ACTIVE
→ Stop conversation
```

Verify:

```text
STOPPED
```

is terminal.

No reopen action.

---

## Scenario F — Outcome

Record:

```text
INTERESTED
FOLLOW_UP_LATER
REFERRED
APPLICATION_OPPORTUNITY
NOT_A_FIT
NOT_HIRING
NO_RESPONSE
CLOSED
```

where applicable.

Verify outcome and conversation stage remain conceptually separate.

Verify relationship status updates consistently.

---

## Scenario G — Multi-campaign contact

Use one contact in more than one campaign.

Verify:

```text
Contact
→ Campaign A
→ Campaign B
```

does not overwrite either relationship.

---

## Scenario H — Cross-domain entry

Start from:

```text
/contacts/:id
```

and navigate to:

```text
Company
Opportunity
Campaign
Conversation
```

Then return to the Contact.

Verify state remains intact.

Repeat starting from:

```text
/opportunities/:id
/conversations/:id
/campaigns/:id
```

---

# 24. FINAL CHECKS

Run:

* TypeScript/typecheck
* lint if available
* relevant tests
* production/build check if available

Fix all errors caused by your implementation.

Do not claim completion merely because TypeScript passes.

The final implementation should demonstrate:

### One state model

not separate page-specific state models.

### One relationship graph

not company-owned fake domains.

### One lifecycle model

not contradictory status calculations.

### Canonical navigation

every major domain can be entered directly.

### Persistent behavior

user actions survive navigation and refresh where local persistence is expected.

### No silent fake data

demo data remains clearly separated from user state.

---

# 25. DELIVERABLE

At completion, provide a concise implementation summary containing:

1. What was inspected
2. What architectural inconsistencies were found
3. What was changed
4. What was deliberately left unchanged and why
5. Routes verified
6. Lifecycle invariants verified
7. Cross-domain relationships verified
8. Tests/typecheck/build results
9. Any remaining risks

Most importantly:

**Do not stop at "audit complete."**

If the audit exposes an issue, fix it in this pass whenever reasonably possible, then continue through the remaining validation work.

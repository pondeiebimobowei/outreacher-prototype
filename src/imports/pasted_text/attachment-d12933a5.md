# Outreacher — Next Product Phase

## Unified Career Profile, Company Management, Contact Expansion, Outreach Domain & Campaign UX

You are continuing development of the existing **Outreacher Figma Make prototype**.

This is a **prototype implementation**, not a production backend. Prioritize coherent product behavior, state transitions, realistic interaction, responsive UX, and a unified domain model. Do not introduce real external APIs, real email sending, real LinkedIn integrations, or real credentials.

The previous phase implemented or attempted:

* global Person + Company relationship contact model
* manual contacts
* contact editing
* Integrations
* Sender Accounts
* campaign sender-account selection
* global Contacts
* contact detail with company context
* global search / command palette
* landing page
* conversations
* campaigns
* templates
* dashboard
* research
* opportunities
* outreach generation/review
* sending simulation
* follow-ups
* outcomes / relationship tracking

Do **not** assume those implementations are fully correct merely because TypeScript passes.

Before implementing this phase, inspect the existing implementation and preserve working behavior. Where the existing implementation violates the requirements below, fix it as part of this phase.

---

# 1. PRIMARY PRODUCT DIRECTION

Outreacher should increasingly feel like:

> **A career opportunity and relationship workspace that helps a user turn target companies into meaningful conversations.**

The core model is:

```text
Career Profile
      ↓
Target Companies
      ↓
Company Intelligence
      ↓
People / Contacts
      ↓
Opportunity / Reasoning
      ↓
Outreach
      ↓
Conversation
      ↓
Relationship / Outcome
```

Do not collapse these domains into one generic "communication" object.

The distinction between:

```text
Outreach
Conversation
Campaign
```

must become explicit.

---

# 2. CRITICAL DOMAIN DISTINCTION

Implement and preserve this conceptual architecture:

```text
Company
  ├── Contacts
  ├── Opportunities
  ├── Research / Evidence
  ├── Outreaches
  ├── Campaigns
  └── Conversations
```

Globally:

```text
Person
  └── Company Relationships

Outreach
  ├── belongs to a company
  ├── belongs to a contact
  ├── contains outbound message
  └── may create / link to a conversation

Conversation
  ├── belongs to a company
  ├── belongs to a contact
  ├── contains actual message history
  └── may originate from an outreach or campaign

Campaign
  ├── belongs to a workspace
  ├── contains multiple outreach recipients
  ├── uses templates
  ├── uses sender account
  └── may create conversations when replies occur
```

### Important rule

**Outreach and Conversation are not the same thing.**

An outreach is an outbound attempt.

A conversation is the ongoing message thread representing what actually happened between the user and the contact.

For example:

```text
Outreach
"Hi Sarah, I noticed your team is..."
        ↓
sent
        ↓
Conversation
Sarah: "Thanks for reaching out..."
User: "I'd be happy to..."
Sarah: "Can you send your CV?"
```

A contact may have:

* an outreach with no reply
* an outreach that resulted in a conversation
* multiple outreaches over time
* a conversation that began manually
* a conversation resulting from a campaign

Do not force every outreach to immediately become a conversation.

---

# 3. OUTREACH MUST BECOME A FIRST-CLASS DOMAIN

Create a proper **Outreach domain**.

It should not merely be a tab inside a company page or a temporary generation state.

Create:

```text
/outreaches
/outreaches/:id
```

The domain should support:

* All Outreaches
* Draft
* Ready
* Sent
* Replied / linked to conversation
* Archived / stopped where appropriate

Each Outreach should conceptually contain:

```ts
Outreach {
  id
  companyId
  contactId
  associationId
  campaignId?
  templateId?
  senderAccountId?
  subject
  message
  status
  createdAt
  sentAt?
  conversationId?
}
```

Adapt this to the existing prototype model instead of blindly copying the exact shape.

The important invariant is:

> An Outreach is a concrete outbound communication attempt directed at one contact in the context of one company.

---

# 4. GLOBAL OUTREACHES

Create a global:

## `/outreaches`

This shows all direct outreach activity across companies.

Each card/list item should communicate:

* contact
* company
* subject / message preview
* status
* created/sent time
* campaign if applicable
* conversation state if a reply exists

Clicking an outreach opens:

```text
/outreaches/:id
```

The detail page should show:

### Header

* Contact
* Company
* Outreach status
* Date
* Campaign if applicable

### Message

Show the actual outbound message.

### Context

Show useful reasoning:

* Why this person
* Why this company
* Opportunity context
* Template used
* Sender account
* Evidence if available

### Relationship

If the outreach produced a conversation:

```text
Conversation started
View conversation →
```

If not:

```text
No reply yet
```

Do not fabricate a conversation simply because an outreach exists.

---

# 5. COMPANY-SCOPED OUTREACH

Inside Company Details, add:

## Outreach

This is **company-scoped outreach only**.

It should show:

> Outreaches sent/drafted to contacts associated with this company.

It should not show outreach from other companies.

The company outreach view should allow:

* view outreach
* create outreach
* filter by contact
* filter by status
* open outreach details

---

# 6. REPLACE THE CURRENT "SELECT CONTACT → PREPARE OUTREACH" FLOW

The current flow is too indirect:

```text
Select contact
↓
go somewhere
↓
click prepare outreach
```

Replace it.

When viewing a company contact:

### Contact row/card

Use:

**Prepare outreach**

rather than:

**Select**

Clicking **Prepare outreach** should immediately create/open an outreach workflow for that individual contact.

The destination should be the Outreach workflow/detail view.

Example:

```text
Sarah Williams
Engineering Manager

Why this person
...
Evidence
...

[ Prepare outreach ]
```

Click:

```text
Prepare outreach
```

→

```text
Outreach editor
```

with Sarah already selected.

The user should not need another selection step.

---

# 7. INDIVIDUAL OUTREACH CREATION

Users must be able to create individual outreach independently of campaigns.

Example:

```text
Company
  ↓
Contacts
  ↓
Sarah Williams
  ↓
Prepare outreach
  ↓
Create outreach
```

The outreach editor should support:

* recipient
* company
* template selection
* subject
* message
* sender account where applicable
* save draft
* generate/rewrite simulated AI copy
* review
* send simulation

The selected contact must remain the recipient throughout the flow.

---

# 8. OUTREACH → CONVERSATION LINKING

When an outreach is simulated as sent:

```text
Outreach.status = SENT
```

Do not automatically mark:

```text
Conversation = ACTIVE
```

If there is no response:

```text
Outreach = SENT
Conversation = none / no reply
```

If the contact replies:

```text
Outreach = SENT
Conversation = REPLIED
Outreach.conversationId = conversation.id
```

The existing conversation lifecycle rules still apply:

```text
NO_REPLY
REPLIED
ACTIVE
STOPPED
```

A `REPLIED` conversation should not automatically become `ACTIVE`.

The user must explicitly continue the conversation.

---

# 9. CONVERSATIONS

Preserve Conversations as a separate first-class domain.

Global:

```text
/conversations
/conversations/:id
```

The global Conversations page shows all conversations.

However:

## Company → Conversations

Inside Company Details, the Conversations tab must show **only conversations involving contacts associated with that company**.

Do not show unrelated workspace conversations.

Example:

```text
Acme
  Conversations

Sarah Williams
  Replied 2h ago

Michael Chen
  Active

David Lee
  Stopped
```

Clicking an item should continue using:

```text
/conversations/:id
```

The existing conversation detail experience should remain intact unless a correction is required.

---

# 10. CAMPAIGNS UNDER COMPANY

The current Company → Campaigns tab needs to be corrected.

It should show:

> Campaigns that have contact members associated with this company.

Do not simply show every campaign in the workspace.

Example:

```text
Acme

Campaigns

Backend Hiring Outreach
8 contacts
3 sent
1 replied

Engineering Networking
4 contacts
2 sent
```

A campaign can contain contacts from multiple companies.

Therefore:

```text
Company A → Campaigns
```

must filter campaign members by company.

Do not duplicate campaigns merely because they appear under multiple companies.

---

# 11. ADD CONTACTS TO COMPANY

When viewing a company, users must be able to add contacts directly from company mode.

Add a clear action:

```text
+ Add contact
```

inside the Company → Contacts experience.

The flow should support:

### Create new person

```text
First name
Last name
Email
Phone
LinkedIn
Notes
```

then associate them with the current company.

### Existing person

Allow the user to search existing global Contacts and associate an existing person with the current company.

Do not create a duplicate Person when the user is trying to associate an existing person.

This must use the same global Person + Company Association model established previously.

---

# 12. CONTACT MODEL — CARRY FORWARD

Do not regress the global person architecture.

The model must remain:

```text
Person
  ↓
Company Association
```

Global Person:

* first name
* last name
* email
* phone
* LinkedIn
* notes
* source

Company Association:

* company
* title
* department/team
* why this person
* evidence
* relationship context
* company-specific timeline/context

A person can belong to multiple companies.

Global Contacts must display the person once.

Company Contacts display the relevant association.

---

# 13. CONTACT TYPE

Add:

```text
Contact Type
```

Supported values:

```text
PERSON
ROLE_ADDRESS
```

### PERSON

An individual.

Example:

```text
Sarah Williams
Engineering Manager
sarah@example.com
```

### ROLE_ADDRESS

A functional inbox or role address.

Example:

```text
Engineering Recruiting
engineering@example.com
```

For `ROLE_ADDRESS`, the UI should make it clear that this is not an individual person.

The contact form must support:

```text
Contact Type

PERSON
ROLE_ADDRESS
```

For PERSON:

```text
First name
Last name
Role / Title
...
```

For ROLE_ADDRESS:

```text
Display name
Functional email
Role / Title
...
```

Do not require first/last name for a role address.

---

# 14. CONTACT REFERENCE URL

Add:

```text
Reference URL (Optional)
```

This can represent:

* company team page
* public profile
* source page
* recruiting page
* other evidence/reference

Persist it on the appropriate contact/company relationship model.

Do not confuse it with LinkedIn URL.

---

# 15. COMPANY CREATION

The Add Company workflow must include:

```text
Company Name *
```

Example:

```text
asdf
```

```text
Company Website / Domain
(Optional)

https://www.acme.com
```

```text
Industry
(Optional)

e.g. Fintech
```

```text
Location
(Optional)

e.g. San Francisco, CA
```

```text
Description / Notes
(Optional)

Brief context about why you want to pursue this company...
```

Use appropriate field labels and helper text.

Company creation should persist all fields.

---

# 16. COMPANY EDITING

Users must be able to edit companies.

Add:

```text
Edit company
```

The edit form should expose the same company fields.

Editing must update the existing company record rather than creating another company.

---

# 17. COMPANY ARCHIVING

Users must be able to archive a company.

Do not immediately hard-delete it.

Introduce a company lifecycle such as:

```text
ACTIVE
ARCHIVED
```

or equivalent.

Archived companies should:

* disappear from normal active-company lists
* remain accessible through an Archived filter/view
* preserve their contacts, outreach, campaigns, conversations, evidence, and history
* not silently delete associated data

Provide appropriate confirmation for destructive/archive actions.

If a company is archived, communicate the state clearly.

---

# 18. CAREER PROFILE EXPANSION

Expand onboarding/Profile.

The Career Profile must include:

## Target Industries

Examples:

```text
Fintech
DevTools
HealthTech
SaaS
AI
Cybersecurity
```

Allow multiple selections.

Do not limit the user to one industry.

---

## Target Locations

Allow multiple target locations.

Examples:

```text
Remote
Lagos
London
New York
United States
Europe
```

The UI should distinguish location preferences from current location.

---

# 19. BACKGROUND & POSITIONING

Add a section:

## Background & Positioning

Helper text:

> Feeds AI outreach generation and evidence matching context.

Fields:

### Professional Headline

Placeholder:

```text
Staff Engineer specializing in high-throughput backend architecture
```

### Experience Highlights

Placeholder:

```text
Key technical achievements, team leadership scale, or domain impacts...
```

This should support meaningful multi-line content.

These values must become part of the user's persistent career profile.

They should later be available to simulated:

* outreach generation
* evidence matching
* contact reasoning
* opportunity reasoning

Do not merely render the fields without connecting them to the generation/context layer.

---

# 20. ONBOARDING MUST BE SKIPPABLE

Onboarding should no longer force users through every step.

Users should be able to:

```text
Skip for now
```

or equivalent.

However, skipping onboarding must not make the product pretend that required information exists.

Use progressive restrictions.

Example:

### Missing career profile

User can enter the product.

Banner:

> Complete your career profile to improve outreach personalization.

CTA:

```text
Complete profile
```

### Missing target company

User can browse the workspace.

When attempting company-dependent functionality:

> Add a target company to start researching opportunities.

### Missing sender account

User can create/edit outreach.

When attempting to send:

> Connect a sender account before sending outreach.

CTA:

```text
Set up sender account
```

### Missing required outreach information

Prevent the specific action that genuinely requires the missing data.

Do not globally block the application.

---

# 21. ONBOARDING NOTIFICATION BANNERS

Add lightweight banners where relevant.

Do not turn the dashboard into a giant onboarding checklist.

Examples:

```text
Your career profile is incomplete.
Add your headline and experience highlights to improve outreach generation.

[Complete profile]
```

or:

```text
No sender account is configured.
You can draft outreach, but sending is unavailable until a sender account is connected.

[Set up sender account]
```

Banners should be dismissible where appropriate.

Do not repeatedly nag the user after dismissal unless the underlying action becomes relevant again.

---

# 22. INTEGRATIONS

Carry forward the Integration architecture.

Users must be able to have **multiple integrations**.

Supported simulated providers:

```text
Resend
SMTP
```

Each Integration needs:

```text
Integration name
Provider
Status
Configuration
```

Example:

```text
Integration name
Production Resend

Provider
Resend
```

For SMTP:

```text
Integration name
Company SMTP

Host
Port
Username
```

Secrets may be represented as masked/simulated values.

Do not store or transmit real credentials.

---

# 23. TEST CONNECTION

Each integration should have:

```text
Test connection
```

This is simulated.

States:

```text
Idle
Testing...
Connection successful
Connection failed
```

The interaction should feel realistic.

Do not call a real provider.

Users must be able to have:

```text
Integration A — Connected
Integration B — Connected
Integration C — Disconnected
```

without the UI assuming only one integration exists.

---

# 24. SENDER ACCOUNTS

Carry forward Sender Accounts.

A Sender Account represents:

> Who the user sends from.

An Integration represents:

> How the email service is technically connected.

Architecture:

```text
Integration
   ↓
Sender Account
   ↓
Campaign / Outreach
   ↓
Outbound Message
```

Sender account fields should include:

```text
Sender name
Sender email
Reply-to email
Integration
Daily sending limit
Status
```

---

# 25. DAILY SENDING LIMIT

Add:

```text
Daily sending limit
```

when creating/editing a Sender Account.

Example:

```text
Daily sending limit
50
```

The prototype should display the limit where relevant.

When simulating sends, respect the configured limit.

Example:

```text
Daily limit: 50
Sent today: 49
```

Attempting another send should produce an appropriate restriction:

> Daily sending limit reached for this sender account.

Do not implement real email delivery.

---

# 26. CAMPAIGN CREATION — BETTER CONTACT SELECTION

The current campaign contact selection should be improved.

Do not use an awkward giant multi-select list.

Use a selection pattern similar to a modern command/people picker.

Requirements:

* search
* filter by company
* filter by contact type
* selected state
* selected count
* remove selected contact
* clear all
* useful contact identity information

Example:

```text
Add contacts

Search contacts...

Sarah Williams
Engineering Manager
Acme

[✓]

Michael Chen
Staff Engineer
Paystack

[ ]
```

Selected contacts should appear in a clear selected section.

---

# 27. CAMPAIGN CREATION — BETTER TEMPLATE SELECTION

Use the same high-quality selection pattern for templates.

Instead of a basic dropdown, provide a template picker.

Example:

```text
Choose template

Search templates...

Backend Networking
Networking
Short introduction for engineering leaders

Hiring Manager Intro
Job opportunity
Direct role-specific outreach

Blank
Start from scratch
```

Allow:

* search
* category
* preview
* selected state
* change selection

When selected, the template should visibly feed into the campaign message configuration.

---

# 28. CAMPAIGN → SENDER ACCOUNT

Every sending campaign must explicitly use a Sender Account.

Campaign creation flow:

```text
Campaign details
      ↓
Select contacts
      ↓
Select template
      ↓
Select sender account
      ↓
Review
      ↓
Send
```

Pre-send review must show:

```text
From:
Name <email>

Reply-to:
email

Via:
Integration name / provider
```

Follow-ups inherit the campaign's sender account.

---

# 29. OUTREACH VS CAMPAIGN

Do not confuse these concepts.

### Individual Outreach

One concrete outbound message to one contact.

```text
Contact
↓
Outreach
```

### Campaign

A coordinated sending workflow involving multiple members.

```text
Campaign
 ├── Contact A → Outreach
 ├── Contact B → Outreach
 ├── Contact C → Outreach
 └── ...
```

Campaigns may generate individual Outreach records for their members.

This is important.

The user should eventually be able to inspect:

```text
Campaign
↓
Members
↓
Individual Outreaches
```

Therefore campaign members should not remain an isolated abstraction disconnected from Outreach.

---

# 30. OUTREACH DETAIL

The Outreach detail page should show:

### Recipient

```text
Sarah Williams
Engineering Manager
Acme
```

### Outreach

```text
Subject
Message
```

### Context

```text
Why this person
Why this company
Evidence
```

### Source

```text
Individual outreach
```

or:

```text
Campaign: Backend Networking
```

### Sender

```text
From: ...
Reply-to: ...
Via: ...
```

### Conversation

If linked:

```text
Conversation
Sarah replied 2 days ago

View conversation →
```

---

# 31. COMPANY DETAIL INFORMATION ARCHITECTURE

Review the Company Details tabs.

The tabs should conceptually be:

```text
Overview
Research
Opportunities
Contacts
Outreach
Campaigns
Conversations
```

Adjust existing tabs if necessary.

### Contacts

Only contacts associated with the company.

### Outreach

Only outreach associated with contacts at this company.

### Campaigns

Only campaigns with members belonging to this company.

### Conversations

Only conversations involving contacts associated with this company.

Do not simply duplicate global pages.

---

# 32. PROFILE → CONTACTS

If Profile currently contains a Contacts tab, it must use the same global contact model.

Do not create a second contact database.

All of these:

```text
Global Contacts
Profile → Contacts
Company → Contacts
```

must operate on the same underlying Person + Association data.

---

# 33. CONTACT DUPLICATE AWARENESS

Manual contact creation must detect duplicates.

Strong duplicate signal:

```text
email
```

If the email already belongs to an existing Person:

```text
This person already exists.

Sarah Williams
sarah@example.com

Associated with:
Acme
Paystack

[View person]
[Associate with this company]
```

Do not silently create another Person.

For role addresses, use appropriate email-based duplicate detection as well.

---

# 34. DISCOVERED CONTACTS

The existing simulated contact discovery flow must eventually converge into the same model.

Do not maintain:

```text
AI contacts
```

and:

```text
Manual contacts
```

as separate databases.

They are both:

```text
Person
+
Company Association
```

The source can differ:

```text
MANUAL
DISCOVERED
```

but the underlying entity model must be shared.

---

# 35. GLOBAL SEARCH

Carry forward the existing Global Search / Command Palette.

Update the index so it can find:

* Companies
* Contacts
* Opportunities
* Outreaches
* Conversations
* Campaigns
* Templates
* Integrations
* Sender Accounts where appropriate

Search result labels should make the domain clear.

Example:

```text
Outreach
Sarah Williams · Acme
```

---

# 36. DASHBOARD

Do not turn the dashboard into an onboarding checklist.

The dashboard should surface actionable blockers only when relevant.

Examples:

```text
You have 3 outreach drafts ready for review.
```

```text
Sarah Williams replied.
```

```text
Your sender account has reached today's sending limit.
```

```text
Your career profile is incomplete.
```

The first three are operationally relevant.

The profile completion reminder can be lower priority.

---

# 37. STATE CONSISTENCY

Carry forward the previous lifecycle model.

### Company

```text
NOT_ADDED
ACTIVE
ARCHIVED
```

### Research

```text
NOT_STARTED
IN_PROGRESS
COMPLETE
```

### Opportunity

```text
UNCLASSIFIED
PROACTIVE
CONFIRMED
```

### Contact

```text
NOT_DISCOVERED
DISCOVERING
DISCOVERED
SELECTED
```

Adapt if the new architecture makes a better representation necessary.

### Outreach

At minimum:

```text
DRAFT
READY
SENT
```

Potential additional states:

```text
FAILED
ARCHIVED
```

only if useful to the existing prototype.

### Conversation

Preserve:

```text
NO_REPLY
REPLIED
ACTIVE
STOPPED
```

Do not automatically transition:

```text
REPLIED → ACTIVE
```

---

# 38. PERSISTENCE

Every important user action must follow:

```text
USER ACTION
↓
PERSISTED WORKSPACE UPDATE
↓
ROUTE / TAB CHANGE
↓
UI RECONSTRUCTS FROM PERSISTED STATE
```

Do not rely on component-local state for domain data.

Particularly verify:

* adding contact
* associating existing contact
* editing contact
* editing company
* archiving company
* creating outreach
* editing outreach
* selecting campaign contacts
* selecting campaign template
* selecting sender account
* testing integration
* creating integration
* creating sender account
* daily sending limit
* sending outreach
* linking conversation
* company-scoped filtering

---

# 39. RESPONSIVE DESIGN

Everything added in this phase must work on:

### Desktop

Persistent sidebar and spacious workspace.

### Tablet

Collapsible/overlay navigation where appropriate.

### Mobile

Do not force desktop tables into mobile.

Use:

* stacked cards
* drawers
* sheets
* compact selectors
* full-screen editors where appropriate

Particularly test:

* Add Contact
* Add Company
* Template Picker
* Contact Picker
* Sender Account Picker
* Integration form
* Outreach editor
* Campaign creation
* Conversation detail

---

# 40. ACCESSIBILITY

Preserve WCAG 2.2 AA expectations.

All new:

* dialogs
* forms
* dropdowns
* comboboxes
* pickers
* confirmation dialogs
* banners

must support:

* keyboard navigation
* visible focus
* labels
* appropriate ARIA
* escape behavior
* focus restoration
* disabled states
* validation messaging

---

# 41. VISUAL DIRECTION

Continue the existing product language:

**Linear-like discipline**
+
**Attio-like relationship context**
+
**Apollo-like prospecting mechanics**
+
**Outreacher's career opportunity reasoning**

Do not turn the product into a sales CRM.

Avoid:

* excessive tables
* enterprise-style dashboards
* generic CRM language
* meaningless analytics
* overly dense cards

The product should feel like a serious career workspace.

---

# 42. IMPORTANT UX RULE

Prefer explicit actions over hidden state transitions.

Good:

```text
Prepare outreach
```

Bad:

```text
Select
```

followed by another unclear step.

Good:

```text
Add contact
```

Good:

```text
Associate existing person
```

Good:

```text
Test connection
```

Good:

```text
Set sender account
```

Good:

```text
View conversation
```

The user should always understand what the next action does.

---

# 43. CARRY-FORWARD FIXES FROM PREVIOUS PHASE

Before declaring this phase complete, inspect and fix any remaining issues from the previous Contact / Integration / Sender Account implementation.

Specifically verify:

### Contacts

* global Person model is actually the source of truth
* no accidental company-owned duplicate people
* company association is separate
* global Contacts shows a person once
* company Contacts are contextual
* manual and discovered contacts converge
* contact editing distinguishes global vs company-specific fields
* duplicate detection works

### Integrations

* multiple integrations work
* Integration has a name
* provider is distinct from integration name
* Test Connection exists
* connection state persists
* disconnected integrations are represented correctly

### Sender Accounts

* multiple sender accounts work
* sender account references an integration
* sender identity is distinct from integration
* daily limit persists
* disconnected integrations are surfaced
* campaign/outreach sending respects sender account

### Campaigns

* sender account persists
* template selection persists
* contact selection persists
* campaign members map to individual contacts
* company campaign filtering works

### Conversations

* conversations remain separate from outreaches
* company filtering works
* replies create/link conversations appropriately
* no automatic REPLIED → ACTIVE transition

---

# 44. DO NOT DO THESE THINGS

Do not:

* introduce real email APIs
* send real emails
* store real credentials
* call Resend
* call SMTP
* integrate LinkedIn
* build a real AI backend
* rebuild the entire application architecture
* replace working components unnecessarily
* create a second contact database
* create separate manual/discovered contact entities
* turn campaigns into conversations
* turn outreaches into conversations
* make onboarding mandatory again
* use TypeScript success as the only QA criterion

This is a prototype.

The goal is a **credible, coherent, stateful product experience**.

---

# 45. IMPLEMENTATION ORDER

Implement in this order.

## Phase A — Career Profile

1. Target Industries
2. Target Locations
3. Background & Positioning
4. Professional Headline
5. Experience Highlights
6. persistence
7. onboarding skip
8. contextual notification banners
9. relevant restrictions

---

## Phase B — Company Management

1. expand Add Company
2. persist new fields
3. edit company
4. archive company
5. active/archived filtering
6. confirmation UX

---

## Phase C — Contact Expansion

1. Contact Type
2. ROLE_ADDRESS
3. PERSON
4. Reference URL
5. role/title
6. add contact from company
7. existing-person association
8. duplicate detection
9. editing
10. verify global Person model

---

## Phase D — Outreach Domain

1. create Outreach type/model
2. global `/outreaches`
3. `/outreaches/:id`
4. company-scoped Outreach
5. individual outreach creation
6. Prepare Outreach action
7. draft/ready/sent states
8. sender account integration
9. campaign source linkage
10. conversation linkage

---

## Phase E — Conversation Separation

1. verify conversations are independent domain
2. link from outreach when appropriate
3. company filtering
4. global filtering
5. preserve existing conversation detail
6. preserve explicit conversation continuation

---

## Phase F — Campaign UX

1. better contact picker
2. better template picker
3. sender account selection
4. member/outreach relationship
5. company campaign filtering

---

## Phase G — Integrations / Sender Accounts

1. integration name
2. multiple integrations
3. Test Connection
4. integration states
5. multiple sender accounts
6. daily sending limit
7. sender-account/integration relationship
8. sending restrictions

---

## Phase H — Cross-Domain QA

Test these exact scenarios.

### Scenario 1 — New user

```text
Signup
↓
Skip onboarding
↓
Dashboard
↓
See profile completion banner
↓
Browse product
```

No dead end.

---

### Scenario 2 — Complete profile later

```text
Profile
↓
Add target industries
↓
Add target locations
↓
Add headline
↓
Add experience highlights
↓
Save
↓
Banner disappears / updates
```

---

### Scenario 3 — Add company

```text
Companies
↓
Add company
↓
Fill all fields
↓
Save
↓
Company appears
↓
Edit
↓
Archive
↓
Archived state visible
```

---

### Scenario 4 — Add contact to company

```text
Company
↓
Contacts
↓
Add contact
↓
Create PERSON
↓
Save
↓
Contact appears
```

---

### Scenario 5 — Associate existing person

```text
Company A
↓
Add contact
↓
Existing person
↓
Search Sarah
↓
Associate with Company A
↓
Sarah now appears under Company A
```

Sarah must still exist as one global person.

---

### Scenario 6 — Individual outreach

```text
Company
↓
Contacts
↓
Sarah
↓
Prepare outreach
↓
Outreach editor
↓
Choose template
↓
Edit message
↓
Choose sender
↓
Save / Send simulation
↓
Outreach appears in Company → Outreach
↓
Outreach appears in global /outreaches
```

---

### Scenario 7 — Campaign

```text
Campaigns
↓
Create campaign
↓
Select multiple contacts
↓
Select template
↓
Select sender account
↓
Review
↓
Send simulation
↓
Individual outreach records created
```

---

### Scenario 8 — Reply

```text
Outreach
↓
Contact replies
↓
Conversation created/linked
↓
Outreach shows conversation link
↓
Company → Conversations shows it
↓
Global Conversations shows it
```

---

### Scenario 9 — Multiple companies

```text
Sarah
↓
Company A association
↓
Company B association
```

Global Contacts:

```text
Sarah — one row
```

Company A:

```text
Sarah — Company A context
```

Company B:

```text
Sarah — Company B context
```

Outreach:

```text
Company A outreach
Company B outreach
```

must remain separate.

---

### Scenario 10 — Sender limits

```text
Sender Account
Daily limit = 10
Sent today = 10
↓
Attempt send
↓
Blocked
↓
Explain why
```

---

# 46. QA REQUIREMENTS

Do not stop after TypeScript.

Perform:

### 1. TypeScript

```text
pnpm --filter web check-types
```

or the appropriate existing command.

### 2. Build

Run the existing web build.

### 3. Functional QA

Exercise the scenarios above.

### 4. Visual QA

Inspect the actual rendered screens.

Pay particular attention to:

* onboarding
* profile
* company creation/edit
* company contacts
* global contacts
* contact detail
* outreach list
* outreach detail
* campaign creation
* template picker
* contact picker
* integrations
* sender accounts
* company tabs
* conversations
* mobile layouts

### 5. State QA

Refresh/reload after meaningful mutations.

Confirm data remains correct.

### 6. Regression QA

Verify existing:

* dashboard
* research
* opportunities
* conversations
* campaigns
* templates
* global search
* command palette
* landing page

still work.

---

# 47. DEFINITION OF DONE

This phase is complete only when:

* onboarding can be skipped
* relevant banners explain missing configuration
* necessary actions are restricted without globally blocking the product
* career profile has industries
* career profile has target locations
* career profile has background/positioning
* professional headline exists
* experience highlights exist
* company creation has all required fields
* company editing works
* company archiving works
* contact type supports PERSON and ROLE_ADDRESS
* reference URL exists
* role/title exists
* contacts can be added from company mode
* existing people can be associated with companies
* duplicate detection works
* Person remains global
* Company Association remains contextual
* Outreach is a first-class domain
* global Outreaches exist
* company-scoped Outreach exists
* individual outreach creation works
* Prepare Outreach replaces unnecessary selection flow
* Outreach and Conversation remain separate
* outreach can link to a conversation
* company Conversations are correctly scoped
* company Campaigns are correctly scoped by members
* campaign contact selection is usable
* campaign template selection is usable
* multiple integrations work
* integration names exist
* Test Connection works as simulation
* multiple sender accounts work
* daily sender limit works
* sender account → integration relationship works
* campaigns use sender accounts
* sending respects sender-account restrictions
* persistence works
* responsive behavior works
* accessibility basics work
* existing functionality has not regressed
* rendered UX has been visually inspected
* all critical scenarios above work

Do not declare completion merely because:

```text
TypeScript passes
```

The product must behave coherently as a connected system.

# Final implementation principle

When deciding between preserving an existing implementation and correcting it, use this rule:

> **Preserve working behavior, but correct domain models and user flows that contradict the product architecture.**

The product should increasingly make this journey feel natural:

```text
"I want to work with this company."
        ↓
"Why is this company relevant?"
        ↓
"Who should I contact?"
        ↓
"Why should I contact this person?"
        ↓
"Prepare outreach."
        ↓
"Send it."
        ↓
"Did they reply?"
        ↓
"Continue the relationship."
```

That is the experience this phase should strengthen.

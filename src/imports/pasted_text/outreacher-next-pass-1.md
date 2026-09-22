# OUTREACHER — NEXT IMPLEMENTATION PASS

## 2 Major Tasks + 1 Minor Task

### Campaign Domain + Email Templates Domain + Cross-Domain Consistency

Continue implementation of the existing Outreacher prototype.

This is a **Figma Make prototype**, not a production backend implementation.

Do not stop at analysis or produce a verification-only milestone.

**Inspect the current implementation first, then implement the three tasks below together.**

Carry forward any necessary fixes from all previous milestones.

Do not assume something is complete merely because a version of it exists inside `CompanyDetailPage`.

A concept implemented inside the Company Workspace is **not automatically a completed product domain**.

---

# PRODUCT CONTEXT

Outreacher's core promise:

> Turn “I want to work at this company” into “I have a credible, evidence-backed reason to contact this person.”

The product journey is:

**Company → Evidence → Opportunity → Person → Reason → Outreach → Campaign → Conversation → Relationship / Outcome**

The company remains the central context.

But Outreacher is now growing beyond a company-only workspace.

The application needs real first-class domains for:

* Companies
* Contacts
* Campaigns
* Templates
* Conversations / relationships

The Company Workspace should remain an important contextual entry point into these domains, but it should not permanently own their functionality.

---

# CRITICAL ARCHITECTURAL PRINCIPLE

We currently have several features implemented primarily inside:

```text
CompanyDetailPage
```

That does NOT mean the corresponding domain is complete.

For example:

```text
Company
└── Campaign tab
```

is useful for contextual workflow.

But Campaigns must eventually also exist as:

```text
Campaigns
├── Campaign list
├── Campaign detail
├── Members
├── Template
└── Sending / activity state
```

Likewise:

```text
Company
└── Outreach / message
```

does not mean Email Templates are complete.

Templates need their own reusable product surface.

Implement these domain-level experiences now.

---

# MAJOR TASK 1

# CAMPAIGNS AS A FIRST-CLASS MULTI-CONTACT DOMAIN

## Objective

Transform Campaigns from a company-tab-only concept into a proper application domain.

The most important correction:

> **A campaign is NOT one contact + one email.**

A campaign can contain:

**multiple contacts / campaign members**

and reuse the same email template across those members.

The campaign should therefore represent a reusable outreach operation rather than a single conversation.

---

# 1.1 CAMPAIGN DOMAIN MODEL

The prototype should conceptually represent:

```text
Campaign
├── identity
│   ├── name
│   └── status
│
├── configuration
│   ├── template
│   ├── sender
│   └── optional scheduling configuration
│
├── members
│   ├── Contact A
│   ├── Contact B
│   ├── Contact C
│   └── ...
│
└── activity
    ├── sent
    ├── replies
    ├── follow-ups
    └── outcomes
```

Do NOT build a production backend.

Use the existing workspace store / prototype persistence.

---

# 1.2 CAMPAIGN STATUS

Separate campaign-level status from member-level status.

Campaign-level states can be:

```text
DRAFT
READY
SENDING
ACTIVE
PAUSED
COMPLETED
```

Keep the state vocabulary simple.

Do not introduce unnecessary campaign states.

---

# 1.3 CAMPAIGN MEMBER STATUS

Each campaign member needs an independent lifecycle.

Use a compact lifecycle such as:

```text
PENDING
READY
SENT
REPLIED
FOLLOW_UP_DUE
STOPPED
COMPLETED
```

The exact naming may be adapted to the existing implementation, but the conceptual distinction is mandatory.

Example:

```text
Campaign: Frontend outreach

Members:
- Jane — REPLIED
- Alex — SENT
- David — FOLLOW_UP_DUE
- Sarah — STOPPED
```

Do NOT let one member's state automatically become the entire campaign's state.

---

# 1.4 CAMPAIGN LIST ROUTE

Create a real top-level Campaigns route.

Use the application's existing shell/navigation.

Example:

```text
/campaigns
```

The page should contain:

### Header

```text
Campaigns

Create and manage outreach campaigns.
```

Primary CTA:

```text
Create campaign
```

---

# 1.5 CAMPAIGN LIST

Show useful campaign information.

Each row/card should communicate:

```text
Campaign name
Template
Member count
Sent count
Reply count
Current status
Last activity
```

Example:

```text
Frontend outreach — Fintech

Template:
Fintech Engineering Intro

12 contacts
8 sent
2 replied

ACTIVE

Last activity
Today
```

Do not turn this into an analytics dashboard.

The list is primarily for:

> finding and continuing campaign work.

---

# 1.6 EMPTY STATE

For a new user:

```text
No campaigns yet

Create a campaign when you're ready to reach multiple people
with a reusable outreach message.

[Create campaign]
```

Do not inject fake campaigns into a normal workspace.

---

# 1.7 CAMPAIGN DETAIL ROUTE

Create a proper campaign detail experience.

Conceptually:

```text
/campaigns/:id
```

The Company Workspace can link to this page.

The Campaign tab inside CompanyDetailPage should become a **contextual summary/entry point**, not the only campaign interface.

---

# 1.8 CAMPAIGN DETAIL HEADER

Show:

```text
Campaign name
Status
Template
Member count
```

Example:

```text
Frontend outreach — Fintech

ACTIVE

12 members
Template: Fintech Engineering Intro
```

Primary actions should depend on campaign state.

Examples:

```text
Review campaign
Add contacts
Edit campaign
Pause campaign
```

Do not show irrelevant actions.

---

# 1.9 CAMPAIGN MEMBERS

This is the most important part.

Show a member table/list.

Columns or cards:

```text
Contact
Company
Status
Last activity
Next action
```

Example:

```text
Jane Doe
Paystack

REPLIED

Today
Continue conversation
```

```text
Alex Smith
Flutterwave

FOLLOW-UP DUE

4 days ago
Review follow-up
```

```text
Sarah Lee
Stripe

SENT

Yesterday
Await reply
```

The user must be able to work with each member independently.

---

# 1.10 ADD MEMBERS

A campaign should support adding multiple contacts.

Provide:

```text
Add contacts
```

The prototype can present a contact-selection interface using existing contacts.

Do not build real contact enrichment.

Allow selecting multiple contacts.

Example:

```text
Select contacts

☑ Jane Doe — Paystack
☑ Alex Smith — Flutterwave
☐ Sarah Lee — Stripe
☐ David — Moniepoint

[Add selected contacts]
```

---

# 1.11 MEMBER + COMPANY CONTEXT

Every campaign member should retain:

```text
Contact
Company
Campaign
```

The UI should make this relationship obvious.

A user should never wonder:

> “Which company is this person associated with?”

---

# 1.12 TEMPLATE REUSE

A campaign should reference a reusable template.

Example:

```text
Template
Fintech Engineering Intro
```

The campaign may use the same template for multiple members.

However:

**the final recipient-specific message must remain editable per member.**

This is important.

The conceptual pipeline becomes:

```text
Template
↓
Recipient context
↓
Personalized draft
↓
Human review
↓
Campaign member
↓
Send
```

Do not make the template itself mutate every time a member edits their personalized message.

---

# 1.13 CAMPAIGN CREATION FLOW

Create a proper campaign creation flow.

Suggested sequence:

```text
Create campaign
↓
Name campaign
↓
Choose template
↓
Add contacts
↓
Review members
↓
Review personalized messages
↓
Confirm
↓
Campaign READY
```

Do not require the user to create one campaign per contact.

---

# 1.14 PRE-SEND REVIEW

Before sending, show:

```text
Campaign review

12 contacts
Template: Fintech Engineering Intro

12 ready
0 need attention
```

Then list member previews.

Each member can be opened to inspect/edit the recipient-specific message.

Primary action:

```text
Send campaign
```

Since this is a prototype, simulate sending.

---

# 1.15 SENDING

Prototype behavior:

```text
READY
→ SENDING
→ ACTIVE
```

The UI should communicate progress without pretending that real email was sent.

For example:

```text
Sending campaign…

8 of 12 prepared
```

Then:

```text
Campaign active
12 members
```

No real provider integration.

---

# 1.16 CAMPAIGN METRICS

Keep metrics contextual and useful:

```text
12 members
8 sent
2 replied
1 follow-up due
1 stopped
```

Do not build a marketing analytics dashboard.

---

# 1.17 CAMPAIGN ↔ COMPANY RELATIONSHIP

A campaign can include contacts from multiple companies.

Therefore:

**Campaign is not owned by a single company.**

The Company Workspace may show:

```text
Campaigns involving this company
```

but the canonical campaign belongs to the Campaign domain.

This distinction is important.

---

# 1.18 CONVERSATION RELATIONSHIP

The conceptual relationship should now be:

```text
Campaign
└── Campaign Member
    ├── Contact
    ├── Company
    └── Conversation
```

Do not model:

```text
Campaign → one Conversation
```

because one campaign can contain many members.

Existing company conversation behavior must continue working.

---

# 1.19 EXISTING CAMPAIGN TAB

Do not delete the existing Company Workspace Campaign tab.

Refactor it into a useful contextual surface.

For example:

```text
Campaign

Frontend outreach

This contact is part of:
Frontend outreach

Status:
Sent

[View campaign]
```

If the campaign has multiple members, the company page should show only the relevant member/context.

CTA:

```text
View campaign
```

which navigates to:

```text
/campaigns/:id
```

---

# MAJOR TASK 2

# EMAIL TEMPLATES AS A FIRST-CLASS DOMAIN

## Objective

Outreacher currently generates messages but does not have a real reusable template system.

Add one.

Templates should be reusable assets that campaigns can reference.

---

# 2.1 TEMPLATE ROUTE

Create:

```text
/templates
```

Use the existing application shell.

Header:

```text
Email templates

Create reusable outreach messages that can be adapted
for different companies and contacts.
```

Primary CTA:

```text
Create template
```

---

# 2.2 TEMPLATE LIST

Show cards/rows containing:

```text
Template name
Category
Subject
Last updated
Usage count
```

Example:

```text
Fintech Engineering Intro

Networking
“Quick introduction — frontend engineering”

Used in 3 campaigns

Updated today
```

Avoid fake metrics if they are not derivable.

---

# 2.3 TEMPLATE CATEGORIES

Keep categories small.

For example:

```text
NETWORKING
REFERRAL
HIRING_MANAGER
RECRUITER
FOLLOW_UP
GENERAL
```

Human-readable labels should be used in UI.

Do not build an elaborate taxonomy.

---

# 2.4 TEMPLATE CREATION

Template creation should support:

```text
Name
Category
Subject
Body
```

Provide a clean editor.

The user should be able to save a reusable template.

---

# 2.5 PERSONALIZATION VARIABLES

Introduce a small set of prototype variables.

For example:

```text
{{firstName}}
{{company}}
{{role}}
```

Only use variables that the current product can meaningfully resolve.

Do not create a huge variable system.

Show available variables near the editor.

Example:

```text
Available personalization

{{firstName}}
{{company}}
{{role}}
```

---

# 2.6 TEMPLATE PREVIEW

Allow the user to preview a template with a realistic contact/company context.

Example:

```text
Preview for Jane Doe at Paystack

Hi Jane,

...
```

This should clearly be a preview.

---

# 2.7 TEMPLATE DUPLICATION

Support:

```text
Duplicate template
```

This is useful for creating variants without destroying the original.

---

# 2.8 TEMPLATE EDITING

Allow:

```text
Edit
Duplicate
```

Avoid destructive deletion unless the current architecture makes it necessary.

If deletion is included, require confirmation.

---

# 2.9 TEMPLATE ARCHIVING

Prefer archive over destructive deletion if the template is already referenced by campaigns.

An archived template should:

* remain available to existing campaigns
* not appear as the default choice for new campaigns
* remain accessible in template history

For the prototype, this can be represented visually/persisted simply.

---

# 2.10 TEMPLATE ↔ CAMPAIGN

Campaign creation should include:

```text
Choose template
```

with a clear path to:

```text
Create new template
```

Example:

```text
Choose a template

○ Fintech Engineering Intro
○ Hiring Manager Intro
○ Referral Request

[Create new template]
```

---

# 2.11 TEMPLATE ↔ PERSONALIZATION

When a template is applied to a campaign member:

```text
Template
↓
Resolved recipient context
↓
Personalized message
```

The resolved message becomes the member's editable message.

Editing the member's message must NOT modify the original template.

This distinction is mandatory.

---

# 2.12 FOLLOW-UP TEMPLATES

The existing follow-up system currently generates deterministic contextual follow-ups.

Do not break that.

Templates should eventually be capable of supporting follow-up patterns, but **do not force the existing follow-up implementation into the new template system if doing so would create unnecessary complexity in this pass.**

For now:

* existing deterministic follow-up generation remains functional
* template domain can include a FOLLOW_UP category
* do not create conflicting follow-up sources of truth

---

# 2.13 TEMPLATE EMPTY STATE

For a new user:

```text
No templates yet

Create a reusable outreach message to speed up future campaigns.

[Create template]
```

Do not populate fake templates unless there is an explicitly separated sample/demo workspace.

---

# 2.14 TEMPLATE DESIGN PRINCIPLE

Templates are:

> reusable starting points

They are NOT:

> immutable messages that every recipient receives identically.

Every recipient should be able to receive a contextualized version.

---

# MINOR TASK 3

# CROSS-DOMAIN NAVIGATION + STATE CONSISTENCY

This is a smaller task, but important because the product is now becoming multi-domain.

---

# 3.1 GLOBAL NAVIGATION

Update the application shell so the major domains are discoverable.

The navigation should conceptually expose:

```text
Dashboard
Companies
Contacts
Campaigns
Templates
```

Do not necessarily add Conversations as a top-level navigation item yet if the product architecture does not support a standalone conversation inbox.

Conversation remains contextual to:

```text
Company
Contact
Campaign Member
```

---

# 3.2 COMPANY CONTEXTUAL LINKS

Company Workspace should link naturally to first-class domains.

Examples:

```text
Campaign
→ View campaign

Contact
→ View contact

Conversation
→ View conversation
```

Do not duplicate entire domain interfaces inside CompanyDetailPage.

---

# 3.3 BREADCRUMBS / CONTEXT

Where appropriate, make the hierarchy clear.

Example:

```text
Campaigns
/
Frontend Engineering Outreach
```

or:

```text
Companies
/
Paystack
/
Campaign
```

The user should understand where they are.

---

# 3.4 BACK NAVIGATION

Ensure navigation does not destroy user context.

Examples:

From:

```text
Campaign → Member → Company
```

the user should be able to return to the campaign.

From:

```text
Company → Campaign
```

the user should be able to return to the company.

Use normal routing/state persistence rather than fake navigation.

---

# 3.5 STATE CONSISTENCY

Carry forward all previous fixes.

Inspect and fix any issues found in:

* Campaign
* Conversation
* Follow-up
* Outcome
* Relationship
* Dashboard

particularly where the new multi-contact campaign model exposes assumptions that campaign = one contact.

---

# CRITICAL DATA MODEL CORRECTION

Search the existing implementation for assumptions equivalent to:

```text
campaign → contact
```

or:

```text
campaign → outreach → one conversation
```

Refactor those assumptions where necessary.

The correct conceptual structure is:

```text
Campaign
  ↓
Campaign Members
  ↓
Contact + Company
  ↓
Recipient-specific Outreach
  ↓
Conversation
```

---

# IMPORTANT SOURCE-OF-TRUTH RULE

Avoid creating competing copies of state.

The following should remain conceptually distinct:

### Template

Reusable starting content.

### Campaign

Collection/orchestration of recipients using a template.

### Campaign Member

A specific recipient's participation in a campaign.

### Conversation

Actual communication history with that recipient.

### Outcome

What the interaction resulted in.

### Relationship

What the current relationship context means.

Do not collapse these into one object.

---

# CARRY-OVER FIXES FROM PREVIOUS MILESTONES

While implementing this pass, inspect and fix these if they are still present.

---

## FIX 1 — REPLIED MUST REQUIRE EXPLICIT CONTINUATION

```text
REPLIED
```

must not automatically show the active reply composer.

The user must choose:

```text
Continue conversation
```

before entering:

```text
ACTIVE
```

---

## FIX 2 — STOPPED IS TERMINAL

There must be no:

```text
Reopen
```

button.

No follow-up.

No composer.

No simulated reply.

No continuation.

History remains readable.

---

## FIX 3 — REPLY CANCELS FOLLOW-UP

If a reply arrives:

```text
followUpStage = NONE
```

and the dashboard must not continue showing:

```text
Follow-up due
```

for that conversation.

---

## FIX 4 — MAXIMUM TWO FOLLOW-UPS

Never allow:

```text
followUpCount > 2
```

No UI should expose another follow-up action after the second.

---

## FIX 5 — OUTCOME ≠ CONVERSATION STATE

Recording:

```text
Interested
```

must not automatically mutate:

```text
ACTIVE → STOPPED
```

or another conversation state unless the user explicitly performs that action.

---

## FIX 6 — RELATIONSHIP DERIVATION

Continue using the existing relationship derivation introduced in the previous pass.

Do not create a second relationship system.

---

## FIX 7 — OUTCOME NOTES

Preserve:

```text
convOutcomeNote
```

and make sure notes remain attached to the correct company/conversation.

---

## FIX 8 — DASHBOARD ACTION QUEUE

Preserve the previous:

```text
Needs your attention
```

concept.

Now make its campaign-related actions route to the proper Campaign domain.

For example:

```text
Campaign ready
→ View campaign
```

not merely:

```text
Open company
```

unless company context is genuinely the next action.

---

# CAMPAIGN-SPECIFIC DASHBOARD BEHAVIOR

Update dashboard queue logic to understand multi-contact campaigns.

Examples:

```text
Campaign ready
Frontend Engineering Outreach
12 contacts
[Review campaign]
```

```text
Follow-up due
Jane Doe · Paystack
[Review conversation]
```

```text
Campaign active
8 of 12 contacts sent
[View campaign]
```

Do not treat the campaign as a single conversation.

---

# COMPANY WORKSPACE CAMPAIGN EXPERIENCE

The Company Workspace should still answer:

> What is happening with this company?

Example:

```text
Campaign

Frontend Engineering Outreach

Your contact Jane Doe is part of this campaign.

Status
Replied

[View campaign]
[View conversation]
```

If multiple contacts from the same company belong to the campaign:

```text
2 contacts in this campaign

Jane Doe — Replied
Alex Smith — Sent
```

This is valuable company context.

But the campaign itself lives at:

```text
/campaigns/:id
```

---

# CONTACT SELECTION

Use the existing contact data.

Do not build external enrichment.

Campaign creation can select contacts already known to the prototype.

A contact may belong to multiple campaigns if the product state permits it.

Do not automatically prevent reuse unless there is an explicit product rule requiring it.

---

# TEMPLATE REUSE EXAMPLE

The intended model should support:

```text
Template:
Fintech Engineering Intro
```

Campaign A:

```text
Paystack
Jane Doe
Alex Smith
```

Campaign B:

```text
Flutterwave
John Doe
Sarah Smith
```

Both can reuse:

```text
Fintech Engineering Intro
```

while each recipient gets their own contextualized message.

This is a core requirement.

---

# RESPONSIVE DESIGN

All new domains must use the existing responsive shell.

### Desktop

Persistent sidebar.

Campaign detail can use:

```text
Main content
+ contextual member/activity panel
```

### Tablet

Use drawer/stacked layouts where necessary.

### Mobile

Campaign members become stacked cards rather than an unusable wide table.

Template editor becomes a single-column experience.

Do not force desktop tables into mobile.

---

# ACCESSIBILITY

Maintain WCAG 2.2 AA.

Ensure:

* keyboard navigation
* visible focus
* semantic controls
* accessible dialogs
* proper form labels
* clear status announcements
* minimum approximately 44px touch targets
* no status communicated by color alone

Multi-select contact interfaces must support keyboard interaction.

---

# VISUAL DIRECTION

Keep the existing Outreacher visual language.

Do not redesign the whole application.

Continue:

* restrained
* professional
* focused
* product-oriented
* Linear-inspired discipline
* relationship-oriented
* low visual noise

Avoid generic marketing/CRM aesthetics.

---

# DO NOT BUILD

Do not introduce:

* real email provider
* SMTP
* Resend
* Gmail integration
* real scheduling
* background workers
* backend APIs
* external contact enrichment
* external company research
* production AI
* billing
* team collaboration
* analytics suite
* complex automation builder

This pass is about **product structure and believable prototype behavior**.

---

# IMPLEMENTATION ORDER

## Phase A — Inspect

Read and understand:

```text
workspaceStore.ts
CampaignTab.tsx
ConversationTab.tsx
CompanyDetailPage.tsx
DashboardPage.tsx
app shell/navigation
contact implementation
existing routes
```

Search specifically for assumptions that:

```text
campaign = one contact
campaign = one company
campaign = one conversation
```

---

## Phase B — Campaign Domain

Implement:

```text
/campaigns
/campaigns/:id
```

with:

* campaign list
* campaign creation
* multi-contact selection
* campaign members
* member-specific states
* template selection
* pre-send review
* simulated sending
* campaign summary/activity

---

## Phase C — Templates Domain

Implement:

```text
/templates
/templates/:id
```

with:

* template list
* create
* edit
* duplicate
* category
* subject
* body
* variables
* preview
* archive if needed
* campaign integration

---

## Phase D — Cross-Domain Navigation

Update:

* global nav
* contextual links
* breadcrumbs where useful
* return paths
* dashboard CTAs
* company campaign links

---

## Phase E — Carry-Over Fixes

Fix any issues discovered in:

* conversation
* follow-ups
* campaign
* outcomes
* relationship state
* dashboard

Do not merely report them.

Fix them if they are directly relevant.

---

# BEHAVIORAL SANITY FLOWS

Exercise these flows in the implementation.

---

## FLOW 1 — CREATE TEMPLATE

```text
Templates
→ Create template
→ Name
→ Category
→ Subject
→ Body
→ Save
```

Expected:

Template appears in:

```text
/templates
```

---

## FLOW 2 — USE TEMPLATE

```text
Campaigns
→ Create campaign
→ Choose template
→ Add multiple contacts
```

Expected:

One campaign contains multiple members.

---

## FLOW 3 — PERSONALIZE MEMBERS

Given:

```text
Campaign
Jane Doe
Alex Smith
David
```

each member should have a recipient-specific message.

Editing Jane's message must not modify Alex's or the original template.

---

## FLOW 4 — SEND CAMPAIGN

```text
READY
→ Send
→ SENDING
→ ACTIVE
```

Expected:

Campaign member states update independently.

---

## FLOW 5 — ONE MEMBER REPLIES

```text
Campaign
→ Jane replies
```

Expected:

```text
Jane = REPLIED
Alex = SENT
David = SENT
```

Campaign remains active.

Jane's conversation can be continued independently.

---

## FLOW 6 — FOLLOW-UP

```text
Alex
→ Follow-up due
→ Review
→ Send
```

Expected:

Only Alex's conversation changes.

The campaign should not suddenly become “follow-up due” for everyone.

---

## FLOW 7 — OUTCOME

```text
Jane
→ Continue conversation
→ Record outcome
→ Interested
```

Expected:

Jane's:

* conversation
* outcome
* relationship

update independently.

The campaign remains a multi-member campaign.

---

## FLOW 8 — COMPANY CONTEXT

Open:

```text
Paystack
```

Expected:

The company workspace shows the relevant campaign/member context.

CTA:

```text
View campaign
```

takes the user to the first-class campaign domain.

---

## FLOW 9 — TEMPLATE REUSE

Use one template in two campaigns.

Expected:

The template remains one reusable asset.

Each campaign/member can have independent personalized messages.

---

## FLOW 10 — MULTI-COMPANY CAMPAIGN

Create:

```text
Campaign A

Paystack — Jane
Flutterwave — Alex
Stripe — Sarah
```

Expected:

Campaign detail correctly shows all three.

Company pages correctly show only their own member/context.

No cross-company leakage.

---

# DEFINITION OF DONE

This pass is complete when:

## Campaigns

* Campaigns have a first-class route
* Campaign list exists
* Campaign detail exists
* Campaigns support multiple members
* Members have independent states
* Campaign is not tied to one company
* Campaign is not tied to one contact
* Campaign is not tied to one conversation
* Multiple contacts can be added
* Members can reuse a campaign template
* Member-specific messages can be edited independently
* Campaign sending is simulated coherently
* Company Workspace links into the canonical campaign domain

## Templates

* Templates have a first-class route
* Templates can be created
* Templates can be edited
* Templates can be duplicated
* Templates have reusable subject/body
* Small personalization variable system exists
* Templates can be previewed
* Campaigns can select templates
* Personalized member messages do not mutate the original template
* Existing deterministic follow-up behavior remains functional

## Navigation

* Dashboard
* Companies
* Contacts
* Campaigns
* Templates

are discoverable.

Contextual navigation works between:

```text
Company ↔ Campaign
Campaign ↔ Contact
Campaign Member ↔ Conversation
Template ↔ Campaign
```

## Existing behavior

* REPLIED requires explicit continuation
* STOPPED remains terminal
* reply cancels pending follow-up
* maximum two follow-ups
* outcome remains separate from conversation state
* relationship status remains derived consistently
* outcome notes remain persisted
* dashboard action queue still works
* company/contact isolation remains intact

## Product quality

The result should now feel like:

> **A company-first career relationship platform with reusable outreach infrastructure.**

Not:

> an email sender hidden inside the Company page.

The user should be able to start from a company and naturally enter a campaign, but they should also be able to start from Campaigns or Templates and work across multiple companies and contacts.

That distinction is essential to the next stage of Outreacher.

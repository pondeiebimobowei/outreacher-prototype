# NEXT IMPLEMENTATION PASS — FIRST-CLASS CONTACTS, OPPORTUNITIES, CONVERSATIONS + CROSS-DOMAIN COMPLETION

Continue from the current Outreacher implementation.

This is a **Figma Make prototype**, not a production backend implementation.

The goal of this pass is to correct an important architectural/experience gap:

Several capabilities already exist visually or functionally inside Company Workspace, but they are **not yet first-class product domains**.

Currently:

* Companies is a first-class domain.
* Campaigns is now a first-class domain.
* Templates is now a first-class domain.
* Contacts exist inside Company Workspace but are not yet a canonical `/contacts` domain.
* Opportunities exist inside Company Workspace but are not yet a canonical `/opportunities` domain.
* Conversations/replies exist inside Company Workspace but are not yet a canonical `/conversations` or `/inbox` domain.
* Research/evidence also exists contextually and should continue to remain connected to the company/opportunity/contact model rather than becoming an isolated generic research product.

Do NOT treat an embedded tab or section as equivalent to a first-class domain.

The intended product model is:

**Company → Evidence → Opportunity → Contact → Outreach → Campaign → Conversation → Relationship**

The user should be able to enter the system from different points while preserving this relationship graph.

---

# PRODUCT EXPERIENCE PRINCIPLE

Outreacher is not a generic CRM, sales engagement platform, job board, or email tool.

The product promise remains:

> Turn “I want to work at this company” into “I have a credible, evidence-backed reason to contact this person.”

The core loop remains:

**Company → Evidence → Opportunity → Person → Reason → Conversation**

The new domains must strengthen that loop rather than fragment it.

Use:

**Linear's product discipline + Attio's relationship model + Apollo's contact mechanics + Outreacher's career-opportunity reasoning.**

Do not make the UI feel like a sales CRM.

Avoid:

* sales pipeline language
* revenue terminology
* generic lead scoring
* enterprise CRM complexity
* unnecessary analytics
* vanity metrics
* giant tables with meaningless columns
* over-automating relationship decisions

The user should remain the decision maker.

---

# VISUAL DIRECTION

The two supplied visual references should inform the visual quality and information architecture.

Reference characteristics worth carrying forward:

* persistent navigation
* strong product shell
* clear hierarchy
* compact but readable information density
* modular cards
* contextual side panels
* filters
* structured tables/lists where appropriate
* strong page-level headings
* meaningful dashboard summaries
* restrained use of visual emphasis
* clear primary actions
* workspace-style composition

Do NOT copy their sales/procurement semantics.

For Outreacher:

* monochrome/neutral visual foundation
* restrained accent color
* clean typography
* generous whitespace around major sections
* compact controls
* subtle borders
* clear selected/active states
* strong hierarchy rather than decorative UI
* relationship context should always be visible when relevant

The existing Outreacher design system remains authoritative.

Do not redesign the entire visual language unnecessarily.

---

# RESPONSIVE REQUIREMENT

Every new domain must work across:

* desktop
* tablet
* mobile

Desktop:

* persistent sidebar
* main content pane
* fixed top/header controls where appropriate
* content area scrolls independently

Tablet:

* collapsible or overlay navigation
* preserve usable information density
* tables may transform into cards/list rows

Mobile:

* do NOT force desktop CRM layouts into a narrow viewport
* use compact header/navigation
* stack cards
* convert dense tables into readable list/card structures
* preserve primary actions
* maintain 44px minimum interactive targets
* ensure filters and actions remain usable

Keyboard navigation and focus states must remain functional.

---

# IMPORTANT PROTOTYPE RULE

This is a prototype.

Prioritize:

* UI
* UX
* information architecture
* believable interactions
* persisted prototype state
* lifecycle states
* transitions
* empty/loading/error/success states

Do NOT introduce:

* real backend integration
* real email sending
* real AI calls
* external contact enrichment
* real LinkedIn integration
* production authentication
* production database work

localStorage/workspaceStore-style persistence is acceptable.

---

# MAJOR TASK 1 — MAKE CONTACTS A FIRST-CLASS DOMAIN

## Goal

Create a canonical Contacts experience rather than keeping contacts trapped inside Company Workspace.

Add:

`/contacts`

and, where appropriate:

`/contacts/:id`

Contacts should become a reusable relationship object that can participate in:

* companies
* opportunities
* outreach
* campaigns
* conversations
* outcomes
* relationship status

Do NOT duplicate contact data independently inside every feature.

The conceptual relationship should be:

**Contact → Company**
**Contact → Opportunity(s)**
**Contact → Outreach**
**Contact → Campaign Member(s)**
**Contact → Conversation**

---

## Contacts list

Create a proper Contacts page.

Header:

**Contacts**

Supporting text should communicate that these are people the user has researched, contacted, or wants to build relationships with.

Primary action:

**Add contact**

Secondary capabilities:

* search
* filter
* sort

Useful filters:

* Company
* Contact type
* Relationship status
* Opportunity
* Outreach status
* Campaign
* Has replied
* Needs attention

Contact types should support the existing product model, such as:

* Hiring Manager
* Recruiter
* Engineer / Team Member
* Founder / Executive
* Referral / Connection
* Other

Do not introduce unnecessary contact taxonomy.

---

## Contact list information hierarchy

Each contact row/card should make the following immediately understandable:

* person name
* role/title
* company
* contact type
* relationship status
* opportunity relationship
* last interaction
* current next action

Example:

**Alex Johnson**
Engineering Manager · Kuda

`OPPORTUNITY`

Last interaction:
“Replied 2 days ago”

Next:
“Continue conversation”

Use contextual actions rather than a giant action menu.

---

## Contact detail

Create:

`/contacts/:id`

This should become the canonical place for understanding a person.

Suggested structure:

### Header

* name
* role
* company
* contact type
* relationship status
* primary action

Primary action should depend on state.

Examples:

* View opportunity
* Draft outreach
* View campaign
* Continue conversation
* Reconnect
* View company

---

## Contact context

Show:

### About this person

Role/title and concise context already known from the prototype.

### Why this person

Explain why this contact is relevant to the user's career objective.

Examples:

* “Hiring manager for the team you're targeting.”
* “Works on the product area connected to your research.”
* “Potential referral path.”

Do not fabricate evidence.

If the prototype does not have enough evidence, show an explicit insufficient-context state.

---

## Contact relationship timeline

Create a chronological timeline containing events such as:

* Contact discovered
* Evidence reviewed
* Outreach drafted
* Outreach sent
* Follow-up sent
* Contact replied
* Conversation continued
* Outcome recorded
* Relationship moved to nurture
* Relationship closed

This should use persisted workspace state.

Do not create fake activity merely to make the timeline look populated.

---

## Contact → Company

Provide a clear link to the canonical company workspace.

Example:

**Kuda**

Engineering

`View company →`

---

## Contact → Opportunity

If connected to an opportunity:

Show:

**Related opportunity**

Opportunity title/state/evidence summary.

CTA:

`View opportunity →`

If none exists:

Show an appropriate empty state instead of inventing one.

---

## Contact → Campaigns

Show campaign membership.

Example:

**Campaigns**

* Fintech Engineering Outreach

  * Member status: SENT

CTA:

`View campaign →`

A contact may belong to multiple campaigns over time.

Do not assume:

**one contact = one campaign**

---

## Contact → Conversation

If a conversation exists:

Show:

* last message
* reply state
* relationship status
* next action

CTA:

`Open conversation →`

---

## Contact states

The contact experience must distinguish:

* discovered
* selected
* contacted
* replied
* active relationship
* nurture
* closed

Do not collapse these into one generic status.

---

## Empty state

A new user with no contacts should see:

**No contacts yet**

Explain:

> Contacts appear here when you discover people while researching companies or add them directly.

Primary action:

`Explore companies`

Secondary:

`Add contact`

Do not populate fake contacts automatically unless the user explicitly enters demo/sample mode.

---

## Contact creation

Prototype creation flow should support:

* name
* title
* company
* contact type
* email if known
* LinkedIn/profile URL if known
* optional notes

After creation:

persist the contact and make it immediately available throughout:

* company
* opportunity
* campaign
* outreach
* conversation

---

# MAJOR TASK 2 — MAKE OPPORTUNITIES A FIRST-CLASS DOMAIN

## Goal

Create:

`/opportunities`

and:

`/opportunities/:id`

Opportunity is a core Outreacher concept and must not remain a secondary section inside Company Workspace.

The product should make the distinction between:

### CONFIRMED

Actual evidence of a relevant opening exists.

### PROACTIVE

No opening is confirmed, but company-fit/evidence provides a credible reason to build a relationship.

### UNCLASSIFIED

There is not enough evidence yet.

Do not blur these states.

---

# Opportunities list

Header:

**Opportunities**

Supporting copy should explain that opportunities represent concrete reasons to pursue a company.

Primary action:

`Add opportunity`

Useful filters:

* Confirmed
* Proactive
* Unclassified
* Company
* Role
* Evidence
* Contact
* Last updated

The main list should prioritize meaningful context rather than metrics.

Example:

### Senior Backend Engineer

**Kuda**

`CONFIRMED`

Evidence:
“Backend opening posted recently”

Contact:
Alex Johnson · Engineering Manager

Next:
“Review contact”

---

## Opportunity detail

Create:

`/opportunities/:id`

Header should clearly show:

* opportunity title
* company
* state
* confidence/evidence state
* created/updated context
* primary next action

Do not introduce an artificial numerical opportunity score unless the existing product already has one.

---

## Evidence section

Opportunity must preserve the evidence-first philosophy.

Show:

### Why this is an opportunity

Relevant evidence cards.

Examples:

* Opening
* Product/team expansion
* Relevant team
* Technology alignment
* Company initiative
* Recent signal

Every evidence item should distinguish:

* source/context
* what it means
* when it was observed, where available

Do not fabricate external sources.

---

## Opportunity state transitions

Allow the prototype to demonstrate:

`UNCLASSIFIED → PROACTIVE`

or

`UNCLASSIFIED → CONFIRMED`

The user should understand why the state changed.

Example confirmation flow:

**Confirm opportunity**

> What evidence supports this opportunity?

Then show available evidence.

For prototype purposes, this can be simulated using existing evidence data.

---

## Opportunity contacts

This is important.

An opportunity can have:

* multiple relevant contacts
* different contact types
* different outreach states

Do NOT assume:

**one opportunity = one contact**

Example:

Opportunity:
**Backend Engineering Team**

Contacts:

* Alex Johnson · Engineering Manager
* Sarah Okafor · Recruiter
* Daniel Smith · Senior Backend Engineer

Each contact can have a different relationship state.

---

## Opportunity → Campaign

Show associated campaigns where relevant.

Example:

**Outreach**

Fintech Engineering Campaign

`3 contacts`

`View campaign →`

---

## Opportunity → Conversations

Show relevant conversations associated with its contacts.

Do not duplicate conversations.

Link to canonical conversation routes.

---

## Opportunity → Company

Always provide a strong link back to the company workspace.

The company remains the primary contextual source.

---

## Opportunity lifecycle

The page should make it possible to understand:

**Research → Evidence → Opportunity state → Contacts → Outreach → Conversation**

This should visually reinforce the product's core model.

---

## Empty state

For users with no opportunities:

**No opportunities yet**

Explain:

> Opportunities appear when your company research gives you a credible reason to pursue a relationship.

Primary:

`Research a company`

Secondary:

`View companies`

---

# MINOR TASK 1 — MAKE CONVERSATIONS / REPLIES A FIRST-CLASS DOMAIN

The conversation experience currently exists inside Company Workspace.

Promote it into a canonical top-level domain.

Preferred route:

`/conversations`

with:

`/conversations/:id`

If the current architecture strongly favors an Inbox naming convention, use `/inbox`, but the information architecture must clearly represent **conversations**, not generic email inbox functionality.

This is a relationship workspace, not Gmail.

---

## Conversation list

Header:

**Conversations**

Useful filters:

* All
* Needs reply
* Replied
* Active
* Follow-up due
* Nurture
* Stopped
* Closed

Each row should show:

* contact
* company
* opportunity if relevant
* latest message preview
* current relationship state
* next action
* last interaction

---

## Conversation detail

Create a focused conversation view.

Header:

**Alex Johnson**
Engineering Manager · Kuda

Relationship badge:

`OPPORTUNITY`

Context links:

* Company
* Opportunity
* Campaign
* Contact

Then the message timeline.

Message types remain:

* Outreach
* Follow-up
* Contact reply
* User reply

Maintain the existing structured message timeline as the source of truth.

---

## Reply handling

Preserve the existing rules:

* `REPLIED` does NOT automatically become `ACTIVE`
* user must explicitly choose **Continue conversation**
* `STOPPED` is terminal
* stopped conversations must not show a Reopen action
* reply cancels pending follow-up
* maximum 2 follow-ups
* follow-up timing remains four business days
* outcome is independent from reply state

Do not regress these rules.

---

## Conversation actions

Depending on state:

* Continue conversation
* Reply
* Record outcome
* Schedule/prepare follow-up
* View contact
* View opportunity
* View campaign
* View company

Avoid showing impossible actions.

---

# MINOR TASK 2 — CROSS-DOMAIN NAVIGATION + STATE CONSISTENCY

Now that Campaigns, Templates, Companies, Contacts, Opportunities, and Conversations are first-class domains, make the product feel like one connected system.

Global navigation should include:

* Dashboard
* Companies
* Opportunities
* Contacts
* Campaigns
* Templates
* Conversations

Do not overload the navigation with every sub-feature.

Research, Evidence, Outreach, and Journey remain contextual capabilities attached to the appropriate domains.

---

# CANONICAL RELATIONSHIP GRAPH

Ensure every major object can navigate naturally through the graph:

**Company**
↓
**Opportunity**
↓
**Contact**
↓
**Outreach**
↓
**Campaign**
↓
**Conversation**
↓
**Relationship / Outcome**

But the user should also be able to enter from any node.

Examples:

Dashboard → Contact → Company

Dashboard → Conversation → Opportunity

Campaign → Member → Contact → Company

Template → Campaign

Opportunity → Contact → Conversation

Company → Opportunity → Contact

Do not create dead-end screens.

---

# BREADCRUMBS / CONTEXT

Use contextual breadcrumbs or compact relationship links where helpful.

Example:

`Companies / Kuda / Backend Engineering / Alex Johnson`

But do not make breadcrumbs visually dominant.

They should help users understand where they are.

---

# CAMPAIGN CARRY-OVER

Campaigns are already a first-class domain.

Preserve the existing correction:

**Campaign ≠ Contact**

A campaign can:

* contain multiple contacts
* span multiple companies
* contain multiple campaign members
* use reusable templates
* have member-level lifecycle state
* connect each member to an independent conversation

Maintain separation between:

### Campaign-level state

`DRAFT | READY | SENDING | ACTIVE | PAUSED | COMPLETED`

and:

### Member-level state

`PENDING | READY | SENT | REPLIED | FOLLOW_UP_DUE | STOPPED | COMPLETED`

Do not regress this architecture.

---

# TEMPLATE CARRY-OVER

Templates remain a first-class domain.

Preserve:

`/templates`

with reusable templates.

Variables remain:

* `{{firstName}}`
* `{{company}}`
* `{{role}}`

A template is a reusable starting point.

Applying a template to a campaign member creates a recipient-specific message.

Editing the personalized message must NOT mutate the source template.

Do not collapse templates into campaigns.

---

# OUTCOME + RELATIONSHIP CARRY-OVER

Preserve the previous outcome/relationship implementation.

Outcome notes remain supported.

Relationship status remains derived:

* OPEN
* NURTURE
* OPPORTUNITY
* CLOSED

Do not turn relationship status into a second manually maintained state if it can remain deterministically derived from the existing state/outcome model.

Preserve:

* outcome note
* completed journey
* relationship status
* stay-connected/re-engagement
* dashboard nurture section
* meaningful activity
* action queue

---

# DASHBOARD CARRY-OVER

Dashboard remains action-oriented.

Keep:

**Needs your attention**

rather than reverting to generic “Your queue”.

Queue items should continue to provide:

* company
* person
* reason
* action

Example:

> Alex replied to your outreach.

`Continue conversation →`

Other examples:

> Your follow-up is due.

`Review follow-up →`

> This relationship is ready for reconnection.

`View conversation →`

Keep:

**Keep in touch**

for nurture relationships.

Recent activity should continue deriving from persisted workspace state rather than hardcoded generic activity.

---

# COMPANY WORKSPACE CARRY-OVER

Company Workspace remains important, but it should become the **contextual hub**, not the place where every domain permanently lives.

Keep contextual sections for:

* research
* evidence
* opportunities
* contacts
* outreach
* campaign summary
* conversation summary
* relationship state

But where a section represents a first-class domain, provide a strong path to the canonical domain.

Examples:

**Contacts**
`View all contacts →`

**Opportunities**
`View all opportunities →`

**Campaign**
`View campaign →`

**Conversation**
`Open conversation →`

Do not duplicate entire domain experiences unnecessarily inside Company Workspace.

---

# DATA / STATE REQUIREMENTS

Continue using the existing workspace store architecture.

The prototype should remain state-driven:

**USER ACTION → PERSISTED WORKSPACE UPDATE → ROUTE/TAB CHANGE → UI RECONSTRUCTS FROM PERSISTED STATE**

Do not hardcode independent state into individual screens.

If a user:

1. creates a contact
2. connects it to a company
3. associates it with an opportunity
4. adds it to a campaign
5. sends outreach
6. receives a reply
7. records an outcome

then the corresponding:

* Contact
* Opportunity
* Campaign
* Conversation
* Company
* Dashboard

views should all reflect that state.

---

# DEMO DATA

Do not silently mix demo data with user data.

Existing demo/sample workspace behavior should remain explicit.

If the current implementation uses seeded demo data for mature states, preserve that mechanism.

Do not create duplicate demo contacts/opportunities every time a route loads.

---

# REQUIRED CROSS-DOMAIN SANITY FLOWS

After implementation, mentally test these flows.

## Flow 1 — Contact-first

Contacts → Open contact → Company → Opportunity → Campaign → Conversation

Everything should remain connected.

## Flow 2 — Opportunity-first

Opportunities → Open opportunity → Select contact → Create outreach → Add to campaign → Conversation

## Flow 3 — Reply

Conversation → Contact reply → `REPLIED`

Do NOT automatically become ACTIVE.

User chooses:

`Continue conversation`

Then:

`ACTIVE`

## Flow 4 — Stop

Conversation → Stop relationship

Result:

`STOPPED`

No reopen action.

## Flow 5 — Outcome

Conversation → Record outcome → Add note

Result:

* outcome persists
* relationship status updates
* company reflects it
* contact reflects it
* dashboard reflects it
* conversation reflects it

## Flow 6 — Campaign member isolation

Campaign contains:

* Contact A
* Contact B
* Contact C

Contact A replies.

Only Contact A's member/conversation state changes.

B and C remain unchanged.

## Flow 7 — Template reuse

Template A is applied to:

* Contact A
* Contact B

Edit Contact A's personalized message.

Contact B must remain based on the template without inheriting A's edits.

The original template must remain unchanged.

## Flow 8 — Multi-company campaign

Campaign:

**Backend Engineering Outreach**

Members:

* Contact A · Company A
* Contact B · Company B
* Contact C · Company C

The campaign must remain valid.

Do not accidentally scope campaigns to one company.

---

# ACCESSIBILITY

Maintain WCAG 2.2 AA expectations.

Every new page needs:

* keyboard navigation
* visible focus
* semantic headings
* accessible buttons
* accessible inputs
* adequate contrast
* non-color-only state indicators
* sensible empty states
* loading states where transitions exist
* error states where actions can fail
* disabled states where appropriate

Dialogs and drawers must trap focus appropriately.

---

# DO NOT OVERBUILD

Do not introduce:

* real API integration
* real email sending
* AI generation calls
* LinkedIn scraping
* external enrichment
* complicated analytics
* production-grade permissions
* backend infrastructure
* unnecessary CRM functionality

The objective is to make the **product experience and information architecture complete enough to validate**.

---

# FINAL QUALITY BAR

When this pass is complete, Outreacher should no longer feel like:

> “A Company Workspace with lots of tabs.”

It should feel like:

> **A connected career relationship platform with Companies, Opportunities, Contacts, Campaigns, Templates, and Conversations as first-class domains.**

The user should be able to move naturally through:

**Company → Opportunity → Contact → Campaign → Conversation → Relationship**

while still being able to enter from:

**Dashboard**
**Contacts**
**Opportunities**
**Campaigns**
**Conversations**

Every domain should understand its relationship to the others.

Do not stop after creating routes.

The screens must be connected, state-aware, responsive, and believable as one coherent product.

Before considering the task complete, inspect for hidden assumptions such as:

* campaign = one contact
* campaign = one company
* opportunity = one contact
* contact = one campaign
* conversation = one company
* reply = active conversation automatically
* outcome = conversation state
* relationship status manually maintained
* embedded section = first-class domain

Correct any such assumptions discovered during implementation.

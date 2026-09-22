# Outreacher — Contact Model, Manual Contacts, Integrations, Sender Accounts & Campaign Sending Architecture

## Context

Global Search + Command Palette is currently being implemented.

Do not interrupt or modify that work unless there is a direct dependency.

Once the current Search implementation is complete, this is the next major product/experience phase.

This phase addresses several product-model gaps discovered while reviewing the current Contacts, Profile, Campaigns, Settings, and email-sending experience.

The goal is to make these domains behave like one coherent product.

This remains a **Figma Make prototype**.

All research, contact discovery, AI generation, email generation, templates, sending, and provider integrations should remain **simulated**.

Do not build real external email sending.

Do not introduce production infrastructure.

The prototype should, however, model the architecture and UX correctly so that the eventual production implementation has a clean conceptual foundation.

---

# 1. Core product-model correction

The most important correction in this phase is the distinction between:

**Person**

and

**Person's relationship/association with a company**

A contact should NOT fundamentally belong to exactly one company.

A person can:

* work at Company A
* work at Company B
* advise Company C
* have multiple professional associations
* potentially have different titles/context at different companies

Therefore the product model should conceptually become:

```text
Person
  ↓
Company Relationships
  ↓
Company-specific context
```

Not:

```text
Company
  ↓
Contact
```

---

# 2. Global Contact identity

Create/adjust the contact domain so that a contact represents a unique person.

Conceptually:

```text
Contact / Person
├── id
├── first name
├── last name
├── email(s)
├── phone where applicable
├── LinkedIn/profile URL where applicable
├── notes
└── company relationships[]
```

Do not duplicate the person merely because they are associated with another company.

For example:

```text
Jane Doe
```

should be one person.

She may have:

```text
Jane Doe
  ├── Flutterwave
  │     └── VP Engineering
  │
  └── Another Company
        └── Advisor
```

These should be relationships, not two unrelated people.

---

# 3. Company relationship model

Create a conceptual company-association layer.

Call it something appropriate such as:

* `ContactCompany`
* `CompanyContact`
* `ContactAssociation`

Use the naming convention that best fits the existing codebase.

Each association should be able to hold company-specific information.

Conceptually:

```text
ContactCompany
├── contactId
├── companyId
├── title
├── department/team where available
├── relationship/context
├── whyThisPerson
├── evidence
├── source
├── confidence where already supported
└── timestamps
```

Do not copy these fields onto the global person record if they are inherently company-specific.

---

# 4. "Why this person" is company-specific

This is a critical UX correction.

When viewing a person globally, show global identity information.

When viewing:

**Jane Doe → Flutterwave**

show:

* why Jane is relevant to Flutterwave
* evidence for the relationship
* role/title at Flutterwave
* relevant company context
* why this person is worth contacting for this specific company
* relationship history with this company

If the same person is associated with another company:

**Jane Doe → Company B**

the contextual information can be completely different.

Do not show Company A's "Why this person" reasoning on the Company B relationship.

---

# 5. Contact detail architecture

Rework the Contact Detail experience around the distinction between:

### Person

Global information:

* name
* primary email
* other contact information
* profile links
* general notes

### Company relationships

Show the companies associated with this person.

Example:

```text
Jane Doe

Senior Engineering Leader

Contact information
...

Companies

Flutterwave
VP Engineering
Why this person...
Evidence...

Company B
Advisor
Why this person...
Evidence...
```

Clicking a company association should take the user into the appropriate company-specific context.

---

# 6. Company → Contact experience

When viewing a company's contacts, the UI should show the person's company-specific relationship.

For example:

```text
Jane Doe
VP Engineering
Flutterwave

Why this person
...

Evidence
...
```

This should NOT mean that Jane is a different contact object from the Jane Doe shown elsewhere.

It is the same person viewed through a company relationship.

---

# 7. Adding a contact manually

The Contacts domain must support manual contact creation.

Add an obvious:

**Add contact**

action.

This should be available from the main Contacts domain.

The interaction should feel native to the existing product.

---

# 8. Manual contact creation

The user should be able to enter information such as:

### Person information

* first name
* last name
* email
* phone where applicable
* LinkedIn/profile URL where applicable
* notes

### Company association

The user should be able to select an existing company.

If the selected person already exists in the system, do NOT blindly create a duplicate person.

Instead, recognize that this is potentially:

**existing person + new company relationship**

where appropriate.

---

# 9. Adding a contact from a company

The Company Workspace / company Contacts area should also support:

**Add contact**

The flow should allow:

### Option A

Create a new person and associate them with the company.

### Option B

Find an existing person and associate that person with the company.

This is important because the same person can already exist globally.

The UI should make the distinction understandable.

---

# 10. Adding a contact from Profile

The user's Profile / Career Profile area should also expose the user's contacts where appropriate.

The user should be able to manually add a contact from the Profile Contacts tab.

The experience should not create a separate independent contact database.

It should use the same global Contacts domain/source of truth.

Therefore:

```text
Profile → Contacts
       ↓
Global Contacts
```

not:

```text
Profile Contacts
       +
Global Contacts
```

as two disconnected systems.

---

# 11. Contact discovery remains simulated

The existing automatic contact discovery/research flow should remain.

There are now two legitimate ways to populate contacts:

### Manual

User explicitly creates/associates a person.

### Automatic

The simulated research/discovery flow finds a person.

Both should ultimately produce the same contact model.

Do not create separate "manual contact" and "AI contact" entity types.

Instead, record source/context where useful:

```text
source:
  MANUAL
  DISCOVERED
```

or whatever naming best matches the current project.

---

# 12. Editing contacts

Contacts must be editable.

Add:

**Edit contact**

to the appropriate contact detail experience.

Allow editing of global person information.

Examples:

* name
* email
* phone
* LinkedIn
* notes

When editing company-specific information, make it clear that the change applies to the selected company relationship.

For example:

Editing:

**VP Engineering at Flutterwave**

must not accidentally change:

**Advisor at Company B**

---

# 13. Duplicate handling

When manually adding a person, the prototype should simulate basic duplicate awareness.

If an email or another strong identifier already exists:

show something like:

**This person may already exist**

Then allow:

* use existing person
* associate existing person with this company
* cancel

Do not silently create duplicate people.

This is especially important once multi-company relationships exist.

---

# 14. Contact lifecycle

Preserve the existing contact lifecycle concepts.

Do not replace lifecycle state merely because the data model is being improved.

The lifecycle should continue to represent the person's state in Outreacher.

However, be careful about whether lifecycle is:

### global

or

### company relationship-specific.

Where the meaning depends on a specific company/opportunity, keep it contextual.

Do not blindly move every existing field into the global person entity.

---

# 15. Integrations domain

Introduce a first-class:

**Integrations**

domain.

This represents technical connections to mailing providers.

The user should be able to:

* view integrations
* add an integration
* configure an integration
* see connection status
* edit where appropriate
* remove/disconnect where appropriate

All simulated.

---

# 16. Provider architecture

The architecture must be provider-agnostic.

The first/default recommended provider should be:

**Resend**

But do not make the rest of the product depend directly on Resend.

Conceptually:

```text
Integration
├── provider
├── name
├── status
└── configuration
```

Potential providers:

* Resend
* SMTP
* future providers

The UI can present:

**Resend**
Recommended

and:

**SMTP**
Custom mail server

as initial supported options.

Do not implement real provider APIs.

---

# 17. Resend terminology

Use the correct provider name:

**Resend**

not "Recend" or "Send".

The product concept is:

**Resend integration**

The user connects/configures the Resend provider, then creates sender accounts using that integration.

---

# 18. Integration setup UX

The Add Integration flow should allow the user to choose:

### Resend

Then simulate entering the required connection information.

For the prototype:

* API key/input may be represented
* connection status can be simulated
* validation can be simulated
* success/failure states should be believable

Do not send the API key anywhere.

Do not implement real secret storage.

Do not pretend a real provider connection occurred.

Use clearly simulated state internally.

---

# 19. SMTP integration

Add SMTP as another provider option.

The simulated setup should conceptually accept:

* host
* port
* username
* password
* security/encryption option

Again:

**simulation only**

Do not build a real SMTP client.

---

# 20. Integration states

Represent believable states:

* Not connected
* Connecting
* Connected
* Connection failed
* Disconnected

Where appropriate.

Do not use artificial loading delays just to create animations.

---

# 21. Sender Accounts domain

Introduce a first-class:

**Sender Accounts**

domain.

This is separate from Integrations.

This distinction is critical.

### Integration

How Outreacher connects to a mail provider.

### Sender Account

Which sender identity Outreacher uses to send mail.

Conceptually:

```text
Integration
    ↓
Sender Account
```

---

# 22. Sender Account creation

The user should be able to create multiple sender accounts.

Example:

```text
Personal Resend
  ↓
Pondei
pondei@example.com

Work Resend
  ↓
Pondei Ebimobowei
pondei@company.com
```

Each sender account selects an existing integration.

---

# 23. Sender Account fields

A sender account should support at least:

* display/sender name
* sender email
* reply-to email
* integration
* status

Potentially:

* description/label
* default flag

Keep the initial UI focused.

---

# 24. Sender account validation

Simulate sensible validation.

Examples:

* sender name required
* sender email required
* valid email format
* selected integration required
* reply-to email, when supplied, must be valid

If the selected integration is disconnected, explain the consequence.

---

# 25. Multiple sender accounts

The product must support multiple sender accounts.

Example:

```text
Sender Accounts

Pondei Personal
pondei@example.com
Resend
Connected

Pondei Work
pondei@company.com
Resend
Connected

Recruiting Outreach
outreach@example.com
SMTP
Connected
```

Do not assume one sender account per user.

---

# 26. Campaign → Sender Account

Campaigns must have an explicit sender account.

When creating a campaign, include:

**Sender account**

as a required/important campaign setting.

Example:

```text
Campaign
Engineering Outreach

Sender account
Pondei Personal
pondei@example.com
```

The campaign should store the selected sender account.

---

# 27. Sending architecture

Every simulated outbound email should resolve through:

```text
Campaign
  ↓
Sender Account
  ↓
Integration
  ↓
Simulated Provider Send
```

Not:

```text
Campaign
  ↓
Resend directly
```

The campaign should never need to know provider-specific implementation details.

---

# 28. Apply sender account consistently

Any surface that causes an outbound email must respect sender account architecture.

This includes:

* campaign send
* individual outreach send where applicable
* follow-up send
* future direct-send actions

If an action sends an email, it must use a sender account.

Do not create a second sender mechanism.

---

# 29. Campaign creation UX

Update campaign creation to include sender configuration.

The user should be able to:

1. choose campaign
2. choose contacts/members
3. choose sender account
4. review campaign
5. send

If no sender account exists:

show a useful empty state such as:

**No sender accounts yet**

with:

**Create sender account**

and explain that a connected integration is required.

---

# 30. Campaign send review

The pre-send review should make the sender identity visible.

Example:

```text
From
Pondei Ebimobowei <pondei@example.com>

Reply-to
pondei@example.com

Via
Resend
```

Do not expose unnecessary technical details.

The important user question is:

> “Who will this email come from?”

---

# 31. Simulated sending

Keep email sending completely simulated.

When sending:

```text
READY
  ↓
SENDING
  ↓
SENT
```

or the project's existing equivalent.

The UI can indicate:

**Sent via Pondei Personal**

but should not claim an actual email was delivered.

---

# 32. Follow-up architecture

Existing follow-up behavior must continue to work.

Follow-ups should inherit the campaign's sender account unless the product explicitly supports changing it.

For this prototype:

**Use the campaign sender account by default.**

Do not create a second sender-selection experience for every follow-up.

---

# 33. Conversation consistency

When an outbound email is simulated as sent:

the resulting conversation timeline should show the sender identity appropriately.

For example:

```text
You
Pondei Ebimobowei <pondei@example.com>

Message...
```

Do not display inconsistent sender identities between campaign and conversation.

---

# 34. Templates remain simulated

Do not change the existing template-generation architecture unnecessarily.

Templates remain:

* simulated
* editable
* selectable
* usable by campaigns

But campaign sending should now resolve the sender account independently from the template.

Conceptually:

```text
Template
  +
Contact
  +
Campaign
  +
Sender Account
  ↓
Outbound Message
```

---

# 35. Research remains simulated

All company research and contact discovery remains simulated.

Do not introduce external APIs.

Do not scrape the web.

Do not add production research infrastructure.

The UX should nevertheless represent:

* research
* discovery
* evidence
* generated results
* user review

as believable product behavior.

---

# 36. Generated contacts and manually added contacts

Both should flow into the same system.

Example:

```text
Research
  ↓
Discover Jane Doe
  ↓
User accepts
  ↓
Global Person
  ↓
Company relationship
```

Manual:

```text
Add Contact
  ↓
Jane Doe
  ↓
Select Company
  ↓
Global Person
  ↓
Company relationship
```

The resulting person should behave identically throughout the product.

---

# 37. Contact detail "Why this person"

Rework the current contact detail experience.

Instead of treating:

**Why this person**

as an intrinsic property of the person, make it contextual.

Use a company selector/context header where necessary.

Example:

```text
Jane Doe

Flutterwave
VP Engineering

Why this person
...

Evidence
...

Relationship
...
```

If Jane has two company relationships:

```text
Jane Doe

Company
[ Flutterwave ▼ ]
```

Switching the company changes the company-specific information.

---

# 38. Contact timeline

Separate global person events from company-specific events where useful.

Global:

* contact created
* email updated

Company-specific:

* discovered for Flutterwave
* selected for Flutterwave outreach
* contacted regarding Flutterwave
* replied regarding Flutterwave

Do not merge unrelated company histories into one misleading timeline.

---

# 39. Contacts list

The global Contacts page should represent people.

Useful columns/metadata:

* person
* primary email
* companies
* role/context
* lifecycle
* last interaction

A person with multiple companies should still appear once in the global Contacts list.

Example:

```text
Jane Doe
2 companies
VP Engineering · Flutterwave
Advisor · Company B
```

---

# 40. Company Contacts list

The Company Workspace's contacts view should show only the relevant association.

For Flutterwave:

```text
Jane Doe
VP Engineering
Why this person...
```

Company B should show Jane's Company B context separately.

---

# 41. Profile Contacts tab

The Profile Contacts tab should use the same global person records.

Support:

* view
* add
* edit
* associate with company
* navigate to contact detail

Do not create profile-only contact records.

---

# 42. Settings integration

The Settings area should expose the configuration hierarchy cleanly.

Suggested structure:

```text
Settings

Profile
Career Profile

Email
  Integrations
  Sender Accounts

Account
Security
```

Follow the existing Settings Experience Contract if already approved.

Do not duplicate the same configuration UI in multiple places.

---

# 43. Navigation

If these become first-class domains, update navigation appropriately.

Do not overcrowd the primary sidebar.

Possible structure:

```text
Workspace
Dashboard
Companies
Opportunities
Contacts
Conversations

Outreach
Campaigns
Templates

Configuration
Integrations
Sender Accounts
Settings
```

However, use the existing shell/navigation conventions and information architecture rather than blindly adding every item to the primary sidebar.

If Integrations/Sender Accounts fit better under Settings, use that structure.

The important requirement is discoverability and conceptual clarity.

---

# 44. Global Search compatibility

Ensure the new domains are compatible with Global Search.

At minimum, consider:

* contacts
* campaigns
* sender accounts
* integrations where useful

Do not make technical integrations dominate global search.

Contacts and campaigns are user-facing work objects.

Integrations and sender accounts are configuration objects.

---

# 45. Dashboard implications

Dashboard should eventually be able to surface relevant configuration blockers.

For example:

**Needs your attention**

> No sender account configured

CTA:

**Set up sender account**

Only show this when it is genuinely relevant to an action the user is trying to perform.

Do not turn the dashboard into a configuration checklist.

---

# 46. First-user experience

The product should handle a new user gracefully.

Example:

```text
New user
  ↓
Career profile
  ↓
Add company
  ↓
Research
  ↓
Discover/add contact
  ↓
Generate outreach
  ↓
Create campaign
  ↓
No sender account
  ↓
Create integration
  ↓
Create sender account
  ↓
Return to campaign
  ↓
Assign sender
  ↓
Send simulated outreach
```

The user should not encounter unexplained dead ends.

---

# 47. Configuration dependency states

Model the dependency clearly:

### No integration

Cannot create a functional sender account.

### Integration exists but disconnected

Explain that the sender account cannot currently send.

### Connected integration but no sender account

Campaign creation should guide the user toward creating one.

### Sender account exists

Campaign can select it.

### Sender account disconnected

Campaign should clearly communicate that sending is unavailable or requires another sender.

All of this is simulated.

---

# 48. Empty states

Create deliberate empty states for:

### Contacts

“No contacts yet”

Actions:

* Add contact
* Discover contacts

### Company contacts

“No contacts for this company”

Actions:

* Add contact
* Discover contacts

### Integrations

“No integrations connected”

Action:

* Add integration

### Sender accounts

“No sender accounts yet”

Action:

* Create sender account

Each empty state should explain why the user might care.

---

# 49. Editing integrations and sender accounts

Support appropriate edit/configuration flows.

Sender account:

* edit name
* email
* reply-to
* integration association

Integration:

* provider configuration
* label
* connection state where appropriate

Do not allow changing technical details that the prototype does not actually model.

---

# 50. Destructive actions

For:

* deleting contact
* removing company relationship
* disconnecting integration
* deleting sender account

Use appropriate confirmation.

Be particularly careful with deleting a sender account referenced by campaigns.

The prototype should explain the consequence instead of silently breaking campaigns.

---

# 51. Data integrity

Preserve these invariants:

### Person identity

One person can belong to many companies.

### Company relationship

Company-specific reasoning belongs to the relationship.

### Integration

A technical mail-provider connection.

### Sender account

A sender identity attached to one integration.

### Campaign

Uses a selected sender account.

### Outbound message

Resolves its sender through the campaign/sender account.

These distinctions should be reflected in the UI and in the prototype state model.

---

# 52. Prototype implementation constraints

Do NOT:

* build real Resend integration
* send real email
* build real SMTP
* store real provider credentials
* add external APIs
* scrape contacts
* build production OAuth
* build a production mail queue
* introduce unnecessary backend services

The product should simulate all of these.

But do model the concepts accurately enough that the UI does not need to be redesigned later.

---

# 53. Avoid over-refactoring

This phase touches several domains.

Do not rewrite the entire application.

Make the smallest coherent model changes necessary.

However, do NOT preserve an obviously incorrect contact model merely because changing it touches several screens.

The person/company distinction is foundational and should be corrected properly.

---

# 54. Responsive behavior

All affected screens and flows must work across:

### Desktop

Full workspace layout.

### Tablet

Appropriate drawers/dialogs and flexible layouts.

### Mobile

Do not force desktop tables or multi-column forms.

Use:

* stacked fields
* sheets/drawers
* cards
* compact metadata
* full-width actions

Touch targets should remain approximately 44px.

---

# 55. Accessibility

Apply WCAG 2.2 AA expectations.

Especially verify:

* add/edit dialogs
* company selectors
* integration provider selectors
* sender account selectors
* destructive confirmations
* keyboard navigation
* focus management
* form labels
* error states
* status communication

Do not rely on color alone.

---

# 56. Visual direction

Keep the existing product language:

* restrained
* professional
* productivity-oriented
* dense but readable
* minimal decoration
* strong hierarchy

Do not make Integrations or Sender Accounts look like a developer settings dashboard.

The user should understand:

> “This is where my email infrastructure and sender identities live.”

not:

> “I am configuring an API server.”

---

# 57. Implementation sequence

Implement in this order:

### Phase A — Contact model

1. Global person identity
2. Company relationships
3. Company-specific context
4. Existing contact migration/adaptation
5. Contact detail update
6. Contacts list update

### Phase B — Contact actions

7. Manual add
8. Add from company
9. Add from Profile Contacts
10. Existing-person detection
11. Company association
12. Edit contact
13. Edit company relationship

### Phase C — Integrations

14. Integrations domain
15. Resend simulated provider
16. SMTP simulated provider
17. connection states
18. integration settings

### Phase D — Sender Accounts

19. Sender Account domain
20. Create sender account
21. Edit sender account
22. Multiple sender accounts
23. Integration association
24. sender account lifecycle

### Phase E — Campaign integration

25. Campaign sender account
26. Campaign creation
27. Pre-send review
28. Simulated sending
29. Follow-up inheritance
30. Conversation sender identity

### Phase F — Cross-domain integration

31. Profile Contacts
32. Company Contacts
33. Global Contacts
34. Settings
35. Search compatibility
36. Dashboard configuration blockers where appropriate

### Phase G — QA

37. end-to-end lifecycle
38. duplicate-person scenarios
39. multi-company person scenarios
40. no-integration scenario
41. multiple-sender scenario
42. disconnected-sender scenario
43. responsive QA
44. accessibility QA
45. visual QA
46. TypeScript/tests/build

---

# 58. Critical end-to-end scenarios

Test this exact scenario:

## Scenario 1 — manual person

1. Go to Contacts.
2. Add Jane Doe.
3. Associate Jane with Company A.
4. Save.
5. Open Jane.
6. Verify Company A relationship.
7. Edit Jane.
8. Save.
9. Verify global changes.

---

## Scenario 2 — same person, second company

1. Open Company B.
2. Add existing Jane Doe.
3. Associate Jane with Company B.
4. Do not create another Jane.
5. Open global Contacts.
6. Confirm Jane appears once.
7. Confirm Jane has two companies.
8. Open Company A context.
9. Verify Company A-specific reasoning.
10. Switch Company B.
11. Verify different Company B-specific reasoning.

---

## Scenario 3 — discovered person

1. Research Company A.
2. Discover Jane.
3. Accept Jane.
4. Confirm Jane enters the same global contact model.
5. Confirm Company A relationship is created.
6. Verify Jane is not duplicated.

---

## Scenario 4 — Profile Contacts

1. Open Profile.
2. Open Contacts.
3. Add a person.
4. Associate them with a company.
5. Open global Contacts.
6. Confirm the same person exists.
7. Edit the person.
8. Confirm the change appears everywhere.

---

## Scenario 5 — mailing setup

1. Open Integrations.
2. Add Resend.
3. Simulate successful connection.
4. Open Sender Accounts.
5. Create sender account.
6. Select Resend integration.
7. Save.
8. Create another sender account.
9. Confirm both exist independently.

---

## Scenario 6 — campaign

1. Create campaign.
2. Select contacts.
3. Select sender account.
4. Review campaign.
5. Confirm sender identity is visible.
6. Send.
7. Confirm simulated outbound message.
8. Open conversation.
9. Confirm sender identity is consistent.

---

## Scenario 7 — no sender account

1. Create campaign.
2. Attempt to proceed toward sending.
3. Confirm clear explanation.
4. Create sender account.
5. Return to campaign.
6. Select sender.
7. Continue.

---

## Scenario 8 — multiple companies

One person:

```text
Jane Doe
```

Two companies:

```text
Company A
Company B
```

Verify:

* one person
* two relationships
* company-specific reasoning
* company-specific timeline
* global contact list shows one person
* company contact lists show the person in the appropriate context

This scenario is mandatory.

---

# 59. Definition of Done

This phase is complete when:

* [ ] A contact can be manually created.
* [ ] A contact can be created from a company.
* [ ] A contact can be created from Profile Contacts.
* [ ] Existing contacts can be associated with additional companies.
* [ ] Duplicate people are not silently created.
* [ ] One person can belong to multiple companies.
* [ ] Global Contacts shows a person once.
* [ ] Company Contacts shows company-specific context.
* [ ] Contact detail distinguishes person from company relationship.
* [ ] "Why this person" is company-specific.
* [ ] Company-specific evidence is contextual.
* [ ] Contacts can be edited.
* [ ] Company relationships can be edited appropriately.
* [ ] Automatic/discovered contacts use the same model as manual contacts.
* [ ] Research remains simulated.
* [ ] Contact discovery remains simulated.
* [ ] Generation remains simulated.
* [ ] Templates remain simulated.
* [ ] Integrations are a first-class concept.
* [ ] Resend is supported as the default/recommended simulated provider.
* [ ] SMTP is supported as a simulated provider.
* [ ] Multiple integrations can exist.
* [ ] Sender Accounts are a distinct concept from Integrations.
* [ ] Multiple sender accounts can exist.
* [ ] Each sender account selects an integration.
* [ ] Sender accounts support sender name/email/reply-to.
* [ ] Campaigns select a sender account.
* [ ] Campaign sending resolves through sender account → integration.
* [ ] Follow-ups use the campaign sender account.
* [ ] Conversations display consistent sender identity.
* [ ] No real emails are sent.
* [ ] No real provider credentials are transmitted/stored.
* [ ] Empty states exist.
* [ ] Dependency/blocker states exist.
* [ ] Destructive actions are confirmed.
* [ ] Search remains compatible.
* [ ] Settings/profile surfaces are coherent.
* [ ] Responsive behavior works.
* [ ] Accessibility behavior works.
* [ ] TypeScript passes.
* [ ] Existing tests pass.
* [ ] Build passes.
* [ ] Rendered UI has been visually reviewed.
* [ ] Issues discovered during QA are fixed.

---

# 60. Important final instruction

Do not treat this as a collection of unrelated CRUD screens.

The intended product model is:

```text
PERSON
  ↓
COMPANY RELATIONSHIP
  ↓
OPPORTUNITY / EVIDENCE / REASONING
  ↓
OUTREACH
  ↓
CAMPAIGN
  ↓
SENDER ACCOUNT
  ↓
INTEGRATION
  ↓
SIMULATED SEND
  ↓
CONVERSATION
  ↓
RELATIONSHIP
```

The person can exist across multiple companies.

The sender account can exist across multiple campaigns.

The integration can support multiple sender accounts.

Templates remain independent of sender infrastructure.

Research and generation remain simulated.

The user's judgment remains central.

Build the UX so these distinctions are understandable without requiring the user to understand the underlying technical architecture.

After implementation, perform actual rendered QA and fix concrete issues rather than simply reporting them.

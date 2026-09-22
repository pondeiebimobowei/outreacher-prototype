You are continuing implementation of the **Outreacher** product prototype.

This is a **Figma Make prototype focused on product experience, UX, believable interactions, and state-driven behavior**. Do not turn this into a production backend implementation.

We are combining two implementation tasks in this milestone:

1. **Harden and refactor the existing Campaign Creation + Pre-Send Review implementation**
2. **Implement Sending + Conversation/Reply Handling**

Do both in one coherent implementation pass.

---

# 1. PRODUCT CONTEXT

Outreacher is a **company-first career outreach platform**.

The core promise is:

> Turn “I want to work at this company” into “I have a credible, evidence-backed reason to contact this person.”

The core loop is:

**Company → Evidence → Opportunity → Person → Conversation**

The current product workflow is:

**Signup → Career Profile → Company → Research → Opportunity → Contacts → Evidence → Outreach → Campaign → Send → Conversation → Outcome**

Opportunity states:

* `CONFIRMED`

  * Actual evidence of a relevant opening exists.
* `PROACTIVE`

  * No confirmed opening, but there is enough company/context evidence to justify relationship-building outreach.
* `UNCLASSIFIED`

  * There is not enough evidence yet.

This is not a generic sales CRM.

Do not introduce sales terminology such as:

* leads
* deals
* prospects
* sales pipeline
* sales rep
* account executive
* conversion funnel

The user is pursuing employment opportunities and professional relationships.

---

# 2. EXISTING EXPERIENCE GOVERNANCE

Respect the existing Outreacher experience governance.

The product follows:

**Product Requirements > Technical Specifications + Experience Specifications > Approved Visual Designs > Implementation**

Experience specifications are authoritative when they exist and are APPROVED.

Follow the existing UX requirements:

* clear hierarchy
* loading states
* empty states
* error states
* success states
* disabled states
* keyboard/focus behavior
* destructive-action confirmation
* WCAG 2.2 AA expectations
* responsive desktop/tablet/mobile behavior

Do not create competing UX patterns merely because they are convenient to implement.

Do not introduce a second design language.

---

# 3. EXISTING PRODUCT DESIGN LANGUAGE

Preserve the established Outreacher visual system.

The product direction is:

**Linear's product discipline + Attio's relationship model + Apollo's prospecting mechanics + Outreacher's career-opportunity reasoning.**

The product should feel:

* calm
* focused
* intelligent
* professional
* evidence-driven
* restrained
* modern
* dense enough to be useful without becoming enterprise CRM clutter

Avoid:

* generic SaaS dashboard aesthetics
* excessive cards
* giant decorative hero sections
* unnecessary gradients
* sales CRM language
* fake analytics
* vanity metrics
* excessive animation
* overly colorful status systems
* visual noise

The existing shell is:

* persistent left sidebar on desktop
* collapsible/minimizable sidebar
* fixed top header
* global search
* notifications
* avatar
* main content pane
* only the main content area scrolls

Responsive behavior must remain intentional:

* desktop: persistent sidebar
* tablet: drawer/overlay behavior where appropriate
* mobile: compact header + drawer
* do not simply shrink the desktop interface onto mobile
* maintain usable touch targets

---

# 4. VERY IMPORTANT: STATE-DRIVEN PROTOTYPE

This prototype must behave like a real product.

The principle is:

**USER ACTION → PERSISTED WORKSPACE UPDATE → ROUTE/TAB CHANGE → UI RECONSTRUCTS FROM PERSISTED STATE**

Do not create screens that merely look correct in isolation.

Do not rely on local component state for durable workflow state when that state already belongs to the workspace.

The existing central persistence source is:

`src/lib/workspaceStore.ts`

Continue using the existing workspace persistence architecture.

`localStorage` is acceptable for this prototype.

Do NOT introduce Supabase.

Do NOT introduce a production email provider.

Do NOT introduce a second persistence system.

Do NOT create a new backend.

---

# 5. TASK ONE — HARDEN THE EXISTING CAMPAIGN IMPLEMENTATION

First inspect the current implementation before changing anything.

Relevant existing files likely include:

* `src/lib/workspaceStore.ts`
* `src/pages/companies/CompanyDetailPage.tsx`
* `src/pages/companies/OutreachTab.tsx`
* `src/pages/companies/CampaignTab.tsx`
* `src/pages/DashboardPage.tsx`
* `src/pages/companies/ContactsTab.tsx`

Use the actual current project structure if it differs.

Do not assume previous implementation is correct simply because TypeScript passes.

---

## 5.1 Preserve the current campaign workflow

The current intended flow is:

**READY Outreach**
→ Create Campaign
→ Campaign SETUP
→ enter/edit campaign name
→ create campaign
→ Campaign READY
→ pre-send review
→ send

Preserve this UX.

The campaign is a container around the already-approved outreach.

Do not duplicate the outreach subject/body into a second competing source of truth.

The campaign should reference the existing:

* selected contact
* opportunity
* approved outreach subject
* approved outreach message

---

# 5.2 Harden campaign lifecycle state

Review the current:

`campaignStage?: 'SETUP' | 'READY'`

implementation.

Keep the prototype model simple, but make the state transitions explicit and predictable.

Avoid relying on incidental JavaScript serialization behavior such as:

`JSON.stringify()` omitting `undefined`

as the conceptual mechanism for deleting a campaign.

If the existing store architecture supports it cleanly, explicitly remove campaign-specific fields when a campaign is discarded/reset.

The important requirement is not a specific implementation technique.

The important requirement is:

> There must never be a stale campaign that appears valid after the outreach it references has changed.

---

# 5.3 Protect against stale campaign state

The critical invariant is:

**A READY campaign must correspond to the currently approved outreach.**

If the user edits approved outreach after campaign setup/review has begun:

* clearly warn them that changing outreach invalidates the current campaign review
* require confirmation
* reset the affected campaign state appropriately
* return outreach to `DRAFT`
* require the user to approve the changed outreach again
* require campaign setup/review again

Do not allow:

**old campaign + new outreach**

to silently coexist.

For this prototype, it is acceptable to clear/reset the campaign when approved outreach is changed.

Make this behavior explicit in the UX.

Do not silently discard user work.

---

# 5.4 Make campaign persistence robust

Campaign state must survive:

* navigating away from the company
* switching tabs
* returning to the company
* refreshing the browser

At minimum preserve:

* campaign stage
* campaign name
* selected contact relationship
* approved outreach relationship

Do not persist redundant copies of data that already belongs to outreach/contact state unless there is a compelling prototype reason.

---

# 5.5 Campaign state derivation

Review all derived state helpers.

Make sure:

* Dashboard
* Companies
* Company Overview
* Journey progress
* Outreach
* Campaign

all derive campaign status from the same persisted workspace state.

There must not be separate competing campaign lifecycle state hidden inside individual pages.

---

# 5.6 Campaign state semantics

Keep these meanings precise:

### SETUP

The campaign has been created conceptually, but the user is still configuring it.

### READY

The campaign has passed the pre-send review.

It means:

> This outreach is approved and ready to be sent.

It does NOT mean:

> This email has already been sent.

### SENT

Only the sending flow should transition the campaign/outreach into sent state.

---

# 6. TASK TWO — IMPLEMENT SENDING + CONVERSATION/REPLY HANDLING

Now extend the workflow beyond Campaign READY.

The next product loop is:

**Campaign READY**
→ Send
→ Sending
→ Sent
→ Awaiting reply
→ Reply received
→ Conversation
→ Stop follow-ups / Record outcome

This is still a prototype.

There must be **NO real email sending**.

Simulate the sending action convincingly.

---

# 7. SENDING EXPERIENCE

Replace the current disabled:

**“Send — coming next”**

experience with a real prototype interaction.

The user should be able to send the approved campaign.

Before sending, retain the pre-send review.

The user should be able to clearly inspect:

* recipient/contact
* company
* opportunity state
* subject
* message
* campaign name
* evidence/context that informed the message

The primary CTA should communicate the actual action.

For example:

**Send outreach**

Do not make the user wonder whether the action is a preview or a real send.

Because this is a prototype, communicate the simulation appropriately in supporting copy without making the product feel fake.

Example concept:

> Prototype mode · No email will actually be sent.

Do not overemphasize this.

---

# 8. SEND CONFIRMATION

Sending outreach is consequential.

Use an appropriate confirmation interaction before the final send if the existing design language supports it.

The confirmation should make clear:

* who will receive it
* which company
* the subject
* that this action starts the outreach lifecycle

Do not add an annoying confirmation step if the existing interaction already provides sufficient review and the action is clearly understood.

Use product judgment.

The goal is confidence, not friction.

---

# 9. SENDING STATE

After the user confirms:

transition:

`READY → SENDING`

Display a believable transient sending state.

For example:

* sending indicator
* progress/status messaging
* disabled duplicate-send action

The user must not be able to accidentally send the same outreach twice during the simulated send.

After the transient state:

`SENDING → SENT`

Persist the transition.

Do not rely only on temporary component state.

---

# 10. SENT STATE

After sending, the UI should clearly communicate:

**Sent**

and:

**Waiting for a reply**

Do not immediately fabricate a reply.

The user should understand that:

> the outreach has been sent and the next meaningful event is a response.

Display useful context such as:

* recipient
* company
* sent outreach
* sent date/time
* opportunity classification
* campaign name
* current conversation state

Do not invent an actual email address if the prototype does not currently have one.

Do not invent personal contact details.

Use the existing contact data.

---

# 11. SIMULATED REPLY EXPERIENCE

Because this is a prototype, we need a believable way to demonstrate the reply lifecycle without integrating an email provider.

Create an explicit prototype-only interaction for simulating an incoming reply.

This must NOT appear as though the user actually received a real external email.

Possible pattern:

**Simulate reply**

or:

**Preview reply state**

Use the product's established language and styling.

The action should transition:

`SENT / AWAITING_REPLY → REPLIED`

Persist the state.

Do not automatically generate the reply immediately after sending.

The user should have to intentionally trigger the prototype simulation.

---

# 12. REPLY CONTENT

When simulating a reply, use realistic but clearly fictional professional content.

Examples of reply intent may include:

* interested in connecting
* asks for a CV/resume
* asks for more information
* suggests another person to contact
* not hiring currently
* polite decline

Do not create dozens of fake messages.

Build a small, intentional prototype mechanism that demonstrates the experience.

The simulated reply should feel like a professional conversation, not a sales inbox.

---

# 13. CONVERSATION EXPERIENCE

Implement the Conversation stage as the next destination after a reply.

The conversation should be centered around the relationship with the person at the company.

It should show:

### Context

* Company
* Contact
* Opportunity state
* Evidence/context
* Outreach campaign
* Current relationship state

### Timeline

Show the conversation chronologically.

At minimum:

**You**

* original outreach

then:

**Contact**

* simulated reply

The UI should clearly distinguish outgoing and incoming messages.

Do not turn this into a generic email client.

The user should always understand:

> Why did I contact this person, what evidence supported it, and what happened next?

---

# 14. CONVERSATION STATES

Introduce a coherent conversation lifecycle.

At minimum support:

* `NO_REPLY`
* `REPLIED`
* `ACTIVE`
* `STOPPED`

Use the existing architecture if equivalent fields already exist.

Do not create duplicate competing state systems.

Suggested semantics:

### NO_REPLY

Outreach was sent but no reply has been received.

### REPLIED

A response has been received.

### ACTIVE

The user is continuing the relationship/conversation.

### STOPPED

The user has intentionally stopped follow-up or further outreach for this conversation.

---

# 15. STOP FOLLOW-UPS

Provide a clear action for stopping follow-up activity.

The action should be available when appropriate.

Use confirmation because this changes the workflow.

After confirmation:

* conversation becomes `STOPPED`
* future follow-up actions become unavailable
* UI clearly explains that follow-up has been stopped
* preserve the conversation history

Do not delete the conversation.

Stopping is not deletion.

---

# 16. RECORD OUTCOME

Add a lightweight outcome mechanism.

This is important because Outreacher is ultimately helping the user understand what happened with each company/contact relationship.

Possible outcomes could include:

* Interested
* Asked to follow up later
* Referred to someone else
* Application opportunity
* Not a fit
* No response
* Closed

Keep the list small.

Do not build a giant CRM outcome taxonomy.

The outcome should be attached to the workflow/conversation and persisted.

After recording an outcome:

* show it clearly
* allow the user to understand the current state
* update relevant dashboard/company summaries
* do not erase the conversation history

---

# 17. DASHBOARD INTEGRATION

Update the Dashboard so it reflects the new lifecycle.

The Dashboard should remain an **action system**, not an analytics dashboard.

Prioritize:

### What needs attention

Examples:

* outreach ready to send
* awaiting reply
* reply received
* conversation needs attention
* outcome needs recording

### Where are opportunities

Continue showing meaningful company/opportunity states.

### What have I been doing?

Show concise activity context where useful.

Do not introduce vanity metrics like:

* total emails
* open rate
* click rate
* fake response percentages
* fake campaign analytics

These are not useful to the current product experience.

---

# 18. COMPANY WORKSPACE INTEGRATION

The company workspace must reflect the new lifecycle.

For a company where outreach has been sent:

The journey should naturally progress:

**Company → Research → Opportunity → Contact → Outreach → Campaign → Conversation**

The current stage should be visually obvious.

Examples:

* campaign ready
* outreach sent
* awaiting reply
* reply received
* conversation active
* stopped
* outcome recorded

Do not create a separate disconnected Conversation product.

Conversation belongs to the company's outreach journey.

---

# 19. JOURNEY PROGRESS

Update the existing journey/progress model carefully.

Do not break the current six-stage workflow.

The stages should remain conceptually:

1. Research
2. Opportunity
3. Contact
4. Outreach
5. Campaign
6. Conversation

Sending should be an action/state within the campaign/conversation transition, not necessarily a seventh top-level journey stage.

Avoid unnecessary complexity.

---

# 20. STATE MACHINE THINKING

Review the entire current prototype lifecycle and make the transitions coherent.

The intended lifecycle is approximately:

### Company

`NOT_ADDED → UNCLASSIFIED`

### Research

`NOT_STARTED → IN_PROGRESS → COMPLETE`

### Opportunity

`UNCLASSIFIED → PROACTIVE / CONFIRMED`

### Contacts

`NOT_DISCOVERED → DISCOVERING → DISCOVERED → SELECTED`

### Outreach

`NOT_STARTED → GENERATING → DRAFT → READY → SENT`

### Campaign

`SETUP → READY → SENT`

### Conversation

`NO_REPLY → REPLIED → ACTIVE → STOPPED`

### Outcome

`UNRECORDED → RECORDED`

Do not necessarily create all of these as literal enums if the current architecture uses different fields.

The requirement is behavioral coherence.

---

# 21. IMPORTANT INVARIANTS

Preserve these invariants:

### Invariant 1

A campaign cannot be created without:

* completed research
* classified opportunity
* selected contact
* READY outreach

### Invariant 2

A campaign cannot become READY unless the outreach is READY.

### Invariant 3

A campaign cannot be sent unless it is READY.

### Invariant 4

Sending cannot happen twice accidentally.

### Invariant 5

Editing approved outreach invalidates the existing campaign review.

### Invariant 6

A conversation cannot appear as an active sent conversation before outreach has been sent.

### Invariant 7

A simulated reply must only become available after sending.

### Invariant 8

Stopping a conversation does not delete its history.

### Invariant 9

Company A's lifecycle must never mutate Company B's lifecycle.

### Invariant 10

Contact A's selection must never leak into Contact B or another company.

### Invariant 11

Dashboard state must derive from the same persisted workspace state as company pages.

### Invariant 12

Refreshing the browser must preserve meaningful lifecycle state.

---

# 22. REMOVE COMPETING LOCAL STATE

While implementing this milestone, inspect the existing pages for lifecycle state that should live in the workspace store.

Pay particular attention to:

* campaign state
* sending state
* conversation state
* outcome state
* outreach state

Temporary UI state is fine for things such as:

* modal open/closed
* input draft before commit
* animation/transient visual state

But durable workflow state must live in the shared workspace model.

---

# 23. DOMAIN/UI COUPLING

The existing prototype may currently expose contact helper data from `ContactsTab.tsx`.

Do not perform a massive architectural rewrite.

However, if moving contact lookup logic into a more appropriate shared/domain helper is straightforward and directly improves this milestone, do it.

The goal is:

**shared workflow data should not become trapped inside one tab's UI implementation.**

Do not refactor unrelated code.

---

# 24. PROTOTYPE DATA

Do not invent real-world personal information.

Do not add fake:

* personal email addresses
* phone numbers
* private contact details

unless the existing prototype already intentionally uses them.

Use the existing contact representation.

Where an email address is required visually, use a clearly synthetic prototype value only if absolutely necessary and label it appropriately.

Prefer not showing an address if the product doesn't currently model one.

---

# 25. PERSISTENCE

Everything meaningful in this workflow must survive navigation and refresh.

At minimum:

* campaign creation
* campaign name
* campaign READY state
* outreach state
* sent state
* conversation state
* simulated reply
* conversation history
* stopped state
* outcome

Persist these through the existing workspace store.

When the page remounts, reconstruct the UI from persisted state.

Do not rely on the fact that React happens to preserve state during navigation.

---

# 26. RETURNING USER EXPERIENCE

A returning user should not be dumped back into a blank workflow.

If they have:

* a READY campaign
* a sent campaign
* a pending reply
* a reply
* an active conversation
* a stopped conversation

the Dashboard and company workspace should reflect that state naturally.

The primary action should correspond to what the user actually needs to do next.

Examples:

**Review campaign**

**Send outreach**

**View sent outreach**

**View reply**

**Continue conversation**

**Record outcome**

Do not always show “Start researching.”

---

# 27. EMPTY STATES

Do not fill empty states with fake data.

A new user should still experience an empty product.

For example:

No conversations:

> No conversations yet.

Then explain what creates one:

> Send outreach to a selected contact to start a conversation.

No replies:

> No reply yet.

Supporting copy:

> When your contact responds, their reply will appear here.

This teaches the product through the workflow.

---

# 28. LOADING / TRANSIENT STATES

Implement meaningful transient states for:

* sending
* simulated reply processing if applicable
* saving outcome if the UI represents it as asynchronous

Do not overanimate.

The UI should feel responsive and intentional.

---

# 29. ERROR / RECOVERY STATES

Even though this is a prototype, include sensible recovery behavior for invalid actions.

Examples:

* send blocked when campaign is not READY
* reply simulation blocked before send
* outcome unavailable before conversation exists
* stopped conversation cannot resume follow-up accidentally
* missing selected contact should produce a clear state rather than a crash

Do not expose raw JavaScript errors to the user.

---

# 30. RESPONSIVE DESIGN

Everything implemented in this milestone must work across:

### Desktop

Use the established persistent sidebar and workspace layout.

### Tablet

Use appropriate drawer/overlay behavior.

### Mobile

Use a compact header and drawer.

Conversation is especially important on mobile.

Do not make message content horizontally overflow.

Ensure:

* buttons remain usable
* confirmation dialogs fit the viewport
* message bubbles/content remain readable
* campaign review remains scannable
* long subject lines wrap
* contact/company context remains accessible
* touch targets are appropriately sized

---

# 31. ACCESSIBILITY

Maintain WCAG 2.2 AA expectations.

Especially for:

* send confirmation
* modals
* stop-follow-up confirmation
* outcome controls
* conversation actions
* status indicators
* keyboard navigation
* focus management
* disabled actions
* loading states

Do not communicate state through color alone.

---

# 32. VISUAL HIERARCHY FOR CONVERSATION

The conversation page should have a strong hierarchy.

Suggested structure:

### Header

Company + contact + current conversation state

### Context strip

Opportunity classification + relevant evidence/context

### Conversation timeline

Original outreach → replies → subsequent interaction

### Composer/action area

Only if the prototype supports replying.

If implementing a reply composer, keep it intentionally simple.

Do not build a full email client.

### Outcome/action area

Stop follow-ups / record outcome where appropriate.

The user should always understand:

**who this person is → why I contacted them → what happened → what should I do next**

---

# 33. DO NOT BUILD

Do NOT implement:

* SMTP
* Resend
* SendGrid
* Gmail API
* Outlook API
* actual email delivery
* inbound webhook infrastructure
* email parsing infrastructure
* real scheduling
* real follow-up automation
* background workers
* production notifications
* production authentication changes
* Supabase
* backend API integration
* analytics dashboards
* open tracking
* click tracking
* unsubscribe infrastructure
* bulk sending
* multi-recipient campaigns
* complex CRM features

This milestone is about **prototype experience and workflow behavior**.

---

# 34. DO NOT REDESIGN UNRELATED SURFACES

Do not rewrite:

* authentication
* onboarding
* career profile
* research
* opportunity
* contacts
* unrelated dashboard sections

unless a small integration change is required for the new lifecycle.

Preserve the existing visual language and interactions.

---

# 35. DO NOT BREAK EXISTING DATA

Be careful with existing demo/workspace entries.

If there are existing demo companies such as Kuda with a pre-existing SENT or conversation state:

* preserve their intended state
* do not accidentally reset them
* do not force them through the new flow
* make the new implementation gracefully support them

Existing prototype state is part of the experience.

---

# 36. IMPLEMENTATION QUALITY

Before making changes:

1. Inspect the existing state model.
2. Inspect existing lifecycle helpers.
3. Inspect CampaignTab.
4. Inspect OutreachTab.
5. Inspect CompanyDetailPage.
6. Inspect DashboardPage.
7. Inspect ContactsTab.
8. Understand how navigation works.
9. Understand how localStorage persistence currently works.

Then implement the smallest coherent architecture that supports the new lifecycle.

Do not blindly rewrite files.

Do not create duplicate components when existing ones can be extended cleanly.

---

# 37. IMPORTANT: BEHAVIOR OVER CLAIMS

Do not report:

> “Verified by design”

as a substitute for actual implementation behavior.

After implementation, inspect the resulting code and reason through the state transitions.

If practical within the prototype environment, exercise the actual interactions.

At minimum ensure the implementation logically supports:

1. READY outreach
2. Create campaign
3. SETUP
4. Edit campaign name
5. Create campaign
6. READY
7. Navigate away
8. Return
9. Refresh
10. Still READY
11. Send
12. SENDING
13. SENT
14. Awaiting reply
15. Simulate reply
16. REPLIED
17. Open conversation
18. Record outcome
19. Stop follow-ups
20. Refresh
21. State remains correct

Also reason through:

* Company A vs Company B
* Contact A vs Contact B
* changing outreach after campaign creation
* attempting to send before READY
* attempting to simulate reply before SENT
* attempting to stop an already stopped conversation

Fix issues you discover.

Do not merely list them in the final report.

---

# 38. FINAL UX QUALITY BAR

The finished experience should make the user's mental model obvious:

> I researched this company.

> I found evidence and classified the opportunity.

> I selected a relevant person.

> I prepared an evidence-backed message.

> I reviewed the campaign.

> I sent it.

> Now I'm waiting for a response.

> They replied.

> I can see the full context of why I contacted them.

> I can continue the relationship or stop follow-up.

> I can record what ultimately happened.

That is the product experience.

Do not turn the workflow into a generic email campaign tool.

---

# 39. FINAL CHECK

After implementation:

* ensure TypeScript/build errors are resolved
* ensure imports are clean
* ensure no dead campaign UI remains
* remove the old “Send — coming next” state
* ensure no accidental duplicate send controls exist
* ensure state transitions are persisted
* ensure dashboard integration works
* ensure company journey integration works
* ensure responsive behavior works
* ensure existing surfaces remain intact
* ensure no real email integration was introduced
* ensure no Supabase/backend integration was introduced

Then provide a concise implementation summary covering:

1. Campaign hardening changes
2. Sending implementation
3. Conversation/reply implementation
4. State/persistence changes
5. Dashboard/company integration
6. Any important architectural decisions
7. Any remaining limitations that are intentionally prototype-only

Do not claim production readiness.

This is a **UX-complete prototype milestone**, not a production email system.

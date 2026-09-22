# OUTREACHER — NEXT IMPLEMENTATION PASS

## Merge 3 Tasks: Outcome & Relationship Closure + Company Re-engagement + Dashboard Action Intelligence

You are continuing implementation of the existing Outreacher prototype.

This is a **Figma Make prototype**, not a production backend implementation.

The goal of this pass is to continue making the product feel like a coherent, stateful career relationship system.

Do not stop at analysis or produce a verification-only milestone.

**Inspect the current implementation first, understand what already exists, then implement the three tasks below together.**

Carry forward any necessary fixes from the existing Campaign, Conversation, Follow-up, and Dashboard implementation while doing this work.

Do not redesign unrelated parts of the application.

---

# 1. PRODUCT CONTEXT

Outreacher's core promise is:

> Turn “I want to work at this company” into “I have a credible, evidence-backed reason to contact this person.”

The core journey is:

**Company → Evidence → Opportunity → Person → Reason → Outreach → Conversation → Relationship / Outcome**

The company is the primary object.

The conversation is not a standalone inbox.

Everything should remain connected to:

* company
* opportunity classification
* evidence
* contact
* outreach
* campaign
* conversation
* outcome
* next action

The user should always understand:

> What happened here?

> What did I learn?

> What is the current relationship state?

> What should I do next?

---

# 2. EXISTING IMPLEMENTATION YOU MUST PRESERVE

Before changing anything, inspect the current code.

Important existing concepts include:

### Workspace persistence

`src/lib/workspaceStore.ts`

The store is the primary prototype persistence layer.

Use:

**USER ACTION → PERSISTED WORKSPACE UPDATE → ROUTE/TAB CHANGE → UI RECONSTRUCTS FROM PERSISTED STATE**

Do not create parallel fake state systems.

Use the existing workspace/company state architecture.

---

## Existing conversation lifecycle

Conversation states are:

```text
NO_REPLY
REPLIED
ACTIVE
STOPPED
```

Important invariant:

### REPLIED does NOT automatically become ACTIVE.

The user must explicitly choose:

**Continue conversation**

to transition:

```text
REPLIED → ACTIVE
```

---

## STOPPED is terminal

Once:

```text
convStage = STOPPED
```

there must be:

* no Reopen button
* no reply composer
* no follow-up sending
* no follow-up simulation
* no conversation continuation
* no mutation controls that imply the conversation can resume

The timeline/history remains visible.

STOPPED means:

> This relationship thread has been intentionally closed.

Do not reintroduce reopening.

---

# 3. EXISTING FOLLOW-UP SYSTEM

The current follow-up lifecycle is:

```text
NONE
DUE
DRAFT
SENT
```

There can be a maximum of:

**2 follow-ups after the original outreach.**

Follow-ups are scheduled approximately **4 business days** after the previous outbound message.

Existing fields include concepts such as:

```text
followUpStage
followUpDueAt
followUpCount
followUpSubject
followUpMessage
conversationMessages
```

Conversation messages are now structured rather than relying exclusively on:

```text
convReplyText
```

Maintain backward compatibility for legacy entries.

---

# 4. CRITICAL FOLLOW-UP INVARIANTS

Preserve these:

### Reply cancels pending follow-up

If an inbound contact reply arrives:

```text
followUpStage = NONE
```

and any pending follow-up due state must no longer remain actionable.

Do not allow the dashboard to simultaneously say:

> “Reply received”

and

> “Follow-up due”

for the same conversation.

---

### Follow-up limit

Never allow more than 2 follow-ups.

After the second follow-up:

```text
followUpCount >= 2
```

no further follow-up can be generated or sent.

---

### Follow-up belongs inside Conversation

Do not create a separate top-level Follow-ups section that fragments the company journey.

The relationship remains:

**Company → Contact → Conversation → Follow-up**

---

# 5. TASK ONE — OUTCOME + RELATIONSHIP CLOSURE

## Objective

Make recording an outcome meaningful.

Currently the user can record an outcome, but the product needs to demonstrate why that information matters.

An outcome should become part of the company's relationship memory.

---

# 5.1 OUTCOME CATEGORIES

Use the existing outcome system and ensure these categories are supported:

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

Use human-readable labels in the UI:

* Interested
* Asked me to follow up later
* Referred me to someone else
* Application opportunity
* Not a fit
* Not hiring currently
* No response
* Closed

Do not expose enum names to the user.

---

# 5.2 OUTCOME MUST BE SEPARATE FROM CONVERSATION STATE

Do NOT make:

```text
outcome = INTERESTED
```

automatically mean:

```text
convStage = ACTIVE
```

or:

```text
convStage = STOPPED
```

These are separate concepts.

Conversation state answers:

> What is happening with this conversation?

Outcome answers:

> What did this interaction ultimately tell us?

Maintain both independently.

---

# 5.3 OUTCOME RECORDING EXPERIENCE

When the user chooses:

**Record outcome**

show a focused outcome panel.

Include:

### Outcome

Select one of the supported categories.

### Optional note

Allow the user to record a short human note.

Examples:

```text
“Asked me to reconnect when the next frontend opening is posted.”

“Referred me to someone on the payments team.”

“Not hiring right now, but encouraged me to stay in touch.”
```

Keep the field lightweight.

Do not turn this into a long CRM form.

---

# 5.4 OUTCOME SAVE

On save:

Persist:

```text
convOutcome
```

and, if needed, a small outcome note field.

Update:

```text
lastActivity
```

The conversation history should remain intact.

Do not delete messages.

Do not replace the conversation with the outcome.

---

# 5.5 OUTCOME SUMMARY

After recording an outcome, show a compact summary:

```text
Outcome
Interested

Recorded today
```

or equivalent.

The summary should appear in the conversation context and company context.

---

# 5.6 RELATIONSHIP STATUS

Introduce a lightweight relationship interpretation separate from conversation state.

Do NOT create a complicated CRM pipeline.

Use a small set such as:

```text
OPEN
NURTURE
OPPORTUNITY
CLOSED
```

These should be derived or explicitly stored only if necessary.

Meaning:

### OPEN

There is still an active relationship thread.

### NURTURE

The person/company relationship is worth maintaining, but there is no immediate action.

Example:

> “Follow up when they hire again.”

### OPPORTUNITY

There is a concrete potential career opportunity.

Example:

> “Referred me to the engineering hiring team.”

### CLOSED

The relationship thread has reached a deliberate terminal outcome.

Do not imply that every outcome automatically maps to a relationship status if the existing architecture does not support it cleanly.

Prefer deterministic derivation where possible.

---

# 5.7 OUTCOME HISTORY

The company workspace should make the historical outcome visible.

Example:

```text
Relationship history

Sep 20
Interested
“Asked me to send my CV.”

Sep 14
Outreach sent

Sep 10
Contact discovered
```

Keep this concise.

This is not a full CRM activity log.

Only show meaningful events.

---

# 6. TASK TWO — COMPANY JOURNEY + RE-ENGAGEMENT

## Objective

The company should become a durable object that remembers the user's relationship journey.

When the user leaves a company and comes back later, they should not feel like they are starting over.

---

# 6.1 COMPANY JOURNEY HEADER

Improve the Company Workspace header so it communicates the current state.

Example:

```text
Paystack

PROACTIVE

Engineering opportunity worth exploring

Last activity
2 days ago
```

or:

```text
Stripe

CONFIRMED

Relevant engineering opening identified

Last activity
Today
```

Use existing company/opportunity data.

Do not invent factual company information.

---

# 6.2 JOURNEY PROGRESS

The existing workflow remains:

```text
Research
↓
Opportunity
↓
Contact
↓
Outreach
↓
Campaign
↓
Conversation
```

Do not replace this with a generic CRM pipeline.

The current stage should remain visually clear.

---

# 6.3 COMPLETED JOURNEY

When a company has reached a meaningful outcome, the workspace should communicate that the initial outreach journey is complete.

For example:

```text
Initial outreach complete

You contacted Jane Doe
Jane replied
Outcome: Interested

Next:
Send the requested CV
```

The wording must be generated from actual persisted state.

Do not hard-code a universal next step.

---

# 6.4 RE-ENGAGEMENT

The most important new behavior:

A completed interaction should not make the company disappear.

If the outcome suggests future relationship value, show:

```text
Stay connected

This relationship may be worth revisiting later.

[Add reminder]
```

For example, with:

```text
FOLLOW_UP_LATER
NOT_HIRING
REFERRED
INTERESTED
```

the company can remain visible as a relationship worth maintaining.

---

# 6.5 RE-ENGAGEMENT STATES

Create lightweight deterministic states.

Example:

```text
ACTIVE
NURTURE
CLOSED
```

Do not create unnecessary complexity.

Examples:

### Interested

```text
Relationship
Opportunity

Next action
Continue the conversation
```

### Follow up later

```text
Relationship
Nurture

Next action
Reconnect later
```

### Not hiring

```text
Relationship
Nurture

Next action
Watch for future hiring activity
```

### Not a fit

```text
Relationship
Closed

No immediate action
```

### Closed

```text
Relationship
Closed

No immediate action
```

These are product interpretations of recorded state, not claims about what the contact personally thinks.

---

# 6.6 NEXT ACTION

The company workspace should always provide one clear primary next action when one exists.

Examples:

```text
Review follow-up
Continue conversation
Record outcome
Review opportunity
Discover contacts
Review outreach
```

If no action is required:

```text
No action needed
```

Do not create fake tasks merely to populate the UI.

---

# 6.7 RETURNING USER EXPERIENCE

If a user returns to a company they previously worked on, preserve:

* research completion
* opportunity state
* selected contact
* outreach
* campaign
* conversation
* follow-ups
* outcome
* relationship status
* meaningful history

Do not reset the journey.

---

# 7. TASK THREE — DASHBOARD ACTION INTELLIGENCE

## Objective

The dashboard should become the user's **career outreach command center**, not an analytics dashboard.

The main question is:

> What should I do next to create meaningful opportunities?

---

# 7.1 PRIORITY ORDER

Use this priority hierarchy:

```text
1. New reply
2. Active conversation
3. Follow-up due
4. Follow-up draft
5. Campaign ready
6. Awaiting reply
7. Relationship / nurture items
8. Recently completed
```

Do not show vanity metrics as the dominant dashboard content.

---

# 7.2 PRIMARY ACTION QUEUE

Create or improve a prominent section:

```text
Needs your attention
```

Each item should communicate:

```text
Company
Person
Reason
Action
```

Example:

```text
Paystack
Jane Doe

Jane replied to your outreach.

[Continue conversation]
```

Another:

```text
Flutterwave
John Smith

Your follow-up is due.

[Review follow-up]
```

Another:

```text
Stripe
Sarah Lee

Your outreach is ready to send.

[Review campaign]
```

---

# 7.3 DO NOT OVERLOAD THE QUEUE

Only show meaningful actionable items.

Avoid cards such as:

```text
37 companies researched
14 contacts discovered
82% outreach completion
```

unless they are secondary information.

The dashboard is about action, not reporting.

---

# 7.4 RELATIONSHIP SECTION

Add a lightweight section for relationships that deserve future attention.

Example:

```text
Keep in touch

2 relationships worth revisiting

Paystack
Not hiring currently
Reconnect when relevant hiring activity appears

Stripe
Asked to follow up later
```

CTA:

```text
View company
```

Do not automatically send anything.

---

# 7.5 RECENT ACTIVITY

Show a concise chronological activity stream.

Examples:

```text
Today
Jane Doe replied at Paystack

Yesterday
Follow-up sent to Stripe

Sep 17
Opportunity confirmed at Flutterwave
```

Activity should come from actual persisted workspace state.

Do not fabricate events.

---

# 7.6 DASHBOARD EMPTY STATE

For a genuinely new user, the dashboard should not look broken.

Use:

```text
Start with a company you care about.

Research the company, identify a meaningful opportunity,
find the right person, and build the conversation from there.

[Add a company]
```

Do not show fake mature workspace data in the normal user workspace.

If the existing prototype has an explicit sample/demo mode, keep it clearly separated.

---

# 7.7 DASHBOARD STATE TRANSITIONS

The dashboard must respond naturally to user actions.

Example:

### Before send

```text
Campaign ready
```

After send:

```text
Awaiting reply
```

After simulated reply:

```text
Reply received
[Continue conversation]
```

After continue:

```text
Active conversation
```

After outcome:

```text
Relationship / next action
```

After stop:

```text
Stopped
```

After follow-up becomes due:

```text
Follow-up due
[Review follow-up]
```

Do not require page reloads to see these changes.

Use the existing persisted store architecture.

---

# 8. COMPANY ISOLATION

This is critical.

State must remain isolated by company.

If the user has:

```text
Paystack
Stripe
Flutterwave
```

an outcome, reply, follow-up, or relationship state belonging to Paystack must never appear under Stripe or Flutterwave.

Verify all lookup/update handlers use the company ID.

---

# 9. CONTACT ISOLATION

The same applies to contacts.

Conversation history must belong to the correct:

```text
company → contact → conversation
```

Do not allow a contact's message history to leak into another company.

---

# 10. STRUCTURED CONVERSATION TIMELINE

Carry forward the existing structured timeline.

Message types should remain conceptually:

```text
OUTREACH
FOLLOW_UP
CONTACT_REPLY
USER_REPLY
```

Every message should have enough metadata for deterministic rendering.

For example:

```text
type
timestamp
subject
body
```

Do not revert to multiple fields such as:

```text
replyText
replyText2
followUpText2
```

The timeline is the source of truth for conversation history.

---

# 11. FOLLOW-UP UX FIXES TO CARRY FORWARD

While implementing these three tasks, inspect and fix any existing inconsistencies.

### Fix 1 — Reply state

Ensure:

```text
REPLIED
```

does not display an active reply composer until the user selects:

```text
Continue conversation
```

---

### Fix 2 — STOPPED

Ensure there is no:

```text
Reopen
```

action anywhere.

STOPPED is terminal.

---

### Fix 3 — Follow-up + reply conflict

Once a contact reply is recorded:

```text
followUpStage = NONE
```

and the dashboard must no longer treat the follow-up as due.

---

### Fix 4 — Follow-up count

Never exceed:

```text
2
```

follow-ups.

The UI must disable/hide further follow-up actions when the limit has been reached.

---

### Fix 5 — Outcome independence

Recording an outcome must not unexpectedly mutate the conversation stage.

Only explicit conversation actions should change conversation state.

---

### Fix 6 — Campaign/Sent consistency

Avoid creating conflicting independent truths between:

```text
campaignStage
outreachStage
conversation state
```

Use the existing lifecycle consistently.

Do not introduce a second competing source of truth.

---

# 12. PROTOTYPE INTERACTION RULES

This is a prototype.

Do NOT build:

* real email sending
* real scheduling
* real background jobs
* real AI
* real external company research
* real contact enrichment
* backend APIs
* production authentication
* external integrations

Prototype behavior should simulate these experiences convincingly.

Existing prototype controls such as:

```text
Simulate reply
Simulate follow-up due
```

may remain where useful.

They must be clearly labeled as prototype controls.

---

# 13. PERSISTENCE

Use the existing workspace store.

Important rule:

**Every meaningful user action must persist.**

Examples:

```text
record outcome
edit outcome note
continue conversation
send reply
stop conversation
send follow-up
change relationship state if explicitly supported
```

After navigation or refresh, the resulting state should reconstruct correctly.

---

# 14. RESPONSIVE DESIGN

Everything must remain responsive.

### Desktop

Use the existing persistent sidebar + main content shell.

### Tablet

Sidebar may become a drawer/overlay.

### Mobile

Do not squeeze the desktop experience into the viewport.

Conversation should stack naturally:

```text
Context
↓
Timeline
↓
Action
↓
Composer
```

Dashboard cards should become a readable single-column action feed.

Touch targets should remain approximately 44px minimum.

---

# 15. ACCESSIBILITY

Carry forward the existing WCAG 2.2 AA requirements.

Ensure:

* keyboard navigation
* visible focus
* semantic buttons
* proper labels
* sufficient contrast
* dialogs trap focus appropriately
* destructive/terminal actions require confirmation
* status changes are understandable without relying solely on color

Do not use color as the only indicator for:

* reply
* follow-up due
* stopped
* outcome
* relationship state

---

# 16. VISUAL DIRECTION

Do not redesign the entire application.

Maintain the established visual language:

* restrained
* professional
* product-focused
* Linear-inspired discipline
* relationship-oriented like Attio
* prospecting mechanics where appropriate
* no generic “AI SaaS” visual clichés

Avoid:

* excessive gradients
* giant marketing cards
* excessive rounded containers
* meaningless charts
* dashboard clutter
* fake enterprise CRM density

The interface should feel like a serious product someone could use every day.

---

# 17. IMPORTANT PRODUCT PRINCIPLE

Do not make Outreacher feel like:

> “an email automation tool with a CRM attached.”

It should feel like:

> “a system that helps me understand which companies are worth pursuing, why I should contact someone, what happened when I did, and what I should do next.”

The company remains the center of gravity.

---

# 18. IMPLEMENTATION ORDER

Implement in this order:

### Phase A

Inspect:

* `workspaceStore.ts`
* `ConversationTab.tsx`
* `CampaignTab.tsx`
* `CompanyDetailPage.tsx`
* `DashboardPage.tsx`
* relevant shared components

Understand the existing state architecture before changing it.

### Phase B

Implement:

**Outcome + Relationship Closure**

### Phase C

Implement:

**Company Journey + Re-engagement**

### Phase D

Implement:

**Dashboard Action Intelligence**

### Phase E

Carry forward and fix:

* REPLIED → ACTIVE behavior
* terminal STOPPED
* follow-up cancellation on reply
* max 2 follow-ups
* campaign/send state consistency
* company/contact isolation

### Phase F

Run TypeScript/build checks and resolve implementation errors.

Do not stop merely because TypeScript passes.

Make the UI behavior coherent.

---

# 19. BEHAVIORAL SANITY CHECKS

Before considering this pass complete, exercise these flows through the implementation:

### Flow 1

```text
Company
→ Research
→ Opportunity
→ Contact
→ Outreach
→ Campaign
→ Send
→ Await reply
```

Expected dashboard state:

```text
Awaiting reply
```

---

### Flow 2

```text
Await reply
→ Simulate reply
```

Expected:

```text
REPLIED
```

No active composer yet.

---

### Flow 3

```text
REPLIED
→ Continue conversation
```

Expected:

```text
ACTIVE
```

Composer appears.

---

### Flow 4

```text
ACTIVE
→ Record outcome
→ Interested
```

Expected:

* outcome persisted
* conversation history preserved
* relationship context updated
* dashboard reflects meaningful next action
* conversation state does not unexpectedly change

---

### Flow 5

```text
Await reply
→ Simulate follow-up due
→ Review follow-up
→ Save draft
```

Expected:

```text
DRAFT
```

Draft survives navigation.

---

### Flow 6

```text
DRAFT
→ Send follow-up
```

Expected:

* follow-up appended to timeline
* follow-up count increments
* new due date calculated if another follow-up remains
* dashboard updates

---

### Flow 7

```text
Follow-up pending
→ Simulate reply
```

Expected:

* reply appended
* pending follow-up cancelled
* conversation becomes REPLIED
* dashboard no longer says follow-up due

---

### Flow 8

```text
Conversation
→ Stop follow-ups
```

Expected:

```text
STOPPED
```

Expected:

* history remains visible
* no Reopen
* no reply composer
* no follow-up controls

---

### Flow 9

```text
Outcome = Not hiring currently
```

Expected relationship interpretation:

```text
Nurture
```

with an appropriate future-oriented next action rather than pretending there is an immediate opportunity.

---

### Flow 10

Create two companies and progress them independently.

Expected:

```text
Company A state ≠ Company B state
```

No cross-company leakage.

---

# 20. DO NOT DO

Do not:

* rewrite the entire app
* replace the workspace store architecture
* introduce a backend
* introduce real APIs
* introduce real AI
* introduce a real email provider
* introduce a generic CRM pipeline
* add unrelated settings
* add billing
* add team/workspace collaboration
* add analytics dashboards
* add fake company/contact data to normal users
* silently mix demo data into real workspace state
* revert structured conversation messages
* reintroduce Reopen
* allow more than 2 follow-ups
* make outcomes mutate conversation state automatically
* make follow-ups a separate top-level workflow

---

# 21. DEFINITION OF DONE

This implementation pass is complete when:

* outcomes are durable and useful
* outcome notes can be persisted
* relationship context is visible
* completed company journeys remain useful
* returning to a company preserves the relationship history
* future re-engagement is represented without becoming a complicated CRM
* dashboard prioritizes actual user actions
* replies, active conversations, follow-ups, and campaigns surface correctly
* company/contact state remains isolated
* structured conversation history remains the source of truth
* existing follow-up behavior remains intact
* REPLIED requires explicit continuation
* STOPPED remains terminal
* follow-up limit remains 2
* reply cancels pending follow-up
* no contradictory states are presented
* responsive behavior works across desktop/tablet/mobile
* accessibility remains intact
* TypeScript/build checks pass
* existing flows continue working
* the resulting product feels like one coherent company-first career workflow

Most importantly:

**Do not merely make the screens technically complete. Make the user's next decision obvious.**

The product should increasingly answer:

> **“I contacted this company. What happened, what does it mean, and what should I do next?”**

without forcing the user to reconstruct that context themselves.

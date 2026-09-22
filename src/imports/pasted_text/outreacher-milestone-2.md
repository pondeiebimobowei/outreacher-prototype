You are continuing implementation of the **Outreacher** prototype.

This milestone combines two tasks:

1. **Follow-Up & Reply Management**
2. **Outcomes + Relationship/Opportunity Closure**

Implement both as one coherent product experience.

Do not stop at designing screens. Extend the existing state-driven prototype behavior and persistence.

At the same time, carry forward and fix any necessary issues discovered in the existing Campaign → Sending → Conversation implementation.

---

# 1. PRODUCT CONTEXT

Outreacher is a company-first career outreach platform.

Core promise:

> Turn “I want to work at this company” into “I have a credible, evidence-backed reason to contact this person.”

Core loop:

**Company → Evidence → Opportunity → Person → Conversation**

Current workflow:

**Signup → Career Profile → Company → Research → Opportunity → Contacts → Evidence → Outreach → Campaign → Send → Conversation → Outcome**

This is a career relationship product.

It is NOT a generic sales CRM.

Avoid introducing concepts such as:

* leads
* deals
* sales representatives
* sales pipeline
* sales conversion
* sales quotas
* sales sequences

Use career/professional relationship language.

---

# 2. CONTINUE FROM THE EXISTING IMPLEMENTATION

The previous milestone implemented:

* Campaign hardening
* Campaign SETUP
* Campaign READY
* Sending
* SENT state
* Awaiting reply
* Simulated replies
* Conversation tab
* REPLIED
* ACTIVE
* STOPPED
* Outcome recording
* Dashboard integration
* Company journey integration

Inspect the current implementation before changing anything.

Likely files include:

* `src/lib/workspaceStore.ts`
* `src/pages/DashboardPage.tsx`
* `src/pages/companies/CompanyDetailPage.tsx`
* `src/pages/companies/CampaignTab.tsx`
* `src/pages/companies/ConversationTab.tsx`
* `src/pages/companies/OutreachTab.tsx`
* `src/pages/companies/ContactsTab.tsx`

Use the actual project structure if different.

Do not assume the previous implementation is correct simply because TypeScript is clean.

---

# 3. IMPORTANT CONTINUITY RULE

We are intentionally progressing through the product rather than creating isolated verification milestones.

Therefore:

**If you discover an issue in the existing Campaign, Sending, or Conversation implementation that directly affects this milestone, fix it as part of this implementation.**

Do NOT stop and merely report it.

However:

**Do not perform unrelated architectural rewrites.**

Fix what is necessary to make the combined workflow coherent.

---

# 4. FIRST: HARDEN THE EXISTING CONVERSATION LIFECYCLE

Before adding follow-ups, inspect the current conversation lifecycle.

The intended states are:

```text
NO_REPLY
REPLIED
ACTIVE
STOPPED
```

Make their meanings explicit.

### NO_REPLY

Outreach has been sent.

No reply has been received.

### REPLIED

A reply has been received.

The user has not yet explicitly continued the conversation.

### ACTIVE

The user has acknowledged/continued the conversation and the relationship is currently active.

### STOPPED

The user has intentionally stopped follow-up/conversation activity.

---

# 5. IMPORTANT: REPLIED MUST NOT AUTOMATICALLY MEAN ACTIVE

Fix this if the current implementation conflates them.

A reply arriving should transition:

```text
NO_REPLY → REPLIED
```

It should NOT automatically become:

```text
ACTIVE
```

The user should have an explicit action such as:

**Continue conversation**

or equivalent.

That action transitions:

```text
REPLIED → ACTIVE
```

This gives the user control over the relationship state.

The Conversation UI should make this distinction understandable.

---

# 6. STOPPED MUST BE A REAL TERMINAL STATE FOR NOW

If the current implementation has a **Reopen** action, remove it unless there is an explicit product requirement elsewhere supporting reopening.

Do not invent lifecycle behavior.

For this milestone:

```text
STOPPED
```

means the user has intentionally ended follow-up activity for this outreach relationship.

Preserve all history.

Do not delete anything.

Do not allow accidental follow-up actions after STOPPED.

If reopening becomes necessary later, it can be designed deliberately as its own experience.

---

# 7. TASK ONE — FOLLOW-UP MANAGEMENT

Now implement the follow-up experience.

The product should support the user after an outreach has been sent and before/after a reply.

The core lifecycle becomes:

```text
Campaign READY
→ Send
→ SENT
→ NO_REPLY
→ Follow-up becomes due
→ User reviews follow-up
→ Send follow-up
→ NO_REPLY again
```

If a reply arrives at any point:

```text
NO_REPLY
→ REPLIED
→ Continue conversation
→ ACTIVE
```

If the user stops:

```text
NO_REPLY / REPLIED / ACTIVE
→ STOPPED
```

---

# 8. DO NOT BUILD REAL SCHEDULING

This remains a prototype.

Do NOT implement:

* cron
* background jobs
* queues
* email providers
* SMTP
* Resend
* Gmail
* Outlook
* real delayed email delivery

We are simulating the experience.

The prototype should nevertheless make the lifecycle feel believable.

---

# 9. FOLLOW-UP TIMING MODEL

Use the existing product requirement that follow-up occurs after **4 business days**.

Do not implement a real scheduler.

Represent the concept in the workspace state.

For example, after sending:

```text
sentAt
followUpDueAt
```

can be persisted.

The due date should represent **4 business days after sending**.

Implement a small deterministic helper for calculating business days.

Do not count Saturday/Sunday.

Do not introduce a complicated calendar system.

---

# 10. FOLLOW-UP STATE

Add the minimum state necessary to distinguish:

* no follow-up scheduled
* follow-up pending
* follow-up due
* follow-up reviewed
* follow-up sent

Do not create an enormous state machine.

If the existing architecture can express this with a small number of fields, prefer that.

For example, conceptually:

```text
followUpStage:
NONE
DUE
DRAFT
SENT
```

Use a naming convention consistent with the existing store.

The exact enum names may differ.

The behavioral requirement is what matters.

---

# 11. PERSIST FOLLOW-UP STATE

Follow-up state must survive:

* tab navigation
* company navigation
* browser refresh

Persist:

* original sent timestamp
* follow-up due timestamp
* follow-up stage
* follow-up subject/message when created
* follow-up sent timestamp if simulated

Do not store temporary UI modal state in the workspace.

---

# 12. SIMULATING TIME

Because this is a prototype, users need a way to experience a due follow-up without waiting four business days.

Add an explicitly labelled prototype control.

Example:

**Simulate follow-up due**

or:

**Preview follow-up due state**

It must be visually obvious that this is a prototype/demo interaction.

Do not make the user think the application secretly changed the clock.

The control should move the workflow into the appropriate due state.

Do not expose this control as a normal production action.

---

# 13. AWAITING REPLY EXPERIENCE

When the outreach has been sent and there is no reply:

Show:

* sent status
* sent date
* contact
* company
* opportunity
* original outreach
* current follow-up state

If follow-up is not yet due:

show something like:

> Follow-up scheduled

and:

> Follow up in 4 business days

If the prototype is allowing the user to simulate the due state, show that separately and clearly.

---

# 14. FOLLOW-UP DUE EXPERIENCE

When a follow-up becomes due, the user should not have to discover it buried inside the conversation.

The Dashboard should surface it as an actionable item.

The Company Workspace should also show:

**Follow-up due**

The primary action should be:

**Review follow-up**

not:

**Send follow-up**

The user should review before sending.

---

# 15. FOLLOW-UP DRAFT

When the user opens the follow-up:

Provide:

* recipient/contact
* company
* previous outreach context
* previous message
* evidence/context
* follow-up subject
* follow-up body

The follow-up should be contextual.

Do not generate a generic:

> Just following up on my previous email.

Instead, produce a short professional follow-up that makes sense given:

* the original outreach
* company
* opportunity state
* contact
* previous context

This is still deterministic prototype content.

Do not call a real AI API.

---

# 16. FOLLOW-UP SHOULD NOT RESTART THE RELATIONSHIP

The follow-up is part of the same outreach relationship.

Do not create a second CompanyEntry.

Do not create a second contact.

Do not create a second unrelated campaign.

The conversation timeline should become:

```text
You — Original outreach

You — Follow-up
```

If a reply occurs afterward:

```text
You — Original outreach

You — Follow-up

Contact — Reply
```

---

# 17. FOLLOW-UP EDITING

Allow the user to edit the follow-up before sending.

Persist meaningful edits.

The user should have clear controls:

**Save draft**

and:

**Send follow-up**

Do not silently send when the user opens the follow-up.

---

# 18. FOLLOW-UP SEND FLOW

Follow the same interaction quality as the initial send.

Use:

```text
DRAFT
→ confirmation
→ SENDING
→ SENT
```

The sending state can remain transient/local.

The resulting SENT state must be persisted.

Prevent duplicate sends while the simulated send is in progress.

After sending:

* append the follow-up to the conversation timeline
* update follow-up state
* calculate/update the next follow-up state if appropriate
* return the user to the conversation context

Do not create duplicate messages on refresh.

---

# 19. FOLLOW-UP LIMIT

Do not build infinite follow-up automation.

For this prototype, support a deliberately small number of follow-ups.

A sensible initial limit is:

**2 follow-ups maximum after the original outreach.**

After the maximum is reached:

show something like:

> Follow-up limit reached

and explain that the user should decide whether to stop or pursue another route.

Do not automatically send anything.

---

# 20. REPLY STOPS FOLLOW-UP

This is a critical invariant.

When a reply is received:

**all pending follow-up activity must stop.**

If:

```text
followUpStage = DUE
```

and a reply arrives:

transition into:

```text
REPLIED
```

and remove the pending follow-up action.

Do not show:

**Send follow-up**

alongside a newly received reply.

A reply takes priority.

---

# 21. REPLY EXPERIENCE

Improve the existing simulated reply flow.

When a reply is simulated:

* preserve the original outreach
* preserve all follow-ups already sent
* append the incoming reply
* transition `NO_REPLY → REPLIED`
* stop any pending follow-up
* surface the reply prominently on Dashboard
* make “Continue conversation” the main action

Do not lose message history.

---

# 22. CONTINUE CONVERSATION

When the user clicks:

**Continue conversation**

transition:

```text
REPLIED → ACTIVE
```

The Conversation UI should then expose a lightweight reply composer.

Do not build a full email client.

The composer only needs:

* message field
* send/reply action
* clear indication that this is a reply to the contact

---

# 23. SIMULATED OUTBOUND CONVERSATION REPLY

Because there is no real email provider, sending a reply from the composer should simulate an outgoing conversation message.

Append:

**You**

with the user's entered message.

Persist it.

Remain:

```text
ACTIVE
```

The product should feel like the relationship is continuing.

---

# 24. OPTIONAL SIMULATED INCOMING REPLY

Allow the prototype to simulate another incoming response while the conversation is ACTIVE.

Use:

**Simulate reply**

again, but make the context clear.

The simulated response should be different from the first response.

Do not endlessly generate messages.

One or two realistic examples are enough to demonstrate the interaction.

---

# 25. CONVERSATION TIMELINE

The timeline must now support:

* original outreach
* follow-up 1
* follow-up 2
* incoming reply
* user's conversational replies
* subsequent incoming replies

Every message needs:

* sender
* timestamp
* message content
* message type/state

Do not store the timeline as a single concatenated string.

Use a structured prototype representation.

For example, conceptually:

```text
conversationMessages[]
```

Each item should identify:

* `direction`
* `body`
* `timestamp`
* `kind`

Use the existing architecture where possible.

---

# 26. IMPORTANT: PRESERVE EVIDENCE CONTEXT

The conversation screen should not lose the reasoning behind the original outreach.

Keep a compact context section showing:

### Why this person

The contact relevance.

### Opportunity

CONFIRMED / PROACTIVE.

### Evidence

The important company/research context used to justify the outreach.

Do not expose hidden model reasoning.

Only show product-level evidence and rationale already intended for the user.

---

# 27. TASK TWO — OUTCOMES + RELATIONSHIP CLOSURE

Now make the end of the workflow meaningful.

The product should help the user record what actually happened.

The current outcome system should be reviewed and simplified if necessary.

---

# 28. OUTCOME CATEGORIES

Use a small set of useful career-outreach outcomes.

Recommended set:

* **Interested**
* **Asked to follow up later**
* **Referred me to someone else**
* **Application opportunity**
* **Not a fit**
* **Not hiring currently**
* **No response**
* **Closed**

Do not build a huge taxonomy.

These are workflow outcomes, not analytics categories.

---

# 29. OUTCOME SHOULD NOT AUTOMATICALLY EQUAL CONVERSATION STATE

This is important.

Do not do:

```text
record outcome → automatically mark conversation ACTIVE/STOPPED
```

unless the selected outcome logically requires it.

The conversation state and outcome are related but distinct.

For example:

```text
ACTIVE
+ outcome = Interested
```

can be valid.

Likewise:

```text
STOPPED
+ outcome = Not a fit
```

can be valid.

Keep those concepts separate.

---

# 30. OUTCOME RECORDING UX

After meaningful conversation activity, show:

**Record outcome**

Use a simple selection interface.

The user chooses one outcome and confirms.

After saving:

* show the outcome clearly
* persist it
* reflect it on the Company Workspace
* reflect it on Dashboard where relevant

Do not force the user to record an outcome before continuing a conversation.

---

# 31. OUTCOME EDITING

Allow an already-recorded outcome to be changed.

The user should understand that they are updating the recorded outcome.

Do not create duplicate outcomes.

Store the current outcome cleanly.

If the prototype needs history later, that can be added separately.

---

# 32. CLOSING A RELATIONSHIP

Once the user intentionally stops the conversation:

show:

**Conversation stopped**

Preserve:

* company
* contact
* evidence
* original outreach
* follow-ups
* replies
* outcome

The interface becomes read-only for conversation sending/follow-up actions.

Do not delete the relationship.

---

# 33. NO REOPEN FOR NOW

If the existing ConversationTab contains:

**Reopen**

remove it.

Do not allow:

```text
STOPPED → ACTIVE
```

in this milestone.

The user can still review the relationship and outcome.

A future milestone can deliberately design reactivation if product requirements call for it.

---

# 34. COMPANY OPPORTUNITY CLOSURE

When the outreach relationship has concluded, make sure the Company Workspace still distinguishes:

* company opportunity
* outreach relationship
* conversation status
* outcome

Do NOT automatically change:

`PROACTIVE → CONFIRMED`

or:

`CONFIRMED → PROACTIVE`

because of a conversation outcome.

Opportunity classification is based on evidence.

Conversation outcome is based on what happened with the person.

These must remain separate concepts.

---

# 35. DASHBOARD

The Dashboard should become increasingly useful as the workflow progresses.

Prioritize:

### Needs attention

Examples:

* Review campaign
* Follow-up due
* Reply received
* Continue conversation
* Record outcome

### Recent activity

Examples:

* Outreach sent
* Follow-up sent
* Reply received
* Conversation updated
* Outcome recorded

### Opportunities

Continue surfacing:

* CONFIRMED
* PROACTIVE
* UNCLASSIFIED

Do not introduce vanity analytics.

No:

* open rates
* click rates
* response percentages
* fake conversion rates
* fake campaign performance charts

---

# 36. DASHBOARD PRIORITY

A reply should generally take precedence over a follow-up.

If a company/contact has:

```text
follow-up due
AND
reply received
```

the Dashboard should surface:

**Reply received**

not:

**Follow-up due**

Similarly, an ACTIVE conversation needing attention should take precedence over routine follow-up scheduling.

Do not create contradictory CTAs.

---

# 37. COMPANY WORKSPACE

The Company Workspace should now represent the complete relationship lifecycle.

The journey remains:

**Research → Opportunity → Contact → Outreach → Campaign → Conversation**

Do not add “Follow-up” as a new top-level journey stage.

Follow-ups belong inside Conversation.

Conversation should be capable of showing:

* Awaiting reply
* Follow-up due
* Reply received
* Active
* Stopped
* Outcome recorded

---

# 38. JOURNEY PROGRESS

Review `deriveStages`, `deriveNextStep`, `deriveWorkflowLabel`, and related helpers.

Make sure the current state is reconstructed from shared workspace data.

Examples:

### Campaign READY

Next:

**Send outreach**

### SENT / NO_REPLY

Next:

**Awaiting reply**

or:

**Follow-up scheduled**

### Follow-up DUE

Next:

**Review follow-up**

### REPLIED

Next:

**Continue conversation**

### ACTIVE

Next:

**Continue conversation**

### STOPPED

Next:

**View conversation**

### Outcome recorded

Do not let the outcome hide the conversation history.

---

# 39. SHARED STATE ARCHITECTURE

Continue using:

`src/lib/workspaceStore.ts`

as the central prototype persistence layer.

Avoid adding lifecycle state independently inside:

* DashboardPage
* CompanyDetailPage
* CampaignTab
* ConversationTab
* OutreachTab

Local state is appropriate for temporary UI concerns:

* modal state
* confirmation state
* transient sending animation
* input editing before save

Persistent workflow state belongs in the shared store.

---

# 40. CONVERSATION DATA MODEL

Review whether the existing:

```text
convReplyText
```

field has become insufficient now that we support multiple messages.

If so, evolve the prototype model.

Prefer a structured conversation representation over continuously adding fields such as:

```text
convReplyText2
convReplyText3
followUpText
followUpText2
reply2
```

Do NOT build an unnecessarily complex production schema.

But do create a clean prototype representation that can support:

* original outreach
* follow-ups
* replies
* user conversation messages

without field explosion.

---

# 41. MIGRATION / BACKWARD COMPATIBILITY

Existing demo data may already contain:

* `outreachStage: SENT`
* `convStage: ACTIVE`
* Kuda demo conversation data
* older campaign fields

Do not break existing demo entries.

If old entries do not have the new structured conversation data:

* gracefully derive/display the existing conversation
* avoid crashes
* do not overwrite user data
* use fallback presentation only where necessary

Do not build a giant migration framework for this prototype.

---

# 42. Kuda DEMO

Preserve the existing Kuda demo behavior.

It may represent a previously sent/active relationship.

Do not force it through the new initial-send flow.

It should continue to display a coherent Conversation experience.

If it lacks new fields, provide sensible backward-compatible fallback behavior.

Do not add unnecessary Kuda-specific branching throughout the application.

Keep any compatibility handling centralized where practical.

---

# 43. RESPONSIVE EXPERIENCE

Everything must remain responsive.

### Desktop

Use the established two-column conversation experience where appropriate.

### Tablet

Allow the context panel and conversation content to stack or collapse naturally.

### Mobile

Prioritize:

1. company/contact context
2. conversation state
3. message timeline
4. primary action
5. composer/outcome controls

Do not allow horizontal overflow.

Long messages must wrap.

Follow-up review should remain easy to scan.

Confirmation interactions must fit small screens.

---

# 44. ACCESSIBILITY

Maintain WCAG 2.2 AA expectations.

Especially:

* follow-up confirmation
* send confirmation
* stop confirmation
* outcome selector
* conversation composer
* status indicators
* focus management
* keyboard interaction
* disabled controls
* loading states

Do not rely on color alone to communicate:

* reply
* stopped
* due
* active
* outcome

---

# 45. IMPORTANT STATE INVARIANTS

Enforce these invariants:

### 1

A follow-up cannot exist before original outreach is SENT.

### 2

A follow-up cannot be sent while a reply is pending/received if the reply has already arrived.

### 3

A reply cancels pending follow-up action.

### 4

Follow-up sending requires review.

### 5

Follow-up cannot be sent twice accidentally.

### 6

Maximum two follow-ups after the original outreach.

### 7

REPLIED does not automatically become ACTIVE.

### 8

Only an explicit user continuation action transitions REPLIED → ACTIVE.

### 9

STOPPED is terminal for this milestone.

### 10

STOPPED conversations cannot send follow-ups.

### 11

STOPPED conversations cannot send conversation replies.

### 12

Conversation history is never deleted by stopping.

### 13

Outcome and conversation state remain separate.

### 14

Opportunity classification remains separate from conversation outcome.

### 15

Company A cannot affect Company B.

### 16

Contact A cannot affect Contact B.

### 17

Dashboard derives from the same persisted workspace state.

### 18

Refresh reconstructs the workflow correctly.

### 19

No real email is sent.

### 20

No production email integration is introduced.

---

# 46. STATE PRIORITY

When multiple things are technically true, use a coherent priority order.

For example:

```text
STOPPED
↓
REPLY RECEIVED
↓
ACTIVE CONVERSATION
↓
FOLLOW-UP DUE
↓
AWAITING REPLY
↓
CAMPAIGN READY
↓
EARLIER WORKFLOW STATES
```

Do not blindly implement this as a numeric priority if the existing architecture does something cleaner.

The requirement is that the user should never see a lower-priority action that contradicts the current relationship state.

---

# 47. PROTOTYPE SIMULATION CONTROLS

Prototype-only controls should be visually and textually distinguishable.

Examples:

**Prototype**

> Simulate reply

**Prototype**

> Simulate follow-up due

Do not hide them among normal production actions.

Do not make them look like automated system behavior.

---

# 48. DO NOT BUILD

Do not implement:

* real email sending
* real email receiving
* SMTP
* Resend
* Gmail
* Outlook
* cron
* queues
* BullMQ
* backend workers
* webhooks
* inbound parsing
* actual business-day scheduler
* automatic AI generation API
* analytics
* open tracking
* click tracking
* unsubscribe infrastructure
* bulk campaigns
* multiple recipients
* team collaboration
* CRM pipelines

This remains a frontend/product prototype.

---

# 49. DO NOT REDESIGN THE ENTIRE APPLICATION

Preserve existing:

* auth
* onboarding
* career profile
* company
* research
* opportunity
* contacts
* evidence
* outreach
* campaign

Only modify them when required to correctly integrate the new workflow.

---

# 50. CODE QUALITY

Before implementation:

1. Inspect the current workspace store.
2. Inspect the current ConversationTab.
3. Inspect CampaignTab.
4. Inspect OutreachTab.
5. Inspect CompanyDetailPage.
6. Inspect DashboardPage.
7. Inspect existing helper functions.
8. Understand current persistence.
9. Understand existing demo data.

Then implement.

Do not blindly overwrite the existing implementation.

Reuse established components and patterns.

Avoid duplicated lifecycle logic.

Keep domain-like helpers outside UI components where practical.

---

# 51. BEHAVIORAL TESTING / SANITY CHECK

Do not simply claim that the implementation is correct.

Reason through and, where practical, exercise the actual flow:

### Initial send

```text
Campaign READY
→ Send
→ SENT
→ NO_REPLY
```

### Follow-up

```text
NO_REPLY
→ simulate follow-up due
→ Review follow-up
→ edit
→ send
→ follow-up SENT
```

### Reply

```text
NO_REPLY
→ Simulate reply
→ REPLIED
```

Verify:

* follow-up disappears
* reply becomes primary action
* history is preserved

### Conversation

```text
REPLIED
→ Continue conversation
→ ACTIVE
→ user sends message
→ message appears in timeline
```

### Stop

```text
ACTIVE
→ Stop follow-ups
→ confirmation
→ STOPPED
```

Verify:

* composer disabled
* follow-up disabled
* history preserved
* no Reopen action

### Outcome

```text
STOPPED
→ Record outcome
→ outcome persisted
```

Also test conceptually:

* refresh
* navigate away
* return
* Company A/B isolation
* Contact A/B isolation
* old Kuda demo
* campaign state after editing outreach
* maximum follow-up count
* reply arriving while follow-up is due
* attempting to send while STOPPED

If you find a bug, fix it.

Do not merely report it.

---

# 52. FINAL EXPERIENCE QUALITY BAR

The user should be able to understand the entire relationship without thinking about the underlying state machine.

The experience should communicate:

> I found this company.

> I researched it.

> I found evidence.

> I identified an opportunity.

> I found the right person.

> I contacted them for a specific reason.

> I sent the message.

> I'm waiting for a response.

> If they don't respond, I can review a follow-up.

> If they reply, follow-up stops.

> I can continue the conversation.

> If the relationship ends, I can stop it.

> I can record what happened.

> I can return later and understand the complete history.

That is the experience we are building.

---

# 53. FINAL OUTPUT

After implementation, provide a concise summary containing:

1. Follow-up lifecycle implemented
2. Reply handling changes
3. Conversation lifecycle changes
4. Outcome/closure changes
5. Persistence/state changes
6. Dashboard/company integration
7. Backward compatibility changes
8. Any remaining prototype-only limitations

Do not claim production readiness.

This milestone should leave Outreacher with a coherent:

**Research → Opportunity → Contact → Outreach → Campaign → Send → Follow-up/Reply → Conversation → Outcome**

experience.

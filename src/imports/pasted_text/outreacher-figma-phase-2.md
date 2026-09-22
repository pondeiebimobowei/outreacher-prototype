You are continuing implementation of the **Outreacher Figma Make prototype**.

The previous phase completed a major architecture and integrity pass across:

* Career Profile
* Onboarding
* Companies
* Contacts
* Contact Associations
* Outreach
* Conversations
* Campaigns
* Templates
* Integrations
* Sender Accounts
* Global Search
* Dashboard state
* Company-scoped domains
* Persistence
* Cross-domain navigation

The previous implementation has now been manually reviewed and is considered sufficiently stable to move forward.

**Do not redo the completed architecture unless you discover a genuine regression while implementing this phase.**

This phase is about moving Outreacher from:

> “A coherent career outreach workflow”

to:

> **“A product that actually helps the user understand why a company, opportunity, and person are worth pursuing, and then turns that understanding into a credible outreach message.”**

This is an important product phase.

Do not merely add cosmetic cards.

The new intelligence should visibly affect the user's decisions and downstream workflow.

---

# 1. PRODUCT PRINCIPLE

The core Outreacher loop is:

```text
Company
  ↓
Research
  ↓
Evidence
  ↓
Opportunity
  ↓
Person
  ↓
Reason
  ↓
Outreach
  ↓
Conversation
```

The product's differentiation is not:

> “AI writes cold emails.”

It is:

> **“Outreacher helps you understand why this company and this person are worth contacting, then helps you act on that understanding.”**

Every major screen introduced in this phase should reinforce that.

---

# 2. IMPORTANT IMPLEMENTATION RULE

This is a prototype.

Do not introduce:

* real scraping
* real search APIs
* real LinkedIn APIs
* real email provider APIs
* backend infrastructure
* external credentials
* unnecessary dependencies

Simulate research and intelligence using believable structured data and deterministic interactions.

However, the simulation must feel like a real product.

The user should experience:

```text
USER ACTION
→ SYSTEM PROCESSES
→ EVIDENCE APPEARS
→ PRODUCT EXPLAINS WHAT IT MEANS
→ USER DECIDES WHAT TO DO
```

Do not make the intelligence layer a collection of fake paragraphs.

---

# 3. AUDIT THE EXISTING RESEARCH DOMAIN FIRST

Inspect the existing:

* ResearchTab
* Research page/domain
* company research state
* evidence structures
* company workspace
* opportunity structures
* workspaceStore
* demo data

Do not create a second research model if one already exists.

Determine what already exists for:

```text
Research status
Evidence
Research sources
Company signals
Opportunity evidence
Research timestamps
```

Extend the existing structures where possible.

---

# 4. RESEARCH LIFECYCLE

Research should have a visible lifecycle:

```text
NOT_STARTED
    ↓
IN_PROGRESS
    ↓
COMPLETE
```

Potential failure state:

```text
FAILED
```

if useful.

The company workspace should visibly communicate the current research state.

---

# 4.1 NOT STARTED

When a company has not been researched:

Show:

```text
Research this company

Understand what the company does, what they're building,
where your background fits, and whether there is a credible
reason to start a conversation.
```

Primary CTA:

**Research company**

Do not immediately show fabricated intelligence.

---

# 4.2 IN PROGRESS

When the user clicks Research:

Show a believable processing state.

For example:

```text
Researching Acme

✓ Company profile
✓ Product / business context
● Recent signals
○ Hiring signals
○ Team context
```

Use a short simulated progression.

Do not require the user to sit through a long animation.

---

# 4.3 COMPLETE

After research completes, show structured evidence.

The page should not become a generic AI summary.

Organize evidence into useful categories.

Suggested categories:

```text
Company Overview
What they're building
Recent signals
Hiring signals
Team / organization
Technology / engineering signals
Market / business signals
```

Only show categories supported by the simulated evidence.

---

# 5. EVIDENCE MODEL

Evidence should be structured.

Conceptually:

```ts
Evidence {
  id
  type
  title
  summary
  sourceLabel?
  sourceUrl?
  observedAt?
  relevance?
}
```

Adapt to the existing model.

Do not duplicate evidence models.

---

# 5.1 Evidence cards

Each evidence item should communicate:

### What happened?

Example:

> Acme expanded its payments infrastructure team.

### Why it matters?

Example:

> This suggests continued investment in backend systems that overlap with your infrastructure experience.

### Source

Example:

> Company careers page

### Optional source action

**View source**

Since this is a prototype, the source can be simulated.

Do not use arbitrary fake URLs that look real unless the project already uses known demo URLs.

---

# 5.2 Evidence confidence

Where appropriate, distinguish:

```text
Strong signal
Moderate signal
Weak signal
```

Do not present speculative information as fact.

For simulated evidence, make the product language appropriately careful.

For example:

> “This may indicate…”

rather than:

> “They definitely need…”

---

# 6. RESEARCH SHOULD CONNECT TO CAREER PROFILE

This is critical.

The research experience should use the user's persisted career profile:

```text
Professional Headline
Background & Positioning
Experience Highlights
Target Industries
Target Locations
```

Do not actually call an AI model.

Instead, simulate matching logic.

Example:

```text
Your profile:
Backend architecture
Fintech
PostgreSQL
High-throughput systems

Company signals:
Payments infrastructure
PostgreSQL
Distributed systems

Match:
Strong
```

The UI should make it obvious that the user's own profile influences the analysis.

---

# 7. PROFILE ↔ COMPANY MATCHING

Add a useful section such as:

**Why this company may fit you**

Show 2–4 concrete matches.

Example:

```text
Backend architecture
Matches your positioning

Fintech
Matches your target industry

Payments infrastructure
Matches your domain experience
```

Avoid a meaningless percentage score unless there is a clear explanation of how it is derived.

Prefer:

```text
Strong match
Relevant
Potential match
Limited evidence
```

with supporting reasons.

---

# 8. OPPORTUNITY REASONING

Now connect Research to Opportunities.

The product already distinguishes:

```text
CONFIRMED
PROACTIVE
UNCLASSIFIED
```

Preserve these states.

Do not weaken their definitions.

---

# 8.1 CONFIRMED

A CONFIRMED opportunity requires actual evidence of a relevant opening.

Show:

```text
CONFIRMED

Relevant opening detected

Why it qualifies
• Role
• Team
• Evidence
• Timing
```

Include the relevant evidence.

Do not label an opportunity CONFIRMED merely because the company seems like a fit.

---

# 8.2 PROACTIVE

A PROACTIVE opportunity means:

> No relevant opening has been confirmed, but there is enough company-fit and evidence to justify relationship-building.

Show:

```text
PROACTIVE

No confirmed opening

But there are credible reasons to start a conversation.
```

Then show the reasons.

For example:

```text
• Your background aligns with their current infrastructure direction
• Recent engineering investment suggests relevant activity
• You have a plausible contact to approach
```

These should derive from simulated persisted data.

---

# 8.3 UNCLASSIFIED

If evidence is insufficient:

```text
UNCLASSIFIED

Not enough evidence yet.

Research the company further before deciding whether
there is a meaningful opportunity.
```

CTA:

**Research company**

or:

**Review evidence**

---

# 9. OPPORTUNITY DETAIL

Opportunity detail should answer five questions:

```text
What is happening?
Why does it matter?
Why might this company fit me?
Why now?
What should I do next?
```

Recommended hierarchy:

### Opportunity status

CONFIRMED / PROACTIVE / UNCLASSIFIED

### Evidence

What supports the classification?

### Why you

How does the user's career profile fit?

### Why now

What recent signal creates timing?

### Recommended next action

Examples:

```text
Research further
Find a relevant person
Prepare outreach
Review existing outreach
```

Do not automatically send anything.

---

# 10. CONTACT REASONING

Contacts already support company associations.

Now make the reasoning layer useful.

For each company-contact association, support:

```text
Why this person
Evidence
Conversation angle
```

These are not generic biography fields.

They should answer:

> Why should I contact this person about this company/opportunity?

---

# 10.1 Why this person

Example:

> Leads backend infrastructure, making them relevant to your positioning around high-throughput backend architecture.

---

# 10.2 Evidence

Example:

> Their team is hiring backend engineers and they appear to lead the infrastructure organization.

---

# 10.3 Conversation angle

Example:

> Ask about the infrastructure scaling challenges behind their current payments expansion.

These should feel like decision-support, not generic AI prose.

---

# 11. CONTACT DETAIL EXPERIENCE

Improve the existing Contact Detail page.

Hierarchy:

```text
Person identity
Company relationship
Role
Why this person
Evidence
Conversation angle
Timeline
Outreaches
Conversations
```

If the contact belongs to multiple companies, provide a clear company selector.

Changing the company context should change:

* title
* association evidence
* why this person
* conversation angle
* related outreach
* related conversations

Global person information remains global.

---

# 12. PREPARE OUTREACH SHOULD NOW USE INTELLIGENCE

The existing:

**Prepare outreach**

flow must become the natural culmination of the research/opportunity/contact reasoning.

When the user clicks:

```text
Prepare outreach
```

the workflow should know:

```text
User career profile
Company
Company research
Opportunity
Evidence
Contact
Contact association
Why this person
Conversation angle
```

Do not require the user to manually reconstruct all of this.

---

# 13. OUTREACH PREPARATION CONTEXT

Before showing the message editor, show a compact context summary:

### Company

Acme

### Opportunity

PROACTIVE

### Why this company

1–2 concise reasons.

### Why this person

1 concise reason.

### Conversation angle

1 concise angle.

### Relevant evidence

1–3 pieces.

Then:

**Draft outreach**

This reinforces the product's core value.

---

# 14. OUTREACH GENERATION

Do not make the generator produce generic:

> “I hope you're doing well…”

Instead, simulate evidence-backed generation.

Use:

```text
Career profile
+
Company evidence
+
Opportunity
+
Contact reasoning
+
Conversation angle
```

to generate the draft.

The generated message should contain:

1. relevant reason for contacting
2. company-specific context
3. credible candidate connection
4. low-pressure call to conversation

Do not make every message sound identical.

---

# 15. HUMAN REVIEW REMAINS CENTRAL

The user must be able to edit:

```text
Subject
Message
```

before sending.

Clearly communicate:

> AI-generated draft — review before sending.

Do not automatically send generated outreach.

---

# 16. EVIDENCE IN OUTREACH REVIEW

The review screen should allow the user to understand where the message came from.

Add a compact:

**Based on**

section:

```text
Company signal
Candidate profile
Contact context
Conversation angle
```

This does not need to expose chain-of-thought.

Only show the user-facing factual inputs and reasoning summaries.

---

# 17. OUTREACH QUALITY GUARDRAILS

Add lightweight prototype checks.

For example:

### Missing personalization

If message is too generic:

```text
This message doesn't mention a company-specific reason yet.
```

### Missing recipient context

```text
Add a clearer reason for contacting this person.
```

### Missing sender

```text
Select a sender account before sending.
```

These should guide the user, not block harmless editing.

---

# 18. FIRST OUTREACH JOURNEY

The most important acceptance flow of this phase:

```text
New user
↓
Skip onboarding
↓
Dashboard
↓
Complete career profile
↓
Add target company
↓
Research company
↓
Review evidence
↓
Opportunity becomes PROACTIVE or CONFIRMED
↓
Discover/add contact
↓
Review "Why this person"
↓
Prepare outreach
↓
Review evidence/context
↓
Generate draft
↓
Human edits
↓
Select sender
↓
Mark ready
↓
Send
↓
Outreach becomes SENT
↓
Conversation can begin when reply occurs
```

Every transition must be visible and believable.

---

# 19. DASHBOARD — MAKE IT ACTION-ORIENTED

The dashboard should answer:

> What should I do next?

Do not turn it into an analytics dashboard.

Recommended hierarchy:

## Needs your attention

Examples:

```text
Complete your career profile
Research Acme
Review a PROACTIVE opportunity
Prepare outreach to Jane
Reply to John
Follow up with Sarah
```

## Continue where you left off

Persist the most recent meaningful workflow.

Example:

> Continue researching Acme

or:

> Continue preparing outreach to Jane

## Opportunities

Show:

```text
CONFIRMED
PROACTIVE
UNCLASSIFIED
```

but keep the emphasis on action.

## Relationship activity

Show meaningful recent events:

```text
Outreach sent
Reply received
Conversation continued
Follow-up sent
Outcome recorded
```

Avoid vanity metrics.

---

# 20. NOTIFICATIONS / ATTENTION CENTER

If there is an existing notification implementation, audit it.

If not, introduce a lightweight attention model.

Examples:

```text
Career profile incomplete
Research completed
Opportunity requires review
Outreach ready
Reply received
Follow-up due
Sender account limit reached
```

Notifications should be actionable.

Clicking one should navigate to the relevant domain.

Do not create noisy notifications for every trivial state change.

---

# 21. GLOBAL SEARCH

Now that Research and Opportunity reasoning are becoming richer, ensure global search can surface:

```text
Companies
Contacts
Opportunities
Outreaches
Conversations
Campaigns
Templates
```

Search should find meaningful fields such as:

### Company

* name
* domain
* industry

### Contact

* name
* email
* role
* company

### Opportunity

* company
* status
* title
* evidence summary

### Outreach

* subject
* contact
* company
* message preview

### Conversation

* contact
* company
* latest message preview

---

# 22. COMPANY WORKSPACE INFORMATION ARCHITECTURE

The company workspace should now make the entire journey visible.

Recommended tabs:

```text
Overview
Research
Opportunities
Contacts
Outreach
Campaigns
Conversations
```

Do not allow the company page to become seven disconnected screens.

The tabs should tell a coherent story:

```text
Overview
  ↓
Research
  ↓
Opportunity
  ↓
Contacts
  ↓
Outreach
  ↓
Conversations
```

Campaigns remain a parallel sending mechanism.

---

# 23. COMPANY OVERVIEW

Improve the overview hierarchy.

At the top:

```text
Company identity
Industry
Location
Domain
Status
```

Then:

### Current opportunity state

```text
CONFIRMED / PROACTIVE / UNCLASSIFIED
```

### Research status

```text
Not researched / Researching / Researched
```

### Recommended next action

A single primary CTA.

Examples:

```text
Research company
Review opportunity
Find relevant people
Prepare outreach
Continue conversation
```

The CTA should be derived from actual state.

---

# 24. DO NOT INVENT INTELLIGENCE SILENTLY

If a user has not researched a company, do not show fabricated research.

If no opportunity evidence exists, do not show a confident opportunity.

If no contact reasoning exists, do not pretend it was researched.

Use explicit states:

```text
Not researched
Insufficient evidence
Needs review
```

This is essential to Outreacher's credibility.

---

# 25. SAMPLE DATA

Existing sample/demo workspace can be enhanced to demonstrate this experience.

If demo data is used, make it internally coherent.

For example:

```text
Company
  ↓
Research
  ↓
Evidence
  ↓
Opportunity
  ↓
Contact
  ↓
Why this person
  ↓
Outreach
  ↓
Conversation
```

Do not create disconnected fake records.

A sample company should have matching:

* research
* evidence
* opportunity
* contacts
* outreach
* conversation

where appropriate.

---

# 26. RESPONSIVE UX

All new intelligence experiences must work on:

### Desktop

Use the full two-column or contextual layout where appropriate.

### Tablet

Collapse secondary information into drawers/cards.

### Mobile

Prioritize:

1. company/status
2. next action
3. evidence
4. reasoning
5. details

Do not place huge evidence tables on mobile.

Use stacked cards.

---

# 27. ACCESSIBILITY

Maintain WCAG 2.2 AA intent.

Ensure:

* keyboard navigation
* visible focus
* semantic headings
* labeled controls
* accessible tabs
* accessible status indicators
* modal focus handling
* sufficient contrast
* non-color status communication

Do not make reasoning cards interactive unless they actually need to be.

---

# 28. EMPTY / PARTIAL / COMPLETE STATES

Research:

```text
Not researched
Researching
Research complete
```

Opportunity:

```text
No opportunity yet
Unclassified
Proactive
Confirmed
```

Contact reasoning:

```text
Reasoning unavailable
Reasoning available
```

Outreach:

```text
No draft
Draft
Ready
Sent
```

Conversation:

```text
No conversation
Reply received
Active
Stopped
```

The UI should clearly communicate these states.

---

# 29. IMPORTANT STATE RULES

Preserve all existing lifecycle invariants.

Especially:

```text
REPLIED does not automatically become ACTIVE
```

and:

```text
STOPPED remains terminal
```

Also:

```text
ARCHIVED company
```

must not lose historical records.

Do not allow accidental new outbound activity against archived companies.

---

# 30. DO NOT REPLACE THE EXISTING DOMAIN ARCHITECTURE

You are extending the existing implementation.

Before creating anything new:

1. search for an existing model
2. search for an existing helper
3. search for an existing component
4. search for an existing state transition
5. extend it if appropriate

Avoid duplicate concepts such as:

```text
ResearchData
ResearchResult
CompanyResearch
ResearchRecord
```

when one canonical model is sufficient.

---

# 31. IMPLEMENTATION ORDER

Follow this order:

### A. Research lifecycle

Research state + structured evidence.

### B. Career profile matching

Profile → company fit.

### C. Opportunity reasoning

Evidence → opportunity state.

### D. Contact reasoning

Company/opportunity → why this person.

### E. Outreach context

Company + opportunity + person → preparation context.

### F. Outreach generation

Context → editable message.

### G. Dashboard attention

Surface the next meaningful action.

### H. First-user-to-first-outreach journey

Connect everything.

### I. Responsive/accessibility pass

Review all affected screens.

### J. End-to-end QA

Actually perform the workflows.

---

# 32. END-TO-END ACCEPTANCE TESTS

## Test 1 — New user

```text
Signup
→ Skip onboarding
→ Dashboard
→ Complete profile
```

Verify the dashboard changes based on persisted state.

---

## Test 2 — Research

```text
Add company
→ Research
→ processing state
→ evidence appears
→ research status persists
```

Reload and verify research remains complete.

---

## Test 3 — Profile matching

```text
Career profile
+
Company research
→ company fit appears
```

Change the profile.

Verify the displayed matching context changes appropriately.

---

## Test 4 — Opportunity

```text
Research
→ evidence
→ opportunity classification
```

Verify:

* CONFIRMED requires relevant opening evidence
* PROACTIVE does not falsely claim an opening
* UNCLASSIFIED remains available when evidence is insufficient

---

## Test 5 — Contact reasoning

```text
Company
→ Contact
→ Why this person
→ Evidence
→ Conversation angle
```

Verify association-specific data changes correctly when switching companies for a multi-company person.

---

## Test 6 — Outreach

```text
Prepare outreach
→ context appears
→ generate draft
→ edit
→ save
→ mark ready
→ send
```

Verify the Outreach record persists.

---

## Test 7 — Conversation

```text
Sent outreach
→ simulated reply
→ conversation
→ REPLIED
→ explicit Continue
→ ACTIVE
```

Verify no automatic ACTIVE transition.

---

## Test 8 — Cross-domain navigation

Verify:

```text
Company
→ Opportunity
→ Contact
→ Outreach
→ Conversation
→ back to Company
```

No stale or incorrect IDs.

---

# 33. QUALITY BAR

Do not report completion simply because TypeScript passes.

For each feature verify:

```text
DATA MODEL
+
PERSISTENCE
+
UI
+
RELATIONSHIP
+
LIFECYCLE
+
NAVIGATION
```

The product should feel like one system.

The most important test is:

> Can a new user understand why they should contact this company, why they should contact this person, and what they should say?

If the answer is not obvious from the UI, continue improving the experience.

---

# 34. FINAL RESPONSE

When finished, report:

## Implemented

Concrete features actually completed.

## Intelligence Layer

Explain how:

```text
Career Profile
→ Company Research
→ Evidence
→ Opportunity
→ Contact Reasoning
→ Outreach
```

is now connected.

## First Outreach Journey

Explain the actual implemented flow.

## Additional Issues Found

List additional problems discovered and fixed.

## Remaining Limitations

Only genuine limitations.

## Validation

Report:

* TypeScript/build
* persistence/reload checks
* research flow
* opportunity flow
* contact reasoning
* outreach flow
* conversation transition
* responsive checks
* accessibility checks

Do not claim a flow was tested if it was only inspected in code.

**Implement the work. Do not stop at planning or analysis.**

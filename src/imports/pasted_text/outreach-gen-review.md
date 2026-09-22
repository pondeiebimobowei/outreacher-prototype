# OUTREACH GENERATION + HUMAN REVIEW

Implement the next major Outreacher product experience: **Outreach Generation + Human Review**.

This is a Figma Make prototype, not a production backend implementation.

The goal is to extend the existing company-first workflow:

**Company → Research → Opportunity → Contact → Outreach**

The user has already:

* added a company
* completed company research
* established an opportunity state
* discovered relevant contacts
* reviewed contact evidence
* selected a contact

Now the product should help the user turn that context into a **credible, evidence-backed outreach draft** that the user can review, edit, and explicitly approve.

Do not jump ahead to campaigns, sending, replies, follow-ups, or automation.

---

# 1. FIRST: UNDERSTAND THE EXISTING IMPLEMENTATION

Before changing code:

1. Inspect the existing repository structure.
2. Read the relevant approved experience specifications.
3. Inspect the existing:

   * workspace state/store
   * company workspace
   * Research tab
   * Opportunities tab
   * Contacts tab
   * Dashboard
   * Companies page
   * existing routing/navigation
   * existing design system/components
4. Identify the current persisted lifecycle state and reuse it.
5. Do not create a second competing workspace state system.
6. Do not replace existing working UX unnecessarily.

The existing implementation already established lifecycle persistence across:

**Research → Opportunity → Contacts**

Preserve that architecture.

If there is an existing Experience Authority document for outreach, use it.

If an outreach experience specification exists but is not APPROVED, do not invent a conflicting implementation. Inspect the existing governance and follow the established rules.

---

# 2. PRODUCT PRINCIPLE

Outreach is not simply an AI email generator.

The product's differentiator is:

> **Generate outreach from evidence, not generic personalization.**

The draft should visibly connect:

**Why this company → Why this opportunity → Why this person → Why contact them now**

The user should understand where the reasoning came from.

The product should feel like an intelligent career research and relationship tool, not a generic cold-email SaaS.

Avoid:

* sales jargon
* lead-generation language
* fake personalization
* spammy copy
* aggressive conversion language
* unnecessary analytics
* excessive configuration

This is career outreach.

---

# 3. USER JOURNEY

Implement this flow:

**Selected Contact**
↓
**Start Outreach**
↓
**Generate Draft**
↓
**Review Evidence / Reasoning**
↓
**Edit Message**
↓
**Approve Draft**
↓
**Ready to Create Campaign**

The final step should NOT actually create or send a campaign yet.

Instead, after approval, show a clear state indicating:

**Draft approved — ready for campaign creation**

Campaign creation belongs to a later milestone.

---

# 4. ENTRY POINT

The primary entry point should be from the selected contact experience.

After a contact has been selected, provide a strong primary action:

**Start outreach**

or equivalent wording consistent with the existing UI.

Do not make the user hunt for this action.

The selected contact card should already communicate:

* person
* role
* company
* why they were selected
* supporting evidence

The outreach action should naturally follow from this.

---

# 5. OUTREACH WORKSPACE

Create an outreach review experience that feels like a focused workspace rather than a generic modal.

Recommended structure:

### Header

Show:

**Outreach**

Then contextual information:

**[Contact Name]**
[Role] · [Company]

Example:

**Sarah Okafor**
Engineering Manager · Acme

Include a back/navigation affordance to return to the contact context.

---

# 6. TWO-PANEL DESKTOP EXPERIENCE

On desktop, use a two-column layout.

### LEFT: CONTEXT / EVIDENCE

This panel explains why the message is being generated.

Sections:

**Contact**

* Name
* Role
* Company

**Why this person**

Show the evidence/reason the user previously reviewed.

Example:

> Engineering leader working on the product area most relevant to your experience.

**Relevant company evidence**

Show the research evidence that supports the outreach.

Example:

> Acme is expanding its engineering organization.

**Opportunity**

Clearly show:

**PROACTIVE**

or

**CONFIRMED**

with the appropriate existing meaning.

Do not invent opportunity details.

If CONFIRMED, show the relevant evidence.

If PROACTIVE, explicitly communicate that there is no confirmed opening and the outreach is relationship-oriented.

The context panel should answer:

> "Why am I contacting this person?"

---

### RIGHT: MESSAGE

This is the main working area.

Show:

**Your message**

Then a message editor.

The editor should look like a polished professional email composer, not a plain textarea.

Include:

**Subject**

and

**Message**

The draft should be editable.

The user owns the final message.

---

# 7. GENERATION EXPERIENCE

When the user clicks:

**Generate outreach**

do not instantly replace the screen with finished text.

Show a believable generation state.

For example:

**Building your outreach**

Then visually communicate stages such as:

✓ Reviewing company research
✓ Checking opportunity context
✓ Connecting contact evidence
◌ Drafting message

Keep this short and believable.

After generation:

**Draft ready for review**

Do not use fake long-running AI animations.

The prototype should feel responsive.

---

# 8. GENERATED MESSAGE

The generated message should be:

* concise
* professional
* human
* specific
* evidence-backed
* appropriate for a career conversation
* respectful of the recipient's time

Avoid generic statements such as:

> "I came across your impressive profile..."

Avoid exaggerated compliments.

Avoid:

> "I would love to pick your brain."

Avoid overly transactional:

> "Are you hiring?"

The message should establish a credible reason for reaching out.

For example, structurally:

1. Brief introduction
2. Specific company/opportunity observation
3. Why the recipient is relevant
4. Why the sender's background connects
5. Low-pressure conversational ask

Do not hard-code one generic message for every company/contact.

Use the existing company/contact/research state to make the prototype contextually believable.

---

# 9. EVIDENCE TRACEABILITY

This is one of the most important parts of this milestone.

The user should be able to understand what informed the generated message.

Add an interaction such as:

**Why this message?**

When opened, show the evidence used to construct the draft.

For example:

### Message reasoning

**Company signal**

> Engineering hiring activity suggests continued investment in the product organization.

Source:
[existing research source]

**Contact relevance**

> Engineering Manager responsible for the area most closely related to your experience.

Source:
[existing contact evidence]

**Opportunity context**

> PROACTIVE — no confirmed opening found.

This should make the product's core promise visible:

**The message is based on research and evidence, not generic personalization.**

Do not expose hidden chain-of-thought or internal model reasoning.

Show concise, user-facing evidence and rationale only.

---

# 10. SUBJECT LINE

Generate a concise professional subject.

Avoid:

* clickbait
* excessive personalization
* emojis
* "Quick question!!!"
* sales-style subject lines

Examples of acceptable patterns:

**Exploring engineering opportunities at Acme**

**Interested in Acme's engineering work**

**Connecting about engineering at Acme**

The actual prototype should adapt the subject to the available company/contact context.

---

# 11. HUMAN EDITING

The user must be able to edit:

* subject
* entire message

The editing experience should feel first-class.

Do not make the generated message feel immutable.

The product should communicate:

> AI generated the starting point. You decide what gets sent.

Useful controls can include:

**Regenerate**

and

**Reset to generated draft**

Do not overpopulate the interface with AI controls.

---

# 12. DRAFT STATES

Implement explicit lifecycle states.

At minimum:

### NOT_STARTED

User has selected a contact but has not started outreach.

CTA:

**Start outreach**

---

### GENERATING

Generation is occurring.

Show the generation state.

---

### DRAFT

A generated draft exists.

Show:

**Draft ready for review**

Primary action:

**Approve draft**

Secondary actions:

**Regenerate**

---

### EDITING

The user is modifying the message.

Keep the draft visible.

Primary action:

**Approve draft**

---

### APPROVED

The user explicitly approved the draft.

Show strong confirmation:

**Draft approved**

Then:

> This outreach is ready for campaign creation.

Primary action can be:

**Back to contact**

or another action appropriate to the current product architecture.

Do NOT create a campaign.

Do NOT send an email.

---

# 13. PERSISTENCE

This must integrate with the existing workspace persistence architecture.

Do not use temporary React state as the only source of truth for important lifecycle state.

Persist the outreach lifecycle.

At minimum, the workspace/company entry should be able to reconstruct:

* outreach stage
* selected contact
* generated/edited subject
* generated/edited message
* approval state

If the existing architecture uses a different model, extend it rather than introducing a parallel store.

The required invariant is:

**USER ACTION**
→
**PERSISTED WORKSPACE UPDATE**
→
**NAVIGATION / REMOUNT**
→
**UI RECONSTRUCTS FROM PERSISTED STATE**

Test this explicitly.

---

# 14. IMPORTANT PERSISTENCE TESTS

Verify these flows:

### Test A — Draft persistence

1. Select contact.
2. Start outreach.
3. Generate draft.
4. Navigate away.
5. Return to the company.
6. Open the selected contact/outreach.
7. Draft should still exist.

---

### Test B — Edited message persistence

1. Generate draft.
2. Edit subject.
3. Edit message.
4. Navigate away.
5. Return.
6. Edits should still exist.

---

### Test C — Approval persistence

1. Generate draft.
2. Approve draft.
3. Navigate away.
4. Return.
5. Outreach should still display APPROVED.

---

### Test D — Company isolation

Create/select Company A and Company B.

Outreach state from Company A must never appear under Company B.

---

### Test E — Contact isolation

If multiple contacts exist for a company, outreach state must remain associated with the correct selected contact.

Do not allow one person's draft to appear under another person's contact.

---

# 15. IMPORTANT PRODUCT RULE

Do not let the user generate outreach before the necessary context exists.

Required prerequisites:

**Research COMPLETE**

and

**Opportunity classified**

and

**Contact SELECTED**

If any prerequisite is missing, do not expose a misleading Generate action.

Instead explain what is required.

Examples:

> Complete company research before generating outreach.

> Establish an opportunity state before generating outreach.

> Select a contact before generating outreach.

Use the existing lifecycle state rather than duplicating these conditions.

---

# 16. OPPORTUNITY-SPECIFIC UX

The message should behave differently depending on opportunity state.

### CONFIRMED

The outreach can reference the confirmed opportunity evidence.

The UI should clearly indicate:

**CONFIRMED OPPORTUNITY**

and show the supporting evidence.

The user should be able to see why the opportunity is considered confirmed.

---

### PROACTIVE

Do NOT imply there is an open position.

Clearly communicate:

**PROACTIVE OUTREACH**

Supporting explanation:

> No relevant opening has been confirmed. This message is focused on starting a relationship based on the company's work and your relevant experience.

The generated message should therefore be relationship-oriented rather than pretending there is an opening.

---

### UNCLASSIFIED

Outreach generation should remain blocked.

Show:

> Establish an opportunity state before generating outreach.

Primary CTA:

**Review opportunity**

---

# 17. APPROVAL SAFETY

Approval is a meaningful user action.

Do not automatically approve generated content.

Do not automatically send.

Do not silently create campaigns.

The user must explicitly click:

**Approve draft**

After approval, clearly show that the draft is ready for the next workflow step.

---

# 18. DASHBOARD INTEGRATION

Once an outreach draft exists, the dashboard should be able to reflect that state.

Do not create a completely separate dashboard system.

Use the same workspace state.

Examples:

Before:

**Continue where you left off**

> Review contact evidence at Acme

After generating:

**Continue where you left off**

> Review your outreach to Sarah at Acme

After approval:

**Continue where you left off**

> Outreach approved for Sarah at Acme

Keep the dashboard action-oriented.

Do not add vanity metrics.

---

# 19. COMPANY WORKSPACE INTEGRATION

The Company Workspace should reflect the outreach lifecycle.

The workflow should visually communicate progress:

**Research ✓**
→
**Opportunity ✓**
→
**Contacts ✓**
→
**Outreach**

Once outreach exists, the company workspace should make it discoverable.

Do not redesign the entire Company Workspace.

Make the smallest coherent changes necessary.

---

# 20. DESIGN LANGUAGE

Stay consistent with the existing Outreacher visual system.

Reference principles already established:

* Linear-level restraint
* Attio-style relationship context
* Apollo-like contact mechanics without sales-heavy density
* strong typography hierarchy
* generous but purposeful spacing
* subtle borders
* restrained surfaces
* clear primary actions
* excellent empty/loading/error/success states
* keyboard accessibility
* WCAG 2.2 AA

Do not introduce a new visual language.

Do not turn the page into a dashboard full of cards.

The message itself should be the visual focus.

---

# 21. RESPONSIVE BEHAVIOR

The desktop two-panel layout must adapt intentionally.

### Desktop

Two columns:

**Evidence / Context | Message**

Both should be usable without excessive scrolling.

---

### Tablet

Use a stacked or adaptive layout.

The evidence/context section can appear above the message editor.

Do not squeeze both panels into unusable widths.

---

### Mobile

Use a single-column experience.

Recommended order:

1. Header/contact context
2. Opportunity state
3. Evidence
4. Message editor
5. Actions

The editor should have comfortable touch targets.

The primary action should remain easy to reach.

Do not force desktop navigation or two-column composition onto mobile.

Respect the existing mobile shell.

---

# 22. ACCESSIBILITY

Meet the existing UX accessibility standard.

Ensure:

* keyboard-accessible controls
* visible focus states
* semantic headings
* properly labelled inputs
* accessible text editor
* sufficient contrast
* no color-only status communication
* loading state announced appropriately
* disabled states explained where necessary
* confirmation state clearly communicated

Do not sacrifice accessibility for visual polish.

---

# 23. DO NOT BUILD THESE YET

Explicitly do NOT implement:

* campaign creation
* email sending
* SMTP
* Resend
* email provider configuration
* follow-ups
* reply handling
* inbox
* tracking
* open tracking
* click tracking
* scheduling
* automation
* background jobs
* analytics
* billing
* production AI APIs

These belong to later milestones.

For this milestone, simulate generation locally using deterministic/contextual prototype data.

---

# 24. DO NOT BREAK EXISTING WORK

Do not regress:

* authentication/onboarding
* career profile
* dashboard
* companies
* company workspace
* research
* opportunities
* contacts
* evidence
* existing lifecycle persistence
* responsive behavior

If an existing component already handles a requirement, reuse it.

---

# 25. ARCHITECTURE RULES

Before implementing, identify whether outreach state already exists.

If it does:

* extend it carefully.

If it does not:

* add the smallest coherent extension to the existing workspace lifecycle model.

Do NOT create:

* `outreachStore`
* duplicate localStorage keys
* independent contact state
* independent company state
* a second lifecycle model

The workspace store remains the source of truth.

Avoid unnecessary abstractions.

---

# 26. REALISTIC PROTOTYPE DATA

Use deterministic contextual data so the experience feels believable.

The generated message should vary based on:

* company
* opportunity state
* research evidence
* selected contact
* user's career profile

Do not use the same exact generic message for every contact.

However, do not fabricate claims that the existing research/contact state does not support.

If the available prototype data is limited, use conservative language.

Evidence must never be invented simply to make the message sound personalized.

---

# 27. UX DETAILS THAT MATTER

Pay special attention to:

### Before generation

The user should understand:

* who they are contacting
* why they are contacting them
* what evidence supports it
* what will happen when they generate

### During generation

The interface should communicate progress without unnecessary theatrics.

### After generation

The user should immediately understand:

* this is a draft
* what evidence informed it
* they can edit it
* nothing has been sent

### After approval

The user should clearly understand:

* approval is complete
* nothing has been sent yet
* the next step is campaign creation

This distinction is important.

---

# 28. INTERACTION QUALITY

Implement believable prototype interactions.

Examples:

* Start outreach → workspace opens
* Generate → generation state → draft appears
* Regenerate → new contextual draft
* Edit → changes remain visible
* Why this message → evidence panel expands/collapses
* Approve → confirmation state
* Back → previous company/contact context
* Navigate away → state remains
* Return → state reconstructs

Do not create dead buttons.

Every visible action should either work or be intentionally disabled with an explanation.

---

# 29. VERIFICATION / HARDENING

After implementation, perform a state-flow audit.

Verify:

**Company**
→ Research COMPLETE
→ Opportunity classified
→ Contact discovered
→ Contact selected
→ Start outreach
→ Draft generated
→ Draft edited
→ Draft approved

Then verify persistence across:

* tab changes
* route changes
* returning to company
* browser refresh
* switching between companies
* switching between contacts

Also verify that there is no competing lifecycle state hidden in individual components.

Search for:

* local `useState` lifecycle variables
* hardcoded `hasResearch`
* hardcoded opportunity status
* hardcoded contact selection
* hardcoded outreach status
* duplicate localStorage keys

Fix problems found.

Do not merely report them.

---

# 30. FINAL QUALITY BAR

The resulting experience should make the user feel:

> "I researched this company, understood the opportunity, found the right person, and now Outreacher is helping me turn that evidence into a thoughtful message."

It should NOT feel like:

> "I clicked an AI email generator."

The core product loop is:

**Evidence → Reasoning → Person → Message → Human approval**

Build this as a coherent continuation of the existing product, not as an isolated email composer.

---

# FINAL REPORT

After implementation, provide a concise report containing:

1. Files changed
2. New/modified routes or components
3. Outreach lifecycle implemented
4. Persistence behavior verified
5. Research → Opportunity → Contacts → Outreach flow verified
6. Responsive behavior verified
7. Accessibility considerations addressed
8. Any remaining limitations
9. Explicit confirmation that campaign creation and sending were NOT implemented

If you discover a bug during verification, fix it before reporting completion.

Do not stop at "implemented."

The requirement is:

**implemented + integrated + state-persistent + verified.**

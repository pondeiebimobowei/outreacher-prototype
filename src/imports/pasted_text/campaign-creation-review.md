# CAMPAIGN CREATION + PRE-SEND REVIEW

Implement the next major Outreacher product experience:

**Campaign Creation + Pre-Send Review**

This is a Figma Make prototype, not a production email-sending implementation.

The existing product flow is:

**Company → Research → Opportunity → Contacts → Evidence → Outreach → Human Approval**

The next step is:

**Approved Outreach → Campaign → Pre-Send Review**

The user should be able to take an approved outreach draft and intentionally prepare it for sending.

**Do NOT send any email in this milestone.**

---

# 1. FIRST: UNDERSTAND THE EXISTING IMPLEMENTATION

Before changing code:

1. Inspect the existing repository.
2. Read the relevant approved Experience Contracts.
3. Inspect:

   * `workspaceStore`
   * Company Workspace
   * Research
   * Opportunities
   * Contacts
   * Outreach
   * Dashboard
   * routing/navigation
   * existing design system/components
4. Understand how `READY` outreach is currently represented.
5. Reuse the existing workspace lifecycle architecture.
6. Do not create a second persistence system.
7. Do not replace working UI unnecessarily.

The current prototype has already implemented:

**Research → Opportunity → Contacts → Outreach**

Do not regress any of those experiences.

---

# 2. PRODUCT PRINCIPLE

A campaign is not simply an email with a Send button.

The purpose of the campaign step is to make the user's intended outreach explicit before anything can eventually be sent.

The user should understand:

* who will receive the message
* why they are receiving it
* what message will be sent
* what company/opportunity it belongs to
* whether the outreach is CONFIRMED or PROACTIVE
* what will happen next

The product should communicate:

> **You are preparing this outreach for sending. Nothing has been sent yet.**

Avoid making the interface feel like a sales automation platform.

This is career outreach.

---

# 3. ENTRY POINT

The primary entry point comes from an approved outreach.

When the user reaches:

**Outreach → READY**

show a primary action such as:

**Create campaign**

The action should be available only when the outreach has been approved.

Do not allow campaign creation from:

* NOT_STARTED
* GENERATING
* DRAFT

If the user has not approved the outreach, explain:

> Approve your outreach draft before creating a campaign.

---

# 4. CAMPAIGN CONCEPT

For this prototype, keep the campaign model intentionally simple.

A campaign represents an intentional sending container around one or more prepared outreach messages.

However, do not build bulk campaign functionality yet.

The first version should support the simplest believable case:

**1 approved outreach → 1 campaign**

This gives us a clean foundation for later multi-contact campaigns without prematurely introducing complexity.

---

# 5. CAMPAIGN CREATION FLOW

Implement:

**Approved Outreach**
↓
**Create Campaign**
↓
**Campaign Setup**
↓
**Pre-Send Review**
↓
**Ready to Send**

The final state must NOT send anything.

---

# 6. CAMPAIGN SETUP

Create a focused campaign setup experience.

Header:

**Create campaign**

Supporting context:

**[Contact Name]**
[Role] · [Company]

The user should be able to define:

### Campaign name

Provide a sensible default.

For example:

> Outreach to Sarah at Acme

Allow editing.

Do not force the user to invent a name before continuing.

---

# 7. CAMPAIGN SUMMARY

Show a clear summary of what is being prepared.

For example:

### Recipient

Sarah Okafor
Engineering Manager
Acme

### Opportunity

**CONFIRMED**

or

**PROACTIVE**

Use the existing opportunity state.

Do not invent an opening.

### Outreach

Subject:

> Interested in Acme's engineering work

Message:

Show the approved message.

The user should be able to inspect it.

---

# 8. DO NOT DUPLICATE MESSAGE EDITING

The campaign step is not another outreach editor.

The approved outreach is the source content.

If the user wants to change the message, provide an explicit action:

**Edit outreach**

which returns them to the Outreach experience.

Do not create a second independent copy of the message that can silently diverge.

This is important.

The campaign should reference the approved outreach state.

---

# 9. CAMPAIGN STATE

Extend the existing lifecycle model carefully.

The campaign lifecycle should include at minimum:

### NOT_CREATED

No campaign exists.

CTA:

**Create campaign**

---

### SETUP

Campaign creation has started.

The user is configuring/reviewing campaign information.

---

### READY

Campaign has been created and reviewed.

Display:

**Ready to send**

But make it extremely clear:

> Nothing has been sent.

Do not show the campaign as SENT.

---

### SENT

Do not implement actual sending.

If the existing demo workspace already contains SENT data, preserve its existing behavior.

Do not change existing demo states simply to fit this milestone.

---

# 10. PERSISTENCE

Campaign state must use the existing workspace persistence architecture.

Do not introduce another localStorage key or independent campaign store.

Persist enough state to reconstruct:

* campaign existence
* campaign name
* associated outreach
* associated company
* associated contact
* campaign status

The invariant is:

**USER ACTION**
→
**PERSISTED WORKSPACE UPDATE**
→
**NAVIGATION / REMOUNT**
→
**CORRECT CAMPAIGN STATE**

---

# 11. PERSISTENCE TESTS

Explicitly verify:

### Test A — Campaign creation

1. Start with READY outreach.
2. Click Create campaign.
3. Enter/accept campaign name.
4. Create campaign.
5. Navigate away.
6. Return.
7. Campaign should still exist.

---

### Test B — Browser refresh

1. Create campaign.
2. Refresh browser.
3. Return to company.
4. Campaign should still be present and READY.

---

### Test C — Company isolation

Company A campaign must never appear under Company B.

---

### Test D — Contact isolation

A campaign for Contact A must never appear under Contact B.

---

### Test E — Outreach relationship

Campaign must remain associated with the correct approved outreach.

Do not allow another outreach draft to silently replace the campaign's content.

---

# 12. PRE-SEND REVIEW

This is the most important screen in this milestone.

Create a clear review surface:

# Ready to send

Then show:

### Recipient

Name
Role
Company
Email/address if the prototype already has one available.

Do not invent email addresses if none exist.

---

### Opportunity

Show:

**CONFIRMED**

or

**PROACTIVE**

with the relevant explanation.

---

### Why this person

Reuse the evidence already established in Contacts.

---

### Message

Show:

Subject

Message body

This should be a faithful representation of the approved outreach.

---

### Campaign

Campaign name

---

# 13. SEND BOUNDARY

The prototype must make the boundary between preparation and sending obvious.

Use language such as:

> **Nothing has been sent yet.**

The primary action should NOT actually send.

If you need a button representing the future action, use:

**Send when ready**

or

**Send**

but it must be disabled or clearly marked as coming later.

Prefer an explicit disabled state such as:

**Send — coming next**

with supporting text:

> Email sending will be available in a later step.

Do not simulate a successful send.

Do not change the campaign to SENT.

---

# 14. CAMPAIGN CREATION CONFIRMATION

After creating the campaign, show a clear confirmation:

**Campaign created**

Supporting text:

> Your approved outreach is ready for final review. Nothing has been sent.

Primary action:

**Review campaign**

Secondary:

**Back to company**

Do not use celebratory UI that implies an email was delivered.

---

# 15. COMPANY WORKSPACE INTEGRATION

Update the Company Workspace minimally.

The workflow should now communicate:

**Research ✓**
→
**Opportunity ✓**
→
**Contacts ✓**
→
**Outreach ✓**
→
**Campaign**

Once a campaign exists, the company workspace should make it discoverable.

Possible display:

**Campaign**

> Outreach to Sarah at Acme
> Ready to send

Do not redesign the whole company workspace.

---

# 16. DASHBOARD INTEGRATION

The dashboard should derive campaign state from the same workspace source of truth.

Examples:

### Approved outreach

> Continue where you left off
> Create a campaign for Sarah at Acme

### Campaign created

> Continue where you left off
> Review your campaign to Sarah at Acme

### Ready to send

> Continue where you left off
> Review campaign before sending

Do not add vanity campaign metrics.

---

# 17. MULTI-CONTACT PREPARATION

Do not implement bulk sending.

But design the data relationship so that the prototype does not accidentally imply:

**one company = one contact = one campaign forever.**

The conceptual relationship should remain:

**Company**
→ potentially multiple contacts
→ each contact can have outreach
→ approved outreach can belong to a campaign

For this milestone, only instantiate the simplest case:

**one approved outreach → one campaign**

Do not build the multi-contact UI yet.

---

# 18. CAMPAIGN NAMING

Provide a useful default campaign name based on existing context.

For example:

> Outreach to Sarah at Acme

The name should update if appropriate context changes.

But once the user manually edits the campaign name, do not overwrite their custom name automatically.

Persist the user's custom name.

---

# 19. CAMPAIGN CONTENT INTEGRITY

The campaign should not invent or rewrite the approved message.

The relationship should be:

**Approved Outreach**
↓
**Campaign references approved outreach**

Not:

**Approved Outreach**
↓
copy message
↓
independent campaign message

This prevents the prototype from introducing inconsistent state.

If the user edits an approved outreach after a campaign exists, handle this explicitly.

Prefer:

> This campaign is based on an approved outreach draft.

If editing would invalidate the campaign's reviewed state, require the user to review it again.

Do not silently modify a READY campaign.

---

# 20. EDITING AFTER CAMPAIGN CREATION

If the user attempts to edit the underlying outreach after campaign creation:

Do not silently change the campaign.

Show a meaningful state such as:

> This campaign is based on an approved outreach. Editing the outreach will require another review before it can be sent.

Then provide:

**Edit outreach**

After editing:

**Campaign review required**

The campaign should no longer appear fully READY until the user reviews the updated content again.

If implementing this relationship becomes too complex for the current prototype architecture, use the simplest safe behavior:

**lock the reviewed campaign content and route the user back through explicit review.**

Do not allow hidden divergence.

---

# 21. RESPONSIVE DESIGN

### Desktop

Use a focused campaign workspace.

Recommended structure:

**Campaign context / setup**
+
**Review summary**

Avoid excessive dashboard density.

---

### Tablet

Stack sections naturally.

Maintain clear hierarchy.

Do not compress everything into tiny columns.

---

### Mobile

Single-column layout.

Recommended order:

1. Header
2. Campaign name
3. Recipient
4. Opportunity
5. Why this person
6. Message
7. Campaign status
8. Review action

Keep the primary action accessible.

Use touch-friendly controls.

Do not force desktop navigation onto mobile.

---

# 22. ACCESSIBILITY

Follow the existing Outreacher accessibility standard:

* keyboard navigation
* visible focus states
* semantic headings
* labelled inputs
* accessible buttons
* accessible disabled states
* sufficient contrast
* no color-only status communication
* appropriate success/status announcements
* WCAG 2.2 AA

---

# 23. DESIGN LANGUAGE

Continue the existing visual language.

Use:

* restrained surfaces
* strong typography
* subtle borders
* purposeful spacing
* clear hierarchy
* minimal decoration
* consistent status treatment

The campaign experience should feel like a natural continuation of the Outreach workspace.

Do not make it look like a generic email marketing platform.

---

# 24. PROTOTYPE DATA

Use deterministic local prototype data.

Do not introduce:

* real email provider APIs
* SMTP
* Resend
* Supabase
* production AI
* background jobs
* scheduling
* tracking

This milestone is still about experience and lifecycle behavior.

---

# 25. DO NOT BUILD THESE YET

Explicitly do NOT implement:

* actual email sending
* SMTP
* Resend
* SES
* email provider configuration
* scheduled sending
* follow-up sequences
* automated follow-ups
* reply handling
* inbox
* tracking
* open tracking
* click tracking
* analytics
* billing
* background workers
* production AI integrations

Those belong to later milestones.

---

# 26. STATE FLOW

The complete intended flow after this milestone should be:

**Research**
→ COMPLETE

**Opportunity**
→ CONFIRMED / PROACTIVE

**Contact**
→ SELECTED

**Outreach**
→ DRAFT
→ READY

**Campaign**
→ SETUP
→ READY

Nothing should become SENT.

---

# 27. STATE GATING

Campaign creation requires:

```text
Research = COMPLETE
Opportunity != UNCLASSIFIED
Contact = SELECTED
Outreach = READY
```

If any prerequisite is missing, block campaign creation.

Give the user a clear explanation and route them to the relevant previous step.

Examples:

> Complete research before creating a campaign.

> Establish an opportunity state before creating a campaign.

> Select a contact before creating a campaign.

> Approve your outreach before creating a campaign.

Do not duplicate lifecycle state inside the campaign component.

Derive these conditions from the existing workspace state.

---

# 28. NAVIGATION

Provide coherent navigation between:

**Campaign**
↔
**Outreach**
↔
**Contact**
↔
**Company**

Examples:

**Edit outreach**
→ Outreach

**View contact**
→ Contacts

**Back to company**
→ Company overview

Do not create dead-end screens.

---

# 29. VERIFICATION / HARDENING

After implementation, perform a complete lifecycle audit:

```text
Research COMPLETE
        ↓
Opportunity classified
        ↓
Contact selected
        ↓
Outreach generated
        ↓
Outreach edited
        ↓
Outreach approved
        ↓
Campaign created
        ↓
Campaign reviewed
        ↓
READY TO SEND
```

Verify across:

* tab navigation
* route navigation
* component remount
* browser refresh
* multiple companies
* multiple contacts
* editing
* approval
* campaign creation

Specifically search for:

* competing local lifecycle state
* duplicate localStorage keys
* hardcoded campaign state
* hardcoded outreach state
* campaign data stored only in React state
* message duplication that can silently diverge
* company/contact state leakage

If bugs are found:

**Fix them. Do not merely report them.**

---

# 30. FINAL QUALITY BAR

The user should finish this milestone feeling:

> “I have researched this company, identified the right person, written and approved a thoughtful message, and deliberately prepared it for sending.”

They should NOT feel:

> “The app sent something without me knowing.”

The critical boundary is:

**READY TO SEND ≠ SENT**

The campaign experience must reinforce that distinction everywhere.

---

# 31. FINAL REPORT

After implementation, provide:

1. Files changed
2. New/modified components
3. Campaign lifecycle implemented
4. Persistence behavior verified
5. Outreach → Campaign relationship verified
6. Company/contact isolation verified
7. Refresh/remount behavior verified
8. Responsive behavior verified
9. Accessibility considerations addressed
10. Remaining limitations
11. Explicit confirmation that:

* no email was sent
* no email provider was connected
* no scheduling was implemented
* no follow-up automation was implemented

Do not report completion merely because the TypeScript build passes.

The requirement is:

**implemented + integrated + persistent + lifecycle-safe + verified.**

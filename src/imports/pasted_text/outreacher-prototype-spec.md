We are continuing the Outreacher prototype.

This is a UI/UX prototype, not a production backend implementation. Prioritize believable user experience, visible state transitions, cross-screen consistency, and persistence of the prototype state. Use the existing architecture and visual language. Do not unnecessarily refactor unrelated areas.

IMPORTANT EXISTING PRODUCT PRINCIPLE:

Outreacher must feel like a real product where the user performs an action and the product remembers the result.

The prototype must NOT behave like a collection of independent screens.

A user's company workflow state must persist across:

* tab navigation
* route navigation
* leaving and returning to a company
* browser refresh

Use the existing localStorage-backed workspace state introduced previously. Do not create competing state stores for the same company lifecycle.

The single source of truth should be the persisted company workspace state.

==================================================
PART 1 — FIX RESEARCH PERSISTENCE + CROSS-SCREEN STATE
======================================================

There is currently a critical prototype bug:

User flow:

1. Open a company
2. Go to Research
3. Click "Start research"
4. Research completes
5. Click "Show results"
6. Research results appear correctly
7. Navigate to another company tab
8. Navigate back to Research

Current broken behavior:

* Research returns to the initial state
* Results disappear
* User has to research the company again

This must be fixed.

The research lifecycle must become genuinely persistent:

NOT_STARTED
→ IN_PROGRESS
→ COMPLETE

When research completes, persist BOTH:

1. The research lifecycle state
2. The actual research result/content

The persisted research result should include whatever the existing ResearchTab currently needs to render its completed state, including as applicable:

* research summary
* evidence
* evidence categories
* sources
* dates/recency
* relevance to profile
* opportunity signals
* research gaps
* next actions
* any other existing completed research content

Do not merely persist a boolean such as `researchComplete`.

Persist the actual result so the completed Research screen can be reconstructed after navigation or refresh.

The company workspace state should conceptually support something like:

researchStage:
NOT_STARTED | IN_PROGRESS | COMPLETE

researchResult:
null | persisted research result

researchCompletedAt:
optional timestamp

The exact implementation should follow the existing codebase rather than blindly copying this structure.

---

## RESEARCH STATE BEHAVIOR

NOT_STARTED:

Show the existing initial research experience.

When the user clicks "Start research":

* immediately persist IN_PROGRESS
* show the existing research progress/loading experience
* do not lose the state if the user navigates away during the process

IN_PROGRESS:

If the user leaves the Research tab while research is running and comes back:

* do NOT reset to NOT_STARTED
* resume/display the in-progress state
* if the prototype's simulated research process can safely resume, allow it to finish
* otherwise provide a believable continuation state

When research completes:

* persist COMPLETE
* persist the complete research result
* update the company's last activity
* update all derived workflow state

When the user clicks "Show results":

* display the persisted research result
* do not generate a temporary result that only exists in React component state

---

## NAVIGATION TEST

The following exact sequence must work:

Company
→ Research
→ Start research
→ Research completes
→ Show results
→ Overview
→ Opportunities
→ Contacts
→ Research

Research must still show:

RESEARCH COMPLETE

and the same research result.

Then:

Research
→ browser refresh
→ Research

The result must still exist.

Do NOT require another research action.

---

## COMPANY ISOLATION

Research state must belong to the individual company.

Example:

Company A:
Research COMPLETE

Company B:
Research NOT_STARTED

Navigating between them must preserve their independent states.

Researching Company A must never make Company B appear researched.

==================================================
PART 2 — PROPAGATE RESEARCH CHANGES THROUGH THE PRODUCT
=======================================================

The important product behavior is:

ONE USER ACTION
→ ONE WORKSPACE STATE UPDATE
→ ALL RELEVANT SCREENS REFLECT THAT UPDATE

When research transitions to COMPLETE, update the derived workflow everywhere.

Do not hardcode separate copies of the same state in different components.

---

## COMPANY OVERVIEW

After research completes:

Journey:

Research → COMPLETE

Opportunity should become the next relevant stage.

The overview should no longer behave as though research has not happened.

Its:

* stage indicator
* progress
* next action
* workflow label
* primary CTA

must derive from the persisted company state.

---

## OPPORTUNITIES

Research completion should unlock the opportunity workflow.

If opportunity is still UNCLASSIFIED:

Show the appropriate state explaining that research is now available for opportunity review/classification.

The Opportunities tab must not remain stuck in a pre-research state after Research is complete.

If the existing opportunity classification flow already works, preserve it.

Do not redesign the opportunity experience unnecessarily.

---

## CONTACTS

Research completion should also affect the Contacts gate.

Before research:

"Research this company first."

After research:

The user should be able to progress toward opportunity classification / contact discovery according to the existing product rules.

Do not allow the Contacts tab to read an outdated local React state while the workspace says research is complete.

---

## DASHBOARD

The dashboard should react to the same persisted state.

Example:

Before research:

Continue researching [Company]

After research completes:

Review the opportunity for [Company]

After opportunity classification:

Find relevant people at [Company]

After contact selection:

Prepare outreach to [Contact]

Do not create a separate hardcoded dashboard state machine disconnected from the workspace store.

==================================================
PART 3 — COMPLETE / HARDEN CONTACTS + EVIDENCE
==============================================

Now continue the Contacts + Evidence implementation from the previous task.

Contacts lifecycle:

NOT_DISCOVERED
→ DISCOVERING
→ DISCOVERED
→ SELECTED

The state must persist to the same company workspace state.

---

## CONTACT DISCOVERY

When the user clicks:

"Find relevant people"

persist:

DISCOVERING

The existing discovery animation should run.

If the user leaves and returns while discovery is happening:

* do not immediately reset to NOT_DISCOVERED
* show a believable in-progress state

When discovery completes:

persist:

DISCOVERED

and persist the discovered contacts.

The contacts must still exist after:

* changing tabs
* returning to the company
* browser refresh

---

## CONTACT REVIEW

Clicking a discovered contact should open the existing review experience.

The review should communicate:

* Why this person?
* Role relevance
* Opportunity connection
* Evidence
* Conversation angle
* Known vs inferred information

Maintain the distinction between:

KNOWN / EVIDENCED

and

INFERRED / NEEDS VALIDATION

Do not present inference as fact.

---

## EVIDENCE TRACEABILITY

Evidence must remain traceable:

CONTACT
→ REASON
→ EVIDENCE
→ SOURCE

Evidence shown in the contact review must correspond to the company's persisted research/evidence where appropriate.

Do not make the evidence feel like unrelated decorative text.

---

## CONTACT SELECTION

When the user selects a contact:

persist:

contactStage = SELECTED

persist the selected contact identity.

Then:

* show the selected state
* preserve the selected contact when navigating away
* preserve it after refresh
* update the company journey
* update the Overview
* update the Dashboard
* make Outreach the next logical stage

The user should not have to select the contact again after navigating away.

The "Prepare outreach" CTA should appear based on the persisted state.

==================================================
PART 4 — STATE DERIVATION RULES
===============================

Review the existing lifecycle model and make sure the UI is derived consistently.

Conceptually:

RESEARCH

NOT_STARTED
→ Research is the current next action

IN_PROGRESS
→ Research is active

COMPLETE
→ Research is complete
→ opportunity becomes available

OPPORTUNITY

UNCLASSIFIED + research incomplete
→ pending

UNCLASSIFIED + research complete
→ opportunity review becomes active

PROACTIVE / CONFIRMED
→ opportunity complete
→ contact discovery becomes available

CONTACTS

NOT_DISCOVERED
→ pending until prerequisite stages are satisfied

DISCOVERING
→ active

DISCOVERED
→ review/select contacts

SELECTED
→ contacts complete
→ outreach becomes active

OUTREACH

NOT_STARTED
→ pending until contact selected

DRAFT / READY / SENT
→ derive from the existing outreach implementation when it is built

CONVERSATION

NO_REPLY
→ pending

REPLIED / ACTIVE / STOPPED
→ derive from future conversation implementation

Do not implement future outreach/conversation functionality yet unless it is already present. Only ensure the current UI derives the correct next-stage state.

==================================================
PART 5 — PERSISTENCE ARCHITECTURE
=================================

Use the existing workspaceStore/localStorage architecture.

Do not introduce:

* a second localStorage key for research
* component-only research state
* component-only contact state
* duplicated company lifecycle state
* unrelated state machines inside individual tabs

The persisted workspace should remain the source of truth.

A useful conceptual company record is:

Company
├── identity
├── research
│   ├── stage
│   ├── result
│   └── completedAt
├── opportunity
│   └── status
├── contacts
│   ├── stage
│   ├── discoveredContacts
│   └── selectedContactId
├── outreach
│   └── stage
└── conversation
└── stage

Adapt this to the existing implementation rather than blindly restructuring everything.

The critical requirement is that the state needed to reconstruct the current UI is persisted.

==================================================
PART 6 — NEW USER EXPERIENCE
============================

Preserve the existing new-user principle:

A brand-new user should start with:

NO COMPANIES

The workspace should not silently contain mature fake companies.

The user should:

Add company
→ Research
→ See research persist
→ Review opportunity
→ Classify opportunity
→ Discover contacts
→ Review evidence
→ Select contact
→ Prepare outreach

The prototype should demonstrate that the product WORKS through user actions.

If sample/demo workspace exists, keep it explicitly separate and clearly labeled as sample/demo data.

Do not mix demo state into a normal new user's workspace.

==================================================
PART 7 — RESPONSIVE REQUIREMENT
===============================

Everything changed in this task must remain fully responsive.

Desktop:

* persistent sidebar
* fixed header
* scrolling main content

Tablet:

* adaptive/overlay navigation
* responsive content layout

Mobile:

* compact header/navigation
* single-column layouts where appropriate
* touch-friendly controls
* no horizontal overflow
* no clipped research evidence
* no broken contact cards
* review panels must work naturally on narrow screens

Research evidence and contact review are particularly important on mobile.

Do not simply shrink the desktop UI.

==================================================
PART 8 — VISUAL / UX CONSTRAINTS
================================

Preserve the existing Outreacher visual language.

Use the current design system and components where possible.

Do not redesign completed screens unnecessarily.

The priority is:

1. Correct state persistence
2. Cross-screen consistency
3. Believable lifecycle transitions
4. Clear user feedback
5. Responsive behavior
6. Visual polish

Avoid:

* unnecessary dashboards
* vanity metrics
* fake data that appears to belong to the user
* arbitrary scoring
* generic sales CRM patterns
* replacing evidence with vague AI summaries
* adding future features prematurely

The product should continue to feel like:

Linear's product discipline
+
Attio's relationship/company model
+
Apollo's prospecting mechanics
+
Outreacher's evidence-backed career reasoning

==================================================
PART 9 — VERIFICATION
=====================

Before considering this task complete, manually test the actual prototype.

TEST 1 — Research persistence

New company
→ Research
→ Start research
→ Complete
→ Show results
→ navigate away
→ return

Expected:
Research result still present.

TEST 2 — Browser persistence

Complete research
→ refresh browser

Expected:
Research remains COMPLETE and result remains available.

TEST 3 — Cross-tab propagation

Complete research
→ Overview
→ Opportunities
→ Contacts
→ Dashboard

Expected:
All surfaces reflect the updated research lifecycle.

TEST 4 — Company isolation

Company A research complete
Company B research not started

Expected:
States remain independent.

TEST 5 — Contact persistence

Research complete
→ opportunity classified
→ Find relevant people
→ discovery completes
→ select contact
→ navigate away
→ return

Expected:
Discovered contacts and selected contact remain.

TEST 6 — Refresh after contact selection

Select contact
→ refresh

Expected:
Selected contact remains selected.

TEST 7 — New user

Clear/reset prototype workspace or use a genuinely new workspace.

Expected:
No mature companies are silently present.

TEST 8 — Responsive

Check:

* desktop
* tablet
* mobile

for:

* Research
* Opportunities
* Contacts
* Contact review
* Overview
* Dashboard

Fix any obvious layout/interaction issues discovered during these tests.

==================================================
IMPORTANT IMPLEMENTATION RULE
=============================

Do not stop after making the Research screen visually appear persistent.

Trace the complete state transition.

The standard for this task is:

USER ACTION
→ PERSISTED WORKSPACE UPDATE
→ ROUTE/TAB CHANGE
→ UI RECONSTRUCTS FROM PERSISTED STATE

If navigating away and returning causes a state reset, the implementation is NOT complete.

At the end, report:

* files changed
* state model changes
* what is now persisted
* cross-screen behaviors verified
* any remaining known limitations

Do not implement Campaigns, Replies/Inbox, full Outreach generation, or Outcome recording yet.

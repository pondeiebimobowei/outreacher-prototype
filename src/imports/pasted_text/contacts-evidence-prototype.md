Build the next major Outreacher surface: **Contacts + Evidence** inside `/companies/:id`, while also changing the prototype architecture and UX behavior so the product feels like an application being used over time rather than a pre-populated mockup.

This is still a UI/UX prototype, not a production backend. Prioritize believable product behavior, state transitions, visual quality, and experience design over production-level data architecture.

Preserve the existing visual system, Company Workspace, Research, Opportunities, responsive behavior, navigation, and mobile layouts.

The core model remains:

**Company → Evidence → Opportunity → Person → Conversation**

---

# PART 1 — CONTACTS + EVIDENCE

Build the **Contacts** tab as the next stage after research and opportunity classification.

The page must answer:

**“Who is worth contacting at this company, why this person, and what evidence supports contacting them?”**

Do not make this a generic CRM contact directory.

Avoid:

* contact databases
* sales lead scores
* generic prospect rankings
* arbitrary “best contact” scores
* unnecessary CRM fields

## Contacts states

Support these states:

### 1. Research not complete

Explain:

**Contacts become useful once we have enough company evidence to know what team or problem matters.**

Show the reason contacts cannot yet be meaningfully discovered.

CTA:

**Continue research**

### 2. Research complete but opportunity not classified

Explain that contact discovery should follow opportunity evaluation.

CTA:

**Review opportunity**

### 3. Ready for contact discovery

Show:

**Find relevant people**

Primary CTA starts a believable prototype contact-discovery process.

Do not instantly populate the final contacts when this button is clicked.

Move through an `in progress` state first.

### 4. Contact discovery in progress

Show a lightweight research/discovery activity state such as:

* Looking for relevant teams
* Identifying likely roles
* Evaluating professional relevance
* Gathering supporting evidence

These are UI states only. Do not pretend to have real-time backend processing.

Then transition into the discovered-contact state.

### 5. Contacts discovered

Display a polished set of prototype contact cards.

Each contact should include:

* Name
* Role/title
* Team/function
* LinkedIn or professional profile affordance
* Why this person may be relevant
* Evidence supporting relevance
* Source/recency where appropriate
* Relationship/context information where available
* Clear action: **Review**

Do not use numerical scores.

---

# CONTACT REVIEW

Clicking a contact should open a review experience.

The review view should answer:

**Why this person?**

Show:

### Role relevance

Why their current role connects to the opportunity.

### Opportunity connection

Which company opportunity or research finding makes them relevant.

### Evidence

Show the specific evidence supporting the contact selection.

### Conversation angle

Give a concise, evidence-backed reason this person could be approached.

### Known / Unknown

Clearly distinguish known information from inference.

For example:

**Known**
“Leads platform infrastructure at the company.”

**Potentially relevant because**
“Your target role and the identified infrastructure opportunity overlap with this team's area.”

Do not present inferred information as fact.

---

# CONTACT SELECTION

Allow the user to select a contact.

Selecting a contact should visibly change the company workflow:

**Contacts → Outreach**

Show a clear success state such as:

**Contact selected**

Then provide:

**Prepare outreach**

The selected contact should remain selected when the user switches between tabs.

---

# EVIDENCE ACCESSIBILITY

Evidence should not disappear once the user reaches Contacts.

Every important contact recommendation should be traceable to evidence.

Create a lightweight evidence panel/section that connects:

**Contact → Reason → Evidence → Source**

Provide navigation back to the relevant Research evidence.

Do not duplicate giant research blocks.

---

# PART 2 — STOP PRE-POPULATING THE ENTIRE PRODUCT

This is critical.

The prototype should NOT open looking like a mature account where:

* seven companies already exist
* several companies are researched
* contacts are already discovered
* campaigns are already running
* messages were already sent
* replies already exist

That makes the application look static rather than functional.

Instead, design the prototype around realistic user progression.

## NEW USER EXPERIENCE

A new user should begin with little or no company data.

After onboarding/profile completion:

Dashboard should communicate:

**You haven't started pursuing a company yet.**

Provide an obvious action:

**Add your first company**

The empty states should feel intentional and useful rather than unfinished.

Examples:

Companies:
**No companies yet**
“Start with a company you genuinely want to work with.”

Opportunities:
**No opportunities yet**
“Opportunities appear as you research companies and evaluate evidence.”

Contacts:
**No contacts yet**
“Relevant people appear after company research and opportunity evaluation.”

Campaigns:
**No campaigns yet**
“Campaigns appear after you've selected a contact and prepared outreach.”

Replies:
**No conversations yet**
“Replies will appear here once people respond.”

Do not fill these states with fake history.

---

# RETURN USER EXPERIENCE

Persist prototype state locally so that when the user returns:

* companies they added remain
* research progress remains
* classifications remain
* selected contacts remain
* outreach drafts remain
* campaigns remain
* conversations remain

The user should feel:

**“This is my workspace and it remembers what I did.”**

The implementation can use local state/localStorage for this prototype.

Production architecture is NOT required.

---

# STATE TRANSITIONS

Use a lightweight prototype state model across the product.

The important point is that UI states should change because of user actions.

Examples:

### Company lifecycle

`NOT_ADDED`
→ Add company
→ `UNCLASSIFIED`

### Research lifecycle

`NOT_STARTED`
→ Start research
→ `IN_PROGRESS`
→ Research complete
→ `COMPLETE`

### Opportunity lifecycle

`UNCLASSIFIED`
→ Review evidence
→ `PROACTIVE` or `CONFIRMED`

### Contact lifecycle

`NOT_DISCOVERED`
→ Find contacts
→ `DISCOVERING`
→ `DISCOVERED`
→ Select contact
→ `SELECTED`

### Outreach lifecycle

`NOT_STARTED`
→ Prepare outreach
→ `DRAFT`
→ Human review
→ `READY`
→ Send
→ `SENT`

### Conversation lifecycle

`NO_REPLY`
→ Reply received
→ `REPLIED`
→ User opens/responds
→ `ACTIVE`

If follow-ups exist later:

`ACTIVE`
→ Stop follow-ups
→ `STOPPED`

Do not implement every downstream surface in this prompt. Establish the state model and persistence pattern so future screens participate in the same workflow.

---

# PROTOTYPE DATA RULES

Do not make all companies and stages visible by default.

Instead:

### Default state

New user / empty workspace.

### User-created state

Actions create the data.

### Optional demonstration state

Provide a subtle way to explore the mature workflow without contaminating the default experience.

For example, a secondary action such as:

**Explore sample workspace**

This can load a clearly labeled demonstration workspace containing sample companies and later-stage data.

Make it obvious that this is sample/demo data.

Do NOT silently mix demo data with the user's real prototype workspace.

---

# DASHBOARD CONSEQUENCES

As state changes, the Dashboard should naturally change.

For example:

No companies:
**Add your first company**

Company added:
**Continue researching Moniepoint**

Research complete:
**Review your research**

Opportunity classified:
**Find relevant contacts**

Contact selected:
**Prepare outreach**

Reply received:
**Respond to Alex**

The dashboard should therefore feel like a **live action system**, not a static analytics page.

---

# RESPONSIVE REQUIREMENT

Continue enforcing the responsive behavior introduced in the previous implementation.

Contacts must work intentionally across:

Desktop:

* multi-column contact cards/list
* persistent workspace navigation

Tablet:

* compressed layouts
* adaptive navigation
* appropriate stacking

Mobile:

* single-column contact cards
* touch-friendly actions
* no horizontal overflow
* evidence displayed beneath the relevant contact
* review experience optimized for vertical scrolling
* workspace tabs remain usable through horizontal scrolling or another appropriate mobile pattern

Do not simply shrink desktop cards.

---

# IMPORTANT PRODUCT PRINCIPLE

The prototype should make the user feel:

**“I did something, and the product responded.”**

Not:

**“The product already has everything and I'm just clicking through screenshots.”**

Every major surface should therefore have meaningful:

* empty state
* initial state
* loading/in-progress state
* success/completed state
* error state where useful
* next-step state

Preserve the existing Outreacher design language.

The complete experience should increasingly demonstrate:

**I start with a company → I research it → I inspect evidence → I decide whether an opportunity exists → I find the right person → I understand why that person matters → I prepare a conversation.**

Do not build Campaigns, Replies, or the full Outreach composer yet. Establish the state foundation so those later surfaces can continue the same user-driven journey.

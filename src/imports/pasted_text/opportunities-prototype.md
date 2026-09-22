Build the next major Outreacher surface: the **Opportunities** experience inside `/companies/:id`, while also performing a **site-wide responsive UX pass** across the entire existing prototype.

This is a UI/UX prototype. Prioritize product clarity, visual quality, believable interactions, and responsive experience over production-level architecture.

Preserve the existing Outreacher visual system and do not redesign the product unnecessarily.

The product model remains:

**Company → Evidence → Opportunity → Person → Conversation**

The Opportunities experience must feel like the point where research evidence is turned into a concrete career pursuit decision.

---

## PART 1 — COMPANY OPPORTUNITIES

Build the **Opportunities** tab inside the existing Company Workspace.

The page should answer:

**“Based on what we found, what opportunity exists here, why do we believe it exists, and what should I do next?”**

Do not turn this into a generic CRM pipeline or sales-deal screen.

Avoid:

* Deal value
* Lead score
* Revenue
* Sales stage
* Win probability
* Generic CRM pipeline language

### Opportunity states

Support all three Outreacher opportunity states:

**CONFIRMED**
There is actual evidence of a relevant opening.

**PROACTIVE**
There is no confirmed opening, but company/research evidence provides a credible reason to pursue the company.

**UNCLASSIFIED**
There is not enough evidence to responsibly classify the opportunity yet.

The UI should clearly explain these meanings.

### Page structure

Build the following:

### 1. Opportunity header

Show:

* Company name
* Current opportunity state
* Short explanation of what that state means
* Last updated/reviewed indicator
* Primary contextual CTA

Examples:

CONFIRMED:
**Review opening**

PROACTIVE:
**Build a proactive case**

UNCLASSIFIED:
**Review research**

### 2. Opportunity summary

Create a prominent summary that explains:

**Why this opportunity exists**
**What evidence supports it**
**What remains uncertain**
**What the user should do next**

Keep the writing concise.

This should feel like a decision-support surface, not an AI essay.

### 3. Confirmed opportunity experience

For CONFIRMED companies, create a polished opening card containing:

* Role title
* Team/function
* Location or remote indicator where applicable
* Opening status
* Source
* Date discovered
* Relevant requirements/signals
* Link/view opening
* Evidence supporting why this opening is relevant to the user

Also include:

**Why this matters for you**

Connect the opening to the user's Career Profile:

* Target role
* Relevant skills
* Career goals
* Relevant experience context

Do not create a numeric match score.

Include a clear next step:

**Find relevant people**

This should move naturally into the Contacts stage.

### 4. Proactive opportunity experience

For PROACTIVE companies, do NOT pretend there is an open job.

Instead show a structured case such as:

**Why pursue this company now**

with evidence-based signals:

* company direction
* team growth
* technical activity
* hiring patterns
* product/organizational changes
* other relevant signals

Then show:

**Why this could be relevant to you**

and:

**What would strengthen the case**

Examples:

* Find a relevant team
* Identify a potential contact
* Verify current hiring activity
* Find stronger role-specific evidence

The interface should make the distinction between **evidence** and **inference** extremely clear.

### 5. Unclassified experience

For UNCLASSIFIED companies, explain:

**We don't have enough evidence yet to classify this opportunity.**

Show:

* What has already been discovered
* What is missing
* Why classification should wait

Provide a clear CTA:

**Continue research**

Do not allow the interface to imply that the company is already a viable opportunity.

### 6. Evidence traceability

Every important opportunity conclusion should connect back to research evidence.

Create a section such as:

**Evidence supporting this opportunity**

Each item should identify:

* Finding
* Source
* Recency
* Confidence where relevant
* Link back to research

The user should be able to understand:

**Conclusion → Evidence → Source**

### 7. Opportunity decision controls

Because this is a prototype, provide believable interaction for reviewing the classification.

Allow the user to:

* Review current classification
* View supporting evidence
* Change classification where appropriate
* See a confirmation step before making a consequential classification change
* Cancel without losing changes

Changing a classification should show a short explanation field such as:

“Why are you changing this?”

Do not make this overly bureaucratic.

### 8. Next-step handoff

End the opportunity experience with the logical next action:

CONFIRMED / PROACTIVE:
**Discover relevant contacts**

UNCLASSIFIED:
**Continue research**

Make the transition feel like a continuation of the same journey rather than jumping into a separate module.

---

# PART 2 — SITE-WIDE RESPONSIVE UX PASS

After building Opportunities, audit the **entire existing Outreacher prototype** and make every existing screen genuinely responsive.

Do not simply scale desktop layouts down.

Review at minimum:

* Authentication
* Onboarding
* Dashboard
* Career Profile
* Companies
* Company Workspace
* Research
* Opportunities
* Existing placeholder screens
* Global AppShell
* Sidebar
* Header
* Global search
* Avatar menu
* Modals/drawers

### Desktop

Preserve the existing desktop structure:

* Persistent sidebar
* Fixed header
* Main content scrolls
* Sidebar/header do not scroll with content

### Tablet

Adapt intelligently:

* Sidebar can collapse into an overlay/drawer
* Header controls should compress gracefully
* Multi-column layouts can reduce to two columns or stack
* Tables/lists should remain readable without horizontal overflow where possible

### Mobile

Create a deliberate mobile layout rather than a shrunken desktop version.

Use:

* Compact top header
* Drawer/overlay navigation or an appropriate mobile navigation pattern
* Single-column content
* Cards that stack vertically
* Large tap targets
* Touch-friendly filters
* Search controls that fit narrow screens
* Modals converted to mobile-friendly sheets/drawers where appropriate
* Long lists optimized for vertical scanning
* Secondary information moved beneath primary actions

For dense company rows, research evidence, opportunity cards, and activity feeds, **restructure the information hierarchy** instead of forcing desktop columns onto a narrow viewport.

For example, a desktop company row:

Company | Status | Workflow | Last Activity | Next Action

can become a mobile card:

Company
Status
Current state
Last activity
**Next action**

### Mobile interaction requirements

Ensure:

* No accidental horizontal scrolling
* No clipped buttons or text
* No tiny controls
* No overlapping header/sidebar content
* Clear tap states
* Focus states remain visible
* Forms remain usable with the mobile keyboard
* Search and filter controls remain accessible
* Important CTAs remain visible without excessive scrolling

Use a minimum comfortable touch target around 44px for interactive controls.

### Important responsive principle

Do not compromise the product hierarchy on mobile.

The mobile experience must still prioritize:

**What needs my attention → What is the opportunity → What evidence supports it → What should I do next**

Do not introduce new features during this responsive pass.

Do not redesign desktop unnecessarily.

The goal is to make the **existing Outreacher product feel intentionally designed across desktop, tablet, and mobile**, while making the Opportunities experience the next major step in the company journey.

The resulting experience should reinforce the complete product loop:

**Career Profile → Company → Research → Evidence → Opportunity → Contacts → Outreach → Conversation**

Build the next Outreacher surface: the **Research** experience inside `/companies/:id`, using the existing Company Workspace as the foundation.

This is a UI/UX prototype. Prioritize clarity, hierarchy, believable interactions, and a polished experience over production-level architecture. Preserve the existing Outreacher shell, Company Workspace header, journey navigation, typography, spacing, cards, buttons, status treatments, and responsive behavior. Do not redesign existing surfaces.

The core product model remains:

**Company → Evidence → Opportunity → Person → Conversation**

Research is where Outreacher turns a company into something the user can make an informed decision about pursuing.

### Research page purpose

Do NOT build a generic AI company summary.

The page should help the user answer:

**“What is happening at this company that is relevant to me, and what evidence supports pursuing a conversation here?”**

The research experience should connect company signals to the user’s Career Profile.

### Page structure

Create these major sections:

**1. Research header**

* “Research” title
* Company name
* Short explanation: research helps determine whether there is a meaningful opportunity worth pursuing.
* Research status: Not started / In progress / Complete
* Primary action that changes by state:

  * Not started → **Start research**
  * In progress → **Researching…**
  * Complete → **Refresh research**

**2. Research summary**
Once research exists, show a concise synthesis:

* What appears relevant
* Why it may matter to this user
* What remains uncertain

Keep this concise and decision-oriented.

**3. Evidence**
This is the most important part of the screen.

Create evidence cards containing:

* Evidence title
* Short factual finding
* Source type
* Source/domain
* Date or recency indicator where appropriate
* “What this suggests” explanation
* Confidence treatment
* Link/view-source affordance

Use categories such as:

* Hiring
* Product/company direction
* Engineering activity
* Team growth
* Strategic initiatives
* Technology signals

Do not present unsupported claims as facts.

Prototype evidence may use realistic sample content, but visually distinguish the research experience from fabricated real-world research. The goal is to demonstrate the interface and reasoning model.

**4. Relevance to your profile**
Connect findings to the Career Profile.

Show things such as:

* Relevant target role
* Relevant skills
* Career-goal alignment
* Why a finding may create a useful conversation angle

Make this feel like reasoning rather than a generic “match score.”

Do NOT introduce numerical fit scores, lead scores, or gamified percentages.

**5. Opportunity signal**
Create a clearly separated section showing what the evidence currently supports:

* **CONFIRMED** — evidence of an actual relevant opening
* **PROACTIVE** — no confirmed opening, but evidence supports pursuing the company
* **UNCLASSIFIED** — insufficient evidence to classify yet

Explain why the current classification exists and what evidence would be needed to change it.

For example:
“Relevant engineering activity found, but no verified opening for your target role.”

**6. Research gaps**
Show what is still unknown.

Examples:

* No relevant opening verified
* Team ownership unclear
* Relevant hiring activity needs confirmation
* Contactable team member not yet identified

Each gap should suggest the next useful action without pretending the system already knows the answer.

### Research states

Design all three states:

**Not started**
A strong empty state explaining what researching this company will uncover, with a clear Start research CTA.

**In progress**
Show believable progress without pretending to expose fake backend internals. Use a research activity state, useful interim messaging, and a clear sense that the user can return later.

**Complete**
Show the complete research summary, evidence, relevance, opportunity signal, and research gaps.

### Interaction design

Prototype believable interactions:

* Start research changes the page into an in-progress state.
* Complete research reveals the research results.
* Evidence cards can expand/collapse.
* Source links have a clear external-link affordance.
* Refresh research returns to the research process.
* Opportunity classification can update visually based on prototype evidence.
* Research gaps provide contextual navigation toward the next workflow step.
* Include polished loading, empty, error, and unavailable states.

### Critical UX principle

Do not bury evidence underneath an AI-generated paragraph.

The hierarchy should be:

**Finding → Evidence → Why it matters → What to do next**

The user should be able to inspect *why* Outreacher reached a conclusion.

Avoid:

* Generic company descriptions
* Wikipedia-style summaries
* SEO-style research pages
* Large AI-generated walls of text
* Sales lead scoring
* Revenue/company-health dashboards
* Unsupported confidence claims

This screen should establish the product’s central promise:

**Outreacher doesn't just tell me about a company. It helps me determine whether there is a credible reason for me to pursue a conversation there.**

The existing Overview, Companies list, navigation, and other pages must remain intact.

# Outreacher Landing Page — Experience & Implementation Brief

## Objective

Replace the existing temporary `/landing` page with a polished, high-conviction product landing page for **Outreacher**.

This is a **prototype landing page**, not a production marketing implementation.

The goal is to communicate the product's core idea within seconds:

> **Turn target companies into real opportunities.**

Outreacher is not primarily a job board, generic AI job-search tool, cold-email generator, or application tracker.

Its core workflow is:

**Company → Evidence → Opportunity → Person → Reason → Conversation**

The landing page should make that workflow visually understandable and emotionally compelling.

---

# 1. IMPORTANT: OVERRIDE THE CURRENT TEMP LANDING PAGE

The existing temporary landing page should be **fully replaced**.

Do not preserve its existing layout merely because it exists.

Do not create a second competing landing page.

The `/landing` route should become the canonical marketing/entry experience.

Do not change the authenticated application shell or dashboard.

The landing page should remain outside the authenticated AppShell.

---

# 2. DESIGN DIRECTION

The visual direction should feel like a serious modern software product.

Reference the discipline of products such as:

* Linear
* Attio
* Arc
* Vercel
* modern developer/productivity products

But **do not clone any of them**.

Outreacher should have its own visual identity.

The feeling should be:

**Intelligent · Precise · Calm · Modern · Confident · Human**

Avoid:

* generic SaaS gradients
* excessive glassmorphism
* giant decorative blobs
* stock photography
* cheesy AI imagery
* excessive neon
* fake enterprise dashboards
* excessive rounded cards
* generic "AI-powered" marketing language
* visual clutter
* over-animation
* anything that makes the product feel like a sales CRM

The product is about **career relationships**, not sales prospecting.

---

# 3. CORE MESSAGE

The hero should immediately communicate:

### Primary idea

**Turn target companies into real opportunities.**

Supporting copy should explain the mechanism:

> Research the company. Find the right person. Understand why they matter. Reach out with context.

Do not overload the hero with product terminology.

The user should understand the value before understanding every feature.

---

# 4. HERO SECTION

Create a highly polished hero section.

Structure:

```text
[small product label / eyebrow]

Turn target companies
into real opportunities.

Research companies.
Find the right people.
Reach out with a reason.

[Start building opportunities]   [See how it works]

                  [interactive product visualization]
```

The hero should occupy most of the initial viewport without feeling vertically cramped.

### Hero animation

Use a strong GSAP-style entrance sequence.

Animation sequence should feel intentional:

1. Page loads.
2. Background establishes itself subtly.
3. Eyebrow fades/slides into position.
4. Main headline reveals line-by-line or word-by-word.
5. Supporting copy follows.
6. CTA buttons enter slightly afterward.
7. Product visualization begins its own animation.
8. Small elements inside the visualization settle into place.

Do NOT make everything animate simultaneously.

Use a clear hierarchy.

---

# 5. HERO PRODUCT VISUALIZATION

Do not use a static screenshot as the primary hero visual.

Build a lightweight interactive representation of Outreacher's core workflow.

Conceptually:

```text
Company
   ↓
Evidence
   ↓
Opportunity
   ↓
Person
   ↓
Outreach
```

Represent this as a beautiful product-inspired visualization.

Example:

```text
┌──────────────────────────────────────┐
│  Kuda                                │
│  Fintech · Nigeria                   │
│                                      │
│  Research complete                   │
│                                      │
│  ────────────────────────────────    │
│                                      │
│  PROACTIVE                           │
│  Product engineering opportunity     │
│                                      │
│  Why this company                   │
│  • Fintech experience                │
│  • Product engineering focus         │
│                                      │
│  ────────────────────────────────    │
│                                      │
│  Jane Doe                            │
│  Engineering Manager                 │
│                                      │
│  Why this person                    │
│  Leads the team relevant to...       │
│                                      │
│  [Prepare outreach]                  │
└──────────────────────────────────────┘
```

This is illustrative, not necessarily the exact final UI.

The visualization should communicate:

**"Outreacher understands the context before asking you to send the message."**

---

# 6. HERO INTERACTION

Add subtle micro-interactions.

Examples:

### CTA hover

Buttons should have:

* subtle movement
* slight scale
* smooth shadow/border transition
* responsive press state

Avoid exaggerated bouncing.

### Product visualization

Cards/elements can:

* slightly respond to pointer movement
* have subtle parallax
* illuminate/shift when the pointer moves nearby
* transition between workflow states

On mobile:

**remove or drastically reduce pointer-based effects.**

Never depend on hover to understand the experience.

---

# 7. SCROLL STORY

The landing page should not simply be:

Hero → Feature cards → Pricing → Footer.

Instead, make scrolling tell the product story.

Suggested narrative:

```text
Hero
 ↓
The problem
 ↓
The Outreacher approach
 ↓
Company intelligence
 ↓
Opportunity reasoning
 ↓
People intelligence
 ↓
Outreach with context
 ↓
Relationship memory
 ↓
Product workflow
 ↓
Final CTA
```

Each section should advance the user's understanding.

---

# 8. SECTION: THE PROBLEM

Create a concise section explaining the existing career-search problem.

Headline concept:

> Applying is easy.
> Knowing who to talk to is harder.

Explain that traditional job searching often looks like:

```text
Find job
   ↓
Apply
   ↓
Wait
```

Outreacher introduces another path:

```text
Choose company
   ↓
Understand what is happening
   ↓
Find the right person
   ↓
Reach out with context
```

Use motion to visually transform the first flow into the second.

---

# 9. SECTION: THE OUTREACHER MODEL

Make the core differentiator a major visual section.

Display:

**Company → Evidence → Opportunity → Person → Conversation**

Each stage should appear progressively as the user scrolls.

Use scroll-triggered GSAP-style animation.

Example behavior:

* Company appears.
* Evidence connects to company.
* Opportunity emerges from evidence.
* Person appears from the opportunity.
* Conversation connects everything.

The animation should make the workflow feel like a system being constructed.

This should be one of the strongest visual moments on the page.

---

# 10. COMPANY INTELLIGENCE SECTION

Headline:

> Start with the company, not the job title.

Explain that Outreacher helps users understand a target company before reaching out.

Show:

* company identity
* industry
* location
* research status
* relevant evidence
* company developments
* career-profile alignment

Create a product visualization that looks like an actual Outreacher workspace.

Animate evidence items entering the interface.

For example:

```text
Research complete

Recent signal
New product team expansion

Relevant because
Your experience in product engineering...

Source
Company careers / company announcement
```

Do not fabricate real-world company claims in the prototype unless clearly presented as demonstration data.

---

# 11. OPPORTUNITY REASONING SECTION

This is a major differentiator.

Headline:

> Not every opportunity starts with a job opening.

Explain the three states:

### CONFIRMED

A relevant opening has been identified.

### PROACTIVE

No relevant opening is confirmed, but there is enough evidence to justify starting a relationship.

### UNCLASSIFIED

There is not enough evidence yet.

Present these as an elegant state transition.

Do not turn these into scoring/ranking systems.

The visual message should be:

**Outreacher helps you understand what kind of opportunity you actually have.**

---

# 12. PEOPLE SECTION

Headline:

> Find the person who makes sense.

Show a contact/person interface.

Example:

```text
Jane Doe
Engineering Manager

Why this person

Leads the engineering team closest
to the area you're targeting.

Conversation angle

Reference the team's recent product
engineering expansion.
```

The important concept is:

**Outreacher doesn't just find a person's email. It explains why that person is relevant.**

Animate:

Person → role → reasoning → conversation angle

into view.

---

# 13. OUTREACH SECTION

Headline:

> Write less generic outreach.

Show the outreach preparation process.

Before the email appears, show:

```text
Why this company
✓ Product engineering experience

Why this person
✓ Relevant engineering leadership role

Why now
✓ Recent team expansion

Conversation angle
✓ Ask about the team's direction
```

Then transition into the generated draft.

This should visually demonstrate:

**Context → Draft**

rather than:

**AI → Random email**

The draft should clearly remain editable.

Show an obvious human-review step.

---

# 14. HUMAN CONTROL

Create a short section emphasizing that the product does not blindly send messages on the user's behalf.

Headline:

> AI does the research.
> You decide what to say.

Show:

```text
Research
     ↓
Context
     ↓
Draft
     ↓
YOU REVIEW
     ↓
Send
```

Use subtle animation around the human review step.

This reinforces trust.

---

# 15. RELATIONSHIP MEMORY SECTION

Show that Outreacher continues after the first message.

Visual flow:

```text
Outreach sent
      ↓
Reply received
      ↓
Conversation
      ↓
Follow-up
      ↓
Outcome
      ↓
Relationship
```

Use a timeline-style interface.

Possible states:

* Replied
* Continue conversation
* Follow up later
* Referred
* Application opportunity
* Not a fit
* Closed

Do not make this feel like a CRM sales pipeline.

It should feel like **remembering professional relationships**.

---

# 16. INTERACTIVE PRODUCT STORY

Include at least one section where the user can interact with the product visualization.

Example:

```text
[Company] [Evidence] [Person] [Outreach]
```

Clicking each stage changes the visualization.

For example:

### Company

Shows company context.

### Evidence

Shows research signals.

### Person

Shows why the contact matters.

### Outreach

Shows the resulting contextual draft.

Use smooth transitions.

This should work on mobile through taps.

Do not rely exclusively on hover.

---

# 17. MICRO-INTERACTIONS

Use micro-interactions throughout the page, but maintain restraint.

Good examples:

* button hover transitions
* icon movement
* card elevation
* subtle border transitions
* text reveal
* cursor-responsive product panels
* small status indicators
* progress connections
* animated checkmarks
* subtle number/state changes
* navigation underline transitions
* scroll progress
* cards entering/exiting viewport

Avoid:

* constant floating elements
* excessive bouncing
* perpetual animations everywhere
* animations that delay interaction
* large cinematic transitions on every section

The page should feel **alive, not busy**.

---

# 18. GSAP-STYLE ANIMATION SYSTEM

If GSAP is already available in the prototype, use it.

If GSAP is not installed, **do not add a dependency merely for the prototype unless the existing project installation workflow supports it cleanly**.

CSS transitions and lightweight React animation are acceptable where appropriate.

The animation system should use concepts equivalent to:

* scroll-triggered reveals
* staggered entrances
* timeline sequencing
* pinned sections where useful
* transform/opacity-based transitions
* subtle parallax
* state transitions

Avoid animating expensive properties such as layout dimensions wherever possible.

Prefer:

```text
transform
opacity
scale
translate
```

over continuously animating layout.

---

# 19. MOBILE ANIMATION RULES

Mobile is not a reduced desktop version.

The page must be deliberately designed for mobile.

On mobile:

* reduce animation distances
* reduce parallax
* remove pointer tracking
* avoid horizontal overflow
* avoid oversized visualizations
* stack product cards vertically
* keep important text readable
* keep CTAs accessible
* maintain touch targets around 44px+
* avoid pinned sections that create awkward scrolling
* avoid excessive scroll-triggered animation
* respect reduced-motion preferences

The product story must remain understandable even if animations are disabled.

---

# 20. REDUCED MOTION

Respect:

```text
prefers-reduced-motion: reduce
```

When reduced motion is enabled:

* disable parallax
* disable large transforms
* remove decorative looping animations
* use simple opacity transitions or no animation
* preserve all content and interactions

Animation must enhance the experience, not be required for comprehension.

---

# 21. NAVIGATION

Create a minimal marketing navigation.

Desktop:

```text
Outreacher

Product
How it works
Sign in

[Start building]
```

Keep it restrained.

Do not create a large marketing mega-navigation.

Mobile:

```text
Outreacher                 ☰
```

Use a polished mobile navigation drawer/menu.

The authenticated application's sidebar should remain completely separate.

---

# 22. FINAL CTA

End with a strong but simple CTA.

Headline:

> Your next opportunity might not be another application.

Supporting message should reinforce relationship-first career exploration.

Primary CTA:

**Start building opportunities**

Secondary option:

**See how it works**

Do not use fake urgency.

Do not use fake customer counts.

Do not use fake testimonials.

Do not invent logos or social proof.

---

# 23. FOOTER

Minimal footer.

Include:

* Outreacher
* Product
* How it works
* Sign in
* Start building opportunities

Keep it clean.

---

# 24. RESPONSIVE DESIGN

Implement intentionally across:

### Desktop

* large hero
* multi-column layouts
* richer product visualizations
* scroll-driven animations

### Tablet

* reduce visual density
* adjust typography
* collapse multi-column sections where necessary
* maintain animation but reduce intensity

### Mobile

* single-column narrative
* compact navigation
* stacked product visualizations
* touch interactions
* shorter animation distances
* no horizontal overflow
* no hover dependency

Test at:

* 375px
* 390px
* 430px
* 768px
* 1024px
* 1280px+

---

# 25. PERFORMANCE

This is a prototype, but the landing page should still feel fast.

Avoid:

* enormous images
* unnecessary video backgrounds
* dozens of simultaneous animated elements
* expensive canvas effects
* continuous JavaScript animation loops

Prefer composited transforms and opacity.

Only animate elements when they enter the viewport.

Avoid running dozens of ScrollTrigger instances unnecessarily.

---

# 26. ACCESSIBILITY

Maintain the existing UX accessibility standard.

Ensure:

* semantic headings
* correct heading hierarchy
* keyboard navigation
* visible focus states
* sufficient contrast
* buttons have accessible names
* interactive visualizations have meaningful accessible descriptions
* animations do not block interaction
* reduced-motion support
* touch targets are appropriately sized

The marketing page must still satisfy the spirit of WCAG 2.2 AA.

---

# 27. PRODUCT LANGUAGE

Use precise language.

Prefer:

> Find the right person.

over:

> Unlock powerful networking synergies.

Prefer:

> Understand why this company matters.

over:

> Leverage AI-powered career intelligence.

Prefer:

> Reach out with context.

over:

> Supercharge your professional outreach.

Avoid generic AI marketing phrases.

Outreacher should sound like a thoughtful product built by people who understand how career relationships actually work.

---

# 28. DEMO DATA

Use a small, coherent fictional/demo dataset for visualizations.

Do not present fabricated information as real-world factual evidence.

Clearly treat visual data as product demonstration data.

The landing page should not mutate the authenticated user's workspace.

The marketing/demo visualizations are isolated from normal workspace state.

---

# 29. AUTHENTICATION CTA BEHAVIOR

The primary CTA should connect naturally to the existing prototype.

If the user is authenticated:

**Start building opportunities**
→ `/dashboard`

If unauthenticated:

**Start building opportunities**
→ existing signup/onboarding entry route.

The landing page should not introduce a new authentication system.

The exact existing routes should be discovered from the current application rather than invented.

---

# 30. IMPORTANT IMPLEMENTATION CONSTRAINT

Do not turn this into a production engineering exercise.

This is a prototype.

Prioritize:

1. visual quality
2. storytelling
3. interaction quality
4. responsive behavior
5. believable product visualization
6. animation quality
7. accessibility

Do not spend time building real integrations, APIs, backend services, databases, or real analytics.

---

# 31. DO NOT BREAK THE EXISTING APPLICATION

Preserve:

* authenticated AppShell
* dashboard
* companies
* research
* opportunities
* contacts
* outreach
* campaigns
* conversations
* integrations
* sender accounts
* existing routes

Only replace/improve the marketing landing experience.

Do not modify authenticated application behavior unless required to connect the landing-page CTA to an existing route.

---

# 32. VALIDATION

After implementation, validate the landing page as an actual experience.

Check:

### Visual

* Does the hero immediately communicate the product?
* Does the page feel like one coherent product story?
* Is the visual hierarchy strong?
* Does it feel premium without becoming flashy?
* Does it look like Outreacher rather than a generic SaaS template?

### Story

Can a new visitor understand:

1. What Outreacher does
2. Why starting with the company matters
3. How evidence informs opportunity
4. Why finding the right person matters
5. Why the outreach is more contextual
6. How the relationship continues afterward

### Interaction

Verify:

* CTA hover
* CTA press
* navigation
* interactive workflow
* scroll animations
* product visualization transitions
* mobile tap interactions
* mobile navigation

### Responsive

Verify at:

* 375px
* 390px
* 430px
* 768px
* 1024px
* 1280px+

Check for:

* overflow
* clipping
* awkward animation
* oversized typography
* inaccessible controls
* broken layouts

### Accessibility

Verify:

* keyboard navigation
* focus states
* reduced motion
* semantic headings
* accessible controls

---

# 33. QUALITY BAR

Do not stop at:

> "Landing page created successfully."

The finished page should feel like a **real product launch experience**.

The strongest visual idea should communicate this transformation:

```text
I want to work there.
        ↓
Outreacher understands the company.
        ↓
Outreacher finds the relevant opportunity.
        ↓
Outreacher helps me understand who matters.
        ↓
I understand why I'm reaching out.
        ↓
I start a real conversation.
```

The landing page should make that transformation understandable **before the visitor ever opens the application**.

Implement the page now.

After implementation, report:

1. What was replaced
2. Major sections implemented
3. Animation/micro-interaction system
4. Mobile behavior
5. Accessibility/reduced-motion handling
6. Existing routes preserved
7. Any limitations or areas that intentionally remain prototype-level
8. TypeScript/build validation

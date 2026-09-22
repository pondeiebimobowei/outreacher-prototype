# Outreacher — Global Search + Command Palette

## Objective

Implement the next product capability for Outreacher:

**Global Search + Command Palette**

This should make the product feel like one coherent workspace rather than a collection of independently navigable pages.

The feature must work across the existing persisted prototype state and must respect the current product architecture, domain contracts, UX governance, and visual language.

This is a **Figma Make prototype**, not a production backend implementation.

Prioritize:

* excellent UX
* believable interaction
* fast navigation
* useful search results
* persisted workspace state
* responsive behavior
* keyboard accessibility
* consistency with the existing shell
* cross-domain navigation

Do **not** introduce unnecessary backend infrastructure.

---

# 1. Read the existing product contracts first

Before modifying code, inspect the existing:

* product requirements
* experience README
* experience design system
* experience contracts
* execution backlog
* architecture documentation
* `src/lib/workspaceStore.ts`
* application shell/navigation
* current domain routes and detail pages

Relevant existing domains include:

* Dashboard
* Companies
* Opportunities
* Contacts
* Conversations
* Campaigns
* Templates
* Settings where applicable

Follow the established authority hierarchy:

**Product Requirements > Technical Specs + Experience Specs > Approved Visual Designs > Implementation**

If an existing approved Experience Contract governs the affected surface, follow it.

Do not create or silently assume a missing Experience Contract.

---

# 2. Inspect the current implementation before coding

Determine:

1. How the application shell currently handles navigation.
2. How the sidebar is implemented.
3. Whether there is already a reusable modal/dialog/drawer primitive.
4. Whether keyboard shortcuts already exist.
5. How routes are defined.
6. How persisted workspace state is accessed.
7. What data is currently available for:

   * companies
   * opportunities
   * contacts
   * conversations
   * campaigns
   * templates
8. Which records have canonical routes.
9. Whether there are existing search/filter components that should be reused.

Do not create duplicate primitives when suitable existing components already exist.

---

# 3. Product intent

Global Search is not merely a text filter.

It should answer:

> “I know roughly what I am looking for. Take me there.”

The Command Palette should answer:

> “I know what I want to do. Let me do it quickly.”

These should feel like a natural part of the workspace.

The experience should be closer to a modern productivity application than an enterprise CRM.

Use the existing Outreacher design language:

* restrained
* compact
* clear
* information-dense without feeling crowded
* strong typography hierarchy
* subtle borders
* deliberate spacing
* minimal decorative UI
* obvious keyboard/focus behavior
* high-quality empty states

Do not make it look like a sales prospecting tool.

---

# 4. Global Search entry point

Add a persistent global search entry point to the application shell.

Desktop:

* visible in the top header
* visually resembles a command/search trigger rather than a full search form
* show a keyboard hint such as:

  * `⌘ K` on macOS
  * `Ctrl K` where appropriate

Example conceptual presentation:

**Search companies, people, opportunities...** `⌘K`

Do not hardcode platform-specific behavior incorrectly.

The interaction should support:

* click
* keyboard shortcut
* focus management

---

# 5. Command palette/search overlay

Opening global search should present a focused overlay.

Preferred behavior:

* centered modal on desktop
* appropriately sized
* backdrop
* search input automatically focused
* results appear immediately when relevant
* Escape closes
* clicking outside closes where consistent with existing modal conventions
* keyboard navigation works

Do not turn the entire page into a new route just to search.

The underlying page should remain intact.

---

# 6. Search model

Search across the product's meaningful entities.

At minimum:

### Companies

Search:

* company name
* company domain
* company description if available
* relevant persisted workspace identifiers

Result should show:

* company name
* domain/context
* opportunity state when available
* useful secondary context

Selecting a company should navigate to:

`/companies/:id`

or the existing canonical company route.

---

### Contacts

Search:

* name
* email
* role/title
* company name

Result should show:

* contact name
* title
* company
* lifecycle/relevant status where available

Selecting a contact should navigate to its canonical contact route.

Preserve the existing compound route convention if that is currently required.

---

### Opportunities

Search:

* company
* opportunity title/name
* opportunity state
* relevant evidence text where appropriate

Result should show:

* opportunity/company
* state:

  * CONFIRMED
  * PROACTIVE
  * UNCLASSIFIED
* useful contextual information

Selecting it should navigate to:

`/opportunities/:id`

---

### Conversations

Search:

* company
* contact
* message content where available
* conversation status

Result should show:

* contact
* company
* conversation stage
* recent relevant message preview

Selecting it should navigate to the canonical conversation route.

Do not expose unnecessary private/internal data in the result.

---

### Campaigns

Search:

* campaign name
* company/contact context where available
* campaign status

Selecting should navigate to the canonical campaign route.

---

### Templates

Search:

* template name
* category
* subject where useful

Selecting should navigate to the canonical template route.

---

# 7. Search result hierarchy

Results should not appear as one undifferentiated list.

Group results by domain where useful:

**Companies**

...

**People**

...

**Opportunities**

...

**Conversations**

...

**Campaigns**

...

**Templates**

...

However, do not show empty domain sections.

When there is one overwhelmingly relevant result, make it easy to select immediately.

---

# 8. Result design

Each result should communicate enough context to make selection obvious without opening the record.

Example conceptual structure:

**Flutterwave**
`flutterwave.com` · PROACTIVE

or:

**Jane Doe**
Senior Engineering Manager · Flutterwave

or:

**Engineering outreach**
Jane Doe · Flutterwave · DRAFT

Use small secondary metadata rather than large cards.

Results should support:

* icon/domain indicator
* title
* secondary context
* state/status where meaningful
* highlighted matching text where appropriate

Do not overdecorate.

---

# 9. Keyboard navigation

This is important.

Support:

* `⌘K` / `Ctrl+K` → open
* `Escape` → close
* `ArrowDown` → next result
* `ArrowUp` → previous result
* `Enter` → select
* typing → filter
* optionally `Tab` only where it does not conflict with normal dialog accessibility

The currently highlighted result must be visually obvious.

Keyboard navigation must never trap focus incorrectly.

Focus should return sensibly after closing the palette.

---

# 10. Command mode

The same interface should be capable of acting as a lightweight command palette.

When no search query is entered, provide useful commands.

Examples:

### Navigation

* Go to Dashboard
* Go to Companies
* Go to Opportunities
* Go to Contacts
* Go to Conversations
* Go to Campaigns
* Go to Templates
* Go to Settings

### Creation

Where existing routes/actions support them:

* Add company
* Create campaign
* Create template

### Workflow continuation

Where persisted state allows it:

* Continue latest research
* Review pending outreach
* View conversations needing attention
* View follow-ups due

Do not invent actions that the current product cannot actually perform.

Every displayed command must either:

1. perform a real existing prototype action, or
2. navigate to an existing route.

Do not create fake commands merely to make the palette look complete.

---

# 11. Search vs command behavior

The palette should have a coherent mental model.

When empty:

> “What do you want to do?”

Show useful commands/navigation.

When typing normal text:

> “What are you looking for?”

Show matching entities.

For example:

`flu`

could return:

**Companies**

* Flutterwave

**People**

* Person at Flutterwave

**Opportunities**

* Flutterwave — PROACTIVE

The user should not need to explicitly choose “search mode.”

---

# 12. Recent items

Consider a small **Recent** section when no query is present.

Recent items must be derived from actual user interactions or persisted state.

Do not populate this with random fake records.

If no meaningful recent records exist, show commands instead.

Potential recent items:

* last company viewed
* last opportunity viewed
* last contact viewed
* last conversation viewed

Keep this lightweight.

---

# 13. Context-aware commands

Where possible, the palette can reflect the current page.

For example, when viewing a company:

* Research company
* View opportunity
* View contacts
* Start outreach
* Open conversation

But only display actions that actually exist in the current prototype.

This should feel helpful, not overwhelming.

Keep the global palette primarily global.

---

# 14. Search empty state

If the user enters a query with no matches:

Show a deliberate empty state.

Example:

**No results**

We couldn't find anything matching:

`xyz`

Then provide useful next actions where appropriate:

* Clear search
* Go to Companies
* Add a company

Do not show a giant generic “nothing here” panel.

---

# 15. Search loading state

Even though this is a prototype and local filtering should normally be immediate, preserve the ability to represent loading if the current application state requires it.

If search is synchronous:

Do not artificially insert fake loading delays.

The product should feel fast.

---

# 16. Search result correctness

The search index must be derived from the existing source of truth.

Do not create a second independent fake data store.

Use:

`workspaceStore`

and existing domain/reference data as appropriate.

Respect the current prototype constraints:

* static/reference contact data may remain static
* static/reference opportunity data may remain static
* persisted workspace state remains the source of truth for user actions
* known demo data behavior should remain intentional
* do not silently mix demo/sample records into the user's workspace

If a record exists only as reference/demo data, treat it consistently with the existing application's behavior.

---

# 17. Canonical navigation

Search must use the same canonical routes already established by the application.

Do not introduce alternate duplicate URLs.

Verify navigation for:

* company
* contact
* opportunity
* conversation
* campaign
* template
* dashboard
* settings

When selecting a result:

1. close the palette
2. navigate
3. render the target page
4. preserve persisted state

Do not leave the palette mounted over the destination.

---

# 18. Search result ranking

Do not implement a complex search engine.

For the prototype, use a sensible relevance model.

A reasonable hierarchy:

1. exact title/name match
2. starts-with match
3. title/name substring match
4. important secondary field match
5. contextual match

For example:

Searching `flutter` should prioritize:

**Flutterwave**

above a contact whose message happens to contain “flutter”.

Do not expose numerical relevance scores.

---

# 19. Search normalization

Search should be forgiving.

Normalize:

* case
* leading/trailing whitespace

Potentially normalize:

* punctuation
* common separators

For example:

`Flutterwave`

`flutterwave`

`FLUTTERWAVE`

should behave consistently.

Do not implement aggressive fuzzy matching unless existing libraries/components already support it.

---

# 20. Responsive behavior

This is mandatory.

### Desktop

Use the centered command/search modal.

### Tablet

Maintain a comfortable centered modal with reduced width.

### Mobile

Do not force the desktop modal geometry.

Use a near-full-screen search experience or mobile-appropriate sheet.

The search input should remain immediately accessible.

Results should use the full available width.

Touch targets should be approximately 44px minimum.

Do not require precise pointer interaction.

Keyboard shortcuts should remain progressive enhancements rather than the primary interaction.

---

# 21. Accessibility

Meet the existing WCAG 2.2 AA direction.

Ensure:

* dialog semantics
* search input has an accessible label
* results are keyboard navigable
* selected result has clear visual and semantic state
* focus is managed correctly
* Escape works
* sufficient contrast
* no color-only status communication
* touch targets are adequate
* screen readers can understand result grouping
* focus does not disappear behind the overlay

Do not implement accessibility as an afterthought.

---

# 22. Visual integration

The search/command experience should feel native to the existing shell.

Match:

* typography
* radius
* borders
* shadows
* spacing
* icons
* muted text
* focus treatment
* status indicators

Do not introduce a visually separate design language.

Avoid:

* excessive gradients
* oversized icons
* colorful SaaS dashboard styling
* unnecessary animations
* glassmorphism
* sales/CRM visual patterns

The experience should feel like:

**a serious productivity workspace for career relationship intelligence.**

---

# 23. Motion

Use subtle transitions only where they improve comprehension.

Good:

* palette appearing
* result highlight
* focus transition

Avoid:

* bouncing
* exaggerated scaling
* long animations

Keyboard interaction must feel immediate.

---

# 24. State behavior

Test at least these states:

### Fresh user

No companies / minimal state.

Opening search should still provide navigation and available commands.

### User with company

Searching the company should find it.

### User with opportunity

Searching by company/opportunity should return the opportunity.

### User with contacts

Searching name/company/title should return contacts.

### User with conversation

Searching contact/company/message context should return the conversation.

### User with campaigns/templates

Those domains should be searchable.

### No results

Correct empty state.

### Search opened and immediately closed

No state corruption.

### Search → result → navigation

Palette closes and destination renders correctly.

### Search → Escape

Focus returns appropriately.

---

# 25. Existing state integrity

Do not regress the recent lifecycle work.

In particular, preserve:

* conversation lifecycle
* `REPLIED` not automatically becoming `ACTIVE`
* `STOPPED` as terminal
* follow-up scheduling
* outcome recording
* relationship status
* dashboard attention queue
* canonical domain navigation
* immutable workspace/campaign updates
* structured conversation messages
* persisted workspace state

Global Search must be an observer/navigation layer over the existing state, not a replacement for it.

---

# 26. Do not over-engineer

This is a prototype.

Do NOT introduce:

* Elasticsearch
* Algolia
* backend search APIs
* database search infrastructure
* complex indexing workers
* production command execution framework
* unnecessary state-management libraries

A client-side derived search index is sufficient.

Keep the implementation clean enough that a production implementation could later replace the search provider without redesigning the UX.

---

# 27. Component architecture

Use reusable components where appropriate.

Conceptually:

* `GlobalSearchTrigger`
* `CommandPalette`
* `SearchInput`
* `SearchResults`
* `SearchResultGroup`
* `SearchResultItem`
* `CommandList`
* `RecentItems`

Names should follow the existing project conventions.

Avoid building one enormous component.

Keep search/domain mapping separate from presentation where practical.

---

# 28. Search abstraction

Create a small search abstraction that can transform existing domain data into a common result model.

Conceptually:

```text
SearchableItem
  id
  type
  title
  subtitle
  metadata
  route
  keywords
  state/status
```

Then:

```text
buildSearchIndex(workspace)
search(index, query)
```

Do not duplicate the entire workspace model.

The abstraction exists to keep UI independent of domain-specific search logic.

---

# 29. Testing

At minimum verify:

### Functional

* open via click
* open via keyboard
* close via Escape
* type query
* result filtering
* keyboard result navigation
* Enter navigation
* click result navigation
* empty state
* command execution
* recent items where implemented

### Domain navigation

Verify each supported result type navigates to its canonical destination.

### Persistence

Search must reflect current workspace state after user actions.

### Responsive

Verify:

* desktop
* tablet
* mobile

### Accessibility

Verify:

* focus
* keyboard navigation
* dialog semantics
* result selection
* readable labels

---

# 30. Visual QA

After implementation, inspect the actual rendered UI.

Do not stop at code completion.

Check:

* header integration
* palette dimensions
* visual hierarchy
* result density
* focus states
* empty states
* mobile layout
* keyboard interaction
* long company names
* long contact names
* long result metadata
* many results
* no results

Fix issues discovered during implementation.

Do not merely report them.

---

# 31. Preserve current product quality

Do not use this task as an excuse to rewrite unrelated areas.

Avoid modifying unrelated domains unless necessary for:

* canonical navigation
* shared shell integration
* search data access
* accessibility
* state consistency

If you discover an unrelated bug that materially blocks Search, fix it.

If it does not block Search, leave it for the appropriate roadmap task.

---

# 32. Definition of Done

Global Search + Command Palette is complete when:

* [ ] Search trigger exists in the global shell
* [ ] `⌘K` / `Ctrl+K` opens it
* [ ] Search input receives focus
* [ ] Companies are searchable
* [ ] Contacts are searchable
* [ ] Opportunities are searchable
* [ ] Conversations are searchable
* [ ] Campaigns are searchable
* [ ] Templates are searchable
* [ ] Navigation commands exist
* [ ] Relevant creation/workflow commands exist where supported
* [ ] Results are grouped intelligently
* [ ] Result relevance is sensible
* [ ] Keyboard navigation works
* [ ] Escape closes correctly
* [ ] Canonical routes are used
* [ ] Persisted workspace state is respected
* [ ] No fake/random data is introduced
* [ ] Empty state works
* [ ] Responsive behavior works
* [ ] Accessibility requirements are addressed
* [ ] Visual styling matches the existing product
* [ ] Existing lifecycle behavior remains intact
* [ ] TypeScript/build checks pass
* [ ] Existing tests remain passing
* [ ] Rendered UI has been visually reviewed
* [ ] Any issues found during QA are fixed

---

# 33. Final implementation report

When finished, report:

1. What was implemented.
2. Files/components changed.
3. Searchable domains.
4. Commands supported.
5. Keyboard interactions.
6. Responsive behavior.
7. Accessibility work.
8. Any intentional prototype limitations.
9. Tests/checks run.
10. Any remaining issues that genuinely belong to a later roadmap item.

Do not claim production-grade functionality where the prototype intentionally uses local state/reference data.

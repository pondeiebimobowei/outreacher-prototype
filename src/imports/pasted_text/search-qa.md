# Outreacher — Search & Command Palette Hardening + Visual QA

The Global Search + Command Palette implementation is now in place.

Do **not** move on to Notifications yet.

Perform a focused hardening and rendered-UI QA pass on the implementation you just created.

This is not a broad architecture audit and should not become a rewrite. Fix concrete issues you find, then leave the feature in a genuinely usable state.

---

## 1. First inspect the implementation you just created

Review:

* `src/lib/search.ts`
* `src/components/CommandPalette.tsx`
* `src/layouts/AppShell.tsx`
* `src/components/Header.tsx`
* relevant workspace/state utilities
* the existing canonical routes
* any helper modules imported by `search.ts`

Understand the implementation before changing it.

---

# 2. Fix dependency direction

There is currently a concern that:

`src/lib/search.ts`

imports helper logic from page/component modules such as `ContactsTab`.

Do not leave this dependency if it can be avoided cleanly.

The desired dependency direction is:

```text
shared/domain/state utilities
        ↓
search abstraction
        ↓
CommandPalette UI
        ↓
AppShell/Header
```

Not:

```text
search abstraction
        ↓
page component
```

If a contact/opportunity transformation helper is genuinely reusable, move the underlying data/derivation logic into an appropriate shared module.

Do not duplicate complicated business logic merely to avoid one import.

Do not perform an unrelated architectural rewrite.

---

# 3. Validate the search source of truth

Search must derive from the same data model the rest of the prototype uses.

Inspect:

* `workspaceStore`
* static/reference data
* persisted workspace state
* company records
* contact records
* opportunity records
* conversations
* campaigns
* templates

Ensure search does not create a second fake source of truth.

The important principle remains:

**USER ACTION → PERSISTED WORKSPACE UPDATE → SEARCH RE-DERIVES FROM CURRENT STATE**

---

# 4. Check stale state behavior

Pay particular attention to the current implementation's use of:

```ts
loadWorkspace()
```

If the palette builds its index only once when opened, determine whether that creates stale results during the current interaction.

For example:

1. Open palette.
2. Search for a company.
3. Close palette.
4. Perform an action that changes workspace state.
5. Reopen palette.
6. Search again.

The new state must be reflected.

Also test:

1. Open palette.
2. Current state changes through an existing UI interaction.
3. Search again while the palette remains mounted/open where applicable.

Do not introduce artificial complexity if the current application architecture makes the second case irrelevant, but ensure reopening always reconstructs current state.

---

# 5. Validate all searchable domains

Verify the actual implementation rather than trusting the previous summary.

The search must correctly support the domains that are currently intended:

### Companies

Search:

* company name
* domain
* useful company metadata

### Contacts

Search:

* contact name
* email
* title
* company

### Opportunities

Search:

* opportunity/company
* title/name
* useful evidence/context where appropriate

### Conversations

Search:

* contact
* company
* useful message content
* conversation state

### Campaigns

Search:

* campaign name
* relevant company/contact context

### Templates

Search:

* template name
* category
* subject where useful

Do not add unsupported fake data simply to make a category appear populated.

---

# 6. Re-check lifecycle restrictions

The previous implementation description included restrictions such as:

* opportunities “when classified/researched”
* conversations “when outreach sent”

Do not assume those restrictions are correct.

Compare them with the actual Outreacher domain model.

Search should expose meaningful records according to the product's actual lifecycle.

Do not arbitrarily hide an entity merely because a particular implementation path happened to make its data available.

Preserve the distinction between:

* static/reference data
* persisted user state
* demo/sample data

Do not silently mix them.

---

# 7. Validate canonical routes

For every searchable domain, select a result and verify that it navigates to the application's existing canonical destination.

Check:

* Company
* Contact
* Opportunity
* Conversation
* Campaign
* Template

Also verify:

* palette closes before/with navigation
* destination renders correctly
* no duplicate route is introduced
* browser back works
* current workspace state remains intact.

Respect existing compound route conventions such as the contact route if those are already required.

---

# 8. Validate command actions

Check every empty-state command.

Navigation commands should work:

* Dashboard
* Companies
* Opportunities
* Contacts/People
* Conversations
* Campaigns
* Templates
* Settings

Creation/workflow commands must only appear when their underlying action or route actually exists.

Test:

* Add company
* Create campaign
* Create template
* Continue latest research
* View conversation needing attention

Remove any command that does not correspond to a real existing prototype capability.

Do not create fake functionality simply for visual completeness.

---

# 9. Keyboard interaction QA

Test the actual rendered interface.

Required:

* `⌘K` opens on macOS
* `Ctrl+K` opens where appropriate
* typing filters
* ArrowDown changes selection
* ArrowUp changes selection
* Enter selects
* Escape closes

Also test:

* selection wraps correctly if wrapping is implemented
* selected result remains visible while scrolling
* focus remains inside the dialog appropriately
* focus returns to the trigger after closing where practical
* keyboard shortcuts do not interfere with ordinary text-entry fields elsewhere in the application.

Do not make global `⌘K`/`Ctrl+K` interfere with users typing into another input or textarea.

---

# 10. Search relevance QA

Test examples against the actual data.

Verify that:

* exact name matches rank highly
* prefix matches rank highly
* substring matches work
* secondary metadata matches work
* case does not matter
* leading/trailing spaces do not matter
* empty query does not accidentally behave like a normal search

Do not introduce numerical relevance scores into the UI.

The ranking should simply feel sensible.

---

# 11. Result grouping QA

Verify groups are only rendered when they contain results.

Avoid:

```text
Companies
0 results

People
0 results

Opportunities
0 results
```

Instead, empty search should show commands/recent items.

A non-empty query with no matches should show one coherent:

**No results**

state.

If there are multiple matching domains, the hierarchy should remain easy to scan.

---

# 12. Recent items

If recent items are implemented, verify they are based on actual meaningful user activity/state.

Do not populate recent items with random demo records.

If there is no meaningful recent history, commands should remain the primary empty-state experience.

---

# 13. Responsive QA

Test the actual rendered experience at:

### Desktop

* normal desktop width
* narrower laptop width

### Tablet

* intermediate width

### Mobile

* narrow mobile width

Verify:

* no horizontal overflow
* search input remains usable
* result text truncates gracefully
* metadata does not destroy layout
* modal/sheet occupies appropriate space
* scrolling works
* touch targets remain comfortable
* close control remains reachable.

Do not simply scale the desktop modal down indefinitely.

---

# 14. Accessibility QA

Inspect:

* dialog semantics
* accessible name
* search input label
* result list semantics
* selected result semantics
* focus management
* Escape behavior
* keyboard navigation
* contrast
* focus visibility
* touch target size

Make corrections directly.

Do not merely report accessibility problems.

---

# 15. Visual QA

Render the actual interface.

Do not stop at TypeScript success.

Look specifically at:

### Header

Does the search trigger actually feel like part of the shell?

### Palette

Check:

* width
* vertical placement
* padding
* border
* shadow
* radius
* backdrop
* input hierarchy

### Results

Check:

* result density
* icon sizing
* title hierarchy
* metadata hierarchy
* status badges
* selected state
* grouping headers
* scrolling

### Empty state

Check:

* commands
* recent items
* hierarchy
* whitespace

### No results

Check that it feels intentional and useful rather than like an error page.

### Mobile

Check the entire interaction, not just the dimensions.

Fix visual issues you discover.

---

# 16. Interaction quality

The experience should feel immediate.

Avoid unnecessary:

* loading delays
* long animations
* decorative motion
* complex transitions

The palette should feel like a native productivity shortcut.

The user should be able to:

**open → type → see result → Enter → arrive**

with minimal friction.

---

# 17. Preserve existing product behavior

Do not regress recent work.

Verify that this feature does not break:

* dashboard
* company workspace
* opportunities
* contacts
* outreach
* campaigns
* conversations
* follow-ups
* outcomes
* relationship state
* canonical navigation
* persisted workspace state

In particular preserve:

* `REPLIED` does not automatically become `ACTIVE`
* `STOPPED` remains terminal
* follow-up behavior remains intact
* recorded outcomes remain intact
* dashboard attention logic remains intact.

---

# 18. Keep scope controlled

Do not:

* introduce a search backend
* introduce Elasticsearch
* introduce Algolia
* introduce a database search service
* introduce a new global state library
* rewrite the workspace architecture
* redesign unrelated screens
* perform a broad codebase refactor

Only make changes needed to make Global Search + Command Palette correct, maintainable, and polished.

---

# 19. Run checks

After fixes, run the project's appropriate:

* TypeScript check
* existing test suite
* build
* lint if configured

Resolve errors caused by this feature.

Do not claim success based solely on static inspection.

---

# 20. Final acceptance test

Manually walk through this sequence:

### Scenario A — fresh user

1. Open Dashboard.
2. Click global search.
3. See useful commands.
4. Press Escape.
5. Press `⌘K`.
6. Search for a nonexistent term.
7. Confirm clean no-results state.

### Scenario B — company search

1. Open search.
2. Search for an existing company.
3. Select it.
4. Confirm canonical company route.
5. Open search again.
6. Search for the company again.
7. Confirm current state is represented.

### Scenario C — cross-domain search

Search for:

* company
* contact
* opportunity
* conversation
* campaign
* template

Where records exist.

Confirm every result navigates correctly.

### Scenario D — keyboard

Use only the keyboard:

```text
⌘K
type
ArrowDown
ArrowDown
Enter
```

Confirm the intended destination opens.

### Scenario E — responsive

Repeat the core interactions on mobile width.

---

# 21. Final report

When finished, report:

1. Files changed.
2. Dependency-direction fix.
3. Search domains verified.
4. Lifecycle restrictions verified/changed.
5. Keyboard behavior verified.
6. Responsive behavior verified.
7. Accessibility fixes.
8. Visual fixes.
9. Tests/build/lint results.
10. Any remaining issue that genuinely belongs to a later roadmap item.

Do not perform another general architecture audit.

The goal is to leave **Global Search + Command Palette genuinely finished**, then the next product capability can begin.

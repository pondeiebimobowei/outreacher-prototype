Continue from the current implementation. Do **not** rebuild the workspace architecture. The multi-workspace implementation is already in place and should remain.

This is the final structural cleanup pass for the prototype domain model.

The goal is to make the prototype's **canonical in-memory model genuinely match the simplified production domain model**, while keeping the prototype lightweight. Do not add backend infrastructure, APIs, Prisma, queues, email-provider mechanics, or production-only complexity.

## 1. Person must be the canonical global person entity

The canonical workspace model must contain:

```ts
people: Person[]
personCompanyAssociations: PersonCompanyAssociation[]
```

`Person` represents the person globally within the active workspace.

`PersonCompanyAssociation` represents the person's relationship to a specific company.

The association owns company-specific context such as:

* companyId
* personId
* title
* team
* whyThisPerson
* evidence
* conversationAngle
* source
* company-specific relationship context

### Required cleanup

`PersonCompanyAssociation.personId` must be required:

```ts
personId: string
```

Do not make it optional merely to accommodate legacy demo data.

The migration layer should convert:

```ts
contactId -> personId
```

when loading old localStorage data.

After migration, the canonical runtime objects should contain `personId` and should no longer depend on `contactId`.

Do not keep `contactId` as part of the canonical `PersonCompanyAssociation` interface.

It is acceptable for the migration function to temporarily read:

```ts
legacy.contactId
```

but the migrated object must become:

```ts
{
  id,
  personId,
  companyId,
  ...
}
```

## 2. Remove legacy contact terminology from the active model

The finished prototype should use:

* `Person`
* `PersonCompanyAssociation`
* `people`
* `personCompanyAssociations`
* `personId`
* `personCompanyAssociationId`

Do not keep active compatibility aliases such as:

```ts
Contact = Person
ContactAssociation = PersonCompanyAssociation
DEMO_CONTACT_ASSOCIATIONS
```

unless they are strictly required by a migration boundary.

The UI, selectors, search index, helpers, demo data, and domain logic should all use the new terminology.

Legacy storage compatibility is fine.

Legacy domain terminology inside the new application model is not.

## 3. Outreach relationships must use the new model

Make the canonical Outreach structure:

```ts
personId: string
personCompanyAssociationId: string
```

Use those fields everywhere the outreach represents a person-specific engagement.

Do not make the new identifiers optional solely to preserve the previous contact model.

Do not keep:

```ts
contactId
associationId
```

as parallel runtime relationships.

Legacy stored outreach records may be migrated:

```ts
contactId -> personId
associationId -> personCompanyAssociationId
```

then persisted back in the clean format.

Update:

* OutreachesPage
* OutreachDetailPage
* OutreachTab
* search
* campaign linkage
* conversation linkage
* contact/person navigation
* any helper functions

so the canonical path is:

```text
Workspace
  → Person
  → PersonCompanyAssociation
  → Outreach
```

## 4. Research must be an explicit entity

The Workspace canonical model must contain:

```ts
researches: Research[]
```

Research should represent the state of research for a company.

Keep it prototype-simple, but explicit.

A useful shape is conceptually:

```ts
Research {
  id
  workspaceId
  companyId
  status
  startedAt?
  completedAt?
  summary?
}
```

Use an appropriate simplified lifecycle such as:

```text
NOT_STARTED
IN_PROGRESS
COMPLETE
FAILED
```

Do not create a production job/queue model.

The Research UI must derive its state from the persisted `researches` collection.

Do not leave the existing ResearchTab dependent primarily on a separate mock/reference structure.

## 5. Evidence must be a first-class entity

The Workspace canonical model must contain:

```ts
evidence: Evidence[]
```

Evidence should represent factual supporting information.

It should be possible for evidence to be associated with:

* company
* research
* opportunity
* person

Keep the prototype model simple.

For example:

```ts
Evidence {
  id
  companyId
  researchId?
  opportunityId?
  personId?
  type
  title
  summary
  sourceLabel
  sourceUrl?
  observedAt?
}
```

The important point is that Evidence is not just a blob nested inside some unrelated mock object.

Research produces/organizes evidence.

Opportunities reason from evidence.

People can have evidence supporting why they are relevant.

## 6. Opportunity must be a first-class entity

The Workspace canonical model must contain:

```ts
opportunities: Opportunity[]
```

Use the existing Outreacher opportunity semantics:

```text
CONFIRMED
PROACTIVE
UNCLASSIFIED
```

and keep lifecycle simple:

```text
ACTIVE
CLOSED
SUPERSEDED
```

An Opportunity should belong to a company and may reference its supporting research/evidence.

The prototype does not need the full production schema.

The important structure is:

```text
Company
  ↓
Research
  ↓
Evidence
  ↓
Opportunity
```

The Opportunities list and detail pages must actually reconstruct from `ws.opportunities`.

Do not keep a parallel static opportunity source.

## 7. Company workspace must use the new graph

A Company Workspace should effectively expose:

```text
Company
 ├── Research
 │    └── Evidence
 │
 ├── Opportunities
 │
 ├── People
 │    └── PersonCompanyAssociations
 │
 ├── Outreach
 │
 ├── Campaigns
 │
 └── Conversations
```

Do not over-model this.

This is a prototype representation of the production graph, not a reproduction of the production backend.

## 8. Verify the migration properly

There are two different concerns:

### Legacy storage compatibility

Old localStorage may contain:

```ts
contacts
contactAssociations
contactId
associationId
```

The migration layer may read those fields.

### Canonical runtime state

After migration, `loadWorkspace()` must return only the new canonical model:

```ts
people
personCompanyAssociations
researches
evidence
opportunities
```

and new outreach relationships.

The UI should not need fallback expressions such as:

```ts
a.personId || a.contactId
```

throughout the application.

That is a sign that the migration boundary has leaked into the product model.

Put fallback logic in one migration/normalization layer instead.

## 9. Clean the demo data

Update demo data itself to use the canonical schema.

Do not leave demo associations looking like:

```ts
{
  contactId: "..."
}
```

and rely on runtime normalization.

The demo constants should already be valid canonical objects:

```ts
{
  personId: "..."
}
```

Likewise, demo Outreach records should already use:

```ts
personId
personCompanyAssociationId
```

Do not use compatibility aliases for demo data.

## 10. Preserve the existing Workspace implementation

Do not redesign:

* AppState
* activeWorkspaceId
* workspace switching
* workspace creation
* workspace rename
* WorkspaceContext
* sidebar workspace switcher

Keep the current architecture.

This pass is about domain cleanliness beneath that architecture.

## 11. Verify actual UI behavior, not just compilation

After the refactor, manually verify this exact flow in the prototype:

### Workspace isolation

Workspace A:

* has Company A
* has Person A
* has Company A research
* has evidence
* has an opportunity

Switch to Workspace B.

Workspace B must not show those records.

Switch back to Workspace A.

They must still exist.

### Person reuse

Create or use one Person.

Associate that same Person with two different companies.

Verify:

* Global Contacts shows the person once.
* Company A Contacts shows the person through Company A's association.
* Company B Contacts shows the same person through Company B's association.
* Company-specific title/reasoning changes do not overwrite the other association.
* Global person information remains shared.

### Research → Evidence → Opportunity

For a company:

1. Start research.
2. Research becomes IN_PROGRESS.
3. Complete research.
4. Evidence becomes visible.
5. Create/reclassify an Opportunity.
6. Opportunity detail displays the supporting evidence.
7. Company Workspace reflects the new state.

### Outreach

From a company/person association:

1. Prepare outreach.
2. Outreach is linked to `personId`.
3. Outreach is linked to `personCompanyAssociationId`.
4. Review/edit.
5. Mark ready.
6. Send.
7. Conversation linkage still works.

## 12. Keep the prototype philosophy

Do not add:

* real scraping
* research workers
* queues
* provider APIs
* secrets
* webhook handling
* idempotency
* email event infrastructure
* production suppression logic

The goal is:

**production-aligned domain concepts + prototype-level implementation**

not:

**production backend reproduced inside the frontend prototype.**

## 13. Responsive and accessibility requirements remain mandatory

Do not regress existing responsive behavior.

Verify:

* sidebar/workspace switcher on desktop
* drawer behavior on mobile
* horizontal tab overflow where needed
* cards stack correctly
* lists remain usable on narrow screens
* dialogs remain usable on mobile
* keyboard navigation remains intact
* visible focus states remain intact

## 14. Final cleanup rule

Search the codebase for these legacy runtime terms:

```text
contacts
contactAssociations
contactId
associationId
DEMO_CONTACT
ContactAssociation
Contact
```

For each result, classify it as either:

1. legitimate legacy-storage migration logic, or
2. stale application/domain logic.

Remove stale application/domain usage.

The only place legacy terminology should survive is the migration boundary needed to read old prototype localStorage.

## 15. Final validation

Run TypeScript/build validation.

Then report:

1. canonical Workspace model
2. canonical Person + PersonCompanyAssociation model
3. Research/Evidence/Opportunity implementation
4. Outreach relationship changes
5. migration behavior
6. UI flows verified
7. responsive/accessibility verification
8. any remaining known prototype limitation

Do not report “complete” merely because TypeScript passes.

Completion means the canonical model, persisted state, UI reconstruction, navigation, and cross-domain relationships all use the new model consistently.

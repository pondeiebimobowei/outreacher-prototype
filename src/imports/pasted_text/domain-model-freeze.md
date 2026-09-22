The previous domain cleanup is substantially complete. Do not redesign the architecture or introduce new backend concepts.

This is a final corrective and verification pass before the prototype's domain model is frozen.

There are three things to resolve.

## 1. Make the Outreach association relationship canonical and required

The canonical Outreach model must use:

```ts
personId: string
personCompanyAssociationId: string
```

Both are required for an outreach that engages a person at a company.

Do not leave:

```ts
personCompanyAssociationId?: string
```

in the canonical runtime type.

Do not restore:

```ts
contactId
associationId
```

to the runtime type.

Legacy stored records may still contain `contactId` / `associationId`, but `normalizeRecord()` must migrate them into:

```ts
personId
personCompanyAssociationId
```

before the object enters the canonical runtime model.

Update any demo Outreach records that do not currently contain the association ID.

Update any creation flows so they always know the relevant `PersonCompanyAssociation` before creating the Outreach record.

The intended graph is:

```text
Company
  ↓
PersonCompanyAssociation
  ↓
Outreach
  ↓
Conversation
```

Do not weaken that relationship merely to preserve an old creation path.

---

## 2. Remove the parallel ProtoContact data source from the company workspace

The current implementation reportedly still uses a static `ProtoContact` collection inside the company Contacts experience.

Do not keep a second source of truth for people.

The company Contacts experience must derive its displayed people from:

```ts
workspace.people
workspace.personCompanyAssociations
```

Use a small UI view-model/helper if needed.

For example, the UI may construct something conceptually like:

```ts
type CompanyContactView = {
  person: Person
  association: PersonCompanyAssociation
}
```

but that must be derived from the canonical workspace entities.

Do not create or maintain another static list of people containing duplicated:

* names
* emails
* titles
* companies
* whyThisPerson
* conversationAngle
* person IDs

The existing company Contacts UI can keep its current visual structure and interaction patterns.

Only its data source must change.

### Required behavior

For a company:

```text
Company
  → personCompanyAssociations filtered by companyId
  → personId
  → people lookup
```

Use that relationship to render the company Contacts tab.

When a person is shown for Company A, company-specific fields must come from the Company A association.

When the same person is shown for Company B, the Company B association must provide the company-specific context.

Global person information comes from `Person`.

Company-specific information comes from `PersonCompanyAssociation`.

---

## 3. Verify that Research, Evidence, and Opportunity are actually driving the UI

Do not merely verify that these arrays exist in `workspaceStore`.

Trace the actual UI.

### Research

`ResearchTab` must derive its current state from:

```ts
ws.researches
```

The research lifecycle should persist through the existing workspace persistence mechanism.

Starting or completing research should update the corresponding Research record.

### Evidence

`ResearchTab` and relevant Opportunity views must derive factual evidence from:

```ts
ws.evidence
```

Evidence should remain associated with the relevant company and, where applicable, research/opportunity/person.

Do not leave the primary displayed evidence coming from an unrelated static mock collection.

### Opportunities

`OpportunitiesPage`, `OpportunityDetailPage`, and the company Opportunities tab must derive records from:

```ts
ws.opportunities
```

Do not maintain a second static opportunity source.

The existing semantics remain:

```text
CONFIRMED
PROACTIVE
UNCLASSIFIED
```

with the existing lifecycle:

```text
ACTIVE
CLOSED
SUPERSEDED
```

Do not add production-only opportunity complexity.

---

## 4. Verify the canonical runtime model

After migration, the active workspace should conceptually look like:

```ts
{
  companies,
  people,
  personCompanyAssociations,
  researches,
  evidence,
  opportunities,
  outreaches,
  campaigns,
  conversations,
  ...
}
```

Legacy fields may be read inside the migration boundary only.

Search the application for:

```text
contactId
associationId
contacts
contactAssociations
DEMO_CONTACT
ProtoContact
```

Classify every result.

### Allowed

Legacy localStorage migration code.

User-facing language such as:

* "Contact"
* "Contacts"
* "Add contact"

because those are legitimate product terms.

### Not allowed

Application logic using:

```ts
contactId
associationId
contacts[]
contactAssociations[]
```

as canonical domain state.

A static `ProtoContact[]` containing duplicated person/company data is also not allowed.

---

## 5. Preserve the prototype-level scope

Do not add:

* APIs
* Prisma
* scraping workers
* queues
* email infrastructure
* provider APIs
* secrets
* webhooks
* production event models
* idempotency infrastructure

This remains a frontend prototype.

The objective is:

**production-aligned domain relationships with simplified prototype implementation.**

---

## 6. Verify the critical flows

Manually trace these flows after the cleanup.

### Person/company relationship

Use one Person associated with two companies.

Verify:

* Global Contacts shows the person once.
* Company A shows the person through Association A.
* Company B shows the same person through Association B.
* Company A title/reasoning does not overwrite Company B.
* Editing global person information updates both views.

### Outreach

From a company person association:

```text
Person
→ PersonCompanyAssociation
→ Prepare Outreach
→ Review
→ Ready
→ Sent
→ Conversation
```

Verify the resulting Outreach contains both:

```ts
personId
personCompanyAssociationId
```

### Research

```text
Company
→ Start Research
→ Research persists
→ Evidence appears
→ Research completes
```

### Opportunity

```text
Company
→ Evidence
→ Opportunity
→ Opportunity detail
```

Verify Opportunity detail is reading the persisted Opportunity/Evidence entities.

### Workspace isolation

Switch between two workspaces and verify that:

* people do not leak
* associations do not leak
* research does not leak
* evidence does not leak
* opportunities do not leak
* outreaches do not leak

---

## 7. Final validation

Run the TypeScript/build checks.

Then report only:

1. what canonical entities are now being used
2. whether Outreach has required person + association relationships
3. whether company Contacts now derive from Person + PersonCompanyAssociation
4. whether Research/Evidence/Opportunity screens use persisted workspace entities
5. whether any legacy runtime model remains
6. any genuinely remaining prototype limitation

Do not report completion solely because TypeScript passes.

The prototype is ready to freeze only when:

```text
Workspace
  ├── Company
  │     ├── Research
  │     ├── Evidence
  │     ├── Opportunity
  │     ├── PersonCompanyAssociation
  │     ├── Outreach
  │     ├── Campaign
  │     └── Conversation
  │
  └── Person
```

is the actual model used by the UI rather than merely the type structure underneath it.

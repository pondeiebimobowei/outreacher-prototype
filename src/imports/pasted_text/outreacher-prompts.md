# Prompt 1 — Auth + Onboarding

Extend the existing Outreacher prototype. Do not redesign or replace the existing dashboard, sidebar, header, typography, spacing, colors, cards, or visual language. Reuse the established design system.

Now build the unauthenticated and first-time onboarding experience.

Create:

1. Sign up
2. Log in
3. Forgot password
4. Career profile onboarding

The onboarding should feel like entering a focused career workspace, not a generic SaaS signup.

Signup should ask only for essential account information.

After signup, guide the user through a concise career profile:
• Name
• Current/target role
• Years of experience
• Core skills
• Career goals
• Short professional summary
• Optional portfolio/GitHub/LinkedIn links

Use progressive disclosure rather than one enormous form.

Show a clear progress indicator.

The final step should transition naturally into the authenticated Outreacher dashboard.

Use calm, premium, evidence-first visual design. Avoid unnecessary illustrations, marketing sections, pricing, testimonials, or generic SaaS decoration.

Create realistic loading, validation, error, disabled, and success states.

# Prompt 2 — Career Profile

Extend the existing Outreacher prototype without changing the established shell or visual system.

Build the authenticated Career Profile page.

The user should be able to view and edit the profile created during onboarding.

Structure it into clear sections:
• Personal information
• Professional identity
• Skills
• Career goals
• Professional summary
• Links
• Profile completeness

Make profile completeness useful, not gamified.

Show how profile information will help Outreacher produce relevant company research and outreach.

Include:
• Edit actions
• Save states
• Unsaved changes handling
• Validation
• Success feedback
• Empty states where appropriate

Do not add speculative profile fields.

Keep the experience focused and professional. This is configuration that powers the user's career outreach, not a social profile.

# Prompt 3 — Companies

Extend the existing Outreacher app using the same established shell, sidebar, header, typography, spacing, cards, and visual language.

Build the Companies page.

The Companies page is the primary entry point for targeting companies.

Create:
• Page header: “Companies”
• Search
• Add company action
• Filters
• Company list/grid
• Opportunity state
• Last activity
• Current next action

Each company should communicate its relationship with the user.

Example companies:
Stripe
Paystack
Flutterwave
Vercel
Kuda
Moniepoint

Do not turn this into a generic CRM table.

A company row/card should make it easy to understand:
• Company
• Current opportunity state: CONFIRMED / PROACTIVE / UNCLASSIFIED
• Research status
• Contacts discovered
• Outreach status
• Next action

Add an empty state explaining how to add the first company.

Create realistic loading, error, and no-results states.

Clicking a company should open its Company Workspace.

# Prompt 4 — Company Workspace

Extend the existing Outreacher prototype without changing the established global shell.

Build the Company Workspace opened from a company.

This is the central working environment for one target company.

Header:
Company name
Website/domain
Opportunity state
Primary next action

Inside the workspace create contextual navigation:
• Overview
• Research
• Opportunities
• Contacts
• Outreach

Do NOT put Research into the global sidebar. It belongs inside the company journey.

Overview should summarize:
• Company identity
• Why this company matters to the user
• Current opportunity state
• Evidence available
• Relevant contacts
• Outreach progress
• Current next action

Make the next action visually obvious.

Use evidence-oriented language. Distinguish known facts from interpretation.

The workspace should feel like a focused investigation into one company, not a generic CRM record.

Include realistic empty, loading, error, and completed states.

# Prompt 5 — Company Research

Extend the existing Company Workspace.

Build the Research experience.

The purpose is to help the user understand whether and why this company is worth pursuing.

Structure research into useful evidence groups:
• Company overview
• Relevant business/product signals
• Engineering/team signals
• Hiring/opening signals
• Recent relevant activity
• Sources/evidence

Clearly distinguish:
FACT
INFERENCE
UNKNOWN

Never present an inference as confirmed fact.

If an actual relevant opening is discovered, show the evidence and source clearly.

If no opening is confirmed, the user may still establish a PROACTIVE opportunity when sufficient company-fit evidence exists.

Provide:
• Research status
• Refresh/research action
• Evidence timestamps
• Source references
• Expandable evidence details

Avoid turning this into a news reader or analytics dashboard.

The primary action should help the user establish the appropriate opportunity state.

# Prompt 6 — Opportunities

Extend the existing Company Workspace and global Opportunities navigation.

Build the Opportunities experience around Outreacher's three domain states:

CONFIRMED
Actual evidence of a relevant opening exists.

PROACTIVE
No relevant opening is confirmed, but company-fit and evidence justify pursuing a relationship.

UNCLASSIFIED
Insufficient evidence exists to confidently classify the opportunity.

Create:
• Opportunity list
• State filters
• Opportunity cards/rows
• Evidence summary
• Company
• Relevant role/opening when confirmed
• Current next action

Each opportunity should clearly explain WHY it has its current state.

Do not use generic sales stages such as Lead, Qualified, Won, Lost.

The interface should help the user move from uncertainty toward a justified next action.

Make state changes deliberate and explain their consequences.

# Prompt 7 — Contacts + Evidence

Extend the Company Workspace.

Build Contacts and contact discovery.

The purpose is to discover people who are credible recipients for career outreach.

Show:
• Contact name
• Role
• Company
• Relevance to user's target
• Evidence supporting relevance
• Discovery source
• Selection state

Include filtering by role/relevance.

A contact should never appear as simply “recommended” without context.

Create an evidence panel showing WHY this person may be relevant.

Allow the user to select one contact as the outreach recipient.

Make selection explicit and reversible.

Include:
• Loading
• No contacts found
• Search
• Evidence unavailable
• Selection confirmation

Avoid sales-lead terminology where it does not fit the career context.

The user should feel they are selecting a credible professional conversation target.

# Prompt 8 — Outreach Generation + Human Review

Extend the selected-contact journey.

Build the outreach generation and review experience.

The selected contact is the intended recipient.

Show the context used to generate the message:
• User career profile
• Company evidence
• Opportunity state
• Contact evidence

Clearly label AI-generated content:
“AI Assisted — Review Required”

Generate a concise personalized outreach draft grounded only in available evidence.

Never invent:
• Experience
• Company facts
• Contact facts
• Roles
• Relationships
• Achievements

The user must be able to:
• Edit the message
• Regenerate
• Review supporting evidence
• See recipient
• Approve the draft

Separate generation from approval.

Do not make sending automatic from this screen.

The primary action should be explicit human approval.

# Prompt 9 — Campaigns

Extend the existing Outreacher prototype using the same established design system.

Build Campaigns.

A campaign groups approved outreach for selected contacts.

Campaign states:
DRAFT
ACTIVE
PAUSED
ARCHIVED

Create:
• Campaign list
• Campaign detail
• Selected contacts
• Approved outreach messages
• Sending status
• Follow-up status
• Campaign controls

Campaign creation should show what contacts/messages are being included before activation.

Keep human approval separate from campaign activation.

Show clear status and consequences for actions such as activating, pausing, and archiving.

Do not create a generic marketing automation dashboard.

Outreacher campaigns are career outreach workflows focused on meaningful conversations, not email volume.

# Prompt 10 — Replies / Inbox

Extend the existing Outreacher prototype.

Build the Replies / Inbox experience.

The inbox should connect conversations back to:
• Company
• Contact
• Opportunity
• Campaign

Create:
• Conversation list
• Conversation detail
• Reply status
• Company/contact context
• Relevant evidence
• Next action

Prioritize meaningful conversation management.

Examples:
• Reply received
• Follow-up due
• Conversation active
• Conversation stopped
• Outcome recorded

When a reply is received, make it obvious which company and contact it belongs to.

Allow the user to stop future follow-ups when appropriate.

Do not make this look like a generic email client. The conversation exists in the context of a career opportunity.

# Prompt 11 — Settings

Extend the existing Outreacher prototype without changing the existing shell.

Build Settings as a durable configuration hub.

Sections:
• Account
• Career Profile
• Preferences
• Notifications
• Security
• Integrations
• Sender Accounts

Keep workflow screens out of Settings.

Integrations should handle supported email-provider infrastructure.

Sender Accounts should represent sender identity and readiness.

Make personal versus workspace configuration clear wherever relevant.

Every setting should communicate:
• Current value
• What it affects
• Whether changes save immediately
• Whether a change has consequences

Do not invent unsupported settings or speculative AI controls.

Preserve the established premium, minimal visual language.

# Prompt 12 — Final Product UX Pass

Now perform a complete UX consistency pass across the entire Outreacher prototype.

Do not redesign the product or introduce new features.

Audit and refine all existing screens so they feel like one coherent product.

Preserve:
• Fixed collapsible sidebar
• Fixed global header
• Main content scroll only
• Global search
• Notifications
• Avatar menu
• Existing typography
• Existing spacing
• Existing visual language

Ensure the navigation consistently follows:

Dashboard
Companies
Opportunities
Contacts
Campaigns
Replies
Settings
Help

Ensure the product journey is coherent:

Career Profile
→ Company
→ Research
→ Opportunity State
→ Contact Discovery
→ Evidence Review
→ Contact Selection
→ Outreach Generation
→ Human Review
→ Campaign
→ Send
→ Reply
→ Outcome

Audit every screen for:
• Loading
• Empty
• Error
• Success
• Disabled
• Confirmation
• Keyboard/focus behavior
• Clear primary action
• Clear next action
• WCAG 2.2 AA accessibility

Make desktop the primary polished experience while ensuring the layouts adapt cleanly to tablet and mobile.

The final result should feel like one intentional career-outreach product, not a collection of unrelated SaaS screens.

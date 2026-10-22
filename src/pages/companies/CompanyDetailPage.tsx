import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Icon, icons } from '../../lib/icons'
import {
  type CompanyEntry,
  type OppStatus,
  type RelationshipStatus,
  loadWorkspace,
  saveWorkspace,
  newCompanyEntry,
  DEMO_ENTRIES,
  DEMO_CAMPAIGNS,
  DEMO_TEMPLATES,
  CONV_OUTCOME_LABELS,
  deriveRelationshipStatus,
} from '../../lib/workspaceStore'
import { ResearchTab } from './ResearchTab'
import { OpportunitiesTab } from './OpportunitiesTab'
import { ContactsTab, getContactData } from './ContactsTab'
import { OutreachTab } from './OutreachTab'
import { CampaignTab } from './CampaignTab'
import { ConversationTab } from './ConversationTab'

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkspaceTab = 'Overview' | 'Research' | 'Opportunities' | 'Contacts' | 'Outreach' | 'Campaign' | 'Conversation'
type JourneyStage = 'Research' | 'Opportunity' | 'Contacts' | 'Outreach' | 'Campaign' | 'Conversation'
type StageStatus = 'pending' | 'active' | 'complete'

type ActivityEvent = {
  type: 'company-added' | 'research-started' | 'research-complete' | 'opportunity-changed'
  | 'contacts-found' | 'outreach-drafted' | 'outreach-sent' | 'reply-received'
  text: string
  time: string
  isRecent?: boolean
}

// ─── Content data (rich per-company content; not lifecycle state) ──────────────

type ContentData = {
  description: string
  opportunityExplanation: string
  addedAt: string
  lastActivity: string
  activity: ActivityEvent[]
}

const CONTENT_DATA: Record<string, ContentData> = {
  stripe: {
    description: 'Financial infrastructure for the internet.',
    opportunityExplanation: 'Research identified signals consistent with a relevant opening on Stripe\'s engineering team. This is classified as CONFIRMED because there is direct evidence — not inference — of a potential opportunity matching your target role.',
    addedAt: '15 Sep 2026', lastActivity: '2 hours ago',
    activity: [
      { type: 'contacts-found', text: '3 contacts identified', time: '2 hr ago', isRecent: true },
      { type: 'opportunity-changed', text: 'Opportunity classified as CONFIRMED', time: '18 Sep 2026' },
      { type: 'research-complete', text: 'Research completed', time: '18 Sep 2026' },
      { type: 'research-started', text: 'Research started', time: '15 Sep 2026' },
      { type: 'company-added', text: 'Company added to workspace', time: '15 Sep 2026' },
    ],
  },
  kuda: {
    description: 'The bank of the free. Digital banking for Nigerians.',
    opportunityExplanation: 'A relevant opening at Kuda was confirmed through research. Outreach was sent to Alex Obi and a reply has been received. The opportunity is now in an active conversation stage.',
    addedAt: '12 Sep 2026', lastActivity: '1 hour ago',
    activity: [
      { type: 'reply-received', text: 'Reply received from Alex Obi', time: '1 hr ago', isRecent: true },
      { type: 'outreach-sent', text: 'Outreach sent to Alex Obi', time: '17 Sep 2026' },
      { type: 'outreach-drafted', text: 'Outreach draft reviewed and approved', time: '16 Sep 2026' },
      { type: 'contacts-found', text: '2 contacts identified · Alex Obi selected', time: '14 Sep 2026' },
      { type: 'opportunity-changed', text: 'Opportunity classified as CONFIRMED', time: '14 Sep 2026' },
      { type: 'research-complete', text: 'Research completed', time: '13 Sep 2026' },
      { type: 'company-added', text: 'Company added to workspace', time: '12 Sep 2026' },
    ],
  },
  vercel: {
    description: 'Frontend cloud platform for developers.',
    opportunityExplanation: 'No confirmed opening was found at Vercel. However, research found meaningful signals about the engineering team\'s growth direction. This is a PROACTIVE opportunity — it may be worth reaching out even without a confirmed role.',
    addedAt: '16 Sep 2026', lastActivity: '12 min ago',
    activity: [
      { type: 'research-complete', text: 'Research completed', time: '12 min ago', isRecent: true },
      { type: 'opportunity-changed', text: 'Opportunity classified as PROACTIVE', time: '12 min ago', isRecent: true },
      { type: 'research-started', text: 'Research started', time: '16 Sep 2026' },
      { type: 'company-added', text: 'Company added to workspace', time: '16 Sep 2026' },
    ],
  },
  paystack: {
    description: 'Modern online and offline payments for Africa.',
    opportunityExplanation: 'No confirmed opening was found at Paystack. Research revealed strong company-fit evidence. This is a PROACTIVE opportunity — the goal is to establish a relationship, not respond to a listed role.',
    addedAt: '10 Sep 2026', lastActivity: 'Yesterday',
    activity: [
      { type: 'contacts-found', text: '2 contacts identified', time: 'Yesterday', isRecent: true },
      { type: 'opportunity-changed', text: 'Opportunity classified as PROACTIVE', time: '18 Sep 2026' },
      { type: 'research-complete', text: 'Research completed', time: '18 Sep 2026' },
      { type: 'research-started', text: 'Research started', time: '10 Sep 2026' },
      { type: 'company-added', text: 'Company added to workspace', time: '10 Sep 2026' },
    ],
  },
  flutterwave: {
    description: 'Payments technology for global expansion.',
    opportunityExplanation: 'Research is in progress. Flutterwave will be classified as CONFIRMED, PROACTIVE, or returned as insufficient evidence once research is complete.',
    addedAt: '17 Sep 2026', lastActivity: '3 hours ago',
    activity: [
      { type: 'research-started', text: 'Research started', time: '3 hr ago', isRecent: true },
      { type: 'company-added', text: 'Company added to workspace', time: '17 Sep 2026' },
    ],
  },
  linear: {
    description: 'Purpose-built software for modern product teams.',
    opportunityExplanation: 'Linear has been added as a potential PROACTIVE opportunity. Research hasn\'t started yet — once complete, Outreacher will determine whether company-fit evidence supports proactive outreach.',
    addedAt: '18 Sep 2026', lastActivity: '2 days ago',
    activity: [
      { type: 'company-added', text: 'Company added to workspace', time: '2 days ago' },
    ],
  },
  moniepoint: {
    description: 'Business banking and payments for African businesses.',
    opportunityExplanation: 'Moniepoint was recently added. There is not yet enough information to classify this opportunity. Starting research will help determine whether to pursue this company.',
    addedAt: '17 Sep 2026', lastActivity: '3 days ago',
    activity: [
      { type: 'company-added', text: 'Company added to workspace', time: '3 days ago' },
    ],
  },
}

function defaultContent(entry: CompanyEntry): ContentData {
  return {
    description: `${entry.name} has been added to your workspace.`,
    opportunityExplanation: entry.oppStatus === 'UNCLASSIFIED'
      ? 'This company has been added. Start research to gather the evidence needed to classify this opportunity.'
      : entry.oppStatus === 'PROACTIVE'
        ? 'Company fit suggests this may be worth pursuing proactively. Research will help confirm whether there is a credible basis for outreach.'
        : 'A relevant opening has been noted. Research will help confirm the details.',
    addedAt: entry.addedAt,
    lastActivity: entry.lastActivity,
    activity: [
      { type: 'company-added', text: 'Company added to workspace', time: entry.addedAt },
    ],
  }
}

// ─── Derived lifecycle helpers ────────────────────────────────────────────────

const oppConfig: Record<OppStatus, { color: string; bg: string; border: string; dot: string }> = {
  CONFIRMED: { color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981' },
  PROACTIVE: { color: '#3730A3', bg: '#EEF2FF', border: '#C7D2FE', dot: '#4F46E5' },
  UNCLASSIFIED: { color: '#713F12', bg: '#FEFCE8', border: '#FDE68A', dot: '#F59E0B' },
}

const MONOGRAM_COLORS: Record<string, { bg: string; text: string }> = {
  kuda: { bg: '#1B4DFF', text: '#fff' }, stripe: { bg: '#635BFF', text: '#fff' },
  paystack: { bg: '#00C3F7', text: '#fff' }, vercel: { bg: '#0E1726', text: '#fff' },
  flutterwave: { bg: '#F5A623', text: '#fff' }, linear: { bg: '#5E6AD2', text: '#fff' },
  moniepoint: { bg: '#0066FF', text: '#fff' },
}

const ACTIVITY_COLORS: Record<ActivityEvent['type'], string> = {
  'company-added': '#94A3B8', 'research-started': '#4F46E5', 'research-complete': '#4F46E5',
  'opportunity-changed': '#F59E0B', 'contacts-found': '#10B981', 'outreach-drafted': '#8B5CF6',
  'outreach-sent': '#8B5CF6', 'reply-received': '#10B981',
}

const REL_STATUS_CFG: Record<RelationshipStatus, { label: string; color: string; bg: string; border: string; dot: string; desc: string }> = {
  OPEN: { label: 'Open', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', dot: '#3B82F6', desc: 'Conversation is ongoing.' },
  OPPORTUNITY: { label: 'Opportunity', color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981', desc: 'Concrete career opportunity identified.' },
  NURTURE: { label: 'Nurture', color: '#92400E', bg: '#FEF3C7', border: '#FDE68A', dot: '#F59E0B', desc: 'Worth maintaining — no immediate action.' },
  CLOSED: { label: 'Closed', color: '#374151', bg: '#F3F4F6', border: '#E5E7EB', dot: '#9CA3AF', desc: 'This outreach cycle is complete.' },
}

const OUTCOME_DOTS: Record<string, string> = {
  INTERESTED: '#10B981', FOLLOW_UP_LATER: '#F59E0B', REFERRED: '#3B82F6',
  APPLICATION: '#8B5CF6', NOT_A_FIT: '#EF4444', NOT_HIRING: '#F59E0B',
  NO_RESPONSE: '#9CA3AF', CLOSED: '#6B7280',
}

const JOURNEY_STAGES: JourneyStage[] = ['Research', 'Opportunity', 'Contacts', 'Outreach', 'Campaign', 'Conversation']

const STAGE_TO_TAB: Partial<Record<JourneyStage, WorkspaceTab>> = {
  Research: 'Research', Opportunity: 'Opportunities', Contacts: 'Contacts',
  Outreach: 'Outreach', Campaign: 'Campaign', Conversation: 'Conversation',
}

function deriveStages(entry: CompanyEntry): Record<JourneyStage, StageStatus> {
  const researchDone = entry.researchStage === 'COMPLETE'
  const oppClassified = entry.oppStatus !== 'UNCLASSIFIED'
  const contactsSelected = entry.contactStage === 'SELECTED'
  const contactsDiscovered = entry.contactStage === 'DISCOVERED' || entry.contactStage === 'DISCOVERING'
  const outreachDone = entry.outreachStage === 'SENT' || entry.outreachStage === 'READY'
  const outreachActive = entry.outreachStage === 'DRAFT'
  const outreachSent = entry.outreachStage === 'SENT'
  const campaignDone = entry.campaignStage === 'SENT' || entry.campaignStage === 'READY'
  const campaignActive = entry.campaignStage === 'SETUP'
  const convStopped = entry.convStage === 'STOPPED'
  const convReplied = entry.convStage === 'REPLIED' || entry.convStage === 'ACTIVE'
  const followUpActive = entry.followUpStage === 'DUE' || entry.followUpStage === 'DRAFT'

  return {
    Research: researchDone ? 'complete' : 'active',
    Opportunity: oppClassified ? 'complete' : researchDone ? 'active' : 'pending',
    Contacts: contactsSelected ? 'complete' : contactsDiscovered ? 'active' : oppClassified ? 'pending' : 'pending',
    Outreach: outreachDone ? 'complete' : outreachActive ? 'active' : contactsSelected ? 'pending' : 'pending',
    Campaign: campaignDone ? 'complete' : campaignActive ? 'active' : outreachDone ? 'pending' : 'pending',
    Conversation: (convStopped || !!entry.convOutcome) ? 'complete' : (convReplied || followUpActive || outreachSent) ? 'active' : 'pending',
  }
}

type NextStepShape = {
  heading: string
  guidance: string
  cta: string
  ctaTab: WorkspaceTab
  isWaiting?: boolean
  isUrgent?: boolean
}

function deriveNextStep(entry: CompanyEntry, companyName: string): NextStepShape {
  // Post-outcome: relationship status takes priority
  if (entry.convOutcome) {
    const relStatus = deriveRelationshipStatus(entry)
    if (relStatus === 'OPPORTUNITY') {
      return {
        heading: 'Active opportunity',
        guidance: `This conversation with ${companyName} resulted in a concrete opportunity. Continue the relationship and follow through on what was discussed.`,
        cta: 'View conversation', ctaTab: 'Conversation',
      }
    }
    if (relStatus === 'NURTURE') {
      if (entry.convOutcome === 'FOLLOW_UP_LATER') {
        return {
          heading: 'Reconnect when the time is right',
          guidance: `${companyName} asked you to follow up later. Monitor for new openings and reconnect when there is a relevant reason.`,
          cta: 'View conversation', ctaTab: 'Conversation', isWaiting: true,
        }
      }
      return {
        heading: 'Stay connected',
        guidance: `${companyName} is not hiring right now. Watch for future hiring signals and reconnect when the timing is right.`,
        cta: 'View conversation', ctaTab: 'Conversation', isWaiting: true,
      }
    }
    if (relStatus === 'CLOSED') {
      return {
        heading: 'Journey complete',
        guidance: `This outreach cycle with ${companyName} is complete. Your conversation history and outcome are preserved.`,
        cta: 'View history', ctaTab: 'Conversation', isWaiting: true,
      }
    }
  }

  if (entry.convStage === 'STOPPED') {
    return {
      heading: 'Conversation stopped',
      guidance: `Follow-ups with ${companyName} have been stopped. You can review the conversation history or record an outcome.`,
      cta: 'View conversation', ctaTab: 'Conversation',
    }
  }
  if (entry.convStage === 'ACTIVE') {
    return {
      heading: 'Conversation active',
      guidance: `A reply was received from ${companyName}. Review the conversation and record an outcome when you're ready.`,
      cta: 'View conversation', ctaTab: 'Conversation', isUrgent: true,
    }
  }
  if (entry.convStage === 'REPLIED') {
    return {
      heading: 'Reply received',
      guidance: `A reply has been received. Review the message and decide how to respond. A timely, considered reply keeps the conversation going.`,
      cta: 'View reply', ctaTab: 'Conversation', isUrgent: true,
    }
  }
  if (entry.followUpStage === 'DUE') {
    const num = (entry.followUpCount ?? 0) + 1
    return {
      heading: `Follow-up #${num} due`,
      guidance: `Four business days have passed without a reply. A follow-up draft is ready to review and send${num >= 2 ? ' — this will be the final follow-up' : ''}.`,
      cta: 'Review follow-up', ctaTab: 'Conversation', isUrgent: true,
    }
  }
  if (entry.followUpStage === 'DRAFT') {
    const num = (entry.followUpCount ?? 0) + 1
    return {
      heading: `Follow-up #${num} draft ready`,
      guidance: `A follow-up draft has been prepared for ${companyName}. Review the message and send it when ready.`,
      cta: 'Review draft', ctaTab: 'Conversation',
    }
  }
  if (entry.outreachStage === 'SENT') {
    return {
      heading: 'Awaiting reply',
      guidance: `Your outreach was sent to ${companyName}. Use the Conversation tab to track the reply, simulate a response, or stop follow-ups.`,
      cta: 'View conversation', ctaTab: 'Conversation', isWaiting: true,
    }
  }
  if (entry.campaignStage === 'READY') {
    return {
      heading: 'Ready to send',
      guidance: `Your campaign is created and ready for final review. Review the message, then send your outreach.`,
      cta: 'Send outreach', ctaTab: 'Campaign',
    }
  }
  if (entry.campaignStage === 'SETUP') {
    return {
      heading: 'Complete campaign setup',
      guidance: `Your outreach draft has been approved. Review the campaign summary, confirm the name, and create the campaign.`,
      cta: 'Continue setup', ctaTab: 'Campaign',
    }
  }
  if (entry.outreachStage === 'READY') {
    return {
      heading: 'Ready to send',
      guidance: `Your outreach draft is ready. Review the message one last time, then send your outreach to start the conversation.`,
      cta: 'Send outreach', ctaTab: 'Outreach',
    }
  }
  if (entry.outreachStage === 'DRAFT') {
    return {
      heading: 'Review your outreach draft',
      guidance: `A draft has been generated based on your research, opportunity context, and selected contact. Review it, make any edits, and approve when ready.`,
      cta: 'Review draft', ctaTab: 'Outreach',
    }
  }
  if (entry.contactStage === 'SELECTED') {
    return {
      heading: 'Prepare outreach',
      guidance: `A contact has been selected. Outreacher will draft a personalised message grounded in your career profile, company evidence, and contact relevance. You must review and approve before anything is sent.`,
      cta: 'Prepare outreach', ctaTab: 'Outreach',
    }
  }
  if (entry.contactStage === 'DISCOVERED' || entry.contactStage === 'DISCOVERING') {
    return {
      heading: 'Review identified contacts',
      guidance: `Contacts have been identified at ${companyName}. Review each contact's role and supporting evidence before selecting one for outreach.`,
      cta: 'Review contacts', ctaTab: 'Contacts',
    }
  }
  if (entry.researchStage === 'COMPLETE' && entry.oppStatus !== 'UNCLASSIFIED') {
    return {
      heading: 'Find relevant contacts',
      guidance: `Research is complete and the opportunity has been classified. The next step is to find the right person to approach at ${companyName}.`,
      cta: 'Find contacts', ctaTab: 'Contacts',
    }
  }
  if (entry.researchStage === 'COMPLETE') {
    return {
      heading: 'Review research findings',
      guidance: `Research is complete. Review the findings to understand whether sufficient company-fit evidence exists to pursue this relationship, and classify the opportunity.`,
      cta: 'Review opportunity', ctaTab: 'Opportunities',
    }
  }
  if (entry.researchStage === 'IN_PROGRESS') {
    return {
      heading: 'Research is in progress',
      guidance: `Outreacher is gathering company signals for ${companyName}. Once complete, it will determine whether this is a CONFIRMED, PROACTIVE, or insufficient opportunity.`,
      cta: 'View progress', ctaTab: 'Research', isWaiting: true,
    }
  }
  return {
    heading: 'Research this company',
    guidance: `Research hasn't been started yet. Outreacher will look for company signals, team composition, hiring activity, and evidence relevant to your target role.`,
    cta: 'Start research', ctaTab: 'Research',
  }
}

function derivePrimaryAction(entry: CompanyEntry): { cta: string; ctaTab: WorkspaceTab } {
  const step = deriveNextStep(entry, '')
  return { cta: step.cta, ctaTab: step.ctaTab }
}

function deriveWorkflowLabel(entry: CompanyEntry): string {
  if (entry.convOutcome) {
    const relStatus = deriveRelationshipStatus(entry)
    if (relStatus === 'OPPORTUNITY') return `Outcome: ${CONV_OUTCOME_LABELS[entry.convOutcome]} · Active opportunity`
    if (relStatus === 'NURTURE') return `Outcome: ${CONV_OUTCOME_LABELS[entry.convOutcome]} · Nurture relationship`
    if (relStatus === 'CLOSED') return `Outcome: ${CONV_OUTCOME_LABELS[entry.convOutcome]} · Journey complete`
  }
  if (entry.convStage === 'STOPPED') return 'Conversation stopped'
  if (entry.convStage === 'ACTIVE') return 'Reply received · Conversation active'
  if (entry.convStage === 'REPLIED') return 'Reply received · Awaiting response'
  if (entry.followUpStage === 'DUE') return 'Follow-up due · Review before sending'
  if (entry.followUpStage === 'DRAFT') return 'Follow-up drafted · Ready to send'
  if (entry.followUpStage === 'SENT') return 'Follow-up sent · Awaiting reply'
  if (entry.outreachStage === 'SENT') return 'Outreach sent · Awaiting reply'
  if (entry.campaignStage === 'READY') return 'Campaign ready · Ready to send'
  if (entry.campaignStage === 'SETUP') return 'Campaign setup in progress'
  if (entry.outreachStage === 'READY') return 'Draft approved · Ready to send'
  if (entry.outreachStage === 'DRAFT') return 'Outreach draft ready for review'
  if (entry.contactStage === 'SELECTED') return 'Contact selected · Prepare outreach'
  if (entry.contactStage === 'DISCOVERED') return 'Contacts identified · Awaiting review'
  if (entry.contactStage === 'DISCOVERING') return 'Contact discovery in progress'
  if (entry.researchStage === 'COMPLETE' && entry.oppStatus !== 'UNCLASSIFIED') return 'Ready for contact discovery'
  if (entry.researchStage === 'COMPLETE') return 'Research complete · Review findings'
  if (entry.researchStage === 'IN_PROGRESS') return 'Research in progress'
  return 'Newly added'
}

// ─── Journey Complete Card ────────────────────────────────────────────────────

function JourneyCompleteCard({ entry, contactName, onAction }: {
  entry: CompanyEntry
  contactName?: string
  onAction: (tab: WorkspaceTab) => void
}) {
  const relStatus = deriveRelationshipStatus(entry)
  if (!relStatus || !entry.convOutcome) return null
  const relCfg = REL_STATUS_CFG[relStatus]
  const outcomeLabel = CONV_OUTCOME_LABELS[entry.convOutcome]
  const hasReply = entry.convStage === 'ACTIVE' || entry.convStage === 'REPLIED' || entry.convStage === 'STOPPED'
  const steps = [
    contactName ? `Outreach sent to ${contactName}` : 'Outreach sent',
    hasReply ? (contactName ? `${contactName} replied` : 'Reply received') : null,
    `Outcome: ${outcomeLabel}`,
  ].filter(Boolean) as string[]

  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderLeft: `3px solid ${relCfg.dot}` }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
          Initial outreach complete
        </p>
        <span
          className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: relCfg.bg, color: relCfg.color, border: `1px solid ${relCfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: relCfg.dot }} />
          {relCfg.label}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 mb-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: i === steps.length - 1 ? OUTCOME_DOTS[entry.convOutcome!] : '#10B981' }} />
            <span className="text-[12.5px]" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
              {step}
            </span>
          </div>
        ))}
      </div>
      {entry.convOutcomeNote && (
        <p className="text-[12px] leading-relaxed italic mb-3" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          "{entry.convOutcomeNote}"
        </p>
      )}
      <button
        onClick={() => onAction('Conversation')}
        className="text-[12.5px] font-semibold flex items-center gap-1"
        style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      >
        View full conversation <Icon d={icons.arrowRight} size={12} />
      </button>
    </div>
  )
}

// ─── Relationship Status Card (sidebar) ───────────────────────────────────────

function RelationshipStatusCard({ entry }: { entry: CompanyEntry }) {
  const relStatus = deriveRelationshipStatus(entry)
  if (!relStatus || !entry.convOutcome) return null
  const relCfg = REL_STATUS_CFG[relStatus]
  const outcomeLabel = CONV_OUTCOME_LABELS[entry.convOutcome]

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <p className="text-[13px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Relationship</p>
      </div>
      <div className="px-5 py-4 flex flex-col gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            Status
          </p>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: relCfg.bg, color: relCfg.color, border: `1px solid ${relCfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: relCfg.dot }} />
            {relCfg.label}
          </span>
          <p className="text-[11.5px] mt-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            {relCfg.desc}
          </p>
        </div>
        <div style={{ height: 1, background: 'var(--color-border)' }} />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
            Outcome
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: OUTCOME_DOTS[entry.convOutcome] }} />
            <span className="text-[13px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {outcomeLabel}
            </span>
          </div>
          {entry.convOutcomeNote && (
            <p className="text-[12px] leading-relaxed italic mt-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
              "{entry.convOutcomeNote}"
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Stay Connected Card (sidebar, NURTURE) ───────────────────────────────────

function StayConnectedCard({ entry, onAction }: {
  entry: CompanyEntry
  onAction: (tab: WorkspaceTab) => void
}) {
  const relStatus = deriveRelationshipStatus(entry)
  if (relStatus !== 'NURTURE') return null

  const isFollowUpLater = entry.convOutcome === 'FOLLOW_UP_LATER'
  const prompt = isFollowUpLater
    ? 'They asked you to reconnect later. Monitor for openings and reach out when relevant.'
    : 'Not hiring right now. Watch for hiring signals and reconnect when the timing is right.'

  return (
    <div className="rounded-xl p-5" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
      <p className="text-[10.5px] font-bold uppercase tracking-wide mb-2" style={{ color: '#92400E', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
        Stay connected
      </p>
      <p className="text-[12.5px] leading-relaxed mb-3" style={{ color: '#78350F', fontFamily: 'Inter, sans-serif' }}>
        {prompt}
      </p>
      <button
        onClick={() => onAction('Conversation')}
        className="text-[12px] font-semibold flex items-center gap-1"
        style={{ color: '#B45309', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      >
        View relationship <Icon d={icons.arrowRight} size={12} />
      </button>
    </div>
  )
}

// ─── Journey Progression ────────────────────────────────────────────────────────

function getStageLabel(stage: JourneyStage, entry: CompanyEntry): string {
  switch (stage) {
    case 'Research':
      return entry.researchStage === 'COMPLETE' ? 'Complete' : entry.researchStage === 'IN_PROGRESS' ? 'In progress' : 'Not started'
    case 'Opportunity':
      return entry.oppStatus === 'UNCLASSIFIED' ? 'Unclassified' : entry.oppStatus === 'PROACTIVE' ? 'Proactive' : 'Confirmed'
    case 'Contacts':
      return entry.contactStage === 'SELECTED' ? 'Person selected' : entry.contactStage === 'DISCOVERED' ? 'People discovered' : entry.contactStage === 'DISCOVERING' ? 'Discovering...' : 'Not discovered'
    case 'Outreach':
      return entry.outreachStage === 'SENT' ? 'Sent' : entry.outreachStage === 'READY' ? 'Draft saved' : entry.outreachStage === 'DRAFT' ? 'Drafting' : 'Not started'
    case 'Conversation':
      if (entry.convStage === 'NONE' || !entry.convStage) return 'Not started'
      return entry.convStage === 'NO_REPLY' ? 'No reply' : entry.convStage === 'REPLIED' ? 'Replied' : entry.convStage === 'ACTIVE' ? 'Active' : 'Stopped'
    default:
      return 'Not started'
  }
}

function JourneyProgress({ entry, onStageClick }: {
  entry: CompanyEntry
  onStageClick: (tab: WorkspaceTab) => void
}) {
  // Use a subset of stages for the concise progression
  const displayStages: JourneyStage[] = ['Research', 'Opportunity', 'Contacts', 'Outreach', 'Conversation']

  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
      <p className="text-[11.5px] font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
        What has happened
      </p>
      <div className="flex flex-col gap-3">
        {displayStages.map((stage) => {
          const tab = STAGE_TO_TAB[stage]
          const label = getStageLabel(stage, entry)
          const isCompleteOrActive = label !== 'Not started' && label !== 'Unclassified' && label !== 'Not discovered'

          return (
            <div key={stage} className="flex flex-col sm:flex-row sm:items-center justify-between py-1" style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
              <button
                onClick={() => tab && onStageClick(tab)}
                className="text-[13px] font-semibold text-left transition-colors"
                style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-primary)')}
              >
                {stage}
              </button>
              <span
                className="text-[13px] font-medium"
                style={{
                  color: isCompleteOrActive ? 'var(--color-accent)' : 'var(--color-muted-fg)',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Next Step Card ───────────────────────────────────────────────────────────

function NextStepCard({ step, onAction }: { step: NextStepShape; onAction: (tab: WorkspaceTab) => void }) {
  return (
    <div className="rounded-xl p-5 relative overflow-hidden"
      style={
        step.isUrgent
          ? { background: 'linear-gradient(135deg, #0E1726 0%, #1E2D4A 60%, #2D3B5E 100%)', border: '1px solid rgba(255,255,255,0.06)' }
          : step.isWaiting
            ? { background: 'var(--color-card)', border: '1px solid var(--color-border)' }
            : { background: 'var(--color-card)', border: '1px solid var(--color-border)', borderLeft: '3px solid var(--color-accent)' }
      }
    >
      {step.isUrgent && (
        <div className="absolute top-0 right-0 w-48 h-48 opacity-5 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 80% 20%, #4F46E5, transparent)' }} />
      )}
      <div className="relative z-10">
        <p className="text-[11px] font-bold uppercase tracking-wide mb-2"
          style={{ color: step.isUrgent ? 'rgba(255,255,255,0.4)' : 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
          {step.isWaiting ? 'In progress' : 'What to do next'}
        </p>
        <h3 className="text-[17px] font-bold leading-snug mb-2"
          style={{ color: step.isUrgent ? 'white' : 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {step.heading}
        </h3>
        <p className="text-[13.5px] leading-relaxed mb-4"
          style={{ color: step.isUrgent ? 'rgba(255,255,255,0.6)' : 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          {step.guidance}
        </p>
        {step.isWaiting ? (
          <div className="flex items-center gap-2" style={{ color: 'var(--color-muted-fg)' }}>
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <span className="text-[13px]" style={{ fontFamily: 'Inter, sans-serif' }}>Research running · Check back shortly</span>
          </div>
        ) : (
          <button onClick={() => onAction(step.ctaTab)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
            style={{ background: step.isUrgent ? 'var(--color-accent)' : 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.background = step.isUrgent ? '#4338CA' : '#1E2D4A')}
            onMouseLeave={e => (e.currentTarget.style.background = step.isUrgent ? 'var(--color-accent)' : 'var(--color-primary)')}
          >
            {step.cta} <Icon d={icons.arrowRight} size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Opportunity State Card ───────────────────────────────────────────────────

function OpportunityStateCard({ status, explanation }: { status: OppStatus; explanation: string }) {
  const cfg = oppConfig[status]
  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[11.5px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
          Opportunity
        </p>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full"
          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.04em' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />{status}
        </span>
      </div>
      <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
        {explanation}
      </p>
    </div>
  )
}

// ─── Company Context Card ─────────────────────────────────────────────────────

function CompanyContextCard({ entry, content }: { entry: CompanyEntry; content: ContentData }) {
  const description = entry.description || content.description
  const rows: { label: string; value: string; isLink?: boolean }[] = [
    { label: 'Domain', value: entry.domain, isLink: true },
    ...(entry.industry ? [{ label: 'Industry', value: entry.industry }] : []),
    ...(entry.location ? [{ label: 'Location', value: entry.location }] : []),
    { label: 'Added', value: content.addedAt },
    { label: 'Last activity', value: entry.lastActivity },
  ]
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <p className="text-[13px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Company</p>
      </div>
      <div className="px-5 py-4">
        <p className="text-[12.5px] leading-relaxed mb-4" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          {description}
        </p>
        <div className="flex flex-col gap-2.5">
          {rows.map(row => (
            <div key={row.label} className="flex items-start justify-between gap-2">
              <span className="text-[11.5px] font-semibold uppercase tracking-wide shrink-0" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em' }}>
                {row.label}
              </span>
              {row.isLink ? (
                <a href={`https://${row.value}`} target="_blank" rel="noopener noreferrer"
                  className="text-[12.5px] text-right transition-colors"
                  style={{ color: 'var(--color-accent)', fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#4338CA')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-accent)')}>
                  {row.value} ↗
                </a>
              ) : (
                <span className="text-[12.5px] text-right" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>{row.value}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Activity Feed ────────────────────────────────────────────────────────────

function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <p className="text-[13px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Activity</p>
      </div>
      <div className="px-5 py-4">
        {events.map((event, i) => (
          <div key={i} className="flex gap-3 relative">
            {i < events.length - 1 && (
              <div className="absolute left-1.75 top-5 bottom-0 w-px" style={{ background: 'var(--color-border)' }} />
            )}
            <div className="w-3.5 h-3.5 rounded-full shrink-0 mt-1 relative z-10" style={{ background: ACTIVITY_COLORS[event.type] }} />
            <div className="pb-4 flex-1 min-w-0">
              <p className="text-[12.5px] font-medium leading-snug"
                style={{ color: event.isRecent ? 'var(--color-primary)' : 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                {event.text}
              </p>
              <p className="text-[11.5px] mt-0.5" style={{ color: 'var(--color-muted-fg)' }}>{event.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ entry, content, onTabChange }: {
  entry: CompanyEntry
  content: ContentData
  onTabChange: (tab: WorkspaceTab) => void
}) {
  const stages = deriveStages(entry)
  const nextStep = deriveNextStep(entry, entry.name)
  const contact = entry.selectedContactId ? getContactData(entry.id, entry.selectedContactId) : null
  const relStatus = deriveRelationshipStatus(entry)

  return (
    <div className="flex flex-col xl:flex-row gap-5 items-start">
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <NextStepCard step={nextStep} onAction={onTabChange} />
        {entry.convOutcome && (
          <JourneyCompleteCard entry={entry} contactName={contact?.name} onAction={onTabChange} />
        )}
        <JourneyProgress entry={entry} onStageClick={onTabChange} />
        <OpportunityStateCard status={entry.oppStatus} explanation={content.opportunityExplanation} />
      </div>
      <div className="w-full xl:w-62 shrink-0 flex flex-col gap-4">
        <CompanyContextCard entry={entry} content={content} />
        {entry.convOutcome && <RelationshipStatusCard entry={entry} />}
        {relStatus === 'NURTURE' && <StayConnectedCard entry={entry} onAction={onTabChange} />}
        <ActivityFeed events={content.activity} />
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

const WORKSPACE_TABS: WorkspaceTab[] = ['Overview', 'Research', 'Opportunities', 'Contacts', 'Outreach', 'Campaign', 'Conversation']

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('Overview')

  // Load entry from workspace store
  const [entry, setEntryState] = useState<CompanyEntry | null>(() => {
    if (!id) return null
    const ws = loadWorkspace()
    return ws.companies.find(c => c.id === id) ?? null
  })

  // When navigating to a company that exists in content data but not yet in the workspace store
  // (e.g., from a direct URL), create a sensible default entry
  useEffect(() => {
    if (!id) return
    const ws = loadWorkspace()
    const existing = ws.companies.find(c => c.id === id)
    if (!existing && CONTENT_DATA[id]) {
      // Known demo company accessed directly — load demo data
      const allDemos = ws.companies.filter(c => c.isDemo)
      if (allDemos.length === 0) {
        // Load all demo entries so the workspace makes sense
        const newWs = {
          ...ws,
          companies: [...ws.companies],
          campaigns: ws.campaigns.length === 0 ? DEMO_CAMPAIGNS : ws.campaigns,
          templates: ws.templates.length === 0 ? DEMO_TEMPLATES : ws.templates,
          isDemoLoaded: true,
        }
        for (const demo of DEMO_ENTRIES) {
          if (!newWs.companies.find(c => c.id === demo.id)) {
            newWs.companies.push(demo)
          }
        }
        saveWorkspace(newWs)
        const found = newWs.companies.find(c => c.id === id)
        if (found) setEntryState(found)
      }
    }
  }, [id])

  function updateEntry(patch: Partial<CompanyEntry>) {
    if (!entry) return
    const updated = { ...entry, ...patch }
    setEntryState(updated)
    const ws = loadWorkspace()
    saveWorkspace({
      ...ws,
      companies: ws.companies.map(c => c.id === entry.id ? updated : c),
    })
  }

  if (!entry && !id) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}>
          <Icon d={icons.alertCircle} size={20} />
        </div>
        <div className="text-center">
          <p className="text-[16px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Company not found</p>
          <p className="text-[13.5px] mt-1" style={{ color: 'var(--color-muted-fg)' }}>This company doesn't exist in your workspace.</p>
        </div>
        <button onClick={() => navigate('/companies')} className="flex items-center gap-1.5 text-[13.5px] font-semibold" style={{ color: 'var(--color-accent)' }}>
          <Icon d={icons.arrowLeft} size={14} /> Back to Companies
        </button>
      </div>
    )
  }

  // Use a stub while the effect loads the entry for a known demo company
  const effectiveEntry: CompanyEntry = entry ?? newCompanyEntry(id!, id!, `${id}.com`, 'UNCLASSIFIED')
  const content = CONTENT_DATA[id!] ?? defaultContent(effectiveEntry)
  const cfg = oppConfig[effectiveEntry.oppStatus]
  const monoColors = MONOGRAM_COLORS[id!] ?? { bg: 'var(--color-muted)', text: 'var(--color-primary)' }
  const { cta: primaryCta, ctaTab: primaryCtaTab } = derivePrimaryAction(effectiveEntry)
  const workflowLabel = deriveWorkflowLabel(effectiveEntry)

  return (
    <div className="max-w-245 mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Breadcrumb */}
      <button onClick={() => navigate('/companies')}
        className="flex items-center gap-1.5 text-[13px] font-medium mb-5 transition-colors"
        style={{ color: 'var(--color-muted-fg)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted-fg)')}>
        <Icon d={icons.arrowLeft} size={14} /> Companies
      </button>

      {/* Workspace header */}
      <div className="rounded-xl p-5 mb-4" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-[18px] shrink-0"
              style={{ background: monoColors.bg, color: monoColors.text, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {effectiveEntry.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[20px] font-bold tracking-tight" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {effectiveEntry.name}
                </h1>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide px-2.5 py-1 rounded-full"
                  style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.04em' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />{effectiveEntry.oppStatus}
                </span>
                {effectiveEntry.isDemo && (
                  <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded" style={{ background: '#FEF9C3', color: '#713F12', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Demo
                  </span>
                )}
              </div>
              <a href={`https://${effectiveEntry.domain}`} target="_blank" rel="noopener noreferrer"
                className="text-[12.5px] transition-colors" style={{ color: 'var(--color-muted-fg)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted-fg)')}>
                {effectiveEntry.domain} ↗
              </a>
              <p className="text-[12.5px] mt-1" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                {workflowLabel}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <button onClick={() => setActiveTab(primaryCtaTab)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all whitespace-nowrap"
              style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}>
              {primaryCta} <Icon d={icons.arrowRight} size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex items-center gap-0.5 mb-5 p-1 overflow-x-auto"
        style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: 12 }}>
        {WORKSPACE_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="shrink-0 sm:flex-1 px-4 sm:px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all whitespace-nowrap"
            style={{
              background: activeTab === tab ? 'var(--color-card)' : 'transparent',
              color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-muted-fg)',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.07)' : 'none',
            }}
            onMouseEnter={e => { if (activeTab !== tab) e.currentTarget.style.color = 'var(--color-primary)' }}
            onMouseLeave={e => { if (activeTab !== tab) e.currentTarget.style.color = 'var(--color-muted-fg)' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Overview' && (
        <OverviewTab entry={effectiveEntry} content={content} onTabChange={setActiveTab} />
      )}
      {activeTab === 'Research' && (
        <ResearchTab
          id={id!}
          researchStage={effectiveEntry.researchStage}
          companyName={effectiveEntry.name}
          onUpdate={updateEntry}
        />
      )}
      {activeTab === 'Opportunities' && (
        <OpportunitiesTab
          id={id!}
          companyName={effectiveEntry.name}
          status={effectiveEntry.oppStatus}
          hasResearch={effectiveEntry.researchStage === 'COMPLETE'}
          onNavigate={tab => setActiveTab(tab as WorkspaceTab)}
          onStatusChange={newStatus => updateEntry({ oppStatus: newStatus, lastActivity: 'Just now' })}
        />
      )}
      {activeTab === 'Contacts' && (
        <div className="rounded-xl" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <ContactsTab
            entry={effectiveEntry}
            onUpdate={updateEntry}
            onNavigate={tab => setActiveTab(tab as WorkspaceTab)}
            companyName={effectiveEntry.name}
          />
        </div>
      )}
      {activeTab === 'Outreach' && (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <OutreachTab
            entry={effectiveEntry}
            onUpdate={updateEntry}
            onNavigate={tab => setActiveTab(tab as WorkspaceTab)}
          />
        </div>
      )}
      {activeTab === 'Campaign' && (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <CampaignTab
            entry={effectiveEntry}
            onUpdate={updateEntry}
            onNavigate={tab => setActiveTab(tab as WorkspaceTab)}
          />
        </div>
      )}
      {activeTab === 'Conversation' && (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <ConversationTab
            entry={effectiveEntry}
            onUpdate={updateEntry}
            onNavigate={tab => setActiveTab(tab as WorkspaceTab)}
          />
        </div>
      )}
    </div>
  )
}

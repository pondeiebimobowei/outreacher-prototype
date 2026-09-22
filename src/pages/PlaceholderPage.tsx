import { Icon, icons } from '../lib/icons'

const pageInfo: Record<string, { title: string; description: string; iconKey: keyof typeof icons }> = {
  companies: { title: 'Companies', description: 'Target companies and outreach opportunities.', iconKey: 'companies' },
  opportunities: { title: 'Opportunities', description: 'Your CONFIRMED, PROACTIVE, and UNCLASSIFIED opportunities.', iconKey: 'opportunities' },
  contacts: { title: 'Contacts', description: 'People identified and selected for outreach.', iconKey: 'contacts' },
  campaigns: { title: 'Campaigns', description: 'Approved outreach grouped into campaigns.', iconKey: 'campaigns' },
  replies: { title: 'Replies', description: 'Incoming responses linked to companies and contacts.', iconKey: 'replies' },
  settings: { title: 'Settings', description: 'Account, preferences, and integrations.', iconKey: 'settings' },
  help: { title: 'Help', description: 'Documentation and support.', iconKey: 'help' },
  profile: { title: 'Career Profile', description: 'Your professional identity that powers Outreacher.', iconKey: 'user' },
}

export function PlaceholderPage({ page }: { page: string }) {
  const info = pageInfo[page] ?? { title: page, description: '', iconKey: 'dashboard' as keyof typeof icons }
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-12" style={{ minHeight: 'calc(100vh - 60px)' }}>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}
      >
        <Icon d={icons[info.iconKey]} size={22} />
      </div>
      <div className="text-center">
        <h2
          className="text-[20px] font-bold"
          style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          {info.title}
        </h2>
        <p className="text-[14px] mt-1.5" style={{ color: 'var(--color-muted-fg)' }}>{info.description}</p>
      </div>
      <div
        className="text-[12.5px] px-4 py-2 rounded-lg"
        style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}
      >
        This page will be built in a future step.
      </div>
    </div>
  )
}

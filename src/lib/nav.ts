import type { icons } from './icons'

export type NavItem = {
  id: string
  label: string
  iconKey: keyof typeof icons
  badge?: number
  path: string
}

export const navItems: NavItem[] = [
  { id: 'dashboard',      label: 'Dashboard',     iconKey: 'dashboard',     path: '/' },
  { id: 'companies',      label: 'Companies',     iconKey: 'companies',     path: '/companies' },
  { id: 'outreaches',     label: 'Outreaches',    iconKey: 'outreach',      path: '/outreaches' },
  { id: 'opportunities',  label: 'Opportunities', iconKey: 'opportunities', path: '/opportunities' },
  { id: 'contacts',       label: 'Contacts',      iconKey: 'contacts',      path: '/contacts' },
  { id: 'campaigns',      label: 'Campaigns',     iconKey: 'campaigns',     path: '/campaigns' },
  { id: 'templates',      label: 'Templates',     iconKey: 'fileText',      path: '/templates' },
  { id: 'conversations',  label: 'Conversations', iconKey: 'replies',       path: '/conversations' },
]

export const bottomNavItems: NavItem[] = [
  { id: 'integrations',    label: 'Integrations',    iconKey: 'zap',    path: '/integrations' },
  { id: 'sender-accounts', label: 'Sender Accounts', iconKey: 'atSign', path: '/sender-accounts' },
  { id: 'settings', label: 'Settings', iconKey: 'settings', path: '/settings' },
  { id: 'help', label: 'Help', iconKey: 'help', path: '/help' },
]

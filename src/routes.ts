import { createBrowserRouter } from 'react-router'
import { AuthLayout } from './layouts/AuthLayout'
import { AppShell } from './layouts/AppShell'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { OnboardingPage } from './pages/onboarding/OnboardingPage'
import { DashboardPage } from './pages/DashboardPage'
import { LandingPage } from './pages/LandingPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { ProfilePage } from './pages/ProfilePage'
import { CompaniesPage } from './pages/companies/CompaniesPage'
import { CompanyDetailPage } from './pages/companies/CompanyDetailPage'
import { CampaignsPage } from './pages/campaigns/CampaignsPage'
import { CampaignDetailPage } from './pages/campaigns/CampaignDetailPage'
import { TemplatesPage } from './pages/templates/TemplatesPage'
import { ContactsPage } from './pages/contacts/ContactsPage'
import { ContactDetailPage } from './pages/contacts/ContactDetailPage'
import { OpportunitiesPage } from './pages/opportunities/OpportunitiesPage'
import { OpportunityDetailPage } from './pages/opportunities/OpportunityDetailPage'
import { ConversationsPage } from './pages/conversations/ConversationsPage'
import { ConversationDetailPage } from './pages/conversations/ConversationDetailPage'
import { OutreachesPage } from './pages/outreaches/OutreachesPage'
import { OutreachDetailPage } from './pages/outreaches/OutreachDetailPage'
import { IntegrationsPage } from './pages/integrations/IntegrationsPage'
import { SenderAccountsPage } from './pages/sender-accounts/SenderAccountsPage'

export const router = createBrowserRouter([
  {
    path: '/landing',
    Component: LandingPage,
  },
  {
    Component: AuthLayout,
    children: [
      { path: '/login', Component: LoginPage },
      { path: '/signup', Component: SignupPage },
      { path: '/forgot-password', Component: ForgotPasswordPage },
    ],
  },
  {
    path: '/onboarding',
    Component: OnboardingPage,
  },
  {
    Component: AppShell,
    children: [
      { index: true, Component: DashboardPage },
      { path: '/dashboard', Component: DashboardPage },
      { path: '/companies', Component: CompaniesPage },
      { path: '/companies/:id', Component: CompanyDetailPage },
      { path: '/opportunities', Component: OpportunitiesPage },
      { path: '/opportunities/:id', Component: OpportunityDetailPage },
      { path: '/contacts', Component: ContactsPage },
      { path: '/contacts/:contactKey', Component: ContactDetailPage },
      { path: '/campaigns', Component: CampaignsPage },
      { path: '/campaigns/:id', Component: CampaignDetailPage },
      { path: '/templates', Component: TemplatesPage },
      { path: '/conversations', Component: ConversationsPage },
      { path: '/conversations/:id', Component: ConversationDetailPage },
      { path: '/outreaches', Component: OutreachesPage },
      { path: '/outreaches/:id', Component: OutreachDetailPage },
      { path: '/replies', Component: ConversationsPage },
      { path: '/integrations', Component: IntegrationsPage },
      { path: '/sender-accounts', Component: SenderAccountsPage },
      { path: '/settings', Component: () => PlaceholderPage({ page: 'settings' }) },
      { path: '/help', Component: () => PlaceholderPage({ page: 'help' }) },
      { path: '/profile', Component: ProfilePage },
    ],
  },
])

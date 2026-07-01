/** Human-readable labels for DashboardShell pathname segments. */
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  kanban: 'Kanban',
  calendar: 'Calendar',
  activity: 'Activity',
  'data-table': 'Customers',
  'ui-kit': 'UI Kit',
  messages: 'Messages',
  forms: 'Forms',
  'form-example': 'Validated form',
  settings: 'Settings',
  account: 'Account',
  general: 'General',
  security: 'Security',
  notifications: 'Notifications',
  integrations: 'Integrations',
  team: 'Team',
  billing: 'Billing',
  limits: 'Limits',
  projects: 'Projects',
  support: 'Support',
  feedback: 'Feedback',
}

export function breadcrumbSegmentLabel(segment: string): string {
  return SEGMENT_LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
}
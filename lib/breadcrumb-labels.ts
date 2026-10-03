/**
 * Route path -> `nav.items.*` i18n key. Mirrors Nuxt `ROUTE_LABEL_KEYS` (one
 * label source for the sidebar, the topbar breadcrumb and each page's H1, so
 * the three never disagree). Keyed by full path because segments repeat
 * (`/dashboard/activity` is "Activity", `/settings/activity` is
 * "Activity log").
 */
export const ROUTE_LABEL_KEYS: Record<string, string> = {
  '/dashboard': 'nav.items.dashboard',
  '/dashboard/messages': 'nav.items.messages',
  '/dashboard/kanban': 'nav.items.kanban',
  '/dashboard/data-table': 'nav.items.dataTable',
  '/dashboard/calendar': 'nav.items.calendar',
  '/dashboard/activity': 'nav.items.activity',
  '/dashboard/locations': 'nav.items.locations',
  '/dashboard/ui-kit': 'nav.items.uiKit',
  '/dashboard/forms': 'nav.items.forms',
  '/dashboard/form-example': 'nav.items.formExample',
  '/settings': 'nav.items.settings',
  '/settings/general': 'nav.items.general',
  '/settings/account': 'nav.items.account',
  '/settings/security': 'nav.items.security',
  '/settings/api-keys': 'nav.items.apiKeys',
  '/settings/notifications': 'nav.items.notifications',
  '/settings/integrations': 'nav.items.integrations',
  '/settings/team': 'nav.items.team',
  '/settings/activity': 'nav.items.activityLog',
  '/settings/billing': 'nav.items.billing',
  '/settings/limits': 'nav.items.limits',
  '/admin': 'nav.items.admin',
  '/admin/users': 'nav.items.users',
  '/admin/roles': 'nav.items.roles',
  '/projects': 'nav.items.projects',
  '/support': 'nav.items.support',
  '/feedback': 'nav.items.feedback',
}

/**
 * English fallback map (same values as `messages/en.json` for the
 * `nav.items.*` keys above). Used when no translator is available
 * (server util contexts, legacy callers).
 */
export const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/messages': 'Messages',
  '/dashboard/kanban': 'Kanban',
  '/dashboard/data-table': 'Customers',
  '/dashboard/calendar': 'Calendar',
  '/dashboard/activity': 'Activity',
  '/dashboard/locations': 'Locations',
  '/dashboard/ui-kit': 'UI Kit',
  '/dashboard/forms': 'Forms',
  '/dashboard/form-example': 'Validated form',
  '/settings': 'Settings',
  '/settings/general': 'General',
  '/settings/account': 'Account',
  '/settings/security': 'Security',
  '/settings/api-keys': 'API keys',
  '/settings/notifications': 'Notifications',
  '/settings/integrations': 'Integrations',
  '/settings/team': 'Team',
  '/settings/activity': 'Activity log',
  '/settings/billing': 'Billing',
  '/settings/limits': 'Limits',
  '/admin': 'Admin',
  '/admin/users': 'Users',
  '/admin/roles': 'Roles & permissions',
  '/projects': 'Projects',
  '/support': 'Support',
  '/feedback': 'Feedback',
}

function humanize(segment: string): string {
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
}

/**
 * Label for a route path; falls back to the humanized last segment.
 * Pass the next-intl `t` (from `useTranslations()` / `getTranslations()`)
 * for a localized label; without it, English is used.
 */
export function routeLabel(path: string, t?: (key: string) => string): string {
  const key = ROUTE_LABEL_KEYS[path]
  if (key && t) return t(key)
  return ROUTE_LABELS[path] ?? humanize(path.split('/').filter(Boolean).pop() ?? '')
}

/** Label for a single pathname segment (legacy segment-map API). */
export function breadcrumbSegmentLabel(segment: string, t?: (key: string) => string): string {
  const hit = Object.entries(ROUTE_LABEL_KEYS).find(([path]) => path.endsWith(`/${segment}`))
  if (hit && t) return t(hit[1])
  const pathHit = Object.entries(ROUTE_LABELS).find(([path]) => path.endsWith(`/${segment}`))
  return pathHit?.[1] ?? humanize(segment)
}

'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import {
  Activity,
  CalendarDays,
  FileText,
  Folder,
  KanbanSquare,
  LayoutDashboard,
  LayoutTemplate,
  LifeBuoy,
  MapPin,
  MessageSquare,
  Send,
  Settings2,
  ShieldCheck,
  Table2,
} from 'lucide-react'

import { isNavItemActive } from '@/lib/nav-active'
import { OverlayScroll } from '@/components/ui/overlay-scroll'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { NavMain } from './NavMain'
import { NavProjects } from './NavProjects'
import { NavSecondary } from './NavSecondary'
import { NavUser } from './NavUser'
import { TeamSwitcher } from './TeamSwitcher'

export interface Sidebar02Props {
  user?: { name: string; email: string; avatar?: string; role?: string }
  onLogout?: () => void
  onProfileSelect?: (key: string) => void
}

const navMainStatic = [
  { key: 'nav.items.dashboard', url: '/dashboard', icon: LayoutDashboard },
  { key: 'nav.items.messages', url: '/dashboard/messages', icon: MessageSquare },
  { key: 'nav.items.kanban', url: '/dashboard/kanban', icon: KanbanSquare },
  { key: 'nav.items.dataTable', url: '/dashboard/data-table', icon: Table2 },
  { key: 'nav.items.calendar', url: '/dashboard/calendar', icon: CalendarDays },
  { key: 'nav.items.activity', url: '/dashboard/activity', icon: Activity },
  { key: 'nav.items.locations', url: '/dashboard/locations', icon: MapPin },
  { key: 'nav.items.uiKit', url: '/dashboard/ui-kit', icon: LayoutTemplate },
  { key: 'nav.items.forms', url: '/dashboard/forms', icon: FileText },
  {
    key: 'nav.items.settings',
    url: '/settings',
    icon: Settings2,
    items: [
      { key: 'nav.items.general', url: '/settings/general' },
      { key: 'nav.items.account', url: '/settings/account' },
      { key: 'nav.items.security', url: '/settings/security' },
      { key: 'nav.items.apiKeys', url: '/settings/api-keys' },
      { key: 'nav.items.notifications', url: '/settings/notifications' },
      { key: 'nav.items.integrations', url: '/settings/integrations' },
      { key: 'nav.items.team', url: '/settings/team' },
      { key: 'nav.items.activityLog', url: '/settings/activity' },
      { key: 'nav.items.billing', url: '/settings/billing' },
      { key: 'nav.items.limits', url: '/settings/limits' },
    ],
  },
]

const navAdminStatic = {
  key: 'nav.items.admin',
  url: '/admin/users',
  icon: ShieldCheck,
  items: [
    { key: 'nav.items.users', url: '/admin/users' },
    { key: 'nav.items.roles', url: '/admin/roles' },
  ],
}

const navSecondaryStatic = [
  { key: 'nav.items.support', url: '/support', icon: LifeBuoy },
  { key: 'nav.items.feedback', url: '/feedback', icon: Send },
]

const projectsStatic = [
  { name: 'Design Engineering', url: '/projects/design-engineering', icon: Folder },
  { name: 'Sales & Marketing', url: '/projects/sales-marketing', icon: Folder },
  { name: 'Travel', url: '/projects/travel', icon: Folder },
]

function withActiveNav<T extends { url: string; items?: { url: string }[] }>(
  pathname: string,
  items: T[],
): (T & { isActive: boolean; items?: (NonNullable<T['items']>[number] & { isActive: boolean })[] })[] {
  return items.map((item) => {
    const childActive = item.items?.some((sub) => isNavItemActive(pathname, sub.url)) ?? false
    const selfActive = isNavItemActive(pathname, item.url)
    return {
      ...item,
      isActive: selfActive || childActive,
      items: item.items?.map((sub) => ({
        ...sub,
        isActive: isNavItemActive(pathname, sub.url),
      })),
    }
  })
}

export function Sidebar02({ user, onLogout, onProfileSelect }: Sidebar02Props) {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations()

  // Mirrors Nuxt Sidebar02: profile keys navigate before forwarding the event.
  function handleProfileSelect(key: string) {
    if (key === 'account') router.push('/settings/account')
    if (key === 'billing') router.push('/settings/billing')
    if (key === 'notifications') router.push('/settings/notifications')
    onProfileSelect?.(key)
  }

  // Project + model names are tenant/brand data and stay verbatim.
  // Nav labels come from `nav.items.*` so the sidebar, breadcrumb and H1
  // never disagree (mirrors Nuxt Sidebar02).
  function localize<T extends { key: string; url: string; icon: unknown; items?: { key: string; url: string }[] }>(
    items: T[],
  ) {
    return items.map(({ key, items: subs, ...rest }) => ({
      ...rest,
      title: t(key),
      ...(subs ? { items: subs.map(({ key: sk, ...srest }) => ({ ...srest, title: t(sk) })) } : {}),
    }))
  }

  // Mirrors Nuxt: the Admin group is role-gated (admin only).
  const navMain = React.useMemo(
    () =>
      withActiveNav(
        pathname,
        localize(user?.role === 'admin' ? [...navMainStatic, navAdminStatic] : navMainStatic),
      ),
    [pathname, user?.role, t],
  )
  const navSecondary = React.useMemo(
    () =>
      localize(navSecondaryStatic).map((item) => ({
        ...item,
        isActive: isNavItemActive(pathname, item.url),
      })),
    [pathname, t],
  )
  const projects = React.useMemo(
    () => projectsStatic.map((item) => ({ ...item, isActive: isNavItemActive(pathname, item.url) })),
    [pathname],
  )

  const navUser = {
    name: user?.name || 'Guest',
    email: user?.email || '',
    avatar: user?.avatar,
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent
        data-tour="sidebar-nav"
        className="gap-1 overflow-visible group-data-[collapsible=icon]:overflow-hidden"
      >
        <OverlayScroll className="min-h-0 flex-1">
          <div className="flex min-h-full flex-col gap-2">
            <NavMain items={navMain} />
            <NavProjects projects={projects} />
            <NavSecondary items={navSecondary} className="mt-auto" />
          </div>
        </OverlayScroll>
      </SidebarContent>
      <SidebarFooter data-tour="profile">
        <NavUser user={navUser} onLogout={onLogout} onProfileSelect={handleProfileSelect} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
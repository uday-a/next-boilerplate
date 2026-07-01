'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import {
  Activity,
  CalendarDays,
  FileText,
  Folder,
  KanbanSquare,
  LayoutDashboard,
  LayoutTemplate,
  LifeBuoy,
  Send,
  Settings2,
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
  user?: { name: string; email: string; avatar?: string }
  onLogout?: () => void
  onProfileSelect?: (key: string) => void
}

const navMainStatic = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Kanban', url: '/dashboard/kanban', icon: KanbanSquare },
  { title: 'Data table', url: '/dashboard/data-table', icon: Table2 },
  { title: 'Calendar', url: '/dashboard/calendar', icon: CalendarDays },
  { title: 'Activity', url: '/dashboard/activity', icon: Activity },
  { title: 'UI Kit', url: '/dashboard/ui-kit', icon: LayoutTemplate },
  { title: 'Forms', url: '/dashboard/forms', icon: FileText },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings2,
    items: [
      { title: 'General', url: '/settings/general' },
      { title: 'Account', url: '/settings/account' },
      { title: 'Security', url: '/settings/security' },
      { title: 'Notifications', url: '/settings/notifications' },
      { title: 'Integrations', url: '/settings/integrations' },
      { title: 'Team', url: '/settings/team' },
      { title: 'Billing', url: '/settings/billing' },
      { title: 'Limits', url: '/settings/limits' },
    ],
  },
]

const navSecondaryStatic = [
  { title: 'Support', url: '/support', icon: LifeBuoy },
  { title: 'Feedback', url: '/feedback', icon: Send },
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

  const navMain = React.useMemo(() => withActiveNav(pathname, navMainStatic), [pathname])
  const navSecondary = React.useMemo(
    () => navSecondaryStatic.map((item) => ({ ...item, isActive: isNavItemActive(pathname, item.url) })),
    [pathname],
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
      <SidebarContent className="gap-1 overflow-visible group-data-[collapsible=icon]:overflow-hidden">
        <OverlayScroll className="min-h-0 flex-1">
          <div className="flex min-h-full flex-col gap-2">
            <NavMain items={navMain} />
            <NavProjects projects={projects} />
            <NavSecondary items={navSecondary} className="mt-auto" />
          </div>
        </OverlayScroll>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} onLogout={onLogout} onProfileSelect={onProfileSelect} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
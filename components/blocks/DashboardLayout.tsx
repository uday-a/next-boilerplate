'use client'

import * as React from 'react'
import { Bell } from 'lucide-react'
import { CommandPalette } from '@/components/blocks/CommandPalette'
import { NotificationsPopover } from '@/components/blocks/NotificationsPopover'
import { Sidebar02 } from '@/components/blocks/sidebar-02/Sidebar02'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeSwitch } from '@/components/ui/theme-switch'

interface Crumb {
  label: string
  href?: string
}

export interface DashboardLayoutProps {
  breadcrumbs?: Crumb[]
  user?: { name: string; email: string; avatar?: string }
  onProfileSelect?: (key: string) => void
  onCommandSelect?: (item: { label: string; hint?: string }) => void
  children?: React.ReactNode
}

export function DashboardLayout({
  breadcrumbs = [{ label: 'Dashboard' }],
  user,
  onProfileSelect,
  onCommandSelect,
  children,
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <Sidebar02
        user={user}
        onLogout={() => onProfileSelect?.('logout')}
        onProfileSelect={onProfileSelect}
      />
      <SidebarInset>
        <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 flex h-14 w-full shrink-0 items-center justify-between border-b px-4 backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, i) => (
                  <React.Fragment key={i}>
                    <BreadcrumbItem className={i === 0 ? 'hidden md:block' : ''}>
                      {crumb.href && i < breadcrumbs.length - 1 ? (
                        <BreadcrumbLink
                          href={crumb.href}
                          className="text-muted-foreground/70 hover:text-foreground transition-colors"
                        >
                          {crumb.label}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage className="font-medium">{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {i < breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator className={i === 0 ? 'hidden md:block' : ''} />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-1 px-2 sm:gap-3">
            <CommandPalette onSelect={onCommandSelect} />
            <div className="flex items-center gap-0.5">
              <ThemeSwitch variant="icon-only" />
              <NotificationsPopover
                trigger={({ unreadCount }) => (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground relative size-8 rounded-lg"
                    aria-label="Notifications"
                  >
                    <Bell className="size-4" />
                    {unreadCount > 0 ? (
                      <span className="bg-primary ring-background absolute top-1.5 right-1.5 size-2 rounded-full ring-2" />
                    ) : null}
                  </Button>
                )}
              />
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col px-4 pt-4 pb-4 lg:px-6 lg:pt-6 lg:pb-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
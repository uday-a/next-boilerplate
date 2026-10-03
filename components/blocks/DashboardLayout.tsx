'use client'

import * as React from 'react'
import { Bell } from 'lucide-react'
import { CommandPalette } from '@/components/blocks/CommandPalette'

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 016 0C17 4.7 18 5 18 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
  </svg>
)
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
import { LocaleSwitcher } from '@/components/blocks/LocaleSwitcher'
import { ThemeCustomizer } from '@/components/blocks/ThemeCustomizer'
import { ThemeSwitch } from '@/components/ui/theme-switch'

interface Crumb {
  label: string
  href?: string
}

export interface DashboardLayoutProps {
  breadcrumbs?: Crumb[]
  user?: { name: string; email: string; avatar?: string; role?: string }
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
      <a
        href="#main-content"
        className="bg-background text-foreground ring-ring sr-only z-50 rounded-md text-sm font-medium shadow-md ring-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Sidebar02
        user={user}
        onLogout={() => onProfileSelect?.('logout')}
        onProfileSelect={onProfileSelect}
      />
      <SidebarInset>
        <header className="bg-background sticky top-0 z-30 flex h-14 w-full shrink-0 items-center justify-between border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
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
                          className="text-muted-foreground hover:text-foreground transition-colors"
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
            <a
              href="https://github.com/uday-a/next-boilerplate"
              data-tour="github"
              target="_blank"
              rel="noreferrer"
              className="border-border/80 bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors sm:inline-flex"
            >
              <GithubIcon className="size-3.5" />
              <span>Next.js Starter</span>
            </a>
            <div data-tour="palette" className="inline-flex">
              <CommandPalette onSelect={onCommandSelect} />
            </div>
            <div className="flex items-center gap-0.5">
              <LocaleSwitcher />
              <ThemeCustomizer />
              <div data-tour="theme" className="inline-flex">
                <ThemeSwitch variant="icon-only" />
              </div>
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
        {/* WHY (Rule18): cap content width so ultra-wide viewports don't
            stretch charts into noise. */}
        <main id="main-content" tabIndex={-1} className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col p-4 outline-none">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
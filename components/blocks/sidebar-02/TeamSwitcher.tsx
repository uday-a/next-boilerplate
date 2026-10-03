'use client'

// Edit teams + activeTeam below to match your tenant model. The dropdown
// is the full team switcher pattern -- avatar tile, label, kbd shortcut,
// and a "Add team" footer row. Wire setActive() to your tenant API.

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { AudioWaveform, Check, ChevronsUpDown, Command, Plus, type LucideIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UipkgeLogo } from '@/components/brand/uipkge-logo'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'

type Team = {
  name: string
  logo: LucideIcon | ((props: { className?: string }) => React.ReactElement)
  plan: string
}

const teams: Team[] = [
  { name: 'UIPKGE', logo: UipkgeLogo, plan: 'Next.js' },
  { name: 'Globex', logo: AudioWaveform, plan: 'Startup' },
  { name: 'Initech', logo: Command, plan: 'Free' },
]

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const t = useTranslations()
  const [activeTeam, setActiveTeam] = React.useState<Team>(teams[0]!)
  const ActiveLogo = activeTeam.logo

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:!justify-center"
            >
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg group-data-[collapsible=icon]:size-6">
                <ActiveLogo className="size-8 group-data-[collapsible=icon]:size-6" />
              </div>
              <div className="flex flex-1 flex-col justify-center gap-0.5 text-left min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold text-sm leading-none tracking-tight">{activeTeam.name}</span>
                <span className="text-muted-foreground truncate text-xs leading-none">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">{t('nav.groups.teams')}</DropdownMenuLabel>
            {teams.map((team, i) => {
              const Logo = team.logo
              return (
                <DropdownMenuItem key={team.name} className="gap-2 p-2" onSelect={() => setActiveTeam(team)}>
                  <div className="flex size-6 items-center justify-center rounded-sm border p-0.5">
                    <Logo className="size-full shrink-0" />
                  </div>
                  {team.name}
                  {activeTeam === team ? (
                    <Check className="ml-auto size-4" />
                  ) : (
                    <DropdownMenuShortcut>⌘{i + 1}</DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">{t('nav.actions.addTeam')}</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

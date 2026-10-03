'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export interface NavMainProps {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      isActive?: boolean
    }[]
  }[]
}

/**
 * fix(sidebar): open nav groups when a child is active and toggle on parent click.
 * Port of Nuxt `NavMain.vue` @740c76c — groups open after client-side
 * navigation too (not only first render) and stay user-toggleable.
 * The parent row of a group toggles it instead of navigating; only child
 * items are links.
 */
export function NavMain({ items }: NavMainProps) {
  const t = useTranslations()
  // Groups with children open when one of their pages is active — also after
  // client-side navigation, not only on first render — and stay user-toggleable.
  const [open, setOpen] = React.useState<Record<string, boolean>>({})

  React.useEffect(() => {
    setOpen((prev) => {
      const next = { ...prev }
      let changed = false
      for (const item of items) {
        if (item.isActive && !next[item.title]) {
          next[item.title] = true
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [items])

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('nav.groups.platform')}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) =>
          item.items?.length ? (
            // Group: the whole row toggles; only the children navigate.
            <Collapsible
              key={item.title}
              open={!!open[item.title]}
              onOpenChange={(v) => setOpen((prev) => ({ ...prev, [item.title]: v }))}
              asChild
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={cn('group/trigger', item.isActive && 'text-sidebar-foreground font-medium')}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/trigger:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={subItem.isActive}
                          className="data-[active=true]:bg-sidebar-primary/10 data-[active=true]:text-sidebar-primary data-[active=true]:font-medium"
                        >
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={item.isActive}
                className="data-[active=true]:bg-sidebar-primary/10 data-[active=true]:text-sidebar-primary data-[active=true]:font-medium data-[active=true]:[&>svg]:text-sidebar-primary"
              >
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}

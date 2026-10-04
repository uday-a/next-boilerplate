'use client'

import { FolderKanban, LayoutDashboard, Settings } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'

const items = [
  { title: 'Dashboard', icon: LayoutDashboard, active: true },
  { title: 'Projects', icon: FolderKanban, active: false },
  { title: 'Settings', icon: Settings, active: false },
]

// A static (collapsible="none") sidebar. The app's real one is the
// Sidebar02 block in the dashboard layout.
export default function SidebarDemo() {
  return (
    <SidebarProvider className="min-h-0">
      <Sidebar collapsible="none" className="h-auto rounded-md border">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={item.active}>
                    <item.icon aria-hidden="true" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}

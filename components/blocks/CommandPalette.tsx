'use client'

import * as React from 'react'
import {
  LayoutDashboard,
  FileText,
  Inbox,
  Settings,
  Users,
  KanbanSquare,
  Search,
  type LucideIcon,
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { Kbd } from '@/components/ui/kbd'

export interface CommandPaletteItem {
  label: string
  value?: string
  hint?: string
  icon?: LucideIcon
  onSelect?: () => void
}

export interface CommandPaletteGroup {
  heading: string
  items: CommandPaletteItem[]
}

export interface CommandPaletteProps {
  groups?: CommandPaletteGroup[]
  placeholder?: string
  triggerLabel?: string
  showTrigger?: boolean
  onSelect?: (item: CommandPaletteItem) => void
}

const defaultGroups: CommandPaletteGroup[] = [
  {
    heading: 'Navigate',
    items: [
      { label: 'Dashboard', hint: '/dashboard', icon: LayoutDashboard },
      { label: 'Messages', hint: '/dashboard/messages', icon: Inbox },
      { label: 'Kanban', hint: '/dashboard/kanban', icon: KanbanSquare },
      { label: 'Team', hint: '/settings/team', icon: Users },
    ],
  },
  {
    heading: 'Settings',
    items: [
      { label: 'General', hint: '/settings/general', icon: FileText },
      { label: 'Settings', hint: '/settings', icon: Settings },
    ],
  },
]

export function CommandPalette({
  groups = defaultGroups,
  placeholder = 'Search pages, commands…',
  triggerLabel = 'Search…',
  showTrigger = true,
  onSelect,
}: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false)
  const [triggerShortcut] = React.useState(() => {
    if (typeof navigator === 'undefined') return '⌘K'
    return /Mac|iPhone|iPad/i.test(navigator.platform) ? '⌘K' : 'Ctrl K'
  })

  function pick(item: CommandPaletteItem) {
    setOpen(false)
    item.onSelect?.()
    onSelect?.(item)
  }

  React.useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  }, [])

  return (
    <>
      {showTrigger && (
        <button
          type="button"
          className="bg-background border-input hover:bg-accent hover:text-foreground text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 relative hidden h-8 w-full items-center gap-2 rounded-lg border px-2.5 text-sm shadow-xs transition-colors outline-none focus-visible:ring-[3px] sm:flex md:w-[180px] lg:w-[240px]"
          aria-label="Open command palette"
          onClick={() => setOpen(true)}
        >
          <Search className="size-3.5 shrink-0" />
          <span className="flex-1 truncate text-left">{triggerLabel}</span>
          <Kbd>{triggerShortcut}</Kbd>
        </button>
      )}

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Command palette"
        description="Search pages and run commands"
      >
        <CommandInput placeholder={placeholder} />
        <CommandList className="max-h-[480px]">
          <CommandEmpty>No matches.</CommandEmpty>
          {groups.map((group, gi) => (
            <React.Fragment key={group.heading}>
              <CommandGroup heading={group.heading}>
                {group.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <CommandItem
                      key={`${group.heading}-${item.label}`}
                      value={`${group.heading} ${item.label} ${item.hint ?? ''}`}
                      onSelect={() => pick(item)}
                    >
                      {Icon && <Icon className="size-4" />}
                      <span>{item.label}</span>
                      {item.hint && (
                        <CommandShortcut className="text-muted-foreground">{item.hint}</CommandShortcut>
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              {gi < groups.length - 1 && <CommandSeparator />}
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}

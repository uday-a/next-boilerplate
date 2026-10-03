'use client'

import { Search, Filter, ChevronDown, X, LayoutGrid, List } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { priorityConfig, assignees, getInitials } from '@/lib/use-kanban'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function KanbanToolbar({
  searchQuery,
  selectedPriority,
  selectedAssignee,
  viewMode,
  onSearchQueryChange,
  onSelectedPriorityChange,
  onSelectedAssigneeChange,
  onViewModeChange,
}: {
  searchQuery: string
  selectedPriority: string | null
  selectedAssignee: string | null
  viewMode: 'board' | 'list'
  onSearchQueryChange: (value: string) => void
  onSelectedPriorityChange: (value: string | null) => void
  onSelectedAssigneeChange: (value: string | null) => void
  onViewModeChange: (value: 'board' | 'list') => void
}) {
  // WHY: chip labels resolve through the same priority config the
  // dropdown uses, so the chip value always matches the menu wording.
  const t = useTranslations()
  const priorityLabel = selectedPriority
    ? (priorityConfig as Record<string, { label: string }>)[selectedPriority]?.label ?? selectedPriority
    : ''
  return (
    <div>
    <div className="mb-3 flex shrink-0 items-center gap-2">
      <div className="relative w-56">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
        <Input
          value={searchQuery}
          placeholder="Search tasks..."
          className="h-8 pl-8 text-sm"
          onChange={(e) => onSearchQueryChange(e.target.value)}
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Filter className="size-3" />
            Priority
            {selectedPriority && (
              <Badge variant="default" className="ml-0.5 h-4 min-w-4 justify-center rounded px-1 text-xs">
                1
              </Badge>
            )}
            <ChevronDown className="text-muted-foreground size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          {Object.entries(priorityConfig).map(([key, config]) => {
            const Icon = config.icon
            return (
              <DropdownMenuItem
                key={key}
                className="gap-2"
                onClick={() => onSelectedPriorityChange(selectedPriority === key ? null : key)}
              >
                <Icon className={cn('size-3.5', config.class)} />
                {config.label}
                {selectedPriority === key && <span className="bg-primary ml-auto size-1.5 rounded-full" />}
              </DropdownMenuItem>
            )
          })}
          {selectedPriority && <DropdownMenuSeparator />}
          {selectedPriority && (
            <DropdownMenuItem onClick={() => onSelectedPriorityChange(null)}>Clear filter</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedAssignee && (
        <Badge
          variant="secondary"
          className="h-7 cursor-pointer gap-1 pr-1.5 text-xs"
          onClick={() => onSelectedAssigneeChange(null)}
        >
          {selectedAssignee}
          <X className="size-3 opacity-50" />
        </Badge>
      )}

      <ToggleGroup
        type="single"
        size="sm"
        value={viewMode}
        className="bg-muted ml-auto flex items-center gap-0.5 rounded-md p-0.5"
        onValueChange={(v) => v && onViewModeChange(v as 'board' | 'list')}
      >
        {/* WHY: board/list toggles carry an accessible name and a
            tooltip like every other icon trigger. */}
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="board"
                className="data-[state=on]:bg-background size-7 rounded-sm p-0 data-[state=on]:shadow-sm"
                aria-label={t('dashboard.kanban.boardView')}
              >
                <LayoutGrid className="size-3.5" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>{t('dashboard.kanban.boardView')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="list"
                className="data-[state=on]:bg-background size-7 rounded-sm p-0 data-[state=on]:shadow-sm"
                aria-label={t('dashboard.kanban.listView')}
              >
                <List className="size-3.5" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>{t('dashboard.kanban.listView')}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </ToggleGroup>

      <div className="flex items-center">
        <TooltipProvider delayDuration={300}>
          {Object.entries(assignees).map(([key, a]) => (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    // rounded-full so the selected ring + focus ring trace the
                    // Avatar's circular outline instead of the rectangular button.
                    'ring-background focus-visible:ring-ring/50 relative -ml-1.5 rounded-full transition-all outline-none first:ml-0 focus-visible:ring-1',
                    selectedAssignee === a.name
                      ? 'ring-primary z-20 ring-1'
                      : selectedAssignee && selectedAssignee !== a.name
                        ? 'opacity-40 hover:opacity-70'
                        : 'hover:z-10 hover:scale-110',
                  )}
                  onClick={() => onSelectedAssigneeChange(selectedAssignee === a.name ? null : a.name)}
                >
                  <Avatar className="border-background size-7 border-2">
                    <AvatarFallback className={cn('text-xs font-semibold', a.color)}>
                      {getInitials(a.name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {a.name}
                {selectedAssignee === a.name && <span className="text-muted-foreground ml-1">(filtered)</span>}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
    {/* WHY: active-filter chip row for priority/assignee/search --
        same contract as the data table: value + clear. */}
    {selectedPriority || selectedAssignee || searchQuery.trim() ? (
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {selectedPriority ? (
          <Badge variant="secondary" className="gap-1 py-0.5 pr-1 text-xs">
            {t('dashboard.kanban.priority')}: {priorityLabel}
            <button
              type="button"
              className="hover:text-foreground focus-visible:ring-ring inline-flex items-center rounded-full p-0.5 focus-visible:ring-2 focus-visible:outline-none"
              aria-label={t('dashboard.kanban.clearFilter')}
              onClick={() => onSelectedPriorityChange(null)}
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          </Badge>
        ) : null}
        {selectedAssignee ? (
          <Badge variant="secondary" className="gap-1 py-0.5 pr-1 text-xs">
            {t('dashboard.kanban.assignee')}: {selectedAssignee}
            <button
              type="button"
              className="hover:text-foreground focus-visible:ring-ring inline-flex items-center rounded-full p-0.5 focus-visible:ring-2 focus-visible:outline-none"
              aria-label={t('dashboard.kanban.clearFilter')}
              onClick={() => onSelectedAssigneeChange(null)}
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          </Badge>
        ) : null}
        {searchQuery.trim() ? (
          <Badge variant="secondary" className="max-w-56 gap-1 py-0.5 pr-1 text-xs">
            <span className="truncate">{t('dashboard.kanban.search')}: &quot;{searchQuery.trim()}&quot;</span>
            <button
              type="button"
              className="hover:text-foreground focus-visible:ring-ring inline-flex shrink-0 items-center rounded-full p-0.5 focus-visible:ring-2 focus-visible:outline-none"
              aria-label={t('dashboard.kanban.clearFilter')}
              onClick={() => onSearchQueryChange('')}
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          </Badge>
        ) : null}
      </div>
    ) : null}
    </div>
  )
}
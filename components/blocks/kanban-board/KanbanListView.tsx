'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, ExternalLink, MessageSquare, Paperclip, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type KanbanColumn as KanbanColumnType, type KanbanTask, getTaskColumn } from '@/lib/use-kanban'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { type FilteredColumn } from './KanbanColumn'
import { TagBadge } from './TagBadge'
import { SubtaskProgress } from './SubtaskProgress'
import { PriorityBadge } from './PriorityBadge'
import { DueDateBadge } from './DueDateBadge'
import { UserAvatar } from './UserAvatar'

type SortField = 'id' | 'title' | 'priority' | 'assignee' | 'dueDate' | 'status'
type SortDir = 'asc' | 'desc'

interface FlatTask {
  task: KanbanTask
  columnId: string
  columnTitle: string
  dotColor: string
}

const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }

export function KanbanListView({
  columns,
  allColumns,
  onTaskClick,
  onMoveTask,
}: {
  columns: FilteredColumn[]
  allColumns: KanbanColumnType[]
  onTaskClick: (task: KanbanTask) => void
  onMoveTask: (task: KanbanTask, targetColumnId: string) => void
}) {
  const [sortField, setSortField] = React.useState<SortField>('status')
  const [sortDir, setSortDir] = React.useState<SortDir>('asc')
  const [collapsedGroups, setCollapsedGroups] = React.useState<Set<string>>(new Set())

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  // WHY: sort buttons announce their state like the data table's.
  function ariaSort(field: SortField): 'ascending' | 'descending' | 'none' {
    if (sortField !== field) return 'none'
    return sortDir === 'asc' ? 'ascending' : 'descending'
  }

  function toggleGroup(columnId: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(columnId)) next.delete(columnId)
      else next.add(columnId)
      return next
    })
  }

  const flatTasks = React.useMemo<FlatTask[]>(() => {
    const items: FlatTask[] = []
    for (const col of columns) {
      for (const task of col.tasks) {
        items.push({ task, columnId: col.id, columnTitle: col.title, dotColor: col.dotColor })
      }
    }
    return [...items].sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'id': {
          const numA = parseInt(a.task.id.replace(/^[A-Z]+-/, ''), 10)
          const numB = parseInt(b.task.id.replace(/^[A-Z]+-/, ''), 10)
          cmp = numA - numB
          break
        }
        case 'title':
          cmp = a.task.title.localeCompare(b.task.title)
          break
        case 'priority':
          cmp = (priorityOrder[a.task.priority] ?? 99) - (priorityOrder[b.task.priority] ?? 99)
          break
        case 'assignee':
          cmp = a.task.assignee.name.localeCompare(b.task.assignee.name)
          break
        case 'dueDate':
          cmp = (a.task.dueDate ?? '9999').localeCompare(b.task.dueDate ?? '9999')
          break
        case 'status': {
          const colOrder = allColumns.map((c) => c.id)
          cmp = colOrder.indexOf(a.columnId) - colOrder.indexOf(b.columnId)
          break
        }
      }
      return sortDir === 'desc' ? -cmp : cmp
    })
  }, [columns, allColumns, sortField, sortDir])

  const groupedTasks = React.useMemo(() => {
    const groups: { column: KanbanColumnType; tasks: FlatTask[] }[] = []
    for (const col of allColumns) {
      const tasks = flatTasks.filter((t) => t.columnId === col.id)
      groups.push({ column: col, tasks })
    }
    return groups
  }, [allColumns, flatTasks])

  function subtasksDone(task: KanbanTask): number {
    if (!task.subtaskIds.length) return 0
    return task.subtaskIds.filter((id) => getTaskColumn(allColumns, id)?.id === 'done').length
  }

  const headerCols: { field: SortField; label: string }[] = [
    { field: 'id', label: 'ID' },
    { field: 'title', label: 'Task' },
    { field: 'status', label: 'Status' },
    { field: 'priority', label: 'Priority' },
    { field: 'assignee', label: 'Assignee' },
    { field: 'dueDate', label: 'Due' },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto pb-3 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]">
      <div className="bg-muted text-muted-foreground sticky top-0 z-10 grid grid-cols-[60px_1fr_100px_110px_130px_100px_80px] items-center gap-2 rounded-t-lg border px-3 py-2 text-xs font-medium tracking-wider uppercase">
        {headerCols.map((h) => (
          <button
            key={h.field}
            className="focus-visible:ring-ring flex items-center gap-1 rounded-sm text-left focus-visible:ring-2 focus-visible:outline-none"
            aria-sort={ariaSort(h.field)}
            onClick={() => toggleSort(h.field)}
          >
            {h.label}
            <ArrowUpDown
              className={cn('size-3', sortField === h.field ? 'text-foreground' : 'text-muted-foreground')}
            />
          </button>
        ))}
        <span className="text-center">Info</span>
      </div>

      {groupedTasks.map((group) => (
        <React.Fragment key={group.column.id}>
          <button
            className="bg-muted/30 hover:bg-muted/50 flex items-center gap-2 border-x border-b px-3 py-1.5 text-left transition-colors"
            onClick={() => toggleGroup(group.column.id)}
          >
            {collapsedGroups.has(group.column.id) ? (
              <ChevronRight className="text-muted-foreground size-3.5" />
            ) : (
              <ChevronDown className="text-muted-foreground size-3.5" />
            )}
            <span className={cn('size-2 rounded-full', group.column.dotColor)} />
            <span className="text-sm font-medium">{group.column.title}</span>
            <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-xs tabular-nums">
              {group.tasks.length}
            </Badge>
          </button>

          {!collapsedGroups.has(group.column.id) &&
            group.tasks.map((item) => (
              <div
                key={item.task.id}
                className="group/row hover:bg-muted/30 relative grid grid-cols-[60px_1fr_100px_110px_130px_100px_80px] items-center gap-2 border-x border-b px-3 py-2 transition-colors"
              >
                <span className="text-muted-foreground font-mono text-xs">{item.task.id}</span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {/* Row's one button, stretched over the row; the link,
                        status select and tooltips sit above it (z-10). */}
                    <button
                      type="button"
                      title={item.task.title}
                      className={cn(
                        'truncate text-left text-sm font-medium outline-none',
                        'focus-visible:after:ring-ring/50 after:absolute after:inset-0 focus-visible:after:ring-[3px] focus-visible:after:ring-inset',
                        item.columnId === 'done' ? 'text-muted-foreground line-through' : '',
                      )}
                      onClick={() => onTaskClick(item.task)}
                    >
                      {item.task.title}
                    </button>
                    <Link
                      href={`/dashboard/kanban/${item.task.id}`}
                      aria-label={`Open ${item.task.id} detail`}
                      className="text-muted-foreground hover:text-foreground relative z-10 shrink-0 opacity-0 transition-opacity group-hover/row:opacity-100 focus-visible:opacity-100"
                    >
                      <ExternalLink className="size-3" />
                    </Link>
                  </div>
                  {(item.task.tags.length > 0 || item.task.subtaskIds.length > 0) && (
                    <div className="mt-0.5 flex items-center gap-1.5">
                      {item.task.tags.map((tag) => (
                        <TagBadge
                          key={tag.label}
                          label={tag.label}
                          color={tag.color}
                          className="!px-1.5 !py-0 !text-xs"
                        />
                      ))}
                      {item.task.subtaskIds.length > 0 && (
                        <SubtaskProgress
                          done={subtasksDone(item.task)}
                          total={item.task.subtaskIds.length}
                          className="ml-1"
                        />
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <Select
                    value={item.columnId}
                    onValueChange={(val) => onMoveTask(item.task, String(val))}
                  >
                    <SelectTrigger
                      className="hover:bg-muted relative z-10 h-6 w-auto gap-1 rounded-md border-none bg-transparent px-1.5 text-xs font-medium shadow-none"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className={cn('size-1.5 rounded-full', item.dotColor)} />
                        <SelectValue />
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {allColumns.map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          <span className="flex items-center gap-1.5">
                            <span className={cn('size-1.5 rounded-full', col.dotColor)} />
                            {col.title}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <PriorityBadge priority={item.task.priority} />

                <div className="flex items-center gap-2">
                  <UserAvatar name={item.task.assignee.name} color={item.task.assignee.color} size="xs" />
                  <span className="relative z-10 truncate text-xs" title={item.task.assignee.name}>{item.task.assignee.name}</span>
                </div>

                <div>
                  {item.task.dueDate ? (
                    <DueDateBadge dueDate={item.task.dueDate} variant="chip" />
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2">
                  <TooltipProvider delayDuration={200}>
                    {item.task.commentItems.length > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-muted-foreground relative z-10 flex items-center gap-0.5 text-xs tabular-nums">
                            <MessageSquare className="size-3" />
                            {item.task.commentItems.length}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">{item.task.commentItems.length} comments</TooltipContent>
                      </Tooltip>
                    )}
                    {item.task.fileItems.length > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-muted-foreground relative z-10 flex items-center gap-0.5 text-xs tabular-nums">
                            <Paperclip className="size-3" />
                            {item.task.fileItems.length}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">{item.task.fileItems.length} files</TooltipContent>
                      </Tooltip>
                    )}
                  </TooltipProvider>
                </div>
              </div>
            ))}
        </React.Fragment>
      ))}

      {flatTasks.length === 0 && (
        <div className="text-muted-foreground flex flex-1 items-center justify-center rounded-b-lg border-x border-b py-4 text-sm">
          No tasks match your filters.
        </div>
      )}
    </div>
  )
}
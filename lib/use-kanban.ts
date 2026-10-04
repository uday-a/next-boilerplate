import {
  CircleAlert,
  ArrowUp,
  ArrowDown,
  Minus,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  type LucideIcon,
} from 'lucide-react'

export interface CommentItem {
  id: string
  author: string
  authorColor: string
  text: string
  time: string
}

export interface FileItem {
  id: string
  name: string
  size: string
  type: 'pdf' | 'spreadsheet' | 'image' | 'other'
}

export interface KanbanTask {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee: { name: string; color: string }
  tags: { label: string; color: string }[]
  dueDate?: string
  parentId?: string
  subtaskIds: string[]
  commentItems: CommentItem[]
  fileItems: FileItem[]
}

export interface KanbanColumn {
  id: string
  title: string
  color: string
  dotColor: string
  tasks: KanbanTask[]
}

export const priorityConfig: Record<string, { icon: LucideIcon; class: string; label: string; bg: string }> = {
  urgent: { icon: CircleAlert, class: 'text-destructive', label: 'Urgent', bg: 'bg-destructive' },
  high: { icon: ArrowUp, class: 'text-warning', label: 'High', bg: 'bg-warning' },
  medium: { icon: Minus, class: 'text-muted-foreground', label: 'Medium', bg: 'bg-muted-foreground' },
  low: { icon: ArrowDown, class: 'text-muted-foreground', label: 'Low', bg: 'bg-border' },
}

// Avatar tints: a fixed pick from the chart-N/15 set (see design rules).
export const assignees = {
  alice: { name: 'Alice Chen', color: 'bg-chart-1/15 text-chart-1' },
  bob: { name: 'Bob Martinez', color: 'bg-chart-2/15 text-chart-2' },
  carol: { name: 'Carol White', color: 'bg-chart-3/15 text-chart-3' },
  david: { name: 'David Kim', color: 'bg-chart-4/15 text-chart-4' },
  eva: { name: 'Eva Johnson', color: 'bg-chart-5/15 text-chart-5' },
  frank: { name: 'Frank Lee', color: 'bg-muted text-muted-foreground' },
}

// Tags are labels, not status — keep them neutral.
const tagColor = 'bg-muted text-muted-foreground ring-border'

export const tagPresets = {
  release: { label: 'Release', color: tagColor },
  bug: { label: 'Bug', color: tagColor },
  docs: { label: 'Docs', color: tagColor },
  customer: { label: 'Customer', color: tagColor },
  infra: { label: 'Infra', color: tagColor },
  security: { label: 'Security', color: tagColor },
  design: { label: 'Design', color: tagColor },
}

export const fileIconMap: Record<string, LucideIcon> = {
  pdf: FileText,
  spreadsheet: FileSpreadsheet,
  image: FileImage,
  other: File,
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function getDueStatus(dueDate?: string): 'overdue' | 'soon' | 'normal' | null {
  if (!dueDate) return null
  const now = new Date()
  const due = new Date(dueDate + 'T00:00:00')
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'overdue'
  if (diffDays <= 3) return 'soon'
  return 'normal'
}

export function formatDueDate(dueDate: string, locale = 'en-US'): string {
  const date = new Date(dueDate + 'T00:00:00')
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
}

export function getAssigneeKey(name: string): keyof typeof assignees {
  for (const [key, val] of Object.entries(assignees)) {
    if (val.name === name) return key as keyof typeof assignees
  }
  return 'alice'
}

export function findTaskById(columns: KanbanColumn[], taskId: string): KanbanTask | undefined {
  for (const col of columns) {
    const task = col.tasks.find((t) => t.id === taskId)
    if (task) return task
  }
  return undefined
}

export function getTaskColumn(columns: KanbanColumn[], taskId: string): KanbanColumn | undefined {
  return columns.find((col) => col.tasks.some((t) => t.id === taskId))
}

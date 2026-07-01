import type { LucideIcon } from 'lucide-react'
import {
  Video,
  CheckCircle2,
  AlertCircle,
  Plane,
} from 'lucide-react'

export interface CalendarEvent {
  id: string
  title: string
  date: string
  start: string
  end: string
  type: 'meeting' | 'task' | 'reminder' | 'travel'
  description: string
  location?: string
  attendees?: string[]
  status: 'confirmed' | 'tentative' | 'cancelled'
}

export const demoEvents: CalendarEvent[] = [
  { id: '1', title: 'Q2 Roadmap Review', date: '2026-05-16', start: '10:00', end: '11:30', type: 'meeting', description: 'Review Design Engineering backlog and prioritize Sprint 25.', location: 'Conference Room A', attendees: ['Sarah Connor', 'Marcus Rivera', 'Alice Chen'], status: 'confirmed' },
  { id: '2', title: 'Customer call — Northwind', date: '2026-05-16', start: '14:00', end: '14:45', type: 'meeting', description: 'Contract renewal discussion. Prepare usage report.', location: 'Zoom', attendees: ['Marcus Rivera'], status: 'confirmed' },
  { id: '3', title: 'Deploy window', date: '2026-05-16', start: '16:00', end: '17:00', type: 'task', description: 'Production deploy for dashboard v2.1. Zero-downtime expected.', status: 'confirmed' },
  { id: '4', title: 'Team standup', date: '2026-05-19', start: '09:30', end: '10:00', type: 'meeting', description: 'Daily sync. Blockers and wins.', location: 'Slack huddle', attendees: ['Design Engineering'], status: 'confirmed' },
  { id: '5', title: 'UX critique', date: '2026-05-20', start: '11:00', end: '12:00', type: 'meeting', description: 'Review new onboarding flow mockups.', location: 'Figma', attendees: ['Alice Chen', 'David Kim'], status: 'tentative' },
  { id: '6', title: 'Berlin trip — Marcus', date: '2026-05-20', start: '08:00', end: '20:00', type: 'travel', description: 'Customer onsite at Sentinel Labs.', location: 'Berlin', status: 'confirmed' },
  { id: '7', title: 'Performance review deadline', date: '2026-05-22', start: '17:00', end: '17:00', type: 'reminder', description: 'Submit peer feedback via Lattice.', status: 'confirmed' },
  { id: '8', title: 'Vue Conf 2026', date: '2026-05-28', start: '09:00', end: '18:00', type: 'travel', description: 'Alice attending. Prepare talk slides.', location: 'San Francisco', attendees: ['Alice Chen'], status: 'confirmed' },
]

export const typeMeta: Record<
  CalendarEvent['type'],
  {
    label: string
    icon: LucideIcon
    chip: string
    bar: string
    dot: string
    glow: string
    text: string
    ring: string
  }
> = {
  meeting: {
    label: 'Meeting',
    icon: Video,
    chip: 'bg-sky-500/10 text-sky-800 ring-sky-500/25 dark:text-sky-300',
    bar: 'bg-sky-500',
    dot: 'bg-sky-500',
    glow: 'bg-sky-500/10',
    text: 'text-sky-700 dark:text-sky-300',
    ring: 'hover:ring-sky-500/30',
  },
  task: {
    label: 'Task',
    icon: CheckCircle2,
    chip: 'bg-emerald-500/10 text-emerald-800 ring-emerald-500/25 dark:text-emerald-300',
    bar: 'bg-emerald-500',
    dot: 'bg-emerald-500',
    glow: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    ring: 'hover:ring-emerald-500/30',
  },
  reminder: {
    label: 'Reminder',
    icon: AlertCircle,
    chip: 'bg-amber-500/10 text-amber-900 ring-amber-500/25 dark:text-amber-300',
    bar: 'bg-amber-500',
    dot: 'bg-amber-500',
    glow: 'bg-amber-500/10',
    text: 'text-amber-800 dark:text-amber-300',
    ring: 'hover:ring-amber-500/30',
  },
  travel: {
    label: 'Travel',
    icon: Plane,
    chip: 'bg-violet-500/10 text-violet-800 ring-violet-500/25 dark:text-violet-300',
    bar: 'bg-violet-500',
    dot: 'bg-violet-500',
    glow: 'bg-violet-500/10',
    text: 'text-violet-700 dark:text-violet-300',
    ring: 'hover:ring-violet-500/30',
  },
}
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
    text: string
  }
> = {
  meeting: {
    label: 'Meeting',
    icon: Video,
    chip: 'bg-chart-1/10 text-chart-1 ring-chart-1/20',
    bar: 'bg-chart-1',
    dot: 'bg-chart-1',
    text: 'text-chart-1',
  },
  task: {
    label: 'Task',
    icon: CheckCircle2,
    chip: 'bg-chart-2/10 text-chart-2 ring-chart-2/20',
    bar: 'bg-chart-2',
    dot: 'bg-chart-2',
    text: 'text-chart-2',
  },
  reminder: {
    label: 'Reminder',
    icon: AlertCircle,
    chip: 'bg-chart-3/10 text-chart-3 ring-chart-3/20',
    bar: 'bg-chart-3',
    dot: 'bg-chart-3',
    text: 'text-chart-3',
  },
  travel: {
    label: 'Travel',
    icon: Plane,
    chip: 'bg-chart-4/10 text-chart-4 ring-chart-4/20',
    bar: 'bg-chart-4',
    dot: 'bg-chart-4',
    text: 'text-chart-4',
  },
}
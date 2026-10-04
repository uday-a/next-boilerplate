import type { LucideIcon } from 'lucide-react'
import { Video, CheckCircle2, AlertCircle, Plane } from 'lucide-react'
import { dateFromKey, isoDate } from '@/lib/use-month-grid'

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

// Calendar is a demo page; the seed data lives inline rather than behind a
// mock API route. Dates are offsets from `todayKey` so the sample schedule
// always sits around the current date. Swap for a real events fetch later.
export function createDemoEvents(todayKey: string): CalendarEvent[] {
  const today = dateFromKey(todayKey)
  const daysFromToday = (n: number) => {
    const d = new Date(today)
    d.setDate(today.getDate() + n)
    return isoDate(d)
  }
  return [
    { id: '1', title: 'Q4 roadmap review', date: daysFromToday(0), start: '10:00', end: '11:30', type: 'meeting', description: 'Review the platform backlog and agree the Q4 priorities.', location: 'Conference Room A', attendees: ['Sarah Connor', 'Marcus Rivera', 'Alice Chen'], status: 'confirmed' },
    { id: '2', title: 'Customer call: Northwind', date: daysFromToday(0), start: '14:00', end: '14:45', type: 'meeting', description: 'Contract renewal discussion. Prepare usage report.', location: 'Zoom', attendees: ['Marcus Rivera'], status: 'confirmed' },
    { id: '3', title: 'Deploy window', date: daysFromToday(0), start: '16:00', end: '17:00', type: 'task', description: 'Production deploy for dashboard v2.1. Zero-downtime expected.', status: 'confirmed' },
    { id: '4', title: 'Team standup', date: daysFromToday(-1), start: '09:30', end: '10:00', type: 'meeting', description: 'Daily sync. Blockers and wins.', location: 'Slack huddle', attendees: ['Platform team'], status: 'confirmed' },
    { id: '5', title: 'UX critique', date: daysFromToday(1), start: '11:00', end: '12:00', type: 'meeting', description: 'Review new onboarding flow mockups.', location: 'Figma', attendees: ['Alice Chen', 'David Kim'], status: 'tentative' },
    { id: '6', title: 'Berlin trip: Marcus', date: daysFromToday(2), start: '08:00', end: '20:00', type: 'travel', description: 'Customer onsite at Sentinel Labs.', location: 'Berlin', status: 'confirmed' },
    { id: '7', title: 'Renew SSL certificates', date: daysFromToday(3), start: '17:00', end: '17:00', type: 'reminder', description: 'Certificates for api.example.com expire next week.', status: 'confirmed' },
    { id: '8', title: 'Vue Conf', date: daysFromToday(9), start: '09:00', end: '18:00', type: 'travel', description: 'Alice attending. Prepare talk slides.', location: 'San Francisco', attendees: ['Alice Chen'], status: 'confirmed' },
    { id: '9', title: 'Invoice run', date: daysFromToday(-3), start: '12:00', end: '13:00', type: 'task', description: 'Send monthly invoices and reconcile failed payments.', status: 'confirmed' },
    { id: '10', title: 'Security review', date: daysFromToday(-6), start: '15:00', end: '16:00', type: 'meeting', description: 'Quarterly access and API key audit.', location: 'Zoom', attendees: ['Sarah Connor', 'David Kim'], status: 'confirmed' },
    { id: '11', title: 'Pricing page copy due', date: daysFromToday(-8), start: '17:00', end: '17:00', type: 'reminder', description: 'Final copy for the new Team plan.', status: 'confirmed' },
  ]
}

// Event types map to the categorical chart ramp (chart-1..4) everywhere
// on the page: stat dot, cell chip, side-rail bar and type pill.
export const typeMeta: Record<
  CalendarEvent['type'],
  { label: string; icon: LucideIcon; dot: string; pill: string; chip: string; iconBox: string }
> = {
  meeting: { label: 'Meeting', icon: Video, dot: 'bg-chart-1', pill: 'bg-chart-1/15 text-foreground', chip: 'bg-chart-1/15 text-foreground border-chart-1', iconBox: 'bg-chart-1/15 text-chart-1' },
  task: { label: 'Task', icon: CheckCircle2, dot: 'bg-chart-2', pill: 'bg-chart-2/15 text-foreground', chip: 'bg-chart-2/15 text-foreground border-chart-2', iconBox: 'bg-chart-2/15 text-chart-2' },
  reminder: { label: 'Reminder', icon: AlertCircle, dot: 'bg-chart-3', pill: 'bg-chart-3/15 text-foreground', chip: 'bg-chart-3/15 text-foreground border-chart-3', iconBox: 'bg-chart-3/15 text-chart-3' },
  travel: { label: 'Travel', icon: Plane, dot: 'bg-chart-4', pill: 'bg-chart-4/15 text-foreground', chip: 'bg-chart-4/15 text-foreground border-chart-4', iconBox: 'bg-chart-4/15 text-chart-4' },
}

'use client'

import * as React from 'react'
import {
  UserPlus,
  CreditCard,
  FileText,
  Rocket,
  ShieldCheck,
  TriangleAlert,
  X,
  BellOff,
  Archive,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OverlayScroll } from '@/components/ui/overlay-scroll'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type NotificationCategory = 'team' | 'billing' | 'deploy' | 'alert' | 'security' | 'system'

interface Notification {
  id: string
  title: string
  body: string
  category: NotificationCategory
  timestamp: Date
  read: boolean
  actionUrl?: string
  actor?: string
}

const categoryConfig: Record<NotificationCategory, { icon: LucideIcon; accent: string; bg: string }> = {
  team: { icon: UserPlus, accent: 'bg-chart-2', bg: 'bg-chart-2/10 text-chart-2' },
  billing: { icon: CreditCard, accent: 'bg-chart-4', bg: 'bg-chart-4/10 text-chart-4' },
  deploy: { icon: Rocket, accent: 'bg-chart-1', bg: 'bg-chart-1/10 text-chart-1' },
  alert: { icon: TriangleAlert, accent: 'bg-warning', bg: 'bg-warning/10 text-warning' },
  security: { icon: ShieldCheck, accent: 'bg-primary', bg: 'bg-primary/10 text-primary' },
  system: { icon: FileText, accent: 'bg-muted-foreground', bg: 'bg-muted text-muted-foreground' },
}

const now = new Date()

const initialNotifications: Notification[] = [
  {
    id: '1',
    title: 'Deploy succeeded',
    body: 'v2.14.0 is live in production. 38 changes shipped.',
    category: 'deploy',
    timestamp: new Date(now.getTime() - 720000),
    read: false,
    actor: 'Deploy bot',
  },
  {
    id: '2',
    title: 'New member joined',
    body: 'Chloe Morgan accepted your invite and joined as Editor.',
    category: 'team',
    timestamp: new Date(now.getTime() - 2700000),
    read: false,
    actor: 'Chloe Morgan',
  },
  {
    id: '3',
    title: 'Usage at 94% of limit',
    body: 'Active file bundles: 47 of 50 used. Upgrade or archive to stay under the cap.',
    category: 'alert',
    timestamp: new Date(now.getTime() - 7200000),
    read: false,
  },
  {
    id: '4',
    title: 'Invoice paid',
    body: 'INV-2031 for $149.00 was charged to Visa ending 4242.',
    category: 'billing',
    timestamp: new Date(now.getTime() - 18000000),
    read: true,
  },
  {
    id: '5',
    title: 'New sign-in from Berlin',
    body: 'Chrome on macOS. If this wasn’t you, revoke the session in Security.',
    category: 'security',
    timestamp: new Date(now.getTime() - 28800000),
    read: true,
  },
  {
    id: '6',
    title: 'Weekly report ready',
    body: 'Your workspace summary for Sep 22 – 28 is ready to view.',
    category: 'system',
    timestamp: new Date(now.getTime() - 93600000),
    read: true,
  },
  {
    id: '7',
    title: 'Deploy rolled back',
    body: 'v2.13.2 was rolled back after a failed health check in eu-west.',
    category: 'deploy',
    timestamp: new Date(now.getTime() - 100800000),
    read: true,
    actor: 'Deploy bot',
  },
  {
    id: '8',
    title: 'API key expires soon',
    body: 'The “CI deploys” key expires in 7 days. Rotate it to avoid failed builds.',
    category: 'security',
    timestamp: new Date(now.getTime() - 172800000),
    read: true,
  },
]

const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

function formatTime(date: Date): string {
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHrs = Math.floor(diffMin / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays}d ago`
}

export interface NotificationsPopoverProps {
  /** Custom trigger. Receives the live unread count. */
  trigger?: (ctx: { unreadCount: number }) => React.ReactNode
}

export function NotificationsPopover({ trigger }: NotificationsPopoverProps) {
  const [notifications, setNotifications] = React.useState<Notification[]>(initialNotifications)
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'unread'>('all')
  const [isOpen, setIsOpen] = React.useState(false)

  const unreadCount = React.useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  const filteredNotifications = React.useMemo(() => {
    if (activeFilter === 'unread') {
      return notifications.filter((n) => !n.read)
    }
    return notifications
  }, [notifications, activeFilter])

  const groupedNotifications = React.useMemo(() => {
    const today = filteredNotifications.filter((n) => n.timestamp >= todayStart)
    const earlier = filteredNotifications.filter((n) => n.timestamp < todayStart)
    return { today, earlier }
  }, [filteredNotifications])

  function markAsRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function dismissNotification(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  function renderItem(n: Notification, animationDelay: number) {
    const Icon = categoryConfig[n.category].icon
    return (
      <div
        key={n.id}
        className="group hover:bg-muted animate-in fade-in-0 slide-in-from-bottom-1 relative cursor-pointer transition-colors duration-150"
        style={{ animationDelay: `${animationDelay}ms` }}
        onClick={() => markAsRead(n.id)}
      >
        <div
          className={[
            'absolute top-2 bottom-2 left-0 w-[3px] rounded-r-full transition-opacity',
            !n.read ? categoryConfig[n.category].accent : 'opacity-0',
          ].join(' ')}
        />

        <div className="flex gap-3 px-4 py-3">
          <div
            className={[
              'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
              categoryConfig[n.category].bg,
            ].join(' ')}
          >
            <Icon className="size-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className={['text-sm leading-snug', !n.read ? 'font-semibold' : 'font-medium'].join(' ')}>
                {n.title}
              </p>
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="text-muted-foreground text-xs whitespace-nowrap tabular-nums">
                  {formatTime(n.timestamp)}
                </span>
                {!n.read ? <span className="bg-primary size-1.5 shrink-0 rounded-full" /> : null}
              </div>
            </div>
            <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-relaxed">{n.body}</p>
          </div>

          <button
            className="text-muted-foreground hover:text-foreground mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            title="Dismiss"
            onClick={(e) => {
              e.stopPropagation()
              dismissNotification(n.id)
            }}
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{trigger ? trigger({ unreadCount }) : <span />}</PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="notification-panel w-[380px] overflow-hidden rounded-lg border p-0 shadow-xl"
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-semibold tracking-tight">Notifications</h3>
            {unreadCount > 0 ? (
              <Badge className="bg-primary/15 text-primary hover:bg-primary/15 h-5 rounded-full px-1.5 text-xs font-semibold tabular-nums">
                {unreadCount}
              </Badge>
            ) : null}
          </div>
          {unreadCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground -mr-1 h-7 px-2 text-xs"
              onClick={markAllRead}
            >
              Mark all read
            </Button>
          ) : null}
        </div>

        <div className="border-b px-4">
          <div className="flex gap-0">
            <button
              className={[
                'relative px-3 pb-2.5 text-xs font-medium transition-colors',
                activeFilter === 'all' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
              onClick={() => setActiveFilter('all')}
            >
              All
              {activeFilter === 'all' ? (
                <span className="bg-primary absolute right-0 bottom-0 left-0 h-[2px] rounded-t-full" />
              ) : null}
            </button>
            <button
              className={[
                'relative px-3 pb-2.5 text-xs font-medium transition-colors',
                activeFilter === 'unread' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
              onClick={() => setActiveFilter('unread')}
            >
              Unread
              {activeFilter === 'unread' ? (
                <span className="bg-primary absolute right-0 bottom-0 left-0 h-[2px] rounded-t-full" />
              ) : null}
            </button>
          </div>
        </div>

        <OverlayScroll className="max-h-[420px]">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div className="bg-muted mb-3 rounded-full p-3">
                <BellOff className="text-muted-foreground size-5" />
              </div>
              <p className="text-sm font-medium">All caught up</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                No {activeFilter === 'unread' ? 'unread ' : ''}notifications
              </p>
            </div>
          ) : (
            <>
              {groupedNotifications.today.length > 0 ? (
                <>
                  <div className="px-4 pt-3 pb-1">
                    <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                      Today
                    </span>
                  </div>
                  {groupedNotifications.today.map((n, index) => renderItem(n, index * 30))}
                </>
              ) : null}

              {groupedNotifications.earlier.length > 0 ? (
                <>
                  <div className="px-4 pt-3 pb-1">
                    <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                      Earlier
                    </span>
                  </div>
                  {groupedNotifications.earlier.map((n, index) =>
                    renderItem(n, (groupedNotifications.today.length + index) * 30),
                  )}
                </>
              ) : null}
            </>
          )}
          <div
            aria-hidden="true"
            className="pointer-events-none sticky bottom-0 -mt-6 h-6 bg-gradient-to-b from-transparent to-popover"
          />
        </OverlayScroll>

        <div className="bg-popover relative z-10 border-t px-4 py-2.5">
          <a
            href="#"
            className="text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 text-xs transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Archive className="size-3.5" aria-hidden="true" />
            View all notifications
          </a>
        </div>
      </PopoverContent>
    </Popover>
  )
}

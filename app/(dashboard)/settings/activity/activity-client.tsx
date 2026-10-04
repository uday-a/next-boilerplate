'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity as ActivityIcon, CloudOff, Loader2, LogIn, FolderPlus, MessageSquare, Search, Tag, UserPlus } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { ApiResponse } from '@/lib/api/response'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'

interface ActivityItem {
  id: number
  userId: number | null
  action: string
  entity: string | null
  entityId: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  actorEmail: string | null
}

function actionIcon(action: string) {
  if (action.startsWith('auth.')) return LogIn
  if (action.startsWith('projects.')) return FolderPlus
  if (action.startsWith('feedback.')) return MessageSquare
  if (action.startsWith('team.')) return UserPlus
  return ActivityIcon
}

function entityLabel(item: ActivityItem): string {
  if (!item.entity) return '—'
  return item.entityId ? `${item.entity} #${item.entityId}` : item.entity
}

export function ActivitySettingsClient() {
  const t = useTranslations()
  const locale = useLocale()
  const [actionQuery, setActionQuery] = useState('')
  const [entityQuery, setEntityQuery] = useState('')
  const [items, setItems] = useState<ActivityItem[]>([])
  const [pending, setPending] = useState(true)
  const [loadError, setLoadError] = useState(false)

  function timeAgo(value: string): string {
    const date = new Date(value)
    const diffMs = date.getTime() - Date.now()
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
    const absSec = Math.abs(diffMs) / 1000
    if (absSec < 60) return rtf.format(Math.round(diffMs / 1000), 'second')
    const mins = Math.round(diffMs / 60000)
    if (Math.abs(mins) < 60) return rtf.format(mins, 'minute')
    const hours = Math.round(diffMs / 3600000)
    if (Math.abs(hours) < 24) return rtf.format(hours, 'hour')
    const days = Math.round(diffMs / 86400000)
    if (Math.abs(days) < 30) return rtf.format(days, 'day')
    const months = Math.round(diffMs / 2592000000)
    if (Math.abs(months) < 12) return rtf.format(months, 'month')
    return rtf.format(Math.round(diffMs / 31536000000), 'year')
  }

  function formatFull(value: string): string {
    return new Date(value).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })
  }

  const load = useCallback(async () => {
    setPending(true)
    setLoadError(false)
    try {
      const q = actionQuery.trim() ? `?action=${encodeURIComponent(actionQuery.trim())}` : ''
      const res = await fetch(`/api/activity${q}`, { cache: 'no-store' })
      const json = (await res.json()) as ApiResponse<{ items: ActivityItem[]; total: number }>
      if (json.ok) setItems(json.data.items)
      else setLoadError(true)
    } catch {
      setLoadError(true)
    } finally {
      setPending(false)
    }
  }, [actionQuery])

  useEffect(() => {
    const timer = setTimeout(() => void load(), actionQuery ? 300 : 0)
    return () => clearTimeout(timer)
  }, [load, actionQuery])

  const filtered = useMemo(() => {
    const needle = entityQuery.trim().toLowerCase()
    if (!needle) return items
    return items.filter(
      (item) => item.entity?.toLowerCase().includes(needle) || item.entityId?.toLowerCase().includes(needle),
    )
  }, [items, entityQuery])

  const isFiltering = Boolean(actionQuery.trim() || entityQuery.trim())

  return (
    <Page>
      <PageHeader>
        <PageHeaderHeading
          title={t('nav.items.activityLog')}
          description={t('settings.activity.description')}
        />
      </PageHeader>
      <PageBody className="space-y-4">
        <Card>
          <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center">
            <div className="w-full sm:w-64">
              <Input
                value={actionQuery}
                onChange={(e) => setActionQuery(e.target.value)}
                size="small"
                prefixIcon={<Search className="size-4" aria-hidden="true" />}
                placeholder={t('settings.activity.filters.action')}
                aria-label={t('settings.activity.filters.action')}
              />
            </div>
            <div className="w-full sm:w-64">
              <Input
                value={entityQuery}
                onChange={(e) => setEntityQuery(e.target.value)}
                size="small"
                prefixIcon={<Tag className="size-4" aria-hidden="true" />}
                placeholder={t('settings.activity.filters.entity')}
                aria-label={t('settings.activity.filters.entity')}
              />
            </div>
          </div>
          {pending ? (
            <div className="text-muted-foreground flex items-center gap-2 px-4 py-4 text-sm">
              <Loader2 className="size-4 animate-spin" />
              {t('settings.activity.states.loading')}
            </div>
          ) : loadError ? (
            <EmptyState
              className="px-4"
              role="alert"
              icon={CloudOff}
              title={t('settings.activity.states.error')}
              description="Something went wrong on our side. Please try again."
            >
              <Button variant="outline" size="sm" className="mt-4" onClick={() => void load()}>
                {t('settings.activity.states.retry')}
              </Button>
            </EmptyState>
          ) : !filtered.length && isFiltering ? (
            <EmptyState
              className="px-4"
              icon={Search}
              title={t('settings.activity.states.noMatchTitle')}
              description={t('settings.activity.states.noMatchDescription')}
            >
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setActionQuery('')
                  setEntityQuery('')
                }}
              >
                {t('settings.activity.states.clearFilters')}
              </Button>
            </EmptyState>
          ) : !filtered.length ? (
            <EmptyState
              className="px-4"
              icon={ActivityIcon}
              title={t('settings.activity.states.empty')}
              description={t('settings.activity.states.emptyDescription')}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('settings.activity.table.event')}</TableHead>
                  <TableHead>{t('settings.activity.table.actor')}</TableHead>
                  <TableHead>{t('settings.activity.table.entity')}</TableHead>
                  <TableHead className="text-right">{t('settings.activity.table.time')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => {
                  const Icon = actionIcon(item.action)
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <span className="flex items-center gap-2 text-sm font-medium">
                          <Icon className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
                          <span className="font-mono text-xs">{item.action}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-55 truncate text-xs" title={item.actorEmail ?? undefined}>
                        {item.actorEmail ?? t('settings.activity.feed.deletedUser')}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{entityLabel(item)}</TableCell>
                      <TableCell className="text-right">
                        <time title={formatFull(item.createdAt)} className="text-muted-foreground text-xs tabular-nums">
                          {timeAgo(item.createdAt)}
                        </time>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      </PageBody>
    </Page>
  )
}

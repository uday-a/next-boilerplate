'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, CircleDot, FolderPlus, Loader2, Plus } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { DemoDataBanner } from '@/components/blocks/DemoDataBanner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import type { ApiResponse } from '@/lib/api/response'

interface Project {
  id: number
  slug: string
  name: string
  description: string | null
  ownerId: number
  createdAt: string | Date
  updatedAt: string | Date
}

// Members, status and open-task counts aren't in the projects API yet, so
// each card gets deterministic sample values keyed by project id. Swap this
// for real fields once the API returns them.
const SAMPLE_MEMBERS = ['Emma Clarke', 'James Porter', 'Olivia Brooks', 'Daniel Hughes', 'Sophie Turner', 'Liam Foster']
const SAMPLE_STATUS = [
  { label: 'On track', variant: 'success' },
  { label: 'At risk', variant: 'warning' },
  { label: 'On hold', variant: 'secondary' },
] as const

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
}

function sampleMeta(id: number) {
  const memberCount = 2 + (id % 4)
  const members = Array.from({ length: memberCount }, (_, i) => SAMPLE_MEMBERS[(id + i) % SAMPLE_MEMBERS.length]!)
  return {
    members,
    status: SAMPLE_STATUS[id % SAMPLE_STATUS.length]!,
    openTasks: 3 + ((id * 7) % 18),
  }
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

export function ProjectsClient() {
  const t = useTranslations()
  const locale = useLocale()
  const [projects, setProjects] = useState<Project[]>([])
  const [pending, setPending] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ slug: '', name: '', description: '' })
  // Auto-derive the slug from the name until the user edits it themselves.
  const [slugTouched, setSlugTouched] = useState(false)
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setPending(true)
    setFetchError(false)
    try {
      const res = await fetch('/api/projects', { cache: 'no-store' })
      const json = (await res.json()) as ApiResponse<{ projects: Project[] }>
      if (json.ok) setProjects(json.data.projects)
      else setFetchError(true)
    } catch {
      setFetchError(true)
    } finally {
      setPending(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function timeAgo(value: string | Date) {
    const diffMs = new Date(value).getTime() - Date.now()
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
    const days = Math.round(diffMs / 86400000)
    if (Math.abs(days) < 1) return rtf.format(Math.round(diffMs / 3600000), 'hour')
    if (Math.abs(days) < 30) return rtf.format(days, 'day')
    return rtf.format(Math.round(days / 30), 'month')
  }

  async function createProject() {
    setSubmitState('submitting')
    setSubmitError(null)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: form.slug, name: form.name, description: form.description || undefined }),
      })
      const json = (await res.json()) as ApiResponse<{ project: Project }>
      if (!json.ok) {
        setSubmitError(json.error.message)
        setSubmitState('error')
        return
      }
      setForm({ slug: '', name: '', description: '' })
      setSlugTouched(false)
      setSubmitState('idle')
      setOpen(false)
      await load()
    } catch {
      setSubmitError('Failed to create project')
      setSubmitState('error')
    }
  }

  return (
    <Page>
      <PageHeader
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" aria-hidden="true" />
                New project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New project</DialogTitle>
                <DialogDescription>Group related work and the people working on it.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-1">
                <div className="grid gap-2">
                  <Label htmlFor="np-name">Name</Label>
                  <Input
                    id="np-name"
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value
                      setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : toSlug(name) }))
                    }}
                    placeholder="My new project"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="np-slug">URL name</Label>
                  <Input
                    id="np-slug"
                    value={form.slug}
                    onChange={(e) => {
                      setSlugTouched(true)
                      setForm((f) => ({ ...f, slug: e.target.value }))
                    }}
                    placeholder="my-new-project"
                  />
                  <p className="text-muted-foreground text-xs">
                    Used in the project URL. Lowercase letters, numbers and hyphens.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="np-desc">Description (optional)</Label>
                  <Textarea
                    id="np-desc"
                    value={form.description}
                    onValueChange={(v) => setForm((f) => ({ ...f, description: v }))}
                    rows={3}
                  />
                </div>
                {submitError ? (
                  <div className="text-destructive flex items-center gap-2 text-sm">
                    <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                    {submitError}
                  </div>
                ) : null}
              </div>
              <DialogFooter>
                <Button variant="outline" disabled={submitState === 'submitting'} onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={submitState === 'submitting' || !form.name || !form.slug}
                  onClick={() => void createProject()}
                >
                  {submitState === 'submitting' ? <Loader2 className="size-4 animate-spin" /> : null}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        <PageHeaderHeading
          title={t('nav.items.projects')}
          description="Group related work, the people on it and what's still open."
        />
      </PageHeader>

      <PageBody className="space-y-4">
        {fetchError ? (
          <EmptyState
            icon={AlertCircle}
            role="alert"
            title="Couldn't load projects"
            description="Something went wrong on our side. Try again in a moment."
          >
            <Button size="sm" variant="outline" className="mt-4" onClick={() => void load()}>
              Retry
            </Button>
          </EmptyState>
        ) : pending ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-52 rounded-xl" />
            ))}
          </div>
        ) : !projects.length ? (
          <EmptyState icon={FolderPlus} title={t('projects.empty.title')} description={t('projects.empty.description')}>
            <Button size="sm" className="mt-4" onClick={() => setOpen(true)}>
              <Plus className="size-4" aria-hidden="true" />
              {t('projects.empty.action')}
            </Button>
          </EmptyState>
        ) : (
          <>
            <DemoDataBanner message="Members, status and open tasks are sample values." />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => {
                const meta = sampleMeta(p.id)
                return (
                  <Link
                    key={p.id}
                    href={`/projects/${p.slug}`}
                    className="group focus-visible:ring-ring/50 rounded-xl outline-none focus-visible:ring-[3px]"
                  >
                    <Card className="group-hover:border-primary/40 flex h-full flex-col transition-colors">
                      <CardHeader>
                        <CardTitle className="text-base">{p.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{p.description || 'No description yet.'}</CardDescription>
                        <CardAction>
                          <Badge variant={meta.status.variant}>{meta.status.label}</Badge>
                        </CardAction>
                      </CardHeader>
                      <CardContent className="mt-auto">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex -space-x-2">
                            {meta.members.map((member) => (
                              <Avatar key={member} className="ring-card size-8 ring-2" title={member}>
                                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                  {initials(member)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs tabular-nums">
                            <CircleDot className="size-3.5" aria-hidden="true" />
                            {meta.openTasks} open
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="text-muted-foreground border-t pt-4 text-xs">
                        <span>
                          Updated <time dateTime={new Date(p.updatedAt).toISOString()}>{timeAgo(p.updatedAt)}</time>
                        </span>
                      </CardFooter>
                    </Card>
                  </Link>
                )
              })}

              <button
                type="button"
                className="text-muted-foreground hover:border-primary/40 hover:text-foreground focus-visible:ring-ring/50 flex min-h-52 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm transition-colors outline-none focus-visible:ring-[3px]"
                onClick={() => setOpen(true)}
              >
                <FolderPlus className="size-5" aria-hidden="true" />
                New project
              </button>
            </div>
          </>
        )}
      </PageBody>
    </Page>
  )
}

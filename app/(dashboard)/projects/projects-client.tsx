'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Folder, Plus, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
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

export function ProjectsClient() {
  const [projects, setProjects] = useState<Project[]>([])
  const [pending, setPending] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ slug: '', name: '', description: '' })
  const [slugTouched, setSlugTouched] = useState(false)
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setPending(true)
    setFetchError(null)
    try {
      const res = await fetch('/api/projects', { cache: 'no-store' })
      const json = (await res.json()) as ApiResponse<{ projects: Project[] }>
      if (json.ok) setProjects(json.data.projects)
      else setFetchError(json.error.message)
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Failed to load projects')
    } finally {
      setPending(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (slugTouched) return
    setForm((f) => ({
      ...f,
      slug: f.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 64),
    }))
  }, [form.name, slugTouched])

  async function createProject() {
    setSubmitState('submitting')
    setSubmitError(null)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: form.slug,
          name: form.name,
          description: form.description || undefined,
        }),
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
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to create project')
      setSubmitState('error')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm">
            Workspaces grouping related work, members, and assets.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" />
              New project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New project</DialogTitle>
              <DialogDescription>Slug becomes part of the URL: /projects/&lt;slug&gt;.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid gap-1.5">
                <Label htmlFor="np-name">Name</Label>
                <Input
                  id="np-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="My new project"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="np-slug">Slug</Label>
                <Input
                  id="np-slug"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    setForm((f) => ({ ...f, slug: e.target.value }))
                  }}
                  placeholder="my-new-project"
                />
                <p className="text-muted-foreground text-xs">Lowercase letters, numbers, hyphens. Must be unique.</p>
              </div>
              <div className="grid gap-1.5">
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
                  <AlertCircle className="size-4" />
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
      </header>

      {fetchError ? (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
          <AlertCircle className="size-4" />
          {fetchError}
        </div>
      ) : pending ? (
        <div className="text-muted-foreground text-sm">Loading projects…</div>
      ) : !projects.length ? (
        <div className="text-muted-foreground text-sm">No projects yet. Create one to get started.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.slug}`} className="group">
              <Card className="h-full transition-colors group-hover:border-foreground/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Folder className="text-muted-foreground size-4" />
                    <CardTitle className="text-base">{p.name}</CardTitle>
                  </div>
                  <CardDescription>{p.description ?? '—'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-muted-foreground text-xs">Open project →</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
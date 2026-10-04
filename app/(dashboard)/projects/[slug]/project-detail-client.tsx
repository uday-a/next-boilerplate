'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { AlertCircle, Loader2, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { ApiResponse } from '@/lib/api/response'
import { EmptyState } from '@/components/ui/empty-state'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'
import { Skeleton } from '@/components/ui/skeleton'

export interface Project {
  id: number
  slug: string
  name: string
  description: string | null
  ownerId: number
  createdAt: string | Date
  updatedAt: string | Date
}

export function ProjectDetailClient({ slug, initialProject }: { slug: string; initialProject: Project | null }) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations()
  // Server-loaded (page.tsx) so the H1 and <title> show the name on first paint.
  const [project, setProject] = useState<Project | null>(initialProject)
  const [pending, setPending] = useState(false)
  const [loadError, setLoadError] = useState(!initialProject)
  const [form, setForm] = useState({ name: initialProject?.name ?? '', description: initialProject?.description ?? '' })
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deleteState, setDeleteState] = useState<'idle' | 'deleting'>('idle')
  // Designed confirm dialog instead of window.confirm().
  const [confirmDelete, setConfirmDelete] = useState(false)

  const load = useCallback(async () => {
    setPending(true)
    setLoadError(false)
    try {
      const res = await fetch(`/api/projects/${slug}`, { cache: 'no-store' })
      const json = (await res.json()) as ApiResponse<{ project: Project }>
      if (json.ok) {
        setProject(json.data.project)
        setForm({
          name: json.data.project.name,
          description: json.data.project.description ?? '',
        })
      } else setLoadError(true)
    } catch {
      setLoadError(true)
    } finally {
      setPending(false)
    }
  }, [slug])

  async function save() {
    if (!project) return
    setSaveState('saving')
    setSaveError(null)
    try {
      const res = await fetch(`/api/projects/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, description: form.description || null }),
      })
      const json = (await res.json()) as ApiResponse<{ project: Project }>
      if (!json.ok) {
        setSaveError(json.error.message)
        setSaveState('error')
        return
      }
      setSaveState('idle')
      await load()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save')
      setSaveState('error')
    }
  }

  async function remove() {
    if (!project) return
    setConfirmDelete(false)
    setDeleteState('deleting')
    try {
      const res = await fetch(`/api/projects/${slug}`, { method: 'DELETE' })
      const json = (await res.json()) as ApiResponse<{ deleted: boolean }>
      if (json.ok) {
        router.push('/projects')
        return
      }
      setSaveError(json.error.message)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to delete')
    } finally {
      setDeleteState('idle')
    }
  }

  return (
    <Page>
      <PageHeader>
        <PageHeaderHeading
          title={project?.name ?? t('nav.items.projects')}
          description={project ? `Created ${new Date(project.createdAt).toLocaleDateString(locale)}` : undefined}
        />
      </PageHeader>
      <PageBody className="max-w-3xl space-y-4">
        {loadError ? (
          <EmptyState
            icon={AlertCircle}
            role="alert"
            title="Couldn't load this project"
            description="It may have been deleted, or something went wrong on our side."
          >
            <div className="mt-4 flex justify-center gap-2">
              <Button size="sm" variant="outline" onClick={() => void load()}>
                Retry
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <Link href="/projects">Back to projects</Link>
              </Button>
            </div>
          </EmptyState>
        ) : pending ? (
          <Skeleton className="h-72 rounded-xl" aria-busy="true" />
        ) : project ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
            <CardDescription>Rename the project or update its description.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="p-name">Name</Label>
              <Input id="p-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-desc">Description</Label>
              <Textarea
                id="p-desc"
                value={form.description}
                onValueChange={(v) => setForm((f) => ({ ...f, description: v }))}
                rows={4}
              />
            </div>
            {saveError ? (
              <div className="text-destructive flex items-center gap-2 text-sm" role="alert">
                <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                {saveError}
              </div>
            ) : null}
            <div className="flex justify-between">
              <Button
                variant="ghost"
                disabled={deleteState === 'deleting'}
                className="text-destructive hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Delete project
              </Button>
              <Button disabled={saveState === 'saving' || !form.name} onClick={() => void save()}>
                {saveState === 'saving' ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                Save changes
              </Button>
            </div>
          </CardContent>
        </Card>
        ) : null}

        <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete &ldquo;{project?.name}&rdquo;?</DialogTitle>
              <DialogDescription>The project and its settings are removed for everyone. This can&rsquo;t be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => void remove()}>
                <Trash2 className="size-4" aria-hidden="true" />
                Delete project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageBody>
    </Page>
  )
}
'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Folder, AlertCircle, Loader2, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

export function ProjectDetailClient({ slug }: { slug: string }) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [pending, setPending] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deleteState, setDeleteState] = useState<'idle' | 'deleting'>('idle')

  const load = useCallback(async () => {
    setPending(true)
    setLoadError(null)
    try {
      const res = await fetch(`/api/projects/${slug}`, { cache: 'no-store' })
      const json = (await res.json()) as ApiResponse<{ project: Project }>
      if (json.ok) {
        setProject(json.data.project)
        setForm({
          name: json.data.project.name,
          description: json.data.project.description ?? '',
        })
      } else setLoadError(json.error.message)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load project')
    } finally {
      setPending(false)
    }
  }, [slug])

  useEffect(() => {
    void load()
  }, [load])

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
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return
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

  if (loadError) {
    return (
      <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
        <AlertCircle className="size-4" />
        {loadError}
      </div>
    )
  }

  if (pending) {
    return <div className="text-muted-foreground text-sm">Loading…</div>
  }

  if (!project) return null

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Folder className="text-muted-foreground size-4" />
          <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Project · <code>{project.slug}</code> · created{' '}
          {new Date(project.createdAt).toLocaleDateString()}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
          <CardDescription>Edit the project metadata. Slug is immutable after creation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="p-name">Name</Label>
            <Input id="p-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea
              id="p-desc"
              value={form.description}
              onValueChange={(v) => setForm((f) => ({ ...f, description: v }))}
              rows={4}
            />
          </div>
          {saveError ? (
            <div className="text-destructive flex items-center gap-2 text-sm">
              <AlertCircle className="size-4" />
              {saveError}
            </div>
          ) : null}
          <div className="flex justify-between">
            <Button
              variant="ghost"
              disabled={deleteState === 'deleting'}
              className="text-destructive hover:text-destructive"
              onClick={() => void remove()}
            >
              <Trash2 className="size-4" />
              Delete project
            </Button>
            <Button disabled={saveState === 'saving' || !form.name} onClick={() => void save()}>
              {saveState === 'saving' ? <Loader2 className="size-4 animate-spin" /> : null}
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
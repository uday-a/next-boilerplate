'use client'

import { AlertCircle, Bug, CheckCircle2, Lightbulb, Send, Sparkles, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DemoDataBanner } from '@/components/blocks/DemoDataBanner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload, FileUploadContent, FileUploadItem } from '@/components/ui/file-upload'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import type { ApiResponse } from '@/lib/api/response'

type Category = 'idea' | 'bug' | 'praise'

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent'; delivered: boolean }
  | { kind: 'error'; message: string }

// Screenshots: images only, capped at 3 files / 5 MB each. Validated
// here for fast feedback; the API re-checks every file server-side.
const MAX_FEEDBACK_FILES = 3
const MAX_FEEDBACK_FILE_BYTES = 5 * 1024 * 1024

const recent = [
  { kind: 'bug', author: 'Mark R.', summary: 'Chart tooltip flickers when a series crosses zero', upvotes: 8, status: 'in-progress', age: '2d ago' },
  { kind: 'idea', author: 'Alice C.', summary: 'Pin favorite projects to the top of the sidebar', upvotes: 14, status: 'planned', age: '4d ago' },
  { kind: 'idea', author: 'David K.', summary: 'Compare two billing periods side by side on the usage page', upvotes: 32, status: 'planned', age: '1w ago' },
  { kind: 'bug', author: 'Eva J.', summary: 'CSV export adds a blank line at the end of the file', upvotes: 3, status: 'shipped', age: '1w ago' },
  { kind: 'idea', author: 'Frank L.', summary: 'Slack notifications when a deploy finishes', upvotes: 21, status: 'considering', age: '2w ago' },
  { kind: 'praise', author: 'Olivia P.', summary: 'The new search is incredibly fast — feels instant.', upvotes: 11, status: '', age: '2w ago' },
]

const statusVariant: Record<string, 'success' | 'info' | 'secondary' | 'outline'> = {
  shipped: 'success',
  'in-progress': 'info',
  planned: 'secondary',
  considering: 'outline',
}

const kindIcon = { bug: Bug, idea: Lightbulb, praise: Sparkles } as const

const categories: { value: Category; label: string }[] = [
  { value: 'idea', label: 'Idea' },
  { value: 'bug', label: 'Bug' },
  { value: 'praise', label: 'Praise' },
]

export function FeedbackClient() {
  const t = useTranslations()
  const [category, setCategory] = useState<Category>('idea')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  function onFilesPicked(next: File[]) {
    let error: string | null = null
    const merged = [...files]
    for (const f of next) {
      if (!f.type.startsWith('image/')) {
        error = t('feedback.attachments.badType', { name: f.name })
        continue
      }
      if (f.size > MAX_FEEDBACK_FILE_BYTES) {
        error = t('feedback.attachments.tooBig', { name: f.name })
        continue
      }
      if (merged.length >= MAX_FEEDBACK_FILES) {
        error = t('feedback.attachments.tooMany')
        break
      }
      if (merged.some((m) => m.name === f.name && m.size === f.size)) continue
      merged.push(f)
    }
    setFileError(error)
    setFiles(merged.slice(0, MAX_FEEDBACK_FILES))
  }

  function removeFile(index: number) {
    const next = files.filter((_, i) => i !== index)
    setFiles(next)
    if (!next.length) setFileError(null)
  }

  async function onSend() {
    setStatus({ kind: 'sending' })
    const form = new FormData()
    form.append('category', category)
    form.append('subject', subject)
    form.append('message', message)
    for (const f of files) form.append('files', f, f.name)
    const res = await fetch('/api/feedback', { method: 'POST', body: form })
      .then((r) => r.json() as Promise<ApiResponse<{ delivered: boolean; id: string | null }>>)
      .catch(() => ({ ok: false, error: { code: 'INTERNAL', message: 'Failed to send feedback' } }) as const)

    if (!res.ok) {
      setStatus({ kind: 'error', message: res.error.message })
      return
    }

    setStatus({ kind: 'sent', delivered: res.data.delivered })
    setSubject('')
    setMessage('')
    setFiles([])
    setFileError(null)
  }

  return (
    <Page>
      <PageHeader>
        <PageHeaderHeading
          title={t('nav.items.feedback')}
          description="Tell us what's broken, what's missing and what works. We read every note within 48 hours."
        />
      </PageHeader>

      <PageBody className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Send us a note</CardTitle>
            <CardDescription>Pick the closest category so the right person replies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label id="fb-category">Category</Label>
              <RadioGroup
                value={category}
                onValueChange={(v) => setCategory(v as Category)}
                aria-labelledby="fb-category"
                className="grid grid-cols-3 gap-2"
              >
                {categories.map((c) => (
                  <div
                    key={c.value}
                    className="hover:bg-muted/40 [&:has([data-state=checked])]:bg-muted [&:has([data-state=checked])]:border-foreground/30 flex cursor-pointer items-center gap-2 rounded-lg border p-3"
                  >
                    <RadioGroupItem id={`cat-${c.value}`} value={c.value} />
                    <Label htmlFor={`cat-${c.value}`} className="cursor-pointer text-sm font-medium">
                      {c.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fb-subject">Subject</Label>
              <Input
                id="fb-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="One-line summary"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fb-message">Details</Label>
              <Textarea
                id="fb-message"
                value={message}
                onValueChange={setMessage}
                rows={6}
                placeholder="What happened? What were you expecting? Anything we should reproduce?"
              />
              <p className="text-muted-foreground text-xs">
                For bugs, include the steps you took and the request ID from any error message.
              </p>
            </div>

            <div className="grid gap-2">
              <Label>{t('feedback.attachments.label')}</Label>
              <FileUpload
                value={files}
                accept="image/*"
                multiple
                disabled={status.kind === 'sending'}
                onValueChange={onFilesPicked}
                content={
                  files.length ? (
                    <FileUploadContent>
                      {files.map((f, i) => (
                        <FileUploadItem key={`${f.name}-${f.size}`} file={f} onRemove={() => removeFile(i)} />
                      ))}
                    </FileUploadContent>
                  ) : null
                }
              />
              <p className="text-muted-foreground text-xs">{t('feedback.attachments.hint')}</p>
              {fileError ? <p className="text-destructive text-xs">{fileError}</p> : null}
            </div>

            {status.kind === 'sent' ? (
              <div
                className="border-success/30 bg-success/10 text-success flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                role="status"
              >
                <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
                {/* `status.delivered` is false when no email provider is set up
                    (the note is printed to the server log instead). */}
                Thanks — we got it.
              </div>
            ) : status.kind === 'error' ? (
              <div
                className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                role="alert"
              >
                <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                {status.message}
              </div>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button variant="outline" disabled={status.kind === 'sending'}>
                Save draft
              </Button>
              <Button
                disabled={status.kind === 'sending' || subject.length < 3 || message.length < 10}
                onClick={() => void onSend()}
              >
                <Send className="size-4" aria-hidden="true" />
                {status.kind === 'sending' ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent from the team</CardTitle>
            <CardDescription>Public feedback from your workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DemoDataBanner message="Sample feedback. Your team's notes will appear here." />
            {recent.map((r, i) => {
              const Icon = kindIcon[r.kind as keyof typeof kindIcon]
              return (
                <div key={i} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-sm">{r.summary}</p>
                      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                        <span>
                          {r.author} · {r.age}
                        </span>
                        {r.status ? (
                          <Badge variant={statusVariant[r.status]} className="capitalize">
                            {r.status.replace('-', ' ')}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={`Upvote: ${r.upvotes} votes`}
                      className="hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors"
                    >
                      <ThumbsUp className="size-3.5" aria-hidden="true" />
                      <span className="tabular-nums">{r.upvotes}</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </PageBody>
    </Page>
  )
}

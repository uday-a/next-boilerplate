'use client'

import {
  AlertCircle,
  Bug,
  CheckCircle2,
  Lightbulb,
  MessageCircle,
  Send,
  Sparkles,
  ThumbsUp,
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { ApiResponse } from '@/lib/api/response'
import { cn } from '@/lib/utils'

type Category = 'idea' | 'bug' | 'praise'

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent'; delivered: boolean }
  | { kind: 'error'; message: string }

const recent = [
  {
    kind: 'bug',
    author: 'Marcus R.',
    summary: 'Sparkline tooltip flickers when crossing zero',
    upvotes: 8,
    status: 'in-progress',
    age: '2d ago',
  },
  {
    kind: 'idea',
    author: 'Alice C.',
    summary: 'Let me pin sessions from the playground header, not just the menu',
    upvotes: 14,
    status: 'planned',
    age: '4d ago',
  },
  {
    kind: 'idea',
    author: 'David K.',
    summary: 'Add a "compare two models side-by-side" view in the playground',
    upvotes: 32,
    status: 'planned',
    age: '1w ago',
  },
  {
    kind: 'bug',
    author: 'Eva J.',
    summary: 'JSON mode adds a trailing newline on Quantum responses',
    upvotes: 3,
    status: 'shipped',
    age: '1w ago',
  },
  {
    kind: 'idea',
    author: 'Frank L.',
    summary: 'Slack notifications when batch jobs finish',
    upvotes: 21,
    status: 'considering',
    age: '2w ago',
  },
  {
    kind: 'praise',
    author: 'Olive P.',
    summary: 'The new docs search is incredibly fast — feels instant.',
    upvotes: 11,
    status: '',
    age: '2w ago',
  },
]

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  shipped: 'default',
  'in-progress': 'secondary',
  planned: 'outline',
  considering: 'outline',
}

const kindIcon = { bug: Bug, idea: Lightbulb, praise: Sparkles } as const
const kindColor: Record<string, string> = {
  bug: 'text-amber-600 dark:text-amber-400',
  idea: 'text-violet-600 dark:text-violet-400',
  praise: 'text-emerald-600 dark:text-emerald-400',
}

const categories: { value: Category; label: string; id: string }[] = [
  { value: 'idea', label: 'Idea', id: 'cat-idea' },
  { value: 'bug', label: 'Bug', id: 'cat-bug' },
  { value: 'praise', label: 'Praise', id: 'cat-praise' },
]

export function FeedbackClient() {
  const [category, setCategory] = useState<Category>('idea')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  async function onSend() {
    setStatus({ kind: 'sending' })
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, subject, message }),
    })
      .then((r) => r.json() as Promise<ApiResponse<{ delivered: boolean; id: string | null }>>)
      .catch(() => ({ ok: false, error: { code: 'INTERNAL', message: 'Failed to send feedback' } }) as const)

    if (!res.ok) {
      setStatus({ kind: 'error', message: res.error.message })
      return
    }

    setStatus({ kind: 'sent', delivered: res.data.delivered })
    setSubject('')
    setMessage('')
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Feedback</h1>
        <p className="text-muted-foreground text-sm">
          Tell us what&apos;s broken, what&apos;s missing, what feels right. We read every submission within 48 hours.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Send us a note</CardTitle>
            <CardDescription>
              Choose the closest match. We route based on category and respond from the right person.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-2">
              <Label>Category</Label>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Feedback category">
                {categories.map((cat) => (
                  <div
                    key={cat.value}
                    role="radio"
                    aria-checked={category === cat.value}
                    tabIndex={0}
                    className={cn(
                      'hover:bg-muted/40 flex cursor-pointer items-center gap-2 rounded-lg border p-3',
                      category === cat.value && 'bg-muted border-foreground/30',
                    )}
                    onClick={() => setCategory(cat.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setCategory(cat.value)
                      }
                    }}
                  >
                    <input
                      type="radio"
                      id={cat.id}
                      name="category"
                      value={cat.value}
                      checked={category === cat.value}
                      onChange={() => setCategory(cat.value)}
                      className="sr-only"
                    />
                    <Label htmlFor={cat.id} className="cursor-pointer text-sm font-medium">
                      {cat.label}
                    </Label>
                  </div>
                ))}
              </div>
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
                If this is a bug, include the API request ID from the error toast — we can pull the exact server-side
                log.
              </p>
            </div>

            {status.kind === 'sent' && (
              <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
                {status.delivered ? 'Thanks — we got it.' : 'Sent (dev mode — printed to server log).'}
              </div>
            )}
            {status.kind === 'error' && (
              <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <AlertCircle className="size-4" />
                {status.message}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" disabled={status.kind === 'sending'}>
                Save draft
              </Button>
              <Button
                className="gap-2"
                disabled={status.kind === 'sending' || subject.length < 3 || message.length < 10}
                onClick={onSend}
              >
                <Send className="size-4" />
                {status.kind === 'sending' ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageCircle className="size-4" /> Recent from the team
            </CardTitle>
            <CardDescription>Public feedback from your workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.map((r, i) => {
              const Icon = kindIcon[r.kind as keyof typeof kindIcon]
              return (
                <div key={i} className="border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-start gap-2.5">
                    <Icon className={cn('mt-0.5 size-4 shrink-0', kindColor[r.kind])} />
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-sm leading-snug">{r.summary}</p>
                      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                        <span>
                          {r.author} · {r.age}
                        </span>
                        {r.status && (
                          <>
                            <span className="text-foreground/60">·</span>
                            <Badge variant={statusVariant[r.status]} className="text-[9px] capitalize">
                              {r.status.replace('-', ' ')}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors"
                    >
                      <ThumbsUp className="size-3" />
                      <span className="tabular-nums">{r.upvotes}</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
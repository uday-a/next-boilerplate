'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Search,
  Send,
  Star,
  Archive,
  Trash2,
  Inbox,
  Send as SentIcon,
  FileText,
  AlertCircle,
  CheckCheck,
  Plus,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { OverlayScroll } from '@/components/ui/overlay-scroll'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cardVariants } from '@/components/ui/card'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'

interface Message {
  id: string
  sender: string
  email: string
  initials: string
  subject: string
  preview: string
  body: string
  time: string
  read: boolean
  starred: boolean
  folder: 'inbox' | 'sent' | 'drafts' | 'spam'
  tags: string[]
}

const folders = [
  { id: 'inbox' as const, label: 'Inbox', icon: Inbox, count: 12 },
  { id: 'sent' as const, label: 'Sent', icon: SentIcon, count: 0 },
  { id: 'drafts' as const, label: 'Drafts', icon: FileText, count: 3 },
  { id: 'spam' as const, label: 'Spam', icon: AlertCircle, count: 0 },
]

const messages: Message[] = [
  { id: '1', sender: 'Sarah Connor', email: 'sarah@acme.com', initials: 'SC', subject: 'Q2 roadmap review — Design Engineering', preview: 'Can we move the component audit to Thursday? The team needs one more day to finish the token migration.', body: 'Hi team,\n\nCan we move the component audit to Thursday? The team needs one more day to finish the token migration.\n\nAlso — the new KpiGrid spec looks great. One question: do we want to support 6-column layout or cap at 5?\n\nSarah', time: '10:32 AM', read: false, starred: true, folder: 'inbox', tags: ['work', 'roadmap'] },
  { id: '2', sender: 'Marcus Rivera', email: 'marcus@acme.com', initials: 'MR', subject: 'Re: Auth middleware token storage', preview: 'I reviewed the PR. The compliance-ready token storage looks solid. One nit on the retry logic — see line 84.', body: 'I reviewed the PR. The compliance-ready token storage looks solid. One nit on the retry logic — see line 84.\n\nAlso flagged the missing test for the edge case where refresh returns 401. Can you add that before merge?\n\n— Marcus', time: '9:15 AM', read: false, starred: false, folder: 'inbox', tags: ['code-review'] },
  { id: '3', sender: 'Alice Chen', email: 'alice@acme.com', initials: 'AC', subject: 'Sparkline tooltip precision', preview: 'Fixed in PR 1283. The hover now shows full-precision values instead of rounding to 1 decimal.', body: 'Fixed in PR 1283. The hover now shows full-precision values instead of rounding to 1 decimal.\n\nScreenshot attached. Let me know if the formatting looks off on your end.\n\nAlice', time: 'Yesterday', read: true, starred: true, folder: 'inbox', tags: ['bugfix'] },
  { id: '4', sender: 'David Kim', email: 'david@acme.com', initials: 'DK', subject: 'Dark mode WCAG AAA tokens', preview: 'Maybe we should land the WCAG AAA tokens as a separate PR? The diff is already +400 lines.', body: 'Maybe we should land the WCAG AAA tokens as a separate PR? The diff is already +400 lines.\n\nI worry about review fatigue if we bundle it with the high-contrast override.\n\nDavid', time: 'Yesterday', read: true, starred: false, folder: 'inbox', tags: ['design-system'] },
  { id: '5', sender: 'Eva Johnson', email: 'eva@acme.com', initials: 'EJ', subject: 'WIP: native AbortSignal in API wrapper', preview: 'Pushed 4 commits to feature/abort-signal. Still need to handle the timeout edge case.', body: 'Pushed 4 commits to feature/abort-signal. Still need to handle the timeout edge case.\n\nThe wrapper now accepts signal?: AbortSignal and passes it through to fetch. Works in Chrome and Firefox. Safari needs testing.\n\nEva', time: 'Yesterday', read: true, starred: false, folder: 'inbox', tags: ['engineering'] },
  { id: '6', sender: 'Frank Lee', email: 'frank@acme.com', initials: 'FL', subject: 'QA sign-off for Sprint 24', preview: 'All P0s passed. Two P1s remaining — both UI polish, no blockers for release.', body: 'All P0s passed. Two P1s remaining — both UI polish, no blockers for release.\n\nFull report is in Notion. Let me know if you want me to walk through the edge cases.\n\nFrank', time: 'Sep 25', read: true, starred: false, folder: 'inbox', tags: ['qa'] },
  { id: '7', sender: 'Olive Park', email: 'olive@acme.com', initials: 'OP', subject: 'Welcome to the team!', preview: 'Thanks for the onboarding doc. The local setup took 12 minutes — faster than expected.', body: 'Thanks for the onboarding doc. The local setup took 12 minutes — faster than expected.\n\nOne thing I noticed: the env.example is missing the DATABASE_URL variable. Should I open a PR?\n\nOlive', time: 'Sep 24', read: true, starred: false, folder: 'inbox', tags: ['onboarding'] },
  { id: '8', sender: 'Northwind Industries', email: 'ops@northwind.example', initials: 'NI', subject: 'Enterprise contract renewal', preview: 'We would like to renew for another 12 months at the current Enterprise tier.', body: 'We would like to renew for another 12 months at the current Enterprise tier.\n\nCould you send the updated invoice by end of week?\n\n— Northwind Ops', time: 'Sep 23', read: true, starred: true, folder: 'inbox', tags: ['sales'] },
  { id: '9', sender: 'Sentinel Labs', email: 'team@sentinel.example', initials: 'SL', subject: 'Feedback: streaming citations', preview: '"Streaming citations are a game-changer. Our legal team saves ~3h per brief."', body: '"Streaming citations are a game-changer. Our legal team saves ~3h per brief."\n\nWould love to see batch citation export in the next quarter. Happy to beta test.\n\n— Sentinel Labs', time: 'Sep 21', read: true, starred: true, folder: 'inbox', tags: ['feedback'] },
  { id: '10', sender: 'System', email: 'system@acme.com', initials: 'SY', subject: 'Weekly digest — Sep 21', preview: '37 tasks closed, 12 opened. 4 deploys to production. Zero incidents.', body: 'Weekly digest — Sep 21\n\n37 tasks closed, 12 opened.\n4 deploys to production.\nZero incidents.\n\nTop contributor: Alice Chen (8 merged PRs)\n\n— Acme Bot', time: 'Sep 21', read: true, starred: false, folder: 'inbox', tags: ['system'] },
]

// Hashed avatar tint from the chart-N/15 set so each sender keeps one colour.
const avatarTones = [
  'bg-chart-1/15 text-chart-1',
  'bg-chart-2/15 text-chart-2',
  'bg-chart-3/15 text-chart-3',
  'bg-chart-4/15 text-chart-4',
  'bg-chart-5/15 text-chart-5',
]

function avatarTone(name: string) {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return avatarTones[hash % avatarTones.length]
}

type FolderId = (typeof folders)[number]['id']

export function MessagesClient() {
  const t = useTranslations()
  const [activeFolder, setActiveFolder] = useState<FolderId>('inbox')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>('1')
  const [composeOpen, setComposeOpen] = useState(false)
  const [replyBody, setReplyBody] = useState('')
  // Below md the panes stack: list first, then the reading pane with a back button.
  const [showDetail, setShowDetail] = useState(false)

  const filteredMessages = useMemo(() => {
    let list = messages.filter((m) => m.folder === activeFolder)
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (m) =>
          m.subject.toLowerCase().includes(q) ||
          m.sender.toLowerCase().includes(q) ||
          m.preview.toLowerCase().includes(q),
      )
    }
    return list
  }, [activeFolder, searchQuery])

  const selectedMessage = messages.find((m) => m.id === selectedId)

  function openMessage(id: string) {
    setSelectedId(id)
    setShowDetail(true)
  }

  return (
    <Page className="flex h-[calc(100dvh-3.5rem-2rem)] flex-col">
      <PageHeader
        className="shrink-0"
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setComposeOpen(true)}>
              <Plus className="size-4" aria-hidden="true" />
              Compose
            </Button>
          </div>
        }
      >
        <PageHeaderHeading
          title={t('nav.items.messages')}
          description="Read and reply to messages from your team and customers."
        />
      </PageHeader>

      <PageBody className={cn(cardVariants(), 'flex min-h-0 flex-1 overflow-hidden')}>
        {/* Folders (lg+) */}
        <div className="hidden w-56 shrink-0 flex-col border-r lg:flex">
          <div className="space-y-1 p-3">
            {folders.map((folder) => {
              const Icon = folder.icon
              return (
                <button
                  key={folder.id}
                  type="button"
                  aria-pressed={activeFolder === folder.id}
                  aria-current={activeFolder === folder.id ? 'page' : undefined}
                  className={cn(
                    'focus-visible:ring-ring flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none',
                    activeFolder === folder.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted',
                  )}
                  onClick={() => setActiveFolder(folder.id)}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="size-4" aria-hidden="true" />
                    {folder.label}
                  </span>
                  {folder.count > 0 ? (
                    <Badge variant="secondary" className="px-1.5 tabular-nums">
                      {folder.count}
                    </Badge>
                  ) : null}
                </button>
              )
            })}
          </div>
          <Separator />
          <div className="p-3">
            <p className="text-muted-foreground mb-2 text-xs font-medium">Labels</p>
            <div className="flex flex-wrap gap-1.5">
              {['work', 'code-review', 'bugfix', 'sales', 'system'].map((tag) => (
                <Badge key={tag} variant="outline" className="hover:bg-accent cursor-pointer">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Message list */}
        <div
          className={cn(
            'min-w-0 flex-1 flex-col md:w-72 md:flex-none md:border-r lg:w-80',
            showDetail ? 'hidden md:flex' : 'flex',
          )}
        >
          <div className="space-y-2 border-b p-2">
            <Select value={activeFolder} onValueChange={(v) => setActiveFolder(v as FolderId)}>
              <SelectTrigger className="h-8 w-full lg:hidden" aria-label="Folder">
                {/* Label rendered explicitly so the closed trigger never shows blank. */}
                <SelectValue>{folders.find((f) => f.id === activeFolder)?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search
                className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                aria-label="Search messages"
                className="h-8 pl-8 text-sm"
              />
            </div>
          </div>
          <OverlayScroll className="flex-1">
            {/* WHY: an empty result renders an EmptyState with a
                clear-search action, not a bare sentence. */}
            {filteredMessages.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title={t('dashboard.messages.emptySearchTitle')}
                description={t('dashboard.messages.emptySearchDescription')}
                className="p-4"
              >
                <Button variant="outline" size="sm" className="mt-4 h-8 text-xs" onClick={() => setSearchQuery('')}>
                  {t('dashboard.messages.clearSearch')}
                </Button>
              </EmptyState>
            ) : null}
            {filteredMessages.map((msg) => (
              <button
                key={msg.id}
                type="button"
                className={cn(
                  'focus-visible:ring-ring flex w-full cursor-pointer gap-3 border-b p-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
                  selectedId === msg.id ? 'md:bg-accent' : 'hover:bg-muted/50',
                  !msg.read && 'bg-primary/5',
                )}
                onClick={() => openMessage(msg.id)}
              >
                <Avatar className="size-9 shrink-0">
                  <AvatarFallback className={cn('text-xs font-semibold', avatarTone(msg.sender))}>
                    {msg.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    {/* WHY: truncated rows expose full text via title so
                        hover/touch long-press still reveals it. */}
                    <p className={cn('truncate text-sm', !msg.read ? 'font-semibold' : 'font-medium')} title={msg.sender}>
                      {msg.sender}
                    </p>
                    <span className="text-muted-foreground shrink-0 text-xs tabular-nums">{msg.time}</span>
                  </div>
                  <p
                    className={cn('truncate text-sm', !msg.read ? 'font-medium' : 'text-muted-foreground')}
                    title={msg.subject}
                  >
                    {msg.subject}
                  </p>
                  <p className="text-muted-foreground line-clamp-1 text-xs" title={msg.preview}>
                    {msg.preview}
                  </p>
                  <div className="flex items-center gap-1 pt-0.5">
                    {msg.starred ? <Star className="fill-chart-3 text-chart-3 size-3.5" aria-label="Starred" /> : null}
                    {msg.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="px-1.5 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </OverlayScroll>
        </div>

        {/* Reading pane */}
        <div className={cn('min-w-0 flex-1 flex-col', showDetail ? 'flex' : 'hidden md:flex')}>
          {selectedMessage ? (
            <>
              <div className="flex items-start justify-between gap-4 border-b p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 md:hidden"
                    aria-label="Back to messages"
                    onClick={() => setShowDetail(false)}
                  >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                  </Button>
                  <Avatar className="size-10 shrink-0">
                    <AvatarFallback className={cn('text-sm font-semibold', avatarTone(selectedMessage.sender))}>
                      {selectedMessage.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium" title={selectedMessage.sender}>
                      {selectedMessage.sender}
                    </p>
                    <p
                      className="text-muted-foreground truncate text-xs"
                      title={`${selectedMessage.email} · ${selectedMessage.time}`}
                    >
                      {selectedMessage.email} · {selectedMessage.time}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label={selectedMessage.starred ? 'Unstar' : 'Star'}
                        >
                          <Star
                            className={cn(
                              'size-4',
                              selectedMessage.starred ? 'fill-chart-3 text-chart-3' : 'text-muted-foreground',
                            )}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{selectedMessage.starred ? 'Unstar' : 'Star'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8" aria-label="Archive">
                          <Archive className="text-muted-foreground size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Archive</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8" aria-label="More actions">
                        <MoreHorizontal className="text-muted-foreground size-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-40 p-1">
                      <button
                        type="button"
                        className="hover:bg-accent focus-visible:ring-ring flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs focus-visible:ring-2 focus-visible:outline-none"
                      >
                        <CheckCheck className="size-3.5" aria-hidden="true" />
                        Mark as read
                      </button>
                      <button
                        type="button"
                        className="hover:bg-accent text-destructive focus-visible:ring-ring flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs focus-visible:ring-2 focus-visible:outline-none"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                        Delete
                      </button>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4">
                <h2 className="mb-2 text-base font-semibold">{selectedMessage.subject}</h2>
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {selectedMessage.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line">{selectedMessage.body}</p>
              </div>

              <div className="border-t p-4">
                <div className="flex items-end gap-2">
                  <label htmlFor="message-reply" className="sr-only">
                    Reply
                  </label>
                  <Textarea
                    id="message-reply"
                    value={replyBody}
                    onValueChange={setReplyBody}
                    placeholder="Reply..."
                    className="flex-1"
                    inputClassName="min-h-20"
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" className="size-9" aria-label="Send reply" onClick={() => setReplyBody('')}>
                          <Send className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Send reply</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </>
          ) : (
            <div className="text-muted-foreground flex flex-1 items-center justify-center">
              <p className="text-sm">Select a message to read</p>
            </div>
          )}
        </div>
      </PageBody>

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New message</DialogTitle>
            <DialogDescription>Compose a new message to your team.</DialogDescription>
          </DialogHeader>
          <div className="-mx-4 grid max-h-[60vh] gap-4 overflow-y-auto px-4 py-1">
            <Input placeholder="To" aria-label="To" />
            <Input placeholder="Subject" aria-label="Subject" />
            <label htmlFor="compose-message" className="sr-only">
              Message
            </label>
            <Textarea id="compose-message" placeholder="Write your message..." inputClassName="min-h-30" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setComposeOpen(false)}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  )
}

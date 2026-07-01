'use client'

import { useMemo, useState } from 'react'
import {
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
import { CommandPalette } from '@/components/blocks/CommandPalette'
import { OverlayScroll } from '@/components/ui/overlay-scroll'

interface Message {
  id: string
  sender: string
  email: string
  initials: string
  color: string
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
  { id: '1', sender: 'Sarah Connor', email: 'sarah@acme.com', initials: 'SC', color: 'bg-orange-500/15 text-orange-600', subject: 'Q2 roadmap review — Design Engineering', preview: 'Can we move the component audit to Thursday? The team needs one more day to finish the token migration.', body: 'Hi team,\n\nCan we move the component audit to Thursday? The team needs one more day to finish the token migration.\n\nAlso — the new KpiGrid spec looks great. One question: do we want to support 6-column layout or cap at 5?\n\nSarah', time: '10:32 AM', read: false, starred: true, folder: 'inbox', tags: ['work', 'roadmap'] },
  { id: '2', sender: 'Marcus Rivera', email: 'marcus@acme.com', initials: 'MR', color: 'bg-blue-500/15 text-blue-600', subject: 'Re: Auth middleware token storage', preview: 'I reviewed the PR. The compliance-ready token storage looks solid. One nit on the retry logic — see line 84.', body: 'I reviewed the PR. The compliance-ready token storage looks solid. One nit on the retry logic — see line 84.\n\nAlso flagged the missing test for the edge case where refresh returns 401. Can you add that before merge?\n\n— Marcus', time: '9:15 AM', read: false, starred: false, folder: 'inbox', tags: ['code-review'] },
  { id: '3', sender: 'Alice Chen', email: 'alice@acme.com', initials: 'AC', color: 'bg-emerald-500/15 text-emerald-600', subject: 'Sparkline tooltip precision', preview: 'Fixed in #1283. The hover now shows full-precision values instead of rounding to 1 decimal.', body: 'Fixed in #1283. The hover now shows full-precision values instead of rounding to 1 decimal.\n\nScreenshot attached. Let me know if the formatting looks off on your end.\n\nAlice', time: 'Yesterday', read: true, starred: true, folder: 'inbox', tags: ['bugfix'] },
  { id: '4', sender: 'David Kim', email: 'david@acme.com', initials: 'DK', color: 'bg-violet-500/15 text-violet-600', subject: 'Dark mode WCAG AAA tokens', preview: 'Maybe we should land the WCAG AAA tokens as a separate PR? The diff is already +400 lines.', body: 'Maybe we should land the WCAG AAA tokens as a separate PR? The diff is already +400 lines.\n\nI worry about review fatigue if we bundle it with the high-contrast override.\n\nDavid', time: 'Yesterday', read: true, starred: false, folder: 'inbox', tags: ['design-system'] },
  { id: '5', sender: 'Eva Johnson', email: 'eva@acme.com', initials: 'EJ', color: 'bg-rose-500/15 text-rose-600', subject: 'WIP: native AbortSignal in API wrapper', preview: 'Pushed 4 commits to feature/abort-signal. Still need to handle the timeout edge case.', body: 'Pushed 4 commits to feature/abort-signal. Still need to handle the timeout edge case.\n\nThe wrapper now accepts signal?: AbortSignal and passes it through to fetch. Works in Chrome and Firefox. Safari needs testing.\n\nEva', time: 'Yesterday', read: true, starred: false, folder: 'inbox', tags: ['engineering'] },
  { id: '6', sender: 'Frank Lee', email: 'frank@acme.com', initials: 'FL', color: 'bg-cyan-500/15 text-cyan-600', subject: 'QA sign-off for Sprint 24', preview: 'All P0s passed. Two P1s remaining — both UI polish, no blockers for release.', body: 'All P0s passed. Two P1s remaining — both UI polish, no blockers for release.\n\nFull report is in Notion. Let me know if you want me to walk through the edge cases.\n\nFrank', time: 'May 14', read: true, starred: false, folder: 'inbox', tags: ['qa'] },
  { id: '7', sender: 'Olive Park', email: 'olive@acme.com', initials: 'OP', color: 'bg-amber-500/15 text-amber-600', subject: 'Welcome to the team!', preview: 'Thanks for the onboarding doc. The local setup took 12 minutes — faster than expected.', body: 'Thanks for the onboarding doc. The local setup took 12 minutes — faster than expected.\n\nOne thing I noticed: the env.example is missing the DATABASE_URL variable. Should I open a PR?\n\nOlive', time: 'May 13', read: true, starred: false, folder: 'inbox', tags: ['onboarding'] },
  { id: '8', sender: 'Northwind Industries', email: 'ops@northwind.example', initials: 'NI', color: 'bg-primary/10 text-primary', subject: 'Enterprise contract renewal', preview: 'We would like to renew for another 12 months at the current Enterprise tier.', body: 'We would like to renew for another 12 months at the current Enterprise tier.\n\nCould you send the updated invoice by end of week?\n\n— Northwind Ops', time: 'May 12', read: true, starred: true, folder: 'inbox', tags: ['sales'] },
  { id: '9', sender: 'Sentinel Labs', email: 'team@sentinel.example', initials: 'SL', color: 'bg-primary/10 text-primary', subject: 'Feedback: streaming citations', preview: '"Streaming citations are a game-changer. Our legal team saves ~3h per brief."', body: '"Streaming citations are a game-changer. Our legal team saves ~3h per brief."\n\nWould love to see batch citation export in the next quarter. Happy to beta test.\n\n— Sentinel Labs', time: 'May 10', read: true, starred: true, folder: 'inbox', tags: ['feedback'] },
  { id: '10', sender: 'System', email: 'system@acme.com', initials: 'SY', color: 'bg-muted text-muted-foreground', subject: 'Weekly digest — May 12', preview: '37 tasks closed, 12 opened. 4 deploys to production. Zero incidents.', body: 'Weekly digest — May 12\n\n37 tasks closed, 12 opened.\n4 deploys to production.\nZero incidents.\n\nTop contributor: Alice Chen (8 merged PRs)\n\n— Acme Bot', time: 'May 10', read: true, starred: false, folder: 'inbox', tags: ['system'] },
]

function tagVariant(tag: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  const map: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    work: 'default',
    roadmap: 'secondary',
    'code-review': 'outline',
    bugfix: 'destructive',
    'design-system': 'secondary',
    engineering: 'outline',
    qa: 'default',
    onboarding: 'secondary',
    sales: 'default',
    feedback: 'secondary',
    system: 'outline',
  }
  return map[tag] ?? 'secondary'
}

export function MessagesClient() {
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'drafts' | 'spam'>('inbox')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>('1')
  const [composeOpen, setComposeOpen] = useState(false)
  const [replyBody, setReplyBody] = useState('')

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

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col gap-0 -mx-4 -mt-4 lg:-mx-6 lg:-mt-6">
      <h1 className="sr-only">Messages</h1>
      <div className="border-b px-4 py-3 lg:px-6 flex items-center justify-end">
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <CommandPalette />
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setComposeOpen(true)}>
            <Plus className="size-3.5" />
            Compose
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-56 border-r flex flex-col">
          <div className="p-3 space-y-1">
            {folders.map((folder) => {
              const Icon = folder.icon
              return (
                <button
                  key={folder.id}
                  type="button"
                  className={[
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                    activeFolder === folder.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted',
                  ].join(' ')}
                  onClick={() => setActiveFolder(folder.id)}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="size-4" />
                    {folder.label}
                  </span>
                  {folder.count > 0 ? (
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                      {folder.count}
                    </Badge>
                  ) : null}
                </button>
              )
            })}
          </div>
          <Separator />
          <div className="p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Labels</p>
            <div className="flex flex-wrap gap-1.5">
              {['work', 'code-review', 'bugfix', 'sales', 'system'].map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px] cursor-pointer hover:bg-accent">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="w-80 border-r flex flex-col">
          <div className="border-b p-2">
            <div className="relative">
              <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>
          <OverlayScroll className="flex-1">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={[
                  'flex cursor-pointer gap-3 border-b p-3 transition-colors',
                  selectedId === msg.id ? 'bg-accent' : 'hover:bg-muted/50',
                  !msg.read && 'bg-primary/5',
                ].join(' ')}
                onClick={() => setSelectedId(msg.id)}
              >
                <Avatar className="size-9 shrink-0">
                  <AvatarFallback className={['text-[10px] font-semibold', msg.color].join(' ')}>
                    {msg.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className={['truncate text-xs', !msg.read ? 'font-semibold' : 'font-medium'].join(' ')}>
                      {msg.sender}
                    </p>
                    <span className="text-muted-foreground shrink-0 text-[10px]">{msg.time}</span>
                  </div>
                  <p className={['truncate text-xs', !msg.read ? 'font-medium' : 'text-muted-foreground'].join(' ')}>
                    {msg.subject}
                  </p>
                  <p className="text-muted-foreground line-clamp-1 text-[11px]">{msg.preview}</p>
                  <div className="flex items-center gap-1 pt-0.5">
                    {msg.starred ? <Star className="size-3 text-amber-500 fill-amber-500" /> : null}
                    {msg.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant={tagVariant(tag)} className="text-[9px] h-4 px-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </OverlayScroll>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {selectedMessage ? (
            <>
              <div className="border-b px-6 py-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback className={['text-sm font-semibold', selectedMessage.color].join(' ')}>
                      {selectedMessage.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{selectedMessage.sender}</p>
                    <p className="text-muted-foreground text-xs">
                      {selectedMessage.email} · {selectedMessage.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <Star
                            className={[
                              'size-4',
                              selectedMessage.starred ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground',
                            ].join(' ')}
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
                        <Button variant="ghost" size="icon" className="size-8">
                          <Archive className="size-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Archive</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-40 p-1">
                      <button type="button" className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-accent">
                        <CheckCheck className="size-3" />
                        Mark as read
                      </button>
                      <button type="button" className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-accent text-destructive">
                        <Trash2 className="size-3" />
                        Delete
                      </button>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex-1 overflow-auto px-6 py-6">
                <h2 className="text-lg font-semibold mb-2">{selectedMessage.subject}</h2>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {selectedMessage.tags.map((tag) => (
                    <Badge key={tag} variant={tagVariant(tag)} className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm leading-relaxed whitespace-pre-line">{selectedMessage.body}</p>
                </div>
              </div>

              <div className="border-t px-6 py-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Input
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder="Reply..."
                      className="min-h-[80px] resize-y"
                    />
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" className="size-9" onClick={() => setReplyBody('')}>
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
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              <p className="text-sm">Select a message to read</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New message</DialogTitle>
            <DialogDescription>Compose a new message to your team.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="To" />
            <Input placeholder="Subject" />
            <textarea
              className="w-full min-h-[120px] rounded-md border bg-background px-3 py-2 text-sm resize-y"
              placeholder="Write your message..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setComposeOpen(false)}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
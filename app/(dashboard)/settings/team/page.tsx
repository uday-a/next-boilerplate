'use client'

import { Mail, MoreHorizontal, Search, UserPlus } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const members = [
  {
    id: '1',
    name: 'Sarah Connor',
    email: 'sarah@acme.com',
    role: 'Owner',
    status: 'active',
    lastActive: '2m ago',
    color: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  },
  {
    id: '2',
    name: 'Marcus Rivera',
    email: 'marcus@acme.com',
    role: 'Admin',
    status: 'active',
    lastActive: '14m ago',
    color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  },
  {
    id: '3',
    name: 'Alice Chen',
    email: 'alice@acme.com',
    role: 'Member',
    status: 'active',
    lastActive: '1h ago',
    color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david@acme.com',
    role: 'Member',
    status: 'active',
    lastActive: '3h ago',
    color: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  },
  {
    id: '5',
    name: 'Eva Johnson',
    email: 'eva@acme.com',
    role: 'Member',
    status: 'active',
    lastActive: 'Yesterday',
    color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  },
  {
    id: '6',
    name: 'Frank Lee',
    email: 'frank@acme.com',
    role: 'Billing',
    status: 'active',
    lastActive: '2d ago',
    color: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  },
  {
    id: '7',
    name: 'Olive Park',
    email: 'olive@acme.com',
    role: 'Member',
    status: 'active',
    lastActive: '4d ago',
    color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  {
    id: '8',
    name: 'Marcus Tan',
    email: 'm.tan@acme.com',
    role: 'Member',
    status: 'active',
    lastActive: '6d ago',
    color: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  },
]

const pending = [
  { email: 'priya.shah@acme.com', role: 'Member', invitedBy: 'Sarah Connor', expires: 'in 5 days' },
  { email: 'tom.bauer@acme.com', role: 'Admin', invitedBy: 'Marcus Rivera', expires: 'in 6 days' },
]

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export default function TeamSettingsPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
          <p className="text-muted-foreground text-sm">
            {members.length} members · {pending.length} pending invites · 1 owner
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="size-4" /> Invite member
        </Button>
      </header>

      <div className="flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input placeholder="Search by name or email…" className="h-9 pl-8" />
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last active</TableHead>
              <TableHead className="w-[40px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className={`text-[10px] font-semibold ${member.color}`}>
                        {initials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-muted-foreground text-xs">{member.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1.5 text-xs">
                    <span className="bg-emerald-500 size-1.5 rounded-full" />
                    {member.status}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">{member.lastActive}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7">
                        <MoreHorizontal className="size-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Change role…</DropdownMenuItem>
                      <DropdownMenuItem>View activity</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Remove from workspace</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="size-4" /> Pending invites
          </CardTitle>
          <CardDescription>Resend or revoke invitations that haven&apos;t been accepted yet.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {pending.map((invite) => (
            <div key={invite.email} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{invite.email}</p>
                <p className="text-muted-foreground text-xs">
                  Invited as {invite.role} by {invite.invitedBy} · expires {invite.expires}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Resend
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive">
                  Revoke
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
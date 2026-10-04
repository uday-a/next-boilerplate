'use client'

import { Avatar, AvatarFallback, AvatarGroup } from '@/components/ui/avatar'

const people = ['Emma Wilson', 'Liam Carter', 'Olivia Brooks', 'Noah Bennett']
const initials = (name: string) => name.split(' ').map(p => p[0]).join('')

export default function AvatarDemo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <Avatar className="size-10">
          <AvatarFallback>EW</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">Emma Wilson</p>
          <p className="text-muted-foreground text-xs">emma.wilson@example.com</p>
        </div>
      </div>
      <AvatarGroup>
        {people.map(p => (
          <Avatar key={p}>
            <AvatarFallback>{initials(p)}</AvatarFallback>
          </Avatar>
        ))}
      </AvatarGroup>
    </div>
  )
}

'use client'

import { Separator } from '@/components/ui/separator'

export default function SeparatorDemo() {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Workspace</p>
      <p className="text-muted-foreground text-xs">Settings shared by every member.</p>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4 text-sm">
        <span>General</span>
        <Separator orientation="vertical" />
        <span>Members</span>
        <Separator orientation="vertical" />
        <span>Billing</span>
      </div>
    </div>
  )
}

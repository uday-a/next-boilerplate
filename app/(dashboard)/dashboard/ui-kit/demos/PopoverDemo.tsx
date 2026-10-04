'use client'

import { Copy, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

export default function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">Popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <p className="text-sm font-medium">Quick actions</p>
        <p className="text-muted-foreground mt-1 text-xs">Choose an action for this item.</p>
        <Separator className="my-2" />
        <div className="space-y-1">
          <button type="button" className="hover:bg-accent flex w-full items-center gap-1.5 rounded px-2 py-1 text-xs">
            <Copy className="size-3.5" aria-hidden="true" />
            Copy
          </button>
          <button
            type="button"
            className="hover:bg-accent text-destructive flex w-full items-center gap-1.5 rounded px-2 py-1 text-xs"
          >
            <X className="size-3.5" aria-hidden="true" />
            Remove
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

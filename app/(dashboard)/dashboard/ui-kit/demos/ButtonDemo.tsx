'use client'

import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ButtonDemo() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm">
          <Plus className="size-4" aria-hidden="true" />
          New project
        </Button>
        <Button size="sm" variant="outline">Outline</Button>
        <Button size="sm" variant="secondary">Secondary</Button>
        <Button size="sm" variant="ghost">Ghost</Button>
        <Button size="sm" variant="link">Link</Button>
        <Button size="sm" variant="destructive">
          <Trash2 className="size-4" aria-hidden="true" />
          Delete
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="xs">Extra small</Button>
        <Button size="sm">Small</Button>
        <Button>Default</Button>
        <Button size="icon" variant="outline" aria-label="Add">
          <Plus className="size-4" aria-hidden="true" />
        </Button>
        <Button size="sm" disabled>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Saving
        </Button>
      </div>
    </div>
  )
}

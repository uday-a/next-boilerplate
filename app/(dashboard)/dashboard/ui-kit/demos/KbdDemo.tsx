'use client'

import { Kbd } from '@/components/ui/kbd'

export default function KbdDemo() {
  return (
    <div className="space-y-2 text-sm">
      <p className="text-muted-foreground">
        Open the command palette with <Kbd>⌘</Kbd> <Kbd>K</Kbd>
      </p>
      <p className="text-muted-foreground">
        Press <Kbd>Esc</Kbd> to close a dialog, or <Kbd>Shift</Kbd> + <Kbd>?</Kbd> for shortcuts.
      </p>
    </div>
  )
}

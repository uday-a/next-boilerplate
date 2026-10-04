'use client'

import { Bold, Italic, Underline } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'

export default function ToggleDemo() {
  return (
    <div className="flex gap-2">
      <Toggle aria-label="Bold"><Bold className="size-4" /></Toggle>
      <Toggle aria-label="Italic"><Italic className="size-4" /></Toggle>
      <Toggle aria-label="Underline"><Underline className="size-4" /></Toggle>
    </div>
  )
}

'use client'

import { OverlayScroll } from '@/components/ui/overlay-scroll'

const lines = Array.from({ length: 10 }, (_, i) => i + 1)

export default function OverlayScrollDemo() {
  return (
    <OverlayScroll className="h-24 rounded-md border p-2">
      {lines.map(i => (
        <p key={i} className="py-1 text-xs">Scrollable content line {i}</p>
      ))}
    </OverlayScroll>
  )
}

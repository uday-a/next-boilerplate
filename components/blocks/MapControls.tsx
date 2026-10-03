'use client'

import { Minus, Plus, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Zoom in / out / reset-to-fit overlay buttons.
 * Port of Nuxt `MapControls.vue`. Sits inside a `relative isolate` card;
 * the parent wires the events to its map ref.
 * Used by the dashboard "Customers by region" map.
 */
export function MapControls({
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  onZoomIn?: () => void
  onZoomOut?: () => void
  onReset?: () => void
}) {
  return (
    <div className="bg-card/90 absolute right-3 bottom-3 z-[800] flex flex-col overflow-hidden rounded-md border backdrop-blur-sm">
      <Button variant="ghost" size="icon" className="size-8 rounded-none" aria-label="Zoom in" title="Zoom in" onClick={onZoomIn}>
        <Plus className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" className="size-8 rounded-none border-t" aria-label="Zoom out" title="Zoom out" onClick={onZoomOut}>
        <Minus className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" className="size-8 rounded-none border-t" aria-label="Reset view" title="Reset view" onClick={onReset}>
        <RotateCcw className="size-4" />
      </Button>
    </div>
  )
}

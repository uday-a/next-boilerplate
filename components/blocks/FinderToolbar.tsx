'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export type FinderCategory = string
export type FinderStatus = 'all' | 'installed' | 'available' | 'demo-only'

/**
 * Search + category + status toolbar for the UI-kit finder.
 * Simplified port of Nuxt `FinderToolbar.vue` (debounce lives in the
 * parent via `onQueryChange`; no URL sync here — follow-up).
 */
export function FinderToolbar({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  categories,
  status,
  onStatusChange,
  count,
}: {
  query: string
  onQueryChange: (v: string) => void
  category: string
  onCategoryChange: (v: string) => void
  categories: string[]
  status: FinderStatus
  onStatusChange: (v: FinderStatus) => void
  count: number
}) {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      <div className="min-w-0 flex-1">
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            type="search"
            placeholder="Search components…"
            aria-label="Search components"
            className="pl-8"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full sm:w-48" aria-label="Category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={status}
          onValueChange={(v) => { if (v) onStatusChange(v as FinderStatus) }}
          aria-label="Status"
        >
          <ToggleGroupItem value="all" className="px-3 text-xs">All</ToggleGroupItem>
          <ToggleGroupItem value="installed" className="px-3 text-xs">Installed</ToggleGroupItem>
          <ToggleGroupItem value="available" className="px-3 text-xs">Available</ToggleGroupItem>
          <ToggleGroupItem value="demo-only" className="px-3 text-xs">Demo only</ToggleGroupItem>
        </ToggleGroup>
        <p className="text-muted-foreground text-xs tabular-nums" aria-live="polite">
          {count} result{count === 1 ? '' : 's'}
        </p>
      </div>
    </div>
  )
}

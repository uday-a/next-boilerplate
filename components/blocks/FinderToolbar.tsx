'use client'

import * as React from 'react'
import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { CATALOG_CATEGORIES, categoryKey, type CatalogCategory, type CatalogStatus } from '@/lib/ui-catalog/catalog'

const STATUS_OPTIONS: { value: CatalogStatus | 'all'; key: string }[] = [
  { value: 'all', key: 'all' },
  { value: 'installed', key: 'installed' },
  { value: 'available', key: 'available' },
  { value: 'demo-only', key: 'demoOnly' },
]

/**
 * Search + category + status toolbar for the UI-kit finder.
 * Port of Nuxt `FinderToolbar.vue`: typing goes into a local draft and is
 * pushed to `onQueryChange` once it pauses (the parent syncs it to the URL).
 */
export function FinderToolbar({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  count,
}: {
  query: string
  onQueryChange: (v: string) => void
  category: CatalogCategory | 'all'
  onCategoryChange: (v: CatalogCategory | 'all') => void
  status: CatalogStatus | 'all'
  onStatusChange: (v: CatalogStatus | 'all') => void
  count: number
}) {
  const t = useTranslations()
  const [draft, setDraft] = React.useState(query)
  // Follow external changes (Clear filters, back/forward) without clobbering typing.
  const [lastQuery, setLastQuery] = React.useState(query)
  if (query !== lastQuery) {
    setLastQuery(query)
    if (query !== draft.trim()) setDraft(query)
  }
  const onQueryChangeRef = React.useRef(onQueryChange)
  React.useEffect(() => {
    onQueryChangeRef.current = onQueryChange
  })
  React.useEffect(() => {
    const timer = setTimeout(() => onQueryChangeRef.current(draft.trim()), 200)
    return () => clearTimeout(timer)
  }, [draft])

  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      <div className="min-w-0 flex-1">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          // Not type="search": the native cancel button would double allowClear's.
          enterKeyHint="search"
          prefixIcon={<Search />}
          placeholder={t('uiKit.toolbar.searchPlaceholder')}
          aria-label={t('uiKit.toolbar.searchLabel')}
          allowClear
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={category} onValueChange={(v) => onCategoryChange(v as CatalogCategory | 'all')}>
          <SelectTrigger className="w-full sm:w-48" aria-label={t('uiKit.toolbar.category')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('uiKit.category.all')}</SelectItem>
            {CATALOG_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {t(`uiKit.category.${categoryKey(c)}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={status}
          // ToggleGroup emits '' when the pressed item is clicked again; keep one selected.
          onValueChange={(v) => {
            if (v) onStatusChange(v as CatalogStatus | 'all')
          }}
          aria-label={t('uiKit.toolbar.status')}
        >
          {STATUS_OPTIONS.map((opt) => (
            <ToggleGroupItem key={opt.value} value={opt.value} className="px-3 text-xs">
              {t(`uiKit.status.${opt.key}`)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-muted-foreground text-xs tabular-nums" aria-live="polite">
          {t('uiKit.toolbar.results', { count })}
        </p>
      </div>
    </div>
  )
}

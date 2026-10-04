'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'
import { CatalogCard, type UsedInLink } from '@/components/blocks/CatalogCard'
import { FinderToolbar } from '@/components/blocks/FinderToolbar'
import { FoundationsPanel } from '@/components/blocks/FoundationsPanel'
import { routeLabel } from '@/lib/breadcrumb-labels'
import {
  buildCatalog,
  CATALOG_CATEGORIES,
  CATALOG_STATUSES,
  demoNameFor,
  searchCatalog,
  type CatalogCategory,
  type CatalogStatus,
} from '@/lib/ui-catalog/catalog'
import { CURATED, CURATED_BLOCKS } from '@/lib/ui-catalog/curated'
import snapshot from '@/lib/ui-catalog/registry.snapshot.json'
import usage from '@/lib/ui-catalog/usage.generated.json'
import type { SnapshotItem, UsageData } from '@/scripts/ui-catalog'
import { DEMOS } from './demos'

const entries = buildCatalog({
  snapshot: snapshot.items as SnapshotItem[],
  curated: CURATED,
  curatedBlocks: CURATED_BLOCKS,
  usage: usage as UsageData,
})

function pick<T extends string>(raw: string | null, allowed: readonly T[], fallback: T): T {
  return raw && allowed.includes(raw as T) ? (raw as T) : fallback
}

/**
 * Searchable registry catalog. Port of Nuxt `dashboard/ui-kit.vue` +
 * `useUiCatalog`: filters live in the URL (`?q=&cat=&status=`) so a search
 * can be shared and survives reload.
 */
export function UiKitClient() {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const q = params.get('q') ?? ''
  const category = pick<CatalogCategory | 'all'>(params.get('cat'), ['all', ...CATALOG_CATEGORIES], 'all')
  const status = pick<CatalogStatus | 'all'>(params.get('status'), ['all', ...CATALOG_STATUSES], 'all')

  const setParam = useCallback(
    (key: string, value: string, fallback: string) => {
      const next = new URLSearchParams(params.toString())
      if ((next.get(key) ?? fallback) === (value || fallback)) return
      if (value && value !== fallback) next.set(key, value)
      else next.delete(key)
      const qs = next.toString()
      router.replace(`${pathname}${qs ? `?${qs}` : ''}${window.location.hash}`, { scroll: false })
    },
    [params, pathname, router],
  )

  const results = useMemo(() => searchCatalog(entries, { q, category, status }), [q, category, status])

  function usedInLinks(keys: string[]): UsedInLink[] {
    return keys.map((key) => {
      if (key.startsWith('layout:')) return { label: t('uiKit.card.layout', { name: key.slice(7) }) }
      if (key === 'app:root') return { label: t('uiKit.card.appShell') }
      if (key === 'app:error') return { label: t('uiKit.card.errorPage') }
      if (key.includes('[')) return { label: key }
      return { label: key === '/' ? t('uiKit.card.home') : routeLabel(key, t), href: key }
    })
  }

  // Deep links (#range-calendar) scroll to the card once it has rendered.
  useEffect(() => {
    const hash = window.location.hash
    if (hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: 'start' })
  }, [])

  return (
    <Page>
      <PageHeader>
        <PageHeaderHeading title={t('nav.items.uiKit')} description={t('uiKit.description')} />
      </PageHeader>

      <PageBody className="space-y-4">
        <FoundationsPanel />
        <FinderToolbar
          query={q}
          onQueryChange={(v) => setParam('q', v, '')}
          category={category}
          onCategoryChange={(v) => setParam('cat', v, 'all')}
          status={status}
          onStatusChange={(v) => setParam('status', v, 'all')}
          count={results.length}
        />

        {!results.length ? (
          <EmptyState icon={SearchX} title={t('uiKit.empty.title')} description={t('uiKit.empty.description')} headingTag="h2">
            <Button variant="outline" size="sm" className="mt-4" onClick={() => router.replace(pathname, { scroll: false })}>
              {t('uiKit.empty.clear')}
            </Button>
          </EmptyState>
        ) : (
          <div className="grid items-start gap-4 xl:grid-cols-2">
            {results.map((entry) => (
              <CatalogCard
                key={`${entry.kind}:${entry.name}`}
                entry={entry}
                usedIn={usedInLinks(entry.usedIn)}
                demo={entry.kind === 'ui' ? DEMOS[demoNameFor(entry.name)] : undefined}
              />
            ))}
          </div>
        )}
      </PageBody>
    </Page>
  )
}

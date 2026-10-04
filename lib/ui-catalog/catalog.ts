// Pure catalog logic for the /dashboard/ui-kit finder: merge the registry
// snapshot, the curated notes and the generated usage map into entries,
// then search and filter them. No React APIs here so tests import it as-is.
// Port of the Nuxt boilerplate's app/data/ui-catalog/catalog.ts.
import type { SnapshotItem, UsageData } from '../../scripts/ui-catalog'

export const CATALOG_CATEGORIES = [
  'forms',
  'actions',
  'overlays',
  'navigation',
  'feedback',
  'data-display',
  'layout',
  'charts',
  'utility',
  'blocks',
] as const
export type CatalogCategory = typeof CATALOG_CATEGORIES[number]

export const CATALOG_STATUSES = ['installed', 'available', 'demo-only'] as const
export type CatalogStatus = typeof CATALOG_STATUSES[number]

export interface CuratedEntry {
  name: string
  category: CatalogCategory
  whenToUse: string
  useCases: string[]
}

export interface CatalogEntry {
  name: string
  title: string
  kind: 'ui' | 'block'
  category: CatalogCategory
  description: string
  whenToUse?: string
  useCases: string[]
  status: CatalogStatus
  /** Route keys from the usage scan: '/dashboard', 'layout:dashboard', 'app:error'. */
  usedIn: string[]
  /** null for local blocks that aren't in the registry. */
  installCmd: string | null
  docsUrl: string | null
  /** Block source file, relative to components/blocks. */
  file?: string
  /** Chart parts point at the `charts` entry, whose demo covers them. */
  partOf?: string
}

// Registry categories -> finder categories (first match wins).
const CATEGORY_MAP: Record<string, CatalogCategory> = {
  'form': 'forms',
  'date-time': 'forms',
  'control': 'actions',
  'action': 'actions',
  'overlay': 'overlays',
  'navigation': 'navigation',
  'feedback': 'feedback',
  'chart': 'charts',
  'charts': 'charts',
  'layout': 'layout',
  'disclosure': 'layout',
  'utility': 'utility',
  'motion': 'utility',
}

export function normalizeCategory(categories: string[]): CatalogCategory {
  for (const c of categories) {
    const hit = CATEGORY_MAP[c]
    if (hit) return hit
  }
  return 'data-display'
}

export const installCmdFor = (name: string) => `npx shadcn@latest add @uipkge-react/${name}`
export const docsUrlFor = (name: string, kind: 'ui' | 'block' = 'ui') =>
  `https://uipkge.dev/react/${kind === 'ui' ? 'components' : 'blocks'}/${name}/`

function titleFromName(name: string): string {
  return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export interface BuildInput {
  snapshot: SnapshotItem[]
  curated: CuratedEntry[]
  curatedBlocks: CuratedEntry[]
  usage: UsageData
}

export function buildCatalog({ snapshot, curated, curatedBlocks, usage }: BuildInput): CatalogEntry[] {
  const curatedByName = new Map(curated.map(c => [c.name, c]))
  const curatedBlockByName = new Map(curatedBlocks.map(c => [c.name, c]))
  const regUi = new Map(snapshot.filter(i => i.type === 'registry:ui').map(i => [i.name, i]))
  const regBlocks = new Map(snapshot.filter(i => i.type !== 'registry:ui').map(i => [i.name, i]))
  const installed = new Set(Object.keys(usage.ui))
  const entries: CatalogEntry[] = []

  const names = new Set([...regUi.keys(), ...installed])
  for (const name of names) {
    const reg = regUi.get(name)
    const cur = curatedByName.get(name)
    const isInstalled = installed.has(name)
    const usedIn = usage.ui[name] ?? []
    // Chart parts live under ui/charts/<name>; they have no top-level dir.
    const partOf = isInstalled && !cur && reg && normalizeCategory(reg.categories) === 'charts' && name !== 'charts'
      ? 'charts'
      : undefined
    entries.push({
      name,
      title: reg?.title ?? titleFromName(name),
      kind: 'ui',
      category: cur?.category ?? normalizeCategory(reg?.categories ?? []),
      description: reg?.description ?? '',
      whenToUse: cur?.whenToUse,
      useCases: cur?.useCases ?? [],
      status: !isInstalled ? 'available' : usedIn.length ? 'installed' : 'demo-only',
      usedIn,
      installCmd: installCmdFor(name),
      docsUrl: reg ? docsUrlFor(name) : null,
      partOf,
    })
  }

  for (const [name, block] of Object.entries(usage.blocks)) {
    const reg = regBlocks.get(name)
    const cur = curatedBlockByName.get(name)
    entries.push({
      name,
      title: reg?.title ?? titleFromName(name),
      kind: 'block',
      category: 'blocks',
      description: reg?.description ?? '',
      whenToUse: cur?.whenToUse,
      useCases: cur?.useCases ?? [],
      status: block.routes.length ? 'installed' : 'demo-only',
      usedIn: block.routes,
      installCmd: reg ? installCmdFor(name) : null,
      docsUrl: reg ? docsUrlFor(name, 'block') : null,
      file: block.file,
    })
  }

  return entries.sort((a, b) => a.name.localeCompare(b.name))
}

export interface CatalogFilter {
  q?: string
  category?: CatalogCategory | 'all'
  status?: CatalogStatus | 'all'
}

const norm = (s: string) => s.toLowerCase().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()

/**
 * Relevance of an entry for a query. Name/title > use case > description.
 * A phrase match scores higher than every word matching somewhere.
 */
export function scoreEntry(entry: CatalogEntry, query: string): number {
  const q = norm(query)
  if (!q) return 1
  const name = norm(`${entry.name} ${entry.title}`)
  const cases = entry.useCases.map(norm)
  const text = norm(`${entry.description} ${entry.whenToUse ?? ''}`)
  if (norm(entry.name) === q || norm(entry.title) === q) return 100
  if (name.includes(q)) return 80
  if (cases.some(c => c === q)) return 70
  if (cases.some(c => c.includes(q))) return 60
  if (text.includes(q)) return 30
  const words = q.split(' ')
  const all = [name, ...cases, text].join(' | ')
  if (words.length > 1 && words.every(w => all.includes(w))) {
    return words.every(w => name.includes(w) || cases.some(c => c.includes(w))) ? 20 : 10
  }
  return 0
}

const STATUS_ORDER: Record<CatalogStatus, number> = { 'installed': 0, 'demo-only': 1, 'available': 2 }

export function searchCatalog(entries: CatalogEntry[], filter: CatalogFilter = {}): CatalogEntry[] {
  const { q = '', category = 'all', status = 'all' } = filter
  return entries
    .filter(e => (category === 'all' || e.category === category) && (status === 'all' || e.status === status))
    .map(e => ({ e, score: scoreEntry(e, q) }))
    .filter(r => r.score > 0)
    .sort((a, b) =>
      b.score - a.score
      || STATUS_ORDER[a.e.status] - STATUS_ORDER[b.e.status]
      || a.e.name.localeCompare(b.e.name))
    .map(r => r.e)
}

/** i18n key suffix for a category: 'data-display' -> 'dataDisplay'. */
export const categoryKey = (c: CatalogCategory | 'all') => c.replace(/-(\w)/g, (_, ch: string) => ch.toUpperCase())

/** PascalCase demo component name for an installed component: 'range-calendar' -> 'RangeCalendarDemo'. */
export function demoNameFor(name: string): string {
  return `${name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Demo`
}

/**
 * UI catalog data generator for the /dashboard/ui-kit finder.
 * Port of the Nuxt boilerplate's `scripts/ui-catalog.ts`.
 *
 *   node scripts/ui-catalog.ts sync-registry  -> lib/ui-catalog/registry.snapshot.json
 *   node scripts/ui-catalog.ts scan-usage     -> lib/ui-catalog/usage.generated.json
 *
 * sync-registry reads the uipkge React registry index (the sibling uipkge-ui
 * checkout when present, else https://uipkge.dev/r/react/registry.json) and
 * keeps the trimmed `registry:ui` items plus the registry blocks that match a
 * local block. Review the diff before committing it.
 *
 * scan-usage maps every installed ui component and local block to the routes
 * that render it, following imports (blocks, page clients) up to pages and
 * layouts. Re-run it after adding a component or using one on a new page.
 *
 * Plain Node (>= 22.18 strips types natively): only erasable TS syntax here.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const DATA_DIR = join(ROOT, 'lib/ui-catalog')
export const SNAPSHOT_FILE = join(DATA_DIR, 'registry.snapshot.json')
export const USAGE_FILE = join(DATA_DIR, 'usage.generated.json')

const REGISTRY_URL = 'https://uipkge.dev/r/react/registry.json'
const LOCAL_REGISTRY = resolve(ROOT, '../uipkge-ui/apps/astro-site/public/r/react/registry.json')

export interface SnapshotItem {
  name: string
  title: string
  type: 'registry:ui' | 'registry:block' | 'registry:page'
  description: string
  categories: string[]
}

export interface UsageData {
  /** installed ui component name -> sorted route keys ('/dashboard', 'layout:dashboard', 'app:root') */
  ui: Record<string, string[]>
  /** local block name (kebab) -> file (relative to components/blocks) and route keys */
  blocks: Record<string, { file: string, routes: string[] }>
}

const toPosix = (p: string) => p.split(sep).join('/')

export function kebab(name: string): string {
  return name
    .replace(/([a-z])([A-Z0-9])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

function listDirs(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter(d => statSync(join(dir, d)).isDirectory()).sort()
}

const isSource = (f: string) => /\.(tsx?|jsx?)$/.test(f) && !/\.(test|spec|stories)\.tsx?$/.test(f)

// The finder's own building blocks live in components/blocks here (Nuxt keeps
// them in components/ui-kit); they are page internals, not catalog entries.
const UI_KIT_INTERNALS = new Set(['CatalogCard.tsx', 'FinderToolbar.tsx', 'FoundationsPanel.tsx', 'InstallCommand.tsx'])

export function installedUi(root = ROOT): string[] {
  return listDirs(join(root, 'components/ui'))
}

export function installedChartParts(root = ROOT): string[] {
  return listDirs(join(root, 'components/ui/charts'))
}

/** Local blocks: `blocks/*.tsx` files plus block directories (e.g. `sidebar-02`). */
export function localBlocks(root = ROOT): { name: string, file: string, files: string[] }[] {
  const dir = join(root, 'components/blocks')
  if (!existsSync(dir)) return []
  const out: { name: string, file: string, files: string[] }[] = []
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      const files = walk(full).filter(isSource)
      const main = files.find(f => /^index\.tsx?$/.test(basename(f))) ?? files.find(f => kebab(basename(f).replace(/\.tsx?$/, '')) === entry) ?? files[0]
      if (main) out.push({ name: entry, file: toPosix(relative(dir, main)), files })
    }
    else if (/\.tsx$/.test(entry) && !UI_KIT_INTERNALS.has(entry) && isSource(entry)) {
      out.push({ name: kebab(entry.replace(/\.tsx$/, '')), file: entry, files: [full] })
    }
  }
  return out
}

// ---------------------------------------------------------------- sync-registry

type RegistryItem = Partial<Record<keyof SnapshotItem, unknown>>

export function trimRegistry(index: { items: RegistryItem[] }, blockNames: string[]): SnapshotItem[] {
  const blocks = new Set(blockNames)
  return index.items
    .filter(i => i.type === 'registry:ui' || ((i.type === 'registry:block' || i.type === 'registry:page') && blocks.has(String(i.name))))
    .map(i => ({
      name: String(i.name),
      title: String(i.title ?? i.name),
      type: i.type as SnapshotItem['type'],
      description: String(i.description ?? ''),
      categories: Array.isArray(i.categories) ? i.categories.map(String) : [],
    }))
    .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name))
}

async function syncRegistry(): Promise<void> {
  let index: { items: RegistryItem[] }
  let source: string
  if (existsSync(LOCAL_REGISTRY)) {
    index = JSON.parse(readFileSync(LOCAL_REGISTRY, 'utf8'))
    source = 'uipkge-ui/apps/astro-site/public/r/react/registry.json'
  }
  else {
    const res = await fetch(REGISTRY_URL)
    if (!res.ok) throw new Error(`registry fetch failed: ${res.status} ${REGISTRY_URL}`)
    index = await res.json() as { items: RegistryItem[] }
    source = REGISTRY_URL
  }
  const items = trimRegistry(index, localBlocks().map(b => b.name))
  writeFileSync(SNAPSHOT_FILE, JSON.stringify({ source, items }, null, 2) + '\n')
  const ui = items.filter(i => i.type === 'registry:ui').length
  console.log(`catalog:sync  ${ui} ui + ${items.length - ui} block items  (${source})`)
}

// ---------------------------------------------------------------- scan-usage

const EXCLUDE = [
  /^components\/ui\//,
  /^app\/\(dashboard\)\/dashboard\/ui-kit\//,
  /^lib\/ui-catalog\//,
  /^node_modules\//,
]

/** Route key for a consumer file, or null when it's a component (follow it up). */
export function routeKey(rel: string): string | null {
  if (!rel.startsWith('app/')) return null
  const segs = rel.split('/').slice(1, -1).filter(s => !/^\(.*\)$/.test(s))
  const file = basename(rel)
  if (/^page\.[jt]sx?$/.test(file)) return `/${segs.join('/')}`
  if (/^layout\.[jt]sx?$/.test(file)) {
    if (rel.split('/').length === 2) return 'app:root'
    const dir = basename(dirname(rel)).replace(/^\((.*)\)$/, '$1')
    return `layout:${dir}`
  }
  if (/^(not-found|error|global-error)\.[jt]sx?$/.test(file)) return 'app:error'
  return null
}

const EXTS = ['.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts']

function resolveImport(root: string, from: string, spec: string): string | null {
  let base: string
  if (spec.startsWith('@/')) base = join(root, spec.slice(2))
  else if (spec.startsWith('.')) base = resolve(dirname(join(root, from)), spec)
  else return null
  if (existsSync(base) && statSync(base).isFile()) return toPosix(relative(root, base))
  for (const ext of EXTS) if (existsSync(base + ext)) return toPosix(relative(root, base + ext))
  return null
}

export function scanUsage(root = ROOT): UsageData {
  const uiDirs = installedUi(root)
  const chartParts = installedChartParts(root)
  const blocks = localBlocks(root)

  const blockOfFile = new Map<string, string>()
  for (const b of blocks) for (const f of b.files) blockOfFile.set(toPosix(relative(root, f)), b.name)

  const files = ['app', 'components', 'lib', 'hooks']
    .flatMap(d => walk(join(root, d)))
    .map(f => toPosix(relative(root, f)))
    .filter(rel => isSource(rel) && !EXCLUDE.some(r => r.test(rel)))

  // Direct references per consumer file: 'ui:<dir>' units or 'file:<rel>' edges.
  const refs = new Map<string, Set<string>>()
  for (const rel of files) {
    const src = readFileSync(join(root, rel), 'utf8')
    const set = new Set<string>()
    for (const m of src.matchAll(/(?:from\s+|import\s*\(\s*)['"]([^'"]+)['"]/g)) {
      const spec = m[1]!
      const ui = spec.match(/^@\/components\/ui\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?/)
      if (ui) {
        if (!uiDirs.includes(ui[1]!)) continue
        set.add(`ui:${ui[1]}`)
        if (ui[1] === 'charts' && ui[2] && chartParts.includes(ui[2])) set.add(`ui:${ui[2]}`)
        continue
      }
      const target = resolveImport(root, rel, spec)
      if (target && target !== rel && !EXCLUDE.some(r => r.test(target))) set.add(`file:${target}`)
    }
    refs.set(rel, set)
  }

  const consumers = new Map<string, Set<string>>()
  for (const [rel, set] of refs) {
    for (const target of set) {
      if (!consumers.has(target)) consumers.set(target, new Set())
      consumers.get(target)!.add(rel)
    }
  }

  function resolveRoutes(targets: string[], skipBlock?: string): string[] {
    const routes = new Set<string>()
    const seen = new Set<string>()
    const queue = [...targets]
    while (queue.length) {
      const target = queue.shift()!
      for (const rel of consumers.get(target) ?? []) {
        if (seen.has(rel)) continue
        seen.add(rel)
        if (skipBlock && blockOfFile.get(rel) === skipBlock) continue
        const key = routeKey(rel)
        if (key) routes.add(key)
        else queue.push(`file:${rel}`)
      }
    }
    return [...routes].sort()
  }

  const ui: UsageData['ui'] = {}
  for (const name of [...uiDirs, ...chartParts.filter(p => !uiDirs.includes(p))].sort()) {
    ui[name] = resolveRoutes([`ui:${name}`])
  }
  const blockUsage: UsageData['blocks'] = {}
  for (const b of blocks) {
    blockUsage[b.name] = { file: b.file, routes: resolveRoutes(b.files.map(f => `file:${toPosix(relative(root, f))}`), b.name) }
  }
  return { ui, blocks: blockUsage }
}

// ---------------------------------------------------------------- CLI

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const cmd = process.argv[2]
  if (cmd === 'sync-registry') {
    await syncRegistry()
  }
  else if (cmd === 'scan-usage') {
    const usage = scanUsage()
    writeFileSync(USAGE_FILE, JSON.stringify(usage, null, 2) + '\n')
    const unused = Object.entries(usage.ui).filter(([, r]) => r.length === 0).map(([n]) => n)
    console.log(`catalog:scan  ${Object.keys(usage.ui).length} ui, ${Object.keys(usage.blocks).length} blocks; demo-only: ${unused.join(', ') || 'none'}`)
  }
  else {
    console.error('usage: node scripts/ui-catalog.ts <sync-registry|scan-usage>')
    process.exit(1)
  }
}

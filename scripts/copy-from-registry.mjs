#!/usr/bin/env node
/**
 * Copy UIPKGE React registry items from the sibling uipkge-ui monorepo.
 * Resolves registryDependencies transitively from built JSON manifests.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const monoRoot = path.resolve(root, '../uipkge-ui')
const registryRoot = path.join(monoRoot, 'packages/registry-react')
const jsonDir = path.join(registryRoot, 'public/r/react')

const seeds = [
  'init',
  'tailwind',
  'utils',
  'use-theme',
  'header-01',
  'hero-01',
  'logos-01',
  'features-01',
  'bento-01',
  'pricing-01',
  'testimonials-01',
  'faq-01',
  'contact-01',
  'cta-01',
  'footer-01',
  'auth-sign-in',
  'auth-sign-up',
  'auth-password-reset',
  'auth-mfa',
  'dashboard-layout',
  'kanban-board',
  'theme-switch',
  'sidebar',
  'sidebar-02',
  'command-palette',
  'notifications-popover',
  'breadcrumb',
  'button',
  'card',
  'input',
  'label',
  'checkbox',
  'separator',
  'sheet',
  'badge',
  'tabs',
  'data-table',
  'use-kanban',
  'kanban-data',
  // Charts (dashboard demo)
  'line-chart',
  'bar-chart',
  'area-chart',
  'funnel-chart',
  'gauge-chart',
  'treemap-chart',
  'calendar-heatmap',
  'sparkline',
  'raw-chart',
  'progress',
  'data-list',
  'icon-box',
  // Calendar / messages / ui-kit extras
  'context-menu',
  'overlay-scroll',
  'switch',
  'slider',
  'radio-group',
  'form',
  'kpi-grid',
  'table',
  'avatar',
  'textarea',
  'dialog',
  'popover',
  'tooltip',
  'dropdown-menu',
  'toggle',
  'toggle-group',
  'pin-input',
  'accordion',
  'collapsible',
  'skeleton',
  'rich-text-editor',
]

const queue = [...seeds]
const seen = new Set()

function itemNameFromUrl(url) {
  const base = path.basename(url, '.json')
  return base
}

function resolveItemPath(name) {
  const candidates = [
    path.join(registryRoot, 'components', name),
    path.join(registryRoot, 'components', 'charts', name),
    path.join(registryRoot, 'blocks', name),
    path.join(registryRoot, 'bootstrap', name),
    path.join(registryRoot, 'lib', name),
    path.join(registryRoot, 'hooks', name),
  ]
  for (const dir of candidates) {
    const manifest = path.join(dir, `${name}.registry.ts`)
    if (fs.existsSync(manifest)) return dir
  }
  return null
}

function readManifestJson(name) {
  const jsonPath = path.join(jsonDir, `${name}.json`)
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Missing built JSON: ${jsonPath}. Run npm run build:registry in uipkge-ui.`)
  }
  return JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
}

function copyItem(name) {
  if (seen.has(name)) return
  seen.add(name)

  const manifest = readManifestJson(name)
  for (const dep of manifest.registryDependencies ?? []) {
    const depName = itemNameFromUrl(dep)
    if (!seen.has(depName)) queue.push(depName)
  }

  const itemDir = resolveItemPath(name)
  if (!itemDir) {
    console.warn(`[copy] skip ${name} — source folder not found`)
    return
  }

  for (const file of manifest.files ?? []) {
    const src = path.join(monoRoot, file.path)
    const target = (file.target ?? '').replace(/^~\//, '')
    const dest = path.join(root, target)
    if (!target) continue
    if (!fs.existsSync(src)) {
      console.warn(`[copy] missing source ${src}`)
      continue
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(src, dest)
    console.log(`[copy] ${target}`)
  }
}

while (queue.length) {
  const name = queue.shift()
  copyItem(name)
}

// Shared tailwind tokens
const sharedTailwind = path.resolve(registryRoot, '../shared/styles/tailwind.css')
const destCss = path.join(root, 'app/globals.css')
if (fs.existsSync(sharedTailwind)) {
  fs.copyFileSync(sharedTailwind, destCss)
  console.log('[copy] app/globals.css (from shared tokens)')
}

console.log(`[copy] done — ${seen.size} items`)
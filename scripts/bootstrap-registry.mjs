#!/usr/bin/env node
/**
 * Install UIPKGE React blocks + bootstrap items into this boilerplate.
 * Uses the sibling uipkge-ui monorepo's built JSON when present; falls back
 * to live uipkge.dev URLs.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const localRegistry = path.resolve(root, '../uipkge-ui/packages/registry-react/public/r/react')
const useLocal = fs.existsSync(path.join(localRegistry, 'init.json'))
const base = useLocal ? localRegistry : 'https://uipkge.dev/r/react'

const items = [
  'init',
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
  'data-table',
  'card',
  'badge',
  'tabs',
  'progress',
  'avatar',
  'section-card',
  'data-list',
  'icon-box',
  'line-chart',
  'bar-chart',
  'area-chart',
  'sparkline',
]

function urlFor(name) {
  if (useLocal) return path.join(localRegistry, `${name}.json`)
  return `${base}/${name}.json`
}

console.log(`[bootstrap] registry source: ${useLocal ? localRegistry : base}`)

for (const name of items) {
  const target = urlFor(name)
  console.log(`[bootstrap] adding ${name}...`)
  const res = spawnSync('npx', ['shadcn@latest', 'add', target, '-y', '--overwrite'], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
  })
  if (res.status !== 0) {
    console.error(`[bootstrap] failed on ${name}`)
    process.exit(res.status ?? 1)
  }
}

console.log('[bootstrap] done')
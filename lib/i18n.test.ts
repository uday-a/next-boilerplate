/**
 * Locale dictionary parity + key-usage audit — mirrors SvelteKit
 * `src/lib/i18n/i18n.test.ts` (same dictionaries, same contract).
 *
 * 1. `messages/en.json` and `messages/es.json` expose the exact same key set.
 * 2. The auth/nav/admin/invite/dashboard/projects/uiKit/header contract
 *    ported from Nuxt exists in both.
 * 3. `normalizeLocale` collapses regional variants and falls back to `en`.
 * 4. Every static `t('…')` key used in `app/`, `components/` and `lib/`
 *    resolves in BOTH dictionaries (namespaced `useTranslations('ns')` +
 *    `t('key')` pairs and `ROUTE_LABEL_KEYS` values included; dynamic
 *    template keys are checked by prefix).
 * 5. No vue-i18n leftovers: zero `{'@'}` escapes, zero ` | ` plural pipes
 *    (all six pipe plurals were converted to ICU in `scripts/convert-locales.mjs`).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import en from '../messages/en.json'
import es from '../messages/es.json'
import { defaultLocale, LOCALE_COOKIE_NAME, locales, normalizeLocale } from './i18n'
import { ROUTE_LABEL_KEYS } from './breadcrumb-labels'

const root = resolve(__dirname, '..')

// Dot-paths of every leaf value, e.g. ['auth.signIn.title', ...].
function leafKeys(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix]
  return Object.entries(obj).flatMap(([k, v]) => leafKeys(v, prefix ? `${prefix}.${k}` : k))
}

function leafMap(obj: unknown, prefix = '', out = new Map<string, unknown>()): Map<string, unknown> {
  if (typeof obj !== 'object' || obj === null) {
    out.set(prefix, obj)
    return out
  }
  for (const [k, v] of Object.entries(obj)) leafMap(v, prefix ? `${prefix}.${k}` : k, out)
  return out
}

const enKeys = new Set(leafKeys(en))

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) {
      if (entry === 'node_modules' || entry === '.next') continue
      walk(p, out)
    } else if (/\.(ts|tsx)$/.test(entry)) {
      // Skip specs: doc-comments quote example keys (`t('…')`,
      // `useTranslations('ns')`) that must not resolve.
      if (/[.](test|spec)[.](ts|tsx)$/.test(entry)) continue
      out.push(p)
    }
  }
  return out
}

interface KeyUse {
  file: string
  key: string
  dynamic: boolean
}

/** Static + template-literal keys from `t('…')` calls, namespace-aware. */
function collectTKeys(source: string, file: string): KeyUse[] {
  const out: KeyUse[] = []
  // Namespace from `useTranslations('ns')` (DueDateBadge-style); bare
  // `useTranslations()` / `getTranslations()` resolve at the root.
  const nsMatch = source.match(/useTranslations\(\s*['"]([^'"]+)['"]\s*\)/)
  const ns = nsMatch?.[1]
  const callRe = /(?:^|[^\w$.])t\(\s*(`(?:[^`\\]|\\.)*`|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g
  let m: RegExpExecArray | null
  while ((m = callRe.exec(source)) !== null) {
    const raw = m[1]!
    const quote = raw[0]
    const body = raw.slice(1, -1)
    if (quote === '`' && body.includes('${')) {
      // Dynamic template: check the static prefix (e.g.
      // `dashboard.locations.kind.` or `admin.roleNames.`).
      const prefix = body.slice(0, body.indexOf('${'))
      out.push({ file, key: ns ? `${ns}.${prefix}` : prefix, dynamic: true })
    } else {
      const key = body.replace(/\\(['"`\\])/g, '$1')
      out.push({ file, key: ns && !key.includes('.') ? `${ns}.${key}` : key, dynamic: false })
    }
  }
  // `key: 'nav.items.…'` fields (Sidebar02 statics, settings sections):
  // translated via `t(item.key)` / `t(section.key)` at render.
  const fieldRe = /key:\s*'((?:auth|nav|admin|invite|feedback|dashboard|projects|uiKit|header|settings)\.[^']+)'/g
  let f: RegExpExecArray | null
  while ((f = fieldRe.exec(source)) !== null) out.push({ file, key: f[1]!, dynamic: false })
  return out
}

describe('locale dictionaries', () => {
  it('en and es expose the exact same key set', () => {
    expect(leafKeys(es).sort()).toEqual(leafKeys(en).sort())
  })

  it('covers the auth/nav/admin/invite/dashboard contract ported from nuxt', () => {
    const keys = [...enKeys]
    expect(keys.length).toBeGreaterThan(200)
    for (const key of [
      'auth.signIn.title',
      'auth.signUp.submit',
      'auth.passwordReset.request.submit',
      'auth.passwordReset.done.title',
      'auth.mfa.title',
      'nav.groups.platform',
      'nav.actions.more',
      'nav.user.logout',
      'nav.items.dashboard',
      'admin.roles.unsaved',
      'dashboard.locations.officeCount',
      'dashboard.locations.accounts',
      'uiKit.toolbar.results',
      'header.language.label',
      'header.theme.reset',
      'settings.team.invite',
      'settings.apikeys.submit',
      'invite.accept',
      'projects.empty.action',
    ]) {
      expect(keys).toContain(key)
    }
  })

  it('has no vue-i18n leftovers (pipes converted to ICU, no {@} escapes)', () => {
    const values = [...leafMap(en).values(), ...leafMap(es).values()].filter(
      (v): v is string => typeof v === 'string',
    )
    expect(values.filter((v) => v.includes(' | '))).toEqual([])
    expect(values.filter((v) => v.includes("{'@'}"))).toEqual([])
  })

  it('plurals are ICU (next-intl) with matching interpolation vars', () => {
    for (const key of [
      'admin.roles.unsaved',
      'admin.roles.members',
      'dashboard.locations.officeCount',
      'dashboard.locations.openRolesShort',
      'dashboard.locations.accounts',
      'uiKit.toolbar.results',
    ]) {
      for (const dict of [en, es] as const) {
        const value = leafMap(dict).get(key)
        expect(typeof value).toBe('string')
        expect(value as string).toMatch(/\{\w+, plural, =0 \{.*\} =1 \{.*\} other \{.*\}\}/)
      }
    }
  })
})

describe('locale contract (lib/i18n)', () => {
  it('declares en + es with English default and the uipkge-locale cookie', () => {
    expect(defaultLocale).toBe('en')
    expect(LOCALE_COOKIE_NAME).toBe('uipkge-locale')
    expect(locales).toEqual([
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' },
    ])
  })

  it.each([
    ['en', 'en'],
    ['es', 'es'],
    ['en-US', 'en'],
    ['es-MX', 'es'],
    ['ES', 'es'],
    ['EN_gb', 'en'],
    ['  es  ', 'es'],
    ['fr', 'en'],
    ['', 'en'],
  ])('normalizeLocale(%j) → %j', (input, expected) => {
    expect(normalizeLocale(input)).toBe(expected)
  })

  it('falls back to en for non-strings', () => {
    expect(normalizeLocale(undefined)).toBe('en')
    expect(normalizeLocale(null)).toBe('en')
    expect(normalizeLocale(42)).toBe('en')
  })

  it('every ROUTE_LABEL_KEYS value resolves in both dictionaries', () => {
    const esKeys = new Set(leafKeys(es))
    for (const [path, key] of Object.entries(ROUTE_LABEL_KEYS)) {
      expect(enKeys.has(key), `${path} → ${key} (en)`).toBe(true)
      expect(esKeys.has(key), `${path} → ${key} (es)`).toBe(true)
    }
  })
})

describe('code key usage', () => {
  const files = [...walk(join(root, 'app')), ...walk(join(root, 'components')), ...walk(join(root, 'lib'))]
  const uses: KeyUse[] = files.flatMap((file) => collectTKeys(readFileSync(file, 'utf8'), file))

  it('uses t() keys across the app shell (guard against an empty scan)', () => {
    expect(uses.length).toBeGreaterThan(100)
  })

  it.each(['en', 'es'] as const)('every static t() key exists in %s', (locale) => {
    const keys = locale === 'en' ? enKeys : new Set(leafKeys(es))
    const missing = uses.filter((u) => !u.dynamic && !keys.has(u.key))
    expect(
      missing.map((u) => `${u.key} (${u.file.replace(root, '')})`),
      `missing ${locale} keys`,
    ).toEqual([])
  })

  it('every dynamic t() prefix matches at least one key in both dictionaries', () => {
    const esKeys = new Set(leafKeys(es))
    for (const u of uses.filter((u) => u.dynamic)) {
      const prefix = u.key
      expect(
        [...enKeys].some((k) => k.startsWith(prefix)),
        `${prefix} (${u.file.replace(root, '')}) has no en match`,
      ).toBe(true)
      expect(
        [...esKeys].some((k) => k.startsWith(prefix)),
        `${prefix} (${u.file.replace(root, '')}) has no es match`,
      ).toBe(true)
    }
  })

  it('every useTranslations() namespace resolves to a real subtree', () => {
    for (const file of files) {
      const source = readFileSync(file, 'utf8')
      const nsRe = /useTranslations\(\s*['"]([^'"]+)['"]\s*\)/g
      let m: RegExpExecArray | null
      while ((m = nsRe.exec(source)) !== null) {
        const ns = m[1]!
        expect(
          [...enKeys].some((k) => k === ns || k.startsWith(`${ns}.`)),
          `${ns} (${file.replace(root, '')})`,
        ).toBe(true)
      }
    }
  })
})

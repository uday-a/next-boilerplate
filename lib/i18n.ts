/**
 * Locale contract — mirrors SvelteKit `src/lib/i18n/index.ts` (locales list,
 * cookie name, normalizer) so language switchers render without hardcoding
 * options. Single persistence mechanism: the `uipkge-locale` cookie, readable
 * on both sides (server via `cookies()`, client via `document.cookie`).
 * NOT httpOnly by design — the client must read it to hydrate + switch.
 */
export type Locale = 'en' | 'es'

export const defaultLocale: Locale = 'en'

export const locales: Array<{ code: Locale; name: string }> = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
]

export const LOCALE_COOKIE_NAME = 'uipkge-locale'
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

/** Collapse regional variants to their base (`en-US` -> `en`, `es-MX` -> `es`); anything else falls back to `en`. */
export function normalizeLocale(input: unknown): Locale {
  if (typeof input !== 'string') return defaultLocale
  const base = input.trim().toLowerCase().split(/[-_]/)[0]
  return base === 'es' ? 'es' : defaultLocale
}

/** Client-side persist (mirrors SvelteKit `persistLocale`): JS-readable, 1yr, lax. */
export function setLocaleCookie(code: Locale): void {
  if (typeof document === 'undefined') return
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; secure' : ''
  document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(code)}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax${secure}`
}

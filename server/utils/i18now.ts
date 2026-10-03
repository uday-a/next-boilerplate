import { mergeMessages } from '@/lib/i18now-merge'
import { logger } from '@/server/utils/logger'

// i18now OTA translation delivery (mirrors @i18now/nuxt in nuxt-boilerplate,
// which gates on I18NOW_PROJECT_ID and serves local JSON without it).
//
// next-intl stays the ONLY t() system — this module is purely a delivery
// layer: when a project id is configured, published CDN translations are
// deep-merged OVER the local messages/*.json (CDN wins, local fills gaps).
// Without an id, or when the CDN is unreachable, local messages serve alone.
// Nothing here runs in the browser; no extra client dependency.

const CDN_URL = 'https://cdn.i18now.com'
const CACHE_TTL_MS = 60_000

interface CacheEntry {
  at: number
  messages: Record<string, unknown>
}

const cache = new Map<string, CacheEntry>()

/** Published messages for a locale, or null when unconfigured/unreachable (fail soft). */
export async function getOtaMessages(locale: string): Promise<Record<string, unknown> | null> {
  // process.env directly (not @/lib/env): this leaf module must stay
  // importable in unit tests, where the validated env isn't bootable.
  // lib/env.ts still declares + documents these keys.
  const projectId = process.env['I18NOW_PROJECT_ID']
  if (!projectId) return null
  const environment =
    process.env['I18NOW_ENVIRONMENT'] ?? (process.env.NODE_ENV === 'production' ? 'prod' : 'dev')

  const cacheKey = `${projectId}:${environment}:${locale}`
  const hit = cache.get(cacheKey)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.messages

  try {
    const res = await fetch(`${CDN_URL}/${projectId}/publish/${environment}/${locale}.json`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error(`CDN responded ${res.status}`)
    const messages = (await res.json()) as Record<string, unknown>
    cache.set(cacheKey, { at: Date.now(), messages })
    return messages
  } catch (err) {
    logger.warn('i18now.fetch.failed', { locale, error: err instanceof Error ? err.message : 'unknown' })
    return null
  }
}

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ROUTE_LABEL_KEYS } from './breadcrumb-labels'

/**
 * Locale-aware `<title>` for dashboard-shell routes. Reads the active
 * locale from the `uipkge-locale` cookie via next-intl's request config
 * (single-URL strategy — no locale-prefixed routing) and translates the
 * route through `ROUTE_LABEL_KEYS`, so the tab title, sidebar, breadcrumb
 * and H1 never disagree. Falls back to the English label map when a path
 * has no key.
 */
export async function localizedMetadata(path: string): Promise<Metadata> {
  const t = await getTranslations()
  const key = ROUTE_LABEL_KEYS[path]
  // Root layout's template appends " | UIPKGE" (decided pattern `<Page> | UIPKGE`).
  return { title: key ? t(key) : (path.split('/').filter(Boolean).pop() ?? 'UIPKGE') }
}

/** Locale-aware title for a raw dictionary key (auth / invite flows). */
export async function keyedMetadata(key: string): Promise<Metadata> {
  const t = await getTranslations()
  return { title: t(key) }
}

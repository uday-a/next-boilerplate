import type { Metadata } from 'next'

export const SITE_NAME = 'UIPKGE'
export const SITE_DESCRIPTION = 'Production-grade Next.js App Router starter on the @uipkge-react UI registry.'

/** Absolute site origin for canonical / og:url / sitemap (NEXT_PUBLIC_SITE_URL, then Vercel's prod URL). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

/** Public (indexable) routes — the sitemap source. App routes stay out. */
export const PUBLIC_ROUTES = ['/', '/pricing', '/login', '/sign-up', '/forgot-password', '/terms', '/privacy']

/**
 * Metadata for an indexable public page: title (root template adds " | UIPKGE"),
 * canonical, Open Graph and Twitter card. Next shallow-merges `openGraph`, so
 * every field is set here rather than inherited from the root layout.
 */
export function publicMetadata(path: string, title: string, description = SITE_DESCRIPTION): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'website', siteName: SITE_NAME, url: path, title: fullTitle, description },
    twitter: { card: 'summary', title: fullTitle, description },
  }
}

import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { defaultLocale, LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/i18n'
import { getOtaMessages } from '@/server/utils/i18now'
import { mergeMessages } from '@/lib/i18now-merge'

// Single-URL strategy (no locale-prefixed routing, like Nuxt `no_prefix`
// and SvelteKit): the active locale travels in the `uipkge-locale` cookie.
// Server components read it here for messages + `<html lang>` + metadata;
// the client switches it via `LocaleSwitcher` (cookie + router.refresh()).
// When I18NOW_PROJECT_ID is set, published CDN translations merge over the
// local files (CDN wins); otherwise local messages serve alone.
export default getRequestConfig(async () => {
  const store = await cookies()
  const locale = normalizeLocale(store.get(LOCALE_COOKIE_NAME)?.value ?? defaultLocale)
  const local = (await import(`../messages/${locale}.json`)).default as Record<string, unknown>
  const ota = await getOtaMessages(locale)
  return {
    locale,
    messages: ota ? mergeMessages(local, ota) : local,
  }
})

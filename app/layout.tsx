import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { PostHogProvider } from '@/components/posthog-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { defaultLocale, LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/i18n'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Matches Nuxt's site-name title template: "<Page> | UIPKGE".
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: { type: 'website', siteName: SITE_NAME, title: SITE_NAME, description: SITE_DESCRIPTION },
  twitter: { card: 'summary' },
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Server reads the locale cookie for `<html lang>` + messages (single-URL
  // strategy: no locale-prefixed routing, like Nuxt `no_prefix`). Switching
  // happens client-side via `LocaleSwitcher` (cookie + router.refresh()).
  const store = await cookies()
  const locale = normalizeLocale(store.get(LOCALE_COOKIE_NAME)?.value ?? defaultLocale)
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap"
        />
      </head>
      <body className="bg-background text-foreground min-h-dvh font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <PostHogProvider>{children}</PostHogProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import createNextIntlPlugin from 'next-intl/plugin'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// next-intl request config (single-URL strategy: locale from the
// `uipkge-locale` cookie, no locale-prefixed routing). Works under
// Turbopack dev and production builds alike.
const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Monorepo: trace deps from this template, not the parent uipkge-ui lockfile.
  outputFileTracingRoot: path.join(__dirname),
}

export default withNextIntl(nextConfig)

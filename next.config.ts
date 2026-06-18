import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Monorepo: trace deps from this template, not the parent uipkge-ui lockfile.
  outputFileTracingRoot: path.join(__dirname),
}

export default nextConfig
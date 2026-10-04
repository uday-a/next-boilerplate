import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard', '/settings', '/projects', '/admin', '/onboarding', '/invite', '/mfa', '/support', '/feedback'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}

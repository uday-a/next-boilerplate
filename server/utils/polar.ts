import { env, hasPolar } from '@/lib/env'

type PolarClient = {
  checkouts: {
    create(input: {
      products: string[]
      successUrl?: string
      externalCustomerId?: string
      customerEmail?: string
      metadata?: Record<string, string | number | boolean>
    }): Promise<{ id: string; url: string }>
  }
  customerSessions: {
    create(input: { externalCustomerId: string }): Promise<{ customerPortalUrl: string }>
  }
}

let polarPromise: Promise<PolarClient | null> | null = null

export function getPolar(): Promise<PolarClient | null> {
  if (!hasPolar) return Promise.resolve(null)
  if (!polarPromise) {
    polarPromise = import('@polar-sh/sdk').then(
      ({ Polar }) =>
        new Polar({
          accessToken: env.POLAR_ACCESS_TOKEN!,
          server: env.POLAR_SERVER,
        }) as unknown as PolarClient,
    )
  }
  return polarPromise
}

export type Plan = 'pro' | 'team' | 'enterprise'

export function productIdForPlan(plan: Plan): string | null {
  switch (plan) {
    case 'pro':
      return env.POLAR_PRO_PRODUCT_ID ?? null
    case 'team':
      return env.POLAR_TEAM_PRODUCT_ID ?? null
    case 'enterprise':
      return env.POLAR_ENTERPRISE_PRODUCT_ID ?? null
  }
}

export function planForProductId(productId: string): Plan | null {
  if (productId === env.POLAR_PRO_PRODUCT_ID) return 'pro'
  if (productId === env.POLAR_TEAM_PRODUCT_ID) return 'team'
  if (productId === env.POLAR_ENTERPRISE_PRODUCT_ID) return 'enterprise'
  return null
}
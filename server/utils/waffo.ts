import { env, hasWaffo } from '@/lib/env'
import type { WaffoPancake, Environment } from '@waffo/pancake-ts'

export type Plan = 'pro' | 'team' | 'enterprise'

let waffoPromise: Promise<WaffoPancake | null> | null = null

export function getWaffo(): Promise<WaffoPancake | null> {
  if (!hasWaffo) return Promise.resolve(null)
  if (!waffoPromise) {
    waffoPromise = import('@waffo/pancake-ts').then(({ WaffoPancake }) => {
      const privateKey = env.WAFFO_PRIVATE_KEY!.replace(/\\n/g, '\n')
      return new WaffoPancake({
        merchantId: env.WAFFO_MERCHANT_ID!,
        privateKey,
        environment: env.WAFFO_ENVIRONMENT as Environment,
        ...(env.WAFFO_WEBHOOK_PUBLIC_KEY
          ? { webhookPublicKey: env.WAFFO_WEBHOOK_PUBLIC_KEY.replace(/\\n/g, '\n') }
          : {}),
      })
    })
  }
  return waffoPromise
}

export function waffoProductIdForPlan(plan: Plan): string | null {
  switch (plan) {
    case 'pro':
      return env.WAFFO_PRO_PRODUCT_ID ?? null
    case 'team':
      return env.WAFFO_TEAM_PRODUCT_ID ?? null
    case 'enterprise':
      return env.WAFFO_ENTERPRISE_PRODUCT_ID ?? null
  }
}

export function planForWaffoProductId(productId: string): Plan | null {
  if (productId === env.WAFFO_PRO_PRODUCT_ID) return 'pro'
  if (productId === env.WAFFO_TEAM_PRODUCT_ID) return 'team'
  if (productId === env.WAFFO_ENTERPRISE_PRODUCT_ID) return 'enterprise'
  return null
}

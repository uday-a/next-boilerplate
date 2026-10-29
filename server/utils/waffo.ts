import { env, hasWaffo } from '@/lib/env'
import type { WaffoPancake, Environment, WebhookEventData } from '@waffo/pancake-ts'

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

const PLANS: readonly string[] = ['pro', 'team', 'enterprise']

// Waffo sends currentPeriodEnd as a date ("2026-05-01"). Access runs through
// the end of that day (UTC), not midnight at its start.
export function waffoPeriodEnd(value: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T23:59:59.999Z`) : new Date(value)
}

const ACTIVE = { status: 'active', cancelAtPeriodEnd: false }
const CANCELING = { status: 'active', cancelAtPeriodEnd: true }
const PAST_DUE = { status: 'past_due', cancelAtPeriodEnd: false }
const CANCELED = { status: 'canceled', cancelAtPeriodEnd: false }

const EVENT_STATE: Record<string, typeof ACTIVE | undefined> = {
  'subscription.canceled': CANCELED,
  'subscription.canceling': CANCELING,
  'subscription.past_due': PAST_DUE,
  'subscription.uncanceled': ACTIVE,
}

// Anything not listed (pending, or a status Waffo adds later) leaves the
// stored status alone rather than granting access.
const ORDER_STATE: Record<string, typeof ACTIVE | undefined> = {
  active: ACTIVE,
  completed: ACTIVE,
  canceling: CANCELING,
  past_due: PAST_DUE,
  canceled: CANCELED,
  closed: CANCELED,
  expired: CANCELED,
}

// Columns a Waffo subscription event sets. A key is present only when the
// event carries the value, so an update leaves everything else as stored.
export function waffoSubscriptionFields(eventType: string, data: WebhookEventData) {
  const state = EVENT_STATE[eventType] ?? (data.orderStatus ? ORDER_STATE[data.orderStatus] : undefined)

  // Product metadata comes with every order, including a plan change made in
  // the customer portal; checkout metadata only with orders from our checkout.
  const metaPlan = data.productMetadata?.plan ?? data.orderMetadata?.plan
  const productId = metaPlan && PLANS.includes(metaPlan)
    ? waffoProductIdForPlan(metaPlan as Plan)
    : data.orderMetadata?.productId

  return {
    ...state,
    ...(productId ? { productId } : {}),
    ...(data.currentPeriodEnd ? { currentPeriodEnd: waffoPeriodEnd(data.currentPeriodEnd) } : {}),
    ...(data.canceledAt
      ? { canceledAt: new Date(data.canceledAt) }
      : state === CANCELED
        ? { canceledAt: new Date() }
        : {}),
  }
}

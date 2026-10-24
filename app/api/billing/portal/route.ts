import { eq } from 'drizzle-orm'
import { apiHandler, apiError } from '@/lib/api/response'
import { env, hasPolar, hasWaffo } from '@/lib/env'
import { requireAuth } from '@/server/utils/guards'
import { getPolar } from '@/server/utils/polar'
import { getWaffo, planForWaffoProductId } from '@/server/utils/waffo'
import { getDb, schema } from '@/server/db'
import { logger } from '@/server/utils/logger'

export async function POST() {
  return apiHandler(async () => {
    const session = await requireAuth()
    const isTestBilling =
      env.WAFFO_ENVIRONMENT === 'test' || env.POLAR_SERVER === 'sandbox' || process.env.NODE_ENV === 'development'
    if (session.demo && !isTestBilling) {
      throw apiError('FORBIDDEN', "Demo sessions don't have a billing portal.")
    }

    let sub = null
    if (env.DATABASE_URL) {
      try {
        const db = getDb()
        const [row] = await db
          .select({
            polarCustomerId: schema.subscriptions.polarCustomerId,
            polarSubscriptionId: schema.subscriptions.polarSubscriptionId,
            productId: schema.subscriptions.productId,
          })
          .from(schema.subscriptions)
          .where(eq(schema.subscriptions.userId, session.user.id))
          .limit(1)
        sub = row
      } catch (e) {
        logger.warn('billing.portal.db_read_failed', { error: (e as Error).message })
      }
    }

    // Determine if existing subscription is managed via Waffo or if Waffo is the active provider
    const isWaffoSub =
      (sub && (sub.polarCustomerId.startsWith('waffo') || Boolean(planForWaffoProductId(sub.productId)))) ||
      (!sub && (env.BILLING_PROVIDER === 'waffo' || (env.BILLING_PROVIDER === 'auto' && hasWaffo && !hasPolar)))

    if (isWaffoSub && hasWaffo) {
      if (!env.WAFFO_STORE_ID) {
        throw apiError('INTERNAL', 'Waffo Customer Portal is not configured. Set WAFFO_STORE_ID.')
      }

      const waffo = await getWaffo()
      if (!waffo) {
        throw apiError('INTERNAL', 'Waffo billing client is not available.')
      }

      try {
        const portal = await waffo.auth.createCustomerPortalLink({
          storeId: env.WAFFO_STORE_ID,
          buyerIdentity: String(session.user.id),
        })
        logger.info('billing.portal.created', { provider: 'waffo', userId: session.user.id })
        return { url: portal.portalUrl }
      } catch (e) {
        logger.error('billing.portal.failed', {
          provider: 'waffo',
          userId: session.user.id,
          error: (e as Error).message,
        })
        throw apiError('INTERNAL', 'Could not open Waffo billing portal. Try again later.')
      }
    }

    const polar = await getPolar()
    if (!polar) {
      throw apiError('INTERNAL', 'Billing is not configured. Set POLAR_ACCESS_TOKEN + POLAR_WEBHOOK_SECRET.')
    }

    try {
      const portal = await polar.customerSessions.create({
        externalCustomerId: String(session.user.id),
      })
      logger.info('billing.portal.created', { provider: 'polar', userId: session.user.id })
      return { url: portal.customerPortalUrl }
    } catch (e) {
      const message = (e as { message?: string }).message ?? ''
      if (message.toLowerCase().includes('not found') || message.includes('404')) {
        throw apiError('NOT_FOUND', 'No active subscription. Start one from the pricing page first.')
      }
      logger.error('billing.portal.failed', {
        provider: 'polar',
        userId: session.user.id,
        error: (e as Error).message,
      })
      throw apiError('INTERNAL', 'Could not open the billing portal. Try again later.')
    }
  })
}

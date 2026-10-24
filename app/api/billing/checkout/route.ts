import { z } from 'zod'
import { apiHandler, apiError } from '@/lib/api/response'
import { env, hasPolar, hasWaffo } from '@/lib/env'
import { requireAuth } from '@/server/utils/guards'
import { getPolar, productIdForPlan, type Plan } from '@/server/utils/polar'
import { getWaffo, waffoProductIdForPlan } from '@/server/utils/waffo'
import { logger } from '@/server/utils/logger'

const Body = z.object({
  plan: z.enum(['pro', 'team', 'enterprise']),
  provider: z.enum(['polar', 'waffo']).optional(),
})

export async function POST(request: Request) {
  return apiHandler(async () => {
    const session = await requireAuth()
    const isTestBilling =
      env.WAFFO_ENVIRONMENT === 'test' || env.POLAR_SERVER === 'sandbox' || process.env.NODE_ENV === 'development'
    if (session.demo && !isTestBilling) {
      throw apiError('FORBIDDEN', "Demo sessions can't initiate checkout. Sign in with a real account.")
    }

    const parsed = Body.safeParse(await request.json())
    if (!parsed.success) {
      throw apiError('VALIDATION_FAILED', 'Invalid checkout payload', { issues: parsed.error.issues })
    }

    const plan: Plan = parsed.data.plan

    // Resolve provider: explicit body provider > BILLING_PROVIDER setting > auto
    let provider = parsed.data.provider
    if (!provider) {
      if (env.BILLING_PROVIDER === 'waffo') {
        provider = 'waffo'
      } else if (env.BILLING_PROVIDER === 'polar') {
        provider = 'polar'
      } else {
        // 'auto' mode: prefer configured provider, default to polar if available, otherwise waffo
        provider = hasPolar ? 'polar' : hasWaffo ? 'waffo' : 'polar'
      }
    }

    if (provider === 'waffo') {
      const productId = waffoProductIdForPlan(plan)
      if (!productId) {
        throw apiError('VALIDATION_FAILED', `Plan '${plan}' has no WAFFO_${plan.toUpperCase()}_PRODUCT_ID configured`)
      }

      const waffo = await getWaffo()
      if (!waffo) {
        throw apiError('INTERNAL', 'Waffo billing is not configured. Set WAFFO_MERCHANT_ID + WAFFO_PRIVATE_KEY.')
      }

      try {
        const checkout = await waffo.checkout.authenticated.create({
          productId,
          currency: 'USD',
          buyerIdentity: String(session.user.id),
          buyerEmail: session.user.email ?? undefined,
          successUrl: `${env.NEXT_PUBLIC_SITE_URL}/settings/billing?status=success`,
          metadata: {
            userId: String(session.user.id),
            plan,
            productId,
          },
          orderMerchantExternalId: `sub_${session.user.id}_${Date.now()}`,
        })
        logger.info('billing.checkout.created', {
          provider: 'waffo',
          userId: session.user.id,
          plan,
          checkoutUrl: checkout.checkoutUrl,
        })
        return { url: checkout.checkoutUrl }
      } catch (e) {
        logger.error('billing.checkout.failed', {
          provider: 'waffo',
          userId: session.user.id,
          plan,
          error: (e as Error).message,
        })
        throw apiError('INTERNAL', 'Could not create checkout session with Waffo. Try again, or contact support.')
      }
    }

    const productId = productIdForPlan(plan)
    if (!productId) {
      throw apiError('VALIDATION_FAILED', `Plan '${plan}' has no POLAR_${plan.toUpperCase()}_PRODUCT_ID configured`)
    }

    const polar = await getPolar()
    if (!polar) {
      throw apiError('INTERNAL', 'Billing is not configured. Set POLAR_ACCESS_TOKEN + POLAR_WEBHOOK_SECRET.')
    }

    try {
      const checkout = await polar.checkouts.create({
        products: [productId],
        successUrl: `${env.NEXT_PUBLIC_SITE_URL}/settings/billing?status=success`,
        externalCustomerId: String(session.user.id),
        customerEmail: session.user.email ?? undefined,
        metadata: { userId: session.user.id, plan },
      })
      logger.info('billing.checkout.created', {
        provider: 'polar',
        userId: session.user.id,
        plan,
        checkoutId: checkout.id,
      })
      return { url: checkout.url }
    } catch (e) {
      logger.error('billing.checkout.failed', {
        provider: 'polar',
        userId: session.user.id,
        plan,
        error: (e as Error).message,
      })
      throw apiError('INTERNAL', 'Could not create checkout session. Try again, or contact support.')
    }
  })
}

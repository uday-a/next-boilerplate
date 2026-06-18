import { z } from 'zod'
import { apiHandler, apiError } from '@/lib/api/response'
import { env } from '@/lib/env'
import { requireAuth } from '@/server/utils/guards'
import { getPolar, productIdForPlan, type Plan } from '@/server/utils/polar'
import { logger } from '@/server/utils/logger'

const Body = z.object({
  plan: z.enum(['pro', 'team', 'enterprise']),
})

export async function POST(request: Request) {
  return apiHandler(async () => {
    const session = await requireAuth()
    if (session.demo) {
      throw apiError('FORBIDDEN', "Demo sessions can't initiate checkout. Sign in with a real account.")
    }

    const parsed = Body.safeParse(await request.json())
    if (!parsed.success) {
      throw apiError('VALIDATION_FAILED', 'Invalid checkout payload', { issues: parsed.error.issues })
    }

    const plan: Plan = parsed.data.plan
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
      logger.info('billing.checkout.created', { userId: session.user.id, plan, checkoutId: checkout.id })
      return { url: checkout.url }
    } catch (e) {
      logger.error('billing.checkout.failed', { userId: session.user.id, plan, error: (e as Error).message })
      throw apiError('INTERNAL', 'Could not create checkout session. Try again, or contact support.')
    }
  })
}
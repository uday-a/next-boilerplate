import { apiHandler, apiError } from '@/lib/api/response'
import { requireAuth } from '@/server/utils/guards'
import { getPolar } from '@/server/utils/polar'
import { logger } from '@/server/utils/logger'

export async function POST() {
  return apiHandler(async () => {
    const session = await requireAuth()
    if (session.demo) {
      throw apiError('FORBIDDEN', "Demo sessions don't have a billing portal.")
    }

    const polar = await getPolar()
    if (!polar) {
      throw apiError('INTERNAL', 'Billing is not configured. Set POLAR_ACCESS_TOKEN + POLAR_WEBHOOK_SECRET.')
    }

    try {
      const portal = await polar.customerSessions.create({
        externalCustomerId: String(session.user.id),
      })
      logger.info('billing.portal.created', { userId: session.user.id })
      return { url: portal.customerPortalUrl }
    } catch (e) {
      const message = (e as { message?: string }).message ?? ''
      if (message.toLowerCase().includes('not found') || message.includes('404')) {
        throw apiError('NOT_FOUND', 'No active subscription. Start one from the pricing page first.')
      }
      logger.error('billing.portal.failed', { userId: session.user.id, error: (e as Error).message })
      throw apiError('INTERNAL', 'Could not open the billing portal. Try again later.')
    }
  })
}
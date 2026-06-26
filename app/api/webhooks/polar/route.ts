import { env, hasPolar } from '@/lib/env'
import { getDb, schema } from '@/server/db'
import { logger } from '@/server/utils/logger'

export async function POST(request: Request) {
  if (!hasPolar) {
    return new Response('Polar webhook secret not configured', { status: 503 })
  }

  const rawBody = await request.text()
  if (!rawBody) {
    return new Response('Missing body', { status: 400 })
  }

  const { validateEvent, WebhookVerificationError } = await import('@polar-sh/sdk/webhooks')

  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    headers[key] = value
  })

  let polarEvent: { type: string; data: Record<string, unknown> }
  try {
    polarEvent = validateEvent(rawBody, headers, env.POLAR_WEBHOOK_SECRET!) as {
      type: string
      data: Record<string, unknown>
    }
  } catch (e) {
    if (e instanceof WebhookVerificationError) {
      logger.warn('billing.webhook.invalid_signature')
      return new Response('Invalid signature', { status: 403 })
    }
    throw e
  }

  const data = polarEvent.data
  const customer = data.customer as { externalId?: string } | undefined
  const externalCustomerId = customer?.externalId ?? data.customerExternalId ?? null
  const userId = externalCustomerId ? Number.parseInt(String(externalCustomerId), 10) : null

  if (polarEvent.type.startsWith('subscription.')) {
    if (!userId || Number.isNaN(userId)) {
      logger.warn('billing.webhook.no_external_customer_id', { type: polarEvent.type })
      return new Response('', { status: 202 })
    }

    try {
      const db = getDb()
      await db
        .insert(schema.subscriptions)
        .values({
          userId,
          polarCustomerId: String(data.customerId),
          polarSubscriptionId: String(data.id),
          productId: String(data.productId),
          status: String(data.status),
          currentPeriodEnd: data.currentPeriodEnd ? new Date(String(data.currentPeriodEnd)) : null,
          cancelAtPeriodEnd: Boolean(data.cancelAtPeriodEnd),
          canceledAt: data.canceledAt ? new Date(String(data.canceledAt)) : null,
        })
        .onConflictDoUpdate({
          target: schema.subscriptions.userId,
          set: {
            polarCustomerId: String(data.customerId),
            polarSubscriptionId: String(data.id),
            productId: String(data.productId),
            status: String(data.status),
            currentPeriodEnd: data.currentPeriodEnd ? new Date(String(data.currentPeriodEnd)) : null,
            cancelAtPeriodEnd: Boolean(data.cancelAtPeriodEnd),
            canceledAt: data.canceledAt ? new Date(String(data.canceledAt)) : null,
            updatedAt: new Date(),
          },
        })

      logger.info('billing.webhook.subscription_upserted', {
        type: polarEvent.type,
        userId,
        status: data.status,
        productId: data.productId,
      })
    } catch (e) {
      logger.error('billing.webhook.db_upsert_failed', {
        type: polarEvent.type,
        userId,
        error: (e as Error).message,
      })
      return new Response('DB error', { status: 500 })
    }
  } else {
    logger.info('billing.webhook.ignored', { type: polarEvent.type })
  }

  return new Response('', { status: 202 })
}
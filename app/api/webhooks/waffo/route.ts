import { env, hasWaffo } from '@/lib/env'
import { getDb, schema } from '@/server/db'
import { logger } from '@/server/utils/logger'

export async function POST(request: Request) {
  if (!hasWaffo) {
    return new Response('Waffo billing is not configured', { status: 503 })
  }

  const rawBody = await request.text()
  if (!rawBody) {
    return new Response('Missing body', { status: 400 })
  }

  const signatureHeader = request.headers.get('x-waffo-signature')
  if (!signatureHeader) {
    return new Response('Missing X-Waffo-Signature header', { status: 400 })
  }

  const { verifyWebhook, WebhookEventType } = await import('@waffo/pancake-ts')
  type WebhookData = import('@waffo/pancake-ts').WebhookEventData

  let event
  try {
    event = verifyWebhook<WebhookData>(rawBody, signatureHeader, {
      environment: env.WAFFO_ENVIRONMENT as 'test' | 'prod',
      ...(env.WAFFO_WEBHOOK_PUBLIC_KEY
        ? { publicKey: env.WAFFO_WEBHOOK_PUBLIC_KEY.replace(/\\n/g, '\n') }
        : {}),
    })
  } catch (e) {
    logger.warn('billing.waffo_webhook.invalid_signature', { error: (e as Error).message })
    return new Response('Invalid signature', { status: 403 })
  }

  const { eventType, data } = event
  const rawUserId = data.merchantProvidedBuyerIdentity ?? data.orderMetadata?.userId
  const userId = rawUserId ? Number.parseInt(rawUserId, 10) : null

  const isSubscriptionEvent =
    eventType.startsWith('subscription.') ||
    eventType === WebhookEventType.OrderCompleted ||
    data.orderStatus !== undefined

  if (isSubscriptionEvent) {
    if (!userId || Number.isNaN(userId)) {
      logger.warn('billing.waffo_webhook.no_user_id', { eventType, eventId: event.eventId })
      return new Response('', { status: 202 })
    }

    let status = 'active'
    let cancelAtPeriodEnd = false

    if (eventType === WebhookEventType.SubscriptionCanceled) {
      status = 'canceled'
    } else if (eventType === WebhookEventType.SubscriptionCanceling) {
      status = 'active'
      cancelAtPeriodEnd = true
    } else if (eventType === WebhookEventType.SubscriptionPastDue) {
      status = 'past_due'
    } else if (eventType === WebhookEventType.SubscriptionUncanceled) {
      status = 'active'
      cancelAtPeriodEnd = false
    } else if (data.orderStatus) {
      if (data.orderStatus === 'canceled') status = 'canceled'
      else if (data.orderStatus === 'past_due') status = 'past_due'
      else if (data.orderStatus === 'canceling') {
        status = 'active'
        cancelAtPeriodEnd = true
      } else if (data.orderStatus === 'active' || data.orderStatus === 'completed') {
        status = 'active'
      }
    }

    const productId = data.orderMetadata?.productId ?? env.WAFFO_PRO_PRODUCT_ID ?? 'waffo_pro'
    const customerId = `waffo_${data.merchantProvidedBuyerIdentity ?? userId}`
    const subscriptionId = String(data.orderId)

    try {
      const db = getDb()
      await db
        .insert(schema.subscriptions)
        .values({
          userId,
          polarCustomerId: customerId,
          polarSubscriptionId: subscriptionId,
          productId,
          status,
          currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : null,
          cancelAtPeriodEnd,
          canceledAt: data.canceledAt
            ? new Date(data.canceledAt)
            : status === 'canceled'
              ? new Date()
              : null,
        })
        .onConflictDoUpdate({
          target: schema.subscriptions.userId,
          set: {
            polarCustomerId: customerId,
            polarSubscriptionId: subscriptionId,
            productId,
            status,
            currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : null,
            cancelAtPeriodEnd,
            canceledAt: data.canceledAt
              ? new Date(data.canceledAt)
              : status === 'canceled'
                ? new Date()
                : null,
            updatedAt: new Date(),
          },
        })

      logger.info('billing.waffo_webhook.subscription_upserted', {
        eventType,
        userId,
        orderId: data.orderId,
        status,
        productId,
      })
    } catch (e) {
      logger.error('billing.waffo_webhook.db_upsert_failed', {
        eventType,
        userId,
        error: (e as Error).message,
      })
      return new Response('DB error', { status: 500 })
    }
  } else {
    logger.info('billing.waffo_webhook.ignored', { eventType, eventId: event.eventId })
  }

  return new Response('', { status: 202 })
}

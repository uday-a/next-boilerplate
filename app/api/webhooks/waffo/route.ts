import { eq } from 'drizzle-orm'
import { env, hasWaffo } from '@/lib/env'
import { getDb, schema } from '@/server/db'
import { logger } from '@/server/utils/logger'
import { waffoSubscriptionFields } from '@/server/utils/waffo'

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

  const { eventType, eventId, data } = event

  if (event.mode !== env.WAFFO_ENVIRONMENT || (env.WAFFO_STORE_ID && event.storeId !== env.WAFFO_STORE_ID)) {
    logger.warn('billing.waffo_webhook.wrong_deployment', { eventType, eventId, storeId: event.storeId, mode: event.mode })
    return new Response('Event is not for this store or mode', { status: 400 })
  }

  const rawUserId = data.merchantProvidedBuyerIdentity ?? data.orderMetadata?.userId
  const userId = rawUserId ? Number.parseInt(rawUserId, 10) : null

  // payment_succeeded describes one charge and carries no period or status;
  // subscription.renewed moves the period forward. refund.* events carry the
  // order's status but are not a change to it.
  const isSubscriptionEvent =
    eventType === WebhookEventType.OrderCompleted ||
    (eventType.startsWith('subscription.') && eventType !== WebhookEventType.SubscriptionPaymentSucceeded)
  // Events that may point the user's row at a different order. Any other
  // event for an order the row doesn't hold is a late one for an old order.
  const startsOrder = ([
    WebhookEventType.SubscriptionActivated,
    WebhookEventType.SubscriptionPlanChanged,
    WebhookEventType.OrderCompleted,
  ] as string[]).includes(eventType)

  if (isSubscriptionEvent) {
    if (!userId || Number.isNaN(userId)) {
      logger.warn('billing.waffo_webhook.no_user_id', { eventType, eventId })
      return new Response('', { status: 202 })
    }

    const fields = waffoSubscriptionFields(eventType, data)
    const customerId = `waffo_${data.merchantProvidedBuyerIdentity ?? userId}`
    const subscriptionId = String(data.orderId)

    try {
      // Claim the delivery in the same transaction as the write: a failed
      // write rolls the claim back, so Waffo's retry is applied, not skipped.
      // event.id is the delivery record, reused by every retry of it; an
      // order's eventId can repeat across real transitions (cancel twice).
      const outcome = await getDb().transaction(async (tx) => {
        const [claimed] = await tx
          .insert(schema.webhookEvents)
          .values({ provider: 'waffo', deliveryId: event.id })
          .onConflictDoNothing()
          .returning({ id: schema.webhookEvents.id })
        if (!claimed) return 'duplicate'

        const [current] = await tx
          .select({ orderId: schema.subscriptions.polarSubscriptionId })
          .from(schema.subscriptions)
          .where(eq(schema.subscriptions.userId, userId))
          .for('update')
        if (current && current.orderId !== subscriptionId && !startsOrder) return 'other_order'

        await tx
          .insert(schema.subscriptions)
          .values({
            userId,
            polarCustomerId: customerId,
            polarSubscriptionId: subscriptionId,
            productId: env.WAFFO_PRO_PRODUCT_ID ?? 'waffo_pro',
            // a new row whose status the event doesn't say grants no access
            status: 'incomplete',
            ...fields,
          })
          .onConflictDoUpdate({
            target: schema.subscriptions.userId,
            set: {
              polarCustomerId: customerId,
              polarSubscriptionId: subscriptionId,
              ...fields,
              updatedAt: new Date(),
            },
          })
        return 'applied'
      })

      if (outcome === 'duplicate') {
        logger.info('billing.waffo_webhook.duplicate', { eventType, eventId, deliveryId: event.id })
        return new Response('', { status: 202 })
      }
      if (outcome === 'other_order') {
        logger.warn('billing.waffo_webhook.other_order', { eventType, eventId, userId, orderId: data.orderId })
        return new Response('', { status: 202 })
      }

      logger.info('billing.waffo_webhook.subscription_upserted', {
        eventType,
        userId,
        orderId: data.orderId,
        status: fields.status,
        productId: fields.productId,
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
    logger.info('billing.waffo_webhook.ignored', { eventType, eventId })
  }

  return new Response('', { status: 202 })
}

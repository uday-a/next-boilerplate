import crypto from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { verifyWebhook, type WebhookEventData } from '@waffo/pancake-ts'
import {
  getWaffo,
  planForWaffoProductId,
  waffoPeriodEnd,
  waffoProductIdForPlan,
  waffoSubscriptionFields,
} from './waffo'
import { planForProductId } from './polar'

describe('waffo utilities', () => {
  it('returns null for getWaffo when not configured in test environment', async () => {
    const client = await getWaffo()
    expect(client).toBeNull()
  })

  it('resolves product IDs for plans gracefully when unset', () => {
    expect(waffoProductIdForPlan('pro')).toBeNull()
    expect(waffoProductIdForPlan('team')).toBeNull()
    expect(waffoProductIdForPlan('enterprise')).toBeNull()
    expect(planForWaffoProductId('unknown_product')).toBeNull()
  })

  it('planForProductId handles unknown IDs safely', () => {
    expect(planForProductId('non_existent_id')).toBeNull()
  })
})

describe('waffo webhook verification', () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  })

  function signPayload(payload: string, timestampMs = Date.now()): string {
    const signatureInput = `${timestampMs}.${payload}`
    const signer = crypto.createSign('RSA-SHA256')
    signer.update(signatureInput)
    signer.end()
    const v1 = signer.sign(privateKey, 'base64')
    return `t=${timestampMs},v1=${v1}`
  }

  const samplePayload = JSON.stringify({
    id: 'evt_test_123',
    timestamp: new Date().toISOString(),
    eventType: 'subscription.activated',
    eventId: 'ORD_TEST_123',
    storeId: 'STO_TEST_123',
    storeName: 'Test Store',
    mode: 'test',
    data: {
      orderId: 'ORD_TEST_123',
      buyerEmail: 'user@example.com',
      merchantProvidedBuyerIdentity: '42',
      orderStatus: 'active',
      currentPeriodEnd: '2026-11-23T00:00:00.000Z',
    },
  })

  it('verifies valid RSA-SHA256 signature correctly', () => {
    const sigHeader = signPayload(samplePayload)
    const event = verifyWebhook(samplePayload, sigHeader, { publicKey })

    expect(event.eventType).toBe('subscription.activated')
    expect(event.data.orderId).toBe('ORD_TEST_123')
    expect(event.data.merchantProvidedBuyerIdentity).toBe('42')
  })

  it('rejects tampered payload', () => {
    const sigHeader = signPayload(samplePayload)
    const tampered = samplePayload.replace('42', '99')

    expect(() => verifyWebhook(tampered, sigHeader, { publicKey })).toThrow(/Invalid webhook signature/)
  })

  it('rejects replay attack with expired timestamp', () => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000
    const sigHeader = signPayload(samplePayload, oneHourAgo)

    expect(() => verifyWebhook(samplePayload, sigHeader, { publicKey })).toThrow(
      /Webhook timestamp outside tolerance window/,
    )
  })

  it('rejects missing or malformed signature header', () => {
    expect(() => verifyWebhook(samplePayload, '', { publicKey })).toThrow(/Missing X-Waffo-Signature/)
    expect(() => verifyWebhook(samplePayload, 'malformed', { publicKey })).toThrow(/Malformed X-Waffo-Signature/)
  })
})

describe('waffoSubscriptionFields', () => {
  const base = { orderId: 'ORD_1', buyerEmail: 'a@b.c', currency: 'USD', amount: '9', taxAmount: '0', productName: 'Pro' }
  const data = (extra: Partial<WebhookEventData>) => ({ ...base, ...extra }) as WebhookEventData

  // The update spreads these fields over the stored row; a key that is present
  // with an empty value would wipe a valid period end on a renewal receipt.
  it('omits period and cancel fields the event does not carry', () => {
    const fields = waffoSubscriptionFields('subscription.renewed', data({ orderStatus: 'active' }))
    expect(fields).not.toHaveProperty('currentPeriodEnd')
    expect(fields).not.toHaveProperty('canceledAt')
    expect(fields).not.toHaveProperty('productId')
  })

  it('takes the period end from subscription.renewed, through the end of that day', () => {
    const fields = waffoSubscriptionFields('subscription.renewed', data({ orderStatus: 'active', currentPeriodEnd: '2026-12-01' }))
    expect(fields.currentPeriodEnd?.toISOString()).toBe('2026-12-01T23:59:59.999Z')
  })

  it('keeps full timestamps as sent', () => {
    expect(waffoPeriodEnd('2026-11-23T00:00:00.000Z').toISOString()).toBe('2026-11-23T00:00:00.000Z')
  })

  // A portal plan change has no checkout metadata; productMetadata names the
  // plan. Product IDs are unset in tests, so an unmappable plan must leave the
  // stored product alone rather than fall back to the old checkout product.
  it('prefers productMetadata.plan over the checkout product', () => {
    const fields = waffoSubscriptionFields(
      'subscription.plan_changed',
      data({ orderStatus: 'active', productMetadata: { plan: 'team' }, orderMetadata: { productId: 'prod_pro' } }),
    )
    expect(fields).not.toHaveProperty('productId')
  })

  it('falls back to the checkout product when the product has no plan metadata', () => {
    const fields = waffoSubscriptionFields('subscription.activated', data({ orderStatus: 'active', orderMetadata: { productId: 'prod_pro' } }))
    expect(fields.productId).toBe('prod_pro')
  })

  it('maps terminal order statuses to canceled and leaves unknown ones out', () => {
    expect(waffoSubscriptionFields('subscription.renewed', data({ orderStatus: 'expired' })).status).toBe('canceled')
    expect(waffoSubscriptionFields('subscription.renewed', data({ orderStatus: 'closed' })).status).toBe('canceled')
    expect(waffoSubscriptionFields('subscription.renewed', data({ orderStatus: 'pending' }))).not.toHaveProperty('status')
    expect(waffoSubscriptionFields('subscription.renewed', data({ orderStatus: 'something_new' }))).not.toHaveProperty('status')
  })

  it('maps lifecycle events to status', () => {
    expect(waffoSubscriptionFields('subscription.canceling', data({ orderStatus: 'canceling' }))).toMatchObject({ status: 'active', cancelAtPeriodEnd: true })
    expect(waffoSubscriptionFields('subscription.past_due', data({ orderStatus: 'past_due' })).status).toBe('past_due')
    const canceled = waffoSubscriptionFields('subscription.canceled', data({ orderStatus: 'canceled' }))
    expect(canceled.status).toBe('canceled')
    expect(canceled.canceledAt).toBeInstanceOf(Date)
  })
})

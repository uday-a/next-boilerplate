import crypto from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { verifyWebhook } from '@waffo/pancake-ts'
import { getWaffo, planForWaffoProductId, waffoProductIdForPlan } from './waffo'
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

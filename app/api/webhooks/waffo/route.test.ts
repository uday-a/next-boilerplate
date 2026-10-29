// @vitest-environment node
import crypto from 'node:crypto'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { eq, sql } from 'drizzle-orm'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import * as schema from '@/server/db/schema'

// Env is parsed when lib/env loads, so it has to be in place before the route import.
const keys = await vi.hoisted(async () => {
  const { generateKeyPairSync } = await import('node:crypto')
  const pair = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  })
  Object.assign(process.env, {
    WAFFO_MERCHANT_ID: 'MER_TEST',
    WAFFO_PRIVATE_KEY: pair.privateKey,
    WAFFO_ENVIRONMENT: 'test',
    WAFFO_STORE_ID: 'STO_TEST',
    WAFFO_WEBHOOK_PUBLIC_KEY: pair.publicKey,
    WAFFO_PRO_PRODUCT_ID: 'prod_pro',
    WAFFO_TEAM_PRODUCT_ID: 'prod_team',
  })
  return pair
})

const holder = vi.hoisted(() => ({ db: null as unknown }))
vi.mock('@/server/db', async () => ({
  getDb: () => holder.db,
  schema: await import('@/server/db/schema'),
}))

const { POST } = await import('./route')

type Db = ReturnType<typeof drizzle<typeof schema>>
let db: Db

beforeAll(async () => {
  db = drizzle(new PGlite(), { schema })
  await migrate(db, { migrationsFolder: 'server/db/migrations' })
  holder.db = db
})

beforeEach(async () => {
  await db.execute(sql`TRUNCATE subscriptions, webhook_events, users RESTART IDENTITY CASCADE`)
  await db.insert(schema.users).values({ id: 42, email: 'jane.doe@example.com', login: 'janedoe' })
})

function waffoEvent(eventType: string, data: Record<string, unknown> = {}, overrides: Record<string, unknown> = {}) {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    eventType,
    eventId: 'ORD_1',
    storeId: 'STO_TEST',
    storeName: 'Test Store',
    mode: 'test',
    data: {
      orderId: 'ORD_1',
      buyerEmail: 'jane.doe@example.com',
      currency: 'USD',
      amount: '29.00',
      taxAmount: '0',
      productName: 'Pro',
      merchantProvidedBuyerIdentity: '42',
      ...data,
    },
    ...overrides,
  }
}

function deliver(event: object, privateKey = keys.privateKey) {
  const body = JSON.stringify(event)
  const t = Date.now()
  const v1 = crypto.createSign('RSA-SHA256').update(`${t}.${body}`).sign(privateKey, 'base64')
  return POST(
    new Request('http://localhost/api/webhooks/waffo', {
      method: 'POST',
      headers: { 'x-waffo-signature': `t=${t},v1=${v1}` },
      body,
    }),
  )
}

async function subscription() {
  const [row] = await db.select().from(schema.subscriptions).where(eq(schema.subscriptions.userId, 42))
  return row
}

const activated = waffoEvent('subscription.activated', {
  orderStatus: 'active',
  currentPeriodEnd: '2026-11-30',
  orderMetadata: { userId: '42', plan: 'pro', productId: 'prod_pro' },
})
const renewed = waffoEvent('subscription.renewed', { orderStatus: 'active', currentPeriodEnd: '2026-12-31' })

describe('POST /api/webhooks/waffo', () => {
  it('stores a new subscription with access through the last day of the period', async () => {
    expect((await deliver(activated)).status).toBe(202)

    const row = await subscription()
    expect(row).toMatchObject({ status: 'active', productId: 'prod_pro', polarSubscriptionId: 'ORD_1' })
    expect(row.currentPeriodEnd?.toISOString()).toBe('2026-11-30T23:59:59.999Z')
  })

  // Waffo retries a delivery until it gets a 2xx. Replaying an old activation
  // after a renewal must not roll the period back.
  it('skips a redelivered event instead of applying it again', async () => {
    await deliver(activated)
    await deliver(renewed)
    expect((await deliver(activated)).status).toBe(202)

    expect((await subscription()).currentPeriodEnd?.toISOString()).toBe('2026-12-31T23:59:59.999Z')
    expect(await db.select().from(schema.webhookEvents)).toHaveLength(2)
  })

  // Every event for one order uses the order id as eventId; dedupe on eventId
  // alone would drop the cancellation as a "duplicate" of the activation.
  it('applies different event types that share one order id', async () => {
    await deliver(activated)
    await deliver(waffoEvent('subscription.canceling', { orderStatus: 'canceling', currentPeriodEnd: '2026-11-30' }))

    expect(await subscription()).toMatchObject({ status: 'active', cancelAtPeriodEnd: true })
  })

  // The order id is the eventId for every event on that order, so a real
  // second cancel repeats (eventType, eventId). Only the delivery id tells a
  // new transition from a retry.
  it('applies a repeated transition delivered as a new delivery', async () => {
    await deliver(activated)
    await deliver(waffoEvent('subscription.canceling', { orderStatus: 'canceling' }))
    await deliver(waffoEvent('subscription.uncanceled', { orderStatus: 'active' }))
    await deliver(waffoEvent('subscription.canceling', { orderStatus: 'canceling' }))

    expect((await subscription()).cancelAtPeriodEnd).toBe(true)
  })

  // payment_succeeded carries no period; it used to null currentPeriodEnd.
  it('keeps the period end when a renewal payment receipt arrives', async () => {
    await deliver(activated)
    await deliver(renewed)
    expect((await deliver(waffoEvent('subscription.payment_succeeded', { paymentId: 'PAY_1' }, { eventId: 'PAY_1' }))).status).toBe(202)

    const row = await subscription()
    expect(row.currentPeriodEnd?.toISOString()).toBe('2026-12-31T23:59:59.999Z')
    expect(row.status).toBe('active')
  })

  // A plan change from the customer portal carries no checkout metadata.
  it('reads the plan from product metadata on a portal plan change', async () => {
    await deliver(activated)
    await deliver(waffoEvent('subscription.plan_changed', { orderStatus: 'active', productMetadata: { plan: 'team' } }))

    expect((await subscription()).productId).toBe('prod_team')
  })

  // The claim and the write share a transaction: a failed write must leave the
  // delivery unclaimed so Waffo's retry is applied.
  it('applies a retry after a failed write', async () => {
    const forUnknownUser = waffoEvent('subscription.activated', { orderStatus: 'active', merchantProvidedBuyerIdentity: '7' })
    expect((await deliver(forUnknownUser)).status).toBe(500)
    expect(await db.select().from(schema.webhookEvents)).toHaveLength(0)

    await db.insert(schema.users).values({ id: 7, email: 'john.smith@example.com', login: 'johnsmith' })
    expect((await deliver(forUnknownUser)).status).toBe(202)
    expect(await db.select().from(schema.subscriptions).where(eq(schema.subscriptions.userId, 7))).toHaveLength(1)
  })

  // A refund carries the order's status but changes nothing about access; it
  // must not bring a canceled subscription back.
  it('ignores refund events', async () => {
    await deliver(activated)
    await deliver(waffoEvent('subscription.canceled', { orderStatus: 'canceled' }))
    await deliver(waffoEvent('refund.succeeded', { orderStatus: 'active', refundStatus: 'succeeded' }, { eventId: 'REF_1' }))

    expect((await subscription()).status).toBe('canceled')
  })

  it('treats an expired order as canceled', async () => {
    await deliver(activated)
    await deliver(waffoEvent('subscription.renewed', { orderStatus: 'expired' }))

    expect((await subscription()).status).toBe('canceled')
  })

  // pending (or any status Waffo adds later) says nothing about access.
  it('keeps the stored status when the order status is unknown', async () => {
    await deliver(activated)
    await deliver(waffoEvent('subscription.plan_change_failed', { orderStatus: 'pending' }))

    expect((await subscription()).status).toBe('active')
  })

  it('does not grant access to a new row whose status is unknown', async () => {
    await deliver(waffoEvent('subscription.activated', { orderStatus: 'pending', orderMetadata: { plan: 'pro' } }))

    expect((await subscription()).status).toBe('incomplete')
  })

  // One row per user: a late event for the order the user left must not
  // overwrite the order they resubscribed with.
  it('ignores a late event for an order the user has moved off', async () => {
    await deliver(activated)
    await deliver(waffoEvent('subscription.activated', { orderId: 'ORD_2', orderStatus: 'active', currentPeriodEnd: '2027-01-31' }, { eventId: 'ORD_2' }))
    expect((await deliver(waffoEvent('subscription.canceled', { orderStatus: 'canceled' }))).status).toBe(202)

    expect(await subscription()).toMatchObject({ status: 'active', polarSubscriptionId: 'ORD_2' })
  })

  it('does not let a Waffo event overwrite a Polar subscription', async () => {
    await db.insert(schema.subscriptions).values({
      userId: 42,
      polarCustomerId: 'polar_cus_1',
      polarSubscriptionId: 'polar_sub_1',
      productId: 'polar_pro',
      status: 'active',
    })
    await deliver(waffoEvent('subscription.past_due', { orderStatus: 'past_due' }))

    expect(await subscription()).toMatchObject({ status: 'active', polarSubscriptionId: 'polar_sub_1' })
  })

  it('rejects events for another store or mode', async () => {
    expect((await deliver({ ...activated, storeId: 'STO_OTHER' })).status).toBe(400)
    expect((await deliver({ ...activated, mode: 'prod' })).status).toBe(400)
    expect(await subscription()).toBeUndefined()
  })

  it('rejects a payload signed with another key', async () => {
    const { privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      publicKeyEncoding: { type: 'spki', format: 'pem' },
    })
    expect((await deliver(activated, privateKey)).status).toBe(403)
    expect(await subscription()).toBeUndefined()
  })
})

// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// WAFFO_ENVIRONMENT=test is the default every deployment gets unless it opts
// out, so the demo checks below have to hold with it set.
vi.hoisted(() => {
  Object.assign(process.env, {
    WAFFO_MERCHANT_ID: 'MER_TEST',
    WAFFO_PRIVATE_KEY: 'unused',
    WAFFO_ENVIRONMENT: 'test',
    WAFFO_STORE_ID: 'STO_TEST',
    WAFFO_PRO_PRODUCT_ID: 'waffo_pro',
    POLAR_ACCESS_TOKEN: 'unused',
    POLAR_WEBHOOK_SECRET: 'unused',
    POLAR_PRO_PRODUCT_ID: 'polar_pro',
    BILLING_PROVIDER: 'polar',
  })
})

const mocks = vi.hoisted(() => ({
  session: { demo: false, user: { id: 42, email: 'jane.doe@example.com' } },
  getPolar: vi.fn(),
  getWaffo: vi.fn(),
}))

vi.mock('@/server/utils/guards', () => ({ requireAuth: async () => mocks.session }))
vi.mock('@/server/utils/polar', async (actual) => ({ ...(await actual()), getPolar: mocks.getPolar }))
vi.mock('@/server/utils/waffo', async (actual) => ({ ...(await actual()), getWaffo: mocks.getWaffo }))

const checkout = await import('./checkout/route')
const portal = await import('./portal/route')
const { env } = await import('@/lib/env')
const { logger } = await import('@/server/utils/logger')

function checkoutRequest(body: object) {
  return checkout.POST(new Request('http://localhost/api/billing/checkout', { method: 'POST', body: JSON.stringify(body) }))
}

beforeEach(() => {
  mocks.session.demo = false
  mocks.getPolar.mockReset().mockResolvedValue({
    checkouts: { create: vi.fn().mockResolvedValue({ id: 'chk_1', url: 'https://polar.test/chk_1' }) },
    customerSessions: { create: vi.fn().mockResolvedValue({ customerPortalUrl: 'https://polar.test/portal' }) },
  })
  mocks.getWaffo.mockReset().mockResolvedValue({
    checkout: { authenticated: { create: vi.fn().mockResolvedValue({ sessionId: 's', checkoutUrl: 'https://waffo.test/c' }) } },
    auth: { createCustomerPortalLink: vi.fn().mockResolvedValue({ portalUrl: 'https://waffo.test/portal' }) },
  })
})

// Every demo visitor shares user id 0. Letting them reach a provider would
// let one visitor open the billing portal for what another visitor bought.
describe('demo sessions', () => {
  beforeEach(() => {
    mocks.session.demo = true
  })

  it('cannot start a checkout', async () => {
    const res = await checkoutRequest({ plan: 'pro' })
    expect(res.status).toBe(403)
    expect(mocks.getPolar).not.toHaveBeenCalled()
    expect(mocks.getWaffo).not.toHaveBeenCalled()
  })

  it('cannot open the billing portal', async () => {
    const res = await portal.POST()
    expect(res.status).toBe(403)
    expect(mocks.getPolar).not.toHaveBeenCalled()
    expect(mocks.getWaffo).not.toHaveBeenCalled()
  })
})

// The provider is the deployment's choice; a client must not be able to
// route a checkout to a provider the operator didn't pick.
describe('checkout provider', () => {
  it('follows BILLING_PROVIDER and ignores a provider in the request body', async () => {
    const res = await checkoutRequest({ plan: 'pro', provider: 'waffo' })
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ ok: true, data: { url: 'https://polar.test/chk_1' } })
    expect(mocks.getWaffo).not.toHaveBeenCalled()
  })
})

// The SDK validates merchant config when the client is built. That message
// names the deployment's settings; it belongs in the logs, not in an alert.
describe('Waffo client errors', () => {
  const sdkError = 'Invalid merchantId: expected Merchant Short ID format (MER_xxx), got "MER_TEST"'

  beforeEach(() => {
    env.BILLING_PROVIDER = 'waffo'
    mocks.getWaffo.mockReset().mockRejectedValue(new Error(sdkError))
  })
  afterEach(() => {
    env.BILLING_PROVIDER = 'polar'
    vi.restoreAllMocks()
  })

  it('checkout returns the generic message and logs the SDK error', async () => {
    const logError = vi.spyOn(logger, 'error')
    const res = await checkoutRequest({ plan: 'pro' })

    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error.message).toBe('Could not create checkout session with Waffo. Try again, or contact support.')
    expect(logError).toHaveBeenCalledWith('billing.checkout.failed', expect.objectContaining({ error: sdkError }))
  })

  it('portal returns the generic message and logs the SDK error', async () => {
    const logError = vi.spyOn(logger, 'error')
    const res = await portal.POST()

    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error.message).toBe('Could not open Waffo billing portal. Try again later.')
    expect(logError).toHaveBeenCalledWith('billing.portal.failed', expect.objectContaining({ error: sdkError }))
  })
})

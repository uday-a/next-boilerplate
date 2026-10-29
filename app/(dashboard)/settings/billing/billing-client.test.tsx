import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import messages from '@/messages/en.json'
import { BillingSettingsClient } from './billing-client'

// A viewer east of UTC. Waffo's period end is stored as the last instant of
// that UTC day, which is already the next day here.
vi.hoisted(() => {
  process.env.TZ = 'Asia/Kuala_Lumpur'
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function renderWithPeriodEnd(currentPeriodEnd: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      json: async () => ({
        ok: true,
        data: {
          subscription: {
            status: 'active',
            productId: 'prod_team',
            currentPeriodEnd,
            cancelAtPeriodEnd: false,
            canceledAt: null,
            plan: 'team',
          },
        },
      }),
    }),
  )
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <BillingSettingsClient justCheckedOut={false} />
    </NextIntlClientProvider>,
  )
}

describe('BillingSettingsClient renewal date', () => {
  it('shows the period end date the billing provider sent, whatever the viewer timezone', async () => {
    renderWithPeriodEnd('2026-12-31T23:59:59.999Z')

    expect(await screen.findByText('Renews Dec 31, 2026')).toBeInTheDocument()
    expect(screen.getByText(/Resets Dec 31, 2026\./)).toBeInTheDocument()
  })
})

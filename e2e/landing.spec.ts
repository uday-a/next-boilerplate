import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test('renders hero title, navigation and trial CTAs', async ({ page }) => {
    await page.goto('/')

    // Hero title
    await expect(page.locator('h1')).toContainText('The platform your team will actually use')

    // Navigation links
    const header = page.getByRole('banner')
    await expect(header.getByRole('link', { name: 'Sign in' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Start free trial' }).first()).toBeVisible()
  })

  test('pricing billing toggle updates monthly / yearly prices', async ({ page }) => {
    await page.goto('/')

    const monthlyRadio = page.getByRole('radio', { name: 'Monthly' })
    const yearlyRadio = page.getByRole('radio', { name: /Yearly/i })

    await expect(monthlyRadio).toBeChecked()
    await expect(page.getByText('$9')).toBeVisible()
    await expect(page.getByText('$29')).toBeVisible()

    // Switch to Yearly
    await yearlyRadio.click()
    await expect(yearlyRadio).toBeChecked()
  })

  test('FAQ accordion toggles question details', async ({ page }) => {
    await page.goto('/')

    const faqButton = page.getByRole('button', { name: 'How does the 14-day free trial work?' })
    await expect(faqButton).toBeVisible()
    await faqButton.click()
    await expect(page.getByText(/Sign up with a work email — no credit card/i)).toBeVisible()
  })
})

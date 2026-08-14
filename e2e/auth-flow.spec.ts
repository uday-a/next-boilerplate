import { test, expect } from '@playwright/test'

test.describe('Authentication and demo user session', () => {
  test('sign-in page shows credentials form and demo login', async ({ page }) => {
    await page.goto('/login')

    await expect(page.locator('h3')).toContainText('Welcome back')
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continue as demo user' })).toBeVisible()
  })

  test('clicking demo user logs in and redirects to dashboard', async ({ page }) => {
    await page.goto('/login')

    await page.getByRole('button', { name: 'Continue as demo user' }).click()

    // Should redirect to /dashboard
    await page.waitForURL('**/dashboard')
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible()
    await expect(page.getByText('Demo User')).toBeVisible()
  })
})

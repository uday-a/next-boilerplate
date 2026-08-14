import { test, expect } from '@playwright/test'

test.describe('Dashboard and internal views', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate via demo user
    await page.goto('/login')
    await page.getByRole('button', { name: 'Continue as demo user' }).click()
    await page.waitForURL('**/dashboard')
  })

  test('dashboard renders KPI metrics and charts', async ({ page }) => {
    await expect(page.getByText('MRR', { exact: true })).toBeVisible()
    await expect(page.getByText('Active users', { exact: true })).toBeVisible()
    await expect(page.getByText('Requests by day')).toBeVisible()
  })

  test('navigates to data table and filters customers', async ({ page }) => {
    await page.goto('/dashboard/data-table')
    await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible()

    const searchInput = page.getByPlaceholder('Search name, email, country…')
    await expect(searchInput).toBeVisible()

    // Type in search
    await searchInput.fill('Northwind')
    await expect(page.getByText('Northwind Industries')).toBeVisible()
  })

  test('navigates to kanban board and displays columns', async ({ page }) => {
    await page.goto('/dashboard/kanban')
    await expect(page.getByText('Backlog')).toBeVisible()
    await expect(page.getByText('In Progress')).toBeVisible()
    await expect(page.getByText('Done')).toBeVisible()
  })
})

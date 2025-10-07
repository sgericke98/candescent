import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard')
  })

  test('should display dashboard tabs', async ({ page }) => {
    // Check that all three tabs are present
    await expect(page.getByRole('tab', { name: 'Executive Summary' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'At-Risk Account Search' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'DSM Account View' })).toBeVisible()
  })

  test('should show executive summary by default', async ({ page }) => {
    // Check that executive summary content is visible
    await expect(page.getByText('Total ARR at Risk')).toBeVisible()
    await expect(page.getByText('Accounts at Risk')).toBeVisible()
    await expect(page.getByText('WoW Change')).toBeVisible()
  })

  test('should switch to at-risk search tab', async ({ page }) => {
    // Click on the at-risk search tab
    await page.getByRole('tab', { name: 'At-Risk Account Search' }).click()
    
    // Check that the search interface is visible
    await expect(page.getByPlaceholder('Search by Account Name, DSM, or Type...')).toBeVisible()
    await expect(page.getByText('At-Risk Account Search')).toBeVisible()
  })

  test('should switch to DSM view tab', async ({ page }) => {
    // Click on the DSM view tab
    await page.getByRole('tab', { name: 'DSM Account View' }).click()
    
    // Check that the DSM view content is visible
    await expect(page.getByText('DSM Account View')).toBeVisible()
  })

  test('should display KPI cards', async ({ page }) => {
    // Check that KPI cards are displayed
    const kpiCards = page.locator('[data-testid="kpi-card"]')
    await expect(kpiCards).toHaveCount(5)
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that tabs are still visible
    await expect(page.getByRole('tab', { name: 'Executive Summary' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'At-Risk Account Search' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'DSM Account View' })).toBeVisible()
  })
})

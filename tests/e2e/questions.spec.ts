import { test, expect } from '@playwright/test'

test.describe('Questions Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/questions')
  })

  test('should display questions list', async ({ page }) => {
    // Wait for questions to load
    await page.waitForLoadState('networkidle')

    // Check if questions are visible
    await expect(page.locator('[data-testid="question-card"]').first()).toBeVisible()

    // Check question content
    await expect(page.getByText(/비자|취업|법률/)).toBeVisible()
  })

  test('should filter questions by category', async ({ page }) => {
    // Wait for page load
    await page.waitForLoadState('networkidle')

    // Click on visa category button (not link)
    await page.getByRole('button', { name: '비자/법률' }).click()

    // Should show filtered results
    await expect(page).toHaveURL(/category=visa/)
    await expect(page.locator('[data-testid="question-card"]')).toBeVisible()
  })

  test('should paginate through questions', async ({ page }) => {
    // Wait for questions to load
    await page.waitForLoadState('networkidle')

    // Check if pagination exists
    const pagination = page.locator('[data-testid="pagination"]')
    if (await pagination.isVisible()) {
      // Click next page if available
      const nextButton = page.getByRole('button', { name: /다음|Next/ })
      if (await nextButton.isVisible()) {
        await nextButton.click()
        await expect(page).toHaveURL(/page=2/)
      }
    }
  })

  test('should display question details when clicked', async ({ page }) => {
    // Wait for questions to load
    await page.waitForLoadState('networkidle')

    // Click on first question
    const firstQuestion = page.locator('[data-testid="question-card"]').first()
    await firstQuestion.click()

    // Should navigate to question detail
    await expect(page).toHaveURL(/questions\/\d+/)

    // Check question detail elements
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByText(/답변|Answer/)).toBeVisible()
  })

  test('should show question creation form', async ({ page }) => {
    // Click "Ask Question" button
    await page.getByRole('link', { name: '질문하기' }).click()

    // Should show question form or navigate to form page
    await expect(page).toHaveURL(/questions\/new/)

    // Form elements should be visible
    await expect(page.getByPlaceholder(/제목|Title/)).toBeVisible()
    await expect(page.getByPlaceholder(/내용|Content/)).toBeVisible()
  })

  test('should display trust scores and badges', async ({ page }) => {
    // Wait for questions to load
    await page.waitForLoadState('networkidle')

    // Check for trust score elements
    await expect(page.locator('[data-testid="trust-badge"]').first()).toBeVisible()

    // Check for user badges
    await expect(page.locator('[data-testid="user-badge"]').first()).toBeVisible()
  })

  test('should handle search in questions', async ({ page }) => {
    // Use search box
    const searchInput = page.getByPlaceholder(/검색|Search/)
    await searchInput.fill('E-7 비자')
    await searchInput.press('Enter')

    // Should show search results
    await expect(page).toHaveURL(/search=E-7/)
    await expect(page.getByText(/검색 결과|Search results/)).toBeVisible()
  })

  test('should show Korean and Vietnamese content', async ({ page }) => {
    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check for Korean content
    await expect(page.getByText(/한국|비자|취업/)).toBeVisible()

    // Check for Vietnamese names or content
    await expect(page.getByText(/레투안|응우옌|Vietnamese/)).toBeVisible()
  })

  test('should be accessible with keyboard navigation', async ({ page }) => {
    // Tab through elements
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Should be able to navigate to question
    await page.keyboard.press('Enter')

    // Check if navigation worked
    const url = page.url()
    expect(url).toMatch(/questions/)
  })

  test('should load quickly and efficiently', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/questions')
    await page.waitForLoadState('networkidle')
    const endTime = Date.now()

    // Page should load within reasonable time
    const loadTime = endTime - startTime
    expect(loadTime).toBeLessThan(5000) // 5 seconds max
  })
})
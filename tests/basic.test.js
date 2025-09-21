// Playwright를 사용한 기본 E2E 테스트
import { test, expect } from '@playwright/test'

test.describe('Viet K-Connect 기본 기능 테스트', () => {

  test('홈페이지 로딩 테스트', async ({ page }) => {
    // 개발 서버 접속
    await page.goto('http://localhost:3000')

    // 페이지 제목 확인
    await expect(page).toHaveTitle(/Viet K-Connect/)

    // 헤더 로고 확인
    const logo = page.locator('.logo-text')
    await expect(logo).toBeVisible()
    await expect(logo).toContainText('Viet K-Connect')

    // 웰컴 배너 확인
    const welcomeBanner = page.locator('.welcome-banner')
    await expect(welcomeBanner).toBeVisible()

    // 네비게이션 메뉴 확인
    const homeLink = page.locator('a[href="/"]')
    const postsLink = page.locator('a[href="/posts"]')
    await expect(homeLink).toBeVisible()
    await expect(postsLink).toBeVisible()
  })

  test('모바일 반응형 테스트', async ({ page }) => {
    // 모바일 사이즈로 변경
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('http://localhost:3000')

    // 모바일 네비게이션 확인
    const mobileNav = page.locator('.mobile-nav')
    await expect(mobileNav).toBeVisible()

    // 헤더에서 로고 텍스트가 숨겨지는지 확인
    const logoText = page.locator('.logo-text')
    await expect(logoText).toBeHidden()
  })

  test('로그인 모달 테스트', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // 로그인 버튼 클릭
    const loginBtn = page.locator('.login-btn')
    await loginBtn.click()

    // 로그인 모달 표시 확인
    const loginModal = page.locator('.login-modal')
    await expect(loginModal).toBeVisible()

    // 소셜 로그인 버튼들 확인
    const googleBtn = page.locator('.google-btn')
    const facebookBtn = page.locator('.facebook-btn')
    const kakaoBtn = page.locator('.kakao-btn')

    await expect(googleBtn).toBeVisible()
    await expect(facebookBtn).toBeVisible()
    await expect(kakaoBtn).toBeVisible()

    // 모달 닫기 테스트
    const closeBtn = page.locator('.close-btn')
    await closeBtn.click()
    await expect(loginModal).toBeHidden()
  })

  test('전체 질문 페이지 테스트', async ({ page }) => {
    await page.goto('http://localhost:3000/posts')

    // 페이지 제목 확인
    const pageTitle = page.locator('h1')
    await expect(pageTitle).toContainText('전체 질문')

    // 검색 기능 확인
    const searchInput = page.locator('.search-input')
    await expect(searchInput).toBeVisible()

    // 카테고리 필터 확인
    const categoryFilter = page.locator('.category-filter')
    await expect(categoryFilter).toBeVisible()

    // 정렬 옵션 확인
    const sortSelect = page.locator('.sort-select')
    await expect(sortSelect).toBeVisible()
  })

  test('질문 상세 페이지 테스트', async ({ page }) => {
    // 존재하는 질문 ID로 이동 (임시)
    await page.goto('http://localhost:3000/post/1')

    // 질문 제목 확인
    const questionTitle = page.locator('.question-title')
    await expect(questionTitle).toBeVisible()

    // 질문 내용 확인
    const questionContent = page.locator('.question-content')
    await expect(questionContent).toBeVisible()

    // 답변 섹션 확인
    const answersSection = page.locator('.answers-section')
    await expect(answersSection).toBeVisible()

    // 답변 작성 폼 확인 (로그인 상태에 따라 다름)
    const answerForm = page.locator('.answer-form, .login-prompt')
    await expect(answerForm).toBeVisible()
  })

  test('다크모드 토글 테스트', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // 다크모드 속성이 없는 상태 확인
    const body = page.locator('body')
    await expect(body).not.toHaveAttribute('data-theme', 'dark')

    // TODO: 다크모드 토글 버튼이 구현되면 테스트 추가
  })

  test('PWA 설치 프롬프트 테스트', async ({ page, context }) => {
    await page.goto('http://localhost:3000')

    // PWA 관련 메타 태그 확인
    const manifest = page.locator('link[rel="manifest"]')
    await expect(manifest).toHaveAttribute('href', '/manifest.json')

    const themeColor = page.locator('meta[name="theme-color"]')
    await expect(themeColor).toHaveAttribute('content', '#007bff')
  })

  test('성능 테스트', async ({ page }) => {
    // 성능 메트릭 측정 시작
    await page.goto('http://localhost:3000')

    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle')

    // First Contentful Paint 측정
    const fcpMetric = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              resolve(entry.startTime)
            }
          }
        }).observe({ entryTypes: ['paint'] })

        // 타임아웃 처리
        setTimeout(() => resolve(null), 5000)
      })
    })

    console.log(`📊 First Contentful Paint: ${fcpMetric}ms`)

    // FCP는 1.8초 이하여야 함 (Good 기준)
    if (fcpMetric) {
      expect(fcpMetric).toBeLessThan(1800)
    }

    // 리소스 로딩 시간 확인
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter(r => r.duration > 100) // 100ms 이상 걸린 리소스
        .map(r => ({
          name: r.name,
          duration: Math.round(r.duration),
          size: r.transferSize
        }))
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5) // 상위 5개
    })

    console.log('🐌 느린 리소스:', resources)
  })

  test('접근성 테스트', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // 스크린 리더용 대체 텍스트 확인
    const images = page.locator('img')
    const imageCount = await images.count()

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy() // alt 속성이 있어야 함
    }

    // 포커스 가능한 요소들 확인
    const focusableElements = page.locator('button, a, input, select, textarea, [tabindex]')
    const focusableCount = await focusableElements.count()
    expect(focusableCount).toBeGreaterThan(0)

    // 키보드 내비게이션 테스트
    await page.keyboard.press('Tab')
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('오류 처리 테스트', async ({ page }) => {
    // 존재하지 않는 페이지 접근
    const response = await page.goto('http://localhost:3000/nonexistent-page')

    // 리다이렉트되거나 404 페이지 표시되는지 확인
    expect(page.url()).toBe('http://localhost:3000/') // 홈으로 리다이렉트

    // 네트워크 오프라인 시뮬레이션
    await page.context().setOffline(true)
    await page.reload()

    // 오프라인 상태 표시 확인
    const offlineIndicator = page.locator('.status-indicator.disconnected, .connection-warning')
    await expect(offlineIndicator).toBeVisible({ timeout: 10000 })

    // 온라인 상태 복원
    await page.context().setOffline(false)
  })

  test('검색 기능 테스트', async ({ page }) => {
    await page.goto('http://localhost:3000/posts')

    // 검색어 입력
    const searchInput = page.locator('.search-input')
    await searchInput.fill('비자')

    // 검색 결과 확인 (실제 구현에 따라 조정 필요)
    await page.waitForTimeout(1000) // 검색 디바운스 대기

    // 검색어 클리어 버튼 테스트
    const clearBtn = page.locator('.clear-search')
    if (await clearBtn.isVisible()) {
      await clearBtn.click()
      await expect(searchInput).toHaveValue('')
    }
  })

  test('카테고리 필터 테스트', async ({ page }) => {
    await page.goto('http://localhost:3000/posts')

    // 카테고리 필터 요소들 확인
    const categoryItems = page.locator('.category-item')
    const categoryCount = await categoryItems.count()
    expect(categoryCount).toBeGreaterThan(0)

    // 첫 번째 카테고리 클릭 (전체가 아닌)
    if (categoryCount > 1) {
      await categoryItems.nth(1).click()

      // 활성 상태 확인
      await expect(categoryItems.nth(1)).toHaveClass(/active/)
    }
  })
})

// 성능 벤치마크 테스트
test.describe('성능 벤치마크', () => {
  test('번들 크기 확인', async ({ page }) => {
    await page.goto('http://localhost:3000')

    const bundleSize = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'))
      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))

      const resources = performance.getEntriesByType('resource')
      let totalSize = 0

      scripts.forEach(script => {
        const resource = resources.find(r => r.name.includes(script.src))
        if (resource) totalSize += resource.transferSize
      })

      styles.forEach(style => {
        const resource = resources.find(r => r.name.includes(style.href))
        if (resource) totalSize += resource.transferSize
      })

      return Math.round(totalSize / 1024) // KB
    })

    console.log(`📦 총 번들 크기: ${bundleSize}KB`)

    // 번들 크기는 1MB (1024KB) 이하여야 함
    expect(bundleSize).toBeLessThan(1024)
  })

  test('메모리 사용량 확인', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle')

    const memoryUsage = await page.evaluate(() => {
      if ('memory' in performance) {
        return {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024 * 100) / 100,
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024 * 100) / 100
        }
      }
      return null
    })

    if (memoryUsage) {
      console.log(`🧠 메모리 사용량: ${memoryUsage.used}MB / ${memoryUsage.total}MB`)

      // 메모리 사용량은 50MB 이하여야 함
      expect(memoryUsage.used).toBeLessThan(50)
    }
  })
})
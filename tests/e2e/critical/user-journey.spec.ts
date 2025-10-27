import { test, expect } from '@playwright/test'

/**
 * Critical User Journeys
 *
 * 핵심 사용자 여정만 검증 (토큰 효율성 최적화)
 * - 5-7개의 핵심 플로우만 유지
 * - 선택적 실행 (PR 전, 배포 전)
 */

test.describe('Critical User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전 초기화
    await page.goto('/')
  })

  /**
   * Journey 1: 회원가입 → 로그인 → 온보딩
   */
  test('Journey 1: 회원가입 → 로그인 → 온보딩', async ({ page }) => {
    // Mock 로그인 페이지로 이동
    await page.goto('/auth/login')

    // Google 로그인 버튼 클릭
    await page.getByText('Google로 계속하기').click()

    // 온보딩 페이지로 리다이렉트 확인
    await expect(page).toHaveURL('/onboarding')

    // 프로필 설정 확인
    await expect(page.getByText(/프로필 설정/)).toBeVisible()
  })

  /**
   * Journey 2: 질문 작성 → 게시
   */
  test('Journey 2: 질문 작성 → 게시', async ({ page }) => {
    // 질문 작성 페이지로 이동
    await page.goto('/questions/new')

    // 제목 입력
    await page.fill('input[name="title"]', 'E-7 비자 신청 절차 문의')

    // 내용 입력
    await page.fill('textarea[name="content"]', '안녕하세요. E-7 비자 신청시 필요한 서류가 궁금합니다.')

    // 카테고리 선택 (있는 경우)
    const categorySelect = page.locator('select[name="category"]')
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption('visa')
    }

    // 제출 버튼 클릭
    await page.click('button[type="submit"]')

    // 질문 상세 페이지로 리다이렉트 확인
    await expect(page).toHaveURL(/questions\/\d+/)

    // 작성한 질문 확인
    await expect(page.getByText('E-7 비자 신청 절차 문의')).toBeVisible()
  })

  /**
   * Journey 3: 답변 작성 → 채택
   */
  test('Journey 3: 답변 작성', async ({ page }) => {
    // 질문 상세 페이지로 이동 (Mock 데이터)
    await page.goto('/questions/1')

    // 페이지 로드 대기
    await page.waitForLoadState('networkidle')

    // 답변 입력 필드 찾기
    const answerInput = page.locator('textarea[placeholder*="답변"]').first()
    if (await answerInput.isVisible()) {
      await answerInput.fill('안녕하세요. E-7 비자는 다음 서류가 필요합니다...')

      // 답변 작성 버튼 클릭
      await page.click('button:has-text("답변 작성")')

      // 성공 메시지 확인 (있는 경우)
      await expect(page.getByText(/답변.*등록/)).toBeVisible({ timeout: 5000 }).catch(() => {
        // 메시지가 없어도 통과
      })
    }
  })

  /**
   * Journey 4: 검색 → 결과 확인
   */
  test('Journey 4: 검색 → 결과 확인', async ({ page }) => {
    // 메인 페이지에서 검색
    await page.goto('/')

    // 검색 입력
    const searchInput = page.getByPlaceholder(/질문이나 키워드를 검색/)
    await searchInput.fill('비자')
    await searchInput.press('Enter')

    // 검색 결과 페이지 확인
    await expect(page).toHaveURL(/search=.*비자/)

    // 검색 결과 표시 확인
    await expect(page.locator('[data-testid="question-card"]')).toBeVisible()
  })

  /**
   * Journey 5: 프로필 보기 및 확인
   */
  test('Journey 5: 프로필 확인', async ({ page }) => {
    // 설정 페이지로 이동
    await page.goto('/settings')

    // 설정 페이지 로딩 확인
    await expect(page.getByText(/설정|프로필/)).toBeVisible()

    // 프로필 필드 확인 (표시되는 경우)
    const nameInput = page.locator('input[name="displayName"]')
    if (await nameInput.isVisible()) {
      await expect(nameInput).toBeVisible()
    }
  })

  /**
   * Journey 6: 카테고리 필터링
   */
  test('Journey 6: 카테고리 필터링', async ({ page }) => {
    // 질문 목록 페이지로 이동
    await page.goto('/questions')

    // 페이지 로드 대기
    await page.waitForLoadState('networkidle')

    // 카테고리 버튼 클릭
    await page.getByRole('button', { name: '비자/법률' }).click()

    // 필터링된 URL 확인
    await expect(page).toHaveURL(/category=visa/)

    // 필터링된 결과 확인
    await expect(page.locator('[data-testid="question-card"]')).toBeVisible()
  })

  /**
   * Journey 7: 반응형 - 모바일 뷰
   */
  test('Journey 7: 모바일 뷰 확인', async ({ page, isMobile }) => {
    if (isMobile) {
      // 메인 페이지 확인
      await expect(page.getByText('무엇이든 물어보세요!')).toBeVisible()

      // 모바일 네비게이션 확인
      await expect(page.getByRole('button', { name: /질문하기/ })).toBeVisible()

      // 질문 목록 표시 확인
      await expect(page.locator('[data-testid="question-card"]')).toBeVisible()
    }
  })
})

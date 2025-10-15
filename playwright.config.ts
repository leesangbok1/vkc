import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright 토큰 최적화 설정
 *
 * 전략:
 * - 순차 실행으로 출력 제어
 * - 실패시만 미디어 저장
 * - 리포팅 최소화
 * - Critical Path만 실행
 */
export default defineConfig({
  testDir: './tests/e2e',

  // 🎯 토큰 효율성 최적화
  fullyParallel: false,        // 순차 실행으로 출력 제어
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,                  // 병렬 실행 최소화 (토큰 절약)

  // ⏱️ 타임아웃 설정
  timeout: 30000,              // 테스트당 30초
  expect: {
    timeout: 10000,            // expect당 10초
  },

  // 📊 리포팅 최소화
  reporter: [
    ['list'],                   // 간단한 리스트 출력
    ['html', {
      open: 'never',            // 자동으로 열지 않음
      outputFolder: 'playwright-report'
    }]
  ],

  use: {
    baseURL: 'http://localhost:3000',

    // 🎥 미디어 최소화 (토큰 절약)
    trace: 'retain-on-failure',    // 실패시만 trace
    screenshot: 'only-on-failure', // 실패시만 스크린샷
    video: 'retain-on-failure',    // 실패시만 비디오

    // ⚡ 성능 최적화
    actionTimeout: 10000,
    navigationTimeout: 30000,

    // 🌐 기본 설정
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
  },

  // 🖥️ 프로젝트 설정 (크로스 브라우저는 선택적)
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },

    // 크로스 브라우저 테스트는 주석 처리 (필요시 활성화)
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // 모바일 테스트 (선택적)
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // 🚀 개발 서버 자동 시작
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,            // 서버 시작 대기 2분
  },
})

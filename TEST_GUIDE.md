# VietKConnect Test Strategy Guide

## 📊 현재 테스트 인프라

### 기존 구조
- **Unit/Integration**: Vitest + React Testing Library ✅
- **E2E**: Playwright ⚠️ (토큰 소비 문제)
- **커버리지**: 5 unit tests + 2 E2E suites

### 테스트 파일 구조
```
tests/
├── components/          # Unit Tests (Vitest)
│   ├── Header.test.tsx
│   ├── LoginModal.test.tsx
│   └── QuestionCard.test.tsx
├── lib/                 # Util Tests (Vitest)
│   ├── utils.test.ts
│   └── validation.test.ts
└── e2e/                 # E2E Tests (Playwright)
    ├── home.spec.ts
    └── questions.spec.ts
```

---

## 🎯 최적화된 테스트 전략 (3-Layer Pyramid)

### Layer 1: Unit Tests (90% 커버리지) - Vitest
**목적**: 빠른 피드백, 저렴한 비용, 높은 신뢰도
**토큰**: ~500/실행

```typescript
// tests/lib/auth.test.ts
describe('Authentication Utils', () => {
  it('validates JWT token format', () => {
    expect(isValidToken('valid.jwt.token')).toBe(true)
  })
})

// tests/components/QuestionCard.test.tsx
describe('QuestionCard', () => {
  it('renders question with trust badge', () => {
    render(<QuestionCard {...mockProps} />)
    expect(screen.getByTestId('trust-badge')).toBeInTheDocument()
  })
})
```

**실행 명령**:
```bash
npm run test              # 전체 실행
npm run test:watch        # 개발 중 watch
npm run test:coverage     # 커버리지 확인
```

---

### Layer 2: Integration Tests (API + DB) - Vitest
**목적**: 모듈 간 통합 검증
**토큰**: ~2K/실행

```typescript
// tests/api/questions.test.ts
describe('Questions API', () => {
  it('creates question with valid data', async () => {
    const res = await fetch('/api/questions', {
      method: 'POST',
      body: JSON.stringify(validQuestion)
    })
    expect(res.status).toBe(201)
  })
})
```

**추가 필요 디렉토리**:
```
tests/
├── api/            # API 통합 테스트
├── services/       # Service 레이어 테스트
└── integration/    # 크로스 모듈 테스트
```

---

### Layer 3: E2E Tests (Critical Paths) - Playwright
**목적**: 핵심 사용자 여정만 검증
**토큰**: ~10-30K/실행 (⚠️ 선택적 실행)

#### 🎯 Critical User Journeys (5-7개만 유지)

```typescript
// tests/e2e/critical/user-journey.spec.ts

test.describe('Critical User Journeys', () => {
  test('Journey 1: 회원가입 → 로그인', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByText('Google로 계속하기').click()
    await expect(page).toHaveURL('/onboarding')
  })

  test('Journey 2: 질문 작성 → 게시', async ({ page }) => {
    await page.goto('/questions/new')
    await page.fill('[name="title"]', '테스트 질문')
    await page.fill('[name="content"]', '질문 내용')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/questions\/\d+/)
  })

  test('Journey 3: 답변 작성 → 채택', async ({ page }) => {
    await page.goto('/questions/1')
    await page.fill('[name="answer"]', '답변 내용')
    await page.click('button:has-text("답변 작성")')
    await expect(page.getByText('답변이 등록되었습니다')).toBeVisible()
  })

  test('Journey 4: 검색 → 결과 확인', async ({ page }) => {
    await page.goto('/')
    await page.fill('[placeholder*="검색"]', '비자')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/search=.*비자/)
  })

  test('Journey 5: 프로필 수정', async ({ page }) => {
    await page.goto('/settings')
    await page.fill('[name="displayName"]', '새이름')
    await page.click('button:has-text("저장")')
    await expect(page.getByText('프로필이 업데이트')).toBeVisible()
  })
})
```

---

## ⚙️ Playwright 토큰 최적화 설정

### playwright.config.ts (생성 필요)

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',

  // 🎯 토큰 효율성 최적화
  fullyParallel: false,        // 순차 실행으로 출력 제어
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,                  // 병렬 실행 최소화

  // 📊 리포팅 최소화
  reporter: [
    ['list'],                   // 간단한 리스트 출력
    ['html', { open: 'never' }] // HTML은 저장만
  ],

  use: {
    baseURL: 'http://localhost:3000',

    // 🎥 미디어 최소화
    trace: 'retain-on-failure',    // 실패시만 trace
    screenshot: 'only-on-failure', // 실패시만 스크린샷
    video: 'retain-on-failure',    // 실패시만 비디오

    // ⚡ 성능 최적화
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 개발 서버 자동 시작
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## 📋 실행 전략

### 개발 중 (로컬)
```bash
# 기본: Unit + Integration만
npm run test:watch

# 필요시: 특정 E2E만
npm run test:e2e -- tests/e2e/critical/user-journey.spec.ts

# 커버리지 확인
npm run test:coverage
```

### PR 전
```bash
# Unit + Integration 전체
npm run test

# Critical E2E만 (선택적)
npm run test:e2e -- --grep "Critical"
```

### CI/CD Pipeline
```yaml
# .github/workflows/test.yml
jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test

  e2e-tests:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - run: npm run test:e2e -- tests/e2e/critical/
```

---

## 🎯 테스트 커버리지 목표

```
Target Coverage:
├── Unit Tests:        80-90%  (Components, Utils, Libs)
├── Integration Tests: 60-70%  (API, Services)
└── E2E Tests:         5-7개   (Critical User Journeys)

Total Execution Time:
├── Unit:              < 30초
├── Integration:       < 2분
└── E2E:               < 5분 (선택적)
```

---

## 🔄 마이그레이션 플랜

### Phase 1: Unit Test 강화
```bash
# 추가 필요한 테스트
tests/
├── hooks/           # Custom hooks 테스트
├── utils/           # 유틸 함수 확장
└── services/        # Service 레이어
```

### Phase 2: E2E 최적화
```bash
# E2E 재구성
tests/e2e/
├── critical/        # 핵심 여정 (5-7개)
├── regression/      # 회귀 테스트 (선택적)
└── archived/        # 기존 테스트 보관
    ├── home.spec.ts
    └── questions.spec.ts
```

### Phase 3: Integration 추가
```bash
# API 통합 테스트
tests/
├── api/            # API 엔드포인트
└── integration/    # 모듈 통합
```

---

## 💡 Best Practices

### ✅ DO
- Unit 테스트로 로직 검증 (빠름, 저렴)
- Integration으로 API/DB 검증
- E2E는 Critical Path만 (비용 고려)
- CI에서 E2E는 선택적 실행
- 실패시만 스크린샷/비디오 저장

### ❌ DON'T
- 단순 렌더링을 E2E로 테스트
- 모든 UI를 E2E로 검증
- E2E를 매번 전체 실행
- 불필요한 비디오/스크린샷 저장
- 병렬 실행으로 출력 증폭

---

## 📊 토큰 효율성 비교

```
Before (E2E 중심):
├── E2E: 20 tests × 15K tokens = 300K tokens
└── Unit: 5 tests × 500 tokens = 2.5K tokens
Total: ~302K tokens

After (Pyramid):
├── Unit: 50 tests × 500 tokens = 25K tokens
├── Integration: 15 tests × 2K = 30K tokens
└── E2E: 7 tests × 15K tokens = 105K tokens
Total: ~160K tokens (47% 감소)

+ 실행 속도 10배 개선
+ 피드백 사이클 단축
+ 유지보수 비용 감소
```

---

## 🚀 Quick Start

```bash
# 1. Playwright 설정 생성
# (아래 명령 실행)

# 2. Unit 테스트 실행
npm run test:watch

# 3. Critical E2E만 실행 (필요시)
npm run test:e2e -- tests/e2e/critical/

# 4. 전체 테스트 (PR 전)
npm run test:all
```

---

## 📚 Resources

- [Vitest 문서](https://vitest.dev)
- [React Testing Library](https://testing-library.com/react)
- [Playwright 최적화](https://playwright.dev/docs/test-configuration)
- [Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html)

---
---

# 🧪 페이지 플로우 매뉴얼 테스트 가이드

## 📌 로그인 상태별 UI 변화

### 🔓 로그인 안됨 (첫 방문 사용자)
- **헤더**: 로그인 아이콘 (↪️) 표시
- **메인 영역**:
  - "VietKConnect에 오신 것을 환영합니다! 🎉" 메시지
  - "🚀 Google로 시작하기" 버튼
- **하단**: 질문 목록 (Mock 데이터)

### 🔒 로그인 완료
- **헤더**: 사용자 프로필 아바타 (원형 그라데이션, 이름 첫 글자)
- **메인 영역**:
  - 사용자 아바타 + 질문 입력창
  - "What do you want to ask or share?" placeholder
  - ❓ Ask / ✏️ Answer / 📝 Post 버튼
- **하단**: 질문 목록

---

## 📋 테스트 준비

### 1️⃣ localStorage 초기화
브라우저 개발자 도구 콘솔에서 실행:
```javascript
localStorage.clear()
location.reload()
```

## 🚀 첫 방문 사용자 플로우 테스트

### Step 1: 메인 페이지 (로그인 안됨)
```
URL: http://localhost:3000/
```

**기대 결과:**
- ✅ **헤더**: 로그인 아이콘 (↪️) 표시
- ✅ **메인 영역**: "VietKConnect에 오신 것을 환영합니다! 🎉" 메시지 표시
- ✅ **메인 영역**: "🚀 Google로 시작하기" 버튼 표시
- ✅ **하단**: 질문 목록 표시 (Mock 데이터)

**콘솔 로그:**
```
❌ 로그인 안됨
```

---

### Step 2: 로그인 페이지로 이동
```
클릭: "🚀 Google로 시작하기" 버튼
URL: http://localhost:3000/auth/login
```

**기대 결과:**
- ✅ "VietKConnect에 오신걸 환영합니다" 헤더
- ✅ "Google로 계속하기" 버튼 표시
- ✅ 특징 목록 표시 (비자, 취업, 법률 등)

---

### Step 3: Mock 로그인
```
클릭: "Google로 계속하기" 버튼
```

**기대 결과:**
- ✅ 즉시 온보딩 페이지로 이동
- ✅ URL: http://localhost:3000/onboarding

**콘솔 로그:**
```
🎯 Google 로그인 버튼 클릭!
✅ Mock 로그인 성공!
→ 프로필 설정 페이지로 이동
```

---

### Step 4: 프로필 설정 (온보딩)
```
URL: http://localhost:3000/onboarding
```

**기대 결과:**
- ✅ "프로필 설정" 헤더
- ✅ "1 / 4 단계" 진행 바

**단계별 입력:**

**4-1. 거주지 선택**
- 🇰🇷 한국 또는 🌍 한국 외 선택
- "다음" 버튼 클릭 → 2 / 4 단계

**4-2. 성별 선택**
- 👨 남성 또는 👩 여성 선택
- "다음" 버튼 클릭 → 3 / 4 단계

**4-3. 연령대 선택**
- ~20세 / 20대 / 30대 / 40세+ 중 선택
- "다음" 버튼 클릭 → 4 / 4 단계

**4-4. 현재 상황 선택**
- 🎓 학생 / 💼 직장인 / 👤 기타 중 선택
- "완료" 버튼 클릭

**콘솔 로그:**
```
✅ 프로필 설정 완료: {residence: "korea", gender: "male", age: "20s", category: "student"}
→ 메인 페이지로 이동
```

---

### Step 5: 메인 페이지 (로그인 완료)
```
URL: http://localhost:3000/
```

**기대 결과:**
- ✅ **헤더**: 사용자 프로필 아바타 (원형 그라데이션 박스, "T" 표시)
- ✅ **메인 영역**: 사용자 아바타 + 질문 입력창 표시
- ✅ **메인 영역**: "What do you want to ask or share?" placeholder
- ✅ **메인 영역**: ❓ Ask / ✏️ Answer / 📝 Post 버튼 표시
- ✅ **하단**: 질문 목록 표시

**콘솔 로그:**
```
✅ 로그인 상태 확인: Test User
```

---

## 🔄 페이지 새로고침 테스트

### 메인 페이지 새로고침
```
브라우저 새로고침 (F5 또는 Cmd+R)
```

**기대 결과:**
- ✅ 로그인 상태 유지 (localStorage 덕분)
- ✅ **헤더**: 프로필 아바타 표시 유지
- ✅ **메인 영역**: 질문 입력창 + Ask/Answer/Post 버튼들 표시
- ✅ 온보딩으로 리다이렉트 안됨

---

## 🧹 로그아웃 테스트

### localStorage 초기화
브라우저 개발자 도구 콘솔에서:
```javascript
localStorage.clear()
location.reload()
```

**기대 결과:**
- ✅ **헤더**: 로그인 아이콘 (↪️)으로 돌아감
- ✅ **메인 영역**: "환영합니다" 메시지로 돌아감
- ✅ **메인 영역**: "🚀 Google로 시작하기" 버튼 표시
- ✅ **메인 영역**: 질문 입력창 + Ask/Answer/Post 버튼 사라짐

---

## 📊 localStorage 상태 확인

### 로그인 전
```javascript
console.log('Session:', localStorage.getItem('mock_session'))
console.log('User:', localStorage.getItem('mock_user'))
console.log('Onboarded:', localStorage.getItem('vietkconnect_onboarded'))
```
**결과:**
```
Session: null
User: null
Onboarded: null
```

### 로그인 후, 온보딩 전
```javascript
console.log('Session:', localStorage.getItem('mock_session'))
console.log('User:', localStorage.getItem('mock_user'))
console.log('Onboarded:', localStorage.getItem('vietkconnect_onboarded'))
```
**결과:**
```
Session: "true"
User: "{\"id\":\"mock-user-id\",\"email\":\"test@vietkconnect.com\",\"name\":\"Test User\"}"
Onboarded: null
```

### 온보딩 완료 후
```javascript
console.log('Session:', localStorage.getItem('mock_session'))
console.log('User:', localStorage.getItem('mock_user'))
console.log('Onboarded:', localStorage.getItem('vietkconnect_onboarded'))
console.log('Profile:', localStorage.getItem('vietkconnect_profile'))
```
**결과:**
```
Session: "true"
User: "{\"id\":\"mock-user-id\",\"email\":\"test@vietkconnect.com\",\"name\":\"Test User\"}"
Onboarded: "true"
Profile: "{\"residence\":\"korea\",\"gender\":\"male\",\"age\":\"20s\",\"category\":\"student\",\"completedAt\":\"2025-...\"}"
```

---

## ✅ 성공 체크리스트

- [ ] Step 1: 메인 페이지에서 "환영합니다" 메시지 확인
- [ ] Step 2: "Google로 시작하기" 클릭 → 로그인 페이지 이동
- [ ] Step 3: "Google로 계속하기" 클릭 → 온보딩 페이지 이동
- [ ] Step 4: 4단계 프로필 설정 완료
- [ ] Step 5: 메인 페이지에서 질문 입력창 + 버튼 표시
- [ ] 새로고침 시 로그인 상태 유지
- [ ] localStorage.clear() 후 로그아웃 상태로 돌아감

---

## 🐛 문제 발생 시

### 페이지가 멈춤
```javascript
// 콘솔에서 실행
console.log('Current URL:', window.location.href)
console.log('localStorage:', {...localStorage})
```

### 무한 리다이렉트
```javascript
// localStorage 초기화 후 재시작
localStorage.clear()
location.href = 'http://localhost:3000'
```

### 버튼이 안 보임
- 브라우저 캐시 삭제
- Hard Refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)

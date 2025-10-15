# 🎯 Prototype-to-Next.js Integration Plan - Expert Panel Review

**분석일**: 2025-10-10
**분석 방법**: /sc:spec-panel (Business Panel Experts)
**전문가 패널**: Christensen, Porter, Drucker, Godin, Kim & Mauborgne, Collins, Taleb, Meadows, Doumont
**분석 대상**: PROTOTYPE_TO_NEXTJS_INTEGRATION_PLAN.md (원본)

---

## 🧩 종합 분석 결과

### ⚡ 핵심 발견사항

**🔴 Critical Issues (즉시 해결 필요)**
1. **측정 가능한 기준 부재** (Christensen, Drucker)
   - "완료"의 기준이 모호함
   - 재사용률, 테스트 커버리지 등 구체적 수치 없음

2. **실행 가능한 시나리오 부재** (Meadows, Collins)
   - Given/When/Then 시나리오 없음
   - 실제 검증 방법 불명확

3. **테스트 전략 부재** (Taleb, Doumont)
   - 단위/통합/E2E 테스트 계층 구분 없음
   - 품질 보증 메커니즘 부재

**🟡 Important Improvements (개선 권장)**
1. **병렬 작업 전략 미흡** (Porter, Kim/Mauborgne)
   - 순차 작업만 제시, 병렬 가능성 간과
   - 개발 속도 최적화 기회 상실

2. **실패 시나리오 부재** (Taleb, Meadows)
   - 예외 상황 대응 계획 없음
   - 롤백 전략 미흡

---

## 📊 SMART Criteria 분석

### 전문가 패널 평가

**📚 CHRISTENSEN (Disruption Theory)**
```yaml
문제_발견:
  - "Phase 완료" 기준이 Jobs-to-be-Done 관점 부재
  - 사용자가 "언제" 이 기능을 "고용"하는지 불명확

권장_개선:
  Specific:
    - "12개 페이지 마이그레이션" → "12개 페이지 중 10개 이상에서 공통 컴포넌트 재사용"
    - "공통 요소 추출" → "Header, MobileNav, TrustBadge 3개 핵심 컴포넌트"

  Measurable:
    - 재사용률: ≥ 80% (12개 페이지 중 10개 사용)
    - CSS 중복 제거: ≥ 70% (common.css 1900줄 → 500줄)
    - 타입 안정성: TypeScript 오류 0개
```

**📊 PORTER (Competitive Strategy)**
```yaml
문제_발견:
  - 경쟁 우위 요소 (4-tier 권한 시스템) 검증 방법 부재
  - 차별화 포인트의 구현 완성도 측정 불가

권장_개선:
  Achievable:
    - 기존 프로토타입 100% 완성도 확인
    - 3일 내 완료 가능한 작업량 검증
    - 일일 8시간 작업 기준 현실성 평가

  Relevant:
    - 4-tier 차별화 → 권한별 UI 자동 적용 메커니즘
    - 경쟁 우위 확보 → 베트남인 커뮤니티 대비 신뢰도 보장
```

**🧭 DRUCKER (Management Fundamentals)**
```yaml
문제_발견:
  - "무엇을 해야 하는가?" 명확하지만
  - "왜 해야 하는가?"와 "어떻게 측정하는가?" 부족

권장_개선:
  Time-bound:
    - Day 1: common.css 분석 → CSS Variables 추출 (8시간)
    - Day 2: Header 컴포넌트 구현 + 4-tier 메뉴 (8시간)
    - Day 3: Unit 테스트 작성 (커버리지 80% 달성)

  Measurable (경영 지표):
    - 개발 속도 향상: 공통 컴포넌트 재사용 → 반복 작업 70% 감소
    - 유지보수성: 단일 소스 수정 → 12개 페이지 자동 반영
```

---

## 🎭 Given/When/Then Scenarios

### 전문가 패널 권장 시나리오

**💬 GODIN (Purple Cow - Remarkability)**
```gherkin
Scenario: 4-tier 권한 시스템의 차별화 (Remarkable Feature)

Given 베트남인 사용자가 플랫폼에 처음 접속하고
And 다른 커뮤니티는 익명 또는 단일 권한만 제공하는 상황에서
When 사용자가 질문 목록을 보면
Then Guest(회색), User(파랑), Expert(초록), Admin(주황) 배지를 즉시 구분할 수 있고
And 전문가의 답변이 시각적으로 신뢰할 수 있게 표시되며
Then "이 플랫폼은 다르다"라는 첫인상을 받는다

Measurable Outcome:
  - 첫 방문 사용자 중 4-tier 시스템 인지율 ≥ 80%
  - "다른 커뮤니티와 차이점" 질문에 "전문가 배지" 언급률 ≥ 60%
```

**🌊 KIM & MAUBORGNE (Blue Ocean Strategy)**
```gherkin
Scenario: 공통 컴포넌트 재사용을 통한 가치 혁신 (Value Innovation)

Given 12개 프로토타입 페이지에 동일한 헤더가 반복되고
And 각 페이지마다 헤더를 개별 구현하면 120시간 소요되는 상황에서
When Phase 0에서 Header 컴포넌트를 공통으로 추출하면
Then 한 번의 구현(8시간)으로 12개 페이지 모두 적용되고
And 헤더 수정 시 모든 페이지에 자동 반영되며
Then 개발 시간 112시간 절감 (93% 감소) + 일관성 100% 보장

Measurable Outcome:
  - 개발 시간: 120시간 → 8시간 (93% 감소)
  - 재사용률: ≥ 80% (12개 중 10개 페이지)
  - CSS 중복: 1900줄 → 500줄 (74% 감소)
```

**🚀 COLLINS (Good to Great - Flywheel)**
```gherkin
Scenario: 점진적 품질 향상 플라이휠 (Cumulative Quality)

Given Phase 0에서 공통 컴포넌트 3개를 추출하고
And 각 컴포넌트에 Unit 테스트를 작성하여 80% 커버리지를 달성하면
When Phase 1에서 이 컴포넌트들을 재사용하여 페이지를 구현할 때
Then 이미 테스트된 컴포넌트로 인해 버그 발생률이 70% 감소하고
And 절약된 디버깅 시간으로 추가 기능 구현이 가능하며
Then Phase 2-3에서 더 빠른 속도로 완성도 높은 페이지 구현 가능

Measurable Outcome:
  - Phase 0 테스트 커버리지: ≥ 80%
  - Phase 1 버그 발생률: < 30% (Phase 0 대비)
  - Phase 2-3 개발 속도: Phase 1 대비 50% 향상
```

**🛡️ TALEB (Antifragile - Robustness)**
```gherkin
Scenario: 실패 시나리오와 복원력 (Failure Scenarios)

Given Phase 1에서 Google OAuth 구현 중 Supabase 연결 오류가 발생하고
When 에러 핸들링이 구현되어 있지 않으면
Then 사용자는 빈 화면만 보고 플랫폼을 떠나며
And 로그인 성공률이 50% 이하로 떨어진다

But Given 에러 핸들링이 구현되어 있으면
When Supabase 연결 오류 발생 시
Then 사용자에게 명확한 에러 메시지와 재시도 옵션을 제공하고
And 로컬 스토리지에 입력 데이터를 임시 저장하며
Then 연결 복구 후 자동으로 로그인 재시도

Measurable Outcome:
  - 에러 핸들링 커버리지: 100% (모든 API 호출)
  - 로그인 성공률: ≥ 95% (재시도 포함)
  - 사용자 이탈률: < 10% (에러 발생 시)
```

---

## 🧪 3-Layer Testing Strategy

### 전문가 패널 권장 구조

**🕸️ MEADOWS (Systems Thinking - Testing Pyramid)**
```yaml
Testing_Pyramid_구조:
  Layer_3_E2E: 10%
    - 목적: 핵심 사용자 플로우 검증
    - 도구: Playwright
    - 시나리오:
      1. Google OAuth → 홈 → 질문 작성 → 답변 → 채택
      2. Guest → User → Expert 권한 상승 플로우
      3. 모바일 반응형 (< 768px) 네비게이션 검증

  Layer_2_Integration: 30%
    - 목적: API + 컴포넌트 통합 검증
    - 도구: Jest + React Testing Library
    - 테스트:
      1. Header + MobileNav 동시 렌더링
      2. TrustBadge + 권한 시스템 통합
      3. Question API → QuestionList 컴포넌트 연동

  Layer_1_Unit: 60%
    - 목적: 개별 함수/컴포넌트 단위 검증
    - 도구: Jest + React Testing Library
    - 타겟: 커버리지 ≥ 80%
    - 우선순위:
      1. 유틸리티 함수 (lib/utils/)
      2. Custom Hooks (lib/hooks/)
      3. React 컴포넌트 (components/)

시스템_사고_관점:
  - 피라미드 상단(E2E)은 비용이 높지만 신뢰도 최고
  - 피라미드 하단(Unit)은 비용이 낮고 빠른 피드백
  - 균형: 60-30-10 비율로 효율성과 신뢰성 확보
```

**✏️ DOUMONT (Communication Clarity - Test Naming)**
```typescript
// ❌ 나쁜 테스트명 (불명확)
test('it works', () => { ... })
test('header test', () => { ... })

// ✅ 좋은 테스트명 (명확하고 구체적)
test('Header displays user role badge when user is logged in', () => { ... })
test('MobileBottomNav hides on desktop screens wider than 768px', () => { ... })
test('TrustBadge shows correct color for each tier: guest(gray), user(blue), expert(green), admin(orange)', () => { ... })

명확성_원칙:
  - 테스트명만 읽어도 무엇을 검증하는지 즉시 파악
  - Given-When-Then 구조 반영
  - 실패 시 어떤 기능이 깨졌는지 명확히 전달
```

---

## 🛡️ Executable Test Examples

### 전문가 패널 권장 실행 가능한 테스트

**Layer 1: Unit Test - TrustBadge Component**
```typescript
// components/trust/__tests__/TrustBadge.test.tsx
import { render } from '@testing-library/react'
import { TrustBadge } from '../TrustBadge'

describe('TrustBadge Component', () => {
  test('GUEST tier displays gray color and guest icon', () => {
    const user = { role: 'guest', trust_score: 0 }
    const { container } = render(<TrustBadge user={user} />)

    const badge = container.querySelector('.trust-badge')
    expect(badge).toHaveClass('bg-gray-100')
    expect(badge).toHaveTextContent('👤')
    expect(badge).toHaveTextContent('게스트')
  })

  test('EXPERT tier displays green color, expert icon, and trust score', () => {
    const user = { role: 'expert', trust_score: 85 }
    const { container, getByText } = render(<TrustBadge user={user} />)

    const badge = container.querySelector('.trust-badge')
    expect(badge).toHaveClass('bg-green-100')
    expect(badge).toHaveTextContent('⭐')
    expect(badge).toHaveTextContent('전문가')
    expect(getByText('(85점)')).toBeInTheDocument()
  })

  test('All 4 tiers render with correct colors', () => {
    const tiers = [
      { role: 'guest', color: 'bg-gray-100' },
      { role: 'user', color: 'bg-blue-100' },
      { role: 'expert', color: 'bg-green-100' },
      { role: 'admin', color: 'bg-orange-100' }
    ]

    tiers.forEach(({ role, color }) => {
      const user = { role, trust_score: 50 }
      const { container } = render(<TrustBadge user={user} />)
      expect(container.querySelector('.trust-badge')).toHaveClass(color)
    })
  })
})

// Target: 커버리지 ≥ 80%
// Measurable: npm run test:coverage
// Expected: TrustBadge.tsx - 85% coverage
```

**Layer 2: Integration Test - Header + Auth**
```typescript
// __tests__/integration/header-auth.test.tsx
import { render, waitFor } from '@testing-library/react'
import { Header } from '@/components/shared/Header'
import { mockSupabase } from '@/lib/__mocks__/supabase'

describe('Header + Auth Integration', () => {
  test('Header displays login button when user is not authenticated', () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } })

    const { getByRole } = render(<Header />)
    expect(getByRole('button', { name: '로그인' })).toBeInTheDocument()
  })

  test('Header displays user name and role badge when authenticated', async () => {
    const mockSession = {
      user: {
        id: '1',
        email: 'test@example.com',
        user_metadata: { name: '김민준', role: 'expert' }
      }
    }
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } })

    const { getByText } = render(<Header />)

    await waitFor(() => {
      expect(getByText('김민준')).toBeInTheDocument()
      expect(getByText('⭐')).toBeInTheDocument() // expert badge
    })
  })

  test('Header menu changes based on user role (4-tier)', async () => {
    const roles = ['guest', 'user', 'expert', 'admin']

    for (const role of roles) {
      const mockSession = {
        user: { id: '1', email: 'test@example.com', user_metadata: { role } }
      }
      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } })

      const { queryByText } = render(<Header />)

      await waitFor(() => {
        if (role === 'admin') {
          expect(queryByText('관리자 대시보드')).toBeInTheDocument()
        } else if (role === 'expert') {
          expect(queryByText('전문가 대시보드')).toBeInTheDocument()
        }
      })
    }
  })
})

// Target: API + Component 통합 검증
// Measurable: 4-tier 권한 시스템 100% 동작 확인
```

**Layer 3: E2E Test - Complete Login Flow**
```typescript
// e2e/auth-flow.spec.ts
import { test, expect } from '@playwright/test'

test('Complete Google OAuth login flow with 4-tier role assignment', async ({ page, context }) => {
  // Given: 사용자가 로그인 페이지에 접속
  await page.goto('/auth/login')
  await expect(page.locator('h1')).toContainText('로그인')

  // When: Google로 로그인 버튼 클릭
  const [popup] = await Promise.all([
    context.waitForEvent('page'),
    page.click('button:has-text("Google로 로그인")')
  ])

  // Then: Google OAuth 팝업이 열림
  await expect(popup).toHaveURL(/accounts\.google\.com/)

  // When: Google 계정 선택 (Mock)
  // (실제 E2E에서는 test Google account 사용)

  // Then: OAuth 콜백 후 홈페이지로 리다이렉트
  await page.waitForURL('/', { timeout: 10000 })

  // Then: 헤더에 사용자 이름과 USER 배지 표시 (초기 role)
  await expect(page.locator('.header .user-name')).toBeVisible()
  await expect(page.locator('.header .trust-badge')).toHaveClass(/bg-blue-100/) // USER role

  // When: 프로필 페이지로 이동하여 전문가 인증 신청
  await page.click('a:has-text("프로필")')
  await page.click('button:has-text("전문가 인증 신청")')

  // When: 증빙서류 업로드 및 신청
  await page.setInputFiles('input[type="file"]', './fixtures/certificate.pdf')
  await page.fill('[name="specialty"]', '비자/이민')
  await page.click('button:has-text("신청")')

  // Then: 신청 완료 메시지 표시
  await expect(page.locator('text=인증 신청이 완료되었습니다')).toBeVisible()

  // (관리자 승인 후 EXPERT role로 변경 - 별도 테스트)
})

test('4-tier permission system visual regression', async ({ page }) => {
  const roles = ['guest', 'user', 'expert', 'admin']

  for (const role of roles) {
    // Setup: role별 사용자로 로그인
    await page.goto(`/test/login?role=${role}`)
    await page.goto('/')

    // Visual Regression: 헤더 스크린샷 비교
    await expect(page.locator('.header')).toHaveScreenshot(`header-${role}.png`, {
      threshold: 0.2
    })

    // 권한별 메뉴 항목 검증
    if (role === 'admin') {
      await expect(page.locator('text=관리자 대시보드')).toBeVisible()
    } else if (role === 'expert') {
      await expect(page.locator('text=전문가 대시보드')).toBeVisible()
    } else if (role === 'guest') {
      await expect(page.locator('button:has-text("로그인")')).toBeVisible()
    }
  }
})

// Measurable Outcomes:
// - 로그인 성공률: ≥ 95%
// - OAuth 콜백 처리 시간: < 3초
// - 4-tier 배지 시각적 일관성: 100%
```

---

## 📋 Implementation Checklist (SMART + Given/When/Then)

### Phase 0: 공통 요소 추출

**✅ Specific (구체적)**
- [ ] Header 컴포넌트 추출 (로그인 상태 + 4-tier 메뉴)
- [ ] MobileBottomNav 컴포넌트 추출 (모바일 하단 네비게이션)
- [ ] TrustBadge 컴포넌트 추출 (권한별 배지 4종)

**📊 Measurable (측정 가능)**
- [ ] 재사용률: `grep -r "<Header />" app/ | wc -l` ≥ 10 (out of 12 pages)
- [ ] CSS 중복 제거: `wc -l components/**/*.tsx` ≤ 500 lines
- [ ] 타입 안정성: `npm run type-check` → 0 errors
- [ ] 테스트 커버리지: `npm run test:coverage` → ≥ 80%

**🎯 Achievable (달성 가능)**
- [ ] Day 1: common.css 분석 완료 (8시간)
- [ ] Day 2: Header + MobileNav 구현 완료 (8시간)
- [ ] Day 3: TrustBadge + 테스트 완료 (8시간)

**💼 Relevant (관련성)**
- [ ] 개발 속도 향상: 반복 작업 70% 감소 측정
- [ ] 일관성 보장: 12개 페이지 동일 UX 검증
- [ ] 4-tier 차별화: 권한별 UI 자동 적용 확인

**⏰ Time-bound (기한)**
- [ ] 2025-10-08: CSS Variables 추출
- [ ] 2025-10-09: 컴포넌트 구현
- [ ] 2025-10-10: 테스트 완료

**🧪 Given/When/Then Scenarios**
- [ ] Scenario 1: 공통 Header 재사용 (12개 페이지)
- [ ] Scenario 2: 4-tier TrustBadge 자동 표시
- [ ] Scenario 3: 모바일 반응형 네비게이션

**🧪 3-Layer Testing**
- [ ] Layer 1 (Unit): TrustBadge 4-tier 테스트 (커버리지 80%)
- [ ] Layer 2 (Integration): Header + Auth 통합 테스트
- [ ] Layer 3 (E2E): 12개 페이지 공통 헤더 검증

---

## 🎯 Next Steps & Recommendations

### Immediate Actions (즉시 실행)

**1. SMART 기준 적용**
```bash
# Phase 0 완료 기준을 측정 가능하게 변경
echo "재사용률 측정: grep -r '<Header />' app/ | wc -l"
echo "CSS 줄 수 측정: wc -l components/**/*.tsx"
echo "타입 체크: npm run type-check"
echo "테스트 커버리지: npm run test:coverage"
```

**2. Given/When/Then 시나리오 작성**
```gherkin
# e2e/scenarios/common-components.feature 생성
Feature: Common Component Reusability
  Scenario: Header component reused across all pages
  Scenario: 4-tier TrustBadge displays correct colors
  Scenario: MobileBottomNav responsive behavior
```

**3. 3-Layer Testing 구조 생성**
```bash
mkdir -p __tests__/unit/components
mkdir -p __tests__/integration
mkdir -p e2e

# Layer 1: Unit Tests
touch __tests__/unit/components/TrustBadge.test.tsx
touch __tests__/unit/components/Header.test.tsx

# Layer 2: Integration Tests
touch __tests__/integration/header-auth.test.tsx

# Layer 3: E2E Tests
touch e2e/auth-flow.spec.ts
touch e2e/common-components.spec.ts
```

### Long-term Recommendations (장기 권장)

**🌐 MEADOWS (Systems Thinking)**
- 각 Phase 간 피드백 루프 설계
- Phase 0 결과가 Phase 1-3 속도에 미치는 영향 측정
- 시스템 전체 최적화 관점에서 병목 지점 식별

**🎲 TALEB (Antifragile)**
- 실패 시나리오 및 복원력 테스트 추가
- Chaos Engineering 도입 (무작위 오류 주입)
- 예상치 못한 상황에서 시스템 강건성 검증

**💬 GODIN (Purple Cow)**
- 4-tier 권한 시스템의 차별화 요소 측정
- 경쟁 커뮤니티 대비 "Remarkable" 포인트 검증
- 첫 사용자 경험에서 "다르다"는 인상 측정

---

## 📊 Success Metrics Dashboard

### Phase 0 Completion Criteria

```yaml
✅ SMART_Criteria_Met:
  Specific: 3개 핵심 컴포넌트 (Header, MobileNav, TrustBadge)
  Measurable: 재사용률 ≥ 80%, 테스트 커버리지 ≥ 80%
  Achievable: 3일 내 완료 (8시간 × 3 = 24시간)
  Relevant: 개발 속도 70% 향상, 일관성 100%
  Time-bound: 2025-10-08 ~ 2025-10-10

✅ Given_When_Then_Scenarios:
  Scenario_1: 12개 페이지 공통 헤더 재사용
  Scenario_2: 4-tier 권한별 배지 자동 표시
  Scenario_3: 모바일 반응형 (<768px) 네비게이션

✅ 3_Layer_Testing:
  Layer_1_Unit: 80% coverage (TrustBadge, Header, MobileNav)
  Layer_2_Integration: Header + Auth, 4-tier 권한 통합
  Layer_3_E2E: 12개 페이지 + 4-tier 시각적 검증

🎯 Overall_Readiness: Ready for Phase 1 when all ✅ checked
```

---

**문서 버전**: v1.0
**분석 완료일**: 2025-10-10
**적용 대상**: PROTOTYPE_TO_NEXTJS_INTEGRATION_PLAN.md v2.0
**전문가 패널**: 9명 (Christensen, Porter, Drucker, Godin, Kim/Mauborgne, Collins, Taleb, Meadows, Doumont)

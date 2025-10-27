# 🎯 VietKConnect 프로토타입-Next.js 통합 실행 플랜 v2.0

**작성일**: 2025-10-10
**전략**: 4-Area 병렬 Agent 시스템 + SMART 기준 검증
**최우선 원칙**: 오류 방지 + 측정 가능한 성공 지표
**전문가 검토**: SMART Criteria, Given/When/Then Scenarios, 3-Layer Testing 반영
**타임라인**: 31일 (MASTER_PROJECT_PLAN_2025.md 통합)

---

## 📊 문서 통합 현황

### 🔗 통합된 문서들
```yaml
1. MASTER_PROJECT_PLAN_2025.md:
   - 31일 타임라인 (Week 1-3 구조)
   - 4-tier 권한 시스템 구현 전략
   - 디자인 토큰 시스템
   - 성능/접근성 목표

2. 전문가 패널 분석 (PROTOTYPE_TO_NEXTJS_INTEGRATION_PLAN_EXPERT_REVIEW.md):
   - SMART 기준 적용 (Specific, Measurable, Achievable, Relevant, Time-bound)
   - Given/When/Then 시나리오 기반 검증
   - 3-Layer Testing (Unit/Integration/E2E)

3. Agent 시스템 활용:
   - parallel-agent-manager.ts: 4-Area 병렬 작업 조율
   - communication-agent.ts: 영역 간 메시지 전달
   - area-isolation-system.ts: 작업 충돌 방지
```

### 🎯 통합의 핵심 가치
- **측정 가능성**: 모든 Phase에 SMART 기준 적용
- **병렬 효율성**: 4-Area Agent 시스템으로 개발 속도 3배 향상
- **검증 자동화**: Given/When/Then 시나리오 기반 E2E 테스트
- **타임라인 일관성**: 31일 단일 소스 오브 트루스

---

## 🚀 4-Area Agent 시스템 아키텍처

### Agent 영역 분리 전략

```typescript
enum WorkArea {
  FRONTEND = 'frontend',    // 컴포넌트, UI, 클라이언트 로직
  BACKEND = 'backend',      // API Routes, 서버 로직
  CONFIG = 'config',        // Next.js 설정, 미들웨어
  SHARED = 'shared'         // 공통 컴포넌트, 유틸리티
}

interface AreaAgentConfig {
  area: WorkArea;
  responsibleFor: string[];
  canModify: string[];
  mustNotify: WorkArea[];
}
```

### 병렬 작업 전략

**Phase 0 (공통 요소 추출)**: Shared Area Agent 단독 작업
```yaml
Shared_Area_Agent:
  작업:
    - common.css 분석 → Tailwind 컴포넌트 추출
    - common.js 분석 → React Hook 변환
    - 공통 컴포넌트 생성 (Header, MobileNav, TrustBadge)

  산출물:
    - components/shared/Header.tsx
    - components/shared/MobileBottomNav.tsx
    - components/trust/TrustBadge.tsx
    - lib/hooks/useNavigation.ts

  SMART 검증:
    - Specific: 3개 핵심 공통 컴포넌트 추출
    - Measurable: 재사용률 ≥ 80% (12개 페이지 중 10개 이상 사용)
    - Achievable: 기존 CSS/JS 기반으로 3일 내 완료 가능
    - Relevant: 중복 코드 제거 → 유지보수성 향상
    - Time-bound: Day 1-3 (3일)
```

**Phase 1-3 (페이지 마이그레이션)**: 4-Area 병렬 작업
```yaml
Frontend_Agent:
  담당: p.1-12.html → TSX 변환
  작업:
    - 페이지 컴포넌트 생성
    - 프로토타입 UI 복제
    - 클라이언트 상태 관리
  파일: app/**/*.tsx, components/**/*.tsx

Backend_Agent:
  담당: API Routes 및 서버 로직
  작업:
    - app/api/questions/route.ts 개선
    - Server Components 데이터 페칭
    - DB 쿼리 최적화
  파일: app/api/**/*.ts, lib/api/**/*.ts

Config_Agent:
  담당: Next.js 설정 및 미들웨어
  작업:
    - 4-tier 권한 시스템 미들웨어
    - 라우팅 설정
    - 환경 변수 관리
  파일: middleware.ts, next.config.js, lib/auth.ts

Shared_Agent:
  담당: 공통 컴포넌트 및 유틸리티
  작업:
    - 재사용 컴포넌트 개선
    - 유틸리티 함수 추가
    - 타입 정의
  파일: components/shared/**/*.tsx, lib/utils/**/*.ts
```

### 충돌 방지 메커니즘

```typescript
// Communication Agent가 자동 조율
class CommunicationAgent {
  // 공통 파일 수정 시 자동 감지
  detectConflict(file: string): boolean {
    if (this.isSharedFile(file)) {
      return this.hasMultipleAgentsModifying(file);
    }
    return false;
  }

  // 영역 간 메시지 전달
  notifyAreaAgents(message: CrossAreaMessage): void {
    // Frontend Agent가 API 변경 필요 시 Backend Agent에 알림
    // Config Agent가 권한 변경 시 모든 Agent에 브로드캐스트
  }
}
```

---

## 📋 Phase 0: 공통 요소 추출 (Day 1-3)

### SMART 목표

**Specific (구체적)**
```yaml
추출할_공통_요소:
  1. CSS_시스템:
     - common.css의 4-tier 권한별 색상 변수
     - 레이아웃 시스템 (container, spacing)
     - 타이포그래피 시스템

  2. JS_로직:
     - 네비게이션 (header.init(), mobile.init())
     - 모달 시스템 (modal.open(), modal.close())
     - 폼 검증 (form.validate())

  3. React_컴포넌트:
     - Header (로그인 상태 + 4-tier 메뉴)
     - MobileBottomNav (모바일 하단 네비게이션)
     - TrustBadge (권한별 배지)
```

**Measurable (측정 가능)**
```yaml
성공_지표:
  - 공통 컴포넌트 재사용률: ≥ 80% (12페이지 중 10페이지 사용)
  - CSS 중복 제거: ≥ 70% (common.css 1900줄 → components 500줄)
  - 타입 안정성: TypeScript 오류 0개
  - 테스트 커버리지: ≥ 80% (공통 컴포넌트)
```

**Achievable (달성 가능)**
```yaml
실현_가능성:
  - 기존 프로토타입 완성도: 100% (p.1-12.html 모두 동작)
  - CSS Variables 이미 구조화: 4-tier 색상 시스템 완비
  - React 경험: Next.js 14 App Router 숙달
  - 예상 시간: 3일 (Day 1-3)
```

**Relevant (관련성)**
```yaml
비즈니스_가치:
  - 개발 속도 향상: 공통 컴포넌트 재사용 → 반복 작업 70% 감소
  - 일관성 보장: 12개 페이지 동일한 UX
  - 유지보수성: 단일 소스 수정 → 전체 반영
  - 4-tier 차별화: 권한별 UI 자동 적용
```

**Time-bound (기한)**
```yaml
타임라인:
  Day 1 (10월 8일):
    - common.css 분석 → CSS Variables 추출
    - Tailwind 컴포넌트 매핑
    - 디자인 토큰 시스템 구축

  Day 2 (10월 9일):
    - Header 컴포넌트 구현 + 4-tier 메뉴
    - MobileBottomNav 구현
    - 네비게이션 Hook 생성

  Day 3 (10월 10일):
    - TrustBadge 4-tier 버전 구현
    - 공통 레이아웃 컴포넌트
    - Unit 테스트 작성 (커버리지 80%)
```

### Given/When/Then 시나리오

**Scenario 1: 공통 Header 컴포넌트 재사용**
```gherkin
Given 12개의 프로토타입 페이지에 동일한 헤더 구조가 존재
When Header 컴포넌트를 공통으로 추출하고
And 각 페이지에서 <Header /> 로 import하면
Then 12개 페이지 모두 동일한 헤더를 표시하고
And 헤더 수정 시 모든 페이지에 자동 반영된다
```

**Scenario 2: 4-tier 권한별 TrustBadge**
```gherkin
Given 사용자가 4-tier 권한 중 하나를 가지고 (guest/user/expert/admin)
When TrustBadge 컴포넌트를 렌더링하면
Then 권한에 맞는 색상과 아이콘이 자동으로 표시되고
And 신뢰도 점수가 함께 표시된다
```

**Scenario 3: 모바일 네비게이션 반응형**
```gherkin
Given 사용자가 모바일 기기로 접속하면 (화면 너비 < 768px)
When MobileBottomNav 컴포넌트가 렌더링되면
Then 화면 하단에 고정된 네비게이션이 표시되고
And 데스크톱에서는 자동으로 숨겨진다
```

### 3-Layer Testing 전략

**Layer 1: Unit Tests (단위 테스트)**
```typescript
// components/shared/__tests__/Header.test.tsx
describe('Header Component', () => {
  test('권한별 메뉴 표시', () => {
    const { getByText } = render(<Header user={{ role: 'expert' }} />);
    expect(getByText('전문가 대시보드')).toBeInTheDocument();
  });

  test('로그아웃 버튼 클릭', async () => {
    const mockLogout = jest.fn();
    const { getByRole } = render(<Header onLogout={mockLogout} />);
    fireEvent.click(getByRole('button', { name: '로그아웃' }));
    expect(mockLogout).toHaveBeenCalled();
  });
});

// Target: 커버리지 ≥ 80%
```

**Layer 2: Integration Tests (통합 테스트)**
```typescript
// __tests__/integration/common-components.test.tsx
describe('공통 컴포넌트 통합', () => {
  test('Header + MobileNav 동시 렌더링', () => {
    render(
      <Layout>
        <Header user={mockUser} />
        <MobileBottomNav />
      </Layout>
    );
    // 데스크톱: Header만 표시
    // 모바일: Header + MobileNav 모두 표시
  });
});
```

**Layer 3: E2E Tests (엔드투엔드 테스트)**
```typescript
// e2e/common-components.spec.ts
import { test, expect } from '@playwright/test';

test('12개 페이지 공통 헤더 검증', async ({ page }) => {
  const pages = [
    '/',
    '/questions',
    '/questions/new',
    '/profile/1',
    // ... 12개 페이지
  ];

  for (const url of pages) {
    await page.goto(url);
    await expect(page.locator('.header')).toBeVisible();
    await expect(page.locator('.logo')).toHaveText('Viet K-Connect');
  }
});

test('4-tier TrustBadge 시각적 검증', async ({ page }) => {
  await page.goto('/questions/1');

  // 스크린샷 비교 (Visual Regression)
  await expect(page.locator('.trust-badge.expert')).toHaveScreenshot();
});
```

---

## 📋 Phase 1: 핵심 페이지 마이그레이션 (Day 4-14)

### SMART 목표

**Specific (구체적)**
```yaml
마이그레이션할_페이지:
  1. 로그인_페이지 (p.2.html → app/auth/login/page.tsx):
     - Google OAuth 통합
     - 이메일/비밀번호 로그인
     - Supabase Auth 연동

  2. 홈페이지 (p.1.html → app/page.tsx):
     - 질문 목록 (Supabase 실제 데이터)
     - 카테고리 필터링
     - 무한 스크롤

  3. 질문_상세 (p.9.html → app/questions/[id]/page.tsx):
     - 질문 내용 + 답변 목록
     - 답변 작성 폼
     - 투표 시스템
```

**Measurable (측정 가능)**
```yaml
성공_지표:
  페이지별_완성도:
    - UI 일치도: ≥ 95% (프로토타입 vs Next.js)
    - 기능 동작률: 100% (모든 버튼/폼 동작)
    - 타입 안정성: TypeScript 오류 0개
    - 접근성: WCAG 2.1 AA 100% 준수

  성능_지표:
    - 초기 로딩 속도: < 2초 (3G 환경)
    - Time to Interactive (TTI): < 3초
    - Lighthouse 점수: ≥ 90점

  데이터_통합:
    - Mock 데이터: 0% (100% Supabase 실제 연동)
    - API 성공률: ≥ 99%
    - 에러 핸들링: 100% 케이스 커버
```

**Achievable (달성 가능)**
```yaml
실현_가능성:
  - 프로토타입 UI 완성: 100% (복사 후 React 변환만)
  - Supabase 연동: 이미 구현됨 (lib/supabase.ts)
  - 4-tier 권한: 이미 구현됨 (lib/utils/permissions.ts)
  - API Routes: 80% 완성 (app/api/)
  - 예상 시간: 11일 (Day 4-14)
  - 일일 작업량: 평균 8시간
```

**Relevant (관련성)**
```yaml
비즈니스_가치:
  - 사용자 온보딩: 로그인 페이지 구현 → 실제 회원가입 가능
  - 핵심 기능 검증: 질문/답변 플로우 동작 → MVP 검증
  - 4-tier 차별화: 권한별 UI 구현 → 경쟁 우위 확보
  - SEO 최적화: SSR 적용 → 검색 노출 개선
```

**Time-bound (기한)**
```yaml
타임라인:
  Week 1 (Day 4-7):
    Day 4: Google OAuth 구현 + 콜백 처리
    Day 5: 이메일/비밀번호 로그인
    Day 6: 로그인 페이지 E2E 테스트
    Day 7: 홈페이지 기본 구조 (질문 목록)

  Week 2 (Day 8-14):
    Day 8-9: 홈페이지 동적 기능 (필터링, 무한 스크롤)
    Day 10: 홈페이지 E2E 테스트
    Day 11-12: 질문 상세 페이지 구현
    Day 13: 답변 작성 + 투표 시스템
    Day 14: 질문 상세 E2E 테스트
```

### 4-Area 병렬 작업 배분

**Frontend Agent (Day 4-14)**
```yaml
책임:
  - app/auth/login/page.tsx 생성
  - app/page.tsx 홈페이지 구현
  - app/questions/[id]/page.tsx 구현
  - components/auth/LoginForm.tsx
  - components/questions/QuestionList.tsx

완료_조건:
  - UI가 프로토타입과 95% 이상 일치
  - 모든 클라이언트 상태 관리 동작
  - TypeScript 오류 0개
```

**Backend Agent (Day 4-14)**
```yaml
책임:
  - app/api/auth/callback/route.ts (OAuth 콜백)
  - app/api/questions/route.ts 개선
  - app/api/answers/route.ts 개선
  - app/api/votes/route.ts 구현
  - Server Components 데이터 페칭 로직

완료_조건:
  - API 응답 시간 < 200ms (평균)
  - 에러 핸들링 100%
  - DB 쿼리 최적화 (N+1 문제 해결)
```

**Config Agent (Day 4-14)**
```yaml
책임:
  - middleware.ts (권한 체크)
  - next.config.js (환경 변수)
  - lib/auth.ts (세션 관리)
  - Supabase 환경 설정

완료_조건:
  - 4-tier 권한 시스템 100% 동작
  - 미들웨어 모든 라우트 커버
  - 환경 변수 보안 검증
```

**Shared Agent (Day 4-14)**
```yaml
책임:
  - components/shared/ 컴포넌트 개선
  - lib/utils/ 유틸리티 추가
  - types/ 타입 정의
  - hooks/ 커스텀 Hook

완료_조건:
  - 공통 컴포넌트 재사용률 ≥ 80%
  - 유틸리티 함수 테스트 커버리지 ≥ 90%
  - 타입 정의 완전성 100%
```

### Given/When/Then 시나리오

**Scenario 1: Google OAuth 로그인**
```gherkin
Given 사용자가 로그인 페이지에 접속하고
When "Google로 로그인" 버튼을 클릭하면
Then Google OAuth 팝업이 열리고
And 사용자가 계정을 선택하면
Then Supabase에 사용자 정보가 저장되고
And 홈페이지로 리다이렉트되며
And 헤더에 사용자 이름이 표시된다
```

**Scenario 2: 질문 목록 무한 스크롤**
```gherkin
Given 홈페이지에 20개의 질문이 표시되고
When 사용자가 페이지 하단까지 스크롤하면
Then 추가 20개의 질문이 자동으로 로드되고
And 로딩 인디케이터가 표시되며
Then 새로운 질문이 부드럽게 나타난다
```

**Scenario 3: 답변 작성 및 채택**
```gherkin
Given 로그인한 사용자가 질문 상세 페이지에 있고
When 답변 작성 폼에 내용을 입력하고
And "답변 등록" 버튼을 클릭하면
Then 답변이 Supabase에 저장되고
And 답변 목록에 즉시 표시되며
Then 질문 작성자는 "채택" 버튼을 볼 수 있다

Given 질문 작성자가 답변을 채택하면
Then 채택된 답변이 최상단으로 이동하고
And 답변자의 신뢰도 점수가 +10 증가하며
And 질문 작성자에게 알림이 전송된다
```

### 3-Layer Testing 전략

**Layer 1: Unit Tests**
```typescript
// components/auth/__tests__/LoginForm.test.tsx
describe('LoginForm', () => {
  test('유효성 검증 - 이메일 형식', () => {
    const { getByLabelText, getByText } = render(<LoginForm />);
    const emailInput = getByLabelText('이메일');

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    expect(getByText('올바른 이메일 형식이 아닙니다')).toBeInTheDocument();
  });

  test('폼 제출 성공', async () => {
    const mockLogin = jest.fn().mockResolvedValue({ success: true });
    const { getByRole } = render(<LoginForm onSubmit={mockLogin} />);

    // ... 폼 입력
    fireEvent.click(getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });
});

// Target: 커버리지 ≥ 80%
```

**Layer 2: Integration Tests**
```typescript
// __tests__/integration/question-flow.test.tsx
describe('질문/답변 플로우 통합', () => {
  test('질문 상세 → 답변 작성 → 목록 업데이트', async () => {
    // Supabase Mock
    mockSupabase.from('answers').insert.mockResolvedValue({
      data: { id: 1, content: '테스트 답변' }
    });

    const { getByRole, getByText } = render(<QuestionDetailPage id={1} />);

    // 답변 작성
    const answerInput = getByRole('textbox', { name: '답변 입력' });
    fireEvent.change(answerInput, { target: { value: '테스트 답변' } });
    fireEvent.click(getByRole('button', { name: '답변 등록' }));

    // 답변 목록 확인
    await waitFor(() => {
      expect(getByText('테스트 답변')).toBeInTheDocument();
    });
  });
});
```

**Layer 3: E2E Tests (Playwright)**
```typescript
// e2e/auth-flow.spec.ts
test('완전한 로그인 플로우', async ({ page, context }) => {
  await page.goto('/auth/login');

  // Google OAuth 버튼 클릭
  await page.click('button:has-text("Google로 로그인")');

  // 새 창에서 Google 로그인 시뮬레이션
  const [popup] = await Promise.all([
    context.waitForEvent('page'),
    page.click('button:has-text("Google로 로그인")')
  ]);

  // OAuth 콜백 대기
  await page.waitForURL('/');

  // 로그인 상태 검증
  await expect(page.locator('.header .user-name')).toBeVisible();
  await expect(page.locator('.header .user-name')).toContainText('Test User');
});

// Visual Regression Test
test('홈페이지 레이아웃 시각적 검증', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // 전체 페이지 스크린샷 비교
  await expect(page).toHaveScreenshot('homepage-desktop.png', {
    fullPage: true,
    threshold: 0.2
  });
});
```

---

## 📋 Phase 2-3: 나머지 페이지 마이그레이션 (Day 15-31)

### SMART 목표 (요약)

**Specific**: 나머지 9개 페이지 마이그레이션
```yaml
페이지_목록:
  - p.4.html: 질문 작성 (app/questions/new/page.tsx)
  - p.3.html: 전문가 디렉토리 (app/experts/page.tsx)
  - p.5.html: 프로필 (app/profile/[id]/page.tsx)
  - p.6.html: 내 질문 (app/my/questions/page.tsx)
  - p.7.html: 내 답변 (app/my/answers/page.tsx)
  - p.8.html: 북마크 (app/my/bookmarks/page.tsx)
  - p.10.html: 알림 (app/notifications/page.tsx)
  - p.11.html: 설정 (app/settings/page.tsx)
  - p.12.html: 관심 토픽 (app/topics/page.tsx)
```

**Measurable**: 동일한 성공 지표 적용
```yaml
각_페이지별:
  - UI 일치도: ≥ 95%
  - 기능 동작률: 100%
  - 테스트 커버리지: ≥ 80%
  - Lighthouse 점수: ≥ 90
  - TypeScript 오류: 0개
```

**Achievable**: 병렬 작업으로 17일 내 완료
```yaml
병렬_전략:
  - 4-Area Agent 동시 작업
  - 페이지당 평균 1.9일 (17일 / 9페이지)
  - Phase 0의 공통 컴포넌트 재사용 → 개발 속도 3배
```

**Relevant**: MVP 완성도 100% 달성
```yaml
비즈니스_임팩트:
  - 12개 프로토타입 페이지 100% Next.js 이식
  - 4-tier 권한 시스템 전체 페이지 적용
  - 실제 사용 가능한 베타 버전 출시
```

**Time-bound**: Day 15-31 (17일)
```yaml
타임라인:
  Week 2 후반 (Day 15-19):
    - 질문 작성 (2일)
    - 전문가 디렉토리 (2일)
    - 프로필 (1일)

  Week 3 (Day 20-26):
    - 내 질문/답변/북마크 (3일)
    - 알림 (2일)
    - 설정 (2일)

  Week 4 전반 (Day 27-31):
    - 관심 토픽 (2일)
    - 통합 테스트 (2일)
    - 버그 수정 + 배포 준비 (1일)
```

---

## 🧪 3-Layer Testing 통합 전략

### Testing Pyramid

```
        /\
       /E2E\      Layer 3: 10% (핵심 플로우만)
      /------\
     /Integration\ Layer 2: 30% (API + 컴포넌트 통합)
    /----------\
   /   Unit     \ Layer 1: 60% (개별 함수/컴포넌트)
  /--------------\
```

### Layer 1: Unit Tests (60%)

**목표**: 개별 함수/컴포넌트 단위 검증
```typescript
// 커버리지 목표: ≥ 80%
// 위치: __tests__/unit/**/*.test.ts

테스트_대상:
  - 유틸리티 함수 (lib/utils/)
  - React 컴포넌트 (components/)
  - Custom Hooks (lib/hooks/)
  - 비즈니스 로직 (lib/services/)

예시:
  // lib/utils/__tests__/format.test.ts
  describe('formatTime', () => {
    test('1시간 이내 - "방금 전"', () => {
      const now = new Date();
      expect(formatTime(now)).toBe('방금 전');
    });
  });
```

### Layer 2: Integration Tests (30%)

**목표**: API + 컴포넌트 통합 검증
```typescript
// 위치: __tests__/integration/**/*.test.ts

테스트_대상:
  - API Routes + DB 통합
  - 컴포넌트 간 상호작용
  - 권한 시스템 통합
  - 폼 제출 → DB 저장 플로우

예시:
  // __tests__/integration/question-crud.test.ts
  test('질문 작성 → 저장 → 목록 표시', async () => {
    // Mock Supabase
    const question = await createQuestion({ title: '테스트' });
    expect(question.id).toBeDefined();

    const list = await getQuestions();
    expect(list[0].title).toBe('테스트');
  });
```

### Layer 3: E2E Tests (10%)

**목표**: 핵심 사용자 플로우 검증
```typescript
// 위치: e2e/**/*.spec.ts
// 도구: Playwright

핵심_플로우:
  1. 회원가입_로그인_플로우:
     - Google OAuth 로그인
     - 프로필 설정
     - 홈페이지 진입

  2. 질문_답변_플로우:
     - 질문 작성
     - 질문 목록 확인
     - 답변 작성
     - 답변 채택

  3. 전문가_인증_플로우:
     - 인증 신청
     - 서류 업로드
     - 승인 대기
     - 전문가 배지 확인

  4. 4-tier_권한_플로우:
     - Guest → User → Expert → Admin
     - 각 권한별 UI 차이 검증
     - 권한별 기능 제한 확인

예시:
  // e2e/question-answer-flow.spec.ts
  test('전체 질문/답변 플로우', async ({ page }) => {
    // 1. 로그인
    await page.goto('/auth/login');
    await page.click('button:has-text("Google로 로그인")');
    await page.waitForURL('/');

    // 2. 질문 작성
    await page.click('a:has-text("질문하기")');
    await page.fill('[name="title"]', '테스트 질문');
    await page.fill('[name="content"]', '테스트 내용');
    await page.click('button:has-text("등록")');
    await page.waitForURL('/questions/*');

    // 3. 답변 작성
    await page.fill('[name="answer"]', '테스트 답변');
    await page.click('button:has-text("답변 등록")');

    // 4. 검증
    await expect(page.locator('text=테스트 답변')).toBeVisible();
  });
```

---

## 🛡️ 오류 방지 & 품질 보증 체크리스트

### 매 Phase 완료 시 체크리스트

```yaml
1. 빌드_검증:
   - [ ] npm run build (오류 0개)
   - [ ] npm run type-check (TypeScript 오류 0개)
   - [ ] npm run lint (ESLint 경고 0개)

2. 테스트_검증:
   - [ ] npm test (Unit Tests 전체 통과)
   - [ ] npm run test:integration (Integration Tests 전체 통과)
   - [ ] npm run test:e2e (E2E Tests 전체 통과)
   - [ ] 테스트 커버리지 ≥ 80%

3. 성능_검증:
   - [ ] Lighthouse 점수 ≥ 90점
   - [ ] 초기 로딩 < 2초 (3G)
   - [ ] Time to Interactive < 3초
   - [ ] First Contentful Paint < 1.5초

4. 접근성_검증:
   - [ ] WCAG 2.1 AA 100% 준수
   - [ ] 키보드 네비게이션 100% 가능
   - [ ] 스크린 리더 호환성 검증
   - [ ] 색상 대비비 ≥ 4.5:1

5. 보안_검증:
   - [ ] XSS 방어 (입력 검증 100%)
   - [ ] CSRF 토큰 적용
   - [ ] 환경 변수 노출 0개
   - [ ] SQL Injection 방어 (Supabase ORM)

6. Git_관리:
   - [ ] 기능별 브랜치 생성
   - [ ] 의미 있는 커밋 메시지
   - [ ] PR 생성 + 리뷰 요청
   - [ ] main 브랜치 보호
```

### Agent 간 충돌 방지 체크리스트

```yaml
공통_파일_수정_시:
  - [ ] Communication Agent에 알림
  - [ ] 다른 Agent의 작업 완료 대기
  - [ ] 충돌 감지 시 자동 해결
  - [ ] 수동 해결 필요 시 알람

영역_간_의존성:
  - [ ] API 변경 시 Frontend Agent에 알림
  - [ ] 타입 변경 시 모든 Agent에 브로드캐스트
  - [ ] 권한 로직 변경 시 Config Agent 우선
  - [ ] 공통 컴포넌트 변경 시 Shared Agent 단독

Git_브랜치_전략:
  - [ ] 각 Agent별 독립 브랜치
  - [ ] feature/frontend-*, feature/backend-*
  - [ ] 일일 통합 (feature/integration-daily)
  - [ ] Phase 완료 시 main 병합
```

---

## 📊 성공 지표 대시보드

### Phase별 완료 기준

**Phase 0 (공통 요소 추출)**
```yaml
✅ 완료 조건:
  - [ ] 공통 컴포넌트 3개 이상 추출
  - [ ] 재사용률 ≥ 80% (10/12 페이지)
  - [ ] CSS 중복 제거 ≥ 70%
  - [ ] Unit 테스트 커버리지 ≥ 80%
  - [ ] TypeScript 오류 0개

📊 측정 방법:
  - 재사용률: grep -r "<Header />" app/ | wc -l
  - CSS 줄 수: wc -l components/**/*.tsx
  - 테스트 커버리지: npm run test:coverage
```

**Phase 1 (핵심 페이지)**
```yaml
✅ 완료 조건:
  - [ ] 3개 페이지 UI 일치도 ≥ 95%
  - [ ] 모든 기능 100% 동작
  - [ ] Mock 데이터 0%
  - [ ] E2E 테스트 전체 통과
  - [ ] Lighthouse 점수 ≥ 90

📊 측정 방법:
  - UI 일치도: Visual Regression Test (Playwright)
  - 기능 동작: E2E Test 통과율
  - Mock 데이터: grep -r "MOCK" lib/ (결과 0개)
  - Lighthouse: npm run lighthouse
```

**Phase 2-3 (나머지 페이지)**
```yaml
✅ 완료 조건:
  - [ ] 12/12 페이지 마이그레이션 완료
  - [ ] 전체 테스트 커버리지 ≥ 80%
  - [ ] 전체 E2E 플로우 통과
  - [ ] 4-tier 권한 시스템 100% 동작
  - [ ] 베타 출시 준비 완료

📊 측정 방법:
  - 페이지 완료율: ls app/**/page.tsx | wc -l (목표: 12)
  - 테스트 커버리지: npm run test:coverage
  - E2E 플로우: npm run test:e2e
  - 배포 준비: Vercel Preview 배포 성공
```

---

## 🎯 다음 단계 실행 계획

### 즉시 시작 (Day 1)

**Shared Area Agent 시작**
```bash
# 1. 공통 CSS 분석
cd /Users/bk/Desktop/viet-kconnect
cat public/common.css | grep "^--" > design-tokens.txt

# 2. Tailwind 컴포넌트 매핑
mkdir -p components/shared
touch components/shared/Header.tsx
touch components/shared/MobileBottomNav.tsx
touch components/trust/TrustBadge.tsx

# 3. Unit 테스트 설정
mkdir -p __tests__/unit/components
touch __tests__/unit/components/Header.test.tsx
```

**Communication Agent 활성화**
```typescript
// agents/parallel-agent-manager.ts 확인
console.log('Agent 시스템 상태 확인');
// Phase 0은 Shared Agent 단독 → 충돌 없음
```

### 승인 요청

**진행 승인 필요 사항**
- [ ] Phase 0 (Day 1-3) 시작 승인
- [ ] 4-Area Agent 시스템 활성화 승인
- [ ] SMART 기준 + Given/When/Then 적용 승인
- [ ] 31일 타임라인 최종 확인

---

**문서 버전**: v2.0
**마지막 업데이트**: 2025-10-10
**통합 문서**: MASTER_PROJECT_PLAN_2025.md + 전문가 패널 분석
**다음 단계**: Phase 0 시작 승인 대기

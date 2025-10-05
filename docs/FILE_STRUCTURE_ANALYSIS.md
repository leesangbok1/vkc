# Viet K-Connect 파일 구조 체계화 문서

## 📁 현재 파일 구조 분석 및 정리 방안

### 🏗️ 루트 디렉토리 파일들

#### 설정 파일 (Configuration Files)
```
📄 next.config.js          - Next.js 설정
📄 tailwind.config.js      - Tailwind CSS 설정
📄 eslint.config.js        - ESLint 린팅 설정
📄 vitest.config.js        - Vitest 테스트 설정
📄 vitest.config.ts        - Vitest TypeScript 설정
📄 vite.config.js          - Vite 빌드 설정
📄 middleware.ts           - Next.js 미들웨어
```

#### HTML 파일들
```
📄 index.html              - 메인 HTML 진입점
📄 admin.html              - 관리자 페이지
📄 public/offline.html     - 오프라인 페이지
```

---

### 🎯 App Router 구조 (Next.js 14)

#### 페이지 컴포넌트
```
📁 app/
  📄 layout.tsx            - 루트 레이아웃
  📄 page.tsx              - 홈페이지
  📄 loading.tsx           - 로딩 컴포넌트
  📄 error.tsx             - 에러 컴포넌트
  📄 not-found.tsx         - 404 페이지

  📁 questions/
    📄 page.tsx            - 질문 목록 페이지
    📁 [id]/
      📄 page.tsx          - 질문 상세 페이지

  📁 auth/
    📁 callback/
      📄 route.ts          - 인증 콜백 라우트
```

#### API 라우트 구조
```
📁 app/api/
  📁 answers/
    📄 route.ts                    - 답변 CRUD
    📁 [id]/
      📄 route.ts                  - 특정 답변 조회/수정/삭제
      📄 accept/route.ts           - 답변 채택
      📄 helpful/route.ts          - 답변 도움됨 표시
      📁 comments/
        📄 route.ts                - 답변 댓글
      📁 vote/
        📄 route.ts                - 답변 투표
        📄 status/route.ts         - 답변 투표 상태

  📁 questions/
    📄 route.ts                    - 질문 CRUD
    📁 [id]/
      📄 route.ts                  - 특정 질문 조회/수정/삭제
      📄 answers/route.ts          - 질문의 답변들
      📄 comments/route.ts         - 질문 댓글
      📁 vote/
        📄 route.ts                - 질문 투표
        📄 status/route.ts         - 질문 투표 상태

  📁 auth/
    📄 profile/route.ts            - 사용자 프로필
    📄 social/route.ts             - 소셜 로그인

  📁 notifications/
    📄 route.ts                    - 알림 목록
    📄 mark-all-read/route.ts      - 모든 알림 읽음 처리
    📄 unread-count/route.ts       - 읽지 않은 알림 수
    📁 [id]/
      📄 route.ts                  - 특정 알림 처리

  📁 experts/
    📄 match/route.ts              - 전문가 매칭

  📄 categories/route.ts           - 카테고리 관리
  📄 search/route.ts               - 검색 기능
  📄 stats/route.ts                - 통계 정보
  📄 health/route.ts               - 헬스체크
```

---

### 🧩 컴포넌트 구조

#### UI 컴포넌트 (shadcn/ui 기반)
```
📁 components/ui/
  📄 alert.tsx             - 알림 컴포넌트
  📄 avatar.tsx            - 아바타 컴포넌트
  📄 badge.tsx             - 뱃지 컴포넌트
  📄 button.tsx            - 버튼 컴포넌트
  📄 dialog.tsx            - 다이얼로그 모달
  📄 dropdown-menu.tsx     - 드롭다운 메뉴
  📄 label.tsx             - 라벨 컴포넌트
  📄 Pagination.tsx        - 페이지네이션
  📄 skeleton.tsx          - 스켈레톤 로딩
  📄 textarea.tsx          - 텍스트 영역
```

#### 기능별 컴포넌트
```
📁 components/
  📁 questions/
    📄 CategoryFilter.tsx   - 카테고리 필터
    📄 QuestionCard.tsx     - 질문 카드
    📄 QuestionDetail.tsx   - 질문 상세
    📄 QuestionList.tsx     - 질문 목록
    📄 VoteButtons.tsx      - 투표 버튼

  📁 answers/
    📄 AnswerForm.tsx       - 답변 작성 폼
    📄 AnswerList.tsx       - 답변 목록
    📄 CommentSection.tsx   - 댓글 섹션

  📁 auth/
    📄 SocialLoginButtons.tsx - 소셜 로그인 버튼

  📁 layout/
    📄 DesktopSidebar.tsx   - 데스크톱 사이드바
    📄 Header.tsx           - 헤더
    📄 MobileBottomNav.tsx  - 모바일 하단 네비게이션
    📄 ResponsiveLayout.tsx - 반응형 레이아웃
    📄 SimpleHeader.tsx     - 간단한 헤더

  📁 search/
    📄 SearchBox.tsx        - 검색박스

  📁 forms/
    📄 QuestionInput.tsx    - 질문 입력 폼

  📁 trust/
    📄 AIMatchingFlow.tsx   - AI 매칭 플로우
    📄 TrustBadge.tsx       - 신뢰 뱃지

  📁 dynamic/
    📄 DynamicAIMatchingFlow.tsx - 동적 AI 매칭

  📁 providers/
    📄 ClientProviders.tsx  - 클라이언트 프로바이더

  📁 accessibility/
    📄 LiveRegion.tsx       - 접근성 라이브 영역

  📄 LoginModal.tsx         - 로그인 모달
  📄 StructuredData.tsx     - 구조화된 데이터
  📄 theme-provider.tsx     - 테마 프로바이더
  📄 theme-toggle.tsx       - 테마 토글
```

---

### 📚 라이브러리 및 유틸리티

#### 핵심 라이브러리
```
📁 lib/
  📄 auth.ts                      - 인증 로직
  📄 database-optimization.ts     - 데이터베이스 최적화
  📄 mock-data.ts                 - 목 데이터
  📄 supabase.ts                  - Supabase 기본 설정
  📄 supabase-browser.ts          - 브라우저용 Supabase 클라이언트
  📄 supabase-server.ts           - 서버용 Supabase 클라이언트
  📄 utils.ts                     - 공통 유틸리티

  📁 supabase/
    📄 client.ts                  - Supabase 클라이언트 설정

  📁 services/
    📄 cache.service.ts           - 캐시 서비스
    📄 notification.service.ts    - 알림 서비스
    📄 query-optimizer.service.ts - 쿼리 최적화 서비스

  📁 utils/
    📄 expert-matching.ts         - 전문가 매칭 유틸리티
```

#### Hooks
```
📁 hooks/
  📄 useAuth.tsx            - 인증 훅
```

#### Contexts
```
📁 contexts/
  📄 AuthContext.tsx        - 인증 컨텍스트
```

---

### 🤖 Agent 시스템

#### 백엔드 Agent
```
📁 agents/backend/
  📄 api-development-agent.ts  - API 개발 Agent
  📄 auth-system-agent.ts      - 인증 시스템 Agent
  📄 database-agent.ts         - 데이터베이스 Agent
```

#### 프론트엔드 Agent
```
📁 agents/frontend/
  📄 theme-system-agent.ts     - 테마 시스템 Agent
  📄 ui-design-agent.ts        - UI 디자인 Agent
```

#### 설정 Agent
```
📁 agents/config/
  📄 build-system-agent.ts     - 빌드 시스템 Agent
  📄 deployment-agent.ts       - 배포 Agent
  📄 monitoring-agent.ts       - 모니터링 Agent
```

#### 현대적 Agent
```
📁 agents/modern-agents/
  📄 index.ts                        - Agent 통합 인덱스
  📄 modern-architecture-agent.ts    - 현대적 아키텍처 Agent
  📄 modern-automation-agent.ts      - 자동화 Agent
  📄 modern-code-analysis-agent.ts   - 코드 분석 Agent
  📄 modern-debug-agent.ts           - 디버그 Agent
  📄 modern-test-agent.ts            - 테스트 Agent
```

#### 기타 Agent
```
📁 agents/
  📄 area-isolation-system.ts   - 영역 격리 시스템
  📄 communication-agent.ts     - 커뮤니케이션 Agent
  📄 integration-test.ts        - 통합 테스트
  📄 parallel-agent-manager.ts  - 병렬 Agent 매니저

  // Legacy files (정리 필요)
  📄 architecture-agent.js      - 아키텍처 Agent (JS - 마이그레이션 필요)
  📄 code-analysis-agent.js     - 코드 분석 Agent (JS - 중복)
  📄 debug-agent.js             - 디버그 Agent (JS - 중복)
  📄 debug-agent.ts             - 디버그 Agent (TS - 중복)
  📄 test-agent.js              - 테스트 Agent (JS - 중복)
```

---

### 🛠️ 스크립트 및 도구

#### 데이터베이스 스크립트
```
📁 scripts/db/
  📄 generate-mock-data.ts      - 목 데이터 생성
  📄 generate-mock-json.ts      - JSON 목 데이터 생성
  📄 reset-database.ts          - 데이터베이스 리셋
```

#### 유틸리티 스크립트
```
📁 scripts/
  📄 backup-manager.js          - 백업 관리자
  📄 context-manager.js         - 컨텍스트 관리자
  📄 development-guardian.js    - 개발 가디언
  📄 github-auto-issue.js       - GitHub 이슈 자동화
  📄 master-guardian.js         - 마스터 가디언
  📄 parallel-agent-manager.js  - 병렬 Agent 관리자
  📄 plan-manager.js            - 계획 관리자
  📄 quality-guardian.js        - 품질 가디언
  📄 setup-supabase.js          - Supabase 설정
  📄 test-api.js                - API 테스트
  📄 test-supabase-connection.js - Supabase 연결 테스트
  📄 workflow-manager.js        - 워크플로우 관리자
```

---

### 🧪 테스트 구조

```
📁 tests/
  📄 setup.ts               - 테스트 설정
  📁 api/
    📄 health.test.ts       - 헬스체크 API 테스트
```

---

### 📊 빌드 및 정적 파일

#### 정적 파일
```
📁 public/
  📄 offline.html           - 오프라인 페이지
  📄 sw.js                  - 서비스 워커
  // (기타 이미지, 아이콘 파일들)
```

#### 빌드 결과물 (숨김 폴더)
```
📁 .next/                   - Next.js 빌드 결과물
📁 node_modules/            - NPM 패키지
📁 coverage/                - 테스트 커버리지 리포트
📁 playwright-report/       - Playwright 테스트 리포트
```

---

## 🔄 정리 권장사항

### 1. 파일 정리 우선순위

#### 🚨 즉시 정리 필요
- **agents/** 폴더의 JS/TS 중복 파일들
- **scripts/** 폴더의 역할별 하위 폴더 구조화
- **lib/** 폴더의 서비스별 분류 개선

#### 🔧 구조 개선 권장
```
📁 scripts/
  📁 database/           ← db/ 폴더 이름 변경
  📁 automation/         ← 자동화 관련 스크립트
  📁 testing/            ← 테스트 관련 스크립트
  📁 utilities/          ← 기타 유틸리티
```

### 2. 명명 규칙 표준화

#### TypeScript 우선
- `.js` 파일을 `.ts`로 마이그레이션
- 중복된 Agent 파일들 통합

#### 일관된 명명
- 컴포넌트: PascalCase (예: `QuestionCard.tsx`)
- 유틸리티: camelCase (예: `expert-matching.ts`)
- 설정 파일: kebab-case (예: `next.config.js`)

### 3. 기능별 그룹화 상태

#### ✅ 잘 정리된 영역
- **app/api/** - REST API 라우트 구조
- **components/ui/** - shadcn/ui 컴포넌트
- **components/questions/** - 질문 관련 컴포넌트

#### ⚠️ 개선 필요 영역
- **agents/** - JS/TS 중복 및 역할 중복
- **scripts/** - 기능별 분류 미흡
- **lib/services/** - 서비스별 세분화 필요

---

## 📋 파일 분류 체계

### A급: 핵심 비즈니스 로직 (38개)
- API 라우트 (19개)
- 핵심 컴포넌트 (19개)

### B급: UI 및 유틸리티 (45개)
- UI 컴포넌트 (10개)
- 라이브러리 및 서비스 (10개)
- 레이아웃 컴포넌트 (5개)
- Agent 시스템 (20개)

### C급: 설정 및 도구 (25개)
- 설정 파일 (7개)
- 스크립트 (12개)
- 테스트 파일 (2개)
- HTML 페이지 (3개)
- 기타 (1개)

---

**총 파일 수: 108개 (build artifacts 제외)**

이 문서는 현재 프로젝트의 파일 구조를 체계적으로 분석하고 정리 방향을 제시합니다. 파일 자체는 건드리지 않고 순수하게 구조 분석과 개선 방향만을 제안했습니다.
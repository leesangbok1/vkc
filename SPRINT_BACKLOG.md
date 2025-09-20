# Sprint Backlog
# Viet K-Connect - 스프린트 백로그

## 📋 Sprint Information
- **Current Sprint**: Sprint 1
- **Duration**: 2025-09-19 to 2025-10-02 (2 weeks)
- **Sprint Goal**: Backend 인프라 구축 및 인증 시스템 완성
- **Team Capacity**: 160 hours (4명 × 40시간)

---

## 🎯 Sprint 1: Backend Foundation (Current)

### Sprint Goal
> "Supabase 백엔드 인프라를 구축하고, 소셜 로그인 3개(카카오, 구글, 페이스북)를 완벽하게 작동시킨다"

### Success Criteria
- [ ] Supabase 프로젝트 생성 및 연동 완료
- [ ] 데이터베이스 스키마 100% 구현
- [ ] 3개 소셜 로그인 모두 작동
- [ ] 기본 CRUD API 작동
- [ ] 테스트 커버리지 > 60%

---

## 📝 User Stories & Tasks

### 🔵 EPIC-001: Backend Infrastructure Setup
**Story Points**: 21
**Priority**: P0
**Assignee**: Backend Team

#### USER-001: Supabase 프로젝트 설정
**As a** developer
**I want to** set up Supabase project
**So that** we have a backend infrastructure

**Acceptance Criteria:**
- Supabase 프로젝트 생성됨
- 환경 변수 설정됨
- 연결 테스트 통과

**Tasks:**
- [x] SUB-001: Supabase 계정 생성 (0.5h)
- [ ] SUB-002: 프로젝트 생성 "viet-kconnect-prod" (0.5h)
- [ ] SUB-003: API 키 발급 및 .env.local 설정 (1h)
- [ ] SUB-004: @supabase/supabase-js 패키지 설치 (0.5h)
- [ ] SUB-005: 연결 테스트 코드 작성 (1.5h)
- [ ] SUB-006: 에러 핸들링 구현 (2h)

**Estimated**: 6h
**Actual**: -
**Status**: 🔄 In Progress

---

#### USER-002: 데이터베이스 스키마 구현
**As a** developer
**I want to** implement database schema
**So that** we can store application data

**Acceptance Criteria:**
- 모든 테이블 생성됨
- RLS 정책 설정됨
- 인덱스 최적화됨

**Tasks:**
- [ ] SUB-007: ERD 다이어그램 작성 (2h)
- [ ] SUB-008: Users 테이블 생성 (1h)
  ```sql
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    provider VARCHAR(50),
    visa_type VARCHAR(20),
    residence_area VARCHAR(100),
    years_in_korea INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```
- [ ] SUB-009: Questions 테이블 생성 (1h)
  ```sql
  CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50),
    tags JSONB,
    view_count INTEGER DEFAULT 0,
    is_solved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```
- [ ] SUB-010: Answers 테이블 생성 (1h)
- [ ] SUB-011: Notifications 테이블 생성 (1h)
- [ ] SUB-012: Activities 테이블 생성 (1h)
- [ ] SUB-013: RLS 정책 설정 (3h)
- [ ] SUB-014: 인덱스 생성 및 최적화 (2h)
- [ ] SUB-015: 시드 데이터 삽입 스크립트 (2h)

**Estimated**: 14h
**Actual**: -
**Status**: 📅 To Do

---

### 🔵 EPIC-002: Authentication System
**Story Points**: 34
**Priority**: P0
**Assignee**: Full-stack Team

#### USER-003: 카카오 로그인 구현
**As a** user
**I want to** login with Kakao
**So that** I can access the platform easily

**Acceptance Criteria:**
- 카카오 로그인 버튼 작동
- 사용자 정보 저장됨
- 세션 유지됨

**Tasks:**
- [ ] SUB-016: 카카오 개발자 앱 등록 (1h)
- [ ] SUB-017: Redirect URI 설정 (0.5h)
- [ ] SUB-018: 카카오 SDK 설치 및 설정 (1h)
- [ ] SUB-019: Supabase Auth Provider 연동 (2h)
- [ ] SUB-020: 로그인 플로우 구현 (3h)
- [ ] SUB-021: 사용자 정보 매핑 (2h)
- [ ] SUB-022: 에러 처리 및 로깅 (1.5h)
- [ ] SUB-023: UI 컴포넌트 스타일링 (1h)

**Estimated**: 12h
**Actual**: -
**Status**: 📅 To Do

---

#### USER-004: 구글 로그인 구현
**As a** user
**I want to** login with Google
**So that** I can use my Google account

**Tasks:**
- [ ] SUB-024: Google Cloud Console 프로젝트 생성 (1h)
- [ ] SUB-025: OAuth 2.0 클라이언트 ID 생성 (0.5h)
- [ ] SUB-026: 승인된 리디렉션 URI 설정 (0.5h)
- [ ] SUB-027: Google Auth Provider 연동 (2h)
- [ ] SUB-028: 로그인 플로우 구현 (2h)
- [ ] SUB-029: 테스트 및 디버깅 (2h)

**Estimated**: 8h
**Actual**: -
**Status**: 📅 To Do

---

#### USER-005: 페이스북 로그인 구현
**As a** user
**I want to** login with Facebook
**So that** I can use my Facebook account

**Tasks:**
- [ ] SUB-030: Facebook 개발자 앱 생성 (1h)
- [ ] SUB-031: 앱 검수 요청 (2h)
- [ ] SUB-032: Facebook Auth Provider 연동 (2h)
- [ ] SUB-033: 로그인 플로우 구현 (2h)
- [ ] SUB-034: 권한 및 스코프 설정 (1h)

**Estimated**: 8h
**Actual**: -
**Status**: 📅 To Do

---

#### USER-006: 통합 인증 관리
**As a** developer
**I want to** manage auth state centrally
**So that** the app has consistent auth behavior

**Tasks:**
- [ ] SUB-035: Auth Context 생성 (2h)
- [ ] SUB-036: useAuth Hook 구현 (1h)
- [ ] SUB-037: 로그인 상태 관리 (1h)
- [ ] SUB-038: 로그아웃 기능 구현 (1h)
- [ ] SUB-039: 토큰 갱신 로직 (1h)

**Estimated**: 6h
**Actual**: -
**Status**: 📅 To Do

---

### 🔵 EPIC-003: Basic CRUD Operations
**Story Points**: 21
**Priority**: P1
**Assignee**: Backend Team

#### USER-007: Questions CRUD API
**As a** developer
**I want to** create Questions API
**So that** users can create and manage questions

**Tasks:**
- [ ] SUB-040: POST /api/questions 구현 (2h)
- [ ] SUB-041: GET /api/questions 구현 (2h)
- [ ] SUB-042: GET /api/questions/:id 구현 (1h)
- [ ] SUB-043: PUT /api/questions/:id 구현 (2h)
- [ ] SUB-044: DELETE /api/questions/:id 구현 (1h)
- [ ] SUB-045: 페이지네이션 구현 (2h)
- [ ] SUB-046: 필터링 및 정렬 (2h)

**Estimated**: 12h
**Actual**: -
**Status**: 📅 To Do

---

#### USER-008: Answers CRUD API
**As a** developer
**I want to** create Answers API
**So that** users can post answers

**Tasks:**
- [ ] SUB-047: POST /api/answers 구현 (2h)
- [ ] SUB-048: PUT /api/answers/:id 구현 (2h)
- [ ] SUB-049: DELETE /api/answers/:id 구현 (1h)
- [ ] SUB-050: POST /api/answers/:id/best 구현 (2h)
- [ ] SUB-051: 답변 투표 기능 (2h)

**Estimated**: 9h
**Actual**: -
**Status**: 📅 To Do

---

## 📊 Sprint Metrics

### Burndown Chart
```
Story Points Remaining:
Day 1:  76 ████████████████████████████████████████
Day 2:  72 ████████████████████████████████████
Day 3:  68 ████████████████████████████████
Day 4:  64 ████████████████████████████
Day 5:  58 ██████████████████████████
Day 6:  -- (Weekend)
Day 7:  -- (Weekend)
Day 8:  52 ████████████████████
Day 9:  45 ██████████████████
Day 10: 38 ████████████████
Day 11: 30 ████████████
Day 12: 20 ████████
Day 13: -- (Weekend)
Day 14: -- (Weekend)
Target: 0
```

### Team Velocity
- **Previous Sprint**: N/A (First Sprint)
- **Current Capacity**: 76 Story Points
- **Completed**: 0 Story Points
- **In Progress**: 6 Story Points
- **To Do**: 70 Story Points

### Risk Items
| Risk | Impact | Mitigation | Owner |
|------|--------|------------|-------|
| OAuth 앱 승인 지연 | High | 병렬로 3개 모두 신청 | Backend |
| 스키마 변경 필요 | Medium | 초기 설계 철저히 검토 | Backend |
| Supabase 제한 | Low | Pro 플랜 업그레이드 준비 | PM |

---

## 🔜 Sprint 2: Core Features (Next)
**Duration**: 2025-10-03 to 2025-10-16
**Sprint Goal**: Q&A 시스템과 AI 기능 구현

### Planned Stories (Draft)
1. **EPIC-004**: Q&A System Implementation
   - Questions 작성 UI
   - Answers 작성 UI
   - 목록 및 상세 페이지
   - 검색 기능

2. **EPIC-005**: AI Integration
   - OpenAI API 연동
   - 질문 자동 분류
   - 태그 자동 생성
   - 전문가 매칭

3. **EPIC-006**: Notification System
   - 실시간 알림
   - 이메일 알림
   - 푸시 알림 준비

**Estimated Story Points**: 89

---

## 🔄 Daily Standup Template

### Date: 2025-09-19
**Yesterday:**
- 프로젝트 문서 작성 (PRD, Execution Plan)
- Sprint 계획 수립

**Today:**
- [ ] Supabase 계정 생성 (SUB-001)
- [ ] 프로젝트 생성 (SUB-002)
- [ ] API 키 설정 (SUB-003)

**Blockers:**
- None

**Team Updates:**
- @Backend: Supabase 설정 시작
- @Frontend: 인증 UI 컴포넌트 준비
- @PM: 베타 테스터 모집 시작

---

## 📈 Definition of Done

### Story Level
- [ ] 코드 작성 완료
- [ ] Unit Test 작성 (Coverage > 60%)
- [ ] Code Review 완료
- [ ] Documentation 업데이트
- [ ] QA 테스트 통과

### Sprint Level
- [ ] 모든 Story 완료
- [ ] Integration Test 통과
- [ ] Performance Test 통과
- [ ] Sprint Review 완료
- [ ] Sprint Retrospective 완료

---

## 🏃 Action Items

### Immediate (Today)
1. **@Backend**: Supabase 프로젝트 생성 시작
2. **@Frontend**: 로그인 페이지 UI 작업
3. **@PM**: OAuth 앱 등록 시작
4. **@QA**: 테스트 시나리오 작성

### This Week
1. 데이터베이스 스키마 완성
2. 3개 OAuth 앱 모두 등록
3. 기본 인증 플로우 구현
4. CI/CD 파이프라인 설정

### Dependencies
- Kakao 개발자 계정 필요
- Google Cloud 결제 계정 필요
- Facebook 개발자 인증 필요
- Supabase Pro 플랜 검토

---

## 📝 Notes

### Technical Decisions
- Supabase over Firebase: Better PostgreSQL support
- shadcn/ui over MUI: Lighter, more customizable
- Zustand over Redux: Simpler state management

### Lessons Learned
- OAuth 앱 승인에 시간이 걸림 → 미리 신청
- 스키마 변경은 비용이 큼 → 초기 설계 중요
- 테스트 없이 진행하면 기술 부채 → TDD 적용

### Team Communication
- Daily Standup: 10:00 AM (Zoom)
- Sprint Review: 격주 금요일 4:00 PM
- Slack Channel: #viet-kconnect-dev
- GitHub: github.com/viet-kconnect/app

---

*Last Updated: 2025-09-19 18:00*
*Next Update: 2025-09-20 10:00 (Daily Standup)*
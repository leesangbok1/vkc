# 🗄️ DB 연동 진행 상황 (히스토리 전용)

> 진행 상황 체크리스트의 단일 기준점은 `claudedocs/PROGRESS.md` 입니다. 이 문서는 히스토리/세부 계획 참고용으로 유지됩니다.

**진행률**: 18% (완료 19 / 전체 108)
**현재 Phase**: Phase 1.1.5 - Google 로그인 연동 (최우선)

---

### 2025-10-27 점검 메모
- [ ] Supabase 환경 변수 미설정 시 mock 모드 진입 확인 (`lib/supabase-client.ts`, `lib/hooks/useAuth.ts`), 예외처리 및 배포 체크리스트 필요
- [ ] `app/page.tsx` 타입 오류(중복 타입 선언, 존재하지 않는 `User` 타입 참조) → DTO 정리 후 TS 빌드 통과 확인
- [ ] 검색/전문가 매칭/알림 API mock 가드 제거 및 최소 조회 기능 실데이터 연결 계획 수립
- [ ] 온보딩/알림 설정 로컬스토리지 의존 → 서버 저장 전환 로드맵 명시
- [ ] Persona 기반 QA 시나리오(질문 작성 → 답변 확인) 문서화 및 Supabase 실데이터 확보(시드 + 기본 콘텐츠)

---

## 🔴 Phase 1: 핵심 데이터 (최고 우선순위)

### 1.1 사용자 데이터 (users 테이블) ✅ 완료
- [x] Mock 데이터 분석 및 선정 (베트남 6명, 한국 3명, 일반 3명, 관리자 1명 = 13명)
- [x] scripts/1-seed-users.sql 작성
- [x] scripts/0-complete-setup.sql 통합 스크립트 작성
- [x] claudedocs/backup-mockdata/users-full.json 백업 생성
- [x] claudedocs/backup-mockdata/mapping-guide.md 매핑 가이드 작성
- [x] Supabase 프로젝트 리셋 대응 (신규 프로젝트: aamzgmhfshsgosjoywlu)
- [x] .env.local 업데이트 (새 API keys)
- [x] SQL 실행 (Supabase SQL Editor) - 데이터베이스 스키마 + 카테고리 + 사용자 통합
- [x] 검증: users 테이블 데이터 확인 (13명)
- [x] 검증: categories 테이블 데이터 확인 (8개)
- [x] 검증: Header 카테고리 드롭다운 정상 작동

**상태**: ✅ 완료
**담당**: Claude
**시작**: 2025-01-16 14:45
**완료**: 2025-01-16 17:00
**차단 이슈**: 없음

---

### 1.1.5 Google 로그인 연동 (Supabase Auth) 🔥 최우선
- [x] claudedocs/GOOGLE_OAUTH_SETUP.md 가이드 작성
- [ ] **사용자 액션 필요**: Supabase Auth Google OAuth 설정
  - [ ] Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
  - [ ] Supabase Dashboard에서 Google Provider 활성화
  - [ ] Redirect URL 설정: `https://aamzgmhfshsgosjoywlu.supabase.co/auth/v1/callback`
  - [ ] Client ID와 Client Secret을 Supabase에 입력
- [x] 로그인 페이지 DB 연동 (app/auth/login/page.tsx)
  - [x] Supabase Auth signInWithOAuth 구현
  - [x] Google 로그인 버튼 연동
  - [x] 에러 처리 UI 추가
  - [x] 로딩 상태 표시
- [x] 회원가입/프로필 생성 플로우 (app/auth/callback/route.ts)
  - [x] OAuth 콜백 핸들러 구현
  - [x] Google 로그인 성공 시 users 테이블 INSERT/UPDATE
  - [x] 온보딩 완료 여부 확인 및 리디렉션
  - [x] redirectTo 파라미터 통일 (next → redirectTo)
  - [x] 상세 로깅 추가
- [x] Header 컴포넌트 실제 DB 사용자 정보 표시 (components/layout/Header.tsx)
  - [x] Supabase Auth Session에서 user.id 가져오기
  - [x] users 테이블에서 프로필 정보 조회
  - [x] 온보딩 완료 여부 확인
  - [x] 역할(role) 기반 UI 표시
  - [x] 로그아웃 Supabase Auth signOut으로 전환
- [ ] 검증: Google 로그인 플로우 테스트 (사용자가 OAuth 설정 완료 후)
- [ ] 검증: 로그인 후 Header에 실제 사용자 이름 표시
- [ ] 검증: 세션 유지 및 로그아웃 동작

**상태**: 🟡 코드 구현 완료 → 사용자 OAuth 설정 대기 중
**의존성**: 1.1 완료 ✅
**담당**: Claude (코드) / 사용자 (OAuth 설정)
**시작**: 2025-01-16 17:00
**완료**: -
**차단 이슈**: Google OAuth 설정 필요 (사용자 액션)

---

---

### 1.2 질문 데이터 (questions 테이블)
- [x] Mock 데이터 분석 및 선정 (카테고리별 2-3개, 총 16-24개)
- [x] category_id 매핑 (17-24)
- [x] author_id 매핑 (1.1 사용자 UUID 사용)
- [x] scripts/2-seed-questions.sql 작성 (24개)
- [ ] claudedocs/backup-mockdata/questions-full.json 백업 생성
- [ ] SQL 실행 (Supabase SQL Editor)
- [ ] 검증: questions 테이블 데이터 확인
- [ ] 검증: 메인/카테고리/팔로잉에서 질문 표시 확인
- [ ] 검증: 질문 상세 페이지 동작 확인

**상태**: 🟡 스크립트 작성 완료 → 실행 대기
**의존성**: 1.1 완료 필요
**담당**: -
**시작**: -
**완료**: -

---

### 1.3 답변 데이터 (answers 테이블)
- [x] Mock 데이터 분석 및 선정 (질문당 2-4개, 총 32-96개)
- [x] scripts/3-seed-answers.sql 작성
- [ ] question_id 매핑 (1.2 질문 UUID 사용)
- [ ] author_id 매핑 (1.1 사용자 UUID 사용)
- [ ] Certified User 답변 우선 포함
- [ ] claudedocs/backup-mockdata/answers-full.json 백업 생성
- [ ] SQL 실행 (Supabase SQL Editor)
- [ ] 검증: answers 테이블 데이터 확인
- [ ] 검증: 질문 상세 페이지 답변 표시 확인
- [ ] 검증: Certified User 답변 배지 표시 확인

**상태**: 🟡 스크립트 작성 완료 → 실행 대기
**의존성**: 1.2 완료 필요
**담당**: -
**시작**: -
**완료**: -

---

## 🟡 Phase 2: 인터랙션 데이터 (중요)

### 2.1 투표 데이터 (votes 테이블)
- [ ] 초기 투표 데이터 설계 (질문/답변별 5-10개 투표)
- [ ] scripts/4-seed-votes.sql 작성
- [ ] SQL 실행 (Supabase SQL Editor)
- [ ] API 연동: /api/questions/[id]/vote (POST)
- [ ] API 연동: /api/answers/[id]/helpful (POST)
- [ ] ActionBar 컴포넌트 DB 연동
- [ ] 검증: 도움됨 버튼 클릭 시 votes 테이블 INSERT 확인
- [ ] 검증: upvote_count 업데이트 확인

**상태**: ⚪ 대기 중
**의존성**: Phase 1 완료 필요
**담당**: -
**시작**: -
**완료**: -

---

### 2.2 알림 데이터 (notifications 테이블)
- [ ] 초기 알림 데이터 설계 (사용자별 5-10개)
- [ ] 알림 타입별 샘플 데이터 작성 (answer, comment, vote, system)
- [ ] scripts/5-seed-notifications.sql 작성
- [ ] SQL 실행 (Supabase SQL Editor)
- [ ] 검증: notifications 테이블 데이터 확인
- [ ] 검증: NotificationCenter 컴포넌트 표시 확인
- [ ] 검증: /notifications 페이지 동작 확인
- [ ] 검증: 읽지 않은 알림 카운트 표시

**상태**: ⚪ 대기 중
**의존성**: Phase 1 완료 필요
**담당**: -
**시작**: -
**완료**: -

---

### 2.3 북마크 시스템 (bookmarks 테이블 - 신규)
- [x] scripts/6-create-bookmarks-table.sql 작성
- [ ] SQL 실행 (Supabase SQL Editor)
- [ ] API 개발: GET /api/bookmarks (사용자 북마크 목록)
- [ ] API 개발: POST /api/bookmarks (북마크 추가)
- [ ] API 개발: DELETE /api/bookmarks/[id] (북마크 삭제)
- [ ] BookmarkButton 컴포넌트 DB 연동 (lib/utils/bookmark-manager 대체)
- [ ] 검증: /bookmarks 페이지 동작 확인
- [ ] 검증: 북마크 추가/삭제 동작

**상태**: 🟡 스키마 스크립트 완료 → 실행 대기
**의존성**: Phase 1 완료 필요
**담당**: -
**시작**: -
**완료**: -

---

## 🟢 Phase 3: 콘텐츠 데이터 (중간 우선순위)

### 3.1 정보글 데이터 (posts / questions 테이블)
- [ ] 테이블 구조 결정 (Option A: questions에 type='post' OR Option B: 별도 posts 테이블)
- [ ] Mock 데이터 선정 (5-8개, Sidebar 뉴스 포함)
- [ ] scripts/7-seed-posts.sql 작성
- [ ] claudedocs/backup-mockdata/posts-full.json 백업 생성
- [ ] SQL 실행 (Supabase SQL Editor)
- [ ] API 개발: GET /api/posts (정보글 목록)
- [ ] API 개발: GET /api/posts/[id] (정보글 상세)
- [ ] Sidebar.tsx 동적 뉴스 연동 (하드코딩 제거)
- [ ] 검증: 메인 페이지 정보글 표시
- [ ] 검증: /posts/[id] 페이지 동작
- [ ] 검증: Sidebar 최신 뉴스 3개 표시

**상태**: ⚪ 대기 중
**의존성**: Phase 1 완료 필요
**담당**: -
**시작**: -
**완료**: -

---

### 3.2 댓글 데이터 (comments 테이블)
- [ ] 초기 댓글 데이터 설계 (질문/답변당 2-3개)
- [ ] scripts/8-seed-comments.sql 작성
- [ ] SQL 실행 (Supabase SQL Editor)
- [ ] 검증: comments 테이블 데이터 확인

**상태**: ⚪ 대기 중 (선택사항)
**우선순위**: 낮음

---

### 3.3 팔로우 시스템 (user_follows, topic_subscriptions 테이블 - 신규)
- [x] user_follows 테이블 스키마 + RLS 작성(`supabase/migrations/009_create_user_follows.sql`)
- [ ] topic_subscriptions 테이블 스키마 작성
- [x] API 개발: POST /api/users/[id]/follow (사용자 팔로우)
- [x] API 개발: DELETE /api/users/[id]/follow (언팔로우)
- [ ] API 개발: GET /api/following/feed (옵션)
- [x] 팔로우 버튼 DB 연동(일부 페이지 적용, 낙관적 갱신 최소형)
- [ ] 검증: /following 페이지 서버 피드 완전 전환(로그인 필요)
- [ ] 검증: 토픽 구독 버튼 동작

**상태**: 🟡 API/DDL 일부 완료 → 마이그레이션/페이지 반영 진행 중
**의존성**: Phase 1 완료 필요
**담당**: -
**시작**: -
**완료**: -

---

## 🟣 Phase 4: 관리자 기능 (낮은 우선순위)

### 4.1 배너 데이터 (banners 테이블 - 신규)
- [ ] banners 테이블 스키마 작성
- [ ] 초기 배너 데이터 작성 (MOCK_BANNERS 기반)
- [ ] scripts/10-create-banners-table.sql 작성
- [ ] SQL 실행 (Supabase SQL Editor)
- [ ] API 개발: GET /api/banners (배너 목록)
- [ ] API 개발: PUT /api/admin/banners/[id] (배너 수정)
- [ ] 관리자 페이지 배너 관리 연동
- [ ] BannerCarousel 컴포넌트 DB 연동
- [ ] 검증: 메인 페이지 배너 표시

**상태**: ⚪ 대기 중 (선택사항)
**우선순위**: 최저

---

### 4.2 인증 관리 (certification_requests 테이블 - 신규)
- [ ] certification_requests 테이블 스키마 작성
- [ ] scripts/11-create-certifications-table.sql 작성
- [ ] SQL 실행 (Supabase SQL Editor)
- [ ] API 개발: GET /api/admin/certifications (인증 요청 목록)
- [ ] API 개발: PUT /api/admin/certifications/[id]/approve (승인)
- [ ] API 개발: PUT /api/admin/certifications/[id]/reject (거부)
- [ ] 관리자 인증 관리 페이지 연동
- [ ] 검증: /admin/certifications 페이지 동작

**상태**: ⚪ 대기 중 (선택사항)
**우선순위**: 최저

---

## 📦 백업 작업

### Mock 데이터 백업
- [ ] claudedocs/backup-mockdata/README.md 작성
- [ ] users-full.json 생성 (lib/data/mockData.ts에서 추출)
- [ ] questions-full.json 생성 (MOCK_QUESTIONS 전체)
- [ ] answers-full.json 생성 (MOCK_ANSWERS 전체)
- [ ] posts-full.json 생성 (MOCK_POSTS 전체)
- [ ] banners-full.json 생성 (MOCK_BANNERS 전체)
- [ ] mapping-guide.md 작성 (Mock ID → DB UUID 매핑 가이드)

**상태**: ⚪ 대기 중
**담당**: -

---

## 📊 전체 통계

- **전체 작업**: 95개
- **완료**: 5개 (5%)
- **진행 중**: 0개
- **대기 중**: 90개 (95%)
- **현재 Phase**: 문서화 완료, Phase 1 시작 대기
- **예상 완료일**: 2025-01-23 (7일 소요 예상)

---

## 🚨 차단 이슈

없음

---

## 📝 주요 메모

### 완료된 사전 작업
1. ✅ Supabase 연결 설정
2. ✅ 데이터베이스 스키마 (7개 테이블)
3. ✅ 카테고리 데이터 (8개, ID: 17-24)
4. ✅ Header 카테고리 동적 로딩
5. ✅ 한국어 검색 'simple' 설정

### 발견 사항
- topics/[slug]/page.tsx에 로컬 Mock 중복 정의 → 제거 예정
- NotificationCenter는 이미 DB 연동 코드 존재 → 테스트만 필요
- 일부 컴포넌트는 localStorage 기반 → DB로 마이그레이션 필요

### 다음 우선 작업
1. Phase 1.1: 사용자 데이터 작업 시작
2. Mock 데이터 백업 파일 생성

---

**작업 시 체크리스트 업데이트 방법**:
1. 작업 시작 시: **상태**를 "🟡 진행 중"으로 변경, **시작** 날짜 기록
2. 작업 완료 시: 체크박스에 ✅ 표시, **상태**를 "✅ 완료"로 변경, **완료** 날짜 기록
3. 차단 시: **차단 이슈** 섹션에 기록
4. 매 세션 종료 시: **최종 업데이트** 날짜/시간 갱신, **전체 통계** 업데이트

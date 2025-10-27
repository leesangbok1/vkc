# ✅ Unified Progress Tracker (Single Source of Truth)

본 파일은 진행 상황 체크리스트의 단일 기준점입니다. 상세 설계/분석/RCA 문서는 아카이브로 유지하고, 진행/잔여/차단 현황은 이 문서만 갱신합니다.

참고 문서(변경 없음)
- 마스터 플랜/진척: `claudedocs/DB_MIGRATION_MASTER_PLAN.md`, `claudedocs/DB_MIGRATION_SESSION_LOG.md`
- 진행 로그: `claudedocs/WORKLOG.md`
- 상태 대시보드: `docs/project/STATUS_2025-10-16.md`
- OAuth 가이드: `claudedocs/GOOGLE_OAUTH_SETUP.md`
- Q&A 연동 설계: `docs/project/PLAN_QNA_DB_INTEGRATION.md`
- 인증/하이드레이션 RCA: `docs/project/AUTH_AND_HYDRATION_RCA_2025-10-16.md`

---

## 2025-10-17
- [x] 빌드/접속 불가 원인 제거(동적 import, Suspense, JSX 태그 오류)
- [x] `/api/questions` 정렬/검증/로깅 보강
- [x] `/categories/[slug]` → 서버 데이터(`sort=recent`) 연동, 실패 시 빈 상태
- [x] `/following` → 서버 피드(`following=true`)로 전환(401 → 로그인 리다이렉트)
- [x] `user_follows` DDL + RLS 스크립트 추가
- [x] Follow API(POST/DELETE) 응답 계약 통일 `{ success, isFollowing }`
- [x] 번역 확장으로 인한 hydration 이슈 최소화(ClientOnly/Suspense)
- [x] 인기순 피드 fallback 적용(업보트 0일 때 최신순 자동 전환)
- [x] /my-questions 페이지 DB 연동(현재 사용자 질문 최신순 조회)
- [x] /following 피드 정렬 popular로 전환(메인 인기 규칙 적용)
- [x] 팔로잉 빈 상태 CTA 추가(팔로우 사용자 찾아보기)
- [x] 인기 사용자 API `GET /api/users/popular` 및 탐색 페이지 `/users/discover` 추가

## 2025-10-18
- [x] 홈 이벤트 모달 7일 스누즈(안보기) 옵션 추가 및 상태 저장 구조 개편
- [x] Quick Tour 노출 횟수 제한(가입 후 최대 2회) 및 상태 관리 보완
- [x] 로그아웃 시 모달/투어 상태 보존 처리 및 Quick Tour 토픽 안내 위치 조정
- [x] `/api/auth/profile` 온보딩 업데이트 시 신규 사용자 자동 삽입(세션 기반) 로직 보강
- [x] 프로필 기본 삽입 시 관리자 컬럼 존재 여부 감지 → 있을 경우에만 `admin_yn='N'` 설정 (스키마 미보유 환경 대응)
- [x] `admin_yn` 컬럼 탐지 시 REST 오류코드(`PGRST204`,`42703`) 대응 보강
- [x] 온보딩 관심 토픽/기본 정보 저장 및 프로필 뷰 반영(관심 토픽, 거주지, 성별 등)
- [x] 프로필 부트스트랩 시 서비스 롤 fallback(upsert) 적용으로 RLS/스키마 미스매치 대응
- [x] `public.posts` 테이블/RLS 정책 적용 및 `/api/posts` → Supabase 실데이터 연동 (작성/조회)
- [x] `내 게시글` 화면 질문/정보글 탭 통합 및 작성 후 탭별 리다이렉션 정비
- [x] `/api/questions/[id]` 및 상세 페이지 Supabase 실데이터 연동(질문/답변 로딩, 답변 작성/채택 API 사용)
- [x] `/posts/new` 카테고리 드롭다운을 `/api/categories` 기반 실데이터로 전환

## (관리자 로그인)
| 영역 | 확인 항목 | 상태 | 메모 |
|------|-----------|------|------|
| 홈/모달 | 통합 피드 로드, 이벤트 모달, Quick Tour | ⚠️ 부분 | `/api/questions` 정상 호출, 실패 시 mock. 이벤트 모달 7일 스누즈/Quick Tour 2회 제한 적용, 피드 공통 레이아웃/정렬 정리 예정 |
| 질문/검색 | 리스트, 정렬, 검색, 카테고리 탭 | ⚠️ 부분 | 리스트·검색 API 호출은 동작, 카테고리 탭은 정적 링크. 정렬(전체/최신) UI와 필터 로직 정돈 필요 |
| 질문 상세/답변 | 상세 조회, 답변 작성/채택, Helpful | ✅ 완료 | `/api/questions/[id]` + `/api/questions/[id]/answers` Supabase 연동 완료, 답변 작성/도움됨/채택 실시간 반영 |
| 질문/포스트 작성 | `/questions/new`, `/posts/new` | ⚠️ 부분 | 질문 작성은 API POST 후 `/my-questions` 이동, 온보딩/리다이렉트 재정의 필요. 포스트 작성은 관리자만, 성공 후 홈으로 이동 |
| 팔로우/토픽 | `/following`, `/users/discover`, `/topics` | ⚠️ 부분 | 팔로잉 피드는 API 연동, Follow 토글 낙관 갱신/실패 롤백 미비. 토픽 구독은 localStorage 기반 |
| 북마크/미션 | `/bookmarks`, `/missions` | ⚠️ 부분 | Auth 확인 후 localStorage 데이터 렌더링. 서버 북마크/미션 진행도 미구현 |
| 프로필/설정 | `/profile`, `/my-questions`, `/settings` | ⚠️ 부분 | 프로필/설정 편집은 로컬 상태. “내 질문”만 존재, Ask/Post 분리 필요. 온보딩 기본 정보/관심 토픽은 표시됨 |
| 관리자 | `/admin`, `/admin/certifications` | ⚠️ 부분 | 배너/인증 모두 mock 및 localStorage. Supabase admin API와 연결 필요 |
| 헤더/내비 | 브랜드 영역, 전체 게시글 링크 | ✅ 완료 | 텍스트 로고 적용, `/posts` 전체 게시글 페이지 및 헤더 아이콘 복원 |
| 공통 모달 | 이벤트, Quick Tour, 로그인 프롬프트 | ⚠️ 부분 | 모달 노출 횟수/만료 제어 미흡. 전역 규칙 정립 필요 |

## 2025-10-20
- [x] `/api/questions/[id]` + 상세 화면 Supabase 실데이터 연동(질문/답변, 작성/채택/도움됨 포함)
- [x] `/posts/new` → `/api/categories` 실데이터 기반 드롭다운 및 카테고리 검증
- [x] 정보 글/답변 길이 제한을 질문과 동일하게 조정(최소 5자/10자)
- [x] 답변 작성/도움됨/채택 API에서 불필요한 RPC 호출 제거 및 오류 처리 강화
- [x] 헤더 텍스트 로고/전체 게시글 아이콘 추가 및 `/posts` 전체 게시글 페이지 복원(인기/최신/전체 뷰)
- [x] 사이드바 뉴스 섹션을 Supabase `posts` 실데이터 기반으로 전환

## 2025-10-21
- [x] 홈/전체/질문/카테고리/팔로잉 피드를 `FeedCard` / `FeedBoard` 공통 패턴으로 정리, 정렬 규칙(전체·인기·최신) 통합
- [x] `AuthProvider`를 전역(`ClientProviders`)에 연결해 Supabase 세션 흐름 일원화
- [x] 팔로잉 페이지 2열 레이아웃 구성(좌: 추천, 우: 팔로잉 피드) 및 토픽 연관도 + 인기 점수 기반 추천 정렬
- [x] 답변 작성 흐름을 Supabase API(`/api/questions/[id]/answers`)로 전환, 알림 모달 이메일 로딩도 세션 기반으로 개선
- [x] `/posts/new` 접근 조건을 '로그인 사용자 모두'로 통일하고(목업 분기 제거), 관리자 전용 기사 작성 화면(`/admin/news/new`) 신설
- [x] `supabase/migrations/010_create_posts_table.sql` 추가(Posts 테이블·RLS·트리거 정의) 및 `/api/posts`에 게시글 유형·관리자 검증 로직 반영
- [x] `/api/users/:id` Supabase 기반 프로필/활동 API 신규 작성 및 `/users/[id]` 화면 Supabase 연동(목업은 폴백으로 유지)
- [x] Follow API에 자기 자신 팔로우 제한 추가, 프로필 화면에서도 동일한 검증/상태 반영
- [x] 남은 목업 fallback 제거 → Supabase 연결 실패 시 빈 배열 반환으로 통일 (홈 피드, `/api/questions`, 사용자 프로필)
- [x] `/questions/new` 인증 확인을 `/api/auth/profile` 기반으로 변경(“인증 확인 중…” 무한 상태 해결)
- [x] 웰컴 이벤트 모달·Quick Tour를 사용자 UUID별 1회 노출 구조로 재구성 (로컬스토리지 키: `vietkconnect_event_modal_state_<UUID>`, `vietkconnect_tour_state_<UUID>`)
- [x] 온보딩 기본 정보(거주 상태/성별/연령대/관심 카테고리/관심 토픽)를 프로필 화면에 통합, `/api/auth/profile` 저장 시 Supabase `users` 컬럼 갱신
- [x] 관심 토픽 변경 시 `vietkconnect_subscribed_topics`와 동기화하도록 subscribeTopic 로직 보강
- [ ] 질문 카드 도움됨은 Supabase 연동 완료, 포스트 도움됨 버튼은 추가 API 연동 필요 — 답변 도움됨은 정상 작동
- [ ] 북마크/알림/공유/계정 관리 다수 영역이 localStorage·목업 데이터에 의존(서버 연동 계획 수립 필요)
- [ ] 팔로우 토글 낙관 갱신 시 실패 롤백/토스트 일관 처리 필요, 팔로우 추천 API는 준비됐으나 SQL 마이그레이션 실행 확인 필요

## 2025-10-22
- [x] 질문 상세/피드에서 도움됨 토글 후 새로고침 시 상태가 유지되도록 `votes` 기반 재집계와 서버 동기화 로직을 보강(listQuestions/getQuestionById)
- [x] `/api/questions/:id/helpful` 기본 핸들러와 클라이언트 요청에 `credentials: 'include'`를 적용해 사용자별 helpful 상태 및 추적 정확도를 향상
- [x] `StatusBadge` 컴포넌트를 도입해 해결됨·미해결 툴팁을 표준화하고 카테고리·피드·내 질문 화면에 일괄 적용
- [x] 채택 배지에 툴팁을 추가해 “채택됨 = 해결됨” 규칙을 시각적으로 안내하고 용어 혼선을 방지
- [x] RichEditor를 WYSIWYG(contentEditable) 기반으로 재구성하고 Bold/Italic/머리글/목록/링크/이미지 버튼이 즉시 스타일을 적용하도록 개선

### 기능 현황 스냅샷 (2025-10-21)
| 기능 | 현재 상태 | 비고 |
|------|-----------|------|
| 도움됨 | ✅ 답변: Supabase API 연동<br>⚠️ 질문/포스트: UI 토글만, API 미연동 | `/api/answers/[id]/helpful` 정상 동작 |
| 북마크 | ⚠️ localStorage 기반, 서버 저장 미구현 | `BookmarkButton` → `lib/utils/bookmark-manager.ts` |
| 알림 | ⚠️ NotificationSetupModal / NotificationCenter 모두 mock/localStorage | `/api/notifications` 일부 스텁 |
| 공유하기 | ⚠️ `ShareButton` 은 navigator 공유/클립보드 fallback만 구현 | 서버 기록 없음 |
| 계정관리 | ⚠️ 프로필/설정 편집 localStorage + 제한적 PUT API | `/api/auth/profile` 업데이트 범위 축소 |
| 팔로잉 | ✅ API/피드/추천 UI 완성<br>⚠️ follow SQL 실행/낙관 갱신 보완 필요 | `/api/users/[id]/follow`, `/api/users/popular` |

### 다음 작업 계획
1. **Supabase 연동 보강**
   - [ ] `user_follows` SQL/RLS 실행 확인 및 follow 버튼 오류 처리 통합
   - [ ] 질문/포스트 ActionBar 도움됨 → 서버 API 연결, 낙관 갱신 설계
   - [ ] 북마크/알림/계정 관리 API 스펙 정의 및 localStorage 의존성 제거
2. **데이터 시드 / 테이블 확장**
   - [ ] posts 테이블 스키마/시드 배포 상태 점검, Phase 1 질문·답변 시드 실행
   - [ ] DTO 보강(작성자 이름/카테고리 join)으로 카드 메타데이터 완전화
3. **UX / QA**
   - [ ] 팔로우 추천 패널에 토스트/로딩 피드백 추가, 실패 롤백 검증
   - [ ] 통합 피드 정렬/필터 UX 개선(전체/인기/최신 탭 유지, 질문/포스트 구분은 UI 비노출)
   - [ ] E2E 스모크 시나리오(로그인 → 질문 작성/답변/팔로우/팔로잉) 업데이트

## 진행 중(핵심)
- [ ] user_follows 마이그레이션 SQL 실행 및 RLS 검증(SELECT/INSERT/DELETE)
- [ ] Follow 버튼 낙관 갱신 강화(실패 롤백/토스트 공통 컴포넌트)
- [ ] Supabase 타입 생성(lib/database.types.ts) → `@ts-ignore` 축소
- [ ] E2E 스모크(로그인 → 정렬 → 카테고리 → 팔로우 → 팔로잉 → 상세)

## Google OAuth(코드 완료 / 콘솔 설정 대기)
- [x] 로그인 페이지(`/auth/login`) 및 콜백 라우트(`/auth/callback`) 구현
- [x] Header 사용자 정보/역할 배지 연동
- [ ] Google Console / Supabase Provider 설정(사용자 액션)
- [ ] 로컬 테스트(세션 생성/유지/로그아웃) 확인
  - 가이드: `claudedocs/GOOGLE_OAUTH_SETUP.md`

## Q&A 서버 연동(범위: 질문 리스트/상세)
- API
  - [x] GET `/api/questions`(popular/recent, category, following, limit/offset)
  - [x] GET `/api/questions/[id]` 기본 골격
  - [x] 로깅/검증 보강(sort 허용값 체크, 에러 로깅)
  - [x] POST `/api/questions` 질문 등록(인증 필요)
  - [x] popular 정렬 fallback(업보트 전부 0이면 최신순으로 재요청)
- 페이지
  - [x] 홈(/) → 서버 데이터 사용(폴백 구 UI 제거)
  - [x] /questions → 정렬 토글(별도 구현됨)
  - [x] /categories/[slug] → category=slug, sort=recent
  - [x] /my-questions → author 기반 최신순 조회(DB)
- [x] /following → following=true(로그인 필요)
- [x] /users/discover → 인기 사용자 목록 + 팔로우 토글
- [ ] /questions/[id] 상세 데이터 매핑 보강(author/category join)

- [x] `/api/questions/[id]/answers` 서비스 롤 우선 조회 + 클라이언트 fallback으로 재작성(승인 전 질문도 404 없이 조회)
- [x] 답변 중복 체크·카운트 증가·알림 생성을 service/client 이중 경로로 정리해 환경 변수 미설정 시에도 동작
- [x] `questions.last_activity_at` 컬럼명으로 정리해 42703 오류 없이 답변 작성 가능
- [x] answers 테이블 스키마에 맞춰 insert payload 정리(`is_anonymous` 등 비존재 컬럼 제거) → PGRST204 해결
- [x] 질문 리스트 API에 실데이터 기반 스코어링(조회/답변/채택/최근 활동/관심 토픽/팔로우 가중치) 도입 및 DTO 확장 → 목업 없는 인기 순위 계산
- [x] `/api/posts`를 posts.service 기반으로 전환, helpful/댓글/관심 토픽/팔로우/뉴스 가중치 스코어링 적용
- [x] 공통 RichEditor 컴포넌트 도입(마크다운, 미리보기, 이미지 업로드) 및 AnswerForm/PostCreateModal 교체
- [x] `/api/uploads` 파일 업로드 API 추가(5MB 이하 이미지, Supabase Storage `user-uploads` 버킷 기준)
- [x] `/questions/new`, `/posts/new`, `/admin/news/new`, 답변 작성 폼을 동일 RichEditor 규칙(B/I/링크/불릿/이미지)과 검증으로 통일
- [x] 관리자 인증 페이지(`/admin/certifications`) 및 VerificationApproval 위젯을 Supabase 실데이터와 approve/reject API로 연결
- [x] Supabase 세션 쿠키 인코딩을 `base64url`로 통일해 Next.js 15 환경에서 Base64 디코딩 오류(`"Invalid Base64-URL character"` ) 해결

## 2025-10-23
- [x] `/api/questions/[id]/helpful` 추가로 질문 도움됨 토글 API 구현(본인 질문 예외 처리 포함) 및 ActionBar와 피드 카드에 실데이터 연결
- [x] `lib/services/feed-utils.ts` → viewer context가 사용자의 helpful 투표 내역을 포함하도록 확장, 질문/포스트 DTO에서 `is_helpful_by_viewer` 노출
- [x] 질문 상세/피드에서 도움됨 상태·카운트를 보여주고 새로고침 후에도 유지되도록 동기화
- [x] RichEditor 버튼 동작/이미지 업로드 오류 처리/링크 삽입 UX 보완(5MB 초과 경고, http/https 자동 보정)
- [x] `/api/admin/overview`가 Supabase 실데이터(사용자/질문/답변/대기 인증 등) 집계하도록 정리하고 권한 실패 시 경고 처리

## 2025-10-22
- [x] 헤더/메인 컨테이너 최대 폭 및 패딩 통일(1040px)로 데스크톱 좌우 정렬 보정, 상단 여백 1/3 수준으로 축소
- [x] `main-container`/`main-layout`를 640px 콘텐츠 폭 기준으로 재구성하고 히어로/카드 패딩을 줄여 전체 레이아웃을 컴팩트하게 조정
- [x] FeedCard 헤더 리디자인(토픽 라벨을 작성자 옆으로 이동, 아바타/닉네임/시간/팔로우/신고 간격 압축) 및 카드 패딩·타이포·통계 영역 슬림화
- [x] 질문/포스트 첨부 이미지를 최대 4장 그리드 + `+N` 오버레이로 노출하도록 공통 `mediaUrls` 파이프라인 도입
- [x] 홈/카테고리/팔로잉/공통 피드에 새 카드 패턴 적용, 사이드바 배너는 `BannerCarousel` 슬라이드 한 곳으로 통합

## 2025-10-27 (계획)
- [x] 헤더 프로필 메뉴 단순화 (프로필/내 게시글/User Rank·미션/설정만 유지, 관리자 전용 항목만 조건부 유지)
- [x] User Rank & 미션 통합 내비게이션 구성 및 페이지 설계 반영
- [ ] 사이트 전역 와이어프레임 갱신 (게시글 우선 UX, 슬림 헤더 필터, 패턴 재정의) 및 `claudedocs/mockups/` 아카이브 정리
- [ ] PostCard/레이아웃/모바일 퍼스트 패턴 설계 초안 작성 (`UI_WIREFRAME_TRACKER.md`에 기록)
- [x] DB 연동 이슈·타입 오류 체크리스트 최신화 (실데이터 기반 테스트 시나리오 포함)
- [~] 모바일 퍼스트 레이아웃 기준 정립 (`PageLayout`/`PageFrame` 설계, 브레이크포인트 정의) — `main-layout`/`main-container` 모바일 기본값 적용, 추가 페이지 검증 필요
- [x] 홈 피드 모바일 개선 (카테고리 그리드 제거, 배너는 사이드바 슬라이드로 통합)
- [x] FeedCard 패턴 개편(토픽/신고 버튼/이미지 갤러리) 및 공통 사용처 업데이트
- [ ] 메인/질문/전체 게시글 레이아웃을 모바일 우선 패턴으로 전환 (필터 바 컴팩트화 포함)
- [ ] 공통 PostCard/FilterBar 패턴 코드화 및 기존 페이지 적용 단계별 계획 수립

## 2025-10-28
- [x] 정보/뉴스 게시글 작성 성공 시 `/posts`로 리다이렉트 및 신규 글 하이라이트 쿼리 전달
- [x] FeedBoard에 하이라이트 스크롤/시각 효과 추가 및 전체 게시글 화면에서 `highlight` 파라미터 처리
- [x] ActionBar 도움됨 토글을 로컬 스토리지와 동기화해 새로고침·네트워크 실패 시에도 상태 유지

## 팔로우(서버)
- 마이그레이션
  - [x] `supabase/migrations/009_create_user_follows.sql` 추가
  - [ ] Supabase SQL Editor에서 실행 + RLS 동작 확인
- API
  - [x] POST `/api/users/[id]/follow` → `{ success: true, isFollowing: true }`
  - [x] DELETE `/api/users/[id]/follow` → `{ success: true, isFollowing: false }`
- UI
  - [x] /following 서버 피드 전환
  - [ ] Follow 버튼 낙관 갱신/실패 롤백

## 북마크(예정)
- [x] DDL 스크립트: `scripts/6-create-bookmarks-table.sql`
- [ ] SQL 실행 및 API(목록/추가/삭제) 구현
- [ ] BookmarkButton DB 연동(/bookmarks 페이지 포함)

## 시드/데이터(Phase 1)
- [x] `scripts/2-seed-questions.sql` (24개)
- [x] `scripts/3-seed-answers.sql` (초안 작성)
- [ ] 시드 실행 및 질문/답변 실제 데이터 확인

## 품질/빌드
- [x] JSX/동적 import/CSR bail‑out 정리로 빌드 성공
- [ ] ESLint/TS 경고 단계적 해소(현재 빌드 차단 해제 설정, 원복 예정)

## 차단/메모
- OAuth 콘솔 설정(사용자 액션) 완료 전까지 로그인/E2E 일부 시나리오 대기
- 자동 번역 사용 정책 유지 → SSR 민감 텍스트 구간은 CSR 전환으로 대응

## 다음 우선 순위 작업 (우선도 순)
1. **P0 – 공통 피드/데이터 계층 재구성**
   - Supabase 뷰/함수로 질문·포스트 스코어(조회수, 채택/답변, 최근 7일 활동량, 팔로우/관심 토픽 가중치) 정의
   - `lib/services/questions.service.ts`/신규 posts 서비스 및 `/api/questions`, `/api/posts`, `/api/users/*` DTO 정합성 통일
   - `FeedBoard`·`FeedCard` 소비 구조 업데이트, 목업 fallback 제거
2. **P0 – 에디터/업로드 실구현**
   - 공통 에디터 컴포넌트 설계(마크다운 렌더링, Bold/Italic/리스트/코드 단축키)
   - 이미지·파일 업로드용 Supabase Storage 버킷 및 `/api/uploads` 작성, 질문/답변/포스트 작성 흐름에 통합
   - 기존 AnswerForm/PostCreateModal/질문 작성 UI를 신규 에디터로 교체하고 밸리데이션/미리보기 정리
3. **P1 – 사용자 컨텍스트 기능 실데이터화**
   - `notifications` API(RLS·목록·읽음·생성)와 NotificationCenter 교체
   - 질문/포스트 도움됨·좋아요 액션을 실테이블에 연결하고 낙관 갱신/토스트 공통 훅화
   - `bookmarks` 테이블 적용 및 `/api/bookmarks` + BookmarkButton 페이지 교체, 팔로우 낙관 갱신 재사용
4. **P1 – 인증/프로필 파이프라인 고도화**
   - 온보딩 정보 기반 자동 닉네임 규칙을 서버 API로 이관, 닉네임 생성·중복 체크 재정의
   - 프로필 이미지/인증 서류 업로드(Supabase Storage), `users` 확장 컬럼 반영
   - 관리자 대시보드 `/api/admin/certifications` 실데이터 CRUD, 배지/닉네임 편집 기능 구현, 프론트 VerifiedBadge 공통화
5. **P2 – 전역 피드백/품질 보강**
   - 글로벌 토스트/모달 상태 관리 통합으로 인증/공유/알림 UX 안정화
   - `lib/database.types.ts` 자동 생성 파이프라인 도입, `@ts-ignore` 정리
   - 통합 E2E 시나리오(로그인→질문/답변→도움됨→팔로우→알림) 및 Vitest 스모크 추가

### ⚠️ 주의 및 후속 에이전트 참고
- Supabase `public.users`에 온보딩 컬럼(`onboarding_completed`, `residence`, `gender`, `age`, `category`, `interests`)이 없다면 먼저 아래 스크립트를 실행하세요.
  ```sql
  ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS residence TEXT,
    ADD COLUMN IF NOT EXISTS gender TEXT,
    ADD COLUMN IF NOT EXISTS age TEXT,
    ADD COLUMN IF NOT EXISTS category TEXT,
    ADD COLUMN IF NOT EXISTS interests TEXT[];
  NOTIFY pgrst, 'reload schema';
  ```
- 질문/답변/게시글을 초기화한 뒤에는 반드시 실제 데이터를 등록해야 합니다. mock ID(`mock-question-1` 등)를 클릭하면 404가 발생합니다.
- 웰컴 배너·Quick Tour QA 시에는 `localStorage.removeItem('vietkconnect_event_modal_state_<UUID>')`, `localStorage.removeItem('vietkconnect_tour_state_<UUID>')`로 상태를 초기화한 뒤 확인하세요.
- `/questions/new`는 `/api/auth/profile`이 401이면 즉시 `/auth/login`으로 리다이렉트합니다. 테스트 전 로그인 세션을 확인하세요.
- 관심 토픽 목록을 변경할 경우 프로필 페이지의 `TOPIC_OPTIONS`도 함께 갱신해야 로컬스토리지의 구독 목록과 일치합니다.

---

## 작업 내역 레퍼런스
- 코드 수정(대표):
  - DB 연동: `app/categories/[slug]/page.tsx`, `app/following/page.tsx`, `app/api/questions/route.ts`, `lib/services/questions.service.ts`
  - 팔로우: `supabase/migrations/009_create_user_follows.sql`, `app/api/users/[id]/follow/route.ts`
  - 빌드 안정화: `app/layout.tsx`, `app/auth/login/page.tsx`, `app/onboarding/page.tsx`, `app/search/page.tsx`, `components/common/ClientOnly.tsx`
- 문서: `docs/project/AUTH_AND_HYDRATION_RCA_2025-10-16.md`, `claudedocs/GOOGLE_OAUTH_SETUP.md`, `docs/project/STATUS_2025-10-16.md`, `claudedocs/WORKLOG.md`

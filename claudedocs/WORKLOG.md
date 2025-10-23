# Worklog

원칙: 작업 전 기존 작업 확인 → 패턴 기준 검토 → 변경 → 기록.

## 2025-10-16
- 작업: PageLayout 도입 및 주요 페이지 적용 (centered/withSidebar)
- 커밋: be5c0f0, 44acbd3, 9d2ad8b, 99b9022
- 기준/패턴:
  - centered: settings/profile/notifications/missions/bookmarks/wallet/following/topics/categories/posts/events
  - withSidebar: questions 상세
- 사전 확인:
  - 기존 레이아웃 사용 현황 점검 (main-layout/Sidebar 유무)
  - Sidebar 정책과 일치 여부 검토
- 사후 점검:
  - 빌드 영향 없음(문서/구조 변경), 데이터 로직 무변경 확인
  - 헤더/사이드바 정렬 CSS는 별도 단계에서 리팩터 예정

다음: admin/certifications, 홈 페이지 정리 및 Header/Sidebar 정렬 고도화(sticky/계산식 제거)

### 추가
- 작업: Admin Certifications 페이지 PageLayout 적용(centered)
- 커밋: (추가) — 반영됨
- 비고: 헤더 비수정 가이드 준수

### 추가 2
- 작업: Home(withSidebar), Search, My Questions, Login, Experts Apply 페이지 PageLayout 적용
- 커밋: 84eae88
- 비고: 헤더 비수정, 데이터 로직 무변경, 로딩 분기 centered로 통일

### 추가 3
- 작업: 번역 확장 텍스트 대응 글로벌 규칙 추가(styles/translation-safe.css), globals에 import
- 커밋: d50402c
- 규칙:
  - 텍스트 상자 래핑 강화(overflow-wrap:anywhere, word-break:break-word, hyphens:auto)
  - 모달/드롭다운/사이드바 카드: 최대 높이 80vh + 세로 스크롤
  - 작은 UI 컨트롤(탭/배지/필): ellipsis 처리

### 추가 4
- 작업: 사이드바/배너 높이 통일, 이벤트 배너 푸터 확보, sticky 정렬 개선
- 커밋: 6153618, 065483f, ad7351d 외
- 메모:
  - 사이드바 카드 높이 상한 420px, 본문 내부 스크롤(뉴스/인증 동일)
  - 이벤트 배너 높이 데스크탑 240px/모바일 210px 고정, 푸터 64px 예약
  - 수평 배너(파란/보라) 제목 1줄, 설명 2줄 클램프(…)
  - 사이드바 sticky로 전환(컨테이너 정렬 유지)

### TODO (Responsive Consistency)
- 토큰/레이아웃 매트릭스 작성 (claudedocs/RESPONSIVE_LAYOUT_CONSISTENCY_PLAN.md 참조)
- 카드/배너/드롭다운 전수 점검 & 규칙 적용 여부 확인
- 번역 켠 상태 QA 스냅샷 루틴 수립

## 2025-10-27
- 작업: 홈/피드 정렬 및 컴팩트화 (2025-10-22)
  - 헤더·main 컨테이너 최대 폭 1040px 통일, 상단 여백 축소로 헤더/히어로 간 간격 1/3 수준으로 조정
  - `main-layout`/`main-container`를 640px 콘텐츠 폭 기준 그리드로 재구성, 히어로/피드/사이드바 정렬
  - 사이드바 인라인 배너 제거, `BannerCarousel` sidebar variant를 도입해 4개의 배너를 슬라이드로 노출
  - FeedCard 헤더를 재배치(토픽 → 닉네임 옆, 팔로우/신고 버튼 간격 축소)하고 카드 패딩·타이포·통계 행을 슬림화
  - 질문/포스트 첨부 이미지를 최대 4장 그리드(+N 오버레이)로 노출하도록 `mediaUrls` 파이프라인 정리, 홈/카테고리/팔로잉/FeedBoard 모두 적용
- 작업: 헤더 프로필 메뉴 단순화 및 메뉴 항목 재정의
  - 사용자 메뉴를 프로필/내 게시글/User Rank·미션/설정 4개로 축소
  - 관리자/Certified User/자산 등 역할별 분기 메뉴 제거, `내 질문` → `내 게시글`로 라벨 변경, Admin은 대시보드 링크 유지
  - User Rank & 미션 통합 항목 구성 및 `/user-rank` 페이지 와이어 반영(랭킹/미션 섹션 구성)
- 작업: 와이어프레임/목업 관리 체계 수립
  - `claudedocs/UI_WIREFRAME_TRACKER.md` 작성(원칙, 체크리스트, 파일 규칙)
  - `claudedocs/mockups/` 디렉터리 생성, 목업 아카이브 위치 명확화
- 작업: Rank/미션 UI 패턴 컴포넌트화
  - `lib/data/mockRank.ts`에 랭킹/티어/미션 모듈형 mock 데이터 정의
  - `components/rank/*` 컴포넌트 4종(요약 카드, 리더보드, 티어, 미션) 추가로 패턴화
  - `/user-rank` 페이지를 공통 컴포넌트 기반 섹션 구조로 재구성
- 작업: 모바일 퍼스트 레이아웃 및 피드 최적화
  - `main-layout`/`main-container`를 모바일 기본 1열 → 데스크톱 확장 구조로 재정의
  - 헤더 컨테이너 패딩/간격을 모바일 기준으로 재조정하고, 네비게이션 노출을 1024px 이상으로 제한
  - 홈 상단 모바일 카테고리 그리드를 제거하고 게시글이 즉시 보이도록 구조 단순화
  - 데스크톱에서는 피드 중간 배너를 제거하고 사이드바 슬라이드 배너로 일원화
- 작업: FeedCard 패턴 개선 (스크린샷 스타일 반영)
  - 토픽 라벨, 작성자/시간, 신고 버튼, Follow 버튼 정렬 등 헤더 구조 개편
  - 제목/본문 2줄 클램프, 통계 라인/StatusBadge 정렬 및 ActionBar 레이아웃 정비
  - 첨부 이미지 최대 4장 그리드 표시(반응형), +N 오버레이, 공통 `mediaUrls` 파이프라인 구축
  - 질문/카테고리/팔로잉/공통 FeedBoard에서 동일 패턴 사용하도록 업데이트
  - 토픽/작성자 메타 간격을 축소하고 카드 폭·패딩을 줄여 데스크톱 기준 더 컴팩트한 레이아웃 확보
- 작업: 웹 정렬 및 배너 구조 개선
  - 헤더/메인 컨테이너 최대 폭을 1040px로 통일하고 패딩 보정으로 좌우 정렬 맞춤
  - Hero와 피드 상단 여백 축소(`main-layout`, `main-container` 조정)로 헤더 인접 공백 최소화
  - 사이드바 상단 배너를 `BannerCarousel` 슬라이드로 전환, 피드 중간 배너 제거
- 메모: 패턴화/게시글 우선 원칙 반영을 위해 슬림 헤더 필터 & 공통 PostCard 설계 문서화 준비

## 2025-10-17
- 작업: 빌드/접속 불가 원인 제거 및 Q&A 서버 연동 가속화
  - JSX 태그 불일치 수정: `app/posts/[id]/page.tsx`, `app/admin/certifications/page.tsx`
  - Server Component에서 `next/dynamic(ssr:false)` 제거: `app/layout.tsx`
  - `useSearchParams` 사용 페이지 Suspense 적용: `app/auth/login/page.tsx`, `app/onboarding/page.tsx`, `app/search/page.tsx`
  - 번역 확장에 의한 hydration mismatch 최소화: 카테고리/토픽/팔로잉/홈 모바일 카테고리 그리드 CSR 전환(`ClientOnly`)
  - 홈/카테고리/팔로잉 DB 연동(질문 리스트): `/api/questions` 기반으로 정렬/필터 표준화
  - `user_follows` 마이그레이션 + RLS 추가(`supabase/migrations/009_create_user_follows.sql`)
  - 팔로우 API 응답 통일: `app/api/users/[id]/follow/route.ts` (POST/DELETE → `{ success, isFollowing }`)
  - 질문 API 안정화: `sort` 검증/에러 로깅 강화(`app/api/questions/route.ts`)
  - 질문 작성 API 구현: `POST /api/questions` (인증/검증/삽입)

- 페이지 적용
  - `/categories/[slug]`: `/api/questions?category=<slug>&sort=recent` 고정, 실패 시 빈 상태
  - `/following`: `/api/questions?following=true&sort=recent` 서버 피드로 교체(비로그인 401 → 로그인 리다이렉트)

- 문서/기록
  - RCA 문서 추가: `docs/project/AUTH_AND_HYDRATION_RCA_2025-10-16.md`
  - OAuth 진행 현황 섹션 보강: `claudedocs/GOOGLE_OAUTH_SETUP.md` (현황/테스트 체크리스트)
  - 진행 현황 반영: `docs/project/STATUS_2025-10-16.md`, `claudedocs/DB_MIGRATION_PROGRESS.md`
- UI/배너
  - 홈 메인 `BannerCarousel` 유지(3 슬라이드 회전), 번역 시 내부 스크롤 안정화 확인
  - 다국어 카피 검수 및 CTA 문구 정비(ko/en/vi)
  - 사이드바 상단 배너 분리 + 뉴스 카드 sticky top 24px 고정, 관련 문서 동기화

- 비고
  - Dev 환경의 보안 헤더/번역 확장 혼선 최소화(SSR 민감 블록 CSR 전환)
  - 빌드 차단 린트/타입은 우선 해제(next.config) 후 단계적 해소 계획

### 교훈 기록 (2025-10-22)
- 문제: 검증되지 않은 WYSIWYG 교체와 도움됨 로직 대폭 수정이 한꺼번에 들어가면서 기본 기능(버튼 클릭, 상태 유지)이 즉시 깨졌다.
- 원인: (1) 대규모 변경 후 브라우저 QA를 생략했고, (2) API 응답을 직접 확인하지 않아 캐시/비동기 타이밍 문제를 뒤늦게 발견했다.
- 교훈: UI/데이터 흐름에 손을 댈 때는 **작은 단위로 적용→직접 눌러보고 확인**→문서화 순서를 반드시 지킨다. 최소한 “버튼 클릭 → 상태 유지”와 같은 1차 검증 없이는 다음 변경을 진행하지 않는다.

### 진행 요약 (2025-10-22, 추가)
- 도움됨 토글 재집계 시도: `/api/questions`·`/api/questions/[id]`에 `no-store` 헤더 적용, `getQuestionById`에서 투표 집계 로직 조정 → 그러나 UI에서 상태 유지 실패.
- RichEditor WYSIWYG 전환 실패: contentEditable 기반 시도 후 기존 마크다운 모드로 복귀, 버튼이 여전히 마크다운 기호만 삽입.
- Supabase 확인: 질문 `2bbdbc4c-91c3-4c49-bba7-e01d55653ffb`에 대해 votes/ helpful_count 정상 기록됨을 수동 조회.
- 현재 상태: 도움이 되는 토글 UI와 에디터 모두 미완료. 다음 단계에서 ① 도움됨 토글 재설계, ② 검증된 WYSIWYG 라이브러리(Tiptap) 사용 재도입 예정.

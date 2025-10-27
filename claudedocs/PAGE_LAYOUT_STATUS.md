# Page Layout Status (2025-10-17)

## withSidebar (main layout + 기본 sidebar)
- app/page.tsx — 홈 피드(배너/피드/사이드바)
- app/questions/page.tsx — 질문 리스트
- app/questions/[id]/page.tsx — 질문 상세

## centered (단일 컬럼 · 주요 설정/콘텐츠)
- app/admin/certifications/page.tsx — 인증 대시보드
- app/auth/login/page.tsx — 로그인/리다이렉션
- app/bookmarks/page.tsx — 북마크
- app/categories/[slug]/page.tsx — 카테고리 상세
- app/events/visa-challenge/page.tsx — 이벤트 랜딩
- app/experts/apply/page.tsx — Certified 신청
- app/following/page.tsx — 팔로잉 피드
- app/missions/page.tsx — 미션 허브
- app/my-questions/page.tsx — 내 질문
- app/notifications/page.tsx — 알림
- app/posts/[id]/page.tsx — 게시글 상세
- app/posts/new/page.tsx — 게시글 작성
- app/profile/page.tsx — 프로필
- app/questions/new/page.tsx — 질문 작성
- app/search/page.tsx — 검색
- app/settings/page.tsx — 기본 설정
- app/topics/page.tsx — 토픽 리스트
- app/topics/[slug]/page.tsx — 토픽 상세
- app/users/[id]/page.tsx — 사용자 프로필
- app/wallet/page.tsx — 지갑/리워드

## 커스텀/미적용 (PageLayout 도입 예정)
- app/admin/page.tsx — 배너 관리(임시 콘솔)
- app/categories/page.tsx — 카테고리 허브(FE만 구성)
- app/monitoring/page.tsx — 모니터링 대시보드
- app/onboarding/page.tsx — 온보딩 플로우
- app/settings/interests/page.tsx — 관심 토픽 설정
- app/settings/notifications/page.tsx — 고급 알림 설정
- app/test/notifications/page.tsx — 알림 테스트 (dev)

> 다음 라운드 액션: 커스텀 페이지를 PageLayout(full 또는 centered)으로 이관하고, sticky sidebar 간격은 `--sidebar-gap-top (-32px 기본)` 토큰으로 제어한다.

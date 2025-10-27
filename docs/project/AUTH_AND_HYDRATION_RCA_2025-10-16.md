# 인증/하이드레이션 RCA (2025-10-16~17)

## 요약
- 증상
  - 로그인/온보딩/검색 등에서 `useSearchParams`로 인한 CSR bail-out 경고 및 빌드 실패
  - 자동 번역(브라우저 확장/구글)으로 SSR 텍스트가 변경되어 hydration mismatch 경고
  - 홈/카테고리/팔로잉 일부 구간에서 Mock 폴백으로 예전 카드/문구 노출
- 근본 원인
  1) Server Component에서 `next/dynamic({ ssr:false })` 사용, 빌드 불가
  2) `useSearchParams`를 Suspense 없이 사용, 프리렌더 오류
  3) 자동 번역이 SSR HTML을 변경 → CSR과 불일치
  4) /api/questions 응답 계약/파라미터 오용으로 Mock 폴백 발생

## 조치
- 레이아웃/라우팅
  - `app/layout.tsx`: `next/dynamic(ssr:false)` 제거 → 정적 import로 교체
  - `app/auth/login/page.tsx`, `app/onboarding/page.tsx`, `app/search/page.tsx`: 내부 컴포넌트를 `<Suspense>`로 감싸 SSR bail‑out 해결
- 번역에 의한 mismatch 완화
  - 번역이 반드시 필요한 정책을 유지하기 위해, 민감 텍스트 블록(모바일 카테고리 그리드 등)을 CSR 전용으로 렌더(`ClientOnly`) — SSR 출력과 번역된 CSR 출력의 불일치 회피
- 서버 연동 표준화
  - `/api/questions`의 sort 검증(‘popular’|‘recent’), 에러 로깅 강화
  - `/categories/[slug]`/`/following`는 `/api/questions` 표준 DTO만 사용(페이지 포맷 단순화)

## 체크리스트
- [x] 레이아웃 동적 import 제거
- [x] Suspense 적용(로그인/온보딩/검색)
- [x] ClientOnly 적용(모바일 카테고리 등)
- [x] /api/questions 정렬/필터/로그 보강
- [x] /categories/[slug], /following 서버 연동 완료
- [ ] E2E: 로그인 → 질문 정렬 → 카테고리 → 팔로우 → 팔로잉 → 상세 페이지

## 참고 파일
- `app/layout.tsx`, `app/auth/login/page.tsx`, `app/onboarding/page.tsx`, `app/search/page.tsx`
- `components/common/ClientOnly.tsx`
- `app/api/questions/route.ts`, `lib/services/questions.service.ts`
- `app/categories/[slug]/page.tsx`, `app/following/page.tsx`


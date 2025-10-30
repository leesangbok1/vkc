# Mock Mode Removal Roadmap

With Supabase mock fallbacks removed from the core auth stack, the next step is to phase out the remaining `NEXT_PUBLIC_MOCK_MODE` branches. This document tracks the outstanding dependencies and recommended follow-up actions.

## Remaining Mock-Mode Checks

| Area | File | Current Behaviour |
|------|------|-------------------|
| Middleware guard | `middleware.ts` | Redirects unauthenticated requests to `/auth/login` only when mock mode is disabled. |
| Experts API | `app/api/experts/match/route.ts` | Returns canned expert matches while mock mode is enabled or Supabase URL is absent. |
| Stats API | `app/api/stats/route.ts` | Drops to zeroed metrics when mock mode is enabled. |
| Global search | `app/api/search/route.ts` | Uses hard-coded questions list while in mock mode. |
| Reports API | `app/api/reports/route.ts` | Bypasses Supabase inserts in mock mode. |
| Auth profile API | `app/api/auth/profile/route.ts` | Serves mock profile payload and allows mock updates when mock mode is true. |
| Questions vote API | — | ✅ Supabase 전용 경로로 정리 (`app/api/questions/[id]/vote/route.ts`) |
| Questions comments API | — | ✅ Supabase 전용 경로로 정리 (`app/api/questions/[id]/comments/route.ts`) |
| Answers comments API | — | ✅ Supabase 전용 경로로 정리 (`app/api/answers/[id]/comments/route.ts`) |
| Answers listing API | `app/api/answers/route.ts` | Provides canned answers in mock mode. *(Updated to return 503 when mock mode is on — full removal pending tests)* |
| Questions API | `app/api/questions/route.ts` | Previously served mock list/create. *(Now returns 503 when mock mode 활성)* |
| Questions detail API | `app/api/questions/[id]/route.ts` | Previously served mock question/answer data. *(Now returns 503 when mock mode 활성)* |

**Completed cleanups**

- Answers vote API (`app/api/answers/[id]/vote/route.ts`): mock 분기를 제거하고 목 모드 활성 시 명시적으로 503을 반환하도록 정리했습니다.
- Questions API (`app/api/questions/route.ts`): mock 목록/생성 경로 제거, 목 모드 시 503 응답으로 전환했습니다.
- Questions detail API (`app/api/questions/[id]/route.ts`): mock 상세 응답을 제거하고 목 모드 시 차단합니다.
- Questions vote API (`app/api/questions/[id]/vote/route.ts`): mock 투표 응답 제거, 목 모드 시 503 반환.
- Questions comments API (`app/api/questions/[id]/comments/route.ts`): mock 댓글 경로 제거, 목 모드 시 503 반환.
- Answers comments API (`app/api/answers/[id]/comments/route.ts`): mock 댓글 경로 제거, 목 모드 시 503 반환.

## Suggested Follow-Up Plan

1. **API-by-API Migration**
   - Replace each mock branch with integration tests that hit Supabase (Vitest + helpers) to prove queries work.
   - Remove the conditional path and return a clear 503 error if Supabase is misconfigured, rather than silently falling back.

2. **End-to-End Validation**
   - Update Playwright suites to cover the formerly mocked flows (questions list, detail, helpful vote, answers CRUD, search, stats dashboard).
   - Ensure CI seeds Supabase with fixture data so tests remain deterministic.

3. **Configuration Hardening**
   - Update deployment scripts and documentation (`docs/SUPABASE_COMPLETE_GUIDE.md`, `.env.example`) to indicate the flag is deprecated and must remain `false`.
   - Add a startup assertion (e.g., in `middleware.ts` or a boot hook) that throws if `NEXT_PUBLIC_MOCK_MODE` is still `true` outside local testing.

4. **Legacy Script Cleanup**
   - Review scripts under `scripts/` and `agents/` that rely on mock mode for smoothing developer experience; either delete or migrate them to real Supabase migrations/seeds.

Tracking progress in this document will help ensure the flag can ultimately be removed from the codebase without regressions.

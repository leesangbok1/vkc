# Q&A DB Integration Plan (Core First)

## Goal
Implement end-to-end, server-backed Q&A flows with a single, reliable API surface and shared query logic. Prioritize correctness, low errors, and deduplicate common code paths across pages (main → topics → following → categories → detail), then layer secondary features.

## Scope (MVP slice)
- Data: questions, answers (existing schema) + follows (user_follows)
- APIs: `/api/questions` (list + filters), `/api/questions/[id]` (detail), `/api/users/[id]/follow` (POST/DELETE), `/api/following/feed` (optional)
- Pages wired: Home feed (Q only), `/questions`, `/categories/[slug]`, `/following`, `/questions/[id]`
- Sorting: `popular`(upvote_count desc), `recent`(created_at desc)
- Filters: `category`, `following=true`, `limit/offset`

## Design
- Single query builder shared by API routes (and test harness):
  - Input: `{ sort, categoryId|slug, following, limit, offset, userId }`
  - Output: Stable DTO `{ id, title, content, author, category, upvote_count, answer_count, created_at }`
- Following:
  - Table: `user_follows(follower_id, following_id, created_at)`
  - RLS: users can SELECT/INSERT/DELETE where `follower_id = auth.uid()`
  - For `following=true`, API resolves `following_ids = SELECT following_id FROM user_follows WHERE follower_id = auth.uid()` then `questions.author_id IN (following_ids)`
- Category filter:
  - Accept `category=<slug|id>`; map slug→id in API (or join categories)
- Pagination:
  - `limit` default 20, `offset` default 0
- Sorting:
  - `popular`: `ORDER BY upvote_count DESC, created_at DESC`
  - `recent`: `ORDER BY created_at DESC`

## Migrations
- Verify existing:
  - `001_initial_schema.sql` (questions/answers)
  - `002_rls_policies.sql` (SELECT approved questions)
- Add/Apply:
  - `9-create-follows-table.sql` with RLS policies
    ```sql
    CREATE TABLE IF NOT EXISTS user_follows (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(follower_id, following_id)
    );

    ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "own follows select" ON user_follows
      FOR SELECT USING (follower_id = auth.uid());
    CREATE POLICY "own follows insert" ON user_follows
      FOR INSERT WITH CHECK (follower_id = auth.uid());
    CREATE POLICY "own follows delete" ON user_follows
      FOR DELETE USING (follower_id = auth.uid());

    CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
    CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
    ```

## API Contracts
- GET `/api/questions`
  - Query: `sort=popular|recent`, `category=<slug|id>`, `following=true|false`, `limit`, `offset`
  - Auth: public (following=true requires auth)
  - 200: `{ items: QuestionDTO[], page, limit, total? }`
- GET `/api/questions/[id]`
  - 200: `{ question: QuestionDTO, answers?: AnswerDTO[] }`
- POST `/api/users/[id]/follow` (self → id)
  - Auth: required; `id` is the user being followed
- DELETE `/api/users/[id]/follow`
  - Auth: required

## Page Wiring (Common-first)
- Create `lib/services/questions.service.ts` with query helpers; API routes call it.
- Update pages to consume `/api/questions`:
  - Home feed: `sort=popular` default
  - `/questions`: toggle `sort` (popular/recent)
  - `/categories/[slug]`: `category=slug`
  - `/following`: `following=true` + infinite scroll
  - `/questions/[id]`: detail existing route

## Error Minimization Strategy
- Small vertical slices; verify each page after wiring
- DTO boundary: sanitize/formatting in API, not on pages
- Add indexes for filters, default limits, and clear error JSON
- Defensive null checks; empty states standardized

## Test Plan
- API unit smoke: `/api/questions` with combinations
- E2E: login → `/questions` sort toggle → category filter → follow user → `/following` feed populated → question detail render

## Timeline
- Day 1: Migrations verify + GET `/api/questions` (popular/recent, category) + wire Home, `/questions`
- Day 2: `/categories/[slug]` wiring + detail data stabilization + pagination
- Day 3: user_follows migration + follow/unfollow APIs + `/following` wiring
- Day 4: Answer CRUD/vote endpoints alignment (optional) + polish
- Day 5: Tests + docs + perf

## Docs & Tracking
- Status updates: `docs/project/STATUS_2025-10-16.md`
- RCA log: `docs/project/AUTH_AND_HYDRATION_RCA_2025-10-16.md`
- This plan: `docs/project/PLAN_QNA_DB_INTEGRATION.md`

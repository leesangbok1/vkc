-- ================================================================
-- Migration: 019_add_missing_user_and_notification_fields.sql
-- Purpose : Align Supabase schema with application usage
-- Details :
--   1. Add users.interests (TEXT[])
--   2. Add users.notification_preferences (JSONB)
--   3. Add notifications.data (JSONB)
--   4. Create bookmarks table used by bookmark APIs
-- ================================================================

-- 1. Add interests array to users table if absent
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS interests TEXT[];

-- 2. Add notification preferences JSON column (with safe default)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}'::jsonb;

-- 3. Ensure notifications table has data payload column
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;

-- 4. Create bookmarks table (if missing) for user saved items
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('question', 'post', 'answer')),
  title VARCHAR(200),
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (user_id, target_id, target_type)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_target ON public.bookmarks(target_id, target_type);

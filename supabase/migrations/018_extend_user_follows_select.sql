-- ===========================================================
-- Allow users to view follow relationships where they are follower or following
-- Ensures 팔로워 목록도 조회 가능 (기존 정책은 follower_id 일치시에만 허용)
-- Created: 2025-10-27
-- ===========================================================

do $$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_follows'
      and policyname = 'user_follows_select_own'
  ) then
    drop policy "user_follows_select_own" on public.user_follows;
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_follows'
      and policyname = 'user_follows_select_related'
  ) then
    create policy "user_follows_select_related"
      on public.user_follows
      for select
      using (
        follower_id = auth.uid() or following_id = auth.uid()
      );
  end if;
end;
$$;

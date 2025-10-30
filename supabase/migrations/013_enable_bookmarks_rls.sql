-- ===========================================================
-- Enable RLS and define policies for public.bookmarks
-- Ensures only the bookmark owner can read/write their rows.
-- Created: 2025-10-23
-- ===========================================================

alter table if exists public.bookmarks enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'bookmarks'
      and policyname = 'Bookmarks select own'
  ) then
    create policy "Bookmarks select own"
      on public.bookmarks
      for select
      using (auth.uid() = user_id);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'bookmarks'
      and policyname = 'Bookmarks insert own'
  ) then
    create policy "Bookmarks insert own"
      on public.bookmarks
      for insert
      with check (
        auth.role() = 'authenticated'
        and auth.uid() = user_id
      );
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'bookmarks'
      and policyname = 'Bookmarks delete own'
  ) then
    create policy "Bookmarks delete own"
      on public.bookmarks
      for delete
      using (auth.uid() = user_id);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'bookmarks'
      and policyname = 'Bookmarks update own'
  ) then
    create policy "Bookmarks update own"
      on public.bookmarks
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end;
$$;


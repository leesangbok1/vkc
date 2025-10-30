-- ===========================================================
-- Create topic_subscriptions table with RLS policies
-- Ensures users can manage their own topic subscriptions.
-- Created: 2025-10-23
-- ===========================================================

create table if not exists public.topic_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  category_id integer not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, category_id)
);

create index if not exists idx_topic_subscriptions_user
  on public.topic_subscriptions(user_id);

create index if not exists idx_topic_subscriptions_category
  on public.topic_subscriptions(category_id);

alter table public.topic_subscriptions enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'topic_subscriptions'
      and policyname = 'Topic subscriptions select own'
  ) then
    create policy "Topic subscriptions select own"
      on public.topic_subscriptions
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
      and tablename = 'topic_subscriptions'
      and policyname = 'Topic subscriptions insert own'
  ) then
    create policy "Topic subscriptions insert own"
      on public.topic_subscriptions
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
      and tablename = 'topic_subscriptions'
      and policyname = 'Topic subscriptions delete own'
  ) then
    create policy "Topic subscriptions delete own"
      on public.topic_subscriptions
      for delete
      using (auth.uid() = user_id);
  end if;
end;
$$;

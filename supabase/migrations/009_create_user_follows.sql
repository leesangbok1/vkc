-- Create user_follows table with RLS
create table if not exists public.user_follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id)
);

alter table public.user_follows enable row level security;

-- Policies: each user can only see and manage their own follow rows (as follower)
create policy if not exists "user_follows_select_own"
  on public.user_follows for select
  using (follower_id = auth.uid());

create policy if not exists "user_follows_insert_own"
  on public.user_follows for insert
  with check (follower_id = auth.uid());

create policy if not exists "user_follows_delete_own"
  on public.user_follows for delete
  using (follower_id = auth.uid());

-- Indexes
create index if not exists idx_user_follows_follower on public.user_follows(follower_id);
create index if not exists idx_user_follows_following on public.user_follows(following_id);


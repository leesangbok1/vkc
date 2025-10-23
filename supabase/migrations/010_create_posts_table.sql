-- Create posts table for community information articles
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category_id integer references public.categories(id) on delete set null,
  author_id uuid references public.users(id) on delete set null,
  post_type text not null default 'community' check (post_type in ('community', 'news')),
  helpful_count integer not null default 0,
  comment_count integer not null default 0,
  tags text[] default '{}',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.posts is 'Community information posts created by authenticated users.';

-- Indexes to support common ordering/filtering
create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_posts_category on public.posts(category_id);
create index if not exists idx_posts_author on public.posts(author_id);

-- Enable row level security
alter table public.posts enable row level security;

-- Allow authenticated users to select published posts
create policy posts_select_published
  on public.posts
  for select
  using (
    is_published = true
  );

-- Allow authenticated users to insert posts for themselves
create policy posts_insert_authenticated
  on public.posts
  for insert
  with check (
    auth.role() = 'authenticated'
    and author_id = auth.uid()
  );

-- Allow authors to update their own posts
create policy posts_update_author
  on public.posts
  for update
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

-- Allow authors to delete their own posts
create policy posts_delete_author
  on public.posts
  for delete
  using (author_id = auth.uid());

-- Trigger to keep updated_at current
create or replace function public.trigger_update_posts_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_posts_updated_at on public.posts;
create trigger trg_posts_updated_at
  before update on public.posts
  for each row
  execute function public.trigger_update_posts_updated_at();

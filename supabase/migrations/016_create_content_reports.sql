-- =============================================================
-- Create content_reports table to track user-generated reports
-- and add moderation flag support for posts
-- =============================================================

-- Add is_reported flag to posts for moderation parity
alter table if exists public.posts
  add column if not exists is_reported boolean default false;

-- Create reports table for questions, posts, answers, comments
create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  target_id uuid not null,
  target_type text not null check (target_type in ('question', 'post', 'answer', 'comment')),
  reporter_id uuid references public.users(id) on delete set null,
  reason text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'in_review', 'resolved', 'dismissed')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.users(id) on delete set null
);

comment on table public.content_reports is 'Stores user reports for questions, posts, answers, and comments.';
comment on column public.content_reports.reason is 'Short reason selected by the reporter (e.g. spam, abuse).';
comment on column public.content_reports.description is 'Optional free-form description supplied by the reporter.';

-- Keep updated_at current
create or replace function public.trigger_update_content_reports_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_content_reports_updated_at on public.content_reports;
create trigger trg_content_reports_updated_at
  before update on public.content_reports
  for each row
  execute function public.trigger_update_content_reports_updated_at();

-- Helpful indexes
create index if not exists idx_content_reports_target on public.content_reports(target_type, target_id);
create index if not exists idx_content_reports_status on public.content_reports(status);
create index if not exists idx_content_reports_created_at on public.content_reports(created_at desc);

-- Enable RLS and define policies
alter table public.content_reports enable row level security;

-- Reporters can insert their own reports
create policy content_reports_insert_self
  on public.content_reports
  for insert
  with check (
    auth.uid() is not null
    and reporter_id = auth.uid()
  );

-- Moderators/admins can view all reports
create policy content_reports_select_admin
  on public.content_reports
  for select
  using (is_moderator(auth.uid()));

-- Moderators/admins can update report status
create policy content_reports_update_admin
  on public.content_reports
  for update
  using (is_moderator(auth.uid()))
  with check (is_moderator(auth.uid()));

-- Moderators/admins can delete reports if needed
create policy content_reports_delete_admin
  on public.content_reports
  for delete
  using (is_moderator(auth.uid()));

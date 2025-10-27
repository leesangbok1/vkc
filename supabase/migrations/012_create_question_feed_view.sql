-- =====================================================
-- Question Feed Metrics View & Helpers
-- Aggregates scoring components for questions so that
-- API 계층이 단순 조회로 일관된 점수를 활용할 수 있도록 합니다.
-- =====================================================

-- Half-life 기반 가중치 계산 함수
create or replace function public.compute_exp_decay(
  timestamp_input timestamptz,
  half_life_days numeric default 1
) returns numeric
language plpgsql
stable
as $$
declare
  diff_days numeric;
  safe_half_life numeric := greatest(half_life_days, 1);
begin
  if timestamp_input is null then
    return 0;
  end if;

  diff_days := extract(epoch from (now() - timestamp_input)) / 86400;
  if diff_days <= 0 then
    return 1;
  end if;

  return exp(- greatest(diff_days, 0) / safe_half_life);
end;
$$;

comment on function public.compute_exp_decay(timestamptz, numeric) is
  'Returns exponential decay weight based on the age of the timestamp (half-life in days).';

-- 질문 피드 점수 계산용 뷰
drop view if exists public.question_feed_metrics;

create view public.question_feed_metrics as
with answer_stats as (
  select
    a.question_id,
    count(*) filter (where coalesce(a.is_approved, true)) as total_answers,
    count(*) filter (where coalesce(a.is_approved, true) and a.is_accepted) as accepted_answers,
    count(*) filter (
      where
        coalesce(a.is_approved, true)
        and a.created_at >= (now() - interval '7 days')
    ) as recent_answers,
    max(a.created_at) filter (where coalesce(a.is_approved, true)) as last_answer_at
  from public.answers a
  group by a.question_id
),
helpful_stats as (
  select
    v.target_id as question_id,
    count(*) filter (
      where v.vote_type = 'helpful'
    ) as helpful_votes
  from public.votes v
  where v.target_type = 'question'
  group by v.target_id
),
base as (
  select
    q.id,
    q.title,
    q.content,
    q.author_id,
    q.category_id,
    q.tags,
    q.status,
    q.is_approved,
    q.view_count,
    coalesce(ans.total_answers, 0) as total_answers,
    coalesce(ans.accepted_answers, 0) as accepted_answers,
    coalesce(ans.recent_answers, 0) as recent_answer_count,
    coalesce(help.helpful_votes, 0) as helpful_votes,
    q.upvote_count,
    q.downvote_count,
    q.created_at,
    q.updated_at,
    q.last_activity_at,
    coalesce(ans.last_answer_at, q.last_activity_at, q.updated_at, q.created_at) as activity_timestamp,
    jsonb_build_object(
      'id', u.id,
      'name', u.name,
      'role', u.role,
      'avatar_url', u.avatar_url
    ) as author_json,
    jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'slug', c.slug,
      'icon', c.icon
    ) as category_json
  from public.questions q
  left join answer_stats ans on ans.question_id = q.id
  left join helpful_stats help on help.question_id = q.id
  left join public.users u on u.id = q.author_id
  left join public.categories c on c.id = q.category_id
  where coalesce(q.is_approved, true) = true
)
select
  b.id as question_id,
  b.title,
  b.content,
  b.author_id,
  b.category_id,
  b.tags,
  b.status,
  b.is_approved,
  b.view_count,
  b.total_answers,
  b.accepted_answers,
  b.recent_answer_count,
  b.helpful_votes,
  b.upvote_count,
  b.downvote_count,
  b.created_at,
  b.updated_at,
  b.last_activity_at,
  b.activity_timestamp,
  b.author_json as author,
  b.category_json as category,
  round(0.35 * ln(1 + greatest(b.view_count, 0)::double precision), 6) as views_score,
  round(0.45 * ln(1 + greatest(b.total_answers, 0)::double precision), 6) as answers_score,
  round(1.2 * greatest(b.accepted_answers, 0)::double precision, 6) as accepted_score,
  round(0.3 * ln(1 + greatest(b.helpful_votes, 0)::double precision), 6) as helpful_score,
  round(0.6 * greatest(b.recent_answer_count, 0)::double precision, 6) as recent_answers_score,
  round(1.0 * public.compute_exp_decay(b.created_at, 5), 6) as recency_score,
  round(0.5 * public.compute_exp_decay(b.activity_timestamp, 3), 6) as activity_score,
  round(
    (
      0.35 * ln(1 + greatest(b.view_count, 0)::double precision) +
      0.45 * ln(1 + greatest(b.total_answers, 0)::double precision) +
      1.2 * greatest(b.accepted_answers, 0)::double precision +
      0.3 * ln(1 + greatest(b.helpful_votes, 0)::double precision) +
      0.6 * greatest(b.recent_answer_count, 0)::double precision +
      1.0 * public.compute_exp_decay(b.created_at, 5) +
      0.5 * public.compute_exp_decay(b.activity_timestamp, 3)
    ),
    6
  ) as base_score
from base b;

comment on view public.question_feed_metrics is
  'Pre-aggregated question statistics and base score components used by feed services.';

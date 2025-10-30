-- Allow votes to reference posts in addition to questions and answers
alter table public.votes
  drop constraint if exists votes_target_type_check;

alter table public.votes
  add constraint votes_target_type_check
    check (target_type in ('question', 'answer', 'post'));

comment on column public.votes.target_id is
  'References questions.id, answers.id, or posts.id depending on target_type.';

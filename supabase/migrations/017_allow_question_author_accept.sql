-- ===========================================================
-- Allow question authors to update answers for acceptance flow
-- Ensures 질문 작성자가 자신의 질문에 달린 답변의 채택 상태를 업데이트할 수 있도록 함.
-- Created: 2025-10-27
-- ===========================================================

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'answers'
      and policyname = 'Question authors can accept answers'
  ) then
    create policy "Question authors can accept answers"
      on public.answers
      for update
      using (
        exists (
          select 1
          from public.questions
          where questions.id = answers.question_id
            and questions.author_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1
          from public.questions
          where questions.id = answers.question_id
            and questions.author_id = auth.uid()
        )
      );
  end if;
end;
$$;

-- ===========================================================
-- Helper function to execute arbitrary SQL via Supabase RPC.
-- Required for scripts/apply-migrations.ts automated workflow.
-- ===========================================================

create or replace function public.exec_sql(sql_query text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  execute sql_query;
end;
$$;

grant execute on function public.exec_sql(text) to service_role;
grant execute on function public.exec_sql(text) to postgres;

comment on function public.exec_sql(text) is
  'Utility function used by CI/agents to run SQL files via Supabase RPC. Use with service role credentials only.';

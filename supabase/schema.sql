-- Shared demonstration list for the MP3 coursework.
-- Run this once in Supabase Dashboard > SQL Editor.
create table if not exists public.shared_todo_state (
  id text primary key check (id = 'dokdoki-shared'),
  state jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_shared_todo_state_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists shared_todo_state_updated_at on public.shared_todo_state;
create trigger shared_todo_state_updated_at
before update on public.shared_todo_state
for each row execute function public.touch_shared_todo_state_updated_at();

alter table public.shared_todo_state enable row level security;
grant usage on schema public to anon;
grant select, insert, update on public.shared_todo_state to anon;

drop policy if exists "Read shared coursework list" on public.shared_todo_state;
create policy "Read shared coursework list"
on public.shared_todo_state for select to anon
using (id = 'dokdoki-shared');

drop policy if exists "Create shared coursework list" on public.shared_todo_state;
create policy "Create shared coursework list"
on public.shared_todo_state for insert to anon
with check (id = 'dokdoki-shared');

drop policy if exists "Update shared coursework list" on public.shared_todo_state;
create policy "Update shared coursework list"
on public.shared_todo_state for update to anon
using (id = 'dokdoki-shared')
with check (id = 'dokdoki-shared');

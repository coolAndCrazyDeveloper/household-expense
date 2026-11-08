-- Household Expenses: single shared household, fixed members, no rooms/invites.
-- Run this in Supabase SQL Editor. It creates new tables and leaves old room tables untouched.

create table if not exists public.household_members (
  id text primary key,
  display_name text not null check (char_length(trim(display_name)) between 1 and 60),
  common_share_percent numeric(7,4) not null default 0
    check (common_share_percent >= 0 and common_share_percent <= 100),
  display_order integer not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.household_expenses (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  item text not null check (char_length(trim(item)) between 1 and 80),
  is_common boolean not null default false,
  member_ids text[] not null default '{}',
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists household_expenses_date_idx
  on public.household_expenses(expense_date desc, created_at desc);

-- Seed the three configured members. Re-running the script preserves current percentages.
insert into public.household_members (id, display_name, common_share_percent, display_order)
values
  ('malkeet-singh', 'Malkeet Singh', 33.3333, 1),
  ('priyanka-tyagi', 'Priyanka Tyagi', 66.6667, 2),
  ('dheeraj-kumar', 'Dheeraj Kumar', 0, 3)
on conflict (id) do update set
  display_name = excluded.display_name,
  display_order = excluded.display_order;

-- Ensure selected member IDs are from the fixed household list.
create or replace function public.validate_household_expense_members()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_common then
    new.member_ids := '{}';
  else
    if coalesce(cardinality(new.member_ids), 0) = 0 then
      raise exception 'Select at least one member for this expense.';
    end if;
    if cardinality(new.member_ids) <> (
      select count(distinct selected_id) from unnest(new.member_ids) as x(selected_id)
    ) then
      raise exception 'Duplicate members are not allowed.';
    end if;
    if exists (
      select 1 from unnest(new.member_ids) as selected(selected_id)
      where not exists (
        select 1 from public.household_members hm where hm.id = selected.selected_id
      )
    ) then
      raise exception 'One or more selected members are invalid.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists household_expenses_validate_members on public.household_expenses;
create trigger household_expenses_validate_members
before insert or update of is_common, member_ids on public.household_expenses
for each row execute function public.validate_household_expense_members();

-- Update all configured common shares atomically. Percentages must total 100.
create or replace function public.update_household_common_shares(p_shares jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  supplied_count integer;
  distinct_count integer;
  configured_count integer;
  total_percent numeric;
begin
  if auth.uid() is null then raise exception 'Anonymous session required.'; end if;
  if jsonb_typeof(p_shares) <> 'array' then raise exception 'Invalid common share data.'; end if;

  select count(*), count(distinct x.id), coalesce(sum(x.common_share_percent), 0)
    into supplied_count, distinct_count, total_percent
  from jsonb_to_recordset(p_shares) as x(id text, common_share_percent numeric);

  select count(*) into configured_count from public.household_members;
  if supplied_count <> configured_count or distinct_count <> configured_count then
    raise exception 'Provide exactly one common share for every configured member.';
  end if;
  if exists (
    select 1 from jsonb_to_recordset(p_shares) as x(id text, common_share_percent numeric)
    where x.common_share_percent < 0 or x.common_share_percent > 100
      or not exists (select 1 from public.household_members hm where hm.id = x.id)
  ) then raise exception 'Invalid member or common share percentage.'; end if;
  if abs(total_percent - 100) > 0.0001 then
    raise exception 'Common shares must add up to 100 percent.';
  end if;

  update public.household_members hm
  set common_share_percent = x.common_share_percent
  from jsonb_to_recordset(p_shares) as x(id text, common_share_percent numeric)
  where hm.id = x.id;
end;
$$;

alter table public.household_members enable row level security;
alter table public.household_expenses enable row level security;

drop policy if exists "Authenticated users can read household members" on public.household_members;
create policy "Authenticated users can read household members"
on public.household_members for select to authenticated using (true);

drop policy if exists "Authenticated users can read household expenses" on public.household_expenses;
create policy "Authenticated users can read household expenses"
on public.household_expenses for select to authenticated using (true);

drop policy if exists "Authenticated users can add household expenses" on public.household_expenses;
create policy "Authenticated users can add household expenses"
on public.household_expenses for insert to authenticated
with check (created_by = auth.uid());

drop policy if exists "Authenticated users can update household expenses" on public.household_expenses;
create policy "Authenticated users can update household expenses"
on public.household_expenses for update to authenticated
using (true) with check (true);

drop policy if exists "Authenticated users can delete household expenses" on public.household_expenses;
create policy "Authenticated users can delete household expenses"
on public.household_expenses for delete to authenticated using (true);

drop policy if exists "Authenticated users can update household member shares" on public.household_members;
create policy "Authenticated users can update household member shares"
on public.household_members for update to authenticated using (true) with check (true);

grant usage on schema public to authenticated;
grant select on public.household_members to authenticated;
grant update (common_share_percent) on public.household_members to authenticated;
grant select, insert, update, delete on public.household_expenses to authenticated;
revoke all on function public.update_household_common_shares(jsonb) from public;
grant execute on function public.update_household_common_shares(jsonb) to authenticated;

-- Enable realtime subscriptions for shared updates.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'household_expenses') then
    alter publication supabase_realtime add table public.household_expenses;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'household_members') then
    alter publication supabase_realtime add table public.household_members;
  end if;
end;
$$;

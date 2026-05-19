create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now(),
  constraint profiles_username_unique unique (username),
  constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,24}$')
);

create table if not exists public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  weight numeric(5, 2),
  diet_followed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_entries_user_date_unique unique (user_id, entry_date)
);

create index if not exists daily_entries_user_id_idx on public.daily_entries (user_id);
create index if not exists daily_entries_entry_date_idx on public.daily_entries (entry_date);

alter table public.profiles enable row level security;
alter table public.daily_entries enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "daily_entries_select_own"
  on public.daily_entries for select
  using (auth.uid() = user_id);

create policy "daily_entries_insert_own"
  on public.daily_entries for insert
  with check (auth.uid() = user_id);

create policy "daily_entries_update_own"
  on public.daily_entries for update
  using (auth.uid() = user_id);

create policy "daily_entries_delete_own"
  on public.daily_entries for delete
  using (auth.uid() = user_id);

create or replace function public.is_username_available(requested_username text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.profiles
    where username = lower(trim(requested_username))
  );
$$;

grant execute on function public.is_username_available (text) to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uname text;
begin
  uname := lower(trim(new.raw_user_meta_data ->> 'username'));
  if uname is null or uname = '' then
    raise exception 'username required';
  end if;
  insert into public.profiles (id, username)
  values (new.id, uname);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

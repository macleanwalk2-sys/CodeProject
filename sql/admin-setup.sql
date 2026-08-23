-- Admin portal setup. Paste this whole file into the Supabase SQL Editor and
-- run it once, then add yourself as an admin with the statement at the bottom.
--
-- Everything here is enforced by the database rather than by the pages. The
-- admin pages are static files anyone can fetch and read; what stops a client
-- reading another client's requests, or promoting themselves, is these policies.

-- ---------------------------------------------------------------------------
-- Who is an admin
-- ---------------------------------------------------------------------------
-- A table rather than a flag on the user. Supabase exposes user_metadata to the
-- browser and lets a signed-in user edit their own, so an is_admin flag kept
-- there could be set by anyone on themselves. Rows here can only be added from
-- the dashboard: there is no insert policy, so the site cannot write to it.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.admins enable row level security;

-- A signed-in user may check whether they themselves are an admin, and nothing
-- else. Not being able to read the row for anyone else keeps the list private.
drop policy if exists "read own admin row" on public.admins;
create policy "read own admin row"
  on public.admins for select
  using (auth.uid() = user_id);

-- security definer so the policies below can consult the table without the
-- caller needing read access to it, and without the policy recursing into
-- admins' own policy. search_path is pinned as a matter of habit for definer
-- functions.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;

-- ---------------------------------------------------------------------------
-- Who each login belongs to
-- ---------------------------------------------------------------------------
-- auth.users is not readable from browser code, so without this the admin page
-- could show that a request exists but not which client sent it. It also gives
-- the client portal a real company name in place of the email prefix.
create table if not exists public.clients (
  user_id uuid primary key references auth.users(id) on delete cascade,
  company text not null,
  email   text,
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;

drop policy if exists "clients read their own row" on public.clients;
create policy "clients read their own row"
  on public.clients for select
  using (auth.uid() = user_id);

drop policy if exists "admins manage clients" on public.clients;
create policy "admins manage clients"
  on public.clients for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Admin access to requests
-- ---------------------------------------------------------------------------
-- These sit alongside the existing client policies rather than replacing them.
-- Postgres ORs policies together, so clients keep seeing exactly their own rows
-- and nothing about their access changes.
drop policy if exists "admins read every request" on public.requests;
create policy "admins read every request"
  on public.requests for select
  using (public.is_admin());

-- Clients still have no update policy, so a client cannot move their own
-- request to Completed. Only an admin can.
drop policy if exists "admins update every request" on public.requests;
create policy "admins update every request"
  on public.requests for update
  using (public.is_admin())
  with check (public.is_admin());

-- Keeps updated_at honest, so "Updated Aug 18" on a client's row means the last
-- time anyone actually touched it rather than when it was filed.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists requests_touch_updated_at on public.requests;
create trigger requests_touch_updated_at
  before update on public.requests
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Make yourself an admin
-- ---------------------------------------------------------------------------
-- Replace the address with the one you sign in with, then run it. Nothing in
-- the site can do this; it only ever happens here.
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'macw@oakwood-marketing.com'
--   on conflict do nothing;
--
-- And name a client, so the admin page shows a company instead of an email:
--
--   insert into public.clients (user_id, company, email)
--   select id, 'Triangle Gutter Co.', email from auth.users
--   where email = 'sarah@trianglegutter.com'
--   on conflict (user_id) do update set company = excluded.company;

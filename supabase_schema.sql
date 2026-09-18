-- ============================================================================
-- SafeWord Cards Schema
-- Run this once in your Supabase project's SQL Editor (Dashboard → SQL Editor)
-- ============================================================================

-- Cards table
create table if not exists public.cards (
  id           bigint generated always as identity primary key,
  category     text not null,
  difficulty   text not null check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  safe_word    text not null,
  cant_say     text[] not null default '{}',
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Keep updated_at current on every edit
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists cards_set_updated_at on public.cards;
create trigger cards_set_updated_at
  before update on public.cards
  for each row
  execute function public.set_updated_at();

-- Helpful index for the game's category filter queries
create index if not exists cards_category_idx on public.cards (category);
create index if not exists cards_active_idx on public.cards (active);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.cards enable row level security;

-- Anyone (anon key) can READ only active cards — this is what the game uses.
drop policy if exists "Public can read active cards" on public.cards;
create policy "Public can read active cards"
  on public.cards
  for select
  to anon
  using (active = true);

-- Only logged-in (authenticated) users can INSERT/UPDATE/DELETE.
-- This is what the admin page uses, gated behind Supabase Auth login.
drop policy if exists "Authenticated users can read all cards" on public.cards;
create policy "Authenticated users can read all cards"
  on public.cards
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert cards" on public.cards;
create policy "Authenticated users can insert cards"
  on public.cards
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update cards" on public.cards;
create policy "Authenticated users can update cards"
  on public.cards
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can delete cards" on public.cards;
create policy "Authenticated users can delete cards"
  on public.cards
  for delete
  to authenticated
  using (true);

-- ============================================================================
-- Notes
-- ============================================================================
-- 1. After running this, create at least one admin user under
--    Authentication → Users → Add User (email + password) so Danyelle
--    (or you) can log into the admin page.
-- 2. Categories are NOT a separate table on purpose — they're just text on
--    each card. The game derives the category list dynamically from
--    whatever values exist in the table, so adding a new category (e.g.
--    "Environmental" or "Food Safety" for a future edition) needs zero
--    schema changes — just add cards with that category text.

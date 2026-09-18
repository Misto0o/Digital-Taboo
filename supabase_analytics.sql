-- ============================================================================
-- SafeWord Analytics
-- Run this in the Supabase SQL Editor, after supabase_schema.sql
--
-- Design note: this table is deliberately anonymous. There are no user ids,
-- no session ids, no IP addresses, and no device fingerprints — just event
-- names and a small JSON payload of non-identifying details (category names,
-- score targets, counts). That keeps the privacy policy short and honest,
-- and means this data can be retained indefinitely without privacy risk.
-- ============================================================================

create table if not exists public.events (
  id          bigint generated always as identity primary key,
  event       text not null,
  payload     jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create index if not exists events_event_idx on public.events (event);
create index if not exists events_created_at_idx on public.events (created_at);

alter table public.events enable row level security;

-- Players (anon key) can only INSERT events. They cannot read them back.
-- This prevents the event log from being scraped by anyone with the public key.
drop policy if exists "Anyone can record an event" on public.events;
create policy "Anyone can record an event"
  on public.events
  for insert
  to anon
  with check (true);

-- Only logged-in admins can read the event log.
drop policy if exists "Authenticated users can read events" on public.events;
create policy "Authenticated users can read events"
  on public.events
  for select
  to authenticated
  using (true);


-- ============================================================================
-- Handy queries for the Supabase SQL Editor
-- ============================================================================

-- Most popular categories (the main question the project brief asks)
--
--   select
--     jsonb_array_elements_text(payload->'categories') as category,
--     count(*) as games
--   from public.events
--   where event = 'game_started'
--   group by category
--   order by games desc;

-- How many games get finished vs abandoned
--
--   select event, count(*)
--   from public.events
--   where event in ('game_started', 'game_completed')
--   group by event;

-- Which score targets people actually pick
--
--   select payload->>'targetScore' as target, count(*)
--   from public.events
--   where event = 'game_started'
--   group by target
--   order by count(*) desc;

-- Solo vs multiplayer split
--
--   select payload->>'mode' as mode, count(*)
--   from public.events
--   where event = 'game_started'
--   group by mode;

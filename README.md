# SafeWord
### The Name of the Game is Safety

A fast-paced team word-guessing game for workplace safety training, inspired
by classic Taboo-style gameplay.

Players race the clock to get their team to guess a safety term without
saying any of the words on its "Can't Say" list. Built for safety training,
onboarding, or just making safety talk less boring.

---

## What it is

- 200 cards across 8 safety categories (Lockout/Tagout, PPE, Hazard
  Communication, Machine Guarding, Fire Safety, Respiratory Protection,
  Powered Industrial Trucks, Ergonomics)
- Card content lives in Supabase, not in the code — editable from `/admin`
  without touching a line of code
- Four ways to play: **Solo Challenge** (one 60s turn, beat your score),
  **Pass & Play** (2–4 teams, one device passed around), **Create Room** /
  **Join Room** (play across two devices with a 4-letter code)
- Installable as a PWA on phone, tablet, or desktop
- No accounts needed to play

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| PWA | vite-plugin-pwa |
| Card database + admin auth | Supabase |
| Multiplayer room sync | Firebase (Firestore) |
| Hosting | Netlify |

## Setup

```bash
yarn install
yarn dev
```

Runs at `http://localhost:5173`.

You'll need a `.env` file — copy `.env.example` and fill in your Supabase
project URL and anon key. See the Supabase section below for the rest of
the setup (schema, card import, analytics).

```bash
yarn build      # production build
yarn preview    # preview the build locally
```

## Project structure

```
src/
├── components/     screens (SetupScreen, PlayingScreen, AdminPanel, etc.)
├── hooks/          useGameState, useCards, useRoom, useAdminAuth
├── lib/            supabase.js, analytics.js
├── App.jsx
└── styles.css

scripts/
└── importCards.mjs   bulk-loads cards_source.tsv into Supabase

public/
├── icons/
├── privacy.html
└── _redirects       Netlify SPA routing for /admin
```

## Supabase setup

1. Run `supabase_schema.sql` in the Supabase SQL Editor — creates the
   `cards` table.
2. Run `supabase_analytics.sql` — creates the (fully anonymous) `events`
   table used for usage stats.
3. Create an admin login under Authentication → Users — this is what signs
   into `/admin` to manage cards.
4. `yarn import-cards` to bulk-load `cards_source.tsv` (needs
   `SUPABASE_SERVICE_ROLE_KEY` set locally — never commit or deploy this key).

## Admin panel

`/admin` — add, edit, hide, or delete cards without redeploying. Requires
the Supabase login from setup step 3.

## License

Code is MIT. Card content and branding are not — see `LICENSE`.

## Changelog

**Rework — multiplayer & modes**
- Fixed "Create Room" not actually creating a room (silent bug, nobody
  could join)
- Fixed online games getting stuck on "waiting" after a turn handoff
- Added real Solo Challenge and 2–4 team Pass & Play
- Host and guest now share one synced deck instead of two different shuffles
- Visible tiebreak round when teams are tied at the target score
- Fixed games looping forever if the deck ran out before anyone won
- Fixed a tied game always declaring team 1 the winner

**Rebrand**
- Palette pulled from the physical SafeWord box art
- Fixed white-on-accent contrast, duplicate PWA service workers, missing
  app icons

**Content & infra**
- Moved from hardcoded cards to Supabase, with the admin panel above
- Added anonymous usage analytics (category popularity, completion rate —
  no personal data)
- Added privacy policy, license, and handoff docs

## Roadmap

- [ ] Sound effects
- [ ] Difficulty filtering (data already supports it)
- [ ] Bulk CSV upload from the admin panel
- [ ] Additional card packs / future editions (Environmental, Food Safety, etc.)

---

**Serious Safety. Seriously Fun.**
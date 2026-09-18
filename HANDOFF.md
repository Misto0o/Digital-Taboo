# SafeWord — Handoff & Ownership Transfer

This document covers Phase 5 of the project plan: transferring all
credentials, assets, and administrative access to SafeWord.

Work through it top to bottom. Each item should end with SafeWord holding the
account directly — not shared access to a developer-owned account.

---

## 1. Accounts to transfer

| Service | What it holds | Transfer method |
|---|---|---|
| **Supabase** | Card database, analytics, admin logins | Create an organization owned by SafeWord's email, then transfer the project into it (Supabase Dashboard → Project Settings → General → Transfer project) |
| **Firebase** | Multiplayer room sync | Add SafeWord's Google account as Owner in IAM, then remove the developer account |
| **Netlify** | Site hosting and deploys | Transfer the site to a SafeWord-owned Netlify team, or have SafeWord create an account and transfer ownership of the site |
| **GitHub** | Source code | Transfer the repository to a SafeWord-owned account or organization |
| **Domain** (if one is purchased) | Custom URL | Transfer the registrar account or initiate a domain transfer |

> The goal is that SafeWord can keep the product running with no further
> involvement from the developer. If any account still requires the
> developer's login to administer, the transfer isn't finished.

## 2. Credentials to hand over

Deliver these through a password manager share or another secure channel —
not email or chat.

- [ ] Supabase account login
- [ ] Supabase admin user for the card manager (`/admin`)
- [ ] Supabase `service_role` key (needed only for bulk card re-imports)
- [ ] Firebase / Google account login
- [ ] Netlify account login
- [ ] GitHub account login
- [ ] Domain registrar login (if applicable)

## 3. Environment variables

The deployed site depends on these being set in Netlify (Site configuration →
Environment variables). Confirm SafeWord knows where they live and how to
change them:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The `SUPABASE_SERVICE_ROLE_KEY` is used only locally for the card import
script and must **never** be added to Netlify or committed to the repo.

## 4. Assets

- [ ] Logo files (source format, e.g. `.ai` / `.svg`, plus exported PNGs)
- [ ] Box artwork
- [ ] Color palette and card design standards
- [ ] App icons (`icon-192.png`, `icon-512.png`)
- [ ] Card content master file (`cards_source.tsv`)

## 5. Documentation to deliver

- [ ] `README.md` — setup and deployment
- [ ] `PRIVACY.md` — privacy policy
- [ ] `LICENSE` — licensing terms for code and content
- [ ] This handoff document
- [ ] Recommendations for future enhancements (below)

## 6. Written agreement

The `LICENSE` file describes how others may use the code. It is **not** the
same thing as an agreement between the developer and SafeWord about who owns
what.

Before handoff is considered complete, both parties should have something in
writing covering:

- Who owns the copyright in the source code
- Who owns the card content and branding
- Whether the code may be open-sourced, and under what license
- What ongoing support (if any) is expected after handoff

This is not legal advice. If real money or a registered business is involved,
it's worth having an attorney look at the assignment language.

---

## Recommendations for future enhancements

Ordered roughly by value-to-effort.

**Near term**
- **Sound effects and haptics.** Listed as optional in the original plan and
  still the single biggest "feel" upgrade for a party game — a timer tick, a
  correct/penalty chime, a buzzer at zero.
- **More than two teams.** The setup screen is currently hard-coded to two.
  The scoring and turn-rotation logic already handles N teams, so this is
  mostly a UI change.
- **Adjustable turn length.** Currently fixed at 60 seconds. Some groups will
  want 45 or 90.

**Medium term**
- **Bulk card import from the admin page.** Right now adding many cards at
  once requires running a script. A CSV upload in the admin UI would remove
  the last task that needs a developer.
- **Difficulty filtering.** Every card already carries a Beginner /
  Intermediate / Advanced rating, but players can't filter on it yet. The
  data is there; only the UI is missing.
- **An analytics view in the admin page.** The event data is being collected;
  surfacing "most played categories" as a simple chart would save SafeWord
  from writing SQL.

**Longer term**
- **Future editions.** The category field is free text and the game derives
  its category list from whatever exists in the database, so Environmental,
  Food Safety, Leadership, and OSHA editions need no code changes — just
  cards. Consider whether editions should be separate decks or filters.
- **Reliability of multiplayer sync.** The current host/guest model works but
  is fragile if a player closes their browser mid-game. If multiplayer sees
  real use, this deserves a rework.
- **Paid Supabase tier.** The free tier pauses after a week of inactivity,
  which takes the card database offline until someone restores it. If SafeWord
  is relying on this in front of customers, the paid tier removes that risk.

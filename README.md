# SafeWord PWA

A digital version of the SafeWord card game — a Taboo-style party game with a safety theme. Built as a Progressive Web App (no app store needed).

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **React 18** | Component-based, great for game state screens |
| Build tool | **Vite** | Fast dev server, instant HMR |
| PWA | **vite-plugin-pwa** | Auto service worker + manifest injection |
| Styling | **Plain CSS** (CSS variables) | Zero overhead, full control, mobile-first |
| State | **React hooks** (useState, useEffect, useCallback) | No extra libraries needed |
| Hosting | **Any static host** (Vercel, Netlify, GitHub Pages) | Just `npm run build` → deploy `dist/` |

---

## Getting Started

```bash
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # production build → /dist
npm run preview   # preview the production build
```

---

## Project Structure

```
safeword-pwa/
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── sw.js                # Service worker (offline support)
│   └── icons/               # App icons (192x192, 512x512 PNG)
├── src/
│   ├── data/
│   │   └── cards.js         # Word card data (safeWord + cantSay)
│   ├── hooks/
│   │   └── useGameState.js  # All game logic (timer, scoring, turns)
│   ├── components/
│   │   ├── HomeScreen.jsx
│   │   ├── SetupScreen.jsx
│   │   └── PlayingScreen.jsx
│   │   ├── PassDeviceScreen.jsx
│   │   ├── RoundEndScreen.jsx
│   │   └── GameOverScreen.jsx
│   ├── App.jsx              # Screen router
│   ├── main.jsx             # Entry point + SW registration
│   └── styles.css           # Global styles
├── index.html
├── vite.config.js
└── package.json
```

---

## Game Flow

```
HOME → SETUP → PASS_DEVICE → PLAYING → ROUND_END → PASS_DEVICE (loop)
                                                  ↘ GAME_OVER (when target score hit)
```

---

## Adding Cards

Edit `src/data/cards.js`. Each card is:

```js
{
  id: 16,
  safeWord: 'FIRE DRILL',
  cantSay: ['practice', 'alarm', 'school', 'bell', 'outside'],
}
```

---

## Icons

You need to add real icons at:
- `public/icons/icon-192.png` (192×192)
- `public/icons/icon-512.png` (512×512)

Use a tool like [Favicon.io](https://favicon.io) or [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) to generate them from a logo.

---

## Deploying (Vercel)

```bash
npm run build
# Push to GitHub, connect repo in Vercel dashboard
# Set output directory to "dist"
```

Or drag-and-drop the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop).

---

## To-Do / Future Features

- [ ] Sound effects (correct/wrong buzzer)
- [ ] Custom card editor (add your own words)
- [ ] Multiple card packs / categories
- [ ] Animated card transitions
- [ ] Vibration feedback on mobile (`navigator.vibrate`)
- [ ] Configurable turn duration
- [ ] More than 2 teams
- [ ] Persistent leaderboard (localStorage)

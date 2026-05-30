# SafeWord
### The Name of the Game is Safety

A fast-paced workplace communication game inspired by classic Taboo-style gameplay.

Players race against the clock to get teammates to guess safety-related terms without saying the forbidden words. Whether you're running safety training, onboarding new employees, or just looking for a more engaging way to talk safety, SafeWord transforms learning into competition.

> Learn Safety. Build Teams. Have Fun.

---

## 🎮 What Is SafeWord?

SafeWord is a digital Progressive Web App (PWA) adaptation of the SafeWord card game.

Each card contains:

✅ A **SafeWord** that teammates must guess

🚫 A list of **Can't Say** words that are off limits

⏱️ A countdown timer

🏆 Team scoring and round-based gameplay

The result is a fast, competitive, and surprisingly effective way to reinforce workplace safety concepts.

---

## ✨ Features

- 📱 Installable on phones, tablets, and desktops
- 🌐 Works directly in the browser
- 📶 Offline support via Service Worker
- ⚡ Fast React + Vite performance
- 🎯 Team-based scoring
- ⏱️ Configurable rounds
- 🔄 Pass-the-device gameplay
- 🎮 No account required

---

## 🚀 Tech Stack

| Layer | Technology |
|---------|---------|
| Frontend | React 18 |
| Build Tool | Vite |
| PWA Support | vite-plugin-pwa |
| Styling | CSS Variables |
| State Management | React Hooks |
| Hosting | Vercel / Netlify / GitHub Pages |

---

## 🏗️ Getting Started

```bash
npm install

npm run dev
npm run build
npm run preview
```

Development server:

```txt
http://localhost:5173
```

---

## 📂 Project Structure

```txt
safeword-pwa/
│
├── public/
│   ├── manifest.json
│   ├── sw.js
│   └── icons/
│
├── src/
│   ├── data/
│   │   └── cards.js
│   │
│   ├── hooks/
│   │   └── useGameState.js
│   │
│   ├── components/
│   │   ├── HomeScreen.jsx
│   │   ├── SetupScreen.jsx
│   │   ├── PassDeviceScreen.jsx
│   │   ├── PlayingScreen.jsx
│   │   ├── RoundEndScreen.jsx
│   │   └── GameOverScreen.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
│
├── vite.config.js
├── package.json
└── index.html
```

---

## 🎯 Gameplay Flow

```txt
HOME
  ↓
SETUP
  ↓
PASS DEVICE
  ↓
PLAYING
  ↓
ROUND END
  ↓
PASS DEVICE
  ↺

OR

GAME OVER 🏆
```

---

## 🃏 Card Format

Cards live in:

```txt
src/data/cards.js
```

Example:

```js
{
  id: 16,
  safeWord: "FIRE DRILL",
  cantSay: [
    "practice",
    "alarm",
    "school",
    "bell",
    "outside"
  ]
}
```

---

## 📱 PWA Installation

SafeWord can be installed like a native app.

### Mobile

1. Open in browser
2. Tap "Add to Home Screen"
3. Launch like any other app

### Desktop

1. Open in Chrome, Edge, or Brave
2. Click Install
3. Launch from desktop

No app store required.

---

## 🚢 Deployment

### Vercel

```bash
npm run build
```

Push to GitHub and connect the repository to Vercel.

Output directory:

```txt
dist
```

### Netlify

```bash
npm run build
```

Drag and drop the generated `dist/` folder into Netlify.

---

## 🔮 Future Plans

- [ ] Sound effects
- [ ] Multiple card packs
- [ ] Custom card creator
- [ ] Mobile vibration feedback
- [ ] Animated card transitions
- [ ] Local leaderboard
- [ ] Additional game modes
- [ ] Multiplayer support

---

## 🛡️ SafeWord

**Serious Safety. Seriously Fun.**

Built with React, Vite, and a mission to make safety training something people actually remember.
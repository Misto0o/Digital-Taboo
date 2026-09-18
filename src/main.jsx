import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Service worker registration is handled automatically by vite-plugin-pwa
// (registerType: 'autoUpdate' in vite.config.js). Registering one manually
// here as well created two competing service workers — the hand-written
// public/sw.js used a cache-first strategy that could pin users to a stale
// build indefinitely, so updates wouldn't reach them.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

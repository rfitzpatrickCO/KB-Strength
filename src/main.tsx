import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// ── PWA update handling ──────────────────────────────────────
//
// The service worker (configured with skipWaiting + clientsClaim) installs and
// takes over silently in the background, but the page that's already running
// keeps executing the old JS bundle until something forces a reload. iOS in
// particular never reloads on its own. Listening for `controllerchange` lets
// us reload exactly once when the new SW becomes the controller — that's the
// moment new code can actually be loaded.
if ('serviceWorker' in navigator) {
  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return
    reloading = true
    window.location.reload()
  })

  // Nudge the SW to check for updates whenever the app comes back to the
  // foreground. iOS PWAs are otherwise reluctant to check for new versions.
  const checkForUpdate = () => {
    navigator.serviceWorker.getRegistration().then(reg => reg?.update().catch(() => {}))
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate()
  })
  // And once an hour while the app is open
  setInterval(checkForUpdate, 60 * 60 * 1000)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

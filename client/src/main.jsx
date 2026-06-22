import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import './index.css';

// Handle dynamic import failures (stale chunk errors in SPAs/PWAs)
// This intercepts the error at the Vite/Rollup level before React crashes.
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault(); // Prevent the error from crashing the app
  
  // Wipe Service Worker caches completely, then force reload
  if ('caches' in window) {
    caches.keys().then((names) => {
      Promise.all(names.map((name) => caches.delete(name))).then(() => {
        window.location.reload(true);
      });
    }).catch(() => {
      window.location.reload(true);
    });
  } else {
    window.location.reload(true);
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

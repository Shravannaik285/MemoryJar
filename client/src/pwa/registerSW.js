/**
 * Service Worker Registration & Lifecycle Management
 */

export function registerServiceWorker({ onNeedRefresh, onOfflineReady } = {}) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Function to register the service worker
  const doRegister = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      // 1. Check if an updated worker is already waiting in the background
      if (registration.waiting) {
        if (onNeedRefresh) onNeedRefresh(registration);
      }

      // 2. Listen for new update candidates
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At least one tab is controlled by old worker, new version ready
              console.log('[PWA] New content is available; please refresh.');
              if (onNeedRefresh) onNeedRefresh(registration);
            } else {
              // First installation: content cached for offline use
              console.log('[PWA] Content is cached for offline use.');
              if (onOfflineReady) onOfflineReady();
            }
          }
        });
      });

      // 3. Periodic update check (e.g. every hour when active)
      setInterval(() => {
        registration.update().catch((err) => {
          console.warn('[PWA] Periodic update check error:', err);
        });
      }, 60 * 60 * 1000);

    } catch (err) {
      console.warn('[PWA] Service worker registration failed:', err);
    }
  };

  // Register immediately if already loaded, otherwise listen for load event
  if (document.readyState === 'complete') {
    doRegister();
  } else {
    window.addEventListener('load', doRegister);
  }

  // Listen for controlling worker change and reload page
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

/**
 * Sends a message to the waiting service worker to skip waiting and activate immediately
 * @param {ServiceWorkerRegistration} registration
 */
export function applyServiceWorkerUpdate(registration) {
  if (!registration || !registration.waiting) {
    window.location.reload();
    return;
  }
  registration.waiting.postMessage({ type: 'SKIP_WAITING' });
}


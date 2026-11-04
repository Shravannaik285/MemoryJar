/**
 * Memory Jar — Service Worker (PWA Offline & Asset Caching)
 * Tagline: Little moments. A lifetime of memories.
 */

const CACHE_VERSION = 'v1.0.1';
const CACHE_NAME = `memory-jar-${CACHE_VERSION}`;

// Pre-cached core application shell resources
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-icon.png',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/icons/maskable-icon.svg',
];

// External origin patterns to cache (Google Fonts)
const FONT_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
];

// 1. Install Event: Cache essential app shell assets and activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .catch((err) => {
        console.warn('[SW] Pre-cache failed during installation:', err);
      })
  );
});

// 2. Activate Event: Clean up outdated caches safely
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME && name.startsWith('memory-jar-')) {
              console.log('[SW] Deleting legacy cache:', name);
              return caches.delete(name);
            }
            return null;
          })
        );
      })
      .then(() => {
        // Claim clients immediately so new worker controls active tabs
        return self.clients.claim();
      })
  );
});

// 3. Fetch Event: Intelligent offline caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and unsupported protocols (e.g. chrome-extension://)
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Strategy A: Navigation Requests (HTML / App Shell)
  // Network-First with Cache Fallback for offline launch
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // If offline, serve cached index.html
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;

          const shellResponse = await caches.match('/index.html');
          if (shellResponse) return shellResponse;

          return caches.match('/');
        })
    );
    return;
  }

  // Strategy B: Google Fonts (Cache-First with Network Fallback)
  if (FONT_ORIGINS.some((origin) => url.origin === origin)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Graceful fallback when font cannot be fetched
            return new Response('', { status: 408, statusText: 'Font offline' });
          });
      })
    );
    return;
  }

  // Strategy C: Static Hashed Bundles (/assets/*, scripts, styles, images)
  // Cache-First with Network Fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          // Cache successful 200 responses
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (url.pathname.startsWith('/assets/') ||
              url.pathname.endsWith('.js') ||
              url.pathname.endsWith('.css') ||
              url.pathname.endsWith('.svg') ||
              url.pathname.endsWith('.png') ||
              url.pathname.endsWith('.webmanifest'))
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch((err) => {
          console.warn('[SW] Offline resource unavailable:', request.url, err);
          return new Response('Offline resource unavailable', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
    })
  );
});

// 4. Message Event: Support smooth skip-waiting update
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 5. Push Event: Handle incoming birthday push notifications
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || 'Memory Jar ❤️';
  const options = {
    body:
      data.body ||
      "Your memories are waiting! Look how far you've come. Open your jar and relive your happiest moments.",
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/icon-192.png',
    vibrate: data.vibrate || [100, 50, 100],
    tag: data.tag || 'memory-jar-birthday',
    renotify: true,
    data: {
      url: data.url || '/?reveal=true',
      timestamp: Date.now(),
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 6. Notification Click Event: Open or focus Memory Jar with ?reveal=true
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/?reveal=true';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If an open tab exists, navigate and focus it
        for (const client of clientList) {
          if (client.url && 'focus' in client) {
            if ('navigate' in client) {
              client.navigate(targetUrl);
            }
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
        return null;
      })
  );
});


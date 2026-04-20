const CACHE_NAME = 'meditrack-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install: cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and API calls — always go to network
  if (request.method !== 'GET' || url.pathname.startsWith('/api')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache fresh copy of successful GET responses
        if (request.method === 'GET' && response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;

        // Fallback for navigation requests (SPA support)
        if (request.mode === 'navigate') {
          const home = await caches.match('/');
          if (home) return home;
        }

        // Final fallback: return a 408 Network Error response instead of crashing
        return new Response('Network error or resource not cached', {
          status: 408,
          statusText: 'Network Error',
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

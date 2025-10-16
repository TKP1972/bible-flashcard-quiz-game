
const CACHE_NAME = 'bible-flashcard-quiz-v3'; // Version bump to trigger update
const urlsToCache = [
  '/',
  '/index.html',
  '/index.js',
  '/App.js',
  '/data.js',
  '/types.js',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
  // External dependencies for offline use
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:ital,wght@0,400;0,700;1,400&display=swap',
  'https://esm.sh/react@18.3.1',
  'https://esm.sh/react-dom@18.3.1/client',
  'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://tkp1972.github.io/bible-flashcard-quiz-game/',
  // Added missing CDN resources for full offline support
  'https://aistudiocdn.com/@google/genai@1.25.0',
  'https://aistudiocdn.com/react-dom@19.2.0/'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // We only want to apply this strategy to GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        // Return response from cache if found.
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // IMPORTANT: Check for valid response before caching
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(err => {
          // Network fetch failed, which is expected when offline.
          // The cache.match() already handled serving from cache if possible.
        });

        return response || fetchPromise;
      });
    })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME]; // Whitelist the new cache name
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
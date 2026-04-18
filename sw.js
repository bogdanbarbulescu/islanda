const CACHE_NAME = 'trip-planner-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/storage.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;700&family=Teko:wght@400;700&display=swap',
  'https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecg.woff2'
];

// Evenimentul de instalare: deschide cache-ul și adaugă toate resursele
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching App Shell and assets');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evenimentul de fetch: interceptează cererile și servește din cache dacă e posibil
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Dacă resursa este în cache, o returnăm direct
        if (response) {
          return response;
        }
        // Altfel, facem cererea la rețea
        return fetch(event.request);
      }
    )
  );
});

// Evenimentul de activare: șterge cache-urile vechi pentru a elibera spațiu
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

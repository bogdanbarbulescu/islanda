const CACHE_NAME = 'iceland-adventure-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;700&family=Teko:wght@400;700&display=swap',
  'https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecg.woff2',
  'https://i.imgur.com/8N0xq2d.jpeg', // Monster
  'https://i.imgur.com/uNkvfVB.jpeg', // Landmannalaugar
  'https://i.imgur.com/5lPMV1t.jpeg'  // Laki
];

// Instalarea Service Worker-ului și adăugarea fișierelor în cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptarea cererilor și returnarea din cache dacă sunt disponibile
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Dacă resursa este în cache, o returnăm
        if (response) {
          return response;
        }
        // Altfel, facem cererea la rețea
        return fetch(event.request);
      }
    )
  );
});

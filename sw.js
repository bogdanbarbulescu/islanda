const CACHE_NAME = 'iceland-adventure-v3'; // Am incrementat versiunea cache-ului
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
  // --- LISTA COMPLETĂ DE IMAGINI ---
  'https://images.unsplash.com/photo-1627575397331-527a7694683b?w=800&auto=format&fit=crop', // Monster
  'https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=800&auto=format&fit=crop', // Landmannalaugar
  'https://images.unsplash.com/photo-1534279539332-d34a8a142814?w=800&auto=format&fit=crop', // Laki Craters
  'https://images.unsplash.com/photo-1617190534649-d8c4234a2d34?w=800&auto=format&fit=crop', // Kerlingarfjoll
  'https://images.unsplash.com/photo-1547733994-9e3b51861a43?w=800&auto=format&fit=crop', // Axlafoss
  'https://images.unsplash.com/photo-1604789232362-3867562bec98?w=800&auto=format&fit=crop', // Blafjallafoss
  'https://images.unsplash.com/photo-1633267290933-2336c175852a?w=800&auto=format&fit=crop', // Maelifell
  'https://images.unsplash.com/photo-1632369991393-9671f7536128?w=800&auto=format&fit=crop', // Raudibotn
  'https://images.unsplash.com/photo-1579487785973-74d2ca7abdd5?w=800&auto=format&fit=crop', // Thakgil
  'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800&auto=format&fit=crop', // Skogafoss Hike
  'https://images.unsplash.com/photo-1628359441744-53746736c244?w=800&auto=format&fit=crop', // Langisjor
  'https://images.unsplash.com/photo-1553667818-57fb44116c53?w=800&auto=format&fit=crop'  // Braided Rivers
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

// Șterge cache-urile vechi la activare
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

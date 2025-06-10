const CACHE_NAME = 'iceland-adventure-v4';
const urlsToCache = [
  // Fișierele de bază ale aplicației (App Shell)
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',

  // Icoanele pentru PWA
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',

  // Resurse externe (Fonturi)
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;700&family=Teko:wght@400;700&display=swap',
  'https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecg.woff2',

  // --- IMAGINI PENTRU GALERII ---

  // 0. Monster (de pe Dashboard)
  'https://images.unsplash.com/photo-1627575397331-527a7694683b?w=800&auto=format&fit=crop',

  // 1. Landmannalaugar
  'https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=800',
  'https://images.unsplash.com/photo-1540390769625-2fc3f8b1f5c5?w=800',
  'https://images.unsplash.com/photo-1616518163723-9964213a5191?w=800',

  // 2. Laki Craters
  'https://images.unsplash.com/photo-1534279539332-d34a8a142814?w=800',
  'https://images.unsplash.com/photo-1551423997-dd9e5a0a9b52?w=800',
  'https://images.unsplash.com/photo-1632369991393-9671f7536128?w=800', // Reutilizată de la Raudibotn pentru similaritate

  // 3. Kerlingarfjoll + Hveravellir
  'https://images.unsplash.com/photo-1617190534649-d8c4234a2d34?w=800',
  'https://images.unsplash.com/photo-1604278361252-227e58308194?w=800',
  'https://images.unsplash.com/photo-1617190534603-d8c4234a2d34?w=800',

  // 4. Axlafoss
  'https://images.unsplash.com/photo-1547733994-9e3b51861a43?w=800',
  'https://images.unsplash.com/photo-1569917983435-31398c16781e?w=800',
  'https://images.unsplash.com/photo-1431036101494-69a3621d0b29?w=800',

  // 5. Blafjallafoss
  'https://images.unsplash.com/photo-1604789232362-3867562bec98?w=800',
  'https://images.unsplash.com/photo-1558987101-73d49e42914a?w=800',
  'https://images.unsplash.com/photo-1598283721052-a2283833889a?w=800',

  // 6. Maelifell
  'https://images.unsplash.com/photo-1633267290933-2336c175852a?w=800',
  'https://images.unsplash.com/photo-1588696632332-5b1a5336e9b7?w=800',
  'https://images.unsplash.com/photo-1588696632332-5b1a5336e9b7?w=800',

  // 7. Raudibotn + Holmsarfossar
  'https://images.unsplash.com/photo-1632369991393-9671f7536128?w=800',
  'https://images.unsplash.com/photo-1632369991393-9671f7536128?w=800',
  'https://images.unsplash.com/photo-1632369991393-9671f7536128?w=800',

  // 8. Thakgil
  'https://images.unsplash.com/photo-1579487785973-74d2ca7abdd5?w=800',
  'https://images.unsplash.com/photo-1579487785973-74d2ca7abdd5?w=800',
  'https://images.unsplash.com/photo-1579487785973-74d2ca7abdd5?w=800',

  // 9. The Waterfall Hike (Skogafoss)
  'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800',
  'https://images.unsplash.com/photo-1535546204542-5237f20c3957?w=800',
  'https://images.unsplash.com/photo-1547733994-9e3b51861a43?w=800',

  // 10. Ofaerufoss + Langisjor
  'https://images.unsplash.com/photo-1628359441744-53746736c244?w=800',
  'https://images.unsplash.com/photo-1628359441744-53746736c244?w=800',
  'https://images.unsplash.com/photo-1628359441744-53746736c244?w=800',

  // 11. Braided Rivers
  'https://images.unsplash.com/photo-1553667818-57fb44116c53?w=800',
  'https://images.unsplash.com/photo-1553667818-57fb44116c53?w=800',
  'https://images.unsplash.com/photo-1553667818-57fb44116c53?w=800'
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

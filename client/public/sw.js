const CACHE_NAME = 'bp-tracker-v1';
const urlsToCache = [
  '/',
  '/src/main.tsx',
  '/src/index.css',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'bp-reading-sync') {
    event.waitUntil(syncBPReadings());
  }
});

async function syncBPReadings() {
  // Implementation for syncing offline readings when connection is restored
  console.log('Syncing BP readings...');
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Time to check your blood pressure!',
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    vibrate: [200, 100, 200],
    tag: 'bp-reminder',
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icon-96.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icon-96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('BP Tracker', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

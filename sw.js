const CACHE_NAME = 'notes-v1';
const urlsToCache = [
  '/my-notes-app/',
  '/my-notes-app/index.html',
  '/my-notes-app/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

const CACHE_NAME = 'notes-app-v1';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json'
];

// Install - सिर्फ जरूरी Files Cache करें
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Fetch - Cache से तुरंत दें
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

// Activate - तुरंत Control लें
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
        .then(() => self.clients.claim()) // ← यह तुरंत Control लेता है
    );
});

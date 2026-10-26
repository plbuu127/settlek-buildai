const CACHE = 'settlek-public-v1';
const PUBLIC = ['/offline.html', '/icon-192.png', '/icon-512.png', '/icon-maskable.png'];
self.addEventListener('install', event => {event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PUBLIC)));self.skipWaiting()});
self.addEventListener('activate', event => {event.waitUntil(Promise.all([self.clients.claim(), caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('settlek-public-') && key !== CACHE).map(key => caches.delete(key))))]))});
self.addEventListener('fetch', event => {
 const url = new URL(event.request.url);
 if(event.request.method !== 'GET' || url.origin !== self.location.origin) return;
 // Never cache API responses, authentication, personal HTML or navigation responses.
 if(event.request.mode === 'navigate') {event.respondWith(fetch(event.request).catch(() => caches.match('/offline.html')));return}
 if(PUBLIC.includes(url.pathname)) event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request)));
});

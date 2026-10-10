// Landfall offline shell: caches the app shell and static assets so a sailor can open the app and
// stand their Watch without a connection. The Log lives in the browser's storage, not here; the
// crew service is never cached. A new deployment replaces the shell on the next visit.
const VERSION = '9f1a6a7-1791598635';
const CACHE = `landfall-shell-${VERSION}`;
const BASE = new URL(self.registration.scope).pathname;
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll([BASE, `${BASE}manifest.webmanifest`]))); self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || !url.pathname.startsWith(BASE)) return;
  if (e.request.mode === 'navigate') { e.respondWith(fetch(e.request).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(BASE, copy)); return res; }).catch(() => caches.match(BASE))); return; }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => { if (res.ok && (url.pathname.includes('/_expo/') || url.pathname.includes('/assets/'))) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); } return res; })));
});

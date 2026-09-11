// 偉人録 service worker — 画面の骨組みを手元に置き、電波がなくても開けるようにする
const CACHE = "ijin-v9";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // Supabase への通信はそのまま通す（記録は常に最新を取る）
  if (url.hostname.endsWith("supabase.co") || e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (url.origin === location.origin) caches.open(CACHE).then(c => c.put(e.request, r.clone()));
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});

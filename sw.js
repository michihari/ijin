// 偉人録 service worker
// HTML と JS は絶対にキャッシュしない（古い画面が残り続ける事故を防ぐため）。
// 手元に置くのはアイコンと manifest だけ。
const CACHE = "ijin-assets-v10";
const ASSETS = ["./icon-192.png", "./icon-512.png", "./icon-512-maskable.png", "./apple-touch-icon.png", "./manifest.webmanifest"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // Supabase への通信、GET 以外、HTML・JS はすべて素通し
  if (url.hostname.endsWith("supabase.co")) return;
  if (e.request.method !== "GET") return;
  if (e.request.mode === "navigate") return;
  if (/\.(html|js)$/.test(url.pathname) || url.pathname.endsWith("/")) return;
  if (!ASSETS.some(a => url.pathname.endsWith(a.replace("./", "")))) return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});

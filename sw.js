// 偉人録 service worker
// HTML と JS はキャッシュしない（古い画面が残る事故を防ぐため）。
// アイコンと書体だけを手元に置き、二度目以降の表示を速くする。
const CACHE = "ijin-assets-v16";
const ASSETS = ["./icon-192.png", "./icon-512.png", "./icon-512-maskable.png", "./apple-touch-icon.png", "./manifest.webmanifest"];
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

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
  if (e.request.method !== "GET") return;
  if (url.hostname.endsWith("supabase.co")) return;          // 記録は常に最新を取りに行く

  // 書体：一度取れたら手元のものを使う
  if (FONT_HOSTS.includes(url.hostname)) {
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      const res = await fetch(e.request);
      if (res.ok) c.put(e.request, res.clone());
      return res;
    }));
    return;
  }

  if (e.request.mode === "navigate") return;                 // 画面そのものは素通し
  if (/\.(html|js)$/.test(url.pathname) || url.pathname.endsWith("/")) return;
  if (!ASSETS.some(a => url.pathname.endsWith(a.replace("./", "")))) return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});

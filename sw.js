const CACHE = "mugol-words-v1";
const CORE = [
  "./", "./index.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png",
  "./icons/maskable-192.png", "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png", "./icons/favicon-48.png",
  "./kelimeler3.js", "./kelimeler4.js", "./kelimeler5.js", "./kelimeler6.js", "./kelimeler7.js"
];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // Tek tek ekle: bir dosya yoksa diğerleri yine de önbelleğe alınır
    await Promise.all(CORE.map(u => c.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(req, { ignoreSearch: true });
    // Önbellekten hemen ver, arkada güncelle
    const net = fetch(req).then(r => { if (r && r.ok) c.put(req, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const r = await net;
    if (r) return r;
    if (req.mode === "navigate") return (await c.match("./index.html")) || Response.error();
    return Response.error();
  })());
});

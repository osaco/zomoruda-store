// Zomoruda service worker: offline fallback + cache-first for static assets.
const CACHE = "zomoruda-v2";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll([OFFLINE_URL, "/icons/icon-192.png", "/placeholder.png"])));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(Promise.all([
    self.registration.navigationPreload?.enable(),
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("zomoruda-") && key !== CACHE).map((key) => caches.delete(key)))),
  ]).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/api") ||
    url.pathname === "/checkout" ||
    url.pathname.startsWith("/checkout/") ||
    url.pathname === "/track" ||
    url.pathname.startsWith("/track/") ||
    url.pathname.startsWith("/order/")
  ) return;

  if (request.mode === "navigate") {
    event.respondWith(Promise.resolve(event.preloadResponse).catch(() => undefined).then(response => response ?? fetch(request)).catch(() => caches.match(OFFLINE_URL)));
    return;
  }
  if (url.pathname.startsWith("/_next/static") || url.pathname.startsWith("/_next/image") || url.pathname.startsWith("/icons")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            if (res.ok) event.waitUntil(caches.open(CACHE).then((c) => c.put(request, copy)));
            return res;
          }),
      ),
    );
  }
});

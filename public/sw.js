const CACHE = "future-skills-v2";
const SHELL = ["/", "/privacy", "/terms", "/manifest.webmanifest", "/mark.svg", "/assets/hero-ceramic-720.webp", "/assets/hero-ceramic.webp"];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    const response = await fetch("/", { cache: "no-store" });
    const html = await response.clone().text();
    const builtAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map((match) => match[1]);
    await cache.addAll([...new Set(builtAssets)]);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
      return response;
    }).catch(() => caches.match("/")))
  );
});

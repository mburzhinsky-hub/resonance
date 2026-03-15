const SHELL_CACHE = "resonance-shell-v1";
const TRACK_CACHE = "resonance-track-cache-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      return cache.addAll([
        "./",
        "./index.html"
      ]).catch(() => {});
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (request.destination === "audio" || url.pathname.endsWith(".mp3")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((response) => {
          if (!response || !response.ok) return response;
          const copy = response.clone();
          caches.open(TRACK_CACHE).then((cache) => cache.put(request, copy));
          return response;
        }).catch(() => cached);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (!response || !response.ok) return response;
        const copy = response.clone();
        caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
        return response;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
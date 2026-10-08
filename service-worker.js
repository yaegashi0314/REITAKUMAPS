const CACHE_NAME = "reitakumaps-v1";

const APP_SHELL = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
    );

    self.skipWaiting();
});


self.addEventListener("activate", (event) => {

    event.waitUntil(

        caches.keys().then((keys) => {

            return Promise.all(

                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))

            );

        })

    );

    self.clients.claim();
});


self.addEventListener("fetch", (event) => {

    const request = event.request;

    // 外部サイトは通常通りネットから取得
    if (!request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(

        caches.match(request).then((cached) => {

            if (cached) {
                return cached;
            }

            return fetch(request).then((response) => {

                if (
                    !response ||
                    response.status !== 200 ||
                    response.type === "opaque"
                ) {
                    return response;
                }

                const copy = response.clone();

                caches.open(CACHE_NAME)
                    .then((cache) => {
                        cache.put(request, copy);
                    });

                return response;

            });

        })

    );

});

const CACHE_NAME = "reitakumaps-v5";

const APP_SHELL = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./arrow.png",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

const INDEX_URL = new URL(
    "./index.html",
    self.registration.scope
).href;

// ========================================
// インストール
// ========================================

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            await Promise.all(
                APP_SHELL.map(async (path) => {
                    try {
                        const url = new URL(
                            path,
                            self.registration.scope
                        );

                        const response = await fetch(url);

                        if (response.ok) {
                            await cache.put(url.href, response);
                        } else {
                            console.warn(
                                "キャッシュできませんでした:",
                                path,
                                response.status
                            );
                        }
                    } catch (error) {
                        console.warn(
                            "ファイル取得失敗:",
                            path,
                            error
                        );
                    }
                })
            );
        })
    );

    // 新しいService Workerを待機させずに有効化
    self.skipWaiting();
});

// ========================================
// 有効化
// ========================================

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => {
                            return (
                                name.startsWith("reitakumaps-") &&
                                name !== CACHE_NAME
                            );
                        })
                        .map((name) => caches.delete(name))
                );
            })
            .then(() => self.clients.claim())
    );
});

// ========================================
// リクエスト処理
// ========================================

self.addEventListener("fetch", (event) => {
    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);

    // 外部サイトは処理しない
    if (url.origin !== self.location.origin) {
        return;
    }

    // HTMLページはネットワーク優先
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.ok) {
                        const copy = response.clone();

                        caches.open(CACHE_NAME).then((cache) => {
                            return cache.put(request, copy);
                        });
                    }

                    return response;
                })
                .catch(async () => {
                    const cached = await caches.match(request);

                    if (cached) {
                        return cached;
                    }

                    const fallback = await caches.match(INDEX_URL);

                    if (fallback) {
                        return fallback;
                    }

                    return new Response(
                        "ページを取得できません。通信状態を確認してください。",
                        {
                            status: 503,
                            headers: {
                                "Content-Type":
                                    "text/plain; charset=utf-8"
                            }
                        }
                    );
                })
        );

        return;
    }

    // JS・CSS・画像などはネットワーク優先
    event.respondWith(
        fetch(request)
            .then((response) => {
                if (
                    response.ok &&
                    response.type === "basic"
                ) {
                    const copy = response.clone();

                    caches.open(CACHE_NAME).then((cache) => {
                        return cache.put(request, copy);
                    });
                }

                return response;
            })
            .catch(async () => {
                const cached = await caches.match(request);

                if (cached) {
                    return cached;
                }

                // JSの失敗時にHTMLを返さない
                return new Response(
                    "ファイルを取得できません。通信状態を確認してください。",
                    {
                        status: 503,
                        headers: {
                            "Content-Type":
                                "text/plain; charset=utf-8"
                        }
                    }
                );
            })
    );
});

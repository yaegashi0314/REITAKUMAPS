const CACHE_NAME = "reitakumaps-v2";

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


// ========================================
// インストール
// ========================================

self.addEventListener(
    "install",
    (event) => {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(
                    (cache) => {

                        return cache.addAll(
                            APP_SHELL
                        );

                    }
                )

        );

        // 新しいService Workerをすぐ有効化
        self.skipWaiting();

    }
);


// ========================================
// 有効化
// ========================================

self.addEventListener(
    "activate",
    (event) => {

        event.waitUntil(

            caches
                .keys()
                .then(
                    (cacheNames) => {

                        return Promise.all(

                            cacheNames

                                .filter(
                                    (cacheName) => {

                                        return (
                                            cacheName !==
                                            CACHE_NAME
                                        );

                                    }
                                )

                                .map(
                                    (cacheName) => {

                                        return caches.delete(
                                            cacheName
                                        );

                                    }
                                )

                        );

                    }
                )

        );

        // 開いているページにも
        // 新しいService Workerを適用
        self.clients.claim();

    }
);


// ========================================
// リクエスト処理
// ========================================

self.addEventListener(
    "fetch",
    (event) => {

        const request =
            event.request;


        // GET以外は処理しない
        if (
            request.method !==
            "GET"
        ) {

            return;

        }


        // 外部サイトはService Workerの
        // キャッシュ対象にしない
        if (
            !request.url.startsWith(
                self.location.origin
            )
        ) {

            return;

        }


        event.respondWith(

            caches
                .match(request)
                .then(
                    (cachedResponse) => {

                        // キャッシュがあれば使用
                        if (cachedResponse) {

                            return cachedResponse;

                        }


                        // なければネットから取得
                        return fetch(request)

                            .then(
                                (response) => {

                                    // 正常なレスポンスだけ
                                    // キャッシュする
                                    if (

                                        !response ||

                                        response.status !==
                                        200 ||

                                        response.type ===
                                        "opaque"

                                    ) {

                                        return response;

                                    }


                                    const responseClone =
                                        response.clone();


                                    caches
                                        .open(
                                            CACHE_NAME
                                        )
                                        .then(
                                            (cache) => {

                                                cache.put(
                                                    request,
                                                    responseClone
                                                );

                                            }
                                        );


                                    return response;

                                }
                            )

                            .catch(
                                () => {

                                    // オフラインで
                                    // index.htmlが必要な場合
                                    return caches.match(
                                        "./index.html"
                                    );

                                }
                            );

                    }
                )

        );

    }
);
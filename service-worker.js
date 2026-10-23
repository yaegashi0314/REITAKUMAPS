
"use strict";

/* ========================================
   REITAKUMAPS Service Worker
======================================== */

// 更新時にバージョン番号を変更する
const CACHE_NAME = "reitakumaps-v7";

// アプリの基本ファイル
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

/* ========================================
   インストール
======================================== */

self.addEventListener("install", function (event) {
  event.waitUntil(
    (async function () {
      const cache = await caches.open(CACHE_NAME);

      await Promise.all(
        APP_SHELL.map(async function (path) {
          try {
            const url = new URL(
              path,
              self.registration.scope
            );

            const response = await fetch(url.href, {
              cache: "no-cache"
            });

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

      // 新しいService Workerをすぐに有効化
      await self.skipWaiting();
    })()
  );
});

/* ========================================
   有効化
======================================== */

self.addEventListener("activate", function (event) {
  event.waitUntil(
    (async function () {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames.map(async function (name) {
          if (
            name.startsWith("reitakumaps-") &&
            name !== CACHE_NAME
          ) {
            await caches.delete(name);
          }
        })
      );

      // 開いているページにも新しいWorkerを適用
      await self.clients.claim();
    })()
  );
});

/* ========================================
   通信処理
======================================== */

self.addEventListener("fetch", function (event) {
  const request = event.request;

  // GET以外は処理しない
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // 同じサイト内のファイルだけ処理する
  // 地図タイルやApps Scriptなどの外部通信は横取りしない
  if (url.origin !== self.location.origin) {
    return;
  }

  // HTMLページはネットワーク優先
  if (request.mode === "navigate") {
    event.respondWith(
      (async function () {
        try {
          const response = await fetch(request, {
            cache: "no-cache"
          });

          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);

            await cache.put(
              request,
              response.clone()
            );
          }

          return response;
        } catch (error) {
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
        }
      })()
    );

    return;
  }

  // JavaScript・CSS・画像などもネットワーク優先
  event.respondWith(
    (async function () {
      try {
        const response = await fetch(request, {
          cache: "no-cache"
        });

        if (
          response.ok &&
          response.type === "basic"
        ) {
          const cache = await caches.open(CACHE_NAME);

          await cache.put(
            request,
            response.clone()
          );
        }

        return response;
      } catch (error) {
        const cached = await caches.match(request);

        if (cached) {
          return cached;
        }

        // JavaScriptの失敗時にHTMLを返さない
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
      }
    })()
  );
});

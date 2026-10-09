
"use strict";

/* ========================================
   REITAKUMAPS
   MapLibre + 国土地理院 + OpenFreeMap
======================================== */

/* ---------- 地図の設定 ---------- */

const INITIAL_CENTER = [139.95603, 35.83444];
const INITIAL_ZOOM = 18;

const MAP_MODES = {
    photo: "photo",
    normal: "normal"
};

let map;
let currentMode = MAP_MODES.photo;

let currentMarker = null;
let currentArrowElement = null;
let currentLocation = null;

let compassEnabled = false;
let compassHeading = 0;
let deferredInstallPrompt = null;
let locationWatchId = null;

/* ---------- 航空写真スタイル ---------- */

const aerialStyle = {
    version: 8,

    sources: {
        "gsi-photo": {
            type: "raster",
            tiles: [
                "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg"
            ],
            tileSize: 256,
            attribution:
                '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">国土地理院</a>'
        }
    },

    layers: [
        {
            id: "gsi-photo-layer",
            type: "raster",
            source: "gsi-photo",
            paint: {
                "raster-opacity": 1
            }
        }
    ]
};

/* ---------- 通常地図スタイル ---------- */

/*
 * OpenFreeMapのLibertyスタイルを使用。
 * Google Maps APIキーは不要。
 */
const normalStyle =
    "https://tiles.openfreemap.org/styles/liberty";

/* ---------- 木の位置データ ---------- */

const plants = [
    { lat: 35.83444, lng: 139.95603, name: "けやき" },
    { lat: 35.83267, lng: 139.95478, name: "アレクストラ" },
    { lat: 35.83300, lng: 139.95450, name: "サボシラ" },
    { lat: 35.83295, lng: 139.95467, name: "いちい" },
    { lat: 35.83297, lng: 139.95492, name: "いぬつぎ" },
    { lat: 35.83286, lng: 139.95497, name: "杉" },
    { lat: 35.83283, lng: 139.95511, name: "ほうじゅえをや" },
    { lat: 35.83275, lng: 139.955444, name: "オーク" },
    { lat: 35.833167, lng: 139.955639, name: "ひとつばたこ" },
    { lat: 35.833194, lng: 139.955556, name: "ひとつばたこ" },
    { lat: 35.833139, lng: 139.955583, name: "とべら" },
    { lat: 35.833194, lng: 139.955528, name: "リベリカコーヒーの木" },
    { lat: 35.833083, lng: 139.955472, name: "ヤマボウシ" },
    { lat: 35.833083, lng: 139.9555, name: "ヤマボウシ" },
    { lat: 35.833139, lng: 139.955361, name: "にれ" },
    { lat: 35.833222, lng: 139.955417, name: "オリーブ" },
    { lat: 35.833167, lng: 139.95525, name: "にれ" },
    { lat: 35.83325, lng: 139.955306, name: "ハンカチのき" },
    { lat: 35.833278, lng: 139.955139, name: "くすのき" },
    { lat: 35.833194, lng: 139.955167, name: "にれ" },
    { lat: 35.833361, lng: 139.955056, name: "百合" },
    { lat: 35.833556, lng: 139.955083, name: "かしのき" },
    { lat: 35.834667, lng: 139.955972, name: "サルスベリ" },
    { lat: 35.834528, lng: 139.955194, name: "イレックス・カシネ" },
    { lat: 35.834361, lng: 139.95525, name: "トウネズミモチ" },
    { lat: 35.834056, lng: 139.955417, name: "クスノキ" },
    { lat: 35.834222, lng: 139.955444, name: "ヨーロッパイチイ" },
    { lat: 35.834306, lng: 139.955583, name: "モミジ" },
    { lat: 35.834472, lng: 139.956, name: "百合" },
    { lat: 35.833111, lng: 139.956528, name: "せいようし" },
    { lat: 35.833528, lng: 139.956611, name: "けやき" },
    { lat: 35.833639, lng: 139.956556, name: "ゆちゃ" },
    { lat: 35.834306, lng: 139.955472, name: "けやき" },
    { lat: 35.83425, lng: 139.955306, name: "けやき" },
    { lat: 35.834194, lng: 139.955333, name: "下野か" },
    { lat: 35.834222, lng: 139.955361, name: "もみじ" },
    { lat: 35.834139, lng: 139.955472, name: "もみじ" },
    { lat: 35.834167, lng: 139.955333, name: "けやき" },
    { lat: 35.834139, lng: 139.955333, name: "ケヤキ" },
    { lat: 35.834167, lng: 139.955361, name: "ケヤキ" },
    { lat: 35.834111, lng: 139.955389, name: "シュガーベリー" },
    { lat: 35.834111, lng: 139.955444, name: "けやき" },
    { lat: 35.834083, lng: 139.955361, name: "ケヤキ" },
    { lat: 35.834056, lng: 139.955333, name: "もみじ" },
    { lat: 35.833972, lng: 139.955444, name: "サルスベリ" },
    { lat: 35.834028, lng: 139.955472, name: "ケヤキ" },
    { lat: 35.833972, lng: 139.9555, name: "フイリケヤキ" },
    { lat: 35.834694, lng: 139.955194, name: "はなみずき" },
    { lat: 35.834667, lng: 139.955222, name: "ベンジャミン" },
    { lat: 35.834694, lng: 139.955222, name: "もちのき" },
    { lat: 35.834639, lng: 139.955167, name: "ろうばい" },
    { lat: 35.834667, lng: 139.955167, name: "みろばらんすもも" },
    { lat: 35.834639, lng: 139.955167, name: "ゆちや" },
    { lat: 35.834611, lng: 139.955167, name: "もっこく" },
    { lat: 35.834583, lng: 139.955139, name: "かじのき" },
    { lat: 35.834556, lng: 139.955139, name: "こうやまき" },
    { lat: 35.8345, lng: 139.95525, name: "みずき" },
    { lat: 35.834472, lng: 139.95522, name: "みろばらんすもも" },
    { lat: 35.834417, lng: 139.95525, name: "いちい" },
    { lat: 35.834444, lng: 139.955278, name: "からまつ" },
    { lat: 35.834389, lng: 139.955278, name: "サルスベリ" },
    { lat: 35.834389, lng: 139.95525, name: "いちい" },
    { lat: 35.834389, lng: 139.955278, name: "サルスベリ" },
    { lat: 35.8345, lng: 139.955667, name: "けやき" },
    { lat: 35.8345, lng: 139.955389, name: "銀木犀" },
    { lat: 35.834472, lng: 139.955472, name: "にわうるし" },
    { lat: 35.834472, lng: 139.95575, name: "さつき" },
    { lat: 35.8345, lng: 139.955694, name: "けやき" },
    { lat: 35.834444, lng: 139.956, name: "百合" }
];

/* ========================================
   地図の初期化
======================================== */

function initializeMap() {
    if (typeof maplibregl === "undefined") {
        console.error("MapLibre GL JSを読み込めませんでした。");
        return;
    }

    map = new maplibregl.Map({
        container: "map",
        style: aerialStyle,
        center: INITIAL_CENTER,
        zoom: INITIAL_ZOOM,
        pitch: 0,
        bearing: 0,
        attributionControl: true
    });

    map.addControl(
        new maplibregl.NavigationControl({
            showCompass: true,
            showZoom: true,
            visualizePitch: false
        }),
        "top-right"
    );

    map.addControl(
        new maplibregl.ScaleControl({
            maxWidth: 100,
            unit: "metric"
        }),
        "bottom-left"
    );

    map.on("load", () => {
        addPlantMarkers();
        addCurrentLocationControl();
        startLocationTracking();

        console.log("REITAKUMAPSの地図を読み込みました。");
    });

    map.on("error", (event) => {
        if (event && event.error) {
            console.error("地図の読み込みエラー:", event.error);
        }
    });
}

/* ========================================
   地図の切り替え
======================================== */

function changeMapMode(mode) {
    if (!map || !map.isStyleLoaded()) {
        if (map) {
            map.once("load", () => changeMapMode(mode));
        }
        return;
    }

    if (mode !== MAP_MODES.photo && mode !== MAP_MODES.normal) {
        return;
    }

    if (currentMode === mode) {
        return;
    }

    currentMode = mode;

    const center = map.getCenter();
    const zoom = map.getZoom();
    const bearing = map.getBearing();
    const pitch = map.getPitch();

    const nextStyle =
        mode === MAP_MODES.photo
            ? aerialStyle
            : normalStyle;

    map.setStyle(nextStyle);

    /*
     * スタイル切り替え時も、現在の表示位置やズームを維持。
     * DOMで作成した木のマーカーと現在地マーカーも残る。
     */
    map.once("style.load", () => {
        map.jumpTo({
            center,
            zoom,
            bearing,
            pitch
        });
    });

    updateMapModeButtons();
}

function updateMapModeButtons() {
    const photoButton = document.getElementById("photoModeButton");
    const normalButton = document.getElementById("normalModeButton");

    if (!photoButton || !normalButton) {
        return;
    }

    const photoSelected = currentMode === MAP_MODES.photo;

    photoButton.classList.toggle("active", photoSelected);
    normalButton.classList.toggle("active", !photoSelected);

    photoButton.setAttribute("aria-pressed", String(photoSelected));
    normalButton.setAttribute("aria-pressed", String(!photoSelected));
}

function setupMapModeButtons() {
    const photoButton = document.getElementById("photoModeButton");
    const normalButton = document.getElementById("normalModeButton");

    if (photoButton) {
        photoButton.addEventListener("click", () => {
            changeMapMode(MAP_MODES.photo);
        });
    }

    if (normalButton) {
        normalButton.addEventListener("click", () => {
            changeMapMode(MAP_MODES.normal);
        });
    }

    updateMapModeButtons();
}

/* ========================================
   木のマーカー
======================================== */

function addPlantMarkers() {
    plants.forEach((plant) => {
        const markerElement = document.createElement("div");

        markerElement.style.width = "14px";
        markerElement.style.height = "14px";
        markerElement.style.borderRadius = "50%";
        markerElement.style.background = "#25a244";
        markerElement.style.border = "2px solid white";
        markerElement.style.boxShadow = "0 1px 5px rgba(0,0,0,0.45)";
        markerElement.style.cursor = "pointer";

        markerElement.setAttribute("role", "button");
        markerElement.setAttribute(
            "aria-label",
            plant.name + "の位置"
        );

        const popup = new maplibregl.Popup({
            offset: 12,
            closeButton: true,
            closeOnClick: true
        }).setText(plant.name);

        new maplibregl.Marker({
            element: markerElement,
            anchor: "center"
        })
            .setLngLat([plant.lng, plant.lat])
            .setPopup(popup)
            .addTo(map);
    });
}

/* ========================================
   現在地ボタン
======================================== */

function addCurrentLocationControl() {
    const CurrentLocationControl = class {
        onAdd(mapInstance) {
            this.map = mapInstance;

            this.container = document.createElement("div");
            this.container.className = "maplibregl-ctrl maplibregl-ctrl-group";

            const button = document.createElement("button");

            button.type = "button";
            button.title = "現在地へ移動";
            button.setAttribute("aria-label", "現在地へ移動");
            button.textContent = "◎";

            button.style.fontSize = "24px";
            button.style.fontWeight = "700";
            button.style.lineHeight = "30px";

            button.addEventListener("click", () => {
                goToCurrentLocation();
            });

            this.container.appendChild(button);

            return this.container;
        }

        onRemove() {
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
            }

            this.map = undefined;
        }
    };

    map.addControl(new CurrentLocationControl(), "bottom-right");
}

function goToCurrentLocation() {
    if (currentLocation && map) {
        map.flyTo({
            center: [
                currentLocation.longitude,
                currentLocation.latitude
            ],
            zoom: 18,
            essential: true
        });

        return;
    }

    if (!navigator.geolocation) {
        alert("この端末では位置情報を利用できません。");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            updateCurrentLocation(position);
        },
        (error) => {
            showLocationError(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 5000
        }
    );
}

/* ========================================
   GPS・現在地マーカー
======================================== */

function startLocationTracking() {
    if (!navigator.geolocation) {
        console.warn("この端末ではGPSを利用できません。");
        return;
    }

    locationWatchId = navigator.geolocation.watchPosition(
        updateCurrentLocation,
        showLocationError,
        {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 15000
        }
    );
}

function updateCurrentLocation(position) {
    if (!map) {
        return;
    }

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    currentLocation = {
        latitude,
        longitude,
        accuracy: position.coords.accuracy
    };

    const coordinates = [longitude, latitude];

    if (!currentMarker) {
        currentArrowElement = document.createElement("div");
        currentArrowElement.className = "current-location-marker";

        currentArrowElement.style.width = "42px";
        currentArrowElement.style.height = "42px";

        currentMarker = new maplibregl.Marker({
            element: currentArrowElement,
            anchor: "center",
            rotationAlignment: "map"
        })
            .setLngLat(coordinates)
            .addTo(map);

        /*
         * 初回だけ現在地付近へ移動する。
         * 以降はGPS更新のたびに地図を動かさない。
         */
        if (!map.hasAppearedAtCurrentLocation) {
            map.hasAppearedAtCurrentLocation = true;

            map.flyTo({
                center: coordinates,
                zoom: Math.max(map.getZoom(), 18),
                essential: true
            });
        }
    } else {
        currentMarker.setLngLat(coordinates);
    }

    updateArrowRotation();
}

function showLocationError(error) {
    if (!error) {
        return;
    }

    switch (error.code) {
        case error.PERMISSION_DENIED:
            console.warn("位置情報の使用が許可されていません。");
            break;

        case error.POSITION_UNAVAILABLE:
            console.warn("現在地を取得できませんでした。");
            break;

        case error.TIMEOUT:
            console.warn("位置情報の取得がタイムアウトしました。");
            break;

        default:
            console.warn("位置情報の取得中にエラーが発生しました。");
    }
}

/* ========================================
   コンパス
======================================== */

function setupCompass() {
    const button = document.getElementById("compassButton");

    if (!button) {
        return;
    }

    button.addEventListener("click", async () => {
        if (compassEnabled) {
            compassEnabled = false;
            button.textContent = "コンパスを有効化";
            window.removeEventListener(
                "deviceorientation",
                handleDeviceOrientation
            );
            window.removeEventListener(
                "deviceorientationabsolute",
                handleDeviceOrientation
            );
            return;
        }

        /*
         * iOS 13以降では、ボタン操作から
         * 方向センサーの許可を要求する必要がある。
         */
        try {
            if (
                typeof DeviceOrientationEvent !== "undefined" &&
                typeof DeviceOrientationEvent.requestPermission === "function"
            ) {
                const permission =
                    await DeviceOrientationEvent.requestPermission();

                if (permission !== "granted") {
                    alert("コンパスの利用が許可されませんでした。");
                    return;
                }
            }

            compassEnabled = true;

            window.addEventListener(
                "deviceorientation",
                handleDeviceOrientation
            );

            window.addEventListener(
                "deviceorientationabsolute",
                handleDeviceOrientation
            );

            button.textContent = "コンパス有効中";
        } catch (error) {
            console.error("コンパスを有効にできませんでした:", error);
            alert("コンパスを利用できませんでした。端末の対応状況を確認してください。");
        }
    });
}

function handleDeviceOrientation(event) {
    if (!compassEnabled) {
        return;
    }

    let heading = null;

    if (typeof event.webkitCompassHeading === "number") {
        heading = event.webkitCompassHeading;
    } else if (typeof event.alpha === "number") {
        heading = 360 - event.alpha;
    }

    if (heading === null || Number.isNaN(heading)) {
        return;
    }

    compassHeading = (heading + 360) % 360;

    updateArrowRotation();
}

function updateArrowRotation() {
    if (!currentArrowElement) {
        return;
    }

    /*
     * 矢印画像の向きに合わせて回転角を調整する。
     * 画像の正面方向によっては角度の補正が必要。
     */
    currentArrowElement.style.transform =
        `rotate(${compassHeading}deg)`;
}

/* ========================================
   PWA インストール
======================================== */

function setupInstallPrompt() {
    const banner = document.getElementById("installBanner");
    const installButton = document.getElementById("installButton");
    const closeButton = document.getElementById("closeInstallButton");

    const iosHint = document.getElementById("iosHint");
    const closeIosHint = document.getElementById("closeIosHint");

    const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;

    if (isStandalone) {
        return;
    }

    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();

        deferredInstallPrompt = event;

        if (banner) {
            banner.hidden = false;
        }
    });

    if (installButton) {
        installButton.addEventListener("click", async () => {
            if (!deferredInstallPrompt) {
                return;
            }

            deferredInstallPrompt.prompt();

            await deferredInstallPrompt.userChoice;

            deferredInstallPrompt = null;

            if (banner) {
                banner.hidden = true;
            }
        });
    }

    if (closeButton) {
        closeButton.addEventListener("click", () => {
            if (banner) {
                banner.hidden = true;
            }
        });
    }

    /*
     * iPhoneではSafariの共有メニューから
     * ホーム画面に追加する。
     */
    const isIOS =
        /iphone|ipad|ipod/i.test(navigator.userAgent);

    const isSafari =
        /safari/i.test(navigator.userAgent) &&
        !/crios|fxios|edgios|chrome/i.test(navigator.userAgent);

    if (isIOS && isSafari && iosHint) {
        iosHint.hidden = false;
    }

    if (closeIosHint) {
        closeIosHint.addEventListener("click", () => {
            iosHint.hidden = true;
        });
    }

    window.addEventListener("appinstalled", () => {
        deferredInstallPrompt = null;

        if (banner) {
            banner.hidden = true;
        }

        if (iosHint) {
            iosHint.hidden = true;
        }
    });
}

/* ========================================
   起動処理
======================================== */

document.addEventListener("DOMContentLoaded", () => {
    setupMapModeButtons();
    setupCompass();
    setupInstallPrompt();
    initializeMap();
});

/* ページを離れるときにGPS監視を停止 */

window.addEventListener("pagehide", () => {
    if (
        locationWatchId !== null &&
        navigator.geolocation
    ) {
        navigator.geolocation.clearWatch(locationWatchId);
        locationWatchId = null;
    }
});

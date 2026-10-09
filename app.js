
"use strict";

/* =====================================
   REITAKUMAPS
   ===================================== */

const INITIAL_CENTER = [139.95603, 35.83444];
const INITIAL_ZOOM = 18;

const MAP_MODES = {
  photo: "photo",
  normal: "normal"
};

let currentMode = MAP_MODES.photo;
let map = null;

let currentMarker = null;
let currentArrowElement = null;
let currentLocation = null;

let compassEnabled = false;
let compassHeading = 0;

let deferredInstallPrompt = null;
let locationWatchId = null;
let hasCenteredOnLocation = false;

/* =====================================
   地図スタイル
   ===================================== */

const aerialStyle = {
  version: 8,
  sources: {
    aerial: {
      type: "raster",
      tiles: [
        "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg"
      ],
      tileSize: 256,
      minzoom: 2,
      maxzoom: 18,
      attribution:
        '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">国土地理院</a>'
    }
  },
  layers: [
    {
      id: "aerial-layer",
      type: "raster",
      source: "aerial"
    }
  ]
};

const normalStyle =
  "https://tiles.openfreemap.org/styles/liberty";

/* =====================================
   木のデータ
   以前のコードにある plants の66件を
   この場所にそのまま入れる
   ===================================== */

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

/* =====================================
   地図の初期化
   ===================================== */

function initializeMap() {
  if (typeof maplibregl === "undefined") {
    console.error("MapLibre GL JSを読み込めませんでした。");
    return;
  }

  const mapElement = document.getElementById("map");

  if (!mapElement) {
    console.error("地図を表示する要素 #map がありません。");
    return;
  }

  map = new maplibregl.Map({
    container: mapElement,
    style: aerialStyle,
    center: INITIAL_CENTER,
    zoom: INITIAL_ZOOM,
    maxZoom: 18,
    attributionControl: true
  });

  map.setMaxZoom(18);

  map.addControl(
    new maplibregl.NavigationControl(),
    "top-right"
  );

  map.addControl(
    new maplibregl.ScaleControl({
      maxWidth: 100,
      unit: "metric"
    }),
    "bottom-left"
  );

  map.on("load", function () {
    console.log("REITAKUMAPSの地図を読み込みました。");

    addPlantMarkers();
    addCurrentLocationControl();
    startLocationTracking();

    updateMapModeButtons();

    // 地図の表示サイズを再計算
    map.resize();
  });

  map.on("error", function (event) {
    if (event && event.error) {
      console.warn("地図の読み込みエラー:", event.error.message);
    }
  });
}

/* =====================================
   地図切り替え
   ===================================== */

function changeMapMode(mode) {
  if (!map) return;

  if (mode !== MAP_MODES.photo &&
      mode !== MAP_MODES.normal) {
    return;
  }

  if (currentMode === mode) return;

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

  map.once("style.load", function () {
    map.jumpTo({
      center: center,
      zoom: Math.min(zoom, 18),
      bearing: bearing,
      pitch: pitch
    });

    // setStyleで消えた地図上のマーカーを再追加
    addPlantMarkers();

    if (currentLocation) {
      createOrMoveCurrentMarker(
        currentLocation.longitude,
        currentLocation.latitude
      );
    }

    map.resize();
  });

  updateMapModeButtons();
}

function updateMapModeButtons() {
  const photoButton =
    document.getElementById("photoModeButton");

  const normalButton =
    document.getElementById("normalModeButton");

  if (photoButton) {
    const active = currentMode === MAP_MODES.photo;

    photoButton.classList.toggle("active", active);
    photoButton.setAttribute("aria-pressed", String(active));
  }

  if (normalButton) {
    const active = currentMode === MAP_MODES.normal;

    normalButton.classList.toggle("active", active);
    normalButton.setAttribute("aria-pressed", String(active));
  }
}

function setupMapModeButtons() {
  const photoButton =
    document.getElementById("photoModeButton");

  const normalButton =
    document.getElementById("normalModeButton");

  if (photoButton) {
    photoButton.addEventListener("click", function () {
      changeMapMode(MAP_MODES.photo);
    });
  } else {
    console.error("航空写真ボタンが見つかりません。");
  }

  if (normalButton) {
    normalButton.addEventListener("click", function () {
      changeMapMode(MAP_MODES.normal);
    });
  } else {
    console.error("通常地図ボタンが見つかりません。");
  }
}

/* =====================================
   木のマーカー
   ===================================== */

function addPlantMarkers() {
  if (!map || !Array.isArray(plants)) return;

  plants.forEach(function (plant) {
    const latitude = Number(
      plant.lat ?? plant.latitude
    );

    const longitude = Number(
      plant.lng ?? plant.lon ?? plant.longitude
    );

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return;
    }

    // 既存データの項目名に合わせて表示名を取得
    const plantName =
      plant.name ||
      plant.title ||
      plant.category ||
      "木";

    const markerElement = document.createElement("div");
    markerElement.className = "plant-marker";
    markerElement.setAttribute("aria-label", plantName);

    const popupContent = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = plantName;
    popupContent.appendChild(title);

    if (plant.description) {
      const description = document.createElement("p");
      description.textContent = plant.description;
      popupContent.appendChild(description);
    }

    new maplibregl.Marker({
      element: markerElement,
      anchor: "center"
    })
      .setLngLat([longitude, latitude])
      .setPopup(
        new maplibregl.Popup({
          offset: 12
        }).setDOMContent(popupContent)
      )
      .addTo(map);
  });
}

/* =====================================
   現在地ボタン
   ===================================== */

function addCurrentLocationControl() {
  if (!map) return;

  const controlContainer = document.createElement("div");
  controlContainer.className = "maplibregl-ctrl maplibregl-ctrl-group";

  const locationButton = document.createElement("button");
  locationButton.type = "button";
  locationButton.textContent = "◎";
  locationButton.title = "現在地を表示";
  locationButton.setAttribute("aria-label", "現在地を表示");

  locationButton.style.fontSize = "24px";

  locationButton.addEventListener("click", function () {
    goToCurrentLocation();
  });

  controlContainer.appendChild(locationButton);

  const control = {
    onAdd: function () {
      return controlContainer;
    },
    onRemove: function () {
      controlContainer.remove();
    }
  };

  map.addControl(control, "top-right");
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
    updateCurrentLocation,
    showLocationError,
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000
    }
  );
}

/* =====================================
   位置情報の追跡
   ===================================== */

function startLocationTracking() {
  if (!navigator.geolocation) {
    console.warn("この端末では位置情報を利用できません。");
    return;
  }

  locationWatchId = navigator.geolocation.watchPosition(
    updateCurrentLocation,
    showLocationError,
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 20000
    }
  );
}

function updateCurrentLocation(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return;
  }

  currentLocation = {
    latitude: latitude,
    longitude: longitude,
    accuracy: position.coords.accuracy
  };

  createOrMoveCurrentMarker(longitude, latitude);

  if (map && !hasCenteredOnLocation) {
    hasCenteredOnLocation = true;

    map.flyTo({
      center: [longitude, latitude],
      zoom: 18,
      essential: true
    });
  }

  updateArrowRotation();
}

function createOrMoveCurrentMarker(longitude, latitude) {
  if (!map) return;

  if (!currentMarker) {
    currentArrowElement = document.createElement("div");
    currentArrowElement.className = "current-location-marker";
    currentArrowElement.setAttribute("aria-label", "現在地");

    currentMarker = new maplibregl.Marker({
      element: currentArrowElement,
      anchor: "center"
    })
      .setLngLat([longitude, latitude])
      .addTo(map);
  } else {
    currentMarker.setLngLat([longitude, latitude]);
  }

  updateArrowRotation();
}

function showLocationError(error) {
  if (!error) return;

  const messages = {
    1: "位置情報の使用が許可されていません。",
    2: "現在地を取得できませんでした。",
    3: "位置情報の取得がタイムアウトしました。"
  };

  console.warn(
    messages[error.code] || "位置情報を取得できませんでした。",
    error.message || ""
  );
}

/* =====================================
   コンパス
   ===================================== */

function setupCompass() {
  const compassButton =
    document.getElementById("compassButton");

  if (!compassButton) return;

  compassButton.addEventListener("click", async function () {
    if (compassEnabled) {
      disableCompass();
      return;
    }

    // iOS Safariでは許可要求が必要な場合がある
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      try {
        const permission =
          await DeviceOrientationEvent.requestPermission();

        if (permission !== "granted") {
          alert("コンパスの使用が許可されていません。");
          return;
        }
      } catch (error) {
        console.warn("コンパスの許可を取得できませんでした。", error);
        return;
      }
    }

    enableCompass();
  });
}

function enableCompass() {
  compassEnabled = true;

  window.addEventListener(
    "deviceorientation",
    handleDeviceOrientation,
    true
  );

  window.addEventListener(
    "deviceorientationabsolute",
    handleDeviceOrientation,
    true
  );

  const compassButton =
    document.getElementById("compassButton");

  if (compassButton) {
    compassButton.setAttribute("aria-pressed", "true");
  }
}

function disableCompass() {
  compassEnabled = false;

  window.removeEventListener(
    "deviceorientation",
    handleDeviceOrientation,
    true
  );

  window.removeEventListener(
    "deviceorientationabsolute",
    handleDeviceOrientation,
    true
  );

  const compassButton =
    document.getElementById("compassButton");

  if (compassButton) {
    compassButton.setAttribute("aria-pressed", "false");
  }
}

function handleDeviceOrientation(event) {
  if (!compassEnabled) return;

  let heading = null;

  if (typeof event.webkitCompassHeading === "number") {
    heading = event.webkitCompassHeading;
  } else if (typeof event.alpha === "number") {
    heading = 360 - event.alpha;
  }

  if (!Number.isFinite(heading)) return;

  compassHeading = (heading + 360) % 360;

  updateArrowRotation();
}

function updateArrowRotation() {
  if (!currentArrowElement) return;

  const rotation = compassEnabled ? compassHeading : 0;

  currentArrowElement.style.transform =
    "rotate(" + rotation + "deg)";
}

/* =====================================
   PWAインストール
   ===================================== */

function setupInstallPrompt() {
  const installBanner =
    document.getElementById("installBanner");

  const installButton =
    document.getElementById("installButton");

  const closeInstallButton =
    document.getElementById("closeInstallButton");

  const iosInstallHint =
    document.getElementById("iosInstallHint");

  const closeIosHintButton =
    document.getElementById("closeIosHintButton");

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  if (isStandalone) return;

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredInstallPrompt = event;

    if (installBanner) {
      installBanner.hidden = false;
    }
  });

  if (installButton) {
    installButton.addEventListener("click", async function () {
      if (!deferredInstallPrompt) return;

      deferredInstallPrompt.prompt();

      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;

      if (installBanner) {
        installBanner.hidden = true;
      }
    });
  }

  if (closeInstallButton && installBanner) {
    closeInstallButton.addEventListener("click", function () {
      installBanner.hidden = true;
    });
  }

  // iPhoneのSafari向け案内
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isSafari =
    /safari/i.test(navigator.userAgent) &&
    !/crios|fxios|edgios/i.test(navigator.userAgent);

  if (isIOS && isSafari && iosInstallHint) {
    iosInstallHint.hidden = false;
  }

  if (closeIosHintButton && iosInstallHint) {
    closeIosHintButton.addEventListener("click", function () {
      iosInstallHint.hidden = true;
    });
  }

  window.addEventListener("appinstalled", function () {
    if (installBanner) {
      installBanner.hidden = true;
    }

    deferredInstallPrompt = null;
  });
}

/* =====================================
   起動処理
   ===================================== */

document.addEventListener("DOMContentLoaded", function () {
  setupMapModeButtons();
  setupCompass();
  setupInstallPrompt();
  initializeMap();
});

/* =====================================
   終了時の処理
   ===================================== */

window.addEventListener("pagehide", function () {
  if (locationWatchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(locationWatchId);
    locationWatchId = null;
  }
});

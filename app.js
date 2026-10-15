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
   Googleスプレッドシート設定
   ===================================== */

// Apps ScriptをウェブアプリとしてデプロイしたURLを設定する
// スプレッドシートのURLではないので注意！
const PLANTS_API_URL =
  "https://script.google.com/a/macros/reitaku.jp/s/AKfycbyJubtkbo4ZmDn7S6spTA8VArect_dWqr5NAJDSwwPHIv5VAFBOAbjQ7MF83kZcL5w/exec";

let plants = [];
let plantMarkers = [];
let plantsReloadTimer = null;
let plantsLoading = false;

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

    // スプレッドシートから木のデータを取得
    loadPlantsFromSheet();

    // 1分ごとに木のデータを再取得
    if (plantsReloadTimer !== null) {
      clearInterval(plantsReloadTimer);
    }

    plantsReloadTimer = setInterval(
      loadPlantsFromSheet,
      60000
    );

    addCurrentLocationControl();
    startLocationTracking();
    updateMapModeButtons();

    map.resize();
  });

  map.on("error", function (event) {
    if (event && event.error) {
      console.warn(
        "地図の読み込みエラー:",
        event.error.message
      );
    }
  });
}

/* =====================================
   地図切り替え
   ===================================== */

function changeMapMode(mode) {
  if (!map) return;

  if (
    mode !== MAP_MODES.photo &&
    mode !== MAP_MODES.normal
  ) {
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

    // 地図の切り替え後に木のマーカーを再表示
    addPlantMarkers();

    // 現在地マーカーも再表示
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
    photoButton.setAttribute(
      "aria-pressed",
      String(active)
    );
  }

  if (normalButton) {
    const active = currentMode === MAP_MODES.normal;

    normalButton.classList.toggle("active", active);
    normalButton.setAttribute(
      "aria-pressed",
      String(active)
    );
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
   Googleスプレッドシートから木のデータを取得
   ===================================== */

// Apps Scriptから呼び出される関数
window.receivePlantsData = function (data) {
  plantsLoading = false;

  if (!Array.isArray(data)) {
    console.error(
      "木データの形式が正しくありません。",
      data
    );
    return;
  }

  // 緯度・経度が正しいデータだけを使用する
  plants = data.filter(function (plant) {
    const latitude = Number(
      plant.lat ?? plant.latitude
    );

    const longitude = Number(
      plant.lng ?? plant.lon ?? plant.longitude
    );

    return (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  });

  addPlantMarkers();

  console.log(
    "木データを読み込みました:",
    plants.length,
    "件"
  );
};

// Apps ScriptのJSONPを読み込む
function loadPlantsFromSheet() {
  if (plantsLoading) return;

  if (
    !PLANTS_API_URL ||
    PLANTS_API_URL ===
      "https://script.google.com/a/macros/reitaku.jp/s/AKfycbyJubtkbo4ZmDn7S6spTA8VArect_dWqr5NAJDSwwPHIv5VAFBOAbjQ7MF83kZcL5w/exec"
  ) {
    console.warn(
      "PLANTS_API_URLにApps ScriptのウェブアプリURLを設定してください。"
    );
    return;
  }

  plantsLoading = true;

  const script = document.createElement("script");

  script.src =
    PLANTS_API_URL +
    (PLANTS_API_URL.includes("?") ? "&" : "?") +
    "callback=receivePlantsData&_=" +
    Date.now();

  script.async = true;

  script.onerror = function () {
    plantsLoading = false;

    console.error(
      "木データを取得できませんでした。URL、デプロイ設定、シート名を確認してください。"
    );

    script.remove();
  };

  script.onload = function () {
    script.remove();
    plantsLoading = false;
  };

  document.head.appendChild(script);
}

/* =====================================
   木のマーカー
   ===================================== */

function addPlantMarkers() {
  if (!map || !Array.isArray(plants)) return;

  // 古いマーカーを削除して重複を防止
  plantMarkers.forEach(function (marker) {
    marker.remove();
  });

  plantMarkers = [];

  plants.forEach(function (plant) {
    const latitude = Number(
      plant.lat ?? plant.latitude
    );

    const longitude = Number(
      plant.lng ?? plant.lon ?? plant.longitude
    );

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return;
    }

    const plantName =
      plant.name ||
      plant.title ||
      plant.category ||
      "木";

    const markerElement =
      document.createElement("div");

    markerElement.className = "plant-marker";
    markerElement.setAttribute(
      "aria-label",
      plantName
    );
    markerElement.setAttribute("role", "button");
    markerElement.setAttribute("tabindex", "0");
    markerElement.title = plantName;

    const popupContent =
      document.createElement("div");

    const title = document.createElement("strong");
    title.textContent = plantName;

    popupContent.appendChild(title);

    const descriptionText =
      plant.description ||
      plant.note ||
      plant.備考 ||
      "";

    if (descriptionText) {
      const description =
        document.createElement("p");

      description.textContent = descriptionText;
      popupContent.appendChild(description);
    }

    const marker = new maplibregl.Marker({
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

    plantMarkers.push(marker);
  });
}

/* =====================================
   現在地ボタン
   ===================================== */

function addCurrentLocationControl() {
  if (!map) return;

  const controlContainer =
    document.createElement("div");

  controlContainer.className =
    "maplibregl-ctrl maplibregl-ctrl-group";

  const locationButton =
    document.createElement("button");

  locationButton.type = "button";
  locationButton.textContent = "◎";
  locationButton.title = "現在地を表示";

  locationButton.setAttribute(
    "aria-label",
    "現在地を表示"
  );

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
    console.warn(
      "この端末では位置情報を利用できません。"
    );
    return;
  }

  locationWatchId =
    navigator.geolocation.watchPosition(
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

  createOrMoveCurrentMarker(
    longitude,
    latitude
  );

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

function createOrMoveCurrentMarker(
  longitude,
  latitude
) {
  if (!map) return;

  if (!currentMarker) {
    currentArrowElement =
      document.createElement("div");

    currentArrowElement.className =
      "current-location-marker";

    currentArrowElement.setAttribute(
      "aria-label",
      "現在地"
    );

    currentMarker = new maplibregl.Marker({
      element: currentArrowElement,
      anchor: "center"
    })
      .setLngLat([longitude, latitude])
      .addTo(map);
  } else {
    currentMarker.setLngLat([
      longitude,
      latitude
    ]);
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
    messages[error.code] ||
      "位置情報を取得できませんでした。",
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

  compassButton.addEventListener(
    "click",
    async function () {
      if (compassEnabled) {
        disableCompass();
        return;
      }

      // iOS Safariでは許可要求が必要な場合がある
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission ===
          "function"
      ) {
        try {
          const permission =
            await DeviceOrientationEvent.requestPermission();

          if (permission !== "granted") {
            alert("コンパスの使用が許可されていません。");
            return;
          }
        } catch (error) {
          console.warn(
            "コンパスの許可を取得できませんでした。",
            error
          );
          return;
        }
      }

      enableCompass();
    }
  );
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
    compassButton.setAttribute(
      "aria-pressed",
      "true"
    );
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
    compassButton.setAttribute(
      "aria-pressed",
      "false"
    );
  }
}

function handleDeviceOrientation(event) {
  if (!compassEnabled) return;

  let heading = null;

  if (
    typeof event.webkitCompassHeading === "number"
  ) {
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

  const rotation =
    compassEnabled ? compassHeading : 0;

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
    window.matchMedia(
      "(display-mode: standalone)"
    ).matches ||
    window.navigator.standalone === true;

  if (isStandalone) return;

  window.addEventListener(
    "beforeinstallprompt",
    function (event) {
      event.preventDefault();
      deferredInstallPrompt = event;

      if (installBanner) {
        installBanner.hidden = false;
      }
    }
  );

  if (installButton) {
    installButton.addEventListener(
      "click",
      async function () {
        if (!deferredInstallPrompt) return;

        deferredInstallPrompt.prompt();

        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;

        if (installBanner) {
          installBanner.hidden = true;
        }
      }
    );
  }

  if (closeInstallButton && installBanner) {
    closeInstallButton.addEventListener(
      "click",
      function () {
        installBanner.hidden = true;
      }
    );
  }

  // iPhoneのSafari向け案内
  const isIOS =
    /iphone|ipad|ipod/i.test(navigator.userAgent);

  const isSafari =
    /safari/i.test(navigator.userAgent) &&
    !/crios|fxios|edgios/i.test(navigator.userAgent);

  if (isIOS && isSafari && iosInstallHint) {
    iosInstallHint.hidden = false;
  }

  if (closeIosHintButton && iosInstallHint) {
    closeIosHintButton.addEventListener(
      "click",
      function () {
        iosInstallHint.hidden = true;
      }
    );
  }

  window.addEventListener(
    "appinstalled",
    function () {
      if (installBanner) {
        installBanner.hidden = true;
      }

      deferredInstallPrompt = null;
    }
  );
}

/* =====================================
   起動処理
   ===================================== */

document.addEventListener(
  "DOMContentLoaded",
  function () {
    setupMapModeButtons();
    setupCompass();
    setupInstallPrompt();
    initializeMap();
  }
);

/* =====================================
   終了時の処理
   ===================================== */

window.addEventListener("pagehide", function () {
  if (
    locationWatchId !== null &&
    navigator.geolocation
  ) {
    navigator.geolocation.clearWatch(
      locationWatchId
    );

    locationWatchId = null;
  }

  if (plantsReloadTimer !== null) {
    clearInterval(plantsReloadTimer);
    plantsReloadTimer = null;
  }
});
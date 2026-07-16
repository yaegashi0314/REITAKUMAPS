let map;
let currentMarker;

// ===== 植物データ（あとで追加）=====
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
    { lat: 35.834444, lng: 139.956, name: "百合" },
];
// ================================

// 地図を作成
map = new maplibregl.Map({
    container: "map",
    style: "https://api.maptiler.com/maps/streets-v2/style.json?key=8eMo5VJPTs3GM9Axz6Dn",
    center: [139.95603, 35.83444],
    zoom: 18,
    pitch: 45,
    bearing: 0
});

// ナビゲーションボタン
map.addControl(new maplibregl.NavigationControl());

// 現在地を追跡
navigator.geolocation.watchPosition((position) => {

    const lng = position.coords.longitude;
    const lat = position.coords.latitude;

    if (!currentMarker) {

        currentMarker = new maplibregl.Marker({
            color: "#007AFF"
        })
            .setLngLat([lng, lat])
            .addTo(map);

    } else {

        currentMarker.setLngLat([lng, lat]);

    }

    map.flyTo({
        center: [lng, lat],
        zoom: 18,
        essential: true
    });

}, (error) => {

    console.log(error);

}, {
    enableHighAccuracy: true
});

// 植物マーカー
plants.forEach((plant) => {

    new maplibregl.Marker({
        color: "green"
    })
        .setLngLat([plant.lng, plant.lat])
        .setPopup(
            new maplibregl.Popup({
                offset: 25
            }).setText(plant.name)
        )
        .addTo(map);

});

// コンパスボタン
document.getElementById("compassButton").addEventListener("click", () => {

    if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
    ) {

        DeviceOrientationEvent.requestPermission().then((permission) => {

            if (permission === "granted") {
                startCompass();
            }

        });

    } else {

        startCompass();

    }

});

// コンパス開始
function startCompass() {

    window.addEventListener("deviceorientation", (event) => {

        if (event.alpha != null) {

            map.rotateTo(360 - event.alpha, {
                duration: 0
            });

        }

    });

}
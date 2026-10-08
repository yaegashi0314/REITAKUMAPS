let map;
let currentMarker;

// 現在地の座標
let currentLocation = null;


// ==================================================
// 植物データ
// ==================================================

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


// ==================================================
// 地図
// ==================================================

map = new maplibregl.Map({
    container: "map",

    style:
        "https://api.maptiler.com/maps/hybrid-v4/style.json?key=8eMo5VJPTs3GM9Axz6Dn",

    center: [139.95603, 35.83444],

    zoom: 18,

    pitch: 45,

    bearing: 0
});


// ナビゲーションボタン
map.addControl(
    new maplibregl.NavigationControl()
);


// ==================================================
// 現在地マーカー
// ==================================================

function createCurrentLocationMarker(lng, lat) {

    const markerElement =
        document.createElement("div");

    markerElement.style.width = "50px";
    markerElement.style.height = "50px";

    markerElement.style.display = "flex";

    markerElement.style.alignItems =
        "center";

    markerElement.style.justifyContent =
        "center";


    // --------------------------------
    // arrow.png
    // --------------------------------

    const arrowImage =
        document.createElement("img");

    arrowImage.src = "arrow.png";

    arrowImage.alt = "現在地";

    arrowImage.style.width = "50px";

    arrowImage.style.height = "50px";

    arrowImage.style.objectFit =
        "contain";

    arrowImage.style.display =
        "block";

    arrowImage.style.transformOrigin =
        "center center";

    arrowImage.style.transition =
        "transform 0.15s linear";


    markerElement.appendChild(
        arrowImage
    );


    // --------------------------------
    // MapLibreマーカー
    // --------------------------------

    currentMarker =
        new maplibregl.Marker({

            element:
                markerElement,

            anchor:
                "center"

        })

            .setLngLat([
                lng,
                lat
            ])

            .addTo(map);


    // コンパスから使う
    currentMarker._arrowElement =
        arrowImage;
}


// ==================================================
// 現在地取得
// ==================================================

if ("geolocation" in navigator) {

    navigator.geolocation.watchPosition(

        (position) => {

            const lng =
                position.coords.longitude;

            const lat =
                position.coords.latitude;


            // 現在地を保存
            currentLocation = [
                lng,
                lat
            ];


            // --------------------------------
            // 初回
            // --------------------------------

            if (!currentMarker) {

                createCurrentLocationMarker(
                    lng,
                    lat
                );


                // 初回だけ現在地へ移動
                map.flyTo({

                    center: [
                        lng,
                        lat
                    ],

                    zoom: 18,

                    duration: 800,

                    essential: true

                });

            }


            // --------------------------------
            // 2回目以降
            // --------------------------------

            else {

                currentMarker.setLngLat([

                    lng,
                    lat

                ]);

            }

        },


        // --------------------------------
        // GPSエラー
        // --------------------------------

        (error) => {

            console.log(
                "位置情報エラー:",
                error
            );

        },


        // --------------------------------
        // GPS設定
        // --------------------------------

        {

            enableHighAccuracy:
                true,

            maximumAge:
                5000,

            timeout:
                10000

        }
    );
}


// ==================================================
// 植物マーカー
// ==================================================

plants.forEach((plant) => {

    new maplibregl.Marker({

        color:
            "green"

    })

        .setLngLat([

            plant.lng,

            plant.lat

        ])

        .setPopup(

            new maplibregl.Popup({

                offset:
                    25

            })

                .setText(
                    plant.name
                )

        )

        .addTo(map);

});


// ==================================================
// 現在地へ戻るボタン
// Google Maps風
// ==================================================

class LocationControl {

    onAdd(map) {

        this._map =
            map;


        const container =
            document.createElement(
                "div"
            );


        container.className =
            "maplibregl-ctrl maplibregl-ctrl-group";


        // --------------------------------
        // ボタン
        // --------------------------------

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.title =
            "現在地へ戻る";


        button.setAttribute(
            "aria-label",
            "現在地へ戻る"
        );


        // --------------------------------
        // 現在地アイコン
        // --------------------------------

        button.innerHTML = `

            <span style="
                display:flex;
                align-items:center;
                justify-content:center;
                width:100%;
                height:100%;
            ">

                <span style="
                    width:14px;
                    height:14px;
                    border:3px solid #007AFF;
                    border-radius:50%;
                    position:relative;
                    box-sizing:border-box;
                ">

                    <span style="
                        position:absolute;
                        width:5px;
                        height:5px;
                        background:#007AFF;
                        border-radius:50%;
                        left:50%;
                        top:50%;
                        transform:translate(-50%,-50%);
                    "></span>

                </span>

            </span>

        `;


        // --------------------------------
        // ボタンを押す
        // --------------------------------

        button.addEventListener(

            "click",

            () => {

                if (!currentLocation) {

                    console.log(
                        "現在地を取得中です"
                    );

                    return;

                }


                map.flyTo({

                    center:
                        currentLocation,

                    zoom:
                        18,

                    duration:
                        800,

                    essential:
                        true

                });

            }

        );


        container.appendChild(
            button
        );


        this._container =
            container;


        return container;
    }


    onRemove() {

        this._container
            .parentNode
            .removeChild(
                this._container
            );

        this._map =
            undefined;
    }

}


// 右下に表示
map.addControl(

    new LocationControl(),

    "bottom-right"

);


// ==================================================
// コンパスボタン
// ==================================================

const compassButton =
    document.getElementById(
        "compassButton"
    );


if (compassButton) {

    compassButton.addEventListener(

        "click",

        async () => {


            // --------------------------------
            // iPhone / iPad
            // --------------------------------

            if (

                typeof
                    DeviceOrientationEvent
                    !== "undefined"

                &&

                typeof
                    DeviceOrientationEvent
                        .requestPermission
                    === "function"

            ) {

                try {

                    const permission =

                        await
                            DeviceOrientationEvent
                                .requestPermission();


                    if (

                        permission ===
                        "granted"

                    ) {

                        startCompass();

                    }

                    else {

                        console.log(
                            "コンパスの使用が許可されませんでした"
                        );

                    }

                }

                catch (error) {

                    console.error(
                        "コンパス許可エラー:",
                        error
                    );

                }

            }


            // --------------------------------
            // Androidなど
            // --------------------------------

            else {

                startCompass();

            }

        }

    );

}


// ==================================================
// コンパス開始
// ==================================================

function startCompass() {

    window.addEventListener(

        "deviceorientation",

        handleOrientation,

        true

    );


    if (compassButton) {

        compassButton.textContent =
            "コンパス有効中";

        compassButton.disabled =
            true;

    }

}


// ==================================================
// スマホの向きを取得
// ==================================================

function handleOrientation(event) {

    let heading =
        null;


    // --------------------------------
    // iPhone
    // --------------------------------

    if (

        event.webkitCompassHeading
        !== undefined

        &&

        event.webkitCompassHeading
        !== null

    ) {

        heading =
            event.webkitCompassHeading;

    }


    // --------------------------------
    // Android
    // --------------------------------

    else if (

        event.alpha !== null

        &&

        event.alpha !== undefined

    ) {

        heading =
            360 - event.alpha;

    }


    // 方位取得失敗
    if (heading === null) {

        return;

    }


    // 0～360度
    heading =
        (heading + 360) % 360;


    // --------------------------------
    // 矢印を180度反転
    // --------------------------------

    heading =
        heading + 180;


    // --------------------------------
    // arrow.pngを回転
    // --------------------------------

    if (

        currentMarker

        &&

        currentMarker._arrowElement

    ) {

        currentMarker
            ._arrowElement
            .style.transform =

            `rotate(${heading}deg)`;

    }

}


// ==================================================
// PWA
// ==================================================

let deferredInstallPrompt =
    null;


const installBanner =
    document.getElementById(
        "installBanner"
    );


const installButton =
    document.getElementById(
        "installButton"
    );


const closeInstallButton =
    document.getElementById(
        "closeInstallButton"
    );


const iosHint =
    document.getElementById(
        "iosHint"
    );


const closeIosHint =
    document.getElementById(
        "closeIosHint"
    );


// ==================================================
// Android / Chrome
// ==================================================

window.addEventListener(

    "beforeinstallprompt",

    (event) => {

        event.preventDefault();

        deferredInstallPrompt =
            event;


        if (installBanner) {

            installBanner.hidden =
                false;

        }

    }

);


// ==================================================
// インストール
// ==================================================

if (installButton) {

    installButton.addEventListener(

        "click",

        async () => {

            if (!deferredInstallPrompt) {

                return;

            }


            deferredInstallPrompt.prompt();


            await
                deferredInstallPrompt
                    .userChoice;


            deferredInstallPrompt =
                null;


            installBanner.hidden =
                true;

        }

    );

}


// ==================================================
// インストール案内を閉じる
// ==================================================

if (closeInstallButton) {

    closeInstallButton.addEventListener(

        "click",

        () => {

            installBanner.hidden =
                true;

        }

    );

}


// ==================================================
// iPhone判定
// ==================================================

const isIOS =

    /iphone|ipad|ipod/i.test(

        navigator.userAgent

    );


const isStandalone =

    window.matchMedia(

        "(display-mode: standalone)"

    ).matches

    ||

    window.navigator.standalone ===
        true;


// iPhoneの場合
if (

    isIOS

    &&

    !isStandalone

    &&

    iosHint

) {

    iosHint.hidden =
        false;

}


// ==================================================
// iPhone案内を閉じる
// ==================================================

if (closeIosHint) {

    closeIosHint.addEventListener(

        "click",

        () => {

            iosHint.hidden =
                true;

        }

    );

}

"use strict";

(() => {
    let cameraStream = null;
    let isCameraStarting = false;

    let cameraOpenButton;
    let cameraCloseButton;
    let cameraScreen;
    let cameraVideo;
    let cameraOverlay;
    let cameraGuide;
    let cameraInfo;
    let recognizedTreeName;
    let recognizedTreeDescription;

    function initializeCamera() {
        cameraOpenButton = document.getElementById("cameraOpenButton");
        cameraCloseButton = document.getElementById("cameraCloseButton");
        cameraScreen = document.getElementById("cameraScreen");
        cameraVideo = document.getElementById("cameraVideo");
        cameraOverlay = document.getElementById("cameraOverlay");
        cameraGuide = document.getElementById("cameraGuide");
        cameraInfo = document.getElementById("cameraInfo");
        recognizedTreeName = document.getElementById("recognizedTreeName");
        recognizedTreeDescription = document.getElementById("recognizedTreeDescription");

        const requiredElements = [
            cameraOpenButton,
            cameraCloseButton,
            cameraScreen,
            cameraVideo,
            cameraOverlay,
            cameraGuide,
            cameraInfo
        ];

        if (requiredElements.some(element => !element)) {
            console.error("カメラ機能に必要なHTML要素が見つかりません。");
            return;
        }

        cameraOpenButton.addEventListener("click", openCamera);
        cameraCloseButton.addEventListener("click", closeCamera);

        window.addEventListener("pagehide", stopCamera);

        cameraScreen.hidden = true;
    }

    async function openCamera() {
        if (isCameraStarting || cameraStream) return;

        if (!navigator.mediaDevices?.getUserMedia) {
            showCameraError(
                "このブラウザではカメラを利用できません。HTTPS接続で開いているか確認してください。"
            );
            return;
        }

        isCameraStarting = true;
        cameraOpenButton.disabled = true;

        cameraScreen.hidden = false;
        cameraGuide.textContent = "カメラを起動しています...";
        cameraInfo.hidden = false;

        if (recognizedTreeName) {
            recognizedTreeName.textContent = "樹木認識モデルは準備中です";
        }

        if (recognizedTreeDescription) {
            recognizedTreeDescription.textContent =
                "現在はカメラ映像を表示する段階です。認識モデルを追加すると、樹木の検出と情報表示ができるようになります。";
        }

        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    facingMode: { ideal: "environment" },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            cameraVideo.srcObject = cameraStream;
            await cameraVideo.play();

            cameraGuide.textContent = "カメラ起動中";
            resizeOverlay();

            cameraVideo.addEventListener("loadedmetadata", resizeOverlay);
            window.addEventListener("resize", resizeOverlay);

        } catch (error) {
            console.error("カメラ起動エラー:", error);

            stopCamera();

            if (error.name === "NotAllowedError" ||
                error.name === "PermissionDeniedError") {
                showCameraError(
                    "カメラの使用が許可されていません。ブラウザの設定からカメラを許可してください。"
                );
            } else if (error.name === "NotFoundError") {
                showCameraError(
                    "利用できるカメラが見つかりませんでした。"
                );
            } else if (error.name === "NotReadableError") {
                showCameraError(
                    "カメラを使用できません。他のアプリがカメラを使用していないか確認してください。"
                );
            } else {
                showCameraError(
                    "カメラを起動できませんでした。ブラウザのカメラ設定を確認してください。"
                );
            }
        } finally {
            isCameraStarting = false;
            cameraOpenButton.disabled = false;
        }
    }

    function closeCamera() {
        stopCamera();
        cameraScreen.hidden = true;
        cameraGuide.textContent = "カメラを起動すると樹木を認識します。";
    }

    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
        }

        if (cameraVideo) {
            cameraVideo.pause();
            cameraVideo.srcObject = null;
            cameraVideo.removeEventListener("loadedmetadata", resizeOverlay);
        }

        window.removeEventListener("resize", resizeOverlay);

        if (cameraOverlay) {
            const context = cameraOverlay.getContext("2d");
            context.clearRect(0, 0, cameraOverlay.width, cameraOverlay.height);
        }
    }

    function resizeOverlay() {
        if (!cameraVideo || !cameraOverlay) return;

        const width = cameraVideo.videoWidth;
        const height = cameraVideo.videoHeight;

        if (!width || !height) return;

        cameraOverlay.width = width;
        cameraOverlay.height = height;

        const context = cameraOverlay.getContext("2d");
        context.clearRect(0, 0, width, height);
    }

    function showCameraError(message) {
        cameraScreen.hidden = false;
        cameraGuide.textContent = message;
        cameraInfo.hidden = false;

        if (recognizedTreeName) {
            recognizedTreeName.textContent = "カメラを利用できません";
        }

        if (recognizedTreeDescription) {
            recognizedTreeDescription.textContent = message;
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeCamera);
    } else {
        initializeCamera();
    }
})();

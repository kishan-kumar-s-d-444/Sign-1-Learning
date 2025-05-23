import { GESTURE_MODEL_URL } from './config.js';

import { GestureRecognizer, FilesetResolver, DrawingUtils } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

let gestureRecognizer;
let runningMode = "IMAGE";
let webcamRunning = false;
const videoHeight = "480px";
const videoWidth = "640px";

let detectedSigns = [];
let lastSign = '';
let lastSignTime = 0;
const SIGN_DELAY = 1000; // Minimum time between signs in milliseconds

// Initialize the GestureRecognizer
const createGestureRecognizer = async () => {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");
    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath:  GESTURE_MODEL_URL,
            delegate: "GPU"
        },
        runningMode: runningMode
    });
};
createGestureRecognizer();

const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const gestureOutput = document.getElementById("gesture_output");
const signTextbox = document.getElementById("sign_textbox");
const enableWebcamButton = document.getElementById("webcamButton");
const addSpaceButton = document.getElementById("addSpace");
const backspaceButton = document.getElementById("backspace");
const clearTextButton = document.getElementById("clearText");

function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

if (hasGetUserMedia()) {
    enableWebcamButton.addEventListener("click", enableCam);
} else {
    console.warn("getUserMedia() is not supported by your browser");
    enableWebcamButton.textContent = "Webcam Not Supported";
    enableWebcamButton.disabled = true;
}

async function enableCam() {
    if (!gestureRecognizer) {
        alert("Please wait for gestureRecognizer to load");
        return;
    }

    if (webcamRunning) {
        webcamRunning = false;
        enableWebcamButton.textContent = "Enable Camera";
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    } else {
        webcamRunning = true;
        enableWebcamButton.textContent = "Disable Camera";
        try {
            const constraints = {
                video: {
                    width: 640,
                    height: 480
                }
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = stream;
            video.addEventListener("loadeddata", predictWebcam);
        } catch (err) {
            console.error("Error accessing webcam:", err);
            alert("Error accessing webcam. Please make sure you have granted camera permissions.");
        }
    }
}

let lastVideoTime = -1;
let results = undefined;

// Add text control event listeners
addSpaceButton.addEventListener('click', () => {
    const currentText = signTextbox.value;
    signTextbox.value = currentText + ' ';
});

backspaceButton.addEventListener('click', () => {
    const currentText = signTextbox.value;
    if (currentText) {
        signTextbox.value = currentText.slice(0, -1);
    }
});

clearTextButton.addEventListener('click', () => {
    signTextbox.value = '';
    detectedSigns = [];
    lastSign = '';
    lastSignTime = 0;
});

async function predictWebcam() {
    // Remove fixed dimensions and make it responsive
    canvasElement.style.width = '100%';
    canvasElement.style.height = '100%';
    
    // Make sure the canvas is setup with the video's actual dimensions
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
    
    if (runningMode === "IMAGE") {
        runningMode = "VIDEO";
        await gestureRecognizer.setOptions({ runningMode: "VIDEO" });
    }

    let nowInMs = Date.now();
    if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        results = gestureRecognizer.recognizeForVideo(video, nowInMs);
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    const drawingUtils = new DrawingUtils(canvasCtx);

    if (results.landmarks) {
        for (const landmarks of results.landmarks) {
            drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
                color: "#00FF00",
                lineWidth: 2
            });
            drawingUtils.drawLandmarks(landmarks, {
                color: "#FF0000",
                lineWidth: 1
            });
        }
    }

    canvasCtx.restore();

    if (results.gestures.length > 0) {
        const categoryName = results.gestures[0][0].categoryName;
        const categoryScore = parseFloat(results.gestures[0][0].score * 100).toFixed(2);
        
        // Only update if confidence is high enough and enough time has passed
        if (categoryScore > 80 && (nowInMs - lastSignTime > SIGN_DELAY || categoryName !== lastSign)) {
            lastSign = categoryName;
            lastSignTime = nowInMs;
            
            // Add the new sign to the array
            detectedSigns.push(categoryName);
            
            // Keep only the last 10 signs
            if (detectedSigns.length > 10) {
                detectedSigns.shift();
            }
            
            // Update the text box with the new sign without automatic spacing
            const currentText = signTextbox.value;
            signTextbox.value = currentText + categoryName;
            
            // Show the current detection
            gestureOutput.style.display = "block";
            gestureOutput.innerText = `Detected Sign: ${categoryName}\nConfidence: ${categoryScore}%`;
        }
    } else {
        gestureOutput.style.display = "none";
    }

    if (webcamRunning) {
        window.requestAnimationFrame(predictWebcam);
    }
}

document.querySelector('.menu-toggle').addEventListener('click', function() {
    this.classList.toggle('active');
    document.querySelector('nav').classList.toggle('active');
});

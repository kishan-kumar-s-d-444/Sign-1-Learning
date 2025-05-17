import { GESTURE_MODEL_URL } from './config.js';

import { GestureRecognizer, FilesetResolver, DrawingUtils } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

let gestureRecognizer;
let runningMode = "IMAGE";
let webcamRunning = false;
const videoHeight = "480px";
const videoWidth = "640px";

// Variables for sign detection and textbox display
let lastDetectedSign = null;
let canAddNewSign = true;
let signDetectionTimeout = null;

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
        gestureOutput.style.display = "block";
        const categoryName = results.gestures[0][0].categoryName;
        const categoryScore = parseFloat(results.gestures[0][0].score * 100).toFixed(2);
        // Display in the gesture output paragraph
        const outputText = `Detected Sign: ${categoryName}\nConfidence: ${categoryScore}%`;
        gestureOutput.innerText = outputText;
        
        // Handle sign detection for the textbox with 5-second delay
        if (canAddNewSign && (lastDetectedSign !== categoryName || !lastDetectedSign)) {
            // Copy the exact same text from gesture_output to the textbox
            signTextbox.value = outputText;
            
            // Update the last detected sign
            lastDetectedSign = categoryName;
            
            // Prevent adding new signs for 5 seconds
            canAddNewSign = false;
            
            // Set a timeout to allow adding new signs after 5 seconds
            clearTimeout(signDetectionTimeout);
            signDetectionTimeout = setTimeout(() => {
                canAddNewSign = true;
                lastDetectedSign = null;
                // Clear the textbox after 5 seconds
                signTextbox.value = '';
            }, 5000); // 5 seconds delay
        }
    } else {
        gestureOutput.style.display = "none";
    }

    if (webcamRunning) {
        window.requestAnimationFrame(predictWebcam);
    }
}

// Function to add a detected sign to the textbox
function addSignToTextbox(sign, confidence) {
    // Format the current time
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Create the formatted text for the sign
    const signText = `${sign} (${confidence}%) - ${timeString}

` + signTextbox.value;
    
    // Update the textarea content
    signTextbox.value = signText;
    
    // Limit the text length (optional)
    if (signTextbox.value.length > 1000) {
        signTextbox.value = signTextbox.value.substring(0, 1000);
    }
}

document.querySelector('.menu-toggle').addEventListener('click', function() {
    this.classList.toggle('active');
    document.querySelector('nav').classList.toggle('active');
});

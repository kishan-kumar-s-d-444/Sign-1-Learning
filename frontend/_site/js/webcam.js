// Webcam Sign Language Recognition
document.addEventListener('DOMContentLoaded', () => {
    const webcam = document.getElementById('webcam');
    const output = document.getElementById('output');
    const startBtn = document.getElementById('startBtn');
    const recognitionOutput = document.getElementById('recognitionOutput');
    let stream = null;
    let isRunning = false;

    // Start button click handler
    startBtn.addEventListener('click', async () => {
        if (!isRunning) {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                webcam.srcObject = stream;
                isRunning = true;
                startBtn.textContent = 'Stop Camera';
                startRecognition();
            } catch (error) {
                showError('Error accessing camera: ' + error.message);
            }
        } else {
            stopRecognition();
        }
    });

    // Function to start recognition
    function startRecognition() {
        // Initialize MediaPipe Gesture Recognizer
        const gestureRecognizer = new GestureRecognizer({
            baseOptions: {
                modelAssetPath: '/assets/models/gesture_recognizer.task',
                delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numHands: 1
        });

        // Set up video processing
        const processFrame = async () => {
            if (!isRunning) return;

            const results = await gestureRecognizer.recognizeForVideo(webcam);
            if (results.gestures.length > 0) {
                const gesture = results.gestures[0][0];
                showResult(gesture.categoryName);
            }

            requestAnimationFrame(processFrame);
        };

        processFrame();
    }

    // Function to stop recognition
    function stopRecognition() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            webcam.srcObject = null;
        }
        isRunning = false;
        startBtn.textContent = 'Enable Camera';
        recognitionOutput.innerHTML = '';
    }

    // Function to show result
    function showResult(gesture) {
        recognitionOutput.innerHTML = `
            <div class="success">
                <h3>Detected Sign: ${gesture}</h3>
            </div>
        `;
    }

    // Function to show error message
    function showError(message) {
        recognitionOutput.innerHTML = `<div class="error">${message}</div>`;
    }
}); 
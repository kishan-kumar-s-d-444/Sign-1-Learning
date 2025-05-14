// ASL Alphabet Learning
document.addEventListener('DOMContentLoaded', () => {
    const letterImage = document.getElementById('letterImage');
    const practiceCam = document.getElementById('practiceCam');
    const feedbackCanvas = document.getElementById('feedbackCanvas');
    const startPracticeBtn = document.getElementById('startPracticeBtn');
    const quickLinks = document.querySelectorAll('.quick-links button');
    let stream = null;
    let isRunning = false;
    let currentLetter = 'A';

    // Quick links click handler
    quickLinks.forEach(button => {
        button.addEventListener('click', () => {
            quickLinks.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentLetter = button.dataset.letter;
            updateLetterImage();
        });
    });

    // Start practice button click handler
    startPracticeBtn.addEventListener('click', async () => {
        if (!isRunning) {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                practiceCam.srcObject = stream;
                isRunning = true;
                startPracticeBtn.textContent = 'Stop Practice';
                startRecognition();
            } catch (error) {
                showError('Error accessing camera: ' + error.message);
            }
        } else {
            stopRecognition();
        }
    });

    // Function to update letter image
    function updateLetterImage() {
        letterImage.src = `/assets/sign_language_images/${currentLetter}.png`;
        letterImage.alt = `Sign for letter ${currentLetter}`;
    }

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

            const results = await gestureRecognizer.recognizeForVideo(practiceCam);
            if (results.gestures.length > 0) {
                const gesture = results.gestures[0][0];
                if (gesture.categoryName === currentLetter) {
                    showSuccess();
                }
            }

            requestAnimationFrame(processFrame);
        };

        processFrame();
    }

    // Function to stop recognition
    function stopRecognition() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            practiceCam.srcObject = null;
        }
        isRunning = false;
        startPracticeBtn.textContent = 'Start Practice';
    }

    // Function to show success message
    function showSuccess() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success';
        successDiv.textContent = 'Correct!';
        feedbackCanvas.parentNode.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 1000);
    }

    // Function to show error message
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        feedbackCanvas.parentNode.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    // Initialize with first letter
    updateLetterImage();
}); 
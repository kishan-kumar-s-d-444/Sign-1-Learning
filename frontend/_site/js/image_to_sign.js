// Image to Sign Language Analyzer
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const imagePreview = document.getElementById('imagePreview');
    const resultOutput = document.getElementById('resultOutput');

    // Upload button click handler
    uploadBtn.addEventListener('click', () => {
        imageInput.click();
    });

    // Image input change handler
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                analyzeBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    });

    // Analyze button click handler
    analyzeBtn.addEventListener('click', () => {
        if (!imagePreview.src) {
            showError('Please upload an image first');
            return;
        }

        resultOutput.classList.add('loading');
        analyzeImage(imagePreview.src);
    });

    // Function to analyze image
    function analyzeImage(imageData) {
        // Simulate API call with timeout
        setTimeout(() => {
            resultOutput.classList.remove('loading');
            
            // For demo purposes, we'll just show a random letter
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const randomLetter = letters[Math.floor(Math.random() * letters.length)];
            showResult(randomLetter);
        }, 2000);
    }

    // Function to show result
    function showResult(letter) {
        resultOutput.innerHTML = `
            <div class="success">
                <h3>Detected Sign: ${letter}</h3>
                <img src="/assets/sign_language_images/${letter}.png" alt="Sign for letter ${letter}">
            </div>
        `;
    }

    // Function to show error message
    function showError(message) {
        resultOutput.innerHTML = `<div class="error">${message}</div>`;
    }
}); 
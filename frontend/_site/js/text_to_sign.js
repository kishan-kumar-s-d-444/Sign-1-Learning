// Text to Sign Language Converter
document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const translateBtn = document.getElementById('translateBtn');
    const signOutput = document.getElementById('signOutput');
    const viewToggle = document.querySelector('.view-toggle');
    let currentView = 'image';

    // View toggle functionality
    viewToggle.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            viewToggle.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentView = e.target.dataset.view;
            updateView();
        }
    });

    // Translate button click handler
    translateBtn.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (!text) {
            showError('Please enter some text to translate');
            return;
        }

        signOutput.classList.add('loading');
        translateText(text);
    });

    // Function to translate text to sign language
    function translateText(text) {
        // Simulate API call with timeout
        setTimeout(() => {
            signOutput.classList.remove('loading');
            
            // For demo purposes, we'll just show the text split into characters
            const characters = text.toUpperCase().split('');
            displaySigns(characters);
        }, 1000);
    }

    // Function to display signs
    function displaySigns(characters) {
        signOutput.innerHTML = '';
        
        if (currentView === 'image') {
            characters.forEach(char => {
                if (char === ' ') {
                    signOutput.innerHTML += '<div class="space"></div>';
                } else {
                    const img = document.createElement('img');
                    img.src = `/assets/sign_language_images/${char}.png`;
                    img.alt = `Sign for letter ${char}`;
                    signOutput.appendChild(img);
                }
            });
        } else {
            // Avatar view (placeholder for now)
            signOutput.innerHTML = '<p>Avatar view coming soon!</p>';
        }
    }

    // Function to show error message
    function showError(message) {
        signOutput.innerHTML = `<div class="error">${message}</div>`;
    }

    // Function to update view
    function updateView() {
        const text = textInput.value.trim();
        if (text) {
            translateText(text);
        }
    }
}); 
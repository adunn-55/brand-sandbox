// DOM Element Selectors
const postInput = document.getElementById('post-text');
const previewText = document.getElementById('preview-text');
const handleCheckbox = document.getElementById('randomize-handle');
const previewHandle = document.getElementById('preview-handle');
const tabButtons = document.querySelectorAll('.tab-btn');
const mockPhone = document.querySelector('.mock-phone');
const charCountDisplay = document.getElementById('char-count');
const charLimitDisplay = document.getElementById('char-limit');
const counterBadge = document.querySelector('.counter-badge');

// Platform Configuration Data (Limits and Handles)
const platformSettings = {
    instagram: { limit: 2200, styleClass: 'instagram-mode', placeholder: '@Anon_Creator' },
    twitter: { limit: 280, styleClass: 'twitter-mode', placeholder: '@Anon_X_User' },
    tiktok: { limit: 2200, styleClass: 'tiktok-mode', placeholder: '@Anon_TikToker' }
};

let currentPlatform = 'instagram';

// 1. Logic for Switching Platforms
tabButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Remove 'active' status from all buttons, apply to the clicked one
        tabButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        // Update current platform tracker
        currentPlatform = this.getAttribute('data-platform');
        
        // Update the phone's class styling rules
        mockPhone.className = 'mock-phone ' + platformSettings[currentPlatform].styleClass;
        
        // Update visual platform character limits
        charLimitDisplay.innerText = platformSettings[currentPlatform].limit;
        
        // Refresh calculations and text rules
        updateTextAndCounter();
    });
});

// 2. Logic for tracking input text & processing character limits
function updateTextAndCounter() {
    const textLength = postInput.value.length;
    const currentLimit = platformSettings[currentPlatform].limit;
    
    // Update live text preview
    if (postInput.value === "") {
        previewText.innerText = "Your live caption preview will show up right here as you type...";
    } else {
        previewText.innerText = postInput.value;
    }
    
    // Update character counter badge numbers
    charCountDisplay.innerText = textLength;
    
    // Trigger red alert if user overtypes platform limit rules
    if (textLength > currentLimit) {
        counterBadge.classList.add('warning');
    } else {
        counterBadge.classList.remove('warning');
    }
    
    // Handle switching username titles depending on privacy checkbox status
    if (handleCheckbox.checked) {
        previewHandle.innerText = platformSettings[currentPlatform].placeholder;
    } else {
        previewHandle.innerText = "@YourRealBrand";
    }
}

// 4. File Uploader Interface Engine (UPDATED for Remove Button)
const mediaUploader = document.getElementById('media-uploader');
const mediaPreviewWrapper = document.getElementById('media-preview-wrapper');
const activeImagePreview = document.getElementById('active-image-preview');
const mediaPlaceholder = document.getElementById('media-placeholder');
const removeMediaBtn = document.getElementById('remove-media-btn');

// Listening for file selection
mediaUploader.addEventListener('change', function() {
    const file = this.files[0];
    
    if (file) {
        const reader = new FileReader(); 
        
        reader.addEventListener('load', function() {
            // A. Set the image source
            activeImagePreview.src = this.result;
            activeImagePreview.alt = "User uploaded private preview";

            // B. Transition: Hide placeholder text, Show image/button combo
            mediaPlaceholder.style.display = 'none';
            activeImagePreview.style.display = 'block';
            removeMediaBtn.style.display = 'flex'; // Use flex to center the X
        });
        
        reader.readAsDataURL(file); 
    }
});

// NEW LISTENER: Listening for the "✕ Remove" button click
removeMediaBtn.addEventListener('click', function(e) {
    // A. Prevent the click from triggering parent element clicks
    e.stopPropagation();

    // B. Revert the DOM state: Show placeholder text, Hide image/button
    activeImagePreview.src = '';
    mediaPlaceholder.style.display = 'block';
    activeImagePreview.style.display = 'none';
    removeMediaBtn.style.display = 'none';

    // C. Important: Clear the actual file uploader input so the same image can be re-selected
    mediaUploader.value = ""; 
});

// Bind live listening functions
postInput.addEventListener('input', updateTextAndCounter);
handleCheckbox.addEventListener('change', updateTextAndCounter);
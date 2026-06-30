const postInput = document.getElementById('post-text');
const previewText = document.getElementById('preview-text');
const handleCheckbox = document.getElementById('randomize-handle');
const previewHandle = document.getElementById('preview-handle');
const tabButtons = document.querySelectorAll('.tab-btn');
const mockPhone = document.querySelector('.mock-phone');
const charCountDisplay = document.getElementById('char-count');
const charLimitDisplay = document.getElementById('char-limit');
const counterBadge = document.querySelector('.counter-badge');

const auditLength = document.getElementById('audit-length');
const auditLinks = document.getElementById('audit-links');
const auditMedia = document.getElementById('audit-media');

const mediaUploader = document.getElementById('media-uploader');
const sortContainer = document.getElementById('sort-container');
const mediaPreviewWrapper = document.getElementById('media-preview-wrapper');
const mediaPlaceholder = document.getElementById('media-placeholder');

const platformSettings = {
    instagram: { limit: 2200, styleClass: 'instagram-mode', placeholder: '@Anon_Creator' },
    twitter: { limit: 280, styleClass: 'twitter-mode', placeholder: '@Anon_X_User' },
    tiktok: { limit: 2200, styleClass: 'tiktok-mode', placeholder: '@Anon_TikToker' }
};

let currentPlatform = 'instagram';
let uploadedImages = []; 
let draggedIndex = null;  

// 1. Logic for Switching Platforms (UPDATED)
tabButtons.forEach(button => {
    button.addEventListener('click', function() {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        currentPlatform = this.getAttribute('data-platform');
        mockPhone.className = 'mock-phone ' + platformSettings[currentPlatform].styleClass;
        charLimitDisplay.innerText = platformSettings[currentPlatform].limit;
        
        updateTextAndCounter();
        renderMediaEngine(); // ADD THIS LINE: Forces the phone layout to rebuild immediately on click
    });
});

mediaUploader.addEventListener('change', function() {
    const files = Array.from(this.files);
    const availableSlots = 4 - uploadedImages.length;
    const filesToProcess = files.slice(0, availableSlots);
    let loadedCount = 0;

    if(filesToProcess.length === 0) return;

    filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.addEventListener('load', function() {
            uploadedImages.push(this.result);
            loadedCount++;
            if (loadedCount === filesToProcess.length) {
                renderMediaEngine();
                updateTextAndCounter();
            }
        });
        reader.readAsDataURL(file);
    });
    mediaUploader.value = ""; 
});

// Grab our newly added arrow controls
const prevSlideBtn = document.getElementById('prev-slide-btn');
const nextSlideBtn = document.getElementById('next-slide-btn');

function renderMediaEngine() {
    sortContainer.innerHTML = "";
    mediaPreviewWrapper.innerHTML = "";
    
    // Hide arrows by default until verified
    prevSlideBtn.style.display = 'none';
    nextSlideBtn.style.display = 'none';

    if (uploadedImages.length === 0) {
        mediaPlaceholder.style.display = 'block';
        return;
    }
    mediaPlaceholder.style.display = 'none';

    if (currentPlatform === 'instagram' || currentPlatform === 'tiktok') {
        
        // BUILD CAROUSEL
        const carouselTrack = document.createElement('div');
        carouselTrack.className = 'carousel-track';
        mediaPreviewWrapper.appendChild(carouselTrack);

        uploadedImages.forEach((imgData, index) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-item';
            slide.innerHTML = `<img src="${imgData}" alt="Slide ${index}">`;
            carouselTrack.appendChild(slide);
            buildSortableThumbnail(imgData, index);
        });

        // Show arrows only if multi-image carousel has more than 1 image
        if (uploadedImages.length > 1) {
            prevSlideBtn.style.display = 'flex';
            nextSlideBtn.style.display = 'flex';
        }

    } else {
        // BUILD TWITTER GRID
        const gridContainer = document.createElement('div');
        gridContainer.className = `image-grid grid-${uploadedImages.length}`;
        mediaPreviewWrapper.appendChild(gridContainer);

        uploadedImages.forEach((imgData, index) => {
            const imgElement = document.createElement('img');
            imgElement.src = imgData;
            imgElement.className = 'grid-img';
            gridContainer.appendChild(imgElement);
            buildSortableThumbnail(imgData, imgData, index); 
        });
    }
}

// ARROW ENGINE: Listens for navigation inputs to slide the track widthwise
nextSlideBtn.addEventListener('click', () => {
    const track = document.querySelector('.carousel-track');
    if (track) {
        track.scrollBy({ left: track.offsetWidth, behavior: 'smooth' });
    }
});

prevSlideBtn.addEventListener('click', () => {
    const track = document.querySelector('.carousel-track');
    if (track) {
        track.scrollBy({ left: -track.offsetWidth, behavior: 'smooth' });
    }
});

// Fixed thumbnail binder configuration helper
function buildSortableThumbnail(imgData, index) {
    const thumb = document.createElement('div');
    thumb.className = 'sort-thumb';
    thumb.style.backgroundImage = `url(${imgData})`;
    thumb.setAttribute('draggable', 'true');
    thumb.setAttribute('data-index', index);

    const delBtn = document.createElement('button');
    delBtn.className = 'thumb-del';
    delBtn.innerText = '✕';
    delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        uploadedImages.splice(index, 1);
        renderMediaEngine();
        updateTextAndCounter();
    });
    thumb.appendChild(delBtn);

    thumb.addEventListener('dragstart', function() { draggedIndex = index; this.style.opacity = '0.4'; });
    thumb.addEventListener('dragend', function() { this.style.opacity = '1'; draggedIndex = null; });
    thumb.addEventListener('dragover', function(e) { e.preventDefault(); });
    thumb.addEventListener('drop', function() {
        const targetIndex = parseInt(this.getAttribute('data-index'));
        if (draggedIndex !== null && draggedIndex !== targetIndex) {
            const movedItem = uploadedImages.splice(draggedIndex, 1)[0];
            uploadedImages.splice(targetIndex, 0, movedItem);
            renderMediaEngine();
        }
    });
    sortContainer.appendChild(thumb);
}

function updateTextAndCounter() {
    const textLength = postInput.value.length;
    const currentLimit = platformSettings[currentPlatform].limit;
    const textValue = postInput.value;
    
    if (textValue === "") {
        previewText.innerText = "Your live caption preview will show up right here as you type...";
    } else {
        previewText.innerText = textValue;
    }
    
    charCountDisplay.innerText = textLength;
    
    if (textLength > currentLimit || textLength === 0) {
        counterBadge.classList.add('warning');
        auditLength.innerText = `✕ Exceeds ${currentPlatform === 'twitter' ? 'X' : currentPlatform} limit (${textLength}/${currentLimit})`;
        auditLength.className = "audit-item audit-fail";
    } else {
        counterBadge.classList.remove('warning');
        auditLength.innerText = `✓ Length complies with ${currentPlatform === 'twitter' ? 'X' : currentPlatform} criteria`;
        auditLength.className = "audit-item audit-pass";
    }
    
    const hashtagCount = (textValue.match(/#/g) || []).length;
    if (hashtagCount > 3) {
        auditLinks.innerText = `✕ Too many hashtags (${hashtagCount}/3). Looks spammy.`;
        auditLinks.className = "audit-item audit-fail";
    } else {
        auditLinks.innerText = `✓ Hashtag optimization looks clean (${hashtagCount}/3)`;
        auditLinks.className = "audit-item audit-pass";
    }
    
    if (uploadedImages.length === 0) {
        if (currentPlatform === 'tiktok') {
            auditMedia.innerText = `✕ TikTok strictly requires a video attachment`;
            auditMedia.className = "audit-item audit-fail";
        } else {
            auditMedia.innerText = `✓ Text-only post structure approved for ${currentPlatform === 'twitter' ? 'X' : 'Instagram'}`;
            auditMedia.className = "audit-item audit-pass";
        }
    } else {
        auditMedia.innerText = `✓ Media assets attached successfully (${uploadedImages.length}/4)`;
        auditMedia.className = "audit-item audit-pass";
    }
    
    if (handleCheckbox.checked) {
        previewHandle.innerText = platformSettings[currentPlatform].placeholder;
    } else {
        previewHandle.innerText = "@YourRealBrand";
    }
}

postInput.addEventListener('input', updateTextAndCounter);
handleCheckbox.addEventListener('change', updateTextAndCounter);

// --- 1. GLOBAL ELEMENT SELECTORS ---
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

// Grab navigation view controllers
const navSandbox = document.getElementById('nav-sandbox');
const navCommunity = document.getElementById('nav-community');
const sandboxView = document.getElementById('sandbox-view');
const communityView = document.getElementById('community-view');

// Grab slider scorecard elements
const sliderHook = document.getElementById('slider-hook');
const sliderFlow = document.getElementById('slider-flow');
const sliderValue = document.getElementById('slider-value');
const valHook = document.getElementById('val-hook');
const valFlow = document.getElementById('val-flow');
const valValue = document.getElementById('val-value');
const submitBtn = document.getElementById('submit-critique-btn');
const reviewerNotes = document.getElementById('reviewer-notes');

const hideIdentityCheckbox = document.getElementById('hide-identity');

// Grab overlay slide navigation brackets
const prevSlideBtn = document.getElementById('prev-slide-btn');
const nextSlideBtn = document.getElementById('next-slide-btn');

// --- 2. ARCHITECTURE CONFIGURATION SETTINGS ---
const platformSettings = {
    instagram: { limit: 2200, styleClass: 'instagram-mode', placeholder: '@Anon_Creator' },
    twitter: { limit: 280, styleClass: 'twitter-mode', placeholder: '@Anon_X_User' },
    tiktok: { limit: 2200, styleClass: 'tiktok-mode', placeholder: '@Anon_TikToker' }
};

let currentPlatform = 'instagram';
let uploadedImages = []; 
let draggedIndex = null;  

// --- 3. CORE WORKSPACE EVENT LISTENERS ---

// Platform Tab Switcher
tabButtons.forEach(button => {
    button.addEventListener('click', function() {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        currentPlatform = this.getAttribute('data-platform');
        mockPhone.className = 'mock-phone ' + platformSettings[currentPlatform].styleClass;
        charLimitDisplay.innerText = platformSettings[currentPlatform].limit;
        
        updateTextAndCounter();
        renderMediaEngine(); 
    });
});

// File Image Ingestion Processor
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

// --- 4. PHONE MEDIA LAYOUT GRID & CAROUSEL GENERATOR ---
function renderMediaEngine() {
    sortContainer.innerHTML = "";
    mediaPreviewWrapper.innerHTML = "";
    
    if (prevSlideBtn && nextSlideBtn) {
        prevSlideBtn.style.display = 'none';
        nextSlideBtn.style.display = 'none';
    }

    if (uploadedImages.length === 0) {
        mediaPlaceholder.style.display = 'block';
        return;
    }
    mediaPlaceholder.style.display = 'none';

    if (currentPlatform === 'instagram' || currentPlatform === 'tiktok') {
        // BUILD SLIDER CAROUSEL
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

        if (uploadedImages.length > 1 && prevSlideBtn && nextSlideBtn) {
            prevSlideBtn.style.display = 'flex';
            nextSlideBtn.style.display = 'flex';
        }

    } else {
        // BUILD TWITTER STANDALONE GRID
        const gridContainer = document.createElement('div');
        gridContainer.className = `image-grid grid-${uploadedImages.length}`;
        mediaPreviewWrapper.appendChild(gridContainer);

        uploadedImages.forEach((imgData, index) => {
            const imgElement = document.createElement('img');
            imgElement.src = imgData;
            imgElement.className = 'grid-img';
            gridContainer.appendChild(imgElement);
            buildSortableThumbnail(imgData, index); // FIXED: Removed extra variable token
        });
    }
}

// Carousel Horizontal Arrow Controller Actions
if (nextSlideBtn) {
    nextSlideBtn.addEventListener('click', () => {
        const track = document.querySelector('.carousel-track');
        if (track) track.scrollBy({ left: track.offsetWidth, behavior: 'smooth' });
    });
}
if (prevSlideBtn) {
    prevSlideBtn.addEventListener('click', () => {
        const track = document.querySelector('.carousel-track');
        if (track) track.scrollBy({ left: -track.offsetWidth, behavior: 'smooth' });
    });
}

// Drag & Drop Sorting Panel Engine
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

// --- 5. COMPLIANCE AUDITING SYSTEMS ---
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

// --- 6. PAGE ROUTING VIEW SWITCHER ---
if (navSandbox && navCommunity && sandboxView && communityView) {
    navSandbox.addEventListener('click', () => {
        sandboxView.classList.remove('hidden');
        communityView.classList.add('hidden');
    });

    navCommunity.addEventListener('click', () => {
        communityView.classList.remove('hidden');
        sandboxView.classList.add('hidden');
        
        // Initialize and fire our new queue tracking database system
        initializeCritiqueQueue();
        currentQueueIndex = 0; // Always start at your post first
        loadActiveQueuePost();
    });
}

// --- 7. STAGE DATA SYNC ENGINE (ORDER OF OPERATIONS CORRECTED) ---
function syncToCommunityStage() {
    const anonTextDelivery = document.getElementById('arena-text-delivery');
    const anonPlatformBadge = document.getElementById('anon-platform-badge');
    const arenaMediaFrame = document.getElementById('arena-media-frame');
    const anonAvatar = document.querySelector('.anon-avatar');
    const anonDisplayHandle = document.getElementById('anon-display-handle');
    
    // 1. Sync caption text
    if (postInput && anonTextDelivery) {
        if (postInput.value.trim() !== "") {
            anonTextDelivery.innerText = postInput.value;
        } else {
            anonTextDelivery.innerText = "No caption text drafted for this submission.";
        }
    }
    
    // 2. Sync platform label badge
    if (anonPlatformBadge) {
        const currentPlatformName = currentPlatform === 'twitter' ? 'X / Twitter' : currentPlatform.charAt(0).toUpperCase() + currentPlatform.slice(1);
        anonPlatformBadge.innerText = `Target: ${currentPlatformName} Feed`;
    }

    // 3. Sync media visual engine FIRST so innerHTML doesn't overwrite our overlays
    if (arenaMediaFrame && mediaPreviewWrapper) {
        if (uploadedImages.length > 0) {
            arenaMediaFrame.innerHTML = mediaPreviewWrapper.innerHTML;
            
            const commPrevBtn = arenaMediaFrame.querySelector('#prev-slide-btn');
            const commNextBtn = arenaMediaFrame.querySelector('#next-slide-btn');
            const commTrack = arenaMediaFrame.querySelector('.carousel-track');

            if (uploadedImages.length > 1) {
                if (commPrevBtn) {
                    commPrevBtn.style.display = 'flex';
                    commPrevBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (commTrack) commTrack.scrollBy({ left: -commTrack.offsetWidth, behavior: 'smooth' });
                    });
                }
                if (commNextBtn) {
                    commNextBtn.style.display = 'flex';
                    commNextBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (commTrack) commTrack.scrollBy({ left: commTrack.offsetWidth, behavior: 'smooth' });
                    });
                }
            }

            // FORCE FACTORY-DIRECT DIMENSIONS REGARDLESS OF TAB INHERITANCE
            const trackElement = arenaMediaFrame.querySelector('.carousel-track');
            const gridElement = arenaMediaFrame.querySelector('.image-grid');

            if (currentPlatform === 'instagram') {
                arenaMediaFrame.style.aspectRatio = "1 / 1";
                arenaMediaFrame.style.maxWidth = "100%";
                arenaMediaFrame.style.height = "auto";
                if (trackElement) trackElement.style.aspectRatio = "1 / 1";
            } else if (currentPlatform === 'tiktok') {
                arenaMediaFrame.style.aspectRatio = "9 / 16";
                arenaMediaFrame.style.maxWidth = "320px";
                arenaMediaFrame.style.height = "568px"; 
                arenaMediaFrame.style.margin = "0 auto";
                if (trackElement) trackElement.style.aspectRatio = "9 / 16";
            } else if (currentPlatform === 'twitter') {
                arenaMediaFrame.style.aspectRatio = "16 / 9";
                arenaMediaFrame.style.maxWidth = "100%";
                arenaMediaFrame.style.height = "auto";
                if (gridElement) gridElement.style.aspectRatio = "16 / 9";
            }
        } else {
            arenaMediaFrame.innerHTML = `<span class="frame-placeholder">[ Reviewer Media Preview Window ]</span>`;
            arenaMediaFrame.style.aspectRatio = "auto";
            arenaMediaFrame.style.height = "auto";
        }
    }

    // 4. APPLY IDENTITY MASKING LAST (Ensures it injects on top of images)
    const oldBox = arenaMediaFrame ? arenaMediaFrame.querySelector('.privacy-blur-box') : null;
    if (oldBox) oldBox.remove();

    if (hideIdentityCheckbox && hideIdentityCheckbox.checked) {
        if (anonDisplayHandle) anonDisplayHandle.innerText = "@Anonymous_Reviewee";
        if (anonAvatar) {
            anonAvatar.innerText = "❌";
            anonAvatar.classList.add('is-censored');
        }
        
        if (arenaMediaFrame && uploadedImages.length > 0) {
            const blurBox = document.createElement('div');
            blurBox.className = 'privacy-blur-box';
            
            let isDragging = false;
            blurBox.addEventListener('mousedown', (e) => {
                isDragging = true;
                e.preventDefault();
            });
            
            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const rect = arenaMediaFrame.getBoundingClientRect();
                let x = e.clientX - rect.left - (blurBox.offsetWidth / 2);
                let y = e.clientY - rect.top - (blurBox.offsetHeight / 2);
                
                if(x < 0) x = 0;
                if(y < 0) y = 0;
                if(x > rect.width - blurBox.offsetWidth) x = rect.width - blurBox.offsetWidth;
                if(y > rect.height - blurBox.offsetHeight) y = rect.height - blurBox.offsetHeight;
                
                blurBox.style.left = x + 'px';
                blurBox.style.top = y + 'px';
            });
            
            document.addEventListener('mouseup', () => { isDragging = false; });
            arenaMediaFrame.appendChild(blurBox);
        }
        
    } else {
        if (anonDisplayHandle) anonDisplayHandle.innerText = platformSettings[currentPlatform].placeholder + "_42";
        if (anonAvatar) {
            anonAvatar.innerText = "👤";
            anonAvatar.classList.remove('is-censored');
        }
    }
}

// ==========================================
// 8. MULTI-POST PEER FEEDBACK QUEUE MATRIX
// ==========================================

// Complete database of mock community posts waiting for peer review
let critiqueQueue = [];
let currentQueueIndex = 0;

function initializeCritiqueQueue() {
    // Post 0 is ALWAYS the user's fresh workspace draft pulled live from the sandbox
    const userCaption = postInput.value.trim() !== "" ? postInput.value : "No caption text drafted for this submission.";
    const userPlatformName = currentPlatform === 'twitter' ? 'X / Twitter' : currentPlatform.charAt(0).toUpperCase() + currentPlatform.slice(1);
    
    let userHandle = "@YourRealBrand";
    let isCensoredActive = false;
    
    if (hideIdentityCheckbox && hideIdentityCheckbox.checked) {
        userHandle = "@Anonymous_Reviewee";
        isCensoredActive = true;
    } else {
        userHandle = platformSettings[currentPlatform].placeholder + "_42";
    }

    critiqueQueue = [
        {
            isUserPost: true,
            handle: userHandle,
            platformBadge: `Target: ${userPlatformName} Feed`,
            platform: currentPlatform,
            caption: userCaption,
            mediaHTML: uploadedImages.length > 0 ? mediaPreviewWrapper.innerHTML : `<span class="frame-placeholder">[ Reviewer Media Preview Window ]</span>`,
            hasMedia: uploadedImages.length > 0,
            forceCensor: isCensoredActive
        },
        {
            isUserPost: false,
            handle: "@Alpha_Growth_Lab",
            platformBadge: "Target: X / Twitter Feed",
            platform: "twitter",
            caption: "Stop writing hooks like '3 tips to scale your brand'. It's dead. Instead, tell a story about a massive failure that cost you $10k, then drop the lesson in thread item 2. Thoughts on this thread framing? 👇",
            mediaHTML: `<span class="frame-placeholder">[ Text-Only Thread Approved for X ]</span>`,
            hasMedia: false,
            forceCensor: false
        },
        {
            isUserPost: false,
            handle: "@Design_Vibe_Co",
            platformBadge: "Target: Instagram Feed",
            platform: "instagram",
            caption: "Testing out a high-contrast brutalist layout aesthetic for our Q3 digital asset carousel. Do the neon elements conflict with the background frame grid layout or pass readability checks?",
            mediaHTML: `<div class="carousel-track" style="aspect-ratio: 1/1;"><div class="carousel-item"><img src="https://picsum.photos/600/600?random=1" alt="Mock Design"></div></div>`,
            hasMedia: true,
            forceCensor: false
        }
    ];
}

// Renders the specific active post index onto the Left Card Column layout
function loadActiveQueuePost() {
    const activePost = critiqueQueue[currentQueueIndex];
    
    const anonTextDelivery = document.getElementById('arena-text-delivery');
    const anonPlatformBadge = document.getElementById('anon-platform-badge');
    const arenaMediaFrame = document.getElementById('arena-media-frame');
    const anonAvatar = document.querySelector('.anon-avatar');
    const anonDisplayHandle = document.getElementById('anon-display-handle');

    // Update Text blocks
    if (anonTextDelivery) anonTextDelivery.innerText = activePost.caption;
    if (anonPlatformBadge) anonPlatformBadge.innerText = activePost.platformBadge;
    if (anonDisplayHandle) anonDisplayHandle.innerText = activePost.handle;

    // Apply specific Avatar Privacy profiles
    if (anonAvatar) {
        if (activePost.forceCensor) {
            anonAvatar.innerText = "❌";
            anonAvatar.classList.add('is-censored');
        } else {
            anonAvatar.innerText = "👤";
            anonAvatar.classList.remove('is-censored');
        }
    }

    // Load and adapt media aspect rules dynamically
    if (arenaMediaFrame) {
        arenaMediaFrame.innerHTML = activePost.mediaHTML;
        
        // Wipe old classes and privacy box layers
        arenaMediaFrame.className = "arena-media-frame";
        const oldBox = arenaMediaFrame.querySelector('.privacy-blur-box');
        if (oldBox) oldBox.remove();

        // If user selected privacy box on their own post, inject it onto Post 0
        if (activePost.forceCensor && activePost.hasMedia) {
            const blurBox = document.createElement('div');
            blurBox.className = 'privacy-blur-box';
            
            // Wire up instant dragging listeners
            let isDragging = false;
            blurBox.addEventListener('mousedown', (e) => { e.preventDefault(); isDragging = true; });
            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const rect = arenaMediaFrame.getBoundingClientRect();
                let x = e.clientX - rect.left - (blurBox.offsetWidth / 2);
                let y = e.clientY - rect.top - (blurBox.offsetHeight / 2);
                
                if(x < 0) x = 0; if(y < 0) y = 0;
                if(x > rect.width - blurBox.offsetWidth) x = rect.width - blurBox.offsetWidth;
                if(y > rect.height - blurBox.offsetHeight) y = rect.height - blurBox.offsetHeight;
                
                blurBox.style.left = x + 'px'; blurBox.style.top = y + 'px';
            });
            document.addEventListener('mouseup', () => { isDragging = false; });
            arenaMediaFrame.appendChild(blurBox);
        }

        // Set structural layout constraints depending on the post platform type
        const trackElement = arenaMediaFrame.querySelector('.carousel-track');
        const gridElement = arenaMediaFrame.querySelector('.image-grid');

        if (activePost.platform === 'instagram') {
            arenaMediaFrame.style.aspectRatio = "1 / 1";
            arenaMediaFrame.style.maxWidth = "100%";
            arenaMediaFrame.style.height = "auto";
            if (trackElement) trackElement.style.aspectRatio = "1 / 1";
        } else if (activePost.platform === 'tiktok') {
            arenaMediaFrame.style.aspectRatio = "9 / 16";
            arenaMediaFrame.style.maxWidth = "320px";
            arenaMediaFrame.style.height = "568px";
            arenaMediaFrame.style.margin = "0 auto";
            if (trackElement) trackElement.style.aspectRatio = "9 / 16";
        } else if (activePost.platform === 'twitter') {
            arenaMediaFrame.style.aspectRatio = "16 / 9";
            arenaMediaFrame.style.maxWidth = "100%";
            arenaMediaFrame.style.height = "auto";
            if (gridElement) gridElement.style.aspectRatio = "16 / 9";
        } else {
            arenaMediaFrame.style.aspectRatio = "auto";
            arenaMediaFrame.style.height = "auto";
        }

        // Re-hook active slide control vectors for peer media structures
        const commPrevBtn = arenaMediaFrame.querySelector('#prev-slide-btn');
        const commNextBtn = arenaMediaFrame.querySelector('#next-slide-btn');
        if (commPrevBtn && commNextBtn && trackElement) {
            commPrevBtn.style.display = 'flex';
            commNextBtn.style.display = 'flex';
            commPrevBtn.addEventListener('click', (e) => { e.stopPropagation(); trackElement.scrollBy({ left: -trackElement.offsetWidth, behavior: 'smooth' }); });
            commNextBtn.addEventListener('click', (e) => { e.stopPropagation(); trackElement.scrollBy({ left: trackElement.offsetWidth, behavior: 'smooth' }); });
        }
    }
}

// Connect listeners directly to your range slider input points
if (sliderHook && valHook) { sliderHook.addEventListener('input', (e) => { valHook.innerText = `${e.target.value}/100`; }); }
if (sliderFlow && valFlow) { sliderFlow.addEventListener('input', (e) => { valFlow.innerText = `${e.target.value}/100`; }); }
if (sliderValue && valValue) { sliderValue.addEventListener('input', (e) => { valValue.innerText = `${e.target.value}/100`; }); }

// Handle submitting critiques and stepping through the matrix queue
if (submitBtn) {
    submitBtn.addEventListener('click', () => {
        alert(`Critique Draft Logged for Post ${currentQueueIndex + 1}/${critiqueQueue.length}!\nHook Score: ${sliderHook.value}\nPacing Score: ${sliderFlow.value}\nValue Score: ${sliderValue.value}`);
        
        // Cycle cursor forward
        currentQueueIndex++;
        
        if (currentQueueIndex < critiqueQueue.length) {
            // Load the next post from the community pool
            loadActiveQueuePost();
            
            // Soft reset sliders to default 50 for next calculation pass
            if(sliderHook) { sliderHook.value = 50; valHook.innerText = "50/100"; }
            if(sliderFlow) { sliderFlow.value = 50; valFlow.innerText = "50/100"; }
            if(sliderValue) { sliderValue.value = 50; valValue.innerText = "50/100"; }
            if(reviewerNotes) reviewerNotes.value = "";
        } else {
            // Queue exhausted! Loop back safely
            alert("🎉 Feedback session complete! You've audited all active peer drafts in the community queue.");
            currentQueueIndex = 0;
            loadActiveQueuePost();
        }
    });
}

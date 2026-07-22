// ==========================================
// 1. GLOBAL ELEMENT SELECTORS & A/B STATE
// ==========================================
// Main View Switchers
const navSandbox = document.getElementById('nav-sandbox');
const navCommunity = document.getElementById('nav-community');
const sandboxView = document.getElementById('sandbox-view');
const communityView = document.getElementById('community-view');
const homeView = document.getElementById('home-view'); // FIXED: Was missing!

// Brand Asset Library View selectors
const libraryView = document.getElementById('library-view');
const btnNavHome = document.getElementById('nav-home');
const btnNavSandboxHeader = document.getElementById('nav-sandbox-header');
const btnNavCommunityHeader = document.getElementById('nav-community-header');
const btnNavLibraryHeader = document.getElementById('nav-library-header');
const brandHomeLogo = document.getElementById('brand-home-logo');
const navHomeFromLibBtn = document.getElementById('nav-home-from-lib');
const launchLibraryBtn = document.getElementById('launch-library-btn');

// Library Management View elements
const libraryImageUploader = document.getElementById('library-image-uploader');
const libTextTitle = document.getElementById('lib-text-title');
const libTextBody = document.getElementById('lib-text-body');
const saveTextAssetBtn = document.getElementById('save-text-asset-btn');
const libTabImages = document.getElementById('lib-tab-images');
const libTabTexts = document.getElementById('lib-tab-texts');
const libImagesGrid = document.getElementById('lib-images-grid');
const libTextsList = document.getElementById('lib-texts-list');
const countLibImgs = document.getElementById('count-lib-imgs');
const countLibTexts = document.getElementById('count-lib-texts');

// Sandbox Quick-Drawer elements
const toggleSandboxDrawerBtn = document.getElementById('toggle-sandbox-drawer-btn');
const sandboxQuickDrawer = document.getElementById('sandbox-quick-drawer');
const sandboxDrawerImages = document.getElementById('sandbox-drawer-images');
const sandboxDrawerTexts = document.getElementById('sandbox-drawer-texts');

// Interactive Launch Cards on Homepage
const launchSandboxBtn = document.getElementById('launch-sandbox-btn');
const launchCommunityBtn = document.getElementById('launch-community-btn');

// Builder UI inputs
const postInput = document.getElementById('post-text');
const previewText = document.getElementById('preview-text');
const hideIdentityCheckbox = document.getElementById('hide-identity');
const previewHandle = document.getElementById('preview-handle');
const tabButtons = document.querySelectorAll('.tab-btn');
const mockPhone = document.querySelector('.mock-phone');
const charCountDisplay = document.getElementById('char-count');
const charLimitDisplay = document.getElementById('char-limit');

// A/B Mode UI elements
const modeBtnContainer = document.getElementById('mode-switcher');
const modeButtons = document.querySelectorAll('.mode-btn');
const variantTabsContainer = document.getElementById('ab-variant-tabs');
const variantTabs = document.querySelectorAll('.variant-tab');

// Media upload elements
const mediaUploader = document.getElementById('media-uploader');
const sortContainer = document.getElementById('sort-container');
const mediaPreviewWrapper = document.getElementById('media-preview-wrapper');
const mediaPlaceholder = document.getElementById('media-placeholder');

// Slide controls
const prevSlideBtn = document.getElementById('prev-slide-btn');
const nextSlideBtn = document.getElementById('next-slide-btn');

// Critique Scorecard Elements
const sliderHook = document.getElementById('slider-hook');
const sliderFlow = document.getElementById('slider-flow');
const sliderValue = document.getElementById('slider-value');
const valHook = document.getElementById('val-hook');
const valFlow = document.getElementById('val-flow');
const valValue = document.getElementById('val-value');
const reviewerNotes = document.getElementById('reviewer-notes');
const submitBtn = document.getElementById('submit-critique-btn');

// --- Platform Configuration ---
const platformSettings = {
    instagram: { limit: 2200, styleClass: 'instagram-mode', placeholder: '@Anon_Creator' },
    twitter: { limit: 280, styleClass: 'twitter-mode', placeholder: '@Anon_X_User' },
    tiktok: { limit: 2200, styleClass: 'tiktok-mode', placeholder: '@Anon_TikToker' }
};

// ==========================================
// 2. STATE TRACKING DATABASE
// ==========================================
let builderMode = 'single'; // 'single' or 'abtest'
let activeEditingVariant = 'A'; // 'A' or 'B'

let abPostState = {
    A: { caption: "", platform: 'instagram', images: [], censored: false },
    B: { caption: "", platform: 'instagram', images: [], censored: false }
};

let currentPlatform = 'instagram';
let uploadedImages = []; 

let brandLibrary = {
    images: JSON.parse(localStorage.getItem('brand_lib_images')) || [],
    texts: JSON.parse(localStorage.getItem('brand_lib_texts')) || []
};

let activeLibraryTab = 'images'; 

// ==========================================
// 3. SYNCHRONIZATION & RENDERING ENGINES
// ==========================================

function saveCurrentEditorToState() {
    if (!postInput) return;
    abPostState[activeEditingVariant].caption = postInput.value;
    abPostState[activeEditingVariant].platform = currentPlatform;
    abPostState[activeEditingVariant].images = [...uploadedImages];
    if (hideIdentityCheckbox) {
        abPostState[activeEditingVariant].censored = hideIdentityCheckbox.checked;
    }
}

function loadVariantToEditor(variant) {
    activeEditingVariant = variant;
    const data = abPostState[variant];

    currentPlatform = data.platform;
    uploadedImages = [...data.images];
    
    if (hideIdentityCheckbox) {
        hideIdentityCheckbox.checked = data.censored;
    }

    if (tabButtons) {
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-platform') === currentPlatform) {
                btn.classList.add('active');
            }
        });
    }

    if (postInput) postInput.value = data.caption;
    if (charLimitDisplay) charLimitDisplay.innerText = platformSettings[currentPlatform].limit;

    updateTextAndCounter();
    renderMediaEngine();
}

function updateTextAndCounter() {
    if (!postInput || !charCountDisplay) return;
    const text = postInput.value;
    charCountDisplay.innerText = text.length;

    const limit = platformSettings[currentPlatform].limit;
    if (text.length > limit) {
        charCountDisplay.style.color = '#ef4444';
    } else {
        charCountDisplay.style.color = '#64748b';
    }

    if (previewText) {
        if (text.trim() !== "") {
            previewText.innerText = text;
        } else {
            previewText.innerText = "Your live caption preview will show up right here as you type...";
        }
    }

    if (previewHandle) {
        if (hideIdentityCheckbox && hideIdentityCheckbox.checked) {
            previewHandle.innerText = "@Anonymous_Reviewee";
        } else {
            previewHandle.innerText = platformSettings[currentPlatform].placeholder + "_42";
        }
    }

    runPreFlightAudits();
}

function renderMediaEngine() {
    if (!sortContainer) return;
    sortContainer.innerHTML = '';
    
    uploadedImages.forEach((imgSrc, index) => {
        const thumb = document.createElement('div');
        thumb.style.cssText = `
            width: 50px; height: 50px; border-radius: 6px; overflow: hidden; position: relative;
            background: url(${imgSrc}) center/cover; border: 2px solid #334155; cursor: grab;
        `;
        thumb.setAttribute('draggable', 'true');
        thumb.dataset.index = index;

        const deleteBadge = document.createElement('span');
        deleteBadge.innerText = '×';
        deleteBadge.style.cssText = `
            position: absolute; top: 0; right: 0; background: rgba(239, 68, 68, 0.9);
            color: white; width: 16px; height: 16px; font-size: 12px; line-height: 14px;
            text-align: center; border-radius: 0 0 0 4px; cursor: pointer; font-weight: bold;
        `;
        deleteBadge.addEventListener('click', (e) => {
            e.stopPropagation();
            uploadedImages.splice(index, 1);
            saveCurrentEditorToState();
            renderMediaEngine();
        });

        thumb.appendChild(deleteBadge);
        
        thumb.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', index));
        thumb.addEventListener('dragover', (e) => e.preventDefault());
        thumb.addEventListener('drop', (e) => {
            e.preventDefault();
            const fromIndex = e.dataTransfer.getData('text/plain');
            const toIndex = index;
            const movedItem = uploadedImages.splice(fromIndex, 1)[0];
            uploadedImages.splice(toIndex, 0, movedItem);
            saveCurrentEditorToState();
            renderMediaEngine();
        });

        sortContainer.appendChild(thumb);
    });

    if (!mediaPreviewWrapper || !mediaPlaceholder) return;

    if (uploadedImages.length > 0) {
        mediaPlaceholder.style.display = 'none';
        
        if (currentPlatform === 'instagram') {
            mediaPreviewWrapper.innerHTML = `
                <div class="carousel-track" style="display: flex; transition: transform 0.3s ease; width: 100%; height: 100%;">
                    ${uploadedImages.map(img => `<div class="carousel-item" style="min-width: 100%; height: 100%; background: url(${img}) center/cover no-repeat;"></div>`).join('')}
                </div>
            `;
            if (prevSlideBtn && nextSlideBtn) {
                if (uploadedImages.length > 1) {
                    prevSlideBtn.style.display = 'flex';
                    nextSlideBtn.style.display = 'flex';
                } else {
                    prevSlideBtn.style.display = 'none';
                    nextSlideBtn.style.display = 'none';
                }
            }
        } else if (currentPlatform === 'twitter') {
            if (prevSlideBtn && nextSlideBtn) {
                prevSlideBtn.style.display = 'none';
                nextSlideBtn.style.display = 'none';
            }
            
            let gridClass = 'grid-single';
            if (uploadedImages.length === 2) gridClass = 'grid-double';
            if (uploadedImages.length === 3) gridClass = 'grid-triple';
            if (uploadedImages.length >= 4) gridClass = 'grid-quad';

            mediaPreviewWrapper.innerHTML = `
                <div class="image-grid ${gridClass}" style="display: grid; gap: 4px; width: 100%; height: 100%;">
                    ${uploadedImages.slice(0, 4).map(img => `<div class="grid-item" style="background: url(${img}) center/cover no-repeat; width: 100%; height: 100%;"></div>`).join('')}
                </div>
            `;
        } else if (currentPlatform === 'tiktok') {
            if (prevSlideBtn && nextSlideBtn) {
                prevSlideBtn.style.display = 'none';
                nextSlideBtn.style.display = 'none';
            }
            mediaPreviewWrapper.innerHTML = `
                <div class="carousel-track" style="width: 100%; height: 100%;">
                    <div class="carousel-item" style="width: 100%; height: 100%; background: url(${uploadedImages[0]}) center/cover no-repeat;"></div>
                </div>
            `;
        }
    } else {
        mediaPreviewWrapper.innerHTML = '';
        mediaPreviewWrapper.appendChild(mediaPlaceholder);
        mediaPlaceholder.style.display = 'block';
        if (prevSlideBtn && nextSlideBtn) {
            prevSlideBtn.style.display = 'none';
            nextSlideBtn.style.display = 'none';
        }
    }
}

function runPreFlightAudits() {
    const lengthAudit = document.getElementById('audit-length');
    const linkAudit = document.getElementById('audit-links');
    const mediaAudit = document.getElementById('audit-media');
    if (!lengthAudit || !linkAudit || !mediaAudit || !postInput) return;

    const text = postInput.value;

    const limit = platformSettings[currentPlatform].limit;
    if (text.length <= limit) {
        lengthAudit.innerText = `✓ Length complies with ${currentPlatform.charAt(0).toUpperCase() + currentPlatform.slice(1)} criteria`;
        lengthAudit.className = 'audit-item audit-pass';
    } else {
        lengthAudit.innerText = `✗ Out of limits! Drop ${text.length - limit} characters`;
        lengthAudit.className = 'audit-item audit-fail';
    }

    const hashtags = (text.match(/#/g) || []).length;
    if (hashtags <= 3) {
        linkAudit.innerText = `✓ Hashtags are optimized (${hashtags}/3)`;
        linkAudit.className = 'audit-item audit-pass';
    } else {
        linkAudit.innerText = `⚠ Hashtag stuffing alert! Keep under 3 (${hashtags} found)`;
        linkAudit.className = 'audit-item audit-fail';
    }

    if (uploadedImages.length > 0) {
        mediaAudit.innerText = `✓ Rich media formatting validated (${uploadedImages.length}/4 items)`;
        mediaAudit.className = 'audit-item audit-pass';
    } else {
        mediaAudit.innerText = `⚠ Text-only draft structure active`;
        mediaAudit.className = 'audit-item audit-warn';
    }
}

// ==========================================
// BRAND ASSET MANAGEMENT & LOCALSTORAGE ENGINE
// ==========================================

function updateBrandLibraryStorage() {
    localStorage.setItem('brand_lib_images', JSON.stringify(brandLibrary.images));
    localStorage.setItem('brand_lib_texts', JSON.stringify(brandLibrary.texts));
    renderBrandLibraryView();
    renderSandboxQuickDrawer();
}

function renderBrandLibraryView() {
    if (countLibImgs) countLibImgs.innerText = brandLibrary.images.length;
    if (countLibTexts) countLibTexts.innerText = brandLibrary.texts.length;
    if (!libImagesGrid || !libTextsList) return;

    libImagesGrid.innerHTML = '';
    libTextsList.innerHTML = '';

    if (activeLibraryTab === 'images') {
        libImagesGrid.classList.remove('hidden');
        libTextsList.classList.add('hidden');

        if (brandLibrary.images.length === 0) {
            libImagesGrid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; color:#475569; padding:20px;">No brand graphics saved yet.</div>`;
        } else {
            brandLibrary.images.forEach((img, index) => {
                const imgCard = document.createElement('div');
                imgCard.style.cssText = `
                    border-radius: 8px; border: 1px solid #1e293b; overflow: hidden; position: relative; aspect-ratio: 1/1;
                    background: url(${img}) center/cover no-repeat; box-shadow: 0 4px 6px rgba(0,0,0,0.2);
                `;
                
                const delBtn = document.createElement('button');
                delBtn.innerText = '🗑️';
                delBtn.style.cssText = `
                    position: absolute; top: 4px; right: 4px; border: none; background: rgba(239, 68, 68, 0.9);
                    color: white; font-size: 0.75rem; border-radius: 4px; cursor: pointer; padding: 4px;
                `;
                delBtn.addEventListener('click', () => {
                    brandLibrary.images.splice(index, 1);
                    updateBrandLibraryStorage();
                });

                imgCard.appendChild(delBtn);
                libImagesGrid.appendChild(imgCard);
            });
        }
    } else {
        libImagesGrid.classList.add('hidden');
        libTextsList.classList.remove('hidden');

        if (brandLibrary.texts.length === 0) {
            libTextsList.innerHTML = `<div style="text-align:center; color:#475569; padding:20px;">No copy templates saved yet.</div>`;
        } else {
            brandLibrary.texts.forEach((text, index) => {
                const textCard = document.createElement('div');
                textCard.style.cssText = `
                    background-color: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 15px; display: flex;
                    flex-direction: column; gap: 8px; position: relative;
                `;
                
                textCard.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="color: #cbd5e1; font-size: 0.9rem;">${text.title}</strong>
                        <button class="delete-text-btn" data-index="${index}" style="border:none; background:transparent; color:#ef4444; font-size: 0.8rem; cursor:pointer;">Remove</button>
                    </div>
                    <p style="margin:0; font-size:0.8rem; color:#64748b; font-family: monospace; line-height: 1.4; white-space: pre-wrap;">${text.body}</p>
                `;

                textCard.querySelector('.delete-text-btn').addEventListener('click', () => {
                    brandLibrary.texts.splice(index, 1);
                    updateBrandLibraryStorage();
                });

                libTextsList.appendChild(textCard);
            });
        }
    }
}

function renderSandboxQuickDrawer() {
    if (!sandboxDrawerImages || !sandboxDrawerTexts) return;
    sandboxDrawerImages.innerHTML = '';
    sandboxDrawerTexts.innerHTML = '';

    if (brandLibrary.images.length === 0) {
        sandboxDrawerImages.innerHTML = `<span style="font-size:0.75rem; color:#475569;">No saved assets. Add them in Library!</span>`;
    } else {
        brandLibrary.images.forEach((imgSrc) => {
            const thumb = document.createElement('div');
            thumb.style.cssText = `
                width: 40px; height: 40px; border-radius: 4px; overflow: hidden; flex-shrink: 0;
                background: url(${imgSrc}) center/cover; border: 1px solid #334155; cursor: pointer; transition: transform 0.1s;
            `;
            thumb.title = "Inject into Workspace Preview";
            thumb.addEventListener('click', () => {
                if (uploadedImages.length >= 4) {
                    alert("⚠️ Canvas maxes out at 4 media elements! Remove one first.");
                    return;
                }
                uploadedImages.push(imgSrc);
                saveCurrentEditorToState();
                renderMediaEngine();
            });
            thumb.addEventListener('mouseenter', () => thumb.style.transform = "scale(1.1)");
            thumb.addEventListener('mouseleave', () => thumb.style.transform = "scale(1)");
            sandboxDrawerImages.appendChild(thumb);
        });
    }

    if (brandLibrary.texts.length === 0) {
        sandboxDrawerTexts.innerHTML = `<span style="font-size:0.75rem; color:#475569;">No saved templates.</span>`;
    } else {
        brandLibrary.texts.forEach((txt) => {
            const pill = document.createElement('button');
            pill.style.cssText = `
                width: 100%; text-align: left; background-color: #1e293b; border: 1px solid #334155; color: #cbd5e1;
                padding: 6px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; cursor: pointer;
                display: flex; justify-content: space-between; align-items: center; transition: background-color 0.2s;
            `;
            pill.innerHTML = `<span>⚡ ${txt.title}</span> <span style="font-size: 0.65rem; color:#475569;">Insert →</span>`;
            
            pill.addEventListener('click', () => {
                const currentText = postInput.value;
                postInput.value = currentText + (currentText.trim() === "" ? "" : "\n\n") + txt.body;
                updateTextAndCounter();
                saveCurrentEditorToState();
            });

            sandboxDrawerTexts.appendChild(pill);
        });
    }
}

// ==========================================
// 4. CORE BUILDER EVENTS & BINDINGS
// ==========================================

if (postInput) {
    postInput.addEventListener('input', () => {
        updateTextAndCounter();
        saveCurrentEditorToState();
    });
}

if (hideIdentityCheckbox) {
    hideIdentityCheckbox.addEventListener('change', () => {
        updateTextAndCounter();
        saveCurrentEditorToState();
    });
}

if (tabButtons) {
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            tabButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            currentPlatform = this.getAttribute('data-platform');
            
            if (mockPhone) {
                mockPhone.className = 'mock-phone ' + platformSettings[currentPlatform].styleClass;
            }
            if (charLimitDisplay) {
                charLimitDisplay.innerText = platformSettings[currentPlatform].limit;
            }
            
            updateTextAndCounter();
            renderMediaEngine();
            saveCurrentEditorToState();
        });
    });
}

if (mediaUploader) {
    mediaUploader.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        const availableSlots = 4 - uploadedImages.length;
        
        files.slice(0, availableSlots).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(event) {
                uploadedImages.push(event.target.result);
                saveCurrentEditorToState();
                renderMediaEngine();
            };
            reader.readAsDataURL(file);
        });
    });
}

if (prevSlideBtn && nextSlideBtn) {
    prevSlideBtn.addEventListener('click', () => {
        const track = mediaPreviewWrapper.querySelector('.carousel-track');
        if (track) track.scrollBy({ left: -track.offsetWidth, behavior: 'smooth' });
    });
    nextSlideBtn.addEventListener('click', () => {
        const track = mediaPreviewWrapper.querySelector('.carousel-track');
        if (track) track.scrollBy({ left: track.offsetWidth, behavior: 'smooth' });
    });
}

if (modeBtnContainer) {
    modeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            modeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            builderMode = this.getAttribute('data-mode');

            if (builderMode === 'abtest') {
                if (variantTabsContainer) variantTabsContainer.classList.remove('hidden');
                if (variantTabs) {
                    variantTabs.forEach(t => t.classList.remove('active'));
                    variantTabs[0].classList.add('active');
                }
                loadVariantToEditor('A');
            } else {
                if (variantTabsContainer) variantTabsContainer.classList.add('hidden');
                loadVariantToEditor('A'); 
            }
        });
    });
}

if (variantTabsContainer) {
    variantTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            if (builderMode !== 'abtest') return;
            
            saveCurrentEditorToState();

            variantTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const variant = this.getAttribute('data-variant');
            loadVariantToEditor(variant);
        });
    });
}

// ==========================================
// 5. REVIEW QUEUE AND FEEDBACK CONTROLLER
// ==========================================
let critiqueQueue = [];
let currentQueueIndex = 0;
let analyticsDatabase = [];

function initializeCritiqueQueue() {
    critiqueQueue = [];

    if (builderMode === 'abtest') {
        const capA = abPostState.A.caption.trim() !== "" ? abPostState.A.caption : "No caption text drafted for Variant A.";
        const capB = abPostState.B.caption.trim() !== "" ? abPostState.B.caption : "No caption text drafted for Variant B.";
        
        critiqueQueue.push({
            isABTest: true,
            selectedWinner: null,
            platformBadge: `Target: A/B Split-Test Matchup`,
            platformA: abPostState.A.platform,
            platformB: abPostState.B.platform,
            captionA: capA,
            captionB: capB,
            mediaHTML_A: abPostState.A.images.length > 0 ? buildPreviewHTML(abPostState.A.images, abPostState.A.platform) : `<span class="frame-placeholder">[ No Media Variant A ]</span>`,
            mediaHTML_B: abPostState.B.images.length > 0 ? buildPreviewHTML(abPostState.B.images, abPostState.B.platform) : `<span class="frame-placeholder">[ No Media Variant B ]</span>`,
            forceCensorA: abPostState.A.censored,
            forceCensorB: abPostState.B.censored
        });
    } else {
        const capA = abPostState.A.caption.trim() !== "" ? abPostState.A.caption : "No caption text drafted for this submission.";
        const platA = abPostState.A.platform;
        critiqueQueue.push({
            isABTest: false,
            handle: abPostState.A.censored ? "@Anonymous_Reviewee" : platformSettings[platA].placeholder + "_42",
            platformBadge: `Target: ${platA.charAt(0).toUpperCase() + platA.slice(1)} Feed`,
            platform: platA,
            caption: capA,
            mediaHTML: abPostState.A.images.length > 0 ? buildPreviewHTML(abPostState.A.images, platA) : `<span class="frame-placeholder">[ Reviewer Media Preview Window ]</span>`,
            hasMedia: abPostState.A.images.length > 0,
            forceCensor: abPostState.A.censored
        });
    }

    critiqueQueue.push(
        {
            isABTest: false,
            handle: "@Alpha_Growth_Lab",
            platformBadge: "Target: X / Twitter Feed",
            platform: "twitter",
            caption: "Stop writing hooks like '3 tips to scale your brand'. It's dead. Instead, tell a story about a massive failure that cost you $10k, then drop the lesson in thread item 2. Thoughts on this thread framing? 👇",
            mediaHTML: `<span class="frame-placeholder">[ Text-Only Thread Approved for X ]</span>`,
            hasMedia: false,
            forceCensor: false
        },
        {
            isABTest: false,
            handle: "@Design_Vibe_Co",
            platformBadge: "Target: Instagram Feed",
            platform: "instagram",
            caption: "Testing out a high-contrast brutalist layout aesthetic for our Q3 digital asset carousel. Do the neon elements conflict with the background frame grid layout or pass readability checks?",
            mediaHTML: `<div class="carousel-track" style="aspect-ratio: 1/1;"><div class="carousel-item" style="width:100%; height:100%; background:url('https://picsum.photos/600/600?random=1') center/cover no-repeat;"></div></div>`,
            hasMedia: true,
            forceCensor: false
        }
    );
}

function buildPreviewHTML(images, platform) {
    if (platform === 'twitter') {
        let gridClass = 'grid-single';
        if (images.length === 2) gridClass = 'grid-double';
        if (images.length === 3) gridClass = 'grid-triple';
        if (images.length >= 4) gridClass = 'grid-quad';
        return `
            <div class="image-grid ${gridClass}" style="display: grid; gap: 4px; width: 100%; height: 100%;">
                ${images.slice(0, 4).map(img => `<div class="grid-item" style="background: url(${img}) center/cover no-repeat; width:100%; height:100%;"></div>`).join('')}
            </div>
        `;
    } else {
        return `
            <div class="carousel-track" style="display: flex; width: 100%; height: 100%;">
                ${images.map(img => `<div class="carousel-item" style="min-width: 100%; height: 100%; background: url(${img}) center/cover no-repeat;"></div>`).join('')}
            </div>
            <button id="prev-slide-btn" class="nav-arrow prev-arrow" style="${images.length > 1 ? 'display:flex' : 'display:none'}">‹</button>
            <button id="next-slide-btn" class="nav-arrow next-arrow" style="${images.length > 1 ? 'display:flex' : 'display:none'}">›</button>
        `;
    }
}

function loadActiveQueuePost() {
    const activePost = critiqueQueue[currentQueueIndex];
    if (!activePost) return;
    
    const anonTextDelivery = document.getElementById('arena-text-delivery');
    const anonPlatformBadge = document.getElementById('anon-platform-badge');
    const arenaMediaFrame = document.getElementById('arena-media-frame');
    const anonAvatar = document.querySelector('.anon-avatar');
    const anonDisplayHandle = document.getElementById('anon-display-handle');

    if (arenaMediaFrame) {
        arenaMediaFrame.className = "arena-media-frame";
        arenaMediaFrame.innerHTML = "";
        arenaMediaFrame.style.aspectRatio = "auto";
        arenaMediaFrame.style.maxWidth = "100%";
        arenaMediaFrame.style.height = "auto";
    }

    if (activePost.isABTest) {
        if (anonDisplayHandle) anonDisplayHandle.innerText = "A/B Split-Test Workspace";
        if (anonPlatformBadge) anonPlatformBadge.innerText = activePost.platformBadge;
        if (anonAvatar) {
            anonAvatar.innerText = "⚖️";
            anonAvatar.classList.remove('is-censored');
        }

        if (anonTextDelivery) anonTextDelivery.innerText = "Compare both draft variants below and cast your vote on the winning strategy.";

        if (arenaMediaFrame) {
            arenaMediaFrame.style.flexDirection = "column";
            arenaMediaFrame.style.alignItems = "stretch";
            arenaMediaFrame.style.justifyContent = "flex-start";

            arenaMediaFrame.innerHTML = `
                <div class="ab-split-preview-grid" style="width: 100%; display: flex; gap: 16px; padding: 15px; box-sizing: border-box;">
                    <div class="variant-column" style="flex: 1; display: flex; flex-direction: column; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; box-sizing: border-box;">
                        <span class="variant-label-tag" style="align-self: flex-start; background-color: #3b82f6; color: white; font-size: 0.7rem; font-weight: bold; padding: 3px 8px; border-radius: 4px; margin-bottom: 8px;">Variant A (Instagram)</span>
                        <p style="font-size: 0.8rem; line-height:1.4; color: #cbd5e1; margin: 0 0 12px 0; min-height: 38px;">${activePost.captionA}</p>
                        <div class="variant-media-wrapper" style="width:100%; aspect-ratio:1/1; position:relative; overflow:hidden; border-radius:6px; background:#0f172a;">
                            ${activePost.mediaHTML_A}
                        </div>
                    </div>
                    <div class="variant-column" style="flex: 1; display: flex; flex-direction: column; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; box-sizing: border-box;">
                        <span class="variant-label-tag" style="background-color: #8b5cf6; align-self: flex-start; color: white; font-size: 0.7rem; font-weight: bold; padding: 3px 8px; border-radius: 4px; margin-bottom: 8px;">Variant B (Instagram)</span>
                        <p style="font-size: 0.8rem; line-height:1.4; color: #cbd5e1; margin: 0 0 12px 0; min-height: 38px;">${activePost.captionB}</p>
                        <div class="variant-media-wrapper" style="width:100%; aspect-ratio:1/1; position:relative; overflow:hidden; border-radius:6px; background:#0f172a;">
                            ${activePost.mediaHTML_B}
                        </div>
                    </div>
                </div>
            `;

            const votingDiv = document.createElement('div');
            votingDiv.className = "voting-container";
            votingDiv.style.cssText = "display: flex; gap: 12px; width: 100%; padding: 15px; box-sizing: border-box; border-top: 1px solid #1e293b; justify-content: center;";
            votingDiv.innerHTML = `
                <button class="btn-vote" id="vote-a-btn" style="flex: 1; padding: 12px; font-weight: bold; border-radius: 8px; cursor: pointer; transition: all 0.2s;">Vote Variant A</button>
                <button class="btn-vote" id="vote-b-btn" style="flex: 1; padding: 12px; font-weight: bold; border-radius: 8px; cursor: pointer; transition: all 0.2s;">Vote Variant B</button>
            `;
            arenaMediaFrame.appendChild(votingDiv);

            const voteABtn = arenaMediaFrame.querySelector('#vote-a-btn');
            const voteBBtn = arenaMediaFrame.querySelector('#vote-b-btn');

            voteABtn.addEventListener('click', () => {
                activePost.selectedWinner = 'Variant A';
                voteABtn.classList.add('selected');
                voteBBtn.classList.remove('selected');
            });

            voteBBtn.addEventListener('click', () => {
                activePost.selectedWinner = 'Variant B';
                voteBBtn.classList.add('selected');
                voteABtn.classList.remove('selected');
            });
        }
    } else {
        if (anonTextDelivery) anonTextDelivery.innerText = activePost.caption;
        if (anonPlatformBadge) anonPlatformBadge.innerText = activePost.platformBadge;
        if (anonDisplayHandle) anonDisplayHandle.innerText = activePost.handle;

        if (anonAvatar) {
            if (activePost.forceCensor) {
                anonAvatar.innerText = "❌";
                anonAvatar.classList.add('is-censored');
            } else {
                anonAvatar.innerText = "👤";
                anonAvatar.classList.remove('is-censored');
            }
        }

        if (arenaMediaFrame) {
            arenaMediaFrame.innerHTML = activePost.mediaHTML;
            const trackElement = arenaMediaFrame.querySelector('.carousel-track');
            const gridElement = arenaMediaFrame.querySelector('.image-grid');

            if (activePost.platform === 'instagram') {
                arenaMediaFrame.style.aspectRatio = "1 / 1";
                if (trackElement) trackElement.style.aspectRatio = "1 / 1";
            } else if (activePost.platform === 'tiktok') {
                arenaMediaFrame.style.aspectRatio = "9 / 16";
                arenaMediaFrame.style.maxWidth = "320px";
                arenaMediaFrame.style.height = "568px";
                arenaMediaFrame.style.margin = "0 auto";
                if (trackElement) trackElement.style.aspectRatio = "9 / 16";
            } else if (activePost.platform === 'twitter') {
                arenaMediaFrame.style.aspectRatio = "16 / 9";
                if (gridElement) gridElement.style.aspectRatio = "16 / 9";
            }
        }
    }
}

// Wire real-time metric score counters with existence guards
if (sliderHook && valHook) sliderHook.addEventListener('input', (e) => { valHook.innerText = `${e.target.value}/100`; });
if (sliderFlow && valFlow) sliderFlow.addEventListener('input', (e) => { valFlow.innerText = `${e.target.value}/100`; });
if (sliderValue && valValue) sliderValue.addEventListener('input', (e) => { valValue.innerText = `${e.target.value}/100`; });

// Handle submissions and list logging
if (submitBtn) {
    submitBtn.addEventListener('click', () => {
        const activePost = critiqueQueue[currentQueueIndex];
        if (!activePost) return;
        
        if (activePost.isABTest && !activePost.selectedWinner) {
            alert("⚠️ Please cast your vote on either Variant A or Variant B before submitting your scorecard!");
            return;
        }

        const currentCritiqueData = {
            handle: activePost.isABTest ? "A/B Matchup Post" : activePost.handle,
            platformBadge: activePost.platformBadge,
            hookScore: parseInt(sliderHook.value),
            flowScore: parseInt(sliderFlow.value),
            valueScore: parseInt(sliderValue.value),
            notes: reviewerNotes.value.trim() !== "" ? reviewerNotes.value.trim() : "No descriptive critique markers left.",
            winner: activePost.isABTest ? activePost.selectedWinner : null
        };

        analyticsDatabase.push(currentCritiqueData);

        const totalCounter = document.getElementById('log-counter-total');
        const emptyState = document.getElementById('history-empty-state');
        const logGrid = document.getElementById('analytics-log-grid');

        if (totalCounter) totalCounter.innerText = analyticsDatabase.length;
        if (emptyState) emptyState.style.display = 'none';

        if (logGrid) {
            const logCard = document.createElement('div');
            logCard.className = 'history-log-card';
            
            let cardHTML = `
                <div class="log-meta-line">
                    <span class="log-handle-tag">${currentCritiqueData.handle}</span>
                    <span class="log-platform-pill" style="color: #3b82f6;">${currentCritiqueData.platformBadge.replace('Target: ', '')}</span>
                </div>
            `;

            if (currentCritiqueData.winner) {
                cardHTML += `
                    <div style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 8px; border-radius: 6px; text-align: center; margin-bottom: 8px;">
                        <span style="font-size: 0.8rem; color: #10b981; font-weight: bold;">👑 Chosen Winner: ${currentCritiqueData.winner}</span>
                    </div>
                `;
            }

            cardHTML += `
                <div class="log-metric-bars">
                    <div class="log-bar-row"><span>🪝 Hook Strength:</span><strong>${currentCritiqueData.hookScore}/100</strong></div>
                    <div class="log-bar-row"><span>👁️ Visual Pacing:</span><strong>${currentCritiqueData.flowScore}/100</strong></div>
                    <div class="log-bar-row"><span>🔥 Value/Engagement:</span><strong>${currentCritiqueData.valueScore}/100</strong></div>
                </div>
                <p class="log-notes-quote">"${currentCritiqueData.notes}"</p>
            `;
            
            logCard.innerHTML = cardHTML;
            logGrid.insertBefore(logCard, logGrid.firstChild);
        }

        currentQueueIndex++;
        
        if (currentQueueIndex < critiqueQueue.length) {
            loadActiveQueuePost();
            if (sliderHook) { sliderHook.value = 50; valHook.innerText = "50/100"; }
            if (sliderFlow) { sliderFlow.value = 50; valFlow.innerText = "50/100"; }
            if (sliderValue) { sliderValue.value = 50; valValue.innerText = "50/100"; }
            if (reviewerNotes) reviewerNotes.value = "";
        } else {
            alert("🎉 Feedback session complete! You've audited all active peer drafts in the community queue.");
            currentQueueIndex = 0;
            loadActiveQueuePost();
        }
    });
}

// ==========================================
// 6. VIEW NAVIGATION PORT ROUTERS (FOUR-WAY)
// ==========================================
function navigateToScreen(screenId) {
    if (homeView) homeView.classList.add('hidden');
    if (sandboxView) sandboxView.classList.add('hidden');
    if (communityView) communityView.classList.add('hidden');
    if (libraryView) libraryView.classList.add('hidden');

    if (btnNavHome) btnNavHome.classList.remove('active');
    if (btnNavSandboxHeader) btnNavSandboxHeader.classList.remove('active');
    if (btnNavCommunityHeader) btnNavCommunityHeader.classList.remove('active');
    if (btnNavLibraryHeader) btnNavLibraryHeader.classList.remove('active');

    if (screenId === 'home') {
        if (homeView) homeView.classList.remove('hidden');
        if (btnNavHome) btnNavHome.classList.add('active');
        
        const totalAuditsNum = document.getElementById('home-stat-audits');
        if (totalAuditsNum) totalAuditsNum.innerText = analyticsDatabase.length;
        
        const abStatBadge = document.getElementById('home-stat-ab');
        if (abStatBadge) {
            abStatBadge.innerText = builderMode === 'abtest' ? 'A/B Test Active' : 'Standard Mode';
            abStatBadge.style.color = builderMode === 'abtest' ? '#8b5cf6' : '#3b82f6';
        }
    } else if (screenId === 'sandbox') {
        if (sandboxView) sandboxView.classList.remove('hidden');
        if (btnNavSandboxHeader) btnNavSandboxHeader.classList.add('active');
        renderSandboxQuickDrawer();
    } else if (screenId === 'community') {
        saveCurrentEditorToState(); 
        if (communityView) communityView.classList.remove('hidden');
        if (btnNavCommunityHeader) btnNavCommunityHeader.classList.add('active');
        
        initializeCritiqueQueue();
        currentQueueIndex = 0;
        loadActiveQueuePost();
    } else if (screenId === 'library') {
        if (libraryView) libraryView.classList.remove('hidden');
        if (btnNavLibraryHeader) btnNavLibraryHeader.classList.add('active');
        renderBrandLibraryView(); 
    }
}

if (btnNavHome) btnNavHome.addEventListener('click', () => navigateToScreen('home'));
if (btnNavSandboxHeader) btnNavSandboxHeader.addEventListener('click', () => navigateToScreen('sandbox'));
if (btnNavCommunityHeader) btnNavCommunityHeader.addEventListener('click', () => navigateToScreen('community'));
if (btnNavLibraryHeader) btnNavLibraryHeader.addEventListener('click', () => navigateToScreen('library'));
if (brandHomeLogo) brandHomeLogo.addEventListener('click', () => navigateToScreen('home'));

if (navHomeFromLibBtn) navHomeFromLibBtn.addEventListener('click', () => navigateToScreen('home'));
if (navSandbox) navSandbox.addEventListener('click', () => navigateToScreen('sandbox'));
if (navCommunity) navCommunity.addEventListener('click', () => navigateToScreen('community'));

if (launchSandboxBtn) launchSandboxBtn.addEventListener('click', () => navigateToScreen('sandbox'));
if (launchCommunityBtn) launchCommunityBtn.addEventListener('click', () => navigateToScreen('community'));
if (launchLibraryBtn) launchLibraryBtn.addEventListener('click', () => navigateToScreen('library'));

// ==========================================
// 7. LIBRARY CREATION LISTENERS & HANDLERS
// ==========================================
if (libraryImageUploader) {
    libraryImageUploader.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(event) {
                brandLibrary.images.push(event.target.result);
                updateBrandLibraryStorage();
            };
            reader.readAsDataURL(file);
        });
    });
}

if (saveTextAssetBtn) {
    saveTextAssetBtn.addEventListener('click', () => {
        if (!libTextTitle || !libTextBody) return;
        const title = libTextTitle.value.trim();
        const body = libTextBody.value.trim();

        if (title === '' || body === '') {
            alert("⚠️ Please fill out both the Template Label and the text template itself!");
            return;
        }

        brandLibrary.texts.push({ title, body });
        updateBrandLibraryStorage();
        libTextTitle.value = '';
        libTextBody.value = '';
    });
}

if (libTabImages) {
    libTabImages.addEventListener('click', () => {
        libTabImages.classList.add('active');
        if (libTabTexts) libTabTexts.classList.remove('active');
        activeLibraryTab = 'images';
        renderBrandLibraryView();
    });
}

if (libTabTexts) {
    libTabTexts.addEventListener('click', () => {
        libTabTexts.classList.add('active');
        if (libTabImages) libTabImages.classList.remove('active');
        activeLibraryTab = 'texts';
        renderBrandLibraryView();
    });
}

if (toggleSandboxDrawerBtn) {
    toggleSandboxDrawerBtn.addEventListener('click', () => {
        if (sandboxQuickDrawer) sandboxQuickDrawer.classList.toggle('hidden');
    });
}

// ==========================================
// INITIAL BOOT SEQUENCE
// ==========================================
loadVariantToEditor('A');
navigateToScreen('home');

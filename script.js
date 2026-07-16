// ==========================================
// 1. GLOBAL ELEMENT SELECTORS & A/B STATE
// ==========================================
// Main View Switchers
const navSandbox = document.getElementById('nav-sandbox');
const navCommunity = document.getElementById('nav-community');
const sandboxView = document.getElementById('sandbox-view');
const communityView = document.getElementById('community-view');

// Home Navigation Selectors
const homeView = document.getElementById('home-view');
const btnNavHome = document.getElementById('nav-home');
const btnNavSandboxHeader = document.getElementById('nav-sandbox-header');
const btnNavCommunityHeader = document.getElementById('nav-community-header');
const brandHomeLogo = document.getElementById('brand-home-logo');

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

// Active Working Variables (Mapped to the current editing variant)
let currentPlatform = 'instagram';
let uploadedImages = []; // Array of Base64 strings or URLs

// ==========================================
// 3. SYNCHRONIZATION & RENDERING ENGINES
// ==========================================

// Saves current workspace inputs into our state tracking database
function saveCurrentEditorToState() {
    abPostState[activeEditingVariant].caption = postInput.value;
    abPostState[activeEditingVariant].platform = currentPlatform;
    abPostState[activeEditingVariant].images = [...uploadedImages];
    abPostState[activeEditingVariant].censored = hideIdentityCheckbox.checked;
}

// Pulls variant data back into active inputs and updates the UI
function loadVariantToEditor(variant) {
    activeEditingVariant = variant;
    const data = abPostState[variant];

    // Set working variables
    currentPlatform = data.platform;
    uploadedImages = [...data.images];
    hideIdentityCheckbox.checked = data.censored;

    // Update Platform Tabs
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-platform') === currentPlatform) {
            btn.classList.add('active');
        }
    });

    // Update Text area and Counter limits
    postInput.value = data.caption;
    charLimitDisplay.innerText = platformSettings[currentPlatform].limit;

    // Refresh Visuals
    updateTextAndCounter();
    renderMediaEngine();
}

// Handles Character Count and Live Caption syncing
function updateTextAndCounter() {
    const text = postInput.value;
    charCountDisplay.innerText = text.length;

    // Warning highlights if over platform limits
    const limit = platformSettings[currentPlatform].limit;
    if (text.length > limit) {
        charCountDisplay.style.color = '#ef4444';
    } else {
        charCountDisplay.style.color = '#64748b';
    }

    // Live sync to mockup card
    if (text.trim() !== "") {
        previewText.innerText = text;
    } else {
        previewText.innerText = "Your live caption preview will show up right here as you type...";
    }

    // Sync handle and identity choices
    if (hideIdentityCheckbox.checked) {
        previewHandle.innerText = "@Anonymous_Reviewee";
    } else {
        previewHandle.innerText = platformSettings[currentPlatform].placeholder + "_42";
    }

    // Run a quick pre-flight verification audit
    runPreFlightAudits();
}

// Manages image rendering, carousels, and grid arrays inside the phone mockup
function renderMediaEngine() {
    // Clear dynamic thumbnails docking bar
    sortContainer.innerHTML = '';
    
    // Generate Draggable Thumbnails in Left Sidebar
    uploadedImages.forEach((imgSrc, index) => {
        const thumb = document.createElement('div');
        thumb.style.cssText = `
            width: 50px; height: 50px; border-radius: 6px; overflow: hidden; position: relative;
            background: url(${imgSrc}) center/cover; border: 2px solid #334155; cursor: grab;
        `;
        thumb.setAttribute('draggable', 'true');
        thumb.dataset.index = index;

        // Trash indicator overlay
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
        
        // Drag events for reordering
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

    // Update Central Mock Phone Frame
    if (uploadedImages.length > 0) {
        mediaPlaceholder.style.display = 'none';
        
        // Adapt display structure based on active platform rules
        if (currentPlatform === 'instagram') {
            // Instagram: Smooth Swipeable Horizontal Carousel Track
            mediaPreviewWrapper.innerHTML = `
                <div class="carousel-track" style="display: flex; transition: transform 0.3s ease; width: 100%; height: 100%;">
                    ${uploadedImages.map(img => `<div class="carousel-item" style="min-width: 100%; height: 100%; background: url(${img}) center/cover no-repeat;"></div>`).join('')}
                </div>
            `;
            // Toggle arrows
            if (uploadedImages.length > 1) {
                prevSlideBtn.style.display = 'flex';
                nextSlideBtn.style.display = 'flex';
            } else {
                prevSlideBtn.style.display = 'none';
                nextSlideBtn.style.display = 'none';
            }
        } else if (currentPlatform === 'twitter') {
            // Twitter: Responsive CSS Multi-Grid
            prevSlideBtn.style.display = 'none';
            nextSlideBtn.style.display = 'none';
            
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
            // TikTok: Portrait Stack (First Image Only)
            prevSlideBtn.style.display = 'none';
            nextSlideBtn.style.display = 'none';
            mediaPreviewWrapper.innerHTML = `
                <div class="carousel-track" style="width: 100%; height: 100%;">
                    <div class="carousel-item" style="width: 100%; height: 100%; background: url(${uploadedImages[0]}) center/cover no-repeat;"></div>
                </div>
            `;
        }
    } else {
        // Safe fallback state
        mediaPreviewWrapper.innerHTML = '';
        mediaPreviewWrapper.appendChild(mediaPlaceholder);
        mediaPlaceholder.style.display = 'block';
        prevSlideBtn.style.display = 'none';
        nextSlideBtn.style.display = 'none';
    }
}

// Real-time quality verification checklist
function runPreFlightAudits() {
    const lengthAudit = document.getElementById('audit-length');
    const linkAudit = document.getElementById('audit-links');
    const mediaAudit = document.getElementById('audit-media');
    const text = postInput.value;

    // 1. Length audit
    const limit = platformSettings[currentPlatform].limit;
    if (text.length <= limit) {
        lengthAudit.innerText = `✓ Length complies with ${currentPlatform.charAt(0).toUpperCase() + currentPlatform.slice(1)} criteria`;
        lengthAudit.className = 'audit-item audit-pass';
    } else {
        lengthAudit.innerText = `✗ Out of limits! Drop ${text.length - limit} characters`;
        lengthAudit.className = 'audit-item audit-fail';
    }

    // 2. Hashtag limits
    const hashtags = (text.match(/#/g) || []).length;
    if (hashtags <= 3) {
        linkAudit.innerText = `✓ Hashtags are optimized (${hashtags}/3)`;
        linkAudit.className = 'audit-item audit-pass';
    } else {
        linkAudit.innerText = `⚠ Hashtag stuffing alert! Keep under 3 (${hashtags} found)`;
        linkAudit.className = 'audit-item audit-fail';
    }

    // 3. Media verification
    if (uploadedImages.length > 0) {
        mediaAudit.innerText = `✓ Rich media formatting validated (${uploadedImages.length}/4 items)`;
        mediaAudit.className = 'audit-item audit-pass';
    } else {
        mediaAudit.innerText = `⚠ Text-only draft structure active`;
        mediaAudit.className = 'audit-item audit-warn';
    }
}

// ==========================================
// 4. CORE BUILDER EVENTS & BINDINGS
// ==========================================

// Input capture and live sync
postInput.addEventListener('input', () => {
    updateTextAndCounter();
    saveCurrentEditorToState();
});

hideIdentityCheckbox.addEventListener('change', () => {
    updateTextAndCounter();
    saveCurrentEditorToState();
});

// Platform switching tabs
tabButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        tabButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        currentPlatform = this.getAttribute('data-platform');
        
        // Swap visual classes on phone framework
        mockPhone.className = 'mock-phone ' + platformSettings[currentPlatform].styleClass;
        charLimitDisplay.innerText = platformSettings[currentPlatform].limit;
        
        updateTextAndCounter();
        renderMediaEngine();
        saveCurrentEditorToState();
    });
});

// Media files capture
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

// Mock Carousel Navigation Arrows click handlers
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

// Mode Selection (Standard vs. A/B split)
if (modeBtnContainer) {
    modeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            modeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            builderMode = this.getAttribute('data-mode');

            if (builderMode === 'abtest') {
                variantTabsContainer.classList.remove('hidden');
                // Open Variant A by default
                variantTabs.forEach(t => t.classList.remove('active'));
                variantTabs[0].classList.add('active');
                loadVariantToEditor('A');
            } else {
                variantTabsContainer.classList.add('hidden');
                loadVariantToEditor('A'); // Fallback to A state
            }
        });
    });
}

// Variant tabs edit controller
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
        // Group BOTH into a single dual-post item in the queue!
        const capA = abPostState.A.caption.trim() !== "" ? abPostState.A.caption : "No caption text drafted for Variant A.";
        const capB = abPostState.B.caption.trim() !== "" ? abPostState.B.caption : "No caption text drafted for Variant B.";
        
        critiqueQueue.push({
            isABTest: true,
            selectedWinner: null, // Will hold 'A' or 'B' depending on peer vote
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
        // Standard Mode - Load Variant A only
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

    // Add Simulated Community Posts
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

// Utility to generate structured preview layouts outside the live editor workspace
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
    
    const anonTextDelivery = document.getElementById('arena-text-delivery');
    const anonPlatformBadge = document.getElementById('anon-platform-badge');
    const arenaMediaFrame = document.getElementById('arena-media-frame');
    const anonAvatar = document.querySelector('.anon-avatar');
    const anonDisplayHandle = document.getElementById('anon-display-handle');

    // 1. Reset layout classes on the media frame
    if (arenaMediaFrame) {
        arenaMediaFrame.className = "arena-media-frame";
        arenaMediaFrame.innerHTML = "";
        arenaMediaFrame.style.aspectRatio = "auto";
        arenaMediaFrame.style.maxWidth = "100%";
        arenaMediaFrame.style.height = "auto";
    }

    // 2. HANDLE A/B TEST SPLIT LAYOUT RENDERING
    if (activePost.isABTest) {
        if (anonDisplayHandle) anonDisplayHandle.innerText = "A/B Split-Test Workspace";
        if (anonPlatformBadge) anonPlatformBadge.innerText = activePost.platformBadge;
        if (anonAvatar) {
            anonAvatar.innerText = "⚖️";
            anonAvatar.classList.remove('is-censored');
        }

        if (anonTextDelivery) anonTextDelivery.innerText = "Compare both draft variants below and cast your vote on the winning strategy.";

        // Inject dynamic side-by-side preview structure
        if (arenaMediaFrame) {
            // FORCE vertical stacking so the voting row sits cleanly underneath the grid
            arenaMediaFrame.style.flexDirection = "column";
            arenaMediaFrame.style.alignItems = "stretch";
            arenaMediaFrame.style.justifyContent = "flex-start";

            arenaMediaFrame.innerHTML = `
                <div class="ab-split-preview-grid" style="width: 100%; display: flex; gap: 16px; padding: 15px; box-sizing: border-box;">
                    <!-- VARIANT A COLUMN -->
                    <div class="variant-column" style="flex: 1; display: flex; flex-direction: column; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; box-sizing: border-box;">
                        <span class="variant-label-tag" style="align-self: flex-start; background-color: #3b82f6; color: white; font-size: 0.7rem; font-weight: bold; padding: 3px 8px; border-radius: 4px; margin-bottom: 8px;">Variant A (${activePost.platformA.toUpperCase()})</span>
                        <p style="font-size: 0.8rem; line-height:1.4; color: #cbd5e1; margin: 0 0 12px 0; min-height: 38px;">${activePost.captionA}</p>
                        <div class="variant-media-wrapper" style="width:100%; aspect-ratio:1/1; position:relative; overflow:hidden; border-radius:6px; background:#0f172a;">
                            ${activePost.mediaHTML_A}
                        </div>
                    </div>
                    <!-- VARIANT B COLUMN -->
                    <div class="variant-column" style="flex: 1; display: flex; flex-direction: column; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; box-sizing: border-box;">
                        <span class="variant-label-tag" style="background-color: #8b5cf6; align-self: flex-start; color: white; font-size: 0.7rem; font-weight: bold; padding: 3px 8px; border-radius: 4px; margin-bottom: 8px;">Variant B (${activePost.platformB.toUpperCase()})</span>
                        <p style="font-size: 0.8rem; line-height:1.4; color: #cbd5e1; margin: 0 0 12px 0; min-height: 38px;">${activePost.captionB}</p>
                        <div class="variant-media-wrapper" style="width:100%; aspect-ratio:1/1; position:relative; overflow:hidden; border-radius:6px; background:#0f172a;">
                            ${activePost.mediaHTML_B}
                        </div>
                    </div>
                </div>
            `;

            // Create a wide voting dock pinned underneath the phones
            const votingDiv = document.createElement('div');
            votingDiv.className = "voting-container";
            votingDiv.style.cssText = "display: flex; gap: 12px; width: 100%; padding: 15px; box-sizing: border-box; border-top: 1px solid #1e293b; justify-content: center;";
            votingDiv.innerHTML = `
                <button class="btn-vote" id="vote-a-btn" style="flex: 1; padding: 12px; font-weight: bold; border-radius: 8px; cursor: pointer; transition: all 0.2s;">Vote Variant A</button>
                <button class="btn-vote" id="vote-b-btn" style="flex: 1; padding: 12px; font-weight: bold; border-radius: 8px; cursor: pointer; transition: all 0.2s;">Vote Variant B</button>
            `;
            arenaMediaFrame.appendChild(votingDiv);

            // Add Click Handlers for Voting Buttons
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
        // 3. STANDARD SINGLE POST RENDERING
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

            // Apply platform aspect ratio layouts...
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

// Wire real-time metric score counters
if (sliderHook && valHook) sliderHook.addEventListener('input', (e) => { valHook.innerText = `${e.target.value}/100`; });
if (sliderFlow && valFlow) sliderFlow.addEventListener('input', (e) => { valFlow.innerText = `${e.target.value}/100`; });
if (sliderValue && valValue) sliderValue.addEventListener('input', (e) => { valValue.innerText = `${e.target.value}/100`; });

if (submitBtn) {
    submitBtn.addEventListener('click', () => {
        const activePost = critiqueQueue[currentQueueIndex];
        
        // Validation: In A/B mode, prevent submission until they vote!
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

        // Update HTML counters
        const totalCounter = document.getElementById('log-counter-total');
        const emptyState = document.getElementById('history-empty-state');
        const logGrid = document.getElementById('analytics-log-grid');

        if (totalCounter) totalCounter.innerText = analyticsDatabase.length;
        if (emptyState) emptyState.style.display = 'none';

        if (logGrid) {
            const logCard = document.createElement('div');
            logCard.className = 'history-log-card';
            
            // Build the dynamic scorecard content
            let cardHTML = `
                <div class="log-meta-line">
                    <span class="log-handle-tag">${currentCritiqueData.handle}</span>
                    <span class="log-platform-pill" style="color: #3b82f6;">${currentCritiqueData.platformBadge.replace('Target: ', '')}</span>
                </div>
            `;

            // If an A/B winner exists, inject a high-visibility winner badge!
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

        // Advance to next index
        currentQueueIndex++;
        
        if (currentQueueIndex < critiqueQueue.length) {
            loadActiveQueuePost();
            
            // Slider reset defaults
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
// 6. VIEW NAVIGATION PORT ROUTERS (THREE-WAY)
// ==========================================

// Main routing helper function to swap screen views smoothly
function navigateToScreen(screenId) {
    // 1. Hide all main layouts
    homeView.classList.add('hidden');
    sandboxView.classList.add('hidden');
    communityView.classList.add('hidden');

    // 2. Remove active formatting from all top nav buttons
    btnNavHome.classList.remove('active');
    btnNavSandboxHeader.classList.remove('active');
    btnNavCommunityHeader.classList.remove('active');

    // 3. Turn on chosen screen and active links
    if (screenId === 'home') {
        homeView.classList.remove('hidden');
        btnNavHome.classList.add('active');
        
        // Update stats on the dashboard whenever we visit home
        const totalAuditsNum = document.getElementById('home-stat-audits');
        if (totalAuditsNum) totalAuditsNum.innerText = analyticsDatabase.length;
        
        const abStatBadge = document.getElementById('home-stat-ab');
        if (abStatBadge) {
            abStatBadge.innerText = builderMode === 'abtest' ? 'A/B Test Active' : 'Standard Mode';
            abStatBadge.style.color = builderMode === 'abtest' ? '#8b5cf6' : '#3b82f6';
        }

    } else if (screenId === 'sandbox') {
        sandboxView.classList.remove('hidden');
        btnNavSandboxHeader.classList.add('active');

    } else if (screenId === 'community') {
        saveCurrentEditorToState(); // Save current work
        communityView.classList.remove('hidden');
        btnNavCommunityHeader.classList.add('active');
        
        // Load focus group sequence
        initializeCritiqueQueue();
        currentQueueIndex = 0;
        loadActiveQueuePost();
    }
}

// Global Nav Header Click Listeners
if (btnNavHome) btnNavHome.addEventListener('click', () => navigateToScreen('home'));
if (btnNavSandboxHeader) btnNavSandboxHeader.addEventListener('click', () => navigateToScreen('sandbox'));
if (btnNavCommunityHeader) btnNavCommunityHeader.addEventListener('click', () => navigateToScreen('community'));
if (brandHomeLogo) brandHomeLogo.addEventListener('click', () => navigateToScreen('home'));

// Bottom action/navigation buttons inside workspace sub-panels
if (navSandbox) navSandbox.addEventListener('click', () => navigateToScreen('sandbox'));
if (navCommunity) navCommunity.addEventListener('click', () => navigateToScreen('community'));

// Homepage Clickable Launch Cards
if (launchSandboxBtn) launchSandboxBtn.addEventListener('click', () => navigateToScreen('sandbox'));
if (launchCommunityBtn) launchCommunityBtn.addEventListener('click', () => navigateToScreen('community'));

// --- Set initial boot screen state ---
navigateToScreen('home');

// --- Initialize State on boot ---
loadVariantToEditor('A');

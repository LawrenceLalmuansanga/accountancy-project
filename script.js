// Warning Page Logic
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.warning-container')) {
        initWarningPage();
    }
    
    if (document.querySelector('.years-grid')) {
        initViewerPage();
    }
});

function initWarningPage() {
    const acknowledgeCheckbox = document.getElementById('acknowledge');
    const proceedBtn = document.getElementById('proceedBtn');
    const declineBtn = document.getElementById('declineBtn');
    
    acknowledgeCheckbox.addEventListener('change', function() {
        proceedBtn.disabled = !this.checked;
        if (this.checked) {
            proceedBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Proceed to Projects';
        }
    });
    
    proceedBtn.addEventListener('click', function() {
        if (!this.disabled) {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecting...';
            this.disabled = true;
            
            setTimeout(() => {
                window.location.href = 'viewer.html';
            }, 1000);
        }
    });
    
    declineBtn.addEventListener('click', function() {
        this.innerHTML = '<i class="fas fa-times"></i> Closing...';
        this.disabled = true;
        
        document.querySelector('.warning-content').innerHTML = `
            <div class="warning-message" style="text-align: center; padding: 40px;">
                <i class="fas fa-check-circle" style="font-size: 3rem; color: #4CAF50; margin-bottom: 20px;"></i>
                <h3>Thank you for being responsible!</h3>
                <p>Always remember to do your own work and use references wisely.</p>
            </div>
        `;
        
        setTimeout(() => {
            window.close();
            window.location.href = 'about:blank';
        }, 2000);
    });
}

// Viewer Page Logic
function initViewerPage() {
    const projects = {
        '2018': { pages: 10, title: 'Accountancy Project 2018' },
        '2019': { pages: 10, title: 'Accountancy Project 2019' },
        '2022': { pages: 8, title: 'Accountancy Project 2022' },
        '2023': { pages: 8, title: 'Accountancy Project 2023' },
        '2024': { pages: 8, title: 'Accountancy Project 2024' },
        '2025': { pages: 6, title: 'Accountancy Project 2025' }
    };
    
    const availableYears = ['2018', '2019', '2022', '2023', '2024', '2025'];
    
    const yearsGrid = document.querySelector('.years-grid');
    if (yearsGrid) {
        yearsGrid.innerHTML = '';
        
        availableYears.forEach(year => {
            if (projects[year]) {
                const data = projects[year];
                const yearCard = document.createElement('div');
                yearCard.className = 'year-card';
                yearCard.innerHTML = `
                    <div class="year-card-header">
                        <h2>${year}</h2>
                        <p>Accountancy Project</p>
                    </div>
                    <div class="year-card-content">
                        <div class="year-card-stats">
                            <div class="stat">
                                <i class="fas fa-file-alt"></i>
                                <div class="stat-value">${data.pages}</div>
                                <div class="stat-label">Pages</div>
                            </div>
                            <div class="stat">
                                <i class="fas fa-eye"></i>
                                <div class="stat-value">Read Only</div>
                                <div class="stat-label">View Mode</div>
                            </div>
                        </div>
                        <p style="color: var(--gray); font-size: 0.9rem;">
                            <i class="fas fa-info-circle"></i> Click to view project pages
                        </p>
                    </div>
                    <div class="year-card-footer">
                        <button class="btn-view" data-year="${year}">
                            <i class="fas fa-external-link-alt"></i> View Project
                        </button>
                    </div>
                `;
                yearsGrid.appendChild(yearCard);
            }
        });
    }
    
    // Enhanced protection for Android
    applyAndroidProtections();
    
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-view')) {
            const year = e.target.closest('.btn-view').dataset.year;
            if (projects[year]) {
                openImageViewer(year, projects[year].pages);
            }
        }
        
        if (e.target.closest('.btn-close') || e.target.id === 'imageViewerModal') {
            closeImageViewer();
        }
        
        if (e.target.closest('#prevPage')) {
            navigatePage(-1);
        }
        if (e.target.closest('#nextPage')) {
            navigatePage(1);
        }
    });
    
    // Double-tap prevention for Android
    let lastTouchTime = 0;
    document.addEventListener('touchend', function(e) {
        if (e.target.closest('.protected-image') || e.target.closest('.image-container')) {
            const currentTime = new Date().getTime();
            const timeDiff = currentTime - lastTouchTime;
            
            if (timeDiff < 300) { // Double-tap detected
                e.preventDefault();
                showProtectionMessage('Double-tap to zoom is disabled');
                return false;
            }
            lastTouchTime = currentTime;
        }
    }, { passive: false });
    
    // Enhanced Android touch event prevention
    document.addEventListener('touchstart', function(e) {
        if (e.target.closest('.protected-image') || e.target.closest('.image-container')) {
            // Prevent default touch behaviors
            e.preventDefault();
        }
    }, { passive: false });
    
    document.addEventListener('touchmove', function(e) {
        if (e.target.closest('.protected-image') || e.target.closest('.image-container')) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Prevent context menu on Android (long press)
    document.addEventListener('contextmenu', function(e) {
        if (e.target.closest('.protected-image') || e.target.closest('.image-container')) {
            e.preventDefault();
            showProtectionMessage('Long-press menu is disabled');
            return false;
        }
    }, false);
    
    document.addEventListener('dragstart', function(e) {
        if (e.target.closest('.protected-image')) {
            e.preventDefault();
        }
    }, false);
    
    // Prevent all keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Disable Ctrl+S, Cmd+S, Ctrl+P, Cmd+P
        if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p')) {
            e.preventDefault();
            showProtectionMessage('Saving/Printing is disabled');
        }
        
        // Disable F12, Ctrl+Shift+I, Cmd+Option+I
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.metaKey && e.altKey && e.key === 'I')) {
            e.preventDefault();
            showProtectionMessage('Developer tools are disabled');
        }
        
        // Navigation in image viewer
        if (document.getElementById('imageViewerModal') && 
            document.getElementById('imageViewerModal').style.display === 'flex') {
            if (e.key === 'ArrowLeft') {
                navigatePage(-1);
            } else if (e.key === 'ArrowRight') {
                navigatePage(1);
            } else if (e.key === 'Escape') {
                closeImageViewer();
            }
        }
        
        // Disable Print Screen key
        if (e.key === 'PrintScreen') {
            e.preventDefault();
            showProtectionMessage('Screenshots are disabled');
        }
    });
    
    // Prevent text selection
    document.addEventListener('selectstart', function(e) {
        if (e.target.closest('.protected-image') || e.target.closest('.image-container')) {
            e.preventDefault();
            return false;
        }
    });
    
    // Add protection overlay
    addProtectionOverlay();
}

// Android-specific protections
function applyAndroidProtections() {
    // Detect if device is Android
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isAndroid || isIOS) {
        // Add mobile-specific protections
        document.body.classList.add('mobile-device');
        
        // Add meta tag for mobile viewport (already present in HTML)
        
        // Prevent pinch-to-zoom on images
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) {
            viewportMeta.content = viewportMeta.content + ', maximum-scale=1.0, user-scalable=no';
        }
        
        // Add CSS for mobile protection
        const mobileStyle = document.createElement('style');
        mobileStyle.textContent = `
            .mobile-device .protected-image {
                -webkit-touch-callout: none !important;
                -webkit-user-select: none !important;
                user-select: none !important;
                pointer-events: none !important;
                touch-action: none !important;
            }
            
            .mobile-device .image-container {
                -webkit-touch-callout: none !important;
                -webkit-user-select: none !important;
                user-select: none !important;
            }
            
            /* Disable text selection on mobile */
            .mobile-device * {
                -webkit-tap-highlight-color: transparent !important;
            }
        `;
        document.head.appendChild(mobileStyle);
    }
}

let currentYear = '';
let currentPage = 1;
let totalPages = 0;

function openImageViewer(year, pages) {
    currentYear = year;
    currentPage = 1;
    totalPages = pages;
    
    const modal = document.getElementById('imageViewerModal');
    const viewerTitle = document.getElementById('viewerTitle');
    const pageIndicator = document.getElementById('pageIndicator');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    viewerTitle.textContent = `Accountancy Project ${year} - Page ${currentPage} of ${totalPages}`;
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
    
    loadPageImage();
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Add additional protection when viewer is open
    addEnhancedProtection();
}

function closeImageViewer() {
    const modal = document.getElementById('imageViewerModal');
    if (modal) {
        modal.style.display = 'none';
    }
    document.body.style.overflow = 'auto';
    
    const img = document.getElementById('projectImage');
    if (img) {
        img.src = '';
        img.removeAttribute('src');
    }
    
    // Remove enhanced protection
    removeEnhancedProtection();
}

function navigatePage(direction) {
    currentPage += direction;
    
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    
    document.getElementById('viewerTitle').textContent = 
        `Accountancy Project ${currentYear} - Page ${currentPage} of ${totalPages}`;
    document.getElementById('pageIndicator').textContent = 
        `Page ${currentPage} of ${totalPages}`;
    
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
    
    loadPageImage();
}

function loadPageImage() {
    const img = document.getElementById('projectImage');
    if (!img) return;
    
    // Add loading class
    img.classList.add('loading');
    img.style.opacity = '0.5';
    
    // Use a more secure image loading method
    const imagePath = `PDF/${currentYear}/page-${currentPage}.jpg`;
    
    // Create a blob URL to make it harder to get direct image URL
    fetch(imagePath)
        .then(response => {
            if (!response.ok) throw new Error('Image not found');
            return response.blob();
        })
        .then(blob => {
            const objectURL = URL.createObjectURL(blob);
            img.src = objectURL;
            
            // Clean up object URL after loading
            img.onload = function() {
                URL.revokeObjectURL(objectURL);
                img.classList.remove('loading');
                img.style.opacity = '1';
            };
        })
        .catch(error => {
            // Show placeholder if image doesn't exist
            img.src = createPlaceholderSVG(currentPage, currentYear);
            img.classList.remove('loading');
            img.style.opacity = '1';
        });
}

function createPlaceholderSVG(page, year) {
    return `data:image/svg+xml;base64,${btoa(`
        <svg width="400" height="500" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="500" fill="#343d41"/>
            <text x="200" y="230" font-family="Arial" font-size="24" fill="#fff" text-anchor="middle" dy="0.3em">
                Page ${page}
            </text>
            <text x="200" y="260" font-family="Arial" font-size="18" fill="#fff" text-anchor="middle" dy="0.3em">
                ${year}
            </text>
            <text x="200" y="290" font-family="Arial" font-size="16" fill="#fff" text-anchor="middle" dy="0.3em">
                Image not found
            </text>
        </svg>
    `)}`;
}

function showProtectionMessage(message) {
    const existingMessage = document.querySelector('.protection-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'protection-message';
    messageDiv.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #f72585; color: white; 
                    padding: 15px 25px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                    z-index: 10000; display: flex; align-items: center; gap: 10px; animation: slideIn 0.3s ease;">
            <i class="fas fa-shield-alt"></i>
            <span>${message}</span>
        </div>
    `;
    
    if (!document.querySelector('#slideInStyle')) {
        const style = document.createElement('style');
        style.id = 'slideInStyle';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function addProtectionOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'protection-overlay';
    overlay.innerHTML = `
        <style>
            .protection-overlay::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(0,0,0,0.01) 2px,
                    rgba(0,0,0,0.01) 4px
                );
                pointer-events: none;
                z-index: 1;
            }
            
            .protection-overlay::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255,255,255,0.001);
                pointer-events: none;
                z-index: 2;
            }
        </style>
    `;
    document.body.appendChild(overlay);
}

function addEnhancedProtection() {
    // Add additional protection layers when image viewer is open
    const enhancedProtection = document.createElement('div');
    enhancedProtection.id = 'enhancedProtection';
    enhancedProtection.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: transparent;
        z-index: 9998;
        pointer-events: none;
    `;
    document.body.appendChild(enhancedProtection);
    
    // Add invisible div over image to catch clicks
    const imageShield = document.createElement('div');
    imageShield.id = 'imageShield';
    imageShield.style.cssText = `
        position: absolute;
        top: 80px;
        bottom: 80px;
        left: 20px;
        right: 20px;
        z-index: 9999;
        pointer-events: auto;
        cursor: default;
    `;
    
    // Add event listeners to shield
    ['click', 'contextmenu', 'touchstart', 'touchmove', 'touchend'].forEach(event => {
        imageShield.addEventListener(event, function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    });
    
    document.getElementById('imageViewerModal').appendChild(imageShield);
}

function removeEnhancedProtection() {
    const enhancedProtection = document.getElementById('enhancedProtection');
    if (enhancedProtection) {
        enhancedProtection.remove();
    }
    
    const imageShield = document.getElementById('imageShield');
    if (imageShield) {
        imageShield.remove();
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (document.querySelector('.years-grid')) {
            initViewerPage();
        }
    });
} else {
    if (document.querySelector('.years-grid')) {
        initViewerPage();
    }
}
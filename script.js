// =============================================
// ACCOUNTANCY PROJECTS VIEWER - MAIN SCRIPT
// =============================================

// Global variables
let currentYear = null;
let currentPage = 1;
let totalPages = 0;
let isLoading = false;
let isViewerOpen = false;

// Project data - Page counts as specified
const PROJECTS = {
    '2018': { pages: 10, title: 'Accountancy Project 2018' },
    '2019': { pages: 10, title: 'Accountancy Project 2019' },
    '2022': { pages: 8, title: 'Accountancy Project 2022' },
    '2023': { pages: 8, title: 'Accountancy Project 2023' },
    '2024': { pages: 8, title: 'Accountancy Project 2024' },
    '2025': { pages: 6, title: 'Accountancy Project 2025' }
};

// Available years (2018, 2019, 2022-2025)
const AVAILABLE_YEARS = ['2018', '2019', '2022', '2023', '2024', '2025'];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on viewer page
    if (document.getElementById('yearsGrid')) {
        initializeViewerPage();
        initializeProtection();
    }
});

// =============================================
// VIEWER PAGE FUNCTIONS
// =============================================

function initializeViewerPage() {
    console.log('Initializing viewer page...');
    
    // Create year cards
    createYearCards();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize modal controls
    initializeModal();
    
    // Test if images are accessible
    testImageAccess();
}

function createYearCards() {
    const yearsGrid = document.getElementById('yearsGrid');
    if (!yearsGrid) return;
    
    // Clear existing content
    yearsGrid.innerHTML = '';
    
    // Create cards for each available year
    AVAILABLE_YEARS.forEach(year => {
        if (PROJECTS[year]) {
            const project = PROJECTS[year];
            
            const yearCard = document.createElement('div');
            yearCard.className = 'year-card';
            yearCard.dataset.year = year;
            
            yearCard.innerHTML = `
                <div class="year-card-header">
                    <h2>${year}</h2>
                    <p>Accountancy Project</p>
                </div>
                <div class="year-card-content">
                    <div class="stats">
                        <div class="stat">
                            <i class="fas fa-file-alt"></i>
                            <span class="stat-value">${project.pages}</span>
                            <span class="stat-label">Pages</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-lock"></i>
                            <span class="stat-value">Protected</span>
                            <span class="stat-label">View Only</span>
                        </div>
                    </div>
                    <div class="year-note">
                        <i class="fas fa-info-circle"></i> Click to view project
                    </div>
                </div>
                <div class="year-card-footer">
                    <button class="btn-view" data-year="${year}">
                        <i class="fas fa-external-link-alt"></i> Open Project
                    </button>
                </div>
            `;
            
            yearsGrid.appendChild(yearCard);
        }
    });
    
    console.log(`Created ${AVAILABLE_YEARS.length} year cards`);
}

function setupEventListeners() {
    // Year card clicks
    document.addEventListener('click', function(e) {
        const viewBtn = e.target.closest('.btn-view');
        const yearCard = e.target.closest('.year-card');
        
        if (viewBtn) {
            const year = viewBtn.dataset.year;
            openViewer(year);
        } else if (yearCard && !viewBtn) {
            const year = yearCard.dataset.year;
            openViewer(year);
        }
    });
    
    // Modal controls
    const modalClose = document.getElementById('modalClose');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (modalClose) {
        modalClose.addEventListener('click', closeViewer);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (!isLoading) navigatePage(-1);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (!isLoading) navigatePage(1);
        });
    }
    
    // Close modal when clicking outside image
    const modal = document.getElementById('imageViewerModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeViewer();
            }
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!isViewerOpen) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                if (!isLoading) navigatePage(-1);
                break;
            case 'ArrowRight':
                if (!isLoading) navigatePage(1);
                break;
            case 'Escape':
                closeViewer();
                break;
        }
    });
}

function initializeModal() {
    // Nothing to do here for now
    console.log('Modal initialized');
}

// =============================================
// IMAGE VIEWER FUNCTIONS
// =============================================

function openViewer(year) {
    console.log(`Opening viewer for year: ${year}`);
    
    if (!PROJECTS[year]) {
        alert('Project data not found for year ' + year);
        return;
    }
    
    currentYear = year;
    currentPage = 1;
    totalPages = PROJECTS[year].pages;
    isViewerOpen = true;
    
    // Show modal
    const modal = document.getElementById('imageViewerModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Update UI
    updateViewerUI();
    
    // Load first page
    loadCurrentPage();
    
    // Enable protection
    enableAdvancedProtection();
}

function closeViewer() {
    console.log('Closing viewer');
    
    const modal = document.getElementById('imageViewerModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Reset state
    currentYear = null;
    currentPage = 1;
    isViewerOpen = false;
    
    // Clear image to free memory
    const img = document.getElementById('projectImage');
    if (img) {
        img.src = '';
        img.classList.remove('loaded');
    }
    
    // Hide loading spinner
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = 'none';
    
    // Hide error message
    const errorMsg = document.getElementById('errorMessage');
    if (errorMsg) errorMsg.style.display = 'none';
    
    // Disable protection
    disableAdvancedProtection();
}

function updateViewerUI() {
    if (!currentYear) return;
    
    // Update title
    const title = document.getElementById('modalTitle');
    if (title) {
        title.textContent = `${PROJECTS[currentYear].title} - Page ${currentPage} of ${totalPages}`;
    }
    
    // Update page indicator
    const indicator = document.getElementById('pageIndicator');
    if (indicator) {
        indicator.textContent = `Page ${currentPage} of ${totalPages}`;
    }
    
    // Update button states
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}

function navigatePage(direction) {
    if (isLoading) return;
    
    const newPage = currentPage + direction;
    
    // Validate page bounds
    if (newPage < 1 || newPage > totalPages) {
        return;
    }
    
    currentPage = newPage;
    updateViewerUI();
    loadCurrentPage();
}

function loadCurrentPage() {
    if (!currentYear) return;
    
    isLoading = true;
    
    const img = document.getElementById('projectImage');
    const spinner = document.getElementById('loadingSpinner');
    const errorMsg = document.getElementById('errorMessage');
    
    // Show loading spinner
    if (spinner) spinner.style.display = 'block';
    if (errorMsg) errorMsg.style.display = 'none';
    if (img) img.classList.remove('loaded');
    
    // Construct image path
    // Using 1.jpg, 2.jpg, 3.jpg etc. (without "page-" prefix)
    const imagePath = `PDF/${currentYear}/${currentPage}.jpg`;
    console.log(`Loading image: ${imagePath}`);
    
    // Test if image exists
    testImageExists(imagePath).then(exists => {
        if (exists) {
            loadImageWithFallback(img, imagePath);
        } else {
            showImageNotFound();
        }
    }).catch(error => {
        console.error('Error checking image:', error);
        showImageNotFound();
    });
}

function testImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            resolve(true);
        };
        img.onerror = function() {
            resolve(false);
        };
        img.src = url;
        
        // Timeout after 3 seconds
        setTimeout(() => {
            resolve(false);
        }, 3000);
    });
}

function loadImageWithFallback(imgElement, imagePath) {
    const img = new Image();
    
    img.onload = function() {
        // Set the image source
        imgElement.src = imagePath;
        imgElement.classList.add('loaded');
        
        // Hide loading spinner
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.style.display = 'none';
        
        isLoading = false;
        
        console.log(`Image loaded successfully: ${imagePath}`);
    };
    
    img.onerror = function() {
        // Try alternative paths
        const alternativePaths = [
            `PDF/${currentYear}/page-${currentPage}.jpg`,
            `PDF/${currentYear}/${currentPage}.jpeg`,
            `PDF/${currentYear}/${currentPage}.png`
        ];
        
        tryAlternativePaths(imgElement, alternativePaths, 0);
    };
    
    img.src = imagePath;
}

function tryAlternativePaths(imgElement, paths, index) {
    if (index >= paths.length) {
        showImageNotFound();
        return;
    }
    
    const testImg = new Image();
    testImg.onload = function() {
        imgElement.src = paths[index];
        imgElement.classList.add('loaded');
        
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.style.display = 'none';
        
        isLoading = false;
        console.log(`Image loaded from alternative path: ${paths[index]}`);
    };
    
    testImg.onerror = function() {
        tryAlternativePaths(imgElement, paths, index + 1);
    };
    
    testImg.src = paths[index];
}

function showImageNotFound() {
    const spinner = document.getElementById('loadingSpinner');
    const errorMsg = document.getElementById('errorMessage');
    const img = document.getElementById('projectImage');
    
    if (spinner) spinner.style.display = 'none';
    if (errorMsg) errorMsg.style.display = 'block';
    if (img) img.classList.remove('loaded');
    
    isLoading = false;
    
    console.log(`Image not found for page ${currentPage}`);
}

// =============================================
// PROTECTION FUNCTIONS
// =============================================

function initializeProtection() {
    console.log('Initializing protection...');
    
    // Prevent right-click
    document.addEventListener('contextmenu', function(e) {
        if (isViewerOpen || e.target.closest('.protected-image')) {
            e.preventDefault();
            showProtectionMessage('Right-click is disabled');
            return false;
        }
    });
    
    // Prevent drag and drop
    document.addEventListener('dragstart', function(e) {
        if (e.target.closest('.protected-image')) {
            e.preventDefault();
            return false;
        }
    });
    
    // Prevent text selection
    document.addEventListener('selectstart', function(e) {
        if (isViewerOpen || e.target.closest('.protected-image')) {
            e.preventDefault();
            return false;
        }
    });
    
    // Prevent keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Disable Ctrl+S, Cmd+S
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            showProtectionMessage('Saving is disabled');
            return false;
        }
        
        // Disable Print Screen and Print
        if (e.key === 'PrintScreen' || ((e.ctrlKey || e.metaKey) && e.key === 'p')) {
            e.preventDefault();
            showProtectionMessage('Printing is disabled');
            return false;
        }
        
        // Disable F12 and DevTools
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
            e.preventDefault();
            showProtectionMessage('Developer tools are disabled');
            return false;
        }
    });
    
    // Add CSS protection
    addCSSProtection();
}

function addCSSProtection() {
    const style = document.createElement('style');
    style.textContent = `
        /* Enhanced protection styles */
        .protected-image {
            pointer-events: none !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            -webkit-user-drag: none !important;
        }
        
        .image-viewer-modal {
            user-select: none !important;
        }
        
        /* Mobile protection */
        @media (max-width: 768px) {
            .image-container {
                touch-action: none !important;
            }
        }
        
        /* Print prevention */
        @media print {
            body * {
                display: none !important;
            }
            
            body:before {
                content: "Printing is not allowed for protected content.";
                display: block !important;
                font-size: 24px;
                color: red;
                text-align: center;
                margin-top: 100px;
            }
        }
    `;
    document.head.appendChild(style);
}

function enableAdvancedProtection() {
    // Add protective overlay
    const overlay = document.getElementById('protectionOverlay');
    if (overlay) {
        overlay.style.display = 'block';
    }
    
    // Add touch event prevention for mobile
    if ('ontouchstart' in window) {
        document.addEventListener('touchmove', preventTouch, { passive: false });
        document.addEventListener('touchstart', preventTouch, { passive: false });
    }
}

function disableAdvancedProtection() {
    const overlay = document.getElementById('protectionOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    
    // Remove touch event prevention
    if ('ontouchstart' in window) {
        document.removeEventListener('touchmove', preventTouch);
        document.removeEventListener('touchstart', preventTouch);
    }
}

function preventTouch(e) {
    if (isViewerOpen) {
        e.preventDefault();
        return false;
    }
}

function showProtectionMessage(message) {
    // Remove existing message
    const existing = document.querySelector('.protection-toast');
    if (existing) existing.remove();
    
    // Create new message
    const toast = document.createElement('div');
    toast.className = 'protection-toast';
    toast.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: var(--accent); 
                    color: white; padding: 12px 20px; border-radius: 8px; 
                    box-shadow: var(--shadow-md); z-index: 10000; 
                    display: flex; align-items: center; gap: 10px; 
                    animation: slideIn 0.3s ease; font-size: 14px; font-weight: 500;">
            <i class="fas fa-shield-alt"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

function testImageAccess() {
    // Test if PDF folder exists by checking a common file
    const testPath = 'PDF/2018/1.jpg';
    const testImg = new Image();
    
    testImg.onload = function() {
        console.log('PDF folder accessible - images should load correctly');
    };
    
    testImg.onerror = function() {
        console.warn('PDF folder may not be accessible. Check folder structure:');
        console.warn('Expected: PDF/2018/1.jpg, PDF/2018/2.jpg, etc.');
        console.warn('Make sure folder names match exactly (case-sensitive)');
    };
    
    testImg.src = testPath;
}

// Add slideIn animation if not present
if (!document.querySelector('#slideInStyle')) {
    const style = document.createElement('style');
    style.id = 'slideInStyle';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

// =============================================
// ERROR HANDLING
// =============================================

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    
    // Don't show alerts for minor errors
    if (e.error.message && e.error.message.includes('favicon')) {
        return;
    }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

console.log('Accountancy Projects Viewer loaded successfully');
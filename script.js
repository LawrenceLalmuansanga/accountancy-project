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

// Base path for images - works for both local and GitHub Pages
const getBasePath = () => {
    // Check if we're running on GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io');
    // Check if we're running locally
    const isLocal = window.location.protocol === 'file:';
    
    if (isLocal) {
        // Local file system
        return './pdf/';
    } else if (isGitHubPages) {
        // GitHub Pages - relative to root
        return './pdf/';
    } else {
        // Other hosting
        return './pdf/';
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing...');
    
    // Check if we're on viewer page
    if (document.getElementById('yearsGrid')) {
        console.log('Viewer page detected');
        initializeViewerPage();
        initializeProtection();
        testImageAccess(); // Test image access immediately
    } else if (document.querySelector('.warning-page')) {
        console.log('Warning page detected');
        // Initialize warning page if needed
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
}

function createYearCards() {
    const yearsGrid = document.getElementById('yearsGrid');
    if (!yearsGrid) {
        console.error('yearsGrid element not found!');
        return;
    }
    
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
    console.log('Setting up event listeners...');
    
    // Year card clicks
    document.addEventListener('click', function(e) {
        const viewBtn = e.target.closest('.btn-view');
        const yearCard = e.target.closest('.year-card');
        
        if (viewBtn) {
            const year = viewBtn.dataset.year;
            console.log(`View button clicked for year: ${year}`);
            openViewer(year);
        } else if (yearCard && !viewBtn) {
            const year = yearCard.dataset.year;
            console.log(`Year card clicked for year: ${year}`);
            openViewer(year);
        }
    });
    
    // Modal controls
    const modalClose = document.getElementById('modalClose');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (modalClose) {
        modalClose.addEventListener('click', closeViewer);
        console.log('Modal close button listener added');
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            console.log('Previous button clicked');
            if (!isLoading) navigatePage(-1);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            console.log('Next button clicked');
            if (!isLoading) navigatePage(1);
        });
    }
    
    // Close modal when clicking outside image
    const modal = document.getElementById('imageViewerModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                console.log('Modal background clicked, closing viewer');
                closeViewer();
            }
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!isViewerOpen) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                console.log('Left arrow pressed');
                if (!isLoading) navigatePage(-1);
                e.preventDefault();
                break;
            case 'ArrowRight':
                console.log('Right arrow pressed');
                if (!isLoading) navigatePage(1);
                e.preventDefault();
                break;
            case 'Escape':
                console.log('Escape pressed, closing viewer');
                closeViewer();
                e.preventDefault();
                break;
            case ' ':
                // Space bar - go to next page
                console.log('Space bar pressed');
                if (!isLoading) navigatePage(1);
                e.preventDefault();
                break;
        }
    });
    
    console.log('Event listeners setup complete');
}

function initializeModal() {
    console.log('Modal initialized');
}

// =============================================
// IMAGE VIEWER FUNCTIONS
// =============================================

function openViewer(year) {
    console.log(`Opening viewer for year: ${year}`);
    
    if (!PROJECTS[year]) {
        console.error(`Project data not found for year: ${year}`);
        showErrorMessage(`Project data not found for year ${year}`);
        return;
    }
    
    currentYear = year;
    currentPage = 1; // ALWAYS START AT PAGE 1
    totalPages = PROJECTS[year].pages;
    isViewerOpen = true;
    
    console.log(`Year: ${year}, Starting page: ${currentPage}, Total pages: ${totalPages}`);
    
    // Show modal
    const modal = document.getElementById('imageViewerModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        console.log('Modal displayed');
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
        console.log('Modal hidden');
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
        console.log('Image cleared');
    }
    
    // Hide loading spinner
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = 'none';
    
    // Hide error message
    const errorMsg = document.getElementById('errorMessage');
    if (errorMsg) errorMsg.style.display = 'none';
    
    // Disable protection
    disableAdvancedProtection();
    
    console.log('Viewer closed and reset');
}

function updateViewerUI() {
    if (!currentYear) {
        console.warn('updateViewerUI called but currentYear is null');
        return;
    }
    
    console.log(`Updating UI for page ${currentPage} of ${totalPages}`);
    
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
    
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
        console.log(`Previous button disabled: ${prevBtn.disabled}`);
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
        console.log(`Next button disabled: ${nextBtn.disabled}`);
    }
}

function navigatePage(direction) {
    if (isLoading) {
        console.log('Page navigation blocked: still loading');
        return;
    }
    
    const newPage = currentPage + direction;
    
    console.log(`Attempting navigation from page ${currentPage} to ${newPage} (direction: ${direction})`);
    
    // Validate page bounds
    if (newPage < 1) {
        console.log('Cannot navigate before page 1');
        return;
    }
    
    if (newPage > totalPages) {
        console.log(`Cannot navigate beyond page ${totalPages}`);
        return;
    }
    
    currentPage = newPage;
    console.log(`Navigated to page ${currentPage}`);
    
    updateViewerUI();
    loadCurrentPage();
}

function loadCurrentPage() {
    if (!currentYear) {
        console.error('loadCurrentPage called but currentYear is null');
        return;
    }
    
    isLoading = true;
    
    console.log(`Loading page ${currentPage} for year ${currentYear}`);
    
    const img = document.getElementById('projectImage');
    const spinner = document.getElementById('loadingSpinner');
    const errorMsg = document.getElementById('errorMessage');
    
    // Show loading spinner
    if (spinner) {
        spinner.style.display = 'block';
        console.log('Loading spinner shown');
    }
    
    if (errorMsg) errorMsg.style.display = 'none';
    if (img) img.classList.remove('loaded');
    
    // Construct image path
    // Using page-1.jpg, page-2.jpg etc.
    const basePath = getBasePath();
    const imagePath = `${basePath}${currentYear}/page-${currentPage}.jpg`;
    
    console.log(`Attempting to load image from: ${imagePath}`);
    
    // Test if image exists
    testImageExists(imagePath).then(exists => {
        if (exists) {
            console.log(`Image exists at: ${imagePath}`);
            loadImageWithFallback(img, imagePath);
        } else {
            console.log(`Image not found at primary path: ${imagePath}`);
            // Try alternative naming patterns
            tryAlternativeImagePaths();
        }
    }).catch(error => {
        console.error('Error checking image:', error);
        tryAlternativeImagePaths();
    });
}

function testImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            console.log(`Image test passed for: ${url}`);
            resolve(true);
        };
        img.onerror = function() {
            console.log(`Image test failed for: ${url}`);
            resolve(false);
        };
        img.src = url;
        
        // Timeout after 5 seconds
        setTimeout(() => {
            console.log(`Image test timeout for: ${url}`);
            resolve(false);
        }, 5000);
    });
}

function loadImageWithFallback(imgElement, imagePath) {
    const img = new Image();
    
    img.onload = function() {
        console.log(`Image loaded successfully: ${imagePath}`);
        
        // Set the image source
        imgElement.src = imagePath;
        imgElement.classList.add('loaded');
        
        // Hide loading spinner
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'none';
            console.log('Loading spinner hidden');
        }
        
        isLoading = false;
        
        // Log success
        console.log(`Page ${currentPage} loaded successfully`);
    };
    
    img.onerror = function() {
        console.log(`Failed to load image from: ${imagePath}`);
        // Try alternative paths
        tryAlternativeImagePaths();
    };
    
    console.log(`Starting image load from: ${imagePath}`);
    img.src = imagePath;
}

function tryAlternativeImagePaths() {
    console.log('Trying alternative image paths...');
    
    const imgElement = document.getElementById('projectImage');
    const basePath = getBasePath();
    
    // Define all possible naming patterns
    const alternativePaths = [
        // Original pattern: page-1.jpg
        `${basePath}${currentYear}/page-${currentPage}.jpg`,
        // Pattern 2: 1.jpg (without page-)
        `${basePath}${currentYear}/${currentPage}.jpg`,
        // Pattern 3: page-1.jpeg
        `${basePath}${currentYear}/page-${currentPage}.jpeg`,
        // Pattern 4: 1.jpeg
        `${basePath}${currentYear}/${currentPage}.jpeg`,
        // Pattern 5: page-1.png
        `${basePath}${currentYear}/page-${currentPage}.png`,
        // Pattern 6: 1.png
        `${basePath}${currentYear}/${currentPage}.png`,
        // Pattern 7: Page-1.jpg (capital P)
        `${basePath}${currentYear}/Page-${currentPage}.jpg`,
        // Pattern 8: PAGE-1.JPG (uppercase)
        `${basePath}${currentYear}/PAGE-${currentPage}.JPG`,
    ];
    
    console.log('Alternative paths to try:', alternativePaths);
    
    // Try each path sequentially
    tryPathSequentially(imgElement, alternativePaths, 0);
}

function tryPathSequentially(imgElement, paths, index) {
    if (index >= paths.length) {
        console.log('All alternative paths failed, showing error');
        showImageNotFound();
        return;
    }
    
    const currentPath = paths[index];
    console.log(`Trying path ${index + 1}/${paths.length}: ${currentPath}`);
    
    const testImg = new Image();
    testImg.onload = function() {
        console.log(`Success with alternative path: ${currentPath}`);
        imgElement.src = currentPath;
        imgElement.classList.add('loaded');
        
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.style.display = 'none';
        
        isLoading = false;
        
        // Log which pattern worked
        console.log(`Page ${currentPage} loaded from alternative path: ${currentPath}`);
    };
    
    testImg.onerror = function() {
        console.log(`Failed with path: ${currentPath}`);
        // Try next path
        tryPathSequentially(imgElement, paths, index + 1);
    };
    
    // Start loading the test image
    testImg.src = currentPath;
}

function showImageNotFound() {
    console.log('Showing image not found error');
    
    const spinner = document.getElementById('loadingSpinner');
    const errorMsg = document.getElementById('errorMessage');
    const img = document.getElementById('projectImage');
    
    if (spinner) {
        spinner.style.display = 'none';
        console.log('Loading spinner hidden');
    }
    
    if (errorMsg) {
        errorMsg.style.display = 'block';
        console.log('Error message shown');
    }
    
    if (img) img.classList.remove('loaded');
    
    isLoading = false;
    
    console.log(`Image not found for page ${currentPage} of year ${currentYear}`);
    
    // Update error message with more helpful info
    if (errorMsg) {
        const errorText = errorMsg.querySelector('p');
        if (errorText) {
            errorText.innerHTML = `Image not found for page ${currentPage}.<br>Expected: pdf/${currentYear}/page-${currentPage}.jpg`;
        }
    }
}

function showErrorMessage(message) {
    // Create a temporary error message
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #f72585;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInDown 0.3s ease;
    `;
    
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
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
    
    console.log('Protection initialized');
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
        
        /* Animation for error messages */
        @keyframes slideInDown {
            from {
                transform: translate(-50%, -100%);
                opacity: 0;
            }
            to {
                transform: translate(-50%, 0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    console.log('CSS protection added');
}

function enableAdvancedProtection() {
    console.log('Enabling advanced protection');
    
    // Add protective overlay
    const overlay = document.getElementById('protectionOverlay');
    if (overlay) {
        overlay.style.display = 'block';
    }
    
    // Add touch event prevention for mobile
    if ('ontouchstart' in window) {
        document.addEventListener('touchmove', preventTouch, { passive: false });
        document.addEventListener('touchstart', preventTouch, { passive: false });
        console.log('Touch protection enabled');
    }
}

function disableAdvancedProtection() {
    console.log('Disabling advanced protection');
    
    const overlay = document.getElementById('protectionOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    
    // Remove touch event prevention
    if ('ontouchstart' in window) {
        document.removeEventListener('touchmove', preventTouch);
        document.removeEventListener('touchstart', preventTouch);
        console.log('Touch protection disabled');
    }
}

function preventTouch(e) {
    if (isViewerOpen) {
        e.preventDefault();
        return false;
    }
}

function showProtectionMessage(message) {
    console.log(`Protection message: ${message}`);
    
    // Remove existing message
    const existing = document.querySelector('.protection-toast');
    if (existing) existing.remove();
    
    // Create new message
    const toast = document.createElement('div');
    toast.className = 'protection-toast';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--accent);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: var(--shadow-md);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
        font-size: 14px;
        font-weight: 500;
    `;
    
    toast.innerHTML = `
        <i class="fas fa-shield-alt"></i>
        <span>${message}</span>
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
    console.log('Testing image access...');
    
    // Test if pdf folder exists by checking a common file
    const basePath = getBasePath();
    const testPath = `${basePath}2018/page-1.jpg`;
    const testImg = new Image();
    
    testImg.onload = function() {
        console.log('✓ Image access test PASSED');
        console.log(`  Images should load from: ${testPath}`);
    };
    
    testImg.onerror = function() {
        console.error('✗ Image access test FAILED');
        console.warn(`  Cannot access: ${testPath}`);
        console.warn('  Check:');
        console.warn('  1. Folder exists: pdf/ (lowercase)');
        console.warn('  2. Year folder exists: pdf/2018/');
        console.warn('  3. Image exists: pdf/2018/page-1.jpg');
        console.warn('  4. Case sensitivity: GitHub is case-sensitive!');
        
        // Show user-friendly warning
        showErrorMessage('Warning: Images may not load. Check console for details.');
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

// Log page load completion
window.addEventListener('load', function() {
    console.log('Page fully loaded and ready');
    console.log('Current URL:', window.location.href);
    console.log('Base path for images:', getBasePath());
});

console.log('Accountancy Projects Viewer script loaded successfully');
/**
 * Main Application File for Walmart Uganda Ecommerce Platform
 * Initializes all modules and handles global application functionality
 */

class WalmartUgandaApp {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('🚀 Initializing Walmart Uganda Ecommerce Platform...');

            // Initialize core modules
            await this.initializeCoreModules();

            // Setup global event listeners
            this.setupGlobalEventListeners();

            // Initialize page-specific functionality
            this.initializePageSpecificFunctionality();

            // Mark as initialized
            this.isInitialized = true;

            console.log('✅ Walmart Uganda Ecommerce Platform initialized successfully!');

            // Show welcome message for first-time visitors
            this.showWelcomeMessage();

        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            Helpers.showToast('Application initialization failed', 'error');
        }
    }

    /**
     * Initialize core modules
     */
    async initializeCoreModules() {
        // Note: Modules are already initialized by their individual files
        // This method ensures they're properly sequenced if needed

        this.modules = {
            helpers: window.Helpers,
            apiClient: window.apiClient,
            validators: window.Validators,
            cartManager: window.cartManager,
            productDisplay: window.productDisplay,
            authHandler: window.authHandler,
            searchFilter: window.searchFilter,
            checkoutProcess: window.checkoutProcess
        };

        // Wait for critical modules to be ready
        await this.waitForModules(['cartManager', 'authHandler']);
    }

    /**
     * Wait for specific modules to be available
     */
    waitForModules(moduleNames) {
        return new Promise((resolve) => {
            const checkModules = () => {
                const allReady = moduleNames.every(name => window[name]);
                if (allReady) {
                    resolve();
                } else {
                    setTimeout(checkModules, 100);
                }
            };
            checkModules();
        });
    }

    /**
     * Setup global event listeners
     */
    setupGlobalEventListeners() {
        // Global search functionality
        this.setupGlobalSearch();

        // Cart updates
        this.setupCartUpdates();

        // Authentication state changes
        this.setupAuthStateListener();

        // Responsive navigation
        this.setupResponsiveNavigation();

        // Error handling
        this.setupErrorHandling();

        // Performance monitoring
        this.setupPerformanceMonitoring();

        // Service Worker registration (for PWA)
        this.registerServiceWorker();
    }

    /**
     * Setup global search functionality
     */
    setupGlobalSearch() {
        const searchInputs = document.querySelectorAll('#search-input');

        searchInputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (query) {
                        window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
                    }
                }
            });
        });

        // Add search shortcut (Ctrl+K / Cmd+K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('#search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }
        });
    }

    /**
     * Setup cart update listeners
     */
    setupCartUpdates() {
        // Listen for cart updates from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'walmart_cart') {
                cartManager.loadFromLocalStorage();
                cartManager.updateCartUI();
            }
        });

        // Custom event for cart updates
        document.addEventListener('cartUpdated', () => {
            cartManager.updateCartUI();
        });
    }

    /**
     * Setup authentication state listener
     */
    setupAuthStateListener() {
        // Listen for auth state changes
        const originalSetCurrentUser = Helpers.setCurrentUser;
        Helpers.setCurrentUser = function(user) {
            originalSetCurrentUser.call(this, user);
            document.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user } }));
        };

        // Update UI when auth state changes
        document.addEventListener('authStateChanged', (e) => {
            authHandler.currentUser = e.detail.user;
            authHandler.updateAuthUI();
        });
    }

    /**
     * Setup responsive navigation
     */
    setupResponsiveNavigation() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const navbar = document.getElementById('navbar');

        if (mobileMenuBtn && navbar) {
            mobileMenuBtn.addEventListener('click', () => {
                navbar.classList.toggle('active');
                mobileMenuBtn.innerHTML = navbar.classList.contains('active') ?
                    '<i class="fas fa-times"></i>' :
                    '<i class="fas fa-bars"></i>';
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navbar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    navbar.classList.remove('active');
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        }

        // Handle window resize
        window.addEventListener('resize', Helpers.debounce(() => {
            if (window.innerWidth > 768) {
                navbar?.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        }, 250));
    }

    /**
     * Setup error handling
     */
    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.logError(e.error);
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.logError(e.reason);
            e.preventDefault();
        });

        // Network status monitoring
        this.setupNetworkStatusMonitor();
    }

    /**
     * Setup network status monitor
     */
    setupNetworkStatusMonitor() {
        window.addEventListener('online', () => {
            Helpers.showToast('Connection restored', 'success');
            // Sync any pending operations
            this.syncPendingOperations();
        });

        window.addEventListener('offline', () => {
            Helpers.showToast('You are currently offline', 'warning');
        });
    }

    /**
     * Sync pending operations when coming online
     */
    syncPendingOperations() {
        // Sync cart if there are pending changes
        const pendingCart = localStorage.getItem('pending_cart_sync');
        if (pendingCart) {
            // Implement cart sync logic here
            localStorage.removeItem('pending_cart_sync');
        }
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor page load performance
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const navigationTiming = performance.getEntriesByType('navigation')[0];
                const loadTime = navigationTiming.loadEventEnd - navigationTiming.navigationStart;

                console.log(`📊 Page loaded in ${loadTime}ms`);

                // Log performance metrics
                this.logPerformance({
                    loadTime: loadTime,
                    domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.navigationStart,
                    firstContentfulPaint: this.getFirstContentfulPaint(),
                    largestContentfulPaint: this.getLargestContentfulPaint()
                });
            });
        }

        // Monitor Core Web Vitals
        this.monitorCoreWebVitals();
    }

    /**
     * Get First Contentful Paint
     */
    getFirstContentfulPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcp ? fcp.startTime : null;
    }

    /**
     * Get Largest Contentful Paint
     */
    getLargestContentfulPaint() {
        // This would typically use the web-vitals library
        // For now, return a simplified version
        return performance.now();
    }

    /**
     * Monitor Core Web Vitals
     */
    monitorCoreWebVitals() {
        // In a production app, you would use the web-vitals library
        // This is a simplified implementation
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                console.log(`📈 ${entry.name}:`, entry.value);
            }
        });

        try {
            observer.observe({ entryTypes: ['largest-contentful-paint', 'layout-shift', 'first-input'] });
        } catch (e) {
            console.log('PerformanceObserver not supported');
        }
    }

    /**
     * Initialize page-specific functionality
     */
    initializePageSpecificFunctionality() {
        const page = document.body.dataset.page || this.getCurrentPage();

        switch (page) {
            case 'home':
                this.initializeHomePage();
                break;
            case 'shop':
                this.initializeShopPage();
                break;
            case 'product-detail':
                this.initializeProductDetailPage();
                break;
            case 'cart':
                this.initializeCartPage();
                break;
            case 'checkout':
                this.initializeCheckoutPage();
                break;
            case 'login':
            case 'register':
                this.initializeAuthPage();
                break;
            case 'user-dashboard':
                this.initializeDashboardPage();
                break;
            case 'orders':
                this.initializeOrdersPage();
                break;
            case 'wishlist':
                this.initializeWishlistPage();
                break;
            default:
                this.initializeGeneralPage();
        }
    }

    /**
     * Get current page name from URL
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop()?.replace('.html', '') || 'home';
        return page === 'index' ? 'home' : page;
    }

    /**
     * Initialize home page functionality
     */
    initializeHomePage() {
        console.log('🏠 Initializing home page...');

        // Load featured products is handled by product-display.js
        // Initialize any home-specific components here

        // Add hero section animations
        this.initializeHeroAnimations();

        // Initialize newsletter signup
        this.initializeNewsletterSignup();
    }

    /**
     * Initialize shop page functionality
     */
    initializeShopPage() {
        console.log('🛍️ Initializing shop page...');

        // Product display and search/filter are handled by their respective modules
        // Add any shop-specific initializations here

        // Initialize view mode preference
        productDisplay.loadViewModePreference();
    }

    /**
     * Initialize product detail page functionality
     */
    initializeProductDetailPage() {
        console.log('📦 Initializing product detail page...');

        // Product detail functionality would be initialized here
        // This could include image zoom, variant selection, etc.

        this.initializeProductImageGallery();
        this.initializeProductVariants();
        this.initializeProductTabs();
    }

    /**
     * Initialize cart page functionality
     */
    initializeCartPage() {
        console.log('🛒 Initializing cart page...');

        // Cart functionality is handled by cart-manager.js
        // Add any cart-specific initializations here
    }

    /**
     * Initialize checkout page functionality
     */
    initializeCheckoutPage() {
        console.log('💳 Initializing checkout page...');

        // Checkout functionality is handled by checkout-process.js
        // Add any checkout-specific initializations here

        // Require authentication for checkout
        if (!authHandler.isAuthenticated()) {
            authHandler.setRedirectUrl('checkout.html');
            window.location.href = 'login.html';
            return;
        }
    }

    /**
     * Initialize authentication pages
     */
    initializeAuthPage() {
        console.log('🔐 Initializing auth page...');

        // Auth functionality is handled by auth-handler.js
        // Add any auth-specific initializations here

        // Redirect if already logged in
        if (authHandler.isAuthenticated()) {
            const redirectTo = authHandler.getRedirectUrl() || 'user-dashboard.html';
            authHandler.clearRedirectUrl();
            window.location.href = redirectTo;
        }
    }

    /**
     * Initialize user dashboard page
     */
    initializeDashboardPage() {
        console.log('📊 Initializing dashboard page...');

        // Require authentication
        if (!authHandler.requireAuth()) {
            return;
        }

        // Dashboard functionality is handled by auth-handler.js
        // Add any dashboard-specific initializations here
    }

    /**
     * Initialize orders page
     */
    initializeOrdersPage() {
        console.log('📋 Initializing orders page...');

        // Require authentication
        if (!authHandler.requireAuth()) {
            return;
        }

        // Orders functionality would be initialized here
    }

    /**
     * Initialize wishlist page
     */
    initializeWishlistPage() {
        console.log('❤️ Initializing wishlist page...');

        // Require authentication
        if (!authHandler.requireAuth()) {
            return;
        }

        // Wishlist functionality would be initialized here
    }

    /**
     * Initialize general page functionality
     */
    initializeGeneralPage() {
        console.log('🌐 Initializing general page...');
        // General functionality for all pages
    }

    /**
     * Initialize hero section animations
     */
    initializeHeroAnimations() {
        const hero = document.querySelector('.hero');
        if (hero) {
            // Add scroll-triggered animations
            this.setupScrollAnimations();
        }
    }

    /**
     * Initialize newsletter signup
     */
    initializeNewsletterSignup() {
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const emailInput = newsletterForm.querySelector('input[type="email"]');
                const email = emailInput?.value;

                if (email && Helpers.isValidEmail(email)) {
                    try {
                        // Simulate API call
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        Helpers.showToast('Thanks for subscribing!', 'success');
                        emailInput.value = '';
                    } catch (error) {
                        Helpers.showToast('Subscription failed. Please try again.', 'error');
                    }
                } else {
                    Helpers.showToast('Please enter a valid email address', 'error');
                }
            });
        }
    }

    /**
     * Initialize product image gallery
     */
    initializeProductImageGallery() {
        // This would handle image zoom, thumbnail navigation, etc.
        console.log('Initializing product image gallery...');
    }

    /**
     * Initialize product variants
     */
    initializeProductVariants() {
        // This would handle variant selection and price updates
        console.log('Initializing product variants...');
    }

    /**
     * Initialize product tabs
     */
    initializeProductTabs() {
        // This would handle tab switching in product detail page
        console.log('Initializing product tabs...');
    }

    /**
     * Setup scroll animations
     */
    setupScrollAnimations() {
        // Simple scroll animation implementation
        const animatedElements = document.querySelectorAll('.animate-on-scroll');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(el => observer.observe(el));
    }

    /**
     * Register Service Worker for PWA functionality
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.worker.register('/sw.js');
                console.log('✅ Service Worker registered:', registration);
            } catch (error) {
                console.log('❌ Service Worker registration failed:', error);
            }
        }
    }

    /**
     * Show welcome message for first-time visitors
     */
    showWelcomeMessage() {
        const hasVisited = localStorage.getItem('has_visited');
        if (!hasVisited) {
            Helpers.showToast('Welcome to Walmart Uganda! 🛍️', 'success', 5000);
            localStorage.setItem('has_visited', 'true');
        }
    }

    /**
     * Log error to analytics service
     */
    logError(error) {
        // In a production app, this would send to an error tracking service
        console.error('📝 Error logged:', error);

        const errorData = {
            message: error.message,
            stack: error.stack,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        // Store errors locally (in production, send to backend)
        const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
        errors.push(errorData);
        localStorage.setItem('app_errors', JSON.stringify(errors.slice(-50))); // Keep last 50 errors
    }

    /**
     * Log performance metrics
     */
    logPerformance(metrics) {
        // In a production app, this would send to an analytics service
        console.log('📊 Performance metrics:', metrics);

        const perfData = {
            ...metrics,
            url: window.location.href,
            timestamp: new Date().toISOString()
        };

        // Store performance data locally
        const performanceLog = JSON.parse(localStorage.getItem('app_performance') || '[]');
        performanceLog.push(perfData);
        localStorage.setItem('app_performance', JSON.stringify(performanceLog.slice(-100))); // Keep last 100 entries
    }

    /**
     * Get application statistics
     */
    getAppStats() {
        return {
            users: {
                total: Helpers.getCurrentUser() ? 1 : 0,
                // More user stats would come from backend
            },
            cart: {
                itemCount: cartManager.cart.itemCount,
                totalValue: cartManager.cart.total
            },
            performance: {
                loadTime: performance.timing?.loadEventEnd - performance.timing?.navigationStart,
                // More performance metrics
            }
        };
    }

    /**
     * Destroy application (for cleanup)
     */
    destroy() {
        // Clean up event listeners
        // Clear intervals/timeouts
        // Reset state
        this.isInitialized = false;
        console.log('🛑 Application destroyed');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    window.walmartApp = new WalmartUgandaApp();
    await window.walmartApp.init();
});

// Make app available globally
window.WalmartUgandaApp = WalmartUgandaApp;

// Global utility functions
window.searchProducts = function() {
    const searchInput = document.getElementById('search-input');
    if (searchInput && searchInput.value.trim()) {
        window.location.href = `shop.html?search=${encodeURIComponent(searchInput.value.trim())}`;
    }
};

window.toggleWishlist = function(productId) {
    if (window.productDisplay) {
        window.productDisplay.toggleWishlist(productId);
    }
};

window.addToCart = function(productId, quantity = 1) {
    if (window.cartManager) {
        window.cartManager.addToCart(productId, quantity);
    }
};

window.proceedToCheckout = function() {
    if (window.cartManager && cartManager.cart.items.length > 0) {
        window.location.href = 'checkout.html';
    } else {
        Helpers.showToast('Your cart is empty', 'warning');
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WalmartUgandaApp };
}

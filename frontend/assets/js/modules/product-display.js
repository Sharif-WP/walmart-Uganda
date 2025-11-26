/**
 * Product Display Manager for Walmart Uganda Ecommerce Platform
 * Handles product rendering, filtering, sorting, and search functionality
 */

class ProductDisplay {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.productsPerPage = 12;
        this.currentSort = 'featured';
        this.currentFilters = {};
        this.searchQuery = '';
        this.init();
    }

    /**
     * Initialize product display
     */
    async init() {
        await this.loadProducts();
        this.setupEventListeners();
        this.renderProducts();
    }

    /**
     * Load products from API
     */
    async loadProducts(params = {}) {
        try {
            Helpers.showLoading(document.getElementById('products-grid'));

            const response = await apiClient.getProducts(params);
            this.products = response.data || [];
            this.filteredProducts = [...this.products];

            this.updateProductCount();
            this.renderProducts();

        } catch (error) {
            console.error('Error loading products:', error);
            Helpers.showToast('Failed to load products', 'error');
        }
    }

    /**
     * Render products to the grid
     */
    renderProducts() {
        const productsGrid = document.getElementById('products-grid');
        const featuredGrid = document.getElementById('featured-products');
        const relatedGrid = document.getElementById('related-products');

        if (productsGrid) {
            this.renderProductGrid(productsGrid, this.getPaginatedProducts());
        }

        if (featuredGrid) {
            this.renderFeaturedProducts(featuredGrid);
        }

        if (relatedGrid) {
            this.renderRelatedProducts(relatedGrid);
        }

        this.updatePagination();
        this.updateProductCount();
    }

    /**
     * Render product grid
     */
    renderProductGrid(container, products) {
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = this.renderNoProducts();
            return;
        }

        container.innerHTML = products.map(product => this.renderProductCard(product)).join('');
    }

    /**
     * Render individual product card
     */
    renderProductCard(product) {
        const discount = product.discount ? Helpers.calculateDiscount(product.cost_price, product.price) : 0;
        const rating = product.rating || 4.5;
        const reviewCount = product.review_count || Math.floor(Math.random() * 100) + 20;

        return `
            <div class="product-card" data-product-id="${product.id}">
                ${discount > 0 ? `<div class="product-card-badge">-${discount}%</div>` : ''}

                <button class="product-card-wishlist" onclick="productDisplay.toggleWishlist(${product.id})" aria-label="Add to wishlist">
                    <i class="far fa-heart"></i>
                </button>

                <div class="product-card-image">
                    <img src="${product.image || 'assets/images/products/placeholder.jpg'}"
                         alt="${Helpers.sanitizeHTML(product.name)}"
                         loading="lazy"
                         onerror="this.src='assets/images/products/placeholder.jpg'">
                    <div class="product-card-overlay">
                        <button class="btn-quick-view" onclick="productDisplay.quickView(${product.id})">
                            <i class="fas fa-eye"></i> Quick View
                        </button>
                    </div>
                </div>

                <div class="product-card-content">
                    <div class="product-card-category">${product.category_name || 'General'}</div>
                    <h3 class="product-card-title">
                        <a href="product-detail.html?id=${product.id}">${Helpers.sanitizeHTML(product.name)}</a>
                    </h3>
                    <p class="product-card-description">${Helpers.sanitizeHTML(product.short_description || product.description || '')}</p>

                    <div class="product-card-rating">
                        <div class="product-card-stars">
                            ${this.renderStars(rating)}
                        </div>
                        <span class="product-card-reviews">(${reviewCount} reviews)</span>
                    </div>

                    <div class="product-card-pricing">
                        <div class="product-card-price">${Helpers.formatCurrency(product.price)}</div>
                        ${product.cost_price && product.cost_price > product.price ? `
                            <div class="product-card-original-price">${Helpers.formatCurrency(product.cost_price)}</div>
                            ${discount > 0 ? `<div class="product-card-discount">Save ${discount}%</div>` : ''}
                        ` : ''}
                    </div>

                    <div class="product-card-stock ${product.stock_quantity > 10 ? 'in-stock' : product.stock_quantity > 0 ? 'low-stock' : 'out-of-stock'}">
                        <i class="fas fa-${product.stock_quantity > 10 ? 'check' : product.stock_quantity > 0 ? 'exclamation' : 'times'}-circle"></i>
                        ${product.stock_quantity > 10 ? 'In Stock' : product.stock_quantity > 0 ? `Only ${product.stock_quantity} left` : 'Out of Stock'}
                    </div>

                    <div class="product-card-actions">
                        <button class="btn-add-to-cart" onclick="productDisplay.addToCart(${product.id})"
                                ${product.stock_quantity === 0 ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart"></i>
                            <span>${product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                        </button>
                        <button class="btn-quick-view" onclick="productDisplay.quickView(${product.id})" aria-label="Quick view">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render star rating
     */
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }

        // Half star
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }

        return stars;
    }

    /**
     * Render no products message
     */
    renderNoProducts() {
        return `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search or filter criteria</p>
                <button class="btn-clear-filters" onclick="productDisplay.clearFilters()">Clear All Filters</button>
            </div>
        `;
    }

    /**
     * Render featured products
     */
    async renderFeaturedProducts(container) {
        try {
            const response = await apiClient.getFeaturedProducts(8);
            const featuredProducts = response.data || [];

            if (container) {
                container.innerHTML = featuredProducts.map(product => this.renderProductCard(product)).join('');
            }
        } catch (error) {
            console.error('Error loading featured products:', error);
        }
    }

    /**
     * Render related products
     */
    async renderRelatedProducts(container, productId = null) {
        if (!productId) {
            // Get product ID from URL or use first product
            const urlParams = Helpers.getQueryParams();
            productId = urlParams.id || this.products[0]?.id;
        }

        if (!productId) return;

        try {
            const response = await apiClient.getRelatedProducts(productId, 4);
            const relatedProducts = response.data || [];

            if (container) {
                container.innerHTML = relatedProducts.map(product => this.renderProductCard(product)).join('');
            }
        } catch (error) {
            console.error('Error loading related products:', error);
        }
    }

    /**
     * Search products
     */
    async searchProducts(query, filters = {}) {
        this.searchQuery = query;
        this.currentFilters = { ...this.currentFilters, ...filters };
        this.currentPage = 1;

        try {
            const response = await apiClient.searchProducts(query, this.currentFilters);
            this.filteredProducts = response.data || [];
            this.renderProducts();
        } catch (error) {
            console.error('Error searching products:', error);
            Helpers.showToast('Search failed', 'error');
        }
    }

    /**
     * Filter products
     */
    filterProducts(filters = {}) {
        this.currentFilters = { ...this.currentFilters, ...filters };
        this.currentPage = 1;

        let filtered = [...this.products];

        // Apply category filter
        if (this.currentFilters.category && this.currentFilters.category.length > 0) {
            filtered = filtered.filter(product =>
                this.currentFilters.category.includes(product.category_id?.toString())
            );
        }

        // Apply price filter
        if (this.currentFilters.maxPrice) {
            filtered = filtered.filter(product =>
                product.price <= parseFloat(this.currentFilters.maxPrice)
            );
        }

        // Apply brand filter
        if (this.currentFilters.brand && this.currentFilters.brand.length > 0) {
            filtered = filtered.filter(product =>
                this.currentFilters.brand.includes(product.brand_id?.toString())
            );
        }

        // Apply rating filter
        if (this.currentFilters.rating) {
            const minRating = parseFloat(this.currentFilters.rating);
            filtered = filtered.filter(product =>
                (product.rating || 0) >= minRating
            );
        }

        // Apply search query
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query) ||
                product.category_name?.toLowerCase().includes(query)
            );
        }

        this.filteredProducts = filtered;
        this.sortProducts(this.currentSort);
        this.renderProducts();
    }

    /**
     * Sort products
     */
    sortProducts(sortBy) {
        this.currentSort = sortBy;

        switch (sortBy) {
            case 'price-low':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'newest':
                this.filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'rating':
                this.filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'featured':
            default:
                // Keep original order or sort by featured status
                this.filteredProducts.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
                break;
        }

        this.renderProducts();
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this.currentFilters = {};
        this.searchQuery = '';
        this.currentPage = 1;
        this.filteredProducts = [...this.products];
        this.renderProducts();

        // Clear filter inputs
        const filterInputs = document.querySelectorAll('.filter-form input, .filter-form select');
        filterInputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else if (input.type === 'range') {
                input.value = input.max;
            } else {
                input.value = '';
            }
        });

        Helpers.showToast('Filters cleared', 'info');
    }

    /**
     * Get paginated products
     */
    getPaginatedProducts() {
        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        return this.filteredProducts.slice(startIndex, endIndex);
    }

    /**
     * Update pagination UI
     */
    updatePagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <button class="pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}"
                    onclick="productDisplay.previousPage()" ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationHTML += `
                    <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}"
                            onclick="productDisplay.goToPage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
        }

        // Next button
        paginationHTML += `
            <button class="pagination-btn ${this.currentPage === totalPages ? 'disabled' : ''}"
                    onclick="productDisplay.nextPage()" ${this.currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    /**
     * Update product count display
     */
    updateProductCount() {
        const countElement = document.getElementById('products-count');
        const resultsElement = document.getElementById('results-info');

        if (countElement) {
            countElement.textContent = `Showing ${this.filteredProducts.length} products`;
        }

        if (resultsElement) {
            const start = (this.currentPage - 1) * this.productsPerPage + 1;
            const end = Math.min(this.currentPage * this.productsPerPage, this.filteredProducts.length);
            resultsElement.textContent = `Showing ${start}-${end} of ${this.filteredProducts.length} products`;
        }
    }

    /**
     * Pagination methods
     */
    nextPage() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderProducts();
            this.scrollToProducts();
        }
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderProducts();
            this.scrollToProducts();
        }
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderProducts();
            this.scrollToProducts();
        }
    }

    /**
     * Scroll to products grid
     */
    scrollToProducts() {
        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            productsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * Quick view product
     */
    async quickView(productId) {
        try {
            const response = await apiClient.getProduct(productId);
            const product = response.data;

            if (product) {
                this.showQuickViewModal(product);
            }
        } catch (error) {
            console.error('Error loading product for quick view:', error);
            Helpers.showToast('Failed to load product details', 'error');
        }
    }

    /**
     * Show quick view modal
     */
    showQuickViewModal(product) {
        // Create modal HTML
        const modalHTML = `
            <div class="quick-view-modal active">
                <div class="modal-overlay" onclick="productDisplay.closeQuickView()"></div>
                <div class="modal-content">
                    <button class="modal-close" onclick="productDisplay.closeQuickView()">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="quick-view-content">
                        <div class="product-images">
                            <img src="${product.image || 'assets/images/products/placeholder.jpg'}" alt="${product.name}">
                        </div>
                        <div class="product-details">
                            <h2>${Helpers.sanitizeHTML(product.name)}</h2>
                            <div class="price">${Helpers.formatCurrency(product.price)}</div>
                            <div class="description">${Helpers.sanitizeHTML(product.short_description || product.description)}</div>
                            <div class="actions">
                                <button class="btn-add-to-cart" onclick="productDisplay.addToCart(${product.id}); productDisplay.closeQuickView()">
                                    <i class="fas fa-shopping-cart"></i>
                                    Add to Cart
                                </button>
                                <a href="product-detail.html?id=${product.id}" class="btn-view-details">
                                    View Full Details
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to page
        const existingModal = document.querySelector('.quick-view-modal');
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close quick view modal
     */
    closeQuickView() {
        const modal = document.querySelector('.quick-view-modal');
        if (modal) {
            modal.remove();
        }
        document.body.style.overflow = '';
    }

    /**
     * Add product to cart
     */
    async addToCart(productId, quantity = 1) {
        return await cartManager.addToCart(productId, quantity);
    }

    /**
     * Toggle product wishlist
     */
    async toggleWishlist(productId) {
        try {
            // Check if product is in wishlist
            const wishlistResponse = await apiClient.getWishlist();
            const isInWishlist = wishlistResponse.data?.items?.some(item => item.product_id === productId);

            if (isInWishlist) {
                await apiClient.removeFromWishlist(productId);
                Helpers.showToast('Removed from wishlist', 'success');
            } else {
                await apiClient.addToWishlist(productId);
                Helpers.showToast('Added to wishlist', 'success');
            }

            // Update wishlist button state
            this.updateWishlistButton(productId, !isInWishlist);

        } catch (error) {
            console.error('Error toggling wishlist:', error);
            Helpers.showToast('Failed to update wishlist', 'error');
        }
    }

    /**
     * Update wishlist button state
     */
    updateWishlistButton(productId, isInWishlist) {
        const buttons = document.querySelectorAll(`[data-product-id="${productId}"] .product-card-wishlist`);
        buttons.forEach(button => {
            const icon = button.querySelector('i');
            if (icon) {
                if (isInWishlist) {
                    icon.className = 'fas fa-heart';
                    button.classList.add('active');
                } else {
                    icon.className = 'far fa-heart';
                    button.classList.remove('active');
                }
            }
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', Helpers.debounce((e) => {
                this.searchProducts(e.target.value);
            }, 500));
        }

        // Sort functionality
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortProducts(e.target.value);
            });
        }

        // Filter functionality
        const filterForm = document.querySelector('.filter-form');
        if (filterForm) {
            filterForm.addEventListener('change', Helpers.debounce(() => {
                this.applyFiltersFromForm();
            }, 300));
        }

        // View controls
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.changeView(e.target.dataset.view);
            });
        });
    }

    /**
     * Apply filters from form inputs
     */
    applyFiltersFromForm() {
        const filters = {};

        // Get category filters
        const categoryCheckboxes = document.querySelectorAll('input[name="category"]:checked');
        if (categoryCheckboxes.length > 0) {
            filters.category = Array.from(categoryCheckboxes).map(cb => cb.value);
        }

        // Get brand filters
        const brandCheckboxes = document.querySelectorAll('input[name="brand"]:checked');
        if (brandCheckboxes.length > 0) {
            filters.brand = Array.from(brandCheckboxes).map(cb => cb.value);
        }

        // Get price filter
        const priceSlider = document.getElementById('price-slider');
        if (priceSlider && priceSlider.value !== priceSlider.max) {
            filters.maxPrice = priceSlider.value;
        }

        // Get rating filter
        const ratingRadio = document.querySelector('input[name="rating"]:checked');
        if (ratingRadio) {
            filters.rating = ratingRadio.value;
        }

        this.filterProducts(filters);
    }

    /**
     * Change view mode (grid/list)
     */
    changeView(mode) {
        const productsGrid = document.getElementById('products-grid');
        const viewButtons = document.querySelectorAll('.view-btn');

        if (productsGrid) {
            productsGrid.className = `products-${mode}`;
        }

        viewButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.view === mode);
        });

        // Save view preference
        localStorage.setItem('productsViewMode', mode);
    }

    /**
     * Load view mode preference
     */
    loadViewModePreference() {
        const savedMode = localStorage.getItem('productsViewMode') || 'grid';
        this.changeView(savedMode);
    }
}

// Initialize product display
const productDisplay = new ProductDisplay();

// Make product display available globally
window.productDisplay = productDisplay;

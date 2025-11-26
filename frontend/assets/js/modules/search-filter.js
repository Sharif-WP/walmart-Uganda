/**
 * Search and Filter Manager for Walmart Uganda Ecommerce Platform
 * Handles advanced search, filtering, and product discovery
 */

class SearchFilter {
    constructor() {
        this.searchQuery = '';
        this.activeFilters = {};
        this.searchResults = [];
        this.categories = [];
        this.brands = [];
        this.priceRange = { min: 0, max: 1000 };
        this.init();
    }

    /**
     * Initialize search and filter
     */
    async init() {
        await this.loadCategories();
        await this.loadBrands();
        this.setupEventListeners();
        this.initializeSearch();
    }

    /**
     * Load product categories
     */
    async loadCategories() {
        try {
            const response = await apiClient.getCategories();
            this.categories = response.data || [];
            this.renderCategoryFilters();
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    /**
     * Load product brands
     */
    async loadBrands() {
        try {
            // This would typically come from an API endpoint
            // For now, we'll use a static list
            this.brands = [
                { id: 1, name: 'Samsung', product_count: 45 },
                { id: 2, name: 'Apple', product_count: 32 },
                { id: 3, name: 'Nike', product_count: 28 },
                { id: 4, name: 'Adidas', product_count: 25 },
                { id: 5, name: 'Sony', product_count: 22 },
                { id: 6, name: 'LG', product_count: 18 },
                { id: 7, name: 'HP', product_count: 15 },
                { id: 8, name: 'Dell', product_count: 12 }
            ];
            this.renderBrandFilters();
        } catch (error) {
            console.error('Error loading brands:', error);
        }
    }

    /**
     * Initialize search from URL parameters
     */
    initializeSearch() {
        const urlParams = Helpers.getQueryParams();

        // Get search query from URL
        if (urlParams.search) {
            this.searchQuery = decodeURIComponent(urlParams.search);
            this.performSearch(this.searchQuery);
        }

        // Get filters from URL
        if (urlParams.category) {
            this.activeFilters.category = urlParams.category.split(',');
        }

        if (urlParams.brand) {
            this.activeFilters.brand = urlParams.brand.split(',');
        }

        if (urlParams.maxPrice) {
            this.activeFilters.maxPrice = parseFloat(urlParams.maxPrice);
        }

        if (urlParams.rating) {
            this.activeFilters.rating = parseFloat(urlParams.rating);
        }

        // Apply initial filters
        this.applyFilters();
    }

    /**
     * Perform search
     */
    async performSearch(query, filters = {}) {
        this.searchQuery = query.trim();

        if (this.searchQuery === '') {
            // If empty search, show all products
            productDisplay.filteredProducts = [...productDisplay.products];
            productDisplay.renderProducts();
            return;
        }

        try {
            Helpers.showToast(`Searching for "${this.searchQuery}"...`, 'info');

            const searchFilters = { ...this.activeFilters, ...filters };
            const response = await apiClient.searchProducts(this.searchQuery, searchFilters);

            this.searchResults = response.data || [];
            productDisplay.filteredProducts = this.searchResults;
            productDisplay.renderProducts();

            // Update URL with search query
            this.updateSearchURL();

            Helpers.showToast(`Found ${this.searchResults.length} results for "${this.searchQuery}"`, 'success');

        } catch (error) {
            console.error('Search error:', error);
            Helpers.showToast('Search failed. Please try again.', 'error');
        }
    }

    /**
     * Apply filters to current search or product list
     */
    applyFilters(filters = {}) {
        this.activeFilters = { ...this.activeFilters, ...filters };

        if (this.searchQuery) {
            // Apply filters to search results
            this.performSearch(this.searchQuery, this.activeFilters);
        } else {
            // Apply filters to all products
            productDisplay.filterProducts(this.activeFilters);
        }

        this.updateFilterUI();
        this.updateSearchURL();
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this.activeFilters = {};
        this.searchQuery = '';

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

        // Reset product display
        productDisplay.clearFilters();

        // Update URL
        this.updateSearchURL();

        Helpers.showToast('All filters cleared', 'info');
    }

    /**
     * Update search URL with current parameters
     */
    updateSearchURL() {
        const params = {};

        if (this.searchQuery) {
            params.search = this.searchQuery;
        }

        if (this.activeFilters.category && this.activeFilters.category.length > 0) {
            params.category = this.activeFilters.category.join(',');
        }

        if (this.activeFilters.brand && this.activeFilters.brand.length > 0) {
            params.brand = this.activeFilters.brand.join(',');
        }

        if (this.activeFilters.maxPrice) {
            params.maxPrice = this.activeFilters.maxPrice;
        }

        if (this.activeFilters.rating) {
            params.rating = this.activeFilters.rating;
        }

        Helpers.updateQueryParams(params);
    }

    /**
     * Render category filters
     */
    renderCategoryFilters() {
        const categoryContainer = document.querySelector('.filter-options[data-type="category"]');
        if (!categoryContainer) return;

        const categoriesHTML = this.categories.map(category => `
            <label class="filter-option">
                <input type="checkbox" name="category" value="${category.id}"
                       ${this.activeFilters.category?.includes(category.id.toString()) ? 'checked' : ''}>
                <span class="filter-label">${Helpers.sanitizeHTML(category.name)}</span>
                <span class="filter-count">(${category.product_count || 0})</span>
            </label>
        `).join('');

        categoryContainer.innerHTML = categoriesHTML;
    }

    /**
     * Render brand filters
     */
    renderBrandFilters() {
        const brandContainer = document.querySelector('.filter-options[data-type="brand"]');
        if (!brandContainer) return;

        const brandsHTML = this.brands.map(brand => `
            <label class="filter-option">
                <input type="checkbox" name="brand" value="${brand.id}"
                       ${this.activeFilters.brand?.includes(brand.id.toString()) ? 'checked' : ''}>
                <span class="filter-label">${Helpers.sanitizeHTML(brand.name)}</span>
                <span class="filter-count">(${brand.product_count})</span>
            </label>
        `).join('');

        brandContainer.innerHTML = brandsHTML;
    }

    /**
     * Update filter UI based on active filters
     */
    updateFilterUI() {
        this.updateActiveFiltersDisplay();
        this.updatePriceRangeDisplay();
        this.updateFilterButtons();
    }

    /**
     * Update active filters display
     */
    updateActiveFiltersDisplay() {
        const activeFiltersContainer = document.getElementById('active-filters');
        if (!activeFiltersContainer) return;

        const activeFilters = [];

        // Category filters
        if (this.activeFilters.category && this.activeFilters.category.length > 0) {
            this.activeFilters.category.forEach(categoryId => {
                const category = this.categories.find(c => c.id.toString() === categoryId);
                if (category) {
                    activeFilters.push({
                        type: 'category',
                        value: categoryId,
                        label: category.name,
                        remove: () => this.removeFilter('category', categoryId)
                    });
                }
            });
        }

        // Brand filters
        if (this.activeFilters.brand && this.activeFilters.brand.length > 0) {
            this.activeFilters.brand.forEach(brandId => {
                const brand = this.brands.find(b => b.id.toString() === brandId);
                if (brand) {
                    activeFilters.push({
                        type: 'brand',
                        value: brandId,
                        label: brand.name,
                        remove: () => this.removeFilter('brand', brandId)
                    });
                }
            });
        }

        // Price filter
        if (this.activeFilters.maxPrice && this.activeFilters.maxPrice < this.priceRange.max) {
            activeFilters.push({
                type: 'price',
                value: this.activeFilters.maxPrice,
                label: `Under ${Helpers.formatCurrency(this.activeFilters.maxPrice)}`,
                remove: () => this.removeFilter('maxPrice')
            });
        }

        // Rating filter
        if (this.activeFilters.rating) {
            activeFilters.push({
                type: 'rating',
                value: this.activeFilters.rating,
                label: `${this.activeFilters.rating}★ & above`,
                remove: () => this.removeFilter('rating')
            });
        }

        // Render active filters
        if (activeFilters.length > 0) {
            activeFiltersContainer.innerHTML = `
                <div class="active-filters-header">
                    <span>Active Filters:</span>
                    <button class="clear-all-filters" onclick="searchFilter.clearFilters()">Clear All</button>
                </div>
                <div class="active-filters-list">
                    ${activeFilters.map(filter => `
                        <div class="active-filter-tag">
                            <span>${filter.label}</span>
                            <button class="remove-filter" onclick="${filter.remove}">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
            activeFiltersContainer.style.display = 'block';
        } else {
            activeFiltersContainer.style.display = 'none';
        }
    }

    /**
     * Remove specific filter
     */
    removeFilter(filterType, value = null) {
        if (value && this.activeFilters[filterType]) {
            if (Array.isArray(this.activeFilters[filterType])) {
                this.activeFilters[filterType] = this.activeFilters[filterType].filter(v => v !== value);
                if (this.activeFilters[filterType].length === 0) {
                    delete this.activeFilters[filterType];
                }
            }
        } else {
            delete this.activeFilters[filterType];
        }

        this.applyFilters();
    }

    /**
     * Update price range display
     */
    updatePriceRangeDisplay() {
        const priceSlider = document.getElementById('price-slider');
        const rangeValues = document.querySelector('.range-values');

        if (priceSlider && rangeValues) {
            const maxPrice = this.activeFilters.maxPrice || this.priceRange.max;
            priceSlider.value = maxPrice;

            const minValue = rangeValues.querySelector('span:first-child');
            const maxValue = rangeValues.querySelector('span:last-child');

            if (minValue) minValue.textContent = Helpers.formatCurrency(this.priceRange.min);
            if (maxValue) maxValue.textContent = Helpers.formatCurrency(maxPrice);
        }
    }

    /**
     * Update filter buttons state
     */
    updateFilterButtons() {
        const applyBtn = document.querySelector('.btn-apply-filters');
        const clearBtn = document.querySelector('.btn-clear-filters');

        const hasActiveFilters = Object.keys(this.activeFilters).length > 0;

        if (clearBtn) {
            clearBtn.disabled = !hasActiveFilters;
        }
    }

    /**
     * Setup event listeners for search and filter
     */
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            // Set initial value from URL
            if (this.searchQuery) {
                searchInput.value = this.searchQuery;
            }

            searchInput.addEventListener('input', Helpers.debounce((e) => {
                this.performSearch(e.target.value);
            }, 500));

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        }

        // Filter form changes
        const filterForm = document.querySelector('.filter-form');
        if (filterForm) {
            filterForm.addEventListener('change', Helpers.debounce(() => {
                this.handleFilterChange();
            }, 300));
        }

        // Price range slider
        const priceSlider = document.getElementById('price-slider');
        if (priceSlider) {
            priceSlider.addEventListener('input', Helpers.debounce(() => {
                this.handlePriceRangeChange(priceSlider.value);
            }, 500));
        }

        // Mobile filter toggle
        const mobileFilterBtn = document.getElementById('mobile-filter-btn');
        const filterSidebar = document.querySelector('.filter-sidebar');

        if (mobileFilterBtn && filterSidebar) {
            mobileFilterBtn.addEventListener('click', () => {
                filterSidebar.classList.toggle('active');
            });
        }

        // Search suggestions
        this.setupSearchSuggestions();
    }

    /**
     * Handle filter form changes
     */
    handleFilterChange() {
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

        // Get rating filter
        const ratingRadio = document.querySelector('input[name="rating"]:checked');
        if (ratingRadio) {
            filters.rating = ratingRadio.value;
        }

        this.applyFilters(filters);
    }

    /**
     * Handle price range change
     */
    handlePriceRangeChange(value) {
        const maxPrice = parseFloat(value);
        if (maxPrice < this.priceRange.max) {
            this.applyFilters({ maxPrice });
        } else {
            this.removeFilter('maxPrice');
        }
    }

    /**
     * Setup search suggestions
     */
    setupSearchSuggestions() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        let suggestionsContainer = document.getElementById('search-suggestions');
        if (!suggestionsContainer) {
            suggestionsContainer = document.createElement('div');
            suggestionsContainer.id = 'search-suggestions';
            suggestionsContainer.className = 'search-suggestions';
            searchInput.parentNode.appendChild(suggestionsContainer);
        }

        searchInput.addEventListener('input', Helpers.debounce(async (e) => {
            const query = e.target.value.trim();

            if (query.length < 2) {
                suggestionsContainer.style.display = 'none';
                return;
            }

            try {
                const response = await apiClient.searchProducts(query, { limit: 5 });
                const suggestions = response.data || [];

                if (suggestions.length > 0) {
                    this.showSearchSuggestions(suggestions, query);
                } else {
                    suggestionsContainer.style.display = 'none';
                }
            } catch (error) {
                console.error('Error fetching search suggestions:', error);
                suggestionsContainer.style.display = 'none';
            }
        }, 300));

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                suggestionsContainer.style.display = 'none';
            }
        });
    }

    /**
     * Show search suggestions
     */
    showSearchSuggestions(suggestions, query) {
        const suggestionsContainer = document.getElementById('search-suggestions');
        if (!suggestionsContainer) return;

        const suggestionsHTML = `
            <div class="suggestions-list">
                ${suggestions.map(product => `
                    <div class="suggestion-item" onclick="searchFilter.selectSuggestion(${product.id}, '${Helpers.sanitizeHTML(product.name)}')">
                        <div class="suggestion-image">
                            <img src="${product.image || 'assets/images/products/placeholder.jpg'}" alt="${Helpers.sanitizeHTML(product.name)}">
                        </div>
                        <div class="suggestion-details">
                            <div class="suggestion-name">${this.highlightText(Helpers.sanitizeHTML(product.name), query)}</div>
                            <div class="suggestion-price">${Helpers.formatCurrency(product.price)}</div>
                        </div>
                    </div>
                `).join('')}
                <div class="suggestion-footer">
                    <a href="shop.html?search=${encodeURIComponent(query)}" class="view-all-results">
                        View all results for "${Helpers.sanitizeHTML(query)}"
                    </a>
                </div>
            </div>
        `;

        suggestionsContainer.innerHTML = suggestionsHTML;
        suggestionsContainer.style.display = 'block';
    }

    /**
     * Highlight matching text in suggestions
     */
    highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    /**
     * Select search suggestion
     */
    selectSuggestion(productId, productName) {
        window.location.href = `product-detail.html?id=${productId}`;
    }

    /**
     * Advanced search with multiple criteria
     */
    async advancedSearch(criteria) {
        try {
            const { query, category, brand, priceRange, inStock, sortBy } = criteria;

            const filters = {};
            if (category) filters.category = category;
            if (brand) filters.brand = brand;
            if (priceRange) filters.maxPrice = priceRange.max;
            if (inStock) filters.inStock = true;

            const response = await apiClient.searchProducts(query, filters);
            this.searchResults = response.data || [];

            // Apply sorting
            if (sortBy) {
                this.sortSearchResults(sortBy);
            }

            return this.searchResults;

        } catch (error) {
            console.error('Advanced search error:', error);
            throw error;
        }
    }

    /**
     * Sort search results
     */
    sortSearchResults(sortBy) {
        switch (sortBy) {
            case 'relevance':
                // Keep original order (relevance from API)
                break;
            case 'price-low':
                this.searchResults.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.searchResults.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                this.searchResults.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'rating':
                this.searchResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
        }
    }

    /**
     * Get search analytics (for admin purposes)
     */
    getSearchAnalytics() {
        return {
            totalSearches: localStorage.getItem('total_searches') || 0,
            popularSearches: this.getPopularSearches(),
            searchConversion: this.calculateSearchConversion()
        };
    }

    /**
     * Get popular searches
     */
    getPopularSearches() {
        const searchHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
        const searchCounts = {};

        searchHistory.forEach(term => {
            searchCounts[term] = (searchCounts[term] || 0) + 1;
        });

        return Object.entries(searchCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([term, count]) => ({ term, count }));
    }

    /**
     * Calculate search conversion rate
     */
    calculateSearchConversion() {
        // This would typically come from analytics data
        // For now, return a simulated conversion rate
        return {
            searches: 1250,
            clicks: 890,
            purchases: 234,
            conversionRate: '18.7%'
        };
    }
}

// Initialize search filter
const searchFilter = new SearchFilter();

// Make search filter available globally
window.searchFilter = searchFilter;

/**
 * API Client for Walmart Uganda Ecommerce Platform
 * Handles all API communication with the backend
 */

class ApiClient {
    constructor() {
        this.baseURL = 'http://localhost/walmart-uganda/backend/api/v1';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    /**
     * Set authentication token
     */
    setAuthToken(token) {
        if (token) {
            this.defaultHeaders['Authorization'] = `Bearer ${token}`;
        } else {
            delete this.defaultHeaders['Authorization'];
        }
    }

    /**
     * Get auth token from localStorage
     */
    getAuthToken() {
        const user = Helpers.getCurrentUser();
        return user ? user.token : null;
    }

    /**
     * Make API request
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const token = this.getAuthToken();

        const config = {
            headers: {
                ...this.defaultHeaders,
                ...options.headers
            },
            ...options
        };

        if (token && !config.headers['Authorization']) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            return await this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Handle API response
     */
    async handleResponse(response) {
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const error = new Error(data.message || `HTTP error! status: ${response.status}`);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    }

    /**
     * Handle API error
     */
    handleError(error) {
        console.error('API Error:', error);

        if (error.status === 401) {
            // Unauthorized - clear user data and redirect to login
            Helpers.removeCurrentUser();
            window.location.href = '/frontend/login.html';
            return;
        }

        throw error;
    }

    // PRODUCT API METHODS

    /**
     * Get all products with pagination and filters
     */
    async getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/products?${queryString}`);
    }

    /**
     * Get single product by ID
     */
    async getProduct(id) {
        return await this.request(`/products/${id}`);
    }

    /**
     * Search products
     */
    async searchProducts(query, params = {}) {
        return await this.request(`/products/search?q=${encodeURIComponent(query)}&${new URLSearchParams(params)}`);
    }

    /**
     * Get products by category
     */
    async getProductsByCategory(categoryId, params = {}) {
        return await this.request(`/categories/${categoryId}/products?${new URLSearchParams(params)}`);
    }

    /**
     * Get featured products
     */
    async getFeaturedProducts(limit = 8) {
        return await this.request(`/products/featured?limit=${limit}`);
    }

    /**
     * Get related products
     */
    async getRelatedProducts(productId, limit = 4) {
        return await this.request(`/products/${productId}/related?limit=${limit}`);
    }

    // CATEGORY API METHODS

    /**
     * Get all categories
     */
    async getCategories() {
        return await this.request('/categories');
    }

    /**
     * Get single category
     */
    async getCategory(id) {
        return await this.request(`/categories/${id}`);
    }

    // AUTH API METHODS

    /**
     * User login
     */
    async login(credentials) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        if (response.data && response.data.token) {
            this.setAuthToken(response.data.token);
            Helpers.setCurrentUser(response.data);
        }

        return response;
    }

    /**
     * User registration
     */
    async register(userData) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (response.data && response.data.token) {
            this.setAuthToken(response.data.token);
            Helpers.setCurrentUser(response.data);
        }

        return response;
    }

    /**
     * User logout
     */
    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.setAuthToken(null);
            Helpers.removeCurrentUser();
        }
    }

    /**
     * Get user profile
     */
    async getProfile() {
        return await this.request('/auth/profile');
    }

    /**
     * Update user profile
     */
    async updateProfile(profileData) {
        return await this.request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    // CART API METHODS

    /**
     * Get user cart
     */
    async getCart() {
        if (!Helpers.isLoggedIn()) {
            // Return local cart for guests
            return this.getLocalCart();
        }
        return await this.request('/cart');
    }

    /**
     * Add item to cart
     */
    async addToCart(productId, quantity = 1, variants = {}) {
        const cartData = { product_id: productId, quantity, variants };

        if (!Helpers.isLoggedIn()) {
            // Store in localStorage for guests
            return this.addToLocalCart(cartData);
        }

        return await this.request('/cart/items', {
            method: 'POST',
            body: JSON.stringify(cartData)
        });
    }

    /**
     * Update cart item quantity
     */
    async updateCartItem(itemId, quantity) {
        if (!Helpers.isLoggedIn()) {
            // Update local cart for guests
            return this.updateLocalCartItem(itemId, quantity);
        }

        return await this.request(`/cart/items/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity })
        });
    }

    /**
     * Remove item from cart
     */
    async removeFromCart(itemId) {
        if (!Helpers.isLoggedIn()) {
            // Remove from local cart for guests
            return this.removeFromLocalCart(itemId);
        }

        return await this.request(`/cart/items/${itemId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Clear cart
     */
    async clearCart() {
        if (!Helpers.isLoggedIn()) {
            // Clear local cart for guests
            return this.clearLocalCart();
        }

        return await this.request('/cart', {
            method: 'DELETE'
        });
    }

    // LOCAL CART METHODS (for guest users)

    getLocalCart() {
        try {
            return JSON.parse(localStorage.getItem('guest_cart')) || { items: [], total: 0 };
        } catch {
            return { items: [], total: 0 };
        }
    }

    addToLocalCart(cartData) {
        const cart = this.getLocalCart();
        const existingItem = cart.items.find(item =>
            item.product_id === cartData.product_id &&
            JSON.stringify(item.variants) === JSON.stringify(cartData.variants)
        );

        if (existingItem) {
            existingItem.quantity += cartData.quantity;
        } else {
            cart.items.push({
                id: Helpers.generateId('cart_'),
                ...cartData,
                added_at: new Date().toISOString()
            });
        }

        this.updateLocalCartTotal(cart);
        localStorage.setItem('guest_cart', JSON.stringify(cart));
        return { success: true, data: cart };
    }

    updateLocalCartItem(itemId, quantity) {
        const cart = this.getLocalCart();
        const item = cart.items.find(item => item.id === itemId);

        if (item) {
            if (quantity <= 0) {
                cart.items = cart.items.filter(item => item.id !== itemId);
            } else {
                item.quantity = quantity;
            }
        }

        this.updateLocalCartTotal(cart);
        localStorage.setItem('guest_cart', JSON.stringify(cart));
        return { success: true, data: cart };
    }

    removeFromLocalCart(itemId) {
        const cart = this.getLocalCart();
        cart.items = cart.items.filter(item => item.id !== itemId);
        this.updateLocalCartTotal(cart);
        localStorage.setItem('guest_cart', JSON.stringify(cart));
        return { success: true, data: cart };
    }

    clearLocalCart() {
        localStorage.setItem('guest_cart', JSON.stringify({ items: [], total: 0 }));
        return { success: true, data: { items: [], total: 0 } };
    }

    updateLocalCartTotal(cart) {
        cart.total = cart.items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
    }

    // ORDER API METHODS

    /**
     * Create order
     */
    async createOrder(orderData) {
        return await this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    /**
     * Get user orders
     */
    async getOrders(params = {}) {
        return await this.request(`/orders?${new URLSearchParams(params)}`);
    }

    /**
     * Get single order
     */
    async getOrder(orderId) {
        return await this.request(`/orders/${orderId}`);
    }

    /**
     * Cancel order
     */
    async cancelOrder(orderId) {
        return await this.request(`/orders/${orderId}/cancel`, {
            method: 'POST'
        });
    }

    // WISHLIST API METHODS

    /**
     * Get user wishlist
     */
    async getWishlist() {
        if (!Helpers.isLoggedIn()) {
            return this.getLocalWishlist();
        }
        return await this.request('/wishlist');
    }

    /**
     * Add item to wishlist
     */
    async addToWishlist(productId) {
        if (!Helpers.isLoggedIn()) {
            return this.addToLocalWishlist(productId);
        }

        return await this.request('/wishlist/items', {
            method: 'POST',
            body: JSON.stringify({ product_id: productId })
        });
    }

    /**
     * Remove item from wishlist
     */
    async removeFromWishlist(productId) {
        if (!Helpers.isLoggedIn()) {
            return this.removeFromLocalWishlist(productId);
        }

        return await this.request(`/wishlist/items/${productId}`, {
            method: 'DELETE'
        });
    }

    // LOCAL WISHLIST METHODS (for guest users)

    getLocalWishlist() {
        try {
            return JSON.parse(localStorage.getItem('guest_wishlist')) || { items: [] };
        } catch {
            return { items: [] };
        }
    }

    addToLocalWishlist(productId) {
        const wishlist = this.getLocalWishlist();
        if (!wishlist.items.includes(productId)) {
            wishlist.items.push(productId);
            localStorage.setItem('guest_wishlist', JSON.stringify(wishlist));
        }
        return { success: true, data: wishlist };
    }

    removeFromLocalWishlist(productId) {
        const wishlist = this.getLocalWishlist();
        wishlist.items = wishlist.items.filter(id => id !== productId);
        localStorage.setItem('guest_wishlist', JSON.stringify(wishlist));
        return { success: true, data: wishlist };
    }

    // REVIEW API METHODS

    /**
     * Get product reviews
     */
    async getProductReviews(productId, params = {}) {
        return await this.request(`/products/${productId}/reviews?${new URLSearchParams(params)}`);
    }

    /**
     * Create review
     */
    async createReview(reviewData) {
        return await this.request('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    }

    /**
     * Get user reviews
     */
    async getUserReviews() {
        return await this.request('/user/reviews');
    }

    // PAYMENT API METHODS

    /**
     * Process payment
     */
    async processPayment(paymentData) {
        return await this.request('/payments/process', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    }

    /**
     * Get payment methods
     */
    async getPaymentMethods() {
        return await this.request('/payments/methods');
    }
}

// Initialize API client with auth token
const apiClient = new ApiClient();

// Set initial auth token if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    const token = apiClient.getAuthToken();
    if (token) {
        apiClient.setAuthToken(token);
    }
});

// Make API client available globally
window.apiClient = apiClient;

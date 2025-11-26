/**
 * Cart Manager for Walmart Uganda Ecommerce Platform
 * Handles shopping cart functionality including add, remove, update, and persistence
 */

class CartManager {
    constructor() {
        this.cart = {
            items: [],
            total: 0,
            itemCount: 0,
            discount: 0,
            tax: 0,
            finalTotal: 0
        };
        this.init();
    }

    /**
     * Initialize cart manager
     */
    async init() {
        await this.loadCart();
        this.updateCartUI();
        this.setupEventListeners();
    }

    /**
     * Load cart from API or localStorage
     */
    async loadCart() {
        try {
            if (Helpers.isLoggedIn()) {
                const response = await apiClient.getCart();
                this.cart = response.data || { items: [], total: 0, itemCount: 0 };
            } else {
                // Load from localStorage for guest users
                this.loadFromLocalStorage();
            }
            this.calculateTotals();
        } catch (error) {
            console.error('Error loading cart:', error);
            this.cart = { items: [], total: 0, itemCount: 0 };
        }
    }

    /**
     * Add product to cart
     */
    async addToCart(productId, quantity = 1, variants = {}) {
        try {
            // Validate quantity
            const quantityValidation = Validators.validateQuantity(quantity);
            if (!quantityValidation.isValid) {
                Helpers.showToast(quantityValidation.message, 'error');
                return false;
            }

            // Get product details
            const productResponse = await apiClient.getProduct(productId);
            const product = productResponse.data;

            if (!product) {
                Helpers.showToast('Product not found', 'error');
                return false;
            }

            // Check stock availability
            if (product.stock_quantity < quantity) {
                Helpers.showToast(`Only ${product.stock_quantity} items available in stock`, 'error');
                return false;
            }

            // Prepare cart item
            const cartItem = {
                id: Helpers.generateId('cart_'),
                product_id: productId,
                name: product.name,
                price: product.price,
                original_price: product.cost_price,
                image: product.image,
                category: product.category_name,
                quantity: quantity,
                variants: variants,
                max_stock: product.stock_quantity
            };

            // Add to cart
            const response = await apiClient.addToCart(productId, quantity, variants);

            if (response.success) {
                this.cart = response.data;
                this.calculateTotals();
                this.updateCartUI();

                Helpers.showToast('Product added to cart!', 'success');
                this.animateAddToCart(productId);
                return true;
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            Helpers.showToast('Failed to add product to cart', 'error');
            return false;
        }
    }

    /**
     * Update cart item quantity
     */
    async updateQuantity(itemId, newQuantity) {
        try {
            // Validate quantity
            const quantityValidation = Validators.validateQuantity(newQuantity);
            if (!quantityValidation.isValid) {
                Helpers.showToast(quantityValidation.message, 'error');
                return false;
            }

            // Find item to check stock
            const item = this.cart.items.find(item => item.id === itemId);
            if (item && newQuantity > item.max_stock) {
                Helpers.showToast(`Only ${item.max_stock} items available in stock`, 'error');
                return false;
            }

            const response = await apiClient.updateCartItem(itemId, newQuantity);

            if (response.success) {
                this.cart = response.data;
                this.calculateTotals();
                this.updateCartUI();

                Helpers.showToast('Cart updated', 'success');
                return true;
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            Helpers.showToast('Failed to update cart', 'error');
            return false;
        }
    }

    /**
     * Remove item from cart
     */
    async removeFromCart(itemId) {
        try {
            const response = await apiClient.removeFromCart(itemId);

            if (response.success) {
                this.cart = response.data;
                this.calculateTotals();
                this.updateCartUI();

                Helpers.showToast('Item removed from cart', 'success');
                return true;
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            Helpers.showToast('Failed to remove item from cart', 'error');
            return false;
        }
    }

    /**
     * Clear entire cart
     */
    async clearCart() {
        try {
            const response = await apiClient.clearCart();

            if (response.success) {
                this.cart = { items: [], total: 0, itemCount: 0, discount: 0, tax: 0, finalTotal: 0 };
                this.updateCartUI();

                Helpers.showToast('Cart cleared', 'success');
                return true;
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
            Helpers.showToast('Failed to clear cart', 'error');
            return false;
        }
    }

    /**
     * Calculate cart totals
     */
    calculateTotals() {
        this.cart.itemCount = this.cart.items.reduce((total, item) => total + item.quantity, 0);
        this.cart.total = this.cart.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        // Calculate discounts
        this.cart.discount = this.cart.items.reduce((total, item) => {
            if (item.original_price && item.original_price > item.price) {
                return total + (item.original_price - item.price) * item.quantity;
            }
            return total;
        }, 0);

        // Apply coupon discount if any
        if (this.cart.couponDiscount) {
            this.cart.discount += this.cart.couponDiscount;
        }

        // Calculate tax (18% VAT for Uganda)
        this.cart.tax = (this.cart.total - this.cart.discount) * 0.18;

        // Calculate final total
        this.cart.finalTotal = this.cart.total - this.cart.discount + this.cart.tax;
    }

    /**
     * Update cart UI across the application
     */
    updateCartUI() {
        // Update cart count in header
        const cartCountElements = document.querySelectorAll('#cart-count');
        cartCountElements.forEach(element => {
            element.textContent = this.cart.itemCount;
        });

        // Update cart page if open
        this.updateCartPage();

        // Update checkout page if open
        this.updateCheckoutPage();

        // Save to localStorage for persistence
        this.saveToLocalStorage();
    }

    /**
     * Update cart page content
     */
    updateCartPage() {
        const cartPage = document.getElementById('cart-items');
        const emptyCart = document.getElementById('empty-cart');
        const cartActions = document.getElementById('cart-actions');
        const cartSummary = document.getElementById('cart-summary');

        if (!cartPage) return;

        if (this.cart.items.length === 0) {
            if (emptyCart) emptyCart.style.display = 'block';
            if (cartPage) cartPage.style.display = 'none';
            if (cartActions) cartActions.style.display = 'none';
            return;
        }

        if (emptyCart) emptyCart.style.display = 'none';
        if (cartPage) cartPage.style.display = 'block';
        if (cartActions) cartActions.style.display = 'flex';

        // Render cart items
        if (cartPage) {
            cartPage.innerHTML = this.cart.items.map(item => this.renderCartItem(item)).join('');
        }

        // Update summary
        if (cartSummary) {
            this.updateCartSummary();
        }
    }

    /**
     * Render individual cart item
     */
    renderCartItem(item) {
        const discount = item.original_price ? Helpers.calculateDiscount(item.original_price, item.price) : 0;

        return `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image || 'assets/images/products/placeholder.jpg'}" alt="${Helpers.sanitizeHTML(item.name)}" loading="lazy">
                </div>
                <div class="cart-item-details">
                    <a href="product-detail.html?id=${item.product_id}" class="cart-item-name">${Helpers.sanitizeHTML(item.name)}</a>
                    <div class="cart-item-category">${item.category || 'General'}</div>
                    ${item.variants && Object.keys(item.variants).length > 0 ? `
                        <div class="cart-item-variants">
                            ${Object.entries(item.variants).map(([key, value]) => `
                                <span class="variant">${key}: ${value}</span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="cart-item-price">
                    <div class="current-price">${Helpers.formatCurrency(item.price)}</div>
                    ${discount > 0 ? `
                        <div class="original-price">${Helpers.formatCurrency(item.original_price)}</div>
                        <div class="discount">-${discount}%</div>
                    ` : ''}
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="cartManager.decreaseQuantity('${item.id}')">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="${item.max_stock}"
                           onchange="cartManager.updateQuantityFromInput('${item.id}', this.value)">
                    <button class="quantity-btn" onclick="cartManager.increaseQuantity('${item.id}')">+</button>
                </div>
                <button class="cart-item-remove" onclick="cartManager.removeFromCart('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }

    /**
     * Update cart summary
     */
    updateCartSummary() {
        const elements = {
            subtotal: document.getElementById('subtotal'),
            shipping: document.getElementById('shipping'),
            tax: document.getElementById('tax'),
            discount: document.getElementById('discount'),
            total: document.getElementById('total')
        };

        const shippingCost = this.cart.total > 100 ? 0 : 10;
        const finalTotal = this.cart.finalTotal + shippingCost;

        if (elements.subtotal) elements.subtotal.textContent = Helpers.formatCurrency(this.cart.total);
        if (elements.shipping) elements.shipping.textContent = shippingCost === 0 ? 'FREE' : Helpers.formatCurrency(shippingCost);
        if (elements.tax) elements.tax.textContent = Helpers.formatCurrency(this.cart.tax);
        if (elements.discount) elements.discount.textContent = `-${Helpers.formatCurrency(this.cart.discount)}`;
        if (elements.total) elements.total.textContent = Helpers.formatCurrency(finalTotal);

        // Enable/disable checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = this.cart.items.length === 0;
        }
    }

    /**
     * Update checkout page
     */
    updateCheckoutPage() {
        const checkoutItems = document.getElementById('checkout-items');
        const checkoutSummary = document.getElementById('checkout-summary');

        if (checkoutItems) {
            checkoutItems.innerHTML = this.cart.items.map(item => this.renderCheckoutItem(item)).join('');
        }

        if (checkoutSummary) {
            this.updateCheckoutSummary();
        }
    }

    /**
     * Render checkout item
     */
    renderCheckoutItem(item) {
        return `
            <div class="order-item">
                <div class="order-item-image">
                    <img src="${item.image || 'assets/images/products/placeholder.jpg'}" alt="${Helpers.sanitizeHTML(item.name)}">
                </div>
                <div class="order-item-details">
                    <div class="order-item-name">${Helpers.sanitizeHTML(item.name)}</div>
                    <div class="order-item-price">${Helpers.formatCurrency(item.price)}</div>
                    <div class="order-item-quantity">Qty: ${item.quantity}</div>
                </div>
            </div>
        `;
    }

    /**
     * Update checkout summary
     */
    updateCheckoutSummary() {
        const elements = {
            subtotal: document.getElementById('checkout-subtotal'),
            shipping: document.getElementById('checkout-shipping'),
            tax: document.getElementById('checkout-tax'),
            discount: document.getElementById('checkout-discount'),
            total: document.getElementById('checkout-total')
        };

        const shippingCost = this.cart.total > 100 ? 0 : 10;
        const finalTotal = this.cart.finalTotal + shippingCost;

        if (elements.subtotal) elements.subtotal.textContent = Helpers.formatCurrency(this.cart.total);
        if (elements.shipping) elements.shipping.textContent = shippingCost === 0 ? 'FREE' : Helpers.formatCurrency(shippingCost);
        if (elements.tax) elements.tax.textContent = Helpers.formatCurrency(this.cart.tax);
        if (elements.discount) elements.discount.textContent = `-${Helpers.formatCurrency(this.cart.discount)}`;
        if (elements.total) elements.total.textContent = Helpers.formatCurrency(finalTotal);
    }

    /**
     * Quantity adjustment methods
     */
    async increaseQuantity(itemId) {
        const item = this.cart.items.find(item => item.id === itemId);
        if (item) {
            await this.updateQuantity(itemId, item.quantity + 1);
        }
    }

    async decreaseQuantity(itemId) {
        const item = this.cart.items.find(item => item.id === itemId);
        if (item && item.quantity > 1) {
            await this.updateQuantity(itemId, item.quantity - 1);
        }
    }

    async updateQuantityFromInput(itemId, newQuantity) {
        const quantity = parseInt(newQuantity);
        if (!isNaN(quantity) && quantity > 0) {
            await this.updateQuantity(itemId, quantity);
        }
    }

    /**
     * Apply coupon code
     */
    async applyCoupon(code) {
        try {
            // Validate coupon code
            const validation = Validators.validateCouponCode(code);
            if (!validation.isValid) {
                Helpers.showToast(validation.message, 'error');
                return false;
            }

            // Simulate API call to validate coupon
            // In real application, this would call backend API
            const coupons = {
                'WELCOME10': { discount: 0.1, type: 'percentage', minAmount: 50 },
                'SAVE20': { discount: 20, type: 'fixed', minAmount: 100 },
                'FREESHIP': { discount: 0, type: 'shipping', freeShipping: true }
            };

            const coupon = coupons[code.toUpperCase()];
            if (!coupon) {
                Helpers.showToast('Invalid coupon code', 'error');
                return false;
            }

            // Check minimum amount
            if (coupon.minAmount && this.cart.total < coupon.minAmount) {
                Helpers.showToast(`Minimum order amount of ${Helpers.formatCurrency(coupon.minAmount)} required`, 'error');
                return false;
            }

            // Apply discount
            let discountAmount = 0;
            if (coupon.type === 'percentage') {
                discountAmount = this.cart.total * coupon.discount;
            } else if (coupon.type === 'fixed') {
                discountAmount = Math.min(coupon.discount, this.cart.total);
            }

            if (coupon.freeShipping) {
                this.cart.shippingDiscount = 10; // Free shipping worth $10
            }

            this.cart.couponDiscount = discountAmount;
            this.cart.appliedCoupon = code;
            this.calculateTotals();
            this.updateCartUI();

            Helpers.showToast('Coupon applied successfully!', 'success');
            return true;

        } catch (error) {
            console.error('Error applying coupon:', error);
            Helpers.showToast('Failed to apply coupon', 'error');
            return false;
        }
    }

    /**
     * Remove applied coupon
     */
    removeCoupon() {
        delete this.cart.couponDiscount;
        delete this.cart.shippingDiscount;
        delete this.cart.appliedCoupon;
        this.calculateTotals();
        this.updateCartUI();
        Helpers.showToast('Coupon removed', 'info');
    }

    /**
     * Save cart to localStorage
     */
    saveToLocalStorage() {
        if (!Helpers.isLoggedIn()) {
            localStorage.setItem('walmart_guest_cart', JSON.stringify(this.cart));
        }
    }

    /**
     * Load cart from localStorage
     */
    loadFromLocalStorage() {
        try {
            const savedCart = localStorage.getItem('walmart_guest_cart');
            if (savedCart) {
                this.cart = JSON.parse(savedCart);
                return true;
            }
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
        }
        return false;
    }

    /**
     * Animate add to cart action
     */
    animateAddToCart(productId) {
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        const cartBtn = document.querySelector('.cart-btn');

        if (productCard && cartBtn) {
            const productImage = productCard.querySelector('img');
            const clone = productImage.cloneNode(true);

            const productRect = productImage.getBoundingClientRect();
            const cartRect = cartBtn.getBoundingClientRect();

            clone.style.position = 'fixed';
            clone.style.width = '50px';
            clone.style.height = '50px';
            clone.style.borderRadius = '8px';
            clone.style.objectFit = 'cover';
            clone.style.zIndex = '10000';
            clone.style.left = `${productRect.left}px`;
            clone.style.top = `${productRect.top}px`;
            clone.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';

            document.body.appendChild(clone);

            // Trigger animation
            setTimeout(() => {
                clone.style.left = `${cartRect.left}px`;
                clone.style.top = `${cartRect.top}px`;
                clone.style.width = '20px';
                clone.style.height = '20px';
                clone.style.opacity = '0.5';
            }, 10);

            // Remove clone after animation
            setTimeout(() => {
                if (clone.parentNode) {
                    document.body.removeChild(clone);
                }
            }, 800);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Coupon form submission
        const couponForm = document.getElementById('discount-form');
        if (couponForm) {
            couponForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const codeInput = document.getElementById('coupon-code');
                if (codeInput) {
                    this.applyCoupon(codeInput.value);
                    codeInput.value = '';
                }
            });
        }

        // Clear cart button
        const clearCartBtn = document.querySelector('.btn-clear-cart');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear your cart?')) {
                    this.clearCart();
                }
            });
        }

        // Continue shopping button
        const continueShoppingBtn = document.querySelector('.continue-shopping');
        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'shop.html';
            });
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.cart.items.length > 0) {
                    window.location.href = 'checkout.html';
                } else {
                    Helpers.showToast('Your cart is empty', 'warning');
                }
            });
        }
    }

    /**
     * Get cart summary for order creation
     */
    getOrderSummary() {
        const shippingCost = this.cart.total > 100 ? 0 : 10;
        const finalTotal = this.cart.finalTotal + shippingCost;

        return {
            items: this.cart.items,
            subtotal: this.cart.total,
            tax: this.cart.tax,
            discount: this.cart.discount,
            couponDiscount: this.cart.couponDiscount || 0,
            shipping: shippingCost,
            total: finalTotal,
            itemCount: this.cart.itemCount
        };
    }

    /**
     * Check if cart is empty
     */
    isEmpty() {
        return this.cart.items.length === 0;
    }

    /**
     * Get cart item by product ID
     */
    getItemByProductId(productId) {
        return this.cart.items.find(item => item.product_id === productId);
    }

    /**
     * Get total quantity of a specific product in cart
     */
    getProductQuantity(productId) {
        const item = this.getItemByProductId(productId);
        return item ? item.quantity : 0;
    }

    /**
     * Merge guest cart with user cart after login
     */
    async mergeWithGuestCart(guestCart) {
        try {
            for (const item of guestCart.items) {
                await this.addToCart(item.product_id, item.quantity, item.variants);
            }
            // Clear guest cart after merge
            localStorage.removeItem('walmart_guest_cart');
            return true;
        } catch (error) {
            console.error('Error merging carts:', error);
            return false;
        }
    }
}

// Initialize cart manager
const cartManager = new CartManager();

// Make cart manager available globally
window.cartManager = cartManager;

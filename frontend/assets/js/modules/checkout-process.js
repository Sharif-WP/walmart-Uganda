/**
 * Checkout Process Manager for Walmart Uganda Ecommerce Platform
 * Handles the complete checkout process including shipping, payment, and order confirmation
 */

class CheckoutProcess {
    constructor() {
        this.currentStep = 1;
        this.orderData = {
            shipping: {},
            billing: {},
            payment: {},
            items: [],
            totals: {}
        };
        this.shippingMethods = [];
        this.paymentMethods = [];
        this.init();
    }

    /**
     * Initialize checkout process
     */
    async init() {
        await this.loadCheckoutData();
        this.setupEventListeners();
        this.updateCheckoutUI();
        this.validateCurrentStep();
    }

    /**
     * Load checkout data
     */
    async loadCheckoutData() {
        try {
            // Load cart items
            const cartResponse = await apiClient.getCart();
            this.orderData.items = cartResponse.data?.items || [];
            this.calculateTotals();

            // Load shipping methods
            this.shippingMethods = await this.getShippingMethods();

            // Load payment methods
            this.paymentMethods = await this.getPaymentMethods();

            // Load user addresses if logged in
            if (Helpers.isLoggedIn()) {
                await this.loadUserAddresses();
            }

        } catch (error) {
            console.error('Error loading checkout data:', error);
            Helpers.showToast('Failed to load checkout data', 'error');
        }
    }

    /**
     * Get shipping methods
     */
    async getShippingMethods() {
        // In a real application, this would come from an API
        return [
            {
                id: 'standard',
                name: 'Standard Delivery',
                description: '3-5 business days',
                cost: 0,
                freeThreshold: 100,
                estimatedDays: '3-5'
            },
            {
                id: 'express',
                name: 'Express Delivery',
                description: '1-2 business days',
                cost: 9.99,
                estimatedDays: '1-2'
            },
            {
                id: 'same-day',
                name: 'Same Day Delivery',
                description: 'Within Kampala only',
                cost: 19.99,
                estimatedDays: 'Same day',
                areas: ['Kampala']
            }
        ];
    }

    /**
     * Get payment methods
     */
    async getPaymentMethods() {
        // In a real application, this would come from an API
        return [
            {
                id: 'card',
                name: 'Credit/Debit Card',
                description: 'Pay securely with your card',
                icon: 'fas fa-credit-card',
                supportedCards: ['visa', 'mastercard']
            },
            {
                id: 'paypal',
                name: 'PayPal',
                description: 'Pay with your PayPal account',
                icon: 'fab fa-cc-paypal'
            },
            {
                id: 'mobile-money',
                name: 'Mobile Money',
                description: 'MTN Mobile Money or Airtel Money',
                icon: 'fas fa-mobile-alt',
                providers: ['MTN', 'Airtel']
            },
            {
                id: 'cash',
                name: 'Cash on Delivery',
                description: 'Pay when you receive your order',
                icon: 'fas fa-money-bill-wave',
                available: true
            }
        ];
    }

    /**
     * Load user addresses
     */
    async loadUserAddresses() {
        try {
            // This would typically come from an API
            // For now, we'll use mock data
            this.userAddresses = [
                {
                    id: 1,
                    type: 'home',
                    name: 'Home Address',
                    street: '123 Main Street',
                    city: 'Kampala',
                    postal_code: '00256',
                    country: 'Uganda',
                    is_default: true
                },
                {
                    id: 2,
                    type: 'work',
                    name: 'Work Address',
                    street: '456 Business Avenue',
                    city: 'Kampala',
                    postal_code: '00256',
                    country: 'Uganda',
                    is_default: false
                }
            ];

            this.renderAddressOptions();
        } catch (error) {
            console.error('Error loading user addresses:', error);
        }
    }

    /**
     * Calculate order totals
     */
    calculateTotals() {
        const subtotal = this.orderData.items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        const tax = subtotal * 0.18; // 18% VAT for Uganda
        const shipping = this.getShippingCost();
        const discount = this.getDiscountAmount();

        this.orderData.totals = {
            subtotal: subtotal,
            tax: tax,
            shipping: shipping,
            discount: discount,
            total: subtotal + tax + shipping - discount
        };

        this.updateOrderSummary();
    }

    /**
     * Get shipping cost based on selected method
     */
    getShippingCost() {
        const selectedMethod = this.orderData.shipping.method;
        if (!selectedMethod) return 0;

        const method = this.shippingMethods.find(m => m.id === selectedMethod);
        if (!method) return 0;

        // Check for free shipping threshold
        if (method.freeThreshold && this.orderData.totals.subtotal >= method.freeThreshold) {
            return 0;
        }

        return method.cost || 0;
    }

    /**
     * Get discount amount
     */
    getDiscountAmount() {
        // This would typically calculate based on applied coupons
        return 0;
    }

    /**
     * Update order summary UI
     */
    updateOrderSummary() {
        const elements = {
            subtotal: document.getElementById('checkout-subtotal'),
            shipping: document.getElementById('checkout-shipping'),
            tax: document.getElementById('checkout-tax'),
            discount: document.getElementById('checkout-discount'),
            total: document.getElementById('checkout-total')
        };

        const totals = this.orderData.totals;

        if (elements.subtotal) elements.subtotal.textContent = Helpers.formatCurrency(totals.subtotal);
        if (elements.shipping) elements.shipping.textContent = totals.shipping === 0 ? 'FREE' : Helpers.formatCurrency(totals.shipping);
        if (elements.tax) elements.tax.textContent = Helpers.formatCurrency(totals.tax);
        if (elements.discount) elements.discount.textContent = `-${Helpers.formatCurrency(totals.discount)}`;
        if (elements.total) elements.total.textContent = Helpers.formatCurrency(totals.total);

        // Update checkout items
        this.updateCheckoutItems();
    }

    /**
     * Update checkout items display
     */
    updateCheckoutItems() {
        const checkoutItems = document.getElementById('checkout-items');
        if (!checkoutItems) return;

        checkoutItems.innerHTML = this.orderData.items.map(item => `
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
        `).join('');
    }

    /**
     * Setup event listeners for checkout process
     */
    setupEventListeners() {
        // Shipping method selection
        const shippingMethods = document.querySelectorAll('input[name="shipping-method"]');
        shippingMethods.forEach(method => {
            method.addEventListener('change', (e) => {
                this.orderData.shipping.method = e.target.value;
                this.calculateTotals();
                this.validateShippingStep();
            });
        });

        // Payment method selection
        const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
        paymentMethods.forEach(method => {
            method.addEventListener('change', (e) => {
                this.orderData.payment.method = e.target.value;
                this.togglePaymentForms();
                this.validatePaymentStep();
            });
        });

        // Shipping form submission
        const shippingForm = document.getElementById('shipping-form');
        if (shippingForm) {
            shippingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.validateShipping();
            });
        }

        // Continue to payment button
        const continueBtn = document.querySelector('.btn-continue');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.validateShipping();
            });
        }

        // Place order button
        const placeOrderBtn = document.getElementById('place-order-btn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', () => {
                this.placeOrder();
            });
        }

        // Back to cart button
        const backToCartBtn = document.querySelector('.btn-back');
        if (backToCartBtn) {
            backToCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'cart.html';
            });
        }

        // Address selection
        this.setupAddressSelection();
    }

    /**
     * Setup address selection
     */
    setupAddressSelection() {
        const addressSelect = document.getElementById('address-select');
        if (addressSelect) {
            addressSelect.addEventListener('change', (e) => {
                const addressId = e.target.value;
                if (addressId === 'new') {
                    this.showNewAddressForm();
                } else {
                    this.selectSavedAddress(addressId);
                }
            });
        }
    }

    /**
     * Render address options
     */
    renderAddressOptions() {
        const addressSelect = document.getElementById('address-select');
        if (!addressSelect || !this.userAddresses) return;

        let optionsHTML = `
            <option value="">Select an address</option>
            ${this.userAddresses.map(address => `
                <option value="${address.id}">
                    ${address.name} - ${address.street}, ${address.city}
                    ${address.is_default ? ' (Default)' : ''}
                </option>
            `).join('')}
            <option value="new">Add new address</option>
        `;

        addressSelect.innerHTML = optionsHTML;
    }

    /**
     * Select saved address
     */
    selectSavedAddress(addressId) {
        const address = this.userAddresses.find(addr => addr.id.toString() === addressId);
        if (address) {
            this.populateShippingForm(address);
        }
    }

    /**
     * Show new address form
     */
    showNewAddressForm() {
        // Clear the form for new address
        const form = document.getElementById('shipping-form');
        if (form) {
            form.reset();
        }
    }

    /**
     * Populate shipping form with address data
     */
    populateShippingForm(address) {
        const formFields = {
            'shipping-first-name': address.first_name,
            'shipping-last-name': address.last_name,
            'shipping-address': address.street,
            'shipping-city': address.city,
            'shipping-postal-code': address.postal_code,
            'shipping-country': address.country
        };

        Object.entries(formFields).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field && value) {
                field.value = value;
            }
        });
    }

    /**
     * Toggle payment forms based on selected method
     */
    togglePaymentForms() {
        const paymentMethod = this.orderData.payment.method;

        // Hide all payment forms
        const paymentForms = document.querySelectorAll('[data-payment-method]');
        paymentForms.forEach(form => {
            form.style.display = 'none';
        });

        // Show selected payment form
        const selectedForm = document.querySelector(`[data-payment-method="${paymentMethod}"]`);
        if (selectedForm) {
            selectedForm.style.display = 'block';
        }

        // Update place order button text
        const placeOrderBtn = document.getElementById('place-order-btn');
        if (placeOrderBtn) {
            if (paymentMethod === 'cash') {
                placeOrderBtn.textContent = 'Place Order (Cash on Delivery)';
            } else {
                placeOrderBtn.textContent = 'Place Order';
            }
        }
    }

    /**
     * Validate shipping information
     */
    validateShipping() {
        const form = document.getElementById('shipping-form');
        if (!form) return;

        const formData = new FormData(form);
        const shippingData = {
            first_name: formData.get('shipping-first-name'),
            last_name: formData.get('shipping-last-name'),
            email: formData.get('shipping-email'),
            phone: formData.get('shipping-phone'),
            address: formData.get('shipping-address'),
            city: formData.get('shipping-city'),
            postal_code: formData.get('shipping-postal-code'),
            country: formData.get('shipping-country')
        };

        // Validate required fields
        const validation = this.validateShippingData(shippingData);
        if (!validation.isValid) {
            Validators.showFormErrors(form, validation.errors);
            return;
        }

        // Validate shipping method
        if (!this.orderData.shipping.method) {
            Helpers.showToast('Please select a shipping method', 'error');
            return;
        }

        // Save shipping data
        this.orderData.shipping = { ...this.orderData.shipping, ...shippingData };

        // Move to next step
        this.goToStep(2);
    }

    /**
     * Validate shipping data
     */
    validateShippingData(data) {
        const rules = {
            'shipping-first-name': { required: true, type: 'name', fieldName: 'First name' },
            'shipping-last-name': { required: true, type: 'name', fieldName: 'Last name' },
            'shipping-email': { required: true, type: 'email' },
            'shipping-phone': { required: true, type: 'phone' },
            'shipping-address': { required: true, type: 'address' },
            'shipping-city': { required: true, type: 'city' },
            'shipping-postal-code': { required: true, type: 'postalCode' },
            'shipping-country': { required: true }
        };

        return Validators.validateForm(data, rules);
    }

    /**
     * Validate payment information
     */
    validatePayment() {
        const paymentMethod = this.orderData.payment.method;

        if (!paymentMethod) {
            Helpers.showToast('Please select a payment method', 'error');
            return false;
        }

        // Validate based on payment method
        switch (paymentMethod) {
            case 'card':
                return this.validateCardPayment();
            case 'mobile-money':
                return this.validateMobileMoneyPayment();
            case 'paypal':
                return this.validatePayPalPayment();
            case 'cash':
                return this.validateCashPayment();
            default:
                Helpers.showToast('Invalid payment method', 'error');
                return false;
        }
    }

    /**
     * Validate card payment
     */
    validateCardPayment() {
        const form = document.getElementById('card-payment-form');
        if (!form) return false;

        const formData = new FormData(form);
        const cardData = {
            card_number: formData.get('card-number'),
            expiry_date: formData.get('card-expiry'),
            cvv: formData.get('card-cvv'),
            cardholder_name: formData.get('cardholder-name')
        };

        const rules = {
            'card-number': { required: true, type: 'creditCard' },
            'card-expiry': { required: true, type: 'expiry' },
            'card-cvv': { required: true, type: 'cvv' },
            'cardholder-name': { required: true, type: 'name', fieldName: 'Cardholder name' }
        };

        const validation = Validators.validateForm(cardData, rules);
        if (!validation.isValid) {
            Validators.showFormErrors(form, validation.errors);
            return false;
        }

        this.orderData.payment.card = cardData;
        return true;
    }

    /**
     * Validate mobile money payment
     */
    validateMobileMoneyPayment() {
        // Mobile money validation would go here
        this.orderData.payment.mobile_money = {
            provider: 'MTN', // This would come from a form
            phone_number: '+256700000000' // This would come from a form
        };
        return true;
    }

    /**
     * Validate PayPal payment
     */
    validatePayPalPayment() {
        // PayPal validation would typically redirect to PayPal
        // For now, we'll just mark it as valid
        return true;
    }

    /**
     * Validate cash payment
     */
    validateCashPayment() {
        // Cash on delivery is always valid
        return true;
    }

    /**
     * Place order
     */
    async placeOrder() {
        try {
            // Validate current step
            if (this.currentStep !== 2) {
                Helpers.showToast('Please complete all checkout steps', 'error');
                return;
            }

            // Validate payment
            if (!this.validatePayment()) {
                return;
            }

            // Show loading state
            this.setPlaceOrderLoading(true);

            // Prepare order data
            const orderData = {
                shipping_address: this.orderData.shipping,
                billing_address: this.orderData.billing_address || this.orderData.shipping,
                payment_method: this.orderData.payment.method,
                payment_data: this.orderData.payment[this.orderData.payment.method],
                items: this.orderData.items,
                totals: this.orderData.totals,
                shipping_method: this.orderData.shipping.method
            };

            // Create order
            const response = await apiClient.createOrder(orderData);

            if (response.success) {
                // Clear cart
                await cartManager.clearCart();

                // Show success message
                Helpers.showToast('Order placed successfully!', 'success');

                // Redirect to order confirmation
                setTimeout(() => {
                    window.location.href = `order-confirmation.html?order_id=${response.data.order_id}`;
                }, 2000);

            } else {
                Helpers.showToast(response.message || 'Failed to place order', 'error');
            }

        } catch (error) {
            console.error('Error placing order:', error);
            Helpers.showToast('Failed to place order. Please try again.', 'error');
        } finally {
            this.setPlaceOrderLoading(false);
        }
    }

    /**
     * Go to specific checkout step
     */
    goToStep(step) {
        if (step < 1 || step > 3) return;

        this.currentStep = step;
        this.updateCheckoutUI();
        this.validateCurrentStep();
    }

    /**
     * Update checkout UI
     */
    updateCheckoutUI() {
        // Update step indicators
        this.updateStepIndicators();

        // Show/hide step content
        this.updateStepContent();

        // Update navigation buttons
        this.updateNavigation();
    }

    /**
     * Update step indicators
     */
    updateStepIndicators() {
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.toggle('active', stepNumber === this.currentStep);
            step.classList.toggle('completed', stepNumber < this.currentStep);
        });
    }

    /**
     * Update step content
     */
    updateStepContent() {
        // Hide all step content
        const stepContents = document.querySelectorAll('[data-step]');
        stepContents.forEach(content => {
            content.style.display = 'none';
        });

        // Show current step content
        const currentStepContent = document.querySelector(`[data-step="${this.currentStep}"]`);
        if (currentStepContent) {
            currentStepContent.style.display = 'block';
        }
    }

    /**
     * Update navigation buttons
     */
    updateNavigation() {
        const continueBtn = document.querySelector('.btn-continue');
        const backBtn = document.querySelector('.btn-back');

        if (continueBtn) {
            if (this.currentStep === 1) {
                continueBtn.textContent = 'Continue to Payment';
            } else if (this.currentStep === 2) {
                continueBtn.style.display = 'none';
            }
        }

        if (backBtn) {
            if (this.currentStep === 1) {
                backBtn.href = 'cart.html';
                backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Cart';
            } else if (this.currentStep === 2) {
                backBtn.href = '#';
                backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Shipping';
                backBtn.onclick = () => this.goToStep(1);
            }
        }
    }

    /**
     * Validate current step
     */
    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                this.validateShippingStep();
                break;
            case 2:
                this.validatePaymentStep();
                break;
        }
    }

    /**
     * Validate shipping step
     */
    validateShippingStep() {
        // Check if shipping method is selected
        const isShippingValid = !!this.orderData.shipping.method;

        // Update continue button state
        const continueBtn = document.querySelector('.btn-continue');
        if (continueBtn) {
            continueBtn.disabled = !isShippingValid;
        }
    }

    /**
     * Validate payment step
     */
    validatePaymentStep() {
        // Check if payment method is selected
        const isPaymentValid = !!this.orderData.payment.method;

        // Update place order button state
        const placeOrderBtn = document.getElementById('place-order-btn');
        if (placeOrderBtn) {
            placeOrderBtn.disabled = !isPaymentValid;
        }
    }

    /**
     * Set place order loading state
     */
    setPlaceOrderLoading(loading) {
        const placeOrderBtn = document.getElementById('place-order-btn');
        if (placeOrderBtn) {
            placeOrderBtn.disabled = loading;
            placeOrderBtn.innerHTML = loading ?
                '<i class="fas fa-spinner fa-spin"></i> Processing...' :
                'Place Order';
        }
    }

    /**
     * Apply coupon code
     */
    async applyCoupon(code) {
        try {
            const success = await cartManager.applyCoupon(code);
            if (success) {
                this.calculateTotals();
            }
        } catch (error) {
            console.error('Error applying coupon:', error);
        }
    }

    /**
     * Get order summary for confirmation
     */
    getOrderSummary() {
        return {
            order_id: Helpers.generateId('WU-'),
            ...this.orderData,
            placed_at: new Date().toISOString(),
            status: 'pending'
        };
    }
}

// Initialize checkout process
const checkoutProcess = new CheckoutProcess();

// Make checkout process available globally
window.checkoutProcess = checkoutProcess;

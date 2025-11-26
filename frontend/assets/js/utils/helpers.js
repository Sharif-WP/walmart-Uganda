/**
 * Utility functions for Walmart Uganda Ecommerce Platform
 * General helper functions used across the application
 */

class Helpers {
    /**
     * Format currency with Ugandan Shilling symbol
     */
    static formatCurrency(amount, currency = 'UGX') {
        if (currency === 'UGX') {
            return `UGX ${parseFloat(amount).toLocaleString('en-UG')}`;
        }
        return `$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    /**
     * Format date to readable string
     */
    static formatDate(dateString) {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    /**
     * Debounce function to limit function calls
     */
    static debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    /**
     * Generate random ID
     */
    static generateId(prefix = '') {
        return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Sanitize HTML to prevent XSS
     */
    static sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    /**
     * Truncate text with ellipsis
     */
    static truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }

    /**
     * Calculate discount percentage
     */
    static calculateDiscount(originalPrice, salePrice) {
        if (!originalPrice || !salePrice) return 0;
        return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
    }

    /**
     * Get query parameters from URL
     */
    static getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }

    /**
     * Update query parameters without page reload
     */
    static updateQueryParams(params) {
        const url = new URL(window.location);
        Object.keys(params).forEach(key => {
            if (params[key] === null || params[key] === '') {
                url.searchParams.delete(key);
            } else {
                url.searchParams.set(key, params[key]);
            }
        });
        window.history.pushState({}, '', url);
    }

    /**
     * Show loading spinner
     */
    static showLoading(element) {
        if (element) {
            element.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Loading...</span>
                </div>
            `;
        }
    }

    /**
     * Hide loading spinner
     */
    static hideLoading(element, originalContent = '') {
        if (element) {
            element.innerHTML = originalContent;
        }
    }

    /**
     * Show notification toast
     */
    static showToast(message, type = 'info', duration = 3000) {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast-notification');
        existingToasts.forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${this.sanitizeHTML(message)}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(toast);

        // Add show class after a frame
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }

        return toast;
    }

    /**
     * Get icon for toast type
     */
    static getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    /**
     * Validate email format
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone number (Ugandan format)
     */
    static isValidPhone(phone) {
        const phoneRegex = /^(\+256|0)[1-9]\d{8}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    /**
     * Format phone number to Ugandan format
     */
    static formatPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('256')) {
            return `+${cleaned}`;
        } else if (cleaned.startsWith('0')) {
            return `+256${cleaned.substring(1)}`;
        }
        return `+256${cleaned}`;
    }

    /**
     * Copy text to clipboard
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copied to clipboard!', 'success');
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Copied to clipboard!', 'success');
            return true;
        }
    }

    /**
     * Check if element is in viewport
     */
    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Lazy load images
     */
    static lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    /**
     * Prevent default behavior and propagation
     */
    static preventEvent(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * Get current user from localStorage
     */
    static getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    /**
     * Set current user in localStorage
     */
    static setCurrentUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    /**
     * Remove current user from localStorage
     */
    static removeCurrentUser() {
        localStorage.removeItem('user');
    }

    /**
     * Check if user is logged in
     */
    static isLoggedIn() {
        return !!this.getCurrentUser();
    }

    /**
     * Check if user is admin
     */
    static isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }
}

// Initialize helpers when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize lazy loading
    Helpers.lazyLoadImages();

    // Add toast styles if not already present
    if (!document.querySelector('#toast-styles')) {
        const toastStyles = document.createElement('style');
        toastStyles.id = 'toast-styles';
        toastStyles.textContent = `
            .toast-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                border-left: 4px solid #0071ce;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                z-index: 10000;
                max-width: 400px;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            .toast-notification.show {
                transform: translateX(0);
            }
            .toast-success { border-left-color: #28a745; }
            .toast-error { border-left-color: #dc3545; }
            .toast-warning { border-left-color: #ffc107; }
            .toast-info { border-left-color: #0071ce; }
            .toast-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                flex: 1;
            }
            .toast-close {
                background: none;
                border: none;
                color: #6c757d;
                cursor: pointer;
                padding: 0.25rem;
            }
        `;
        document.head.appendChild(toastStyles);
    }
});

// Make Helpers available globally
window.Helpers = Helpers;

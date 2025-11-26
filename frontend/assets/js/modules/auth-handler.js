/**
 * Authentication Handler for Walmart Uganda Ecommerce Platform
 * Handles user authentication, registration, and session management
 */

class AuthHandler {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    /**
     * Initialize auth handler
     */
    init() {
        this.loadCurrentUser();
        this.updateAuthUI();
        this.setupEventListeners();
    }

    /**
     * Load current user from localStorage
     */
    loadCurrentUser() {
        this.currentUser = Helpers.getCurrentUser();
        if (this.currentUser && this.currentUser.token) {
            apiClient.setAuthToken(this.currentUser.token);
        }
    }

    /**
     * User login
     */
    async login(credentials) {
        try {
            // Validate credentials
            const validation = this.validateLoginCredentials(credentials);
            if (!validation.isValid) {
                Helpers.showToast(validation.message, 'error');
                return false;
            }

            // Show loading state
            this.setLoginLoading(true);

            const response = await apiClient.login(credentials);

            if (response.success) {
                this.currentUser = response.data;
                this.updateAuthUI();
                Helpers.showToast('Login successful!', 'success');

                // Redirect to intended page or dashboard
                setTimeout(() => {
                    const redirectTo = this.getRedirectUrl() || 'user-dashboard.html';
                    window.location.href = redirectTo;
                }, 1000);

                return true;
            } else {
                Helpers.showToast(response.message || 'Login failed', 'error');
                return false;
            }

        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = 'Login failed. Please try again.';

            if (error.status === 401) {
                errorMessage = 'Invalid email or password';
            } else if (error.status === 422) {
                errorMessage = 'Please check your input and try again';
            } else if (error.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            }

            Helpers.showToast(errorMessage, 'error');
            return false;
        } finally {
            this.setLoginLoading(false);
        }
    }

    /**
     * User registration
     */
    async register(userData) {
        try {
            // Validate registration data
            const validation = this.validateRegistrationData(userData);
            if (!validation.isValid) {
                Helpers.showToast(validation.message, 'error');
                return false;
            }

            // Show loading state
            this.setRegisterLoading(true);

            const response = await apiClient.register(userData);

            if (response.success) {
                this.currentUser = response.data;
                this.updateAuthUI();
                Helpers.showToast('Registration successful!', 'success');

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'user-dashboard.html';
                }, 1000);

                return true;
            } else {
                Helpers.showToast(response.message || 'Registration failed', 'error');
                return false;
            }

        } catch (error) {
            console.error('Registration error:', error);
            let errorMessage = 'Registration failed. Please try again.';

            if (error.status === 422) {
                errorMessage = 'Please check your input and try again';
            } else if (error.status === 409) {
                errorMessage = 'Email already exists. Please use a different email.';
            } else if (error.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            }

            Helpers.showToast(errorMessage, 'error');
            return false;
        } finally {
            this.setRegisterLoading(false);
        }
    }

    /**
     * User logout
     */
    async logout() {
        try {
            await apiClient.logout();
            this.currentUser = null;
            this.updateAuthUI();
            Helpers.showToast('Logged out successfully', 'success');

            // Redirect to home page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);

        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local data even if API call fails
            this.currentUser = null;
            this.updateAuthUI();
            window.location.href = 'index.html';
        }
    }

    /**
     * Validate login credentials
     */
    validateLoginCredentials(credentials) {
        const { email, password } = credentials;

        // Validate email
        const emailValidation = Validators.validateEmail(email);
        if (!emailValidation.isValid) {
            return emailValidation;
        }

        // Validate password
        if (!password) {
            return { isValid: false, message: 'Password is required' };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate registration data
     */
    validateRegistrationData(userData) {
        const { firstName, lastName, email, phone, password, confirmPassword, terms } = userData;

        // Validate names
        const firstNameValidation = Validators.validateName(firstName, 'First name');
        if (!firstNameValidation.isValid) {
            return firstNameValidation;
        }

        const lastNameValidation = Validators.validateName(lastName, 'Last name');
        if (!lastNameValidation.isValid) {
            return lastNameValidation;
        }

        // Validate email
        const emailValidation = Validators.validateEmail(email);
        if (!emailValidation.isValid) {
            return emailValidation;
        }

        // Validate phone
        const phoneValidation = Validators.validatePhone(phone);
        if (!phoneValidation.isValid) {
            return phoneValidation;
        }

        // Validate password
        const passwordValidation = Validators.validatePassword(password, confirmPassword);
        if (!passwordValidation.isValid) {
            return passwordValidation;
        }

        // Validate terms agreement
        if (!terms) {
            return { isValid: false, message: 'You must agree to the terms and conditions' };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Update authentication UI across the application
     */
    updateAuthUI() {
        this.updateHeaderAuth();
        this.updateUserDashboard();
        this.updateProtectedContent();
    }

    /**
     * Update header authentication section
     */
    updateHeaderAuth() {
        const authBtn = document.getElementById('auth-btn');
        const authText = document.getElementById('auth-text');
        const userNav = document.getElementById('user-nav');

        if (this.currentUser) {
            // User is logged in
            if (authBtn) {
                authBtn.href = 'user-dashboard.html';
                if (authText) {
                    authText.textContent = this.currentUser.first_name || 'My Account';
                }
            }

            // Show user navigation if available
            if (userNav) {
                userNav.style.display = 'block';
            }
        } else {
            // User is not logged in
            if (authBtn) {
                authBtn.href = 'login.html';
                if (authText) {
                    authText.textContent = 'Login';
                }
            }

            // Hide user navigation
            if (userNav) {
                userNav.style.display = 'none';
            }
        }
    }

    /**
     * Update user dashboard with user data
     */
    updateUserDashboard() {
        if (!this.currentUser) return;

        const userDashboard = document.getElementById('user-dashboard');
        if (!userDashboard) return;

        // Update user profile section
        this.updateUserProfile();

        // Update welcome message
        const welcomeMessage = document.getElementById('welcome-message');
        if (welcomeMessage) {
            const timeOfDay = this.getTimeOfDay();
            welcomeMessage.textContent = `Good ${timeOfDay}, ${this.currentUser.first_name}!`;
        }

        // Update user stats
        this.updateUserStats();
    }

    /**
     * Update user profile information
     */
    updateUserProfile() {
        if (!this.currentUser) return;

        // Update avatar
        const userAvatar = document.getElementById('user-avatar');
        if (userAvatar) {
            userAvatar.textContent = this.currentUser.first_name?.charAt(0) + this.currentUser.last_name?.charAt(0) || 'U';
        }

        // Update display name
        const displayName = document.getElementById('display-user-name');
        if (displayName) {
            displayName.textContent = `${this.currentUser.first_name} ${this.currentUser.last_name}`;
        }

        // Update email
        const displayEmail = document.getElementById('display-user-email');
        if (displayEmail) {
            displayEmail.textContent = this.currentUser.email;
        }

        // Update profile form
        this.populateProfileForm();
    }

    /**
     * Populate profile form with user data
     */
    populateProfileForm() {
        if (!this.currentUser) return;

        const formFields = {
            'profile-first-name': this.currentUser.first_name,
            'profile-last-name': this.currentUser.last_name,
            'profile-email': this.currentUser.email,
            'profile-phone': this.currentUser.phone,
            'profile-dob': this.currentUser.date_of_birth
        };

        Object.entries(formFields).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field && value) {
                field.value = value;
            }
        });
    }

    /**
     * Update user statistics
     */
    async updateUserStats() {
        try {
            // Fetch user statistics from API
            const [ordersResponse, wishlistResponse, reviewsResponse] = await Promise.all([
                apiClient.getOrders({ limit: 100 }),
                apiClient.getWishlist(),
                apiClient.getUserReviews()
            ]);

            // Update stats cards
            this.updateStatCard('orders-count', ordersResponse.data?.length || 0);
            this.updateStatCard('wishlist-count', wishlistResponse.data?.items?.length || 0);
            this.updateStatCard('reviews-count', reviewsResponse.data?.length || 0);

            // Update member since
            const memberSince = document.getElementById('member-since');
            if (memberSince && this.currentUser.created_at) {
                memberSince.textContent = Helpers.formatDate(this.currentUser.created_at);
            }

        } catch (error) {
            console.error('Error updating user stats:', error);
        }
    }

    /**
     * Update individual stat card
     */
    updateStatCard(elementId, count) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = count;
        }
    }

    /**
     * Update protected content based on auth status
     */
    updateProtectedContent() {
        const protectedElements = document.querySelectorAll('[data-auth-required]');

        protectedElements.forEach(element => {
            if (this.currentUser) {
                element.style.display = element.dataset.authRequired === 'true' ? 'block' : 'none';
            } else {
                element.style.display = element.dataset.authRequired === 'true' ? 'none' : 'block';
            }
        });

        // Update admin content
        if (Helpers.isAdmin()) {
            const adminElements = document.querySelectorAll('[data-admin-only]');
            adminElements.forEach(element => {
                element.style.display = 'block';
            });
        }
    }

    /**
     * Get time of day for greeting
     */
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        if (hour < 18) return 'afternoon';
        return 'evening';
    }

    /**
     * Get redirect URL from query parameters or localStorage
     */
    getRedirectUrl() {
        const urlParams = Helpers.getQueryParams();
        return urlParams.redirect || localStorage.getItem('auth_redirect');
    }

    /**
     * Set redirect URL for after login
     */
    setRedirectUrl(url) {
        localStorage.setItem('auth_redirect', url);
    }

    /**
     * Clear redirect URL
     */
    clearRedirectUrl() {
        localStorage.removeItem('auth_redirect');
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.currentUser;
    }

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    /**
     * Require authentication for page access
     */
    requireAuth(redirectUrl = null) {
        if (!this.isAuthenticated()) {
            const redirect = redirectUrl || window.location.pathname + window.location.search;
            this.setRedirectUrl(redirect);
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    /**
     * Require specific role for page access
     */
    requireRole(role, redirectUrl = 'index.html') {
        if (!this.hasRole(role)) {
            Helpers.showToast('Access denied. Insufficient permissions.', 'error');
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    /**
     * Set login loading state
     */
    setLoginLoading(loading) {
        const loginBtn = document.getElementById('login-btn');
        const loginText = document.getElementById('login-text');
        const loginSpinner = document.getElementById('login-spinner');

        if (loginBtn) {
            loginBtn.disabled = loading;
        }

        if (loginText && loginSpinner) {
            loginText.style.display = loading ? 'none' : 'block';
            loginSpinner.style.display = loading ? 'block' : 'none';
        }
    }

    /**
     * Set registration loading state
     */
    setRegisterLoading(loading) {
        const registerBtn = document.getElementById('register-btn');
        const registerText = document.getElementById('register-text');
        const registerSpinner = document.getElementById('register-spinner');

        if (registerBtn) {
            registerBtn.disabled = loading;
        }

        if (registerText && registerSpinner) {
            registerText.style.display = loading ? 'none' : 'block';
            registerSpinner.style.display = loading ? 'block' : 'none';
        }
    }

    /**
     * Setup event listeners for authentication forms
     */
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(loginForm);
                const credentials = {
                    email: formData.get('email'),
                    password: formData.get('password'),
                    remember_me: formData.get('remember-me') === 'on'
                };
                this.login(credentials);
            });
        }

        // Registration form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(registerForm);
                const userData = {
                    firstName: formData.get('first-name'),
                    lastName: formData.get('last-name'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    password: formData.get('password'),
                    confirmPassword: formData.get('confirm-password'),
                    terms: formData.get('terms') === 'on',
                    newsletter: formData.get('newsletter') === 'on'
                };
                this.register(userData);
            });

            // Real-time password validation
            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                passwordInput.addEventListener('input', this.updatePasswordStrength.bind(this));
            }
        }

        // Logout buttons
        const logoutButtons = document.querySelectorAll('[data-action="logout"]');
        logoutButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });

        // Profile form
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProfile();
            });
        }
    }

    /**
     * Update password strength indicator
     */
    updatePasswordStrength() {
        const passwordInput = document.getElementById('password');
        const strengthLevel = document.getElementById('password-strength-level');
        const strengthText = document.getElementById('password-strength-text');

        if (!passwordInput || !strengthLevel || !strengthText) return;

        const password = passwordInput.value;
        let strength = 0;
        let message = 'Password strength';

        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[@$!%*?&]/.test(password)) strength++;

        switch (strength) {
            case 0:
            case 1:
                strengthLevel.className = 'strength-level weak';
                message = 'Weak password';
                break;
            case 2:
            case 3:
                strengthLevel.className = 'strength-level medium';
                message = 'Medium strength';
                break;
            case 4:
            case 5:
                strengthLevel.className = 'strength-level strong';
                message = 'Strong password';
                break;
        }

        strengthText.textContent = message;
    }

    /**
     * Update user profile
     */
    async updateProfile() {
        try {
            const formData = new FormData(document.getElementById('profile-form'));
            const profileData = {
                first_name: formData.get('profile-first-name'),
                last_name: formData.get('profile-last-name'),
                email: formData.get('profile-email'),
                phone: formData.get('profile-phone'),
                date_of_birth: formData.get('profile-dob')
            };

            const response = await apiClient.updateProfile(profileData);

            if (response.success) {
                // Update current user data
                this.currentUser = { ...this.currentUser, ...response.data };
                Helpers.setCurrentUser(this.currentUser);
                this.updateAuthUI();
                Helpers.showToast('Profile updated successfully!', 'success');
            } else {
                Helpers.showToast(response.message || 'Failed to update profile', 'error');
            }

        } catch (error) {
            console.error('Error updating profile:', error);
            Helpers.showToast('Failed to update profile', 'error');
        }
    }

    /**
     * Forgot password functionality
     */
    async forgotPassword(email) {
        try {
            // This would typically call an API endpoint
            // For now, we'll simulate the process
            Helpers.showToast('Password reset instructions sent to your email', 'success');
            return true;
        } catch (error) {
            console.error('Error in forgot password:', error);
            Helpers.showToast('Failed to process password reset', 'error');
            return false;
        }
    }

    /**
     * Reset password functionality
     */
    async resetPassword(token, newPassword) {
        try {
            // This would typically call an API endpoint
            // For now, we'll simulate the process
            Helpers.showToast('Password reset successfully!', 'success');

            // Redirect to login
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

            return true;
        } catch (error) {
            console.error('Error resetting password:', error);
            Helpers.showToast('Failed to reset password', 'error');
            return false;
        }
    }
}

// Initialize auth handler
const authHandler = new AuthHandler();

// Make auth handler available globally
window.authHandler = authHandler;

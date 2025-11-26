/**
 * Validation functions for Walmart Uganda Ecommerce Platform
 * Handles form validation and data validation
 */

class Validators {
    /**
     * Validate email address
     */
    static validateEmail(email) {
        if (!email) {
            return { isValid: false, message: 'Email is required' };
        }

        if (!Helpers.isValidEmail(email)) {
            return { isValid: false, message: 'Please enter a valid email address' };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate password
     */
    static validatePassword(password, confirmPassword = null) {
        if (!password) {
            return { isValid: false, message: 'Password is required' };
        }

        if (password.length < 8) {
            return { isValid: false, message: 'Password must be at least 8 characters long' };
        }

        if (!/(?=.*[a-z])/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one lowercase letter' };
        }

        if (!/(?=.*[A-Z])/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one uppercase letter' };
        }

        if (!/(?=.*\d)/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one number' };
        }

        if (!/(?=.*[@$!%*?&])/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one special character (@$!%*?&)' };
        }

        if (confirmPassword !== null && password !== confirmPassword) {
            return { isValid: false, message: 'Passwords do not match' };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate phone number
     */
    static validatePhone(phone) {
        if (!phone) {
            return { isValid: false, message: 'Phone number is required' };
        }

        if (!Helpers.isValidPhone(phone)) {
            return { isValid: false, message: 'Please enter a valid Ugandan phone number' };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate name
     */
    static validateName(name, fieldName = 'Name') {
        if (!name) {
            return { isValid: false, message: `${fieldName} is required` };
        }

        if (name.length < 2) {
            return { isValid: false, message: `${fieldName} must be at least 2 characters long` };
        }

        if (!/^[a-zA-Z\s\-']+$/.test(name)) {
            return { isValid: false, message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate required field
     */
    static validateRequired(value, fieldName) {
        if (!value || value.toString().trim() === '') {
            return { isValid: false, message: `${fieldName} is required` };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate number range
     */
    static validateNumber(value, min = null, max = null, fieldName = 'Value') {
        const num = parseFloat(value);

        if (isNaN(num)) {
            return { isValid: false, message: `${fieldName} must be a number` };
        }

        if (min !== null && num < min) {
            return { isValid: false, message: `${fieldName} must be at least ${min}` };
        }

        if (max !== null && num > max) {
            return { isValid: false, message: `${fieldName} must be at most ${max}` };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate credit card number
     */
    static validateCreditCard(number) {
        if (!number) {
            return { isValid: false, message: 'Card number is required' };
        }

        // Remove spaces and dashes
        const cleaned = number.replace(/[\s\-]/g, '');

        if (!/^\d+$/.test(cleaned)) {
            return { isValid: false, message: 'Card number must contain only digits' };
        }

        if (cleaned.length < 13 || cleaned.length > 19) {
            return { isValid: false, message: 'Card number must be between 13 and 19 digits' };
        }

        // Luhn algorithm validation
        if (!this.validateLuhn(cleaned)) {
            return { isValid: false, message: 'Invalid card number' };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Luhn algorithm for credit card validation
     */
    static validateLuhn(cardNumber) {
        let sum = 0;
        let isEven = false;

        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber[i]);

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    }

    /**
     * Validate expiry date
     */
    static validateExpiryDate(expiry) {
        if (!expiry) {
            return { isValid: false, message: 'Expiry date is required' };
        }

        const match = expiry.match(/^(\d{2})\/(\d{2})$/);
        if (!match) {
            return { isValid: false, message: 'Expiry date must be in MM/YY format' };
        }

        const month = parseInt(match[1]);
        const year = parseInt('20' + match[2]);
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        if (month < 1 || month > 12) {
            return { isValid: false, message: 'Month must be between 01 and 12' };
        }

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            return { isValid: false, message: 'Card has expired' };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate CVV
     */
    static validateCVV(cvv) {
        if (!cvv) {
            return { isValid: false, message: 'CVV is required' };
        }

        if (!/^\d+$/.test(cvv)) {
            return { isValid: false, message: 'CVV must contain only digits' };
        }

        if (cvv.length < 3 || cvv.length > 4) {
            return { isValid: false, message: 'CVV must be 3 or 4 digits' };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate address
     */
    static validateAddress(address) {
        if (!address) {
            return { isValid: false, message: 'Address is required' };
        }

        if (address.length < 5) {
            return { isValid: false, message: 'Address must be at least 5 characters long' };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate city
     */
    static validateCity(city) {
        if (!city) {
            return { isValid: false, message: 'City is required' };
        }

        if (city.length < 2) {
            return { isValid: false, message: 'City must be at least 2 characters long' };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate postal code
     */
    static validatePostalCode(postalCode) {
        if (!postalCode) {
            return { isValid: false, message: 'Postal code is required' };
        }

        if (postalCode.length < 3) {
            return { isValid: false, message: 'Postal code must be at least 3 characters long' };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate form fields
     */
    static validateForm(formData, rules) {
        const errors = {};
        let isValid = true;

        for (const [fieldName, rule] of Object.entries(rules)) {
            const value = formData[fieldName];
            let fieldError = '';

            // Check required field
            if (rule.required && !value) {
                fieldError = rule.requiredMessage || `${fieldName} is required`;
            }

            // Validate based on type if value exists
            if (value && !fieldError) {
                switch (rule.type) {
                    case 'email':
                        const emailValidation = this.validateEmail(value);
                        if (!emailValidation.isValid) fieldError = emailValidation.message;
                        break;
                    case 'password':
                        const passwordValidation = this.validatePassword(value, rule.confirmField ? formData[rule.confirmField] : null);
                        if (!passwordValidation.isValid) fieldError = passwordValidation.message;
                        break;
                    case 'phone':
                        const phoneValidation = this.validatePhone(value);
                        if (!phoneValidation.isValid) fieldError = phoneValidation.message;
                        break;
                    case 'name':
                        const nameValidation = this.validateName(value, fieldName);
                        if (!nameValidation.isValid) fieldError = nameValidation.message;
                        break;
                    case 'number':
                        const numberValidation = this.validateNumber(value, rule.min, rule.max, fieldName);
                        if (!numberValidation.isValid) fieldError = numberValidation.message;
                        break;
                    case 'creditCard':
                        const cardValidation = this.validateCreditCard(value);
                        if (!cardValidation.isValid) fieldError = cardValidation.message;
                        break;
                    case 'expiry':
                        const expiryValidation = this.validateExpiryDate(value);
                        if (!expiryValidation.isValid) fieldError = expiryValidation.message;
                        break;
                    case 'cvv':
                        const cvvValidation = this.validateCVV(value);
                        if (!cvvValidation.isValid) fieldError = cvvValidation.message;
                        break;
                    case 'address':
                        const addressValidation = this.validateAddress(value);
                        if (!addressValidation.isValid) fieldError = addressValidation.message;
                        break;
                    case 'city':
                        const cityValidation = this.validateCity(value);
                        if (!cityValidation.isValid) fieldError = cityValidation.message;
                        break;
                    case 'postalCode':
                        const postalValidation = this.validatePostalCode(value);
                        if (!postalValidation.isValid) fieldError = postalValidation.message;
                        break;
                    case 'custom':
                        if (rule.validator) {
                            const customValidation = rule.validator(value, formData);
                            if (!customValidation.isValid) fieldError = customValidation.message;
                        }
                        break;
                }
            }

            // Check min/max length
            if (value && !fieldError) {
                if (rule.minLength && value.length < rule.minLength) {
                    fieldError = `${fieldName} must be at least ${rule.minLength} characters long`;
                } else if (rule.maxLength && value.length > rule.maxLength) {
                    fieldError = `${fieldName} must be at most ${rule.maxLength} characters long`;
                }
            }

            // Check pattern
            if (value && rule.pattern && !fieldError) {
                const regex = new RegExp(rule.pattern);
                if (!regex.test(value)) {
                    fieldError = rule.patternMessage || `${fieldName} format is invalid`;
                }
            }

            if (fieldError) {
                errors[fieldName] = fieldError;
                isValid = false;
            }
        }

        return { isValid, errors };
    }

    /**
     * Show validation errors in form
     */
    static showFormErrors(formElement, errors) {
        // Clear previous errors
        this.clearFormErrors(formElement);

        // Show new errors
        Object.entries(errors).forEach(([fieldName, errorMessage]) => {
            const field = formElement.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.classList.add('error');

                let errorElement = field.parentNode.querySelector('.form-text.error');
                if (!errorElement) {
                    errorElement = document.createElement('div');
                    errorElement.className = 'form-text error';
                    field.parentNode.appendChild(errorElement);
                }

                errorElement.textContent = errorMessage;
            }
        });

        // Focus on first error field
        const firstErrorField = formElement.querySelector('.error');
        if (firstErrorField) {
            firstErrorField.focus();
        }
    }

    /**
     * Clear form errors
     */
    static clearFormErrors(formElement) {
        const errorFields = formElement.querySelectorAll('.error');
        errorFields.forEach(field => field.classList.remove('error'));

        const errorMessages = formElement.querySelectorAll('.form-text.error');
        errorMessages.forEach(message => message.remove());
    }

    /**
     * Real-time validation for input fields
     */
    static setupRealTimeValidation(inputElement, rules) {
        inputElement.addEventListener('blur', function() {
            const value = this.value;
            let validation = { isValid: true, message: '' };

            if (rules.required && !value) {
                validation = { isValid: false, message: rules.requiredMessage || 'This field is required' };
            } else if (value) {
                switch (rules.type) {
                    case 'email':
                        validation = Validators.validateEmail(value);
                        break;
                    case 'phone':
                        validation = Validators.validatePhone(value);
                        break;
                    case 'password':
                        validation = Validators.validatePassword(value);
                        break;
                    // Add more types as needed
                }
            }

            Validators.updateFieldValidation(this, validation);
        });

        // Clear error on input
        inputElement.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                Validators.updateFieldValidation(this, { isValid: true, message: '' });
            }
        });
    }

    /**
     * Update field validation UI
     */
    static updateFieldValidation(field, validation) {
        field.classList.toggle('error', !validation.isValid);

        let errorElement = field.parentNode.querySelector('.form-text.error');

        if (!validation.isValid) {
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'form-text error';
                field.parentNode.appendChild(errorElement);
            }
            errorElement.textContent = validation.message;
        } else if (errorElement) {
            errorElement.remove();
        }
    }

    /**
     * Validate product quantity
     */
    static validateQuantity(quantity, maxStock = null) {
        const qty = parseInt(quantity);

        if (isNaN(qty) || qty < 1) {
            return { isValid: false, message: 'Quantity must be at least 1' };
        }

        if (maxStock !== null && qty > maxStock) {
            return { isValid: false, message: `Only ${maxStock} items available in stock` };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate coupon code format
     */
    static validateCouponCode(code) {
        if (!code) {
            return { isValid: false, message: 'Coupon code is required' };
        }

        if (code.length < 4 || code.length > 20) {
            return { isValid: false, message: 'Coupon code must be between 4 and 20 characters' };
        }

        if (!/^[A-Z0-9\-_]+$/.test(code)) {
            return { isValid: false, message: 'Coupon code can only contain uppercase letters, numbers, hyphens, and underscores' };
        }

        return { isValid: true, message: '' };
    }
}

// Make Validators available globally
window.Validators = Validators;

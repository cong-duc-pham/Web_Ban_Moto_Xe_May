/**
 * Account Profile Management
 * Handles profile viewing, editing, and updating
 */

class AccountProfile {
    constructor() {
        this.viewMode = document.getElementById('viewMode');
        this.editForm = document.getElementById('editForm');
        this.editProfileForm = document.getElementById('editProfileForm');
        this.successMessage = document.getElementById('successMessage');
        this.init();
    }

    init() {
        if (this.editProfileForm) {
            this.editProfileForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    /**
     * Toggle between view mode and edit mode
     */
    toggleEditMode() {
        if (!this.viewMode || !this.editForm) return;

        this.viewMode.classList.toggle('hidden');
        this.editForm.classList.toggle('active');

        // Focus vào field đầu tiên khi vào edit mode
        if (this.editForm.classList.contains('active')) {
            const fullNameInput = document.getElementById('fullName');
            if (fullNameInput) {
                fullNameInput.focus();
            }
        }
    }

    /**
     * Handle form submission
     */
    async handleFormSubmit(e) {
        e.preventDefault();

        const fullName = this.getFieldValue('fullName');
        const email = this.getFieldValue('email');
        const password = this.getFieldValue('password');
        const confirmPassword = this.getFieldValue('confirmPassword');
        const userId = parseInt(this.getFieldValue('userId'));

        // Validation
        if (!this.validateForm(fullName, email, password, confirmPassword)) {
            return;
        }

        await this.submitForm(userId, fullName, email, password);
    }

    /**
     * Get field value by ID
     */
    getFieldValue(fieldId) {
        const field = document.getElementById(fieldId);
        return field ? field.value.trim() : '';
    }

    /**
     * Validate form inputs
     */
    validateForm(fullName, email, password, confirmPassword) {
        if (!fullName || fullName.length < 3) {
            this.showAlert('Họ và tên phải có ít nhất 3 ký tự', 'error');
            return false;
        }

        if (email && !this.isValidEmail(email)) {
            this.showAlert('Email không hợp lệ', 'error');
            return false;
        }

        if (password && password.length < 6) {
            this.showAlert('Mật khẩu phải có ít nhất 6 ký tự', 'error');
            return false;
        }

        if (password && password !== confirmPassword) {
            this.showAlert('Mật khẩu xác nhận không khớp', 'error');
            return false;
        }

        return true;
    }

    /**
     * Submit form to server
     */
    async submitForm(userId, fullName, email, password) {
        const submitBtn = document.getElementById('submitBtn');
        if (!submitBtn) return;

        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang lưu...';

        try {
            const response = await fetch('/Account/UpdateProfile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    fullName: fullName,
                    phoneNumber: this.getFieldValue('phoneNumber'),
                    email: email || null,
                    password: password || null
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                this.showSuccessMessage(result.message);
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                this.showAlert(`Lỗi: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showAlert(`Có lỗi xảy ra: ${error.message}`, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Show success message
     */
    showSuccessMessage(message) {
        if (!this.successMessage) return;

        const successText = document.getElementById('successText');
        if (successText) {
            successText.textContent = message;
        }

        this.successMessage.classList.add('show');

        setTimeout(() => {
            this.successMessage.classList.remove('show');
        }, 5000);
    }

    /**
     * Show alert message (fallback for browsers without SweetAlert2)
     */
    showAlert(message, type = 'info') {
        // Sử dụng SweetAlert2 nếu có
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: type === 'error' ? 'error' : 'info',
                title: type === 'error' ? 'Lỗi' : 'Thông báo',
                text: message,
                confirmButtonText: 'OK'
            });
        } else {
            // Fallback to alert
            alert(message);
        }
    }
}

// Initialize khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', function() {
    window.accountProfile = new AccountProfile();
});
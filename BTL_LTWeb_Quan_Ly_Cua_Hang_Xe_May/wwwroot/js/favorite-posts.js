/**
 * Favorite Posts Management
 * Handles displaying, filtering, and managing favorite vehicle posts
 */

class FavoritePostsManager {
    constructor() {
        this.favorites = [];
        this.filteredFavorites = [];
        this.currentSort = 'newest';
        this.currentSearch = '';

        this.initializeElements();
        this.attachEventListeners();
        this.loadFavorites();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.loadingState = document.getElementById('loadingState');
        this.emptyState = document.getElementById('emptyState');
        this.favoritesGrid = document.getElementById('favoritesGrid');
        this.searchInput = document.getElementById('searchInput');
        this.sortSelect = document.getElementById('sortSelect');
        this.favoriteCount = document.getElementById('favoriteCount');

        console.log('🔧 Elements initialized:', {
            loadingState: !!this.loadingState,
            emptyState: !!this.emptyState,
            favoritesGrid: !!this.favoritesGrid,
            searchInput: !!this.searchInput,
            sortSelect: !!this.sortSelect,
            favoriteCount: !!this.favoriteCount
        });
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        }

        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', (e) => this.handleSort(e));
        }
    }

    /**
     * Load favorites from API
     */
    async loadFavorites() {
        try {
            console.log('📡 Loading favorites...');
            this.showLoading(true);

            const response = await fetch('/Account/GetUserFavorites', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('📡 API Response:', result);

            if (result.success) {
                this.favorites = result.data || [];
                this.filteredFavorites = [...this.favorites];

                console.log(`✅ Loaded ${this.favorites.length} favorites`);

                this.updateDisplay();
            } else {
                console.error('❌ API returned error:', result.message);
                this.showError(result.message || 'Lỗi khi tải dữ liệu');
            }
        } catch (error) {
            console.error('❌ Error loading favorites:', error);
            this.showError('Có lỗi xảy ra khi tải dữ liệu yêu thích');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Handle search functionality
     */
    handleSearch(event) {
        this.currentSearch = event.target.value.toLowerCase().trim();
        console.log('🔍 Search:', this.currentSearch);
        this.applyFilters();
    }

    /**
     * Handle sort functionality
     */
    handleSort(event) {
        this.currentSort = event.target.value;
        console.log('🔄 Sort:', this.currentSort);
        this.applyFilters();
    }

    /**
     * Apply filters and sorting
     */
    applyFilters() {
        // Start with all favorites
        this.filteredFavorites = [...this.favorites];

        // Apply search filter
        if (this.currentSearch) {
            this.filteredFavorites = this.filteredFavorites.filter(fav =>
                (fav.title && fav.title.toLowerCase().includes(this.currentSearch)) ||
                (fav.brand && fav.brand.toLowerCase().includes(this.currentSearch)) ||
                (fav.category && fav.category.toLowerCase().includes(this.currentSearch)) ||
                (fav.model && fav.model.toLowerCase().includes(this.currentSearch))
            );
        }

        // Apply sorting
        this.applySorting();

        console.log(`📊 Filtered: ${this.filteredFavorites.length} / ${this.favorites.length}`);

        // Update display
        this.updateDisplay();
    }

    /**
     * Apply sorting to filtered list
     */
    applySorting() {
        switch (this.currentSort) {
            case 'newest':
                this.filteredFavorites.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                break;
            case 'oldest':
                this.filteredFavorites.sort((a, b) =>
                    new Date(a.createdAt) - new Date(b.createdAt)
                );
                break;
            case 'price-low':
                this.filteredFavorites.sort((a, b) =>
                    (a.salePrice || 0) - (b.salePrice || 0)
                );
                break;
            case 'price-high':
                this.filteredFavorites.sort((a, b) =>
                    (b.salePrice || 0) - (a.salePrice || 0)
                );
                break;
            default:
                break;
        }
    }

    /**
     * Update display based on current state
     */
    updateDisplay() {
        // Update favorite count
        if (this.favoriteCount) {
            this.favoriteCount.textContent = this.favorites.length;
        }

        console.log('🎨 Updating display, filtered items:', this.filteredFavorites.length);

        if (this.filteredFavorites.length === 0) {
            this.showEmptyState();
        } else {
            this.renderCards();
        }
    }

    /**
     * Render favorite cards
     */
    renderCards() {
        if (!this.favoritesGrid) {
            console.error('❌ favoritesGrid element not found!');
            return;
        }

        console.log('🎨 Rendering cards...');

        // Show grid, hide others
        this.favoritesGrid.style.display = 'grid';
        if (this.emptyState) this.emptyState.style.display = 'none';
        if (this.loadingState) this.loadingState.style.display = 'none';

        // Clear existing content
        this.favoritesGrid.innerHTML = '';

        // Render each card
        this.filteredFavorites.forEach((fav, index) => {
            console.log(`🎨 Rendering card ${index + 1}:`, fav.title);
            const card = this.createCard(fav);
            this.favoritesGrid.appendChild(card);
        });

        console.log(`✅ Rendered ${this.filteredFavorites.length} cards`);
    }

    /**
     * Create a favorite card element
     */
    createCard(fav) {
        const card = document.createElement('div');
        card.className = 'favorite-card';
        card.setAttribute('data-vehicle-id', fav.vehicleId);

        const formattedPrice = this.formatPrice(fav.salePrice);
        const formattedOriginalPrice = fav.originalPrice ? this.formatPrice(fav.originalPrice) : null;
        const statusBadge = this.getStatusBadge(fav.status);
        const conditionBadge = this.getConditionBadge(fav.condition);
        const dateAdded = this.formatDate(fav.createdAt);

        // Build meta items
        let metaHTML = '';
        if (fav.brand) metaHTML += `<div class="meta-item"><i class="fas fa-tag"></i>${this.escapeHtml(fav.brand)}</div>`;
        if (fav.category) metaHTML += `<div class="meta-item"><i class="fas fa-folder"></i>${this.escapeHtml(fav.category)}</div>`;
        if (fav.model) metaHTML += `<div class="meta-item"><i class="fas fa-car"></i>${this.escapeHtml(fav.model)}</div>`;

        // Build store info
        let storeHTML = '';
        if (fav.store || fav.storeAddress) {
            storeHTML = `
                <div class="favorite-card-store" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                    ${fav.store ? `<div class="meta-item"><i class="fas fa-store"></i>${this.escapeHtml(fav.store)}</div>` : ''}
                    ${fav.storeAddress ? `<div class="meta-item"><i class="fas fa-map-marker-alt"></i>${this.escapeHtml(fav.storeAddress)}</div>` : ''}
                </div>
            `;
        }

        // Build price info
        let priceInfoHTML = '';
        if (formattedOriginalPrice && fav.originalPrice > fav.salePrice) {
            const discount = Math.round(((fav.originalPrice - fav.salePrice) / fav.originalPrice) * 100);
            priceInfoHTML = `
                <div class="price-info" style="display: flex; gap: 8px; align-items: center; margin-top: 4px;">
                    <span class="original-price" style="text-decoration: line-through; color: #9ca3af; font-size: 0.875rem;">${formattedOriginalPrice}</span>
                    <span class="discount-badge" style="background: #ef4444; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">-${discount}%</span>
                </div>
            `;
        }

        // Build stock info
        let stockHTML = '';
        if (fav.stockQuantity !== undefined || fav.soldCount !== undefined) {
            stockHTML = `
                <div class="favorite-card-stock" style="display: flex; gap: 12px; margin-top: 8px; font-size: 0.875rem; color: #6b7280;">
                    ${fav.stockQuantity !== undefined ? `<span><i class="fas fa-box"></i> Còn: ${fav.stockQuantity}</span>` : ''}
                    ${fav.soldCount !== undefined ? `<span><i class="fas fa-shopping-cart"></i> Đã bán: ${fav.soldCount}</span>` : ''}
                </div>
            `;
        }

        card.innerHTML = `
            <!-- Image Section -->
            <div class="favorite-card-image" onclick="window.favoriteManager.viewVehicle(${fav.vehicleId})" style="cursor: pointer;">
                <img src="${this.escapeHtml(fav.primaryImage)}" alt="${this.escapeHtml(fav.title)}" onerror="this.src='/images/default-vehicle.jpg'">
                
                <div class="favorite-card-badges">
                    ${statusBadge}
                    ${conditionBadge}
                </div>
            </div>

            <!-- Content Section -->
            <div class="favorite-card-content">
                <h3 class="favorite-card-title" onclick="window.favoriteManager.viewVehicle(${fav.vehicleId})" style="cursor: pointer;">
                    ${this.escapeHtml(fav.title)}
                </h3>
                
                ${metaHTML ? `<div class="favorite-card-meta">${metaHTML}</div>` : ''}

                <div class="favorite-card-price">${formattedPrice}</div>
                
                ${priceInfoHTML}
                
                ${stockHTML}
                
                ${storeHTML}

                <small style="color: #9ca3af; display: block; margin-top: 8px;">
                    <i class="fas fa-clock"></i> Thêm vào ${dateAdded}
                </small>
            </div>

            <!-- Action Buttons -->
            <div class="favorite-card-actions">
                <button class="btn btn-primary" onclick="window.favoriteManager.viewVehicle(${fav.vehicleId})">
                    <i class="fas fa-eye"></i> Xem chi tiết
                </button>
                <button class="btn btn-danger" onclick="window.favoriteManager.removeFavorite(${fav.vehicleId}, this)">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            </div>
        `;

        return card;
    }

    /**
     * Get status badge HTML
     */
    getStatusBadge(status) {
        if (!status) return '';

        const statusMap = {
            'Available': { text: 'Còn hàng', class: 'badge-success' },
            'Pending': { text: 'Chờ xác nhận', class: 'badge-warning' },
            'Sold': { text: 'Đã bán', class: 'badge-danger' },
            'SoldOut': { text: 'Hết hàng', class: 'badge-danger' },
            'Inactive': { text: 'Không hoạt động', class: 'badge-secondary' }
        };

        const statusInfo = statusMap[status] || { text: status, class: 'badge-secondary' };
        return `<span class="badge ${statusInfo.class}">${this.escapeHtml(statusInfo.text)}</span>`;
    }

    /**
     * Get condition badge HTML
     */
    getConditionBadge(condition) {
        if (!condition) return '';

        const conditionMap = {
            'Mới': { text: 'Mới', class: 'badge-primary' },
            'New': { text: 'Mới', class: 'badge-primary' },
            'Đã sử dụng': { text: 'Đã sử dụng', class: 'badge-info' },
            'Used': { text: 'Đã sử dụng', class: 'badge-info' },
            'Like New': { text: 'Như mới', class: 'badge-success' },
            'Good': { text: 'Tốt', class: 'badge-success' }
        };

        const conditionInfo = conditionMap[condition] || { text: condition, class: 'badge-info' };
        return `<span class="badge ${conditionInfo.class}">${this.escapeHtml(conditionInfo.text)}</span>`;
    }

    /**
     * Format price to Vietnamese Dong
     */
    formatPrice(price) {
        if (!price || isNaN(price)) return '0 đ';
        try {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(price);
        } catch (e) {
            return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ';
        }
    }

    /**
     * Format date to Vietnamese format
     */
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Chưa xác định';
            }

            const now = new Date();
            const diff = now - date;
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (seconds < 60) return `${seconds} giây trước`;
            if (minutes < 60) return `${minutes} phút trước`;
            if (hours < 24) return `${hours} giờ trước`;
            if (days < 7) return `${days} ngày trước`;

            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            return date.toLocaleDateString('vi-VN', options);
        } catch (e) {
            return 'Chưa xác định';
        }
    }

    /**
     * Escape HTML special characters
     */
    escapeHtml(text) {
        if (!text) return '';
        if (typeof text !== 'string') return text;

        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Show loading state
     */
    showLoading(show) {
        if (!this.loadingState) return;

        if (show) {
            this.loadingState.style.display = 'flex';
            if (this.favoritesGrid) this.favoritesGrid.style.display = 'none';
            if (this.emptyState) this.emptyState.style.display = 'none';
        } else {
            this.loadingState.style.display = 'none';
        }
    }

    /**
     * Show empty state
     */
    showEmptyState() {
        if (!this.emptyState) return;

        console.log('📭 Showing empty state');

        this.emptyState.style.display = 'flex';

        if (this.favoritesGrid) {
            this.favoritesGrid.style.display = 'none';
        }

        // Update empty state message based on search
        const emptyTitle = this.emptyState.querySelector('h3');
        const emptyText = this.emptyState.querySelector('p');

        if (this.currentSearch) {
            if (emptyTitle) emptyTitle.textContent = 'Không tìm thấy kết quả';
            if (emptyText) emptyText.textContent = `Không có bài đăng nào phù hợp với "${this.escapeHtml(this.currentSearch)}". Thử tìm kiếm với từ khóa khác.`;
        } else {
            if (emptyTitle) emptyTitle.textContent = 'Chưa có bài đăng yêu thích';
            if (emptyText) emptyText.textContent = 'Bạn chưa thêm bài đăng nào vào yêu thích. Hãy duyệt qua các bài đăng và thêm chúng vào danh sách yêu thích của bạn.';
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        if (!this.emptyState) return;

        this.emptyState.style.display = 'flex';
        if (this.favoritesGrid) this.favoritesGrid.style.display = 'none';

        const emptyIcon = this.emptyState.querySelector('.empty-icon');
        const emptyTitle = this.emptyState.querySelector('h3');
        const emptyText = this.emptyState.querySelector('p');

        if (emptyIcon) {
            emptyIcon.innerHTML = '<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i>';
        }
        if (emptyTitle) emptyTitle.textContent = 'Lỗi khi tải dữ liệu';
        if (emptyText) emptyText.textContent = message || 'Có lỗi xảy ra, vui lòng thử lại sau.';
    }

    /**
     * Remove favorite post
     */
    async removeFavorite(vehicleId, buttonElement) {
        // Use SweetAlert2 if available, otherwise use confirm
        let confirmResult = false;

        if (typeof Swal !== 'undefined') {
            const result = await Swal.fire({
                title: 'Xác nhận xóa',
                text: 'Bạn có chắc chắn muốn xóa bài đăng này khỏi danh sách yêu thích?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: '<i class="fas fa-trash"></i> Xóa',
                cancelButtonText: '<i class="fas fa-times"></i> Hủy',
                reverseButtons: true
            });
            confirmResult = result.isConfirmed;
        } else {
            confirmResult = confirm('Bạn có chắc chắn muốn xóa bài đăng này khỏi danh sách yêu thích?');
        }

        if (!confirmResult) return;

        try {
            const button = buttonElement;
            const originalHTML = button.innerHTML;
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang xóa...';

            console.log('🗑️ Removing favorite:', vehicleId);

            const response = await fetch('/Account/RemoveFavorite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `vehicleId=${encodeURIComponent(vehicleId)}`
            });

            const result = await response.json();
            console.log('🗑️ Remove response:', result);

            if (result.success) {
                // Remove from local array
                this.favorites = this.favorites.filter(fav => fav.vehicleId !== vehicleId);
                this.applyFilters();

                // Show success message
                this.showToast('Đã xóa khỏi yêu thích', 'success');
            } else {
                this.showToast(result.message || 'Lỗi khi xóa', 'error');
                // Restore button
                button.disabled = false;
                button.innerHTML = originalHTML;
            }
        } catch (error) {
            console.error('❌ Error removing favorite:', error);
            this.showToast('Có lỗi xảy ra khi xóa', 'error');
            // Restore button
            if (buttonElement) {
                buttonElement.disabled = false;
                buttonElement.innerHTML = '<i class="fas fa-trash"></i> Xóa';
            }
        }
    }

    /**
     * View vehicle details
     */
    viewVehicle(vehicleId) {
        console.log(' Viewing vehicle:', vehicleId);
        window.location.href = `/Home/VehicleDetail/${vehicleId}`;
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // Use SweetAlert2 Toast if available
        if (typeof Swal !== 'undefined') {
            Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            }).fire({
                icon: type === 'error' ? 'error' : 'success',
                title: message
            });
            return;
        }

        // Fallback to custom toast
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${this.escapeHtml(message)}</span>
            </div>
        `;

        // Add styles if not already in CSS
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast-notification {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    padding: 16px 24px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 9999;
                    animation: slideInRight 0.3s ease-out;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .toast-notification.toast-success {
                    border-left: 4px solid #10b981;
                }

                .toast-notification.toast-success i {
                    color: #10b981;
                }

                .toast-notification.toast-error {
                    border-left: 4px solid #ef4444;
                }

                .toast-notification.toast-error i {
                    color: #ef4444;
                }

                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes slideOutRight {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Favorite Posts Manager...');
    window.favoriteManager = new FavoritePostsManager();
    console.log('✅ Favorite Posts Manager initialized');
});
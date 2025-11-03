// ==================== UTILITY FUNCTIONS ====================

/**
 * Format giá tiền
 * @param {string|number} price - Giá cần format
 * @returns {string} - Giá đã format kèm đơn vị
 */
function formatPrice(price) {
    const numPrice = typeof price === 'string'
        ? price.replace(/\./g, '')
        : price.toString();

    const formatted = numPrice.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formatted} đ`;
}

/**
 * Escape HTML để tránh XSS
 * @param {string} text - Text cần escape
 * @returns {string} - Text đã escape
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== MODAL STATE ====================
let modalState = {
    isOpen: false,
    liked: false,
    likeCount: 0,
    commentCount: 0,
    triggerElement: null,
    focusableElements: [],
    firstFocusable: null,
    lastFocusable: null
};

// ==================== MODAL FUNCTIONS ====================

/**
 * Build modal HTML từ activity data
 * @param {Object} activity - Activity data
 * @returns {string} - HTML string
 */
function buildModalHTML(activity) {
    // Build meta string (ẩn dấu • nếu không có location)
    const metaParts = [activity.time];
    if (activity.location) {
        metaParts.push(activity.location);
    }
    const metaString = metaParts.join(' • ');

    // Build verified badge (chỉ hiện khi verified === true)
    const verifiedBadge = activity.verified
        ? '<i class="fas fa-check-circle activity-modal__verified" title="Verified" aria-label="Verified store"></i>'
        : '';

    // Build images grid (1 ảnh → 1 cột, ≥2 ảnh → 2 cột)
    const imageGridClass = activity.images.length === 1 ? 'single-image' : 'multi-images';
    const imagesHTML = activity.images.map((img, index) =>
        `<img src="${img}" alt="Post image ${index + 1}" class="activity-modal__image" loading="lazy">`
    ).join('');

    // Build product section (nếu có)
    const productHTML = activity.product ? `
                <div class="activity-modal__product" role="button" tabindex="0">
                    <img src="${activity.product.image}" 
                         alt="${escapeHtml(activity.product.name)}" 
                         class="activity-modal__product-image">
                    <div class="activity-modal__product-info">
                        <div class="activity-modal__product-name">${escapeHtml(activity.product.name)}</div>
                        <div class="activity-modal__product-price">${formatPrice(activity.product.price)}</div>
                    </div>
                </div>
            ` : '';

    return `
                <div class="activity-modal__overlay" data-close-modal></div>
                <div class="activity-modal__content" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                    <button class="activity-modal__close" data-close-modal aria-label="Đóng modal">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <div class="activity-modal__header">
                        <img src="${activity.avatar}" 
                             alt="${escapeHtml(activity.storeName)}" 
                             class="activity-modal__avatar">
                        <div class="activity-modal__store-info">
                            <div class="activity-modal__store-name" id="modal-title">
                                <span>${escapeHtml(activity.storeName)}</span>
                                ${verifiedBadge}
                            </div>
                            <div class="activity-modal__meta">
                                <i class="fas fa-clock" style="font-size: 12px; margin-right: 4px;"></i>
                                ${escapeHtml(metaString)}
                            </div>
                        </div>
                    </div>
                    
                    <div class="activity-modal__body">
                        <div class="activity-modal__text">${escapeHtml(activity.text)}</div>
                        
                        <div class="activity-modal__images ${imageGridClass}">
                            ${imagesHTML}
                        </div>
                        
                        ${productHTML}
                        
                        <div class="activity-modal__actions">
                            <button class="activity-modal__action-btn" data-action="like" aria-pressed="false" aria-label="Thích bài viết">
                                <i class="far fa-thumbs-up"></i>
                                <span data-like-count>${activity.likes}</span>
                            </button>
                            <button class="activity-modal__action-btn" data-action="comment" aria-label="Bình luận">
                                <i class="far fa-comment"></i>
                                <span>${activity.comments} Bình luận</span>
                            </button>
                        </div>
                        
                        <div class="activity-modal__comments">
                            <div class="activity-modal__comment-input-wrapper">
                                <img src="https://ui-avatars.com/api/?name=U&background=gray&size=36" 
                                     alt="Your avatar" 
                                     class="activity-modal__comment-avatar">
                                <form class="activity-modal__comment-form" data-comment-form>
                                    <textarea 
                                        class="activity-modal__comment-input" 
                                        placeholder="Viết bình luận (tối đa 1000 ký tự)..."
                                        maxlength="1000"
                                        rows="1"
                                        data-comment-input
                                        aria-label="Viết bình luận"></textarea>
                                    <button 
                                        type="submit" 
                                        class="activity-modal__comment-submit"
                                        disabled
                                        aria-label="Gửi bình luận">
                                        <i class="far fa-paper-plane"></i>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            `;
}

/**
 * Setup focus trap trong modal
 */
function setupFocusTrap() {
    const modal = document.getElementById('activityModal');
    const focusableSelectors = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    modalState.focusableElements = modal.querySelectorAll(focusableSelectors);
    modalState.firstFocusable = modalState.focusableElements[0];
    modalState.lastFocusable = modalState.focusableElements[modalState.focusableElements.length - 1];

    // Focus first element (close button)
    if (modalState.firstFocusable) {
        setTimeout(() => modalState.firstFocusable.focus(), 100);
    }
}

/**
 * Handle focus trap
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleFocusTrap(e) {
    if (!modalState.isOpen || e.key !== 'Tab') return;

    if (e.shiftKey) {
        // Shift + Tab: nếu đang ở element đầu, jump xuống cuối
        if (document.activeElement === modalState.firstFocusable) {
            e.preventDefault();
            modalState.lastFocusable.focus();
        }
    } else {
        // Tab: nếu đang ở element cuối, jump lên đầu
        if (document.activeElement === modalState.lastFocusable) {
            e.preventDefault();
            modalState.firstFocusable.focus();
        }
    }
}

/**
 * Mở modal
 * @param {Object} activity - Activity data
 */
function openActivityModal(activity) {
    const modal = document.getElementById('activityModal');

    // Save trigger element để restore focus sau khi đóng
    modalState.triggerElement = document.activeElement;

    // Build and insert HTML
    modal.innerHTML = buildModalHTML(activity);

    // Initialize state
    modalState.isOpen = true;
    modalState.liked = false;
    modalState.likeCount = activity.likes;
    modalState.commentCount = activity.comments;

    // Show modal
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    // Lock body scroll
    document.body.style.overflow = 'hidden';

    // Setup event listeners
    setupModalEventListeners();

    // Setup focus trap
    setupFocusTrap();

    // Setup keyboard listeners
    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('keydown', handleFocusTrap);
}

/**
 * Đóng modal
 */
function closeActivityModal() {
    const modal = document.getElementById('activityModal');

    // Hide modal
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');

    // Unlock body scroll
    document.body.style.overflow = '';

    // Update state
    modalState.isOpen = false;

    // Return focus to trigger element
    if (modalState.triggerElement) {
        modalState.triggerElement.focus();
    }

    // Remove keyboard listeners
    document.removeEventListener('keydown', handleEscapeKey);
    document.removeEventListener('keydown', handleFocusTrap);

    // Clear modal content sau animation
    setTimeout(() => {
        modal.innerHTML = '';
    }, 300);
}

/**
 * Handle Escape key
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleEscapeKey(e) {
    if (e.key === 'Escape' && modalState.isOpen) {
        closeActivityModal();
    }
}

/**
 * Toggle like
 */
function toggleLike() {
    const likeBtn = document.querySelector('[data-action="like"]');
    const likeCountEl = document.querySelector('[data-like-count]');
    const icon = likeBtn.querySelector('i');

    modalState.liked = !modalState.liked;

    if (modalState.liked) {
        // Liked: tăng count, đổi icon thành solid, đổi màu
        modalState.likeCount = Math.max(0, modalState.likeCount + 1);
        likeBtn.classList.add('liked');
        icon.classList.remove('far');
        icon.classList.add('fas');
        likeBtn.setAttribute('aria-pressed', 'true');
    } else {
        // Unliked: giảm count (không âm), đổi icon thành regular
        modalState.likeCount = Math.max(0, modalState.likeCount - 1);
        likeBtn.classList.remove('liked');
        icon.classList.remove('fas');
        icon.classList.add('far');
        likeBtn.setAttribute('aria-pressed', 'false');
    }

    likeCountEl.textContent = modalState.likeCount;
}

/**
 * Handle comment submit
 * @param {Event} e - Form submit event
 */
function handleCommentSubmit(e) {
    e.preventDefault();

    const input = document.querySelector('[data-comment-input]');
    const text = input.value.trim();

    if (text) {
        // Alert nội dung (trong production sẽ gửi lên server)
        alert(`Bình luận: "${text}"`);

        // Xóa input
        input.value = '';

        // Disable submit button
        const submitBtn = document.querySelector('.activity-modal__comment-submit');
        submitBtn.disabled = true;

        // Reset textarea height
        input.style.height = 'auto';
    }
}

/**
 * Auto-resize textarea khi nhập
 * @param {HTMLTextAreaElement} textarea - Textarea element
 */
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';

    // Enable/disable submit button dựa vào có text hay không
    const submitBtn = document.querySelector('.activity-modal__comment-submit');
    submitBtn.disabled = !textarea.value.trim();
}

/**
 * Setup modal event listeners
 */
function setupModalEventListeners() {
    const modal = document.getElementById('activityModal');

    // Close buttons (overlay + X button)
    modal.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', closeActivityModal);
    });

    // Like button
    const likeBtn = modal.querySelector('[data-action="like"]');
    if (likeBtn) {
        likeBtn.addEventListener('click', toggleLike);
    }

    // Comment form
    const commentForm = modal.querySelector('[data-comment-form]');
    if (commentForm) {
        commentForm.addEventListener('submit', handleCommentSubmit);
    }

    // Comment input auto-resize
    const commentInput = modal.querySelector('[data-comment-input]');
    if (commentInput) {
        commentInput.addEventListener('input', function () {
            autoResizeTextarea(this);
        });

        // Handle Enter key (submit) vs Shift+Enter (new line)
        commentInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (this.value.trim()) {
                    commentForm.dispatchEvent(new Event('submit'));
                }
            }
        });
    }
}

/**
 * Initialize activity modal
 */
function initActivityModal() {
    // Add click listener to all activity cards
    document.querySelectorAll('.activity-card').forEach(card => {
        card.addEventListener('click', function () {
            const activityId = this.dataset.activityId;
            // Trong production: fetch data by ID từ API
            // Demo: dùng static data
            openActivityModal(activityData);
        });

        // Keyboard support (Enter/Space)
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    console.log('✅ Activity modal initialized');
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function () {
    initActivityModal();
    console.log('📱 Page loaded. Click the activity card to open modal.');
});

console.log('🚀 XeThanhLy.js đã được load thành công!');

const activityData = {
    storeName: 'Cầm Đồ Q8 - Thanh Lý & Trao Đổi Xe Máy Cũ',
    verified: true,
    avatar: 'https://ui-avatars.com/api/?name=CD&background=random&size=48',
    time: '9 giờ trước',
    location: 'Quận 8, Tp Hồ Chí Minh',
    text: '1 nhất 📌 cho e zai nhanh lẹ',
    images: [
        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1568772684723-dc07fcb3e9c0?w=600&h=600&fit=crop'
    ],
    likes: 2,
    comments: 0,
    product: {
        name: 'Cầm đồ thanh lý Honda Air Blade 2023 4Valve',
        price: 22900000,
        image: 'https://images.unsplash.com/photo-1568772684723-dc07fcb3e9c0?w=400&h=300&fit=crop'
    }
};

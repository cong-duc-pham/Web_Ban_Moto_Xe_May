// ==================== UTILITY FUNCTIONS ====================
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ';
}

function createStars(rating) {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    return '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
// ==================== ACTIVITY MODAL FUNCTIONS ====================
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

function buildModalHTML(activity) {
    const metaParts = [activity.time];
    if (activity.location) {
        metaParts.push(activity.location);
    }
    const metaString = metaParts.join(' • ');

    const verifiedBadge = activity.verified
        ? '<i class="fas fa-check-circle activity-modal__verified" title="Verified" aria-label="Verified store"></i>'
        : '';

    const imageGridClass = activity.images.length === 1 ? 'single-image' : 'multi-images';
    const imagesHTML = activity.images.map((img, index) =>
        `<img src="${img}" alt="Post image ${index + 1}" class="activity-modal__image" loading="lazy">`
    ).join('');

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

function setupFocusTrap() {
    const modal = document.getElementById('activityModal');
    const focusableSelectors = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    modalState.focusableElements = modal.querySelectorAll(focusableSelectors);
    modalState.firstFocusable = modalState.focusableElements[0];
    modalState.lastFocusable = modalState.focusableElements[modalState.focusableElements.length - 1];

    if (modalState.firstFocusable) {
        setTimeout(() => modalState.firstFocusable.focus(), 100);
    }
}

function handleFocusTrap(e) {
    if (!modalState.isOpen || e.key !== 'Tab') return;

    if (e.shiftKey) {
        if (document.activeElement === modalState.firstFocusable) {
            e.preventDefault();
            modalState.lastFocusable.focus();
        }
    } else {
        if (document.activeElement === modalState.lastFocusable) {
            e.preventDefault();
            modalState.firstFocusable.focus();
        }
    }
}

function openActivityModal(activity) {
    const modal = document.getElementById('activityModal');

    modalState.triggerElement = document.activeElement;

    modal.innerHTML = buildModalHTML(activity);

    modalState.isOpen = true;
    modalState.liked = false;
    modalState.likeCount = activity.likes;
    modalState.commentCount = activity.comments;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    document.body.style.overflow = 'hidden';

    setupModalEventListeners();
    setupFocusTrap();

    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('keydown', handleFocusTrap);
}

function closeActivityModal() {
    const modal = document.getElementById('activityModal');

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');

    document.body.style.overflow = '';

    modalState.isOpen = false;

    if (modalState.triggerElement) {
        modalState.triggerElement.focus();
    }

    document.removeEventListener('keydown', handleEscapeKey);
    document.removeEventListener('keydown', handleFocusTrap);

    setTimeout(() => {
        modal.innerHTML = '';
    }, 300);
}

function handleEscapeKey(e) {
    if (e.key === 'Escape' && modalState.isOpen) {
        closeActivityModal();
    }
}

function toggleLike() {
    const likeBtn = document.querySelector('[data-action="like"]');
    const likeCountEl = document.querySelector('[data-like-count]');
    const icon = likeBtn.querySelector('i');

    modalState.liked = !modalState.liked;

    if (modalState.liked) {
        modalState.likeCount = Math.max(0, modalState.likeCount + 1);
        likeBtn.classList.add('liked');
        icon.classList.remove('far');
        icon.classList.add('fas');
        likeBtn.setAttribute('aria-pressed', 'true');
    } else {
        modalState.likeCount = Math.max(0, modalState.likeCount - 1);
        likeBtn.classList.remove('liked');
        icon.classList.remove('fas');
        icon.classList.add('far');
        likeBtn.setAttribute('aria-pressed', 'false');
    }

    likeCountEl.textContent = modalState.likeCount;
}

function handleCommentSubmit(e) {
    e.preventDefault();

    const input = document.querySelector('[data-comment-input]');
    const text = input.value.trim();

    if (text) {
        alert(`Bình luận: "${text}"`);

        input.value = '';

        const submitBtn = document.querySelector('.activity-modal__comment-submit');
        submitBtn.disabled = true;

        input.style.height = 'auto';
    }
}

function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';

    const submitBtn = document.querySelector('.activity-modal__comment-submit');
    submitBtn.disabled = !textarea.value.trim();
}

function setupModalEventListeners() {
    const modal = document.getElementById('activityModal');

    modal.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', closeActivityModal);
    });

    const likeBtn = modal.querySelector('[data-action="like"]');
    if (likeBtn) {
        likeBtn.addEventListener('click', toggleLike);
    }

    const commentForm = modal.querySelector('[data-comment-form]');
    if (commentForm) {
        commentForm.addEventListener('submit', handleCommentSubmit);
    }

    const commentInput = modal.querySelector('[data-comment-input]');
    if (commentInput) {
        commentInput.addEventListener('input', function () {
            autoResizeTextarea(this);
        });

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

function initActivityModal() {
    document.addEventListener('click', function (e) {
        const activityCard = e.target.closest('.activity-card');
        if (activityCard) {
            const activityId = parseInt(activityCard.dataset.activityId);
            const activity = mockData.activities.find(a => a.id === activityId);
            if (activity) {
                openActivityModal(activity);
            }
        }
    });

    document.addEventListener('keydown', function (e) {
        const activityCard = e.target.closest('.activity-card');
        if (activityCard && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            activityCard.click();
        }
    });
}

// ==================== CAROUSEL FUNCTIONALITY ====================
function initCarousels() {
    const carousels = document.querySelectorAll('.carousel-wrapper');

    carousels.forEach(carousel => {
        let isDown = false;
        let startX;
        let scrollLeft;

        carousel.addEventListener('mousedown', (e) => {
            isDown = true;
            carousel.style.cursor = 'grabbing';
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
        });

        carousel.addEventListener('mouseleave', () => {
            isDown = false;
            carousel.style.cursor = 'grab';
        });

        carousel.addEventListener('mouseup', () => {
            isDown = false;
            carousel.style.cursor = 'grab';
        });

        carousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carousel.offsetLeft;
            const walk = (x - startX) * 2;
            carousel.scrollLeft = scrollLeft - walk;
        });
    });

    document.querySelectorAll('.carousel-nav').forEach(btn => {
        btn.addEventListener('click', function () {
            const carouselType = this.dataset.carousel;
            let carousel;

            if (carouselType === 'latestListings') {
                carousel = document.getElementById('latestListingsCarousel');
            } else if (carouselType === 'officialStores') {
                carousel = document.getElementById('officialStoresCarousel');
            } else if (carouselType === 'activities') {
                carousel = document.getElementById('activitiesCarousel');
            } else if (carouselType === 'featuredStores') {
                carousel = document.getElementById('featuredStoresCarousel');
            } else if (carouselType === 'qaArticles') {
                carousel = document.getElementById('qaArticlesCarousel');
            }

            if (carousel) {
                const scrollAmount = 320;
                if (this.classList.contains('carousel-nav-prev')) {
                    carousel.scrollLeft -= scrollAmount;
                } else {
                    carousel.scrollLeft += scrollAmount;
                }
            }
        });
    });
}

// ==================== TAB FUNCTIONALITY ====================
function initTabs() {
    document.querySelectorAll('.tab-chip').forEach(tab => {
        tab.addEventListener('click', function () {
            const parent = this.parentElement;
            parent.querySelectorAll('.tab-chip').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// ==================== SEARCH FUNCTIONALITY ====================
function initSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const locationSelect = document.getElementById('locationSelect');
    const vehicleTypeSelect = document.getElementById('vehicleTypeSelect');

    function performSearch() {
        const keyword = searchInput.value.trim();
        const location = locationSelect.value;
        const vehicleType = vehicleTypeSelect.value;

        console.log('Search:', { keyword, location, vehicleType });

        if (keyword) {
            alert(`Tìm kiếm: "${keyword}"\nKhu vực: ${locationSelect.options[locationSelect.selectedIndex].text}\nLoại xe: ${vehicleTypeSelect.options[vehicleTypeSelect.selectedIndex].text}`);
        } else {
            alert('Vui lòng nhập từ khóa tìm kiếm!');
        }
    }

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

// ==================== FAVORITE FUNCTIONALITY ====================
function initFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    document.addEventListener('click', (e) => {
        if (e.target.closest('.product-favorite')) {
            const btn = e.target.closest('.product-favorite');
            const id = btn.dataset.id;
            const icon = btn.querySelector('i');

            if (favorites.includes(id)) {
                favorites.splice(favorites.indexOf(id), 1);
                icon.classList.remove('fas');
                icon.classList.add('far');
                btn.classList.remove('active');
            } else {
                favorites.push(id);
                icon.classList.remove('far');
                icon.classList.add('fas');
                btn.classList.add('active');
            }

            localStorage.setItem('favorites', JSON.stringify(favorites));
        }
    });

    setTimeout(() => {
        favorites.forEach(id => {
            const btn = document.querySelector(`.product-favorite[data-id="${id}"]`);
            if (btn) {
                btn.querySelector('i').classList.remove('far');
                btn.querySelector('i').classList.add('fas');
                btn.classList.add('active');
            }
        });
    }, 100);
}

// ==================== MOBILE MENU ====================
function initMobileMenu() {
    const menuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenu = document.getElementById('closeMobileMenu');

    menuToggle?.addEventListener('click', () => {
        mobileMenu.classList.add('active');
    });

    closeMenu?.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });

    mobileMenu?.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            mobileMenu.classList.remove('active');
        }
    });
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    renderLatestListings();
    renderOfficialStores();
    renderFeaturedStores();
    renderActivities();
    renderQAArticles();
    renderKeywords();

    initCarousels();
    initTabs();
    initSearch();
    initFavorites();
    initMobileMenu();
    initActivityModal(); // ✅ Initialize modal

    console.log('✅ Chợ Tốt Xe loaded with Activity Modal!');
});
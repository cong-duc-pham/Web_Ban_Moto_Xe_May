// ==================== UTILITY FUNCTIONS ====================
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ';
}

// ==================== IMAGE GALLERY ====================
let currentImageIndex = 0;

function initGallery() {
    const mainImage = document.getElementById('mainImage');
    const thumbnailsContainer = document.getElementById('galleryThumbnails');
    const currentImageEl = document.getElementById('currentImage');
    const totalImagesEl = document.getElementById('totalImages');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');

    // Set total images
    totalImagesEl.textContent = productData.images.length;

    // Create thumbnails
    productData.images.forEach((img, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = `gallery-thumbnail ${index === 0 ? 'active' : ''}`;
        thumbnail.innerHTML = `<img src="${img.url}" alt="${img.alt}">`;
        thumbnail.addEventListener('click', () => changeImage(index));
        thumbnailsContainer.appendChild(thumbnail);
    });

    // Navigation
    prevBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex - 1 + productData.images.length) % productData.images.length;
        changeImage(currentImageIndex);
    });

    nextBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex + 1) % productData.images.length;
        changeImage(currentImageIndex);
    });

    function changeImage(index) {
        currentImageIndex = index;
        mainImage.src = productData.images[index].url;
        mainImage.alt = productData.images[index].alt;
        currentImageEl.textContent = index + 1;

        // Update active thumbnail
        document.querySelectorAll('.gallery-thumbnail').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }
}

// ==================== FAVORITE BUTTON ====================
function initFavorite() {
    const favoriteBtn = document.getElementById('favoriteBtn');
    let isFavorite = false;

    favoriteBtn.addEventListener('click', () => {
        isFavorite = !isFavorite;
        favoriteBtn.classList.toggle('active', isFavorite);
        const icon = favoriteBtn.querySelector('i');
        icon.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
    });
}

// ==================== PHONE REVEAL ====================
function initPhoneReveal() {
    const revealBtn = document.getElementById('revealPhoneBtn');
    const phoneNumber = document.getElementById('phoneNumber');
    const callBtn = document.getElementById('callBtn');

    function revealPhone() {
        phoneNumber.textContent = '0933334567';
        revealBtn.style.display = 'none';
        callBtn.innerHTML = '<i class="fas fa-phone me-2"></i>Gọi 0933334567';
    }

    revealBtn.addEventListener('click', revealPhone);
    callBtn.addEventListener('click', () => {
        if (phoneNumber.textContent === '093333****') {
            revealPhone();
        } else {
            window.location.href = 'tel:0933334567';
        }
    });
}

// ==================== MORE OPTIONS MENU ====================
function initMoreMenu() {
    const moreBtn = document.getElementById('moreBtn');
    const shareBtn = document.getElementById('shareBtn');
    const moreMenu = document.getElementById('moreMenu');

    moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = moreBtn.getBoundingClientRect();
        moreMenu.style.top = rect.bottom + 8 + 'px';
        moreMenu.style.right = window.innerWidth - rect.right + 'px';
        moreMenu.classList.toggle('show');
    });

    shareBtn.addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: 'SH 150i 2015 khoá Smarkey BSTP chính chủ',
                url: window.location.href
            });
        } else {
            alert('Đã sao chép liên kết!');
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!moreMenu.contains(e.target) && e.target !== moreBtn) {
            moreMenu.classList.remove('show');
        }
    });

    // Menu items
    moreMenu.querySelectorAll('.dropdown-item-custom').forEach(item => {
        item.addEventListener('click', function () {
            const text = this.textContent.trim();
            if (text.includes('Sao chép')) {
                navigator.clipboard.writeText(window.location.href);
                alert('Đã sao chép liên kết!');
            } else if (text.includes('In')) {
                window.print();
            } else {
                alert('Chức năng đang phát triển');
            }
            moreMenu.classList.remove('show');
        });
    });
}

// ==================== RENDER LISTINGS ====================
function renderSellerListings() {
    const carousel = document.getElementById('sellerListingsCarousel');
    carousel.innerHTML = productData.sellerListings.map(listing => `
        <div class="product-card" style="min-width: 280px;">
            <div class="product-image-container">
                <img src="${listing.image}" alt="${listing.title}" class="product-image" loading="lazy">
                <div class="product-badge">${listing.time}</div>
                <div class="product-badge" style="right: 12px; left: auto; background: rgba(0,0,0,0.7);">
                    <i class="fas fa-camera me-1"></i>${listing.imageCount}
                </div>
                <button class="product-favorite" aria-label="Yêu thích">
                    <i class="far fa-heart"></i>
                </button>
            </div>
            <div class="product-content">
                <h3 class="product-title">${listing.title}</h3>
                <div class="product-price">${formatPrice(listing.price)}</div>
                <div class="product-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${listing.location}
                </div>
            </div>
        </div>
    `).join('');
}

function renderSimilarListings() {
    const grid = document.getElementById('similarListingsGrid');
    grid.innerHTML = productData.similarListings.map(listing => `
        <div class="col-lg-3 col-md-4 col-sm-6">
            <div class="product-card">
                <div class="product-image-container">
                    <img src="${listing.image}" alt="${listing.title}" class="product-image" loading="lazy">
                    <div class="product-badge">${listing.time}</div>
                    <div class="product-badge" style="right: 12px; left: auto; background: rgba(0,0,0,0.7);">
                        <i class="fas fa-camera me-1"></i>${listing.imageCount}
                    </div>
                    <button class="product-favorite" aria-label="Yêu thích">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
                <div class="product-content">
                    <h3 class="product-title">${listing.title}</h3>
                    <div class="product-price">${formatPrice(listing.price)}</div>
                    <div class="product-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${listing.location}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
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

    // Navigation buttons
    document.querySelectorAll('.carousel-nav').forEach(btn => {
        btn.addEventListener('click', function () {
            const carouselType = this.dataset.carousel;
            let carousel;

            if (carouselType === 'sellerListings') {
                carousel = document.getElementById('sellerListingsCarousel');
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

// ==================== FAVORITES IN LISTINGS ====================
function initListingFavorites() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.product-favorite')) {
            const btn = e.target.closest('.product-favorite');
            const icon = btn.querySelector('i');

            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                btn.classList.add('active');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                btn.classList.remove('active');
            }
        }
    });
}

// ==================== TOOLTIPS ====================
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initGallery();
    initFavorite();
    initPhoneReveal();
    initMoreMenu();
    renderSellerListings();
    renderSimilarListings();
    initCarousels();
    initListingFavorites();
    initTooltips();

    console.log('✅ Product detail page loaded successfully!');
});
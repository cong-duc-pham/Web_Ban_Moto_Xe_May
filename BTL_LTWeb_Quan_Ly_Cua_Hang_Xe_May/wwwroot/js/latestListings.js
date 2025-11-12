(function () {
    'use strict';

    var currentSlide = 0;
    var slides = [];
    var cardsPerSlide = 4;

    function formatPriceValue(priceObj) {
        if (priceObj == null) return 'Liên hệ';
        try {
            var n = Number(priceObj);
            if (!Number.isFinite(n)) {
                var s = String(priceObj).trim();
                s = s.replace(/[^\d\.,\-]/g, '');
                var tryParse = function (val, locale) {
                    if (locale === 'vi') val = val.replace(/\./g, '').replace(',', '.');
                    else val = val.replace(/,/g, '');
                    var num = Number(val);
                    return Number.isFinite(num) ? num : null;
                };
                n = tryParse(s, 'vi') ?? tryParse(s, 'en');
                if (!Number.isFinite(n)) return s || 'Liên hệ';
            }
            return n.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' đ';
        } catch (e) {
            return 'Liên hệ';
        }
    }

    function createCardHtml(vehicle) {
        var id = vehicle.vehicleId ?? vehicle.VehicleId ?? vehicle.id ?? 0;
        var title = vehicle.title ?? vehicle.Title ?? 'Không có tên';

        var imagePath = '/images/default-vehicle.jpg';
        try {
            var imgs = vehicle.vehicleImages ?? vehicle.VehicleImages;
            if (Array.isArray(imgs) && imgs.length > 0) {
                var primary = imgs.find(function (x) { return x && (x.isPrimary || x.IsPrimary); });
                imagePath = (primary && (primary.imagePath || primary.ImagePath)) || (imgs[0] && (imgs[0].imagePath || imgs[0].ImagePath)) || imagePath;
            } else if (vehicle.imagePath || vehicle.image) {
                imagePath = vehicle.imagePath ?? vehicle.image;
            }
        } catch (e) { /* ignore */ }

        var price = formatPriceValue(vehicle.salePrice ?? vehicle.SalePrice ?? vehicle.price ?? vehicle.Price);
        var year = vehicle.manufactureYear ?? vehicle.ManufactureYear ?? '';
        var category = (vehicle.category && (vehicle.category.categoryName ?? vehicle.category)) ?? (vehicle.CategoryName ?? vehicle.categoryName ?? '');
        var condition = vehicle.condition ?? vehicle.Condition ?? '';
        var metaParts = [];
        if (year) metaParts.push(year);
        if (category) metaParts.push(category);
        if (condition) metaParts.push(condition);
        var meta = metaParts.join(' • ');

        var location = (vehicle.store && (vehicle.store.address || vehicle.store.Address)) || (vehicle.Store && vehicle.Store.Address) || vehicle.location || 'Chưa có địa chỉ';

        var timeAgo = '';
        try {
            var posted = vehicle.postedAt ?? vehicle.PostedAt;
            if (posted) {
                var d = new Date(posted);
                var diff = Math.floor((Date.now() - d.getTime()) / 1000);
                if (diff < 60) timeAgo = 'Vừa xong';
                else if (diff < 3600) timeAgo = Math.floor(diff / 60) + ' phút trước';
                else if (diff < 86400) timeAgo = Math.floor(diff / 3600) + ' giờ trước';
                else if (diff < 604800) timeAgo = Math.floor(diff / 86400) + ' ngày trước';
                else timeAgo = d.toLocaleDateString('vi-VN');
            }
        } catch (e) { timeAgo = ''; }

        // Grid card format
        return `<div class="col-12 col-sm-6 col-md-4 col-lg-3">
    <div class="card listing-card h-100" data-vehicle-id="${id}">
        <div class="card-img-wrapper position-relative">
            <img src="${escapeHtml(imagePath)}" alt="${escapeHtml(title)}" class="card-img-top listing-image" loading="lazy" />
            ${timeAgo ? `<span class="badge bg-dark text-white position-absolute top-0 start-0 m-2">${escapeHtml(timeAgo)}</span>` : ''}
            <button class="btn btn-light btn-sm position-absolute bottom-0 end-0 m-2 favorite-btn" onclick="typeof toggleFavorite !== 'undefined' && toggleFavorite(${id}, this)">
                <i class="far fa-heart"></i>
            </button>
        </div>
        <div class="card-body d-flex flex-column">
            <h5 class="card-title listing-title">${escapeHtml(title)}</h5>
            <h6 class="card-price text-danger fw-bold mb-2">${escapeHtml(price)}</h6>
            <div class="card-meta text-muted small mb-2">
                ${escapeHtml(meta)}
            </div>
            <p class="card-location text-muted small mt-auto mb-0"><i class="fas fa-map-marker-alt me-1"></i>${escapeHtml(location)}</p>
        </div>
    </div>
</div>`;
    }

    function escapeHtml(s) {
        return String(s ?? '').replace(/[&<>"']/g, function (m) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
        });
    }

    function createSlides(vehicles) {
        slides = [];
        for (var i = 0; i < vehicles.length; i += cardsPerSlide) {
            var slideVehicles = vehicles.slice(i, i + cardsPerSlide);
            slides.push(slideVehicles);
        }
    }

    function renderSlides() {
        var container = document.getElementById('latestListingsSlidesContainer');
        if (!container) return;

        var html = '';
        slides.forEach(function (slideVehicles, slideIndex) {
            html += `<div class="carousel-slide ${slideIndex === 0 ? 'active' : ''}" data-slide="${slideIndex}">
                <div class="row g-3">
                    ${slideVehicles.map(createCardHtml).join('')}
                </div>
            </div>`;
        });

        container.innerHTML = html;
    }

    function goToSlide(index) {
        if (slides.length === 0) return;
        currentSlide = (index + slides.length) % slides.length;

        var slides_dom = document.querySelectorAll('.carousel-slide');
        slides_dom.forEach(function (slide) {
            slide.classList.remove('active');
        });

        var activeSlide = document.querySelector('.carousel-slide[data-slide="' + currentSlide + '"]');
        if (activeSlide) {
            activeSlide.classList.add('active');
        }

        updateNavButtons();
    }

    function updateNavButtons() {
        var prevBtn = document.getElementById('latestListingsPrev');
        var nextBtn = document.getElementById('latestListingsNext');

        if (prevBtn) {
            prevBtn.style.opacity = currentSlide === 0 ? '0.5' : '1';
            prevBtn.style.pointerEvents = currentSlide === 0 ? 'none' : 'auto';
        }

        if (nextBtn) {
            nextBtn.style.opacity = currentSlide === slides.length - 1 ? '0.5' : '1';
            nextBtn.style.pointerEvents = currentSlide === slides.length - 1 ? 'none' : 'auto';
        }
    }

    async function loadLatestListings() {
        var container = document.getElementById('latestListingsSlidesContainer');
        if (!container) {
            console.error('Element #latestListingsSlidesContainer không tìm thấy');
            return;
        }

        try {
            var res = await fetch('/Home/GetLatestVehicles?count=16', { cache: 'no-store' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            var data = await res.json();
            if (data && data.success && Array.isArray(data.data)) data = data.data;
            if (!Array.isArray(data) || data.length === 0) {
                container.innerHTML = '<div class="col-12 text-center py-5 text-muted">Không có tin mới</div>';
                return;
            }

            createSlides(data);
            renderSlides();
            goToSlide(0);
            console.log('Loaded ' + data.length + ' vehicles in ' + slides.length + ' slides');

        } catch (err) {
            console.error('loadLatestListings error:', err);
            container.innerHTML = '<div class="col-12 text-center py-4 text-muted"><p>Lỗi tải dữ liệu</p><small>' + (err.message || '') + '</small></div>';
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        loadLatestListings();

        var prevBtn = document.getElementById('latestListingsPrev');
        var nextBtn = document.getElementById('latestListingsNext');

        if (prevBtn) {
            prevBtn.addEventListener('click', function () {
                goToSlide(currentSlide - 1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function () {
                goToSlide(currentSlide + 1);
            });
        }
    });
})();
// js cho phan chưa dang nhap ma chon yeu thích
async function toggleFavorite(vehicleId, btn) {
    try {
        const res = await fetch('/Home/ToggleFavorite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `vehicleId=${encodeURIComponent(vehicleId)}`
        });

        const json = await res.json();

        if (!json.success) {
            if (json.needLogin) {
                // Show SweetAlert2 popup for login confirmation
                const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
                const loginUrl = `/Account/Login?returnUrl=${returnUrl}`;

                Swal.fire({
                    title: 'Cần đăng nhập',
                    text: 'Bạn cần đăng nhập tài khoản mới có thể thêm vào yêu thích',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ffba00',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Đăng nhập',
                    cancelButtonText: 'Hủy'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = loginUrl;
                    }
                });

                return;
            }

            showNotification(json.message || 'Lỗi yêu thích', 'error');
            return;
        }

        const isAdded = json.action === 'added';
        updateFavoriteUI(vehicleId, isAdded, btn);

        showNotification(json.message || (isAdded ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích'), isAdded ? 'success' : 'info');
    } catch (err) {
        console.error('toggleFavorite error:', err);
        showNotification('Lỗi khi thao tác yêu thích', 'error');
    }
}
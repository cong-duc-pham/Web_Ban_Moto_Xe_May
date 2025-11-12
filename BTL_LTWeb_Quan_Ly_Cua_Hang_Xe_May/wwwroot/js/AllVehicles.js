function toggleProvinceList(div) {
    const links = div.previousElementSibling.querySelectorAll('.hidden');
    const isHidden = links[0]?.style.display !== 'block';
    links.forEach(a => a.style.display = isHidden ? 'block' : 'none');
    div.textContent = isHidden ? 'Thu gọn' : 'Xem thêm';
}
function toggleDistrictList(div) {
    const links = div.previousElementSibling.querySelectorAll('.hidden');
    const isHidden = links[0]?.style.display !== 'block';
    links.forEach(a => a.style.display = isHidden ? 'block' : 'none');
    div.textContent = isHidden ? 'Thu gọn' : 'Xem thêm';
}

// js chopn pop-up
// Popup show/hide
function openPopup(id) {
    document.getElementById(id).classList.add('active');
}
function closePopup(id) {
    document.getElementById(id).classList.remove('active');
}

// ------- Popup Lọc Nâng Cao -------
function updateSelectedFilters() {
    const checked = document.querySelectorAll('#popup-filter .flt:checked');
    const box = document.getElementById('selected-filters');
    box.innerHTML = "Lọc theo: ";
    checked.forEach(el => {
        let label = el.parentElement.textContent.trim();
        box.innerHTML += `<span class="chip">${label}<button class="chip-delete" onclick="removeFilter('${el.value}')">&times;</button></span>`;
    });
}
function removeFilter(val) {
    document.querySelectorAll('#popup-filter .flt').forEach(el => { if (el.value === val) el.checked = false });
    updateSelectedFilters();
}
function clearFilters() {
    document.querySelectorAll('#popup-filter .flt').forEach(el => el.checked = false);
    updateSelectedFilters();
}
function applyFilters() {
    closePopup('popup-filter');
    // Xử lý cập nhật bộ lọc ở đây
}

// ------- Popup Giá - noUiSlider -------
window.addEventListener('DOMContentLoaded', function () {
    var slider = document.getElementById('price-slider');
    noUiSlider.create(slider, {
        start: [0, 1500000000],
        connect: true,
        range: {
            'min': 0,
            'max': 1500000000
        },
        step: 5000000,
        format: {
            to: value => Math.round(value),
            from: value => Number(value)
        }
    });

    slider.noUiSlider.on('update', function (values, handle) {
        document.getElementById('minPriceInput').value = values[0];
        document.getElementById('maxPriceInput').value = values[1];
    });

    window.updateSliderFromInput = function () {
        var min = parseInt(document.getElementById('minPriceInput').value) || 0;
        var max = parseInt(document.getElementById('maxPriceInput').value) || 1500000000;
        if (min > max) [min, max] = [max, min];
        slider.noUiSlider.set([min, max]);
    };

    window.clearPrice = function () {
        slider.noUiSlider.set([0, 1500000000]);
    };

    window.applyPrice = function () {
        closePopup('popup-price');
        // Xử lý lọc giá ở đây
    };
});

// ------- Popup Tình Trạng -------
function selectStatus() { }
function clearStatus() {
    document.querySelectorAll('#popup-status input[type=radio]').forEach(el => el.checked = false);
}
// js cho dinh dang cac tin tuc
// Thêm vào file /js/News.js

document.addEventListener("DOMContentLoaded", function () {

    const listViewBtn = document.getElementById("list-view-btn");
    const gridViewBtn = document.getElementById("grid-view-btn");
    const listingsContainer = document.getElementById("listings-container");

    if (!listViewBtn || !gridViewBtn || !listingsContainer) {
        console.warn("Lỗi: Không tìm thấy ID trong HTML.");
        return;
    }

    // Gán sự kiện click cho nút "Grid View" (fas fa-th)
    gridViewBtn.addEventListener("click", function () {
        console.log("ĐÃ NHẤN NÚT GRID");
        gridViewBtn.classList.add("active");
        listViewBtn.classList.remove("active");
        listingsContainer.classList.add("grid-view");
    });

    // Gán sự kiện click cho nút "List View" (fas fa-list)
    listViewBtn.addEventListener("click", function () {
        console.log("ĐÃ NHẤN NÚT LIST");
        listViewBtn.classList.add("active");
        gridViewBtn.classList.remove("active");
        listingsContainer.classList.remove("grid-view");
    });

});
// js
let allVehicles = [];
let filteredVehicles = [];
let currentPage = 1;
const itemsPerPage = 12;

// INIT
document.addEventListener('DOMContentLoaded', function () {
    console.log('AllVehicles.js loaded');

    initPriceSlider();
    initViewToggle();
    initProvinceToggle();
    loadVehicles();
    const clearAllLink = document.getElementById('clear-all-filters-link');
    if (clearAllLink) {
        clearAllLink.addEventListener('click', function (e) {
            e.preventDefault();
            clearFilters(); // Xóa lọc nâng cao
            clearPrice();   // Xóa giá
            clearStatus();  // Xóa tình trạng 
            // Cập nhật lại giao diện bộ lọc
            renderActiveFilters();
        });
    }
});

//load vehicles
async function loadVehicles() {
    try {
        const response = await fetch('/Home/GetAllVehicles');
        const result = await response.json();

        if (result.success) {
            allVehicles = result.data;
            filteredVehicles = [...allVehicles];
            renderVehicles();
            console.log(`Loaded ${allVehicles.length} vehicles`);
        } else {
            console.error('Failed to load vehicles:', result.message);
            showNotification('Không thể tải danh sách xe', 'error');
        }
    } catch (error) {
        console.error('Error loading vehicles:', error);
        showNotification('Lỗi khi tải danh sách xe', 'error');
    }
}

// render
function renderVehicles() {
    const container = document.getElementById('listings-container');
    if (!container) return;

    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const vehiclesToShow = filteredVehicles.slice(startIndex, endIndex);

    if (vehiclesToShow.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Không tìm thấy xe phù hợp</h5>
                <p class="text-muted">Vui lòng thử lại với bộ lọc khác</p>
            </div>
        `;
        return;
    }

    container.innerHTML = vehiclesToShow.map(vehicle => createVehicleCard(vehicle)).join('');
    updatePagination();
}

// Create card
function createVehicleCard(vehicle) {
    //  Lấy ảnh
    const primaryImage = vehicle.vehicleImages?.find(img => img.isPrimary) || vehicle.vehicleImages?.[0];
    const imagePath = primaryImage?.imagePath || '/images/default-vehicle.jpg';

    //  Lấy thông tin
    const price = vehicle.salePrice ? formatPrice(vehicle.salePrice) : 'Liên hệ';
    const brand = vehicle.brand?.brandName || '';
    const category = vehicle.category?.categoryName || '';
    const year = vehicle.manufactureYear || '';
    const condition = vehicle.condition || 'Chưa cập nhật';

    //  Tính toán thời gian
    const timeAgo = getTimeAgo(new Date(vehicle.postedAt));

    //  Kiểm tra yêu thích
    return `
    <div class="card listing-card mb-3" data-vehicle-id="${vehicle.vehicleId}">
        <div class="row g-0">
            <div class="col-md-4 col-lg-3 position-relative">
                <img src="${imagePath}" class="card-img-top listing-image" alt="${vehicle.title}">
            
                <span class="badge bg-dark text-white position-absolute top-0 start-0 m-2">${timeAgo}</span>
                <button class="btn btn-light btn-sm position-absolute bottom-0 end-0 m-2 favorite-btn" 
                        onclick="toggleFavorite(${vehicle.vehicleId}, this)">
                    <i class="far fa-heart"></i> 
                </button>
            </div>
            <div class="col-md-8 col-lg-9">
                <div class="card-body h-100 d-flex flex-column">
                    <h5 class="card-title listing-title">${vehicle.title}</h5>
                    <h6 class="card-price text-danger fw-bold mb-2">${price}</h6>
                
                    <div class="card-meta text-muted small mb-2">
                        ${year ? `<span>${year}</span>` : ''}
                        ${category ? `<span>${category}</span>` : ''}
                        ${condition ? `<span>${condition}</span>` : ''}
                    </div>
                
                    <p class="card-location text-muted small mt-auto mb-0">
                        <i class="fas fa-map-marker-alt me-1"></i>
                        ${vehicle.store?.address || 'Chưa có địa chỉ'}
                    </p>
                </div>
            </div>
        </div>
    </div>
    `;
}
// Tính thời gian 
function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) return date.toLocaleDateString('vi-VN');
    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return `${seconds} giây trước`;
}
// thanh truot
function initPriceSlider() {
    const slider = document.getElementById('price-slider');
    if (!slider) return;

    noUiSlider.create(slider, {
        start: [0, 1500000000],
        connect: true,
        range: {
            'min': 0,
            'max': 1500000000
        },
        step: 1000000,
        format: {
            to: function (value) {
                return Math.round(value);
            },
            from: function (value) {
                return Number(value);
            }
        }
    });

    slider.noUiSlider.on('update', function (values) {
        document.getElementById('minPriceInput').value = values[0];
        document.getElementById('maxPriceInput').value = values[1];
    });
}

function updateSliderFromInput() {
    const slider = document.getElementById('price-slider');
    if (!slider || !slider.noUiSlider) return;

    const minPrice = parseInt(document.getElementById('minPriceInput').value) || 0;
    const maxPrice = parseInt(document.getElementById('maxPriceInput').value) || 1500000000;

    slider.noUiSlider.set([minPrice, maxPrice]);
}

function applyPrice() {
    const minPrice = parseInt(document.getElementById('minPriceInput').value) || 0;
    const maxPrice = parseInt(document.getElementById('maxPriceInput').value) || 1500000000;

    filteredVehicles = allVehicles.filter(v => {
        const price = v.salePrice || 0;
        return price >= minPrice && price <= maxPrice;
    });

    currentPage = 1;
    renderVehicles();
    closePopup('popup-price');
    
}

function clearPrice() {
    document.getElementById('minPriceInput').value = 0;
    document.getElementById('maxPriceInput').value = 1500000000;
    updateSliderFromInput();
}

// flter
function openPopup(popupId) {
    document.getElementById(popupId).style.display = 'flex';
}

function closePopup(popupId) {
    document.getElementById(popupId).style.display = 'none';
}

function updateSelectedFilters() {
    const selectedFilters = document.getElementById('selected-filters');
    const checkedFilters = document.querySelectorAll('.flt:checked');

    if (checkedFilters.length === 0) {
        selectedFilters.innerHTML = 'Lọc theo:';
        return;
    }

    let html = 'Lọc theo: ';
    checkedFilters.forEach((filter, index) => {
        const label = filter.parentElement.textContent.trim();
        html += `<span class="filter-chip">${label} <i class="fas fa-times" onclick="removeFilter('${filter.value}')"></i></span>`;
    });

    selectedFilters.innerHTML = html;
}

function removeFilter(value) {
    const checkbox = document.querySelector(`.flt[value="${value}"]`);
    if (checkbox) {
        checkbox.checked = false;
        updateSelectedFilters();
    }
}

function clearFilters() {
    document.querySelectorAll('.flt').forEach(filter => {
        filter.checked = false;
    });
    updateSelectedFilters();
}

function applyFilters() {
    const checkedFilters = Array.from(document.querySelectorAll('.flt:checked')).map(f => f.value);

    if (checkedFilters.length === 0) {
        filteredVehicles = [...allVehicles];
    } else {
        filteredVehicles = allVehicles.filter(v => {
            // Apply filter logic here
            return true; // Placeholder
        });
    }

    currentPage = 1;
    renderVehicles();
    closePopup('popup-filter');
    
}

function selectStatus() {
    const selectedStatus = document.querySelector('input[name="status"]:checked');
    if (selectedStatus) {
        const status = selectedStatus.value;
        filteredVehicles = allVehicles.filter(v => {
            if (status === 'new') return v.condition === 'Mới';
            if (status === 'used') return v.condition === 'Đã sử dụng';
            return true;
        });

        currentPage = 1;
        renderVehicles();
        closePopup('popup-status');
    }
}

function clearStatus() {
    document.querySelectorAll('input[name="status"]').forEach(radio => {
        radio.checked = false;
    });
    filteredVehicles = [...allVehicles];
    currentPage = 1;
    renderVehicles();
}

// view togger
function initViewToggle() {
    const listViewBtn = document.getElementById('list-view-btn');
    const gridViewBtn = document.getElementById('grid-view-btn');
    const container = document.getElementById('listings-container');

    if (!listViewBtn || !gridViewBtn || !container) return;

    listViewBtn.addEventListener('click', function () {
        container.classList.remove('grid-view');
        container.classList.add('list-view');
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
    });

    gridViewBtn.addEventListener('click', function () {
        container.classList.remove('list-view');
        container.classList.add('grid-view');
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
    });
}

// chuyen doi togger
function initProvinceToggle() {
    // toggleProvinceList function
}

function toggleProvinceList(element) {
    const provinceList = element.previousElementSibling;
    const hiddenLinks = provinceList.querySelectorAll('.hidden');

    if (element.textContent.trim() === 'Xem thêm') {
        hiddenLinks.forEach(link => link.classList.remove('hidden'));
        element.textContent = 'Thu gọn';
    } else {
        hiddenLinks.forEach(link => link.classList.add('hidden'));
        element.textContent = 'Xem thêm';
    }
}

// phan trang
function updatePagination() {
    const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
    const paginationContainer = document.querySelector('.pagination-container');

    if (!paginationContainer || totalPages <= 1) {
        if (paginationContainer) paginationContainer.style.display = 'none';
        return;
    }

    paginationContainer.style.display = 'flex';

    let html = `
        <a href="#" class="page-link ${currentPage === 1 ? 'disabled' : ''}" 
           onclick="changePage(${currentPage - 1}); return false;">
            <span>&lsaquo;</span>
        </a>
    `;

    for (let i = 1; i <= Math.min(totalPages, 9); i++) {
        html += `
            <a href="#" class="page-link ${i === currentPage ? 'active' : ''}" 
               onclick="changePage(${i}); return false;">${i}</a>
        `;
    }

    html += `
        <a href="#" class="page-link ${currentPage === totalPages ? 'disabled' : ''}" 
           onclick="changePage(${currentPage + 1}); return false;">
            <span>&rsaquo;</span>
        </a>
    `;

    paginationContainer.innerHTML = html;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    renderVehicles();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// vehicle action
function viewVehicleDetail(vehicleId) {
    window.location.href = `/Home/VehicleDetail/${vehicleId}`;
}

function toggleFavorite(vehicleId) {
    // Toggle favorite logic
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.indexOf(vehicleId);

    if (index > -1) {
        favorites.splice(index, 1);
        showNotification('Đã xóa khỏi yêu thích', 'info');
    } else {
        favorites.push(vehicleId);
        showNotification('Đã thêm vào yêu thích', 'success');
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// chuc nang
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ';
}

function showNotification(message, type = 'success') {
    alert(message);
}
function renderActiveFilters() {
    const container = document.getElementById('active-filters-container');
    const display = document.getElementById('active-filters-display');
    if (!container || !display) return;

    display.innerHTML = '';
    let hasFilters = false;

    // 1. Lấy bộ lọc Tình trạng
    const statusRadio = document.querySelector('input[name="status"]:checked');
    if (statusRadio) {
        const label = statusRadio.value === 'new' ? 'Mới' : 'Đã sử dụng';
        display.innerHTML += `<span class="filter-chip">${label} <i class="fas fa-times" onclick="clearStatus()"></i></span>`;
        hasFilters = true;
    }

    // 2. Lấy bộ lọc Giá
    const minPrice = parseInt(document.getElementById('minPriceInput').value) || 0;
    const maxPrice = parseInt(document.getElementById('maxPriceInput').value) || 1500000000;
    if (minPrice > 0 || maxPrice < 1500000000) {
        display.innerHTML += `<span class="filter-chip">${formatPrice(minPrice)} - ${formatPrice(maxPrice)} <i class="fas fa-times" onclick="clearPriceAndApply()"></i></span>`;
        hasFilters = true;
    }

    // 3. Lấy bộ lọc Nâng cao
    const checkedFilters = document.querySelectorAll('#popup-filter .flt:checked');
    checkedFilters.forEach(filter => {
        const label = filter.parentElement.textContent.trim();
        display.innerHTML += `<span class="filter-chip">${label} <i class="fas fa-times" onclick="removeFilterAndApply('${filter.value}')"></i></span>`;
        hasFilters = true;
    });

    // Hiển thị hoặc ẩn toàn bộ khung
    container.style.display = hasFilters ? 'block' : 'none';
}

// HÀM HỖ TRỢ (để xóa chip và lọc lại)
function clearPriceAndApply() {
    clearPrice(); //
    applyPrice(); //
}

function removeFilterAndApply(value) {
    removeFilter(value); //
    applyFilters(); //
}
// xy ly viec them xoa yeu thich

async function toggleFavorite(vehicleId, btn) {
    try {
        // POST form-encoded
        const res = await fetch('/Home/ToggleFavorite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `vehicleId=${encodeURIComponent(vehicleId)}`
        });

        const json = await res.json();

        if (!json.success) {
            if (json.needLogin) {
                // redirect to login
                window.location.href = '/Account/Login';
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

function updateFavoriteUI(vehicleId, isFavorite, btn) {
    // collect target buttons for this vehicle across different card renderings
    const buttons = new Set();

    if (btn) buttons.add(btn);

    // buttons inside listing cards that contain data-vehicle-id
    document.querySelectorAll('.listing-card[data-vehicle-id]').forEach(card => {
        const id = Number(card.getAttribute('data-vehicle-id'));
        if (id === Number(vehicleId)) {
            const b = card.querySelector('.favorite-btn, .product-favorite');
            if (b) buttons.add(b);
        }
    });

    // product-favorite elements with data-id attribute
    document.querySelectorAll(`.product-favorite[data-id="${vehicleId}"]`).forEach(el => buttons.add(el));

    // also check generic favorite-btn that might be placed elsewhere
    document.querySelectorAll('.favorite-btn').forEach(b => {
        if (!buttons.has(b)) {
            const card = b.closest('[data-vehicle-id]');
            if (card && Number(card.getAttribute('data-vehicle-id')) === Number(vehicleId)) {
                buttons.add(b);
            }
        }
    });

    buttons.forEach(b => {
        const icon = b.querySelector('i');
        if (isFavorite) {
            if (icon) { icon.classList.remove('far'); icon.classList.add('fas'); }
            b.classList.add('active');
        } else {
            if (icon) { icon.classList.remove('fas'); icon.classList.add('far'); }
            b.classList.remove('active');
        }
    });
}
// js cho phan thong bao khi chua dang nhap
async function toggleFavorite(vehicleId, btn) {
    try {
        // POST form-encoded
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
                    // if cancelled -> do nothing (don't add favorite)
                });

                return;
            }

            showNotification(json.message || 'Lỗi yêu thích', 'error');
            return;
        }

        const isAdded = json.action === 'added';
        updateFavoriteUI(vehicleId, isAdded, btn);

    } catch (err) {
        console.error('toggleFavorite error:', err);
        showNotification('Lỗi khi thao tác yêu thích', 'error');
    }
}
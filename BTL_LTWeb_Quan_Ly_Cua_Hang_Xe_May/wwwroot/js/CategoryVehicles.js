// Shared category listing + filtering logic for Motorbikes / Electric pages
// Usage: CategoryVehicles.init('Xe máy') or CategoryVehicles.init('Xe điện')

(function (global) {
    const state = {
        allVehicles: [],
        filteredVehicles: [],
        currentPage: 1,
        itemsPerPage: 12,
        category: null
    };

    // Helpers
    function formatPrice(price) {
        if (price == null) return 'Liên hệ';
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ';
    }

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

    function matchesVehicleType(vehicle, selectedTypeValue) {
        if (!selectedTypeValue) return true;
        const src = ((vehicle.category?.categoryName || '') + ' ' + (vehicle.title || '') + ' ' + (vehicle.model || '')).toLowerCase();
        const v = selectedTypeValue.toLowerCase();
        let keywords = [];
        if (v.includes('tay ga') || v.includes('tayga')) keywords = ['tay ga', 'tayga', 'ga', 'scooter'];
        else if (v.includes('xe số') || v.includes('xe so') || v.includes('số') || v.includes('so')) keywords = ['xe số', 'xe so', 'số', 'so', 'manual'];
        else if (v.includes('tay côn') || v.includes('tay con') || v.includes('moto') || v.includes('motor')) keywords = ['tay côn', 'tay con', 'côn', 'moto', 'motor', 'motorcycle'];
        else if (v.includes('điện') || v.includes('dien') || v.includes('electric')) keywords = ['điện', 'dien', 'electric', 'ev'];
        else keywords = v.split(/[\s\/\-_,]+/).filter(Boolean);

        return keywords.some(k => src.includes(k));
    }

    function createVehicleCard(vehicle) {
        const primaryImage = vehicle.vehicleImages?.find(img => img.isPrimary) || vehicle.vehicleImages?.[0];
        const imagePath = primaryImage?.imagePath || '/images/default-vehicle.jpg';
        const price = vehicle.salePrice ? formatPrice(vehicle.salePrice) : 'Liên hệ';
        const brand = vehicle.brand?.brandName || '';
        const category = vehicle.category?.categoryName || '';
        const year = vehicle.manufactureYear || '';
        const condition = vehicle.condition || '';
        const timeAgo = getTimeAgo(new Date(vehicle.postedAt));
        const address = vehicle.store?.address || 'Chưa có địa chỉ';

        return `
        <div class="card listing-card mb-3" data-vehicle-id="${vehicle.vehicleId}">
            <div class="row g-0">
                <div class="col-md-4 col-lg-3 position-relative">
                    <img src="${imagePath}" class="card-img-top listing-image" alt="${vehicle.title}">
                    <span class="badge bg-dark text-white position-absolute top-0 start-0 m-2">${timeAgo}</span>
                    <button class="btn btn-light btn-sm position-absolute bottom-0 end-0 m-2 favorite-btn">
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
                            <i class="fas fa-map-marker-alt me-1"></i>${address}
                        </p>
                    </div>
                </div>
            </div>
        </div>`;
    }

    function renderVehicles() {
        const container = document.getElementById('listings-container');
        if (!container) return;
        const startIndex = (state.currentPage - 1) * state.itemsPerPage;
        const endIndex = startIndex + state.itemsPerPage;
        const toShow = state.filteredVehicles.slice(startIndex, endIndex);
        if (toShow.length === 0) {
            container.innerHTML = `<div class="text-center py-5"><h5 class="text-muted">Không tìm thấy xe phù hợp</h5></div>`;
            return;
        }
        container.innerHTML = toShow.map(createVehicleCard).join('');
        updatePagination();
    }

    function updatePagination() {
        const totalPages = Math.ceil(state.filteredVehicles.length / state.itemsPerPage);
        const paginationContainer = document.querySelector('.pagination-container');
        if (!paginationContainer) return;
        if (totalPages <= 1) { paginationContainer.style.display = 'none'; return; }
        paginationContainer.style.display = 'flex';
        let html = `<a href="#" class="page-link ${state.currentPage === 1 ? 'disabled' : ''}" onclick="return false;">&lsaquo;</a>`;
        const max = Math.min(totalPages, 9);
        for (let i = 1; i <= max; i++) {
            html += `<a href="#" class="page-link ${i === state.currentPage ? 'active' : ''}" data-page="${i}">${i}</a>`;
        }
        html += `<a href="#" class="page-link ${state.currentPage === totalPages ? 'disabled' : ''}" onclick="return false;">&rsaquo;</a>`;
        paginationContainer.innerHTML = html;
        paginationContainer.querySelectorAll('.page-link[data-page]').forEach(a => {
            a.addEventListener('click', (e) => {
                const p = Number(a.getAttribute('data-page'));
                if (!isNaN(p)) { state.currentPage = p; renderVehicles(); window.scrollTo({top:0, behavior:'smooth'}); }
            });
        });
    }

    // Apply filters (reads DOM inputs with classes used in Razor)
    function applyAllFilters() {
        const checkedPopupFilters = Array.from(document.querySelectorAll('#popup-filter .flt:checked')).map(f => ({ type: f.className, value: f.value }));
        const minPrice = parseInt(document.getElementById('minPriceInput')?.value) || 0;
        const maxPrice = parseInt(document.getElementById('maxPriceInput')?.value) || 100000000;
        const statusRadio = document.querySelector('#popup-status input[name="status"]:checked');
        let selectedStatus = statusRadio ? statusRadio.value : null;
        if (!selectedStatus) {
            const sidebarStatus = document.querySelector('input[name="sidebar-condition"]:checked');
            if (sidebarStatus) selectedStatus = sidebarStatus.value;
        }
        if (selectedStatus) {
            const s = String(selectedStatus).trim().toLowerCase();
            selectedStatus = (s === 'mới' || s === 'new') ? 'new' : (s.includes('đã') || s.includes('da') || s === 'used') ? 'used' : s;
        }

        const sidebarBrands = Array.from(document.querySelectorAll('.flt-brand:checked:not(#popup-filter .flt-brand)')).map(f => f.value);
        const sidebarTypes = Array.from(document.querySelectorAll('.flt-type:checked:not(#popup-filter .flt-type)')).map(f => f.value);
        const sidebarCapacities = Array.from(document.querySelectorAll('.flt-capacity:checked:not(#popup-filter .flt-capacity)')).map(f => f.value);
        const sidebarColors = Array.from(document.querySelectorAll('.flt-color:checked:not(#popup-filter .flt-color)')).map(f => f.value);

        const popupBrands = checkedPopupFilters.filter(f => f.type.includes('flt-brand')).map(f => f.value);
        const popupTypes = checkedPopupFilters.filter(f => f.type.includes('flt-type')).map(f => f.value);
        const popupCapacities = checkedPopupFilters.filter(f => f.type.includes('flt-capacity')).map(f => f.value);
        const popupColors = checkedPopupFilters.filter(f => f.type.includes('flt-color')).map(f => f.value);

        state.filteredVehicles = state.allVehicles.filter(v => {
            const price = v.salePrice || 0;
            if (price < minPrice || price > maxPrice) return false;

            // brand (popup or sidebar)
            if (popupBrands.length > 0) {
                const vb = (v.brand?.brandName || '').toLowerCase();
                if (!popupBrands.some(pb => pb.toLowerCase() === vb)) return false;
            }
            if (sidebarBrands.length > 0) {
                const vb = (v.brand?.brandName || '').toLowerCase();
                if (!sidebarBrands.some(sb => sb.toLowerCase() === vb)) return false;
            }

            // type
            if (popupTypes.length > 0 && !popupTypes.some(pt => matchesVehicleType(v, pt))) return false;
            if (sidebarTypes.length > 0 && !sidebarTypes.some(st => matchesVehicleType(v, st))) return false;

            // capacity
            if (popupCapacities.length > 0) {
                const capacity = v.engineCapacity || 0;
                let match = false;
                popupCapacities.forEach(cap => {
                    const key = (cap || '').toLowerCase();
                    if ((key.includes('under') || key.includes('dưới')) && capacity < 50) match = true;
                    if (key.includes('50-100') && capacity >= 50 && capacity < 100) match = true;
                    if ((key.includes('100-175') || key.includes('100-175cc')) && capacity >= 100 && capacity < 175) match = true;
                    if ((key.includes('over') || key.includes('trên')) && capacity >= 175) match = true;
                });
                if (!match) return false;
            }
            if (sidebarCapacities.length > 0) {
                const capacity = v.engineCapacity || 0;
                let match = false;
                sidebarCapacities.forEach(cap => {
                    const key = (cap || '').toLowerCase();
                    if (key.includes('dưới') && capacity < 50) match = true;
                    if (key.includes('50-100') && capacity >= 50 && capacity < 100) match = true;
                    if (key.includes('100-175') && capacity >= 100 && capacity < 175) match = true;
                    if (key.includes('trên') && capacity >= 175) match = true;
                });
                if (!match) return false;
            }

            // color
            if (popupColors.length > 0) {
                const vc = (v.color || '').toLowerCase();
                if (!popupColors.some(pc => vc.includes(pc.toLowerCase()))) return false;
            }
            if (sidebarColors.length > 0) {
                const vc = (v.color || '').toLowerCase();
                if (!sidebarColors.some(sc => vc.includes(sc.toLowerCase()))) return false;
            }

            // status
            if (selectedStatus) {
                const vCond = (v.condition || '').toLowerCase();
                if (selectedStatus === 'new' && !['mới', 'new'].some(x => vCond.includes(x))) return false;
                if (selectedStatus === 'used' && !['đã sử dụng', 'used', 'da su dung'].some(x => vCond.includes(x))) return false;
            }

            // category filter: if page has a category, exclude electric for motorbikes or vice versa
            if (state.category) {
                const sel = state.category.toLowerCase();
                const vCat = (v.category?.categoryName || '').toLowerCase();
                const vTitle = (v.title || '').toLowerCase();
                if (sel === 'xe máy') {
                    // exclude explicit electric
                    if (vCat.includes('điện') || vTitle.includes('điện') || vTitle.includes('ev') || vTitle.includes('electric')) return false;
                } else if (sel === 'xe điện') {
                    // prefer items with electric in category or title
                    if (!vCat.includes('điện') && !vTitle.includes('điện') && !(vTitle.includes('ev') || vTitle.includes('electric'))) return false;
                }
            }

            return true;
        });

        state.currentPage = 1;
        renderVehicles();
        renderActiveFilters();
    }

    // show active filters chips (simple)
    function renderActiveFilters() {
        const container = document.getElementById('active-filters-container');
        const display = document.getElementById('active-filters-display') || document.getElementById('active-filters-display');
        if (!container || !display) return;

        display.innerHTML = '';
        let hasFilters = false;

        // status
        const statusRadio = document.querySelector('#popup-status input[name="status"]:checked');
        if (statusRadio) {
            const label = statusRadio.value === 'new' ? 'Mới' : (statusRadio.value === 'used' ? 'Đã sử dụng' : statusRadio.value);
            display.innerHTML += `<span class="filter-chip">${label} <i class="fas fa-times" onclick="removeStatusFilter()"></i></span>`;
            hasFilters = true;
        }

        // price
        const minPrice = parseInt(document.getElementById('minPriceInput')?.value) || 0;
        const maxPrice = parseInt(document.getElementById('maxPriceInput')?.value) || 100000000;
        if (minPrice > 0 || maxPrice < 100000000) {
            display.innerHTML += `<span class="filter-chip">${formatPrice(minPrice)} - ${formatPrice(maxPrice)} <i class="fas fa-times" onclick="clearPriceAndApply()"></i></span>`;
            hasFilters = true;
        }

        // popup checked
        const checked = document.querySelectorAll('#popup-filter .flt:checked');
        checked.forEach(f => {
            const label = f.parentElement?.textContent?.trim() || f.value;
            display.innerHTML += `<span class="filter-chip">${label} <i class="fas fa-times" onclick="removePopupFilter('${f.value}')"></i></span>`;
            hasFilters = true;
        });

        container.style.display = hasFilters ? 'block' : 'none';
    }

    // Load all vehicles from API
    async function loadVehicles() {
        try {
            const res = await fetch('/Home/GetAllVehicles');
            const json = await res.json();
            if (!json.success) { console.error('GetAllVehicles failed', json.message); state.allVehicles = []; state.filteredVehicles = []; renderVehicles(); return; }
            state.allVehicles = json.data || [];
            // apply initial category filtering in JS
            applyAllFilters();
        } catch (err) {
            console.error('loadVehicles error', err);
        }
    }

    // bind small UI handlers
    function initViewToggle() {
        const listBtn = document.getElementById('list-view-btn');
        const gridBtn = document.getElementById('grid-view-btn');
        const container = document.getElementById('listings-container');
        if (!listBtn || !gridBtn || !container) return;
        listBtn.addEventListener('click', () => { container.classList.remove('grid-view'); container.classList.add('list-view'); listBtn.classList.add('active'); gridBtn.classList.remove('active'); });
        gridBtn.addEventListener('click', () => { container.classList.remove('list-view'); container.classList.add('grid-view'); gridBtn.classList.add('active'); listBtn.classList.remove('active'); });
    }

    function initSidebarFilters() {
        const selectors = '.flt-brand, .flt-type, .flt-capacity, .flt-color, input[name="sidebar-condition"]';
        document.querySelectorAll(selectors).forEach(chk => chk.addEventListener('change', applyAllFilters));
    }

    function initBrandPills() {
        document.querySelectorAll('.brand-pill').forEach(p => {
            p.addEventListener('click', function () {
                const brand = this.dataset.brand;
                if (!brand) return;
                let checkbox = document.querySelector(`.flt-brand[value="${brand}"]`);
                if (!checkbox) {
                    checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'flt-brand hidden';
                    checkbox.style.display = 'none';
                    checkbox.value = brand;
                    document.body.appendChild(checkbox);
                }
                checkbox.checked = !checkbox.checked;
                this.classList.toggle('active', checkbox.checked);
                applyAllFilters();
            });
        });
    }

    // Public init
    function init(category) {
        state.category = category || null;
        document.addEventListener('DOMContentLoaded', () => {
            initViewToggle();
            initSidebarFilters();
            initBrandPills();
            // If price inputs exist, ensure event wiring
            const applyPriceBtn = document.querySelector('[onclick="applyPrice()"]');
            if (applyPriceBtn) applyPriceBtn.addEventListener('click', applyAllFilters);
            loadVehicles();
        });
        // expose some functions to global scope expected by markup
        global.applyAllFilters = applyAllFilters;
        global.renderActiveFilters = renderActiveFilters;
        global.clearPriceAndApply = function () { document.getElementById('minPriceInput').value = 0; document.getElementById('maxPriceInput').value = 100000000; applyAllFilters(); };
        global.removePopupFilter = function (value) { const el = document.querySelector(`#popup-filter .flt[value="${value}"]`); if (el) el.checked = false; applyAllFilters(); };
        global.removeStatusFilter = function () { document.querySelectorAll('input[name="status"]').forEach(r => r.checked=false); applyAllFilters(); };
    }

    // expose init
    global.CategoryVehicles = { init };

})(window);
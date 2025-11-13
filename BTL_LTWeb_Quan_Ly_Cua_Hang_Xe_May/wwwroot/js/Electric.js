// wwwroot/js/Electric.js
// Electric page — dynamic filters (brands, colors, types, condition) from DB or derived set.
(function () {
    'use strict';

    const state = {
        all: [],
        filtered: [],
        currentPage: 1,
        itemsPerPage: 12,
        sort: 'newest',
        filtersBuilt: false,
        meta: null
    };

    let applyTimer = null;
    function scheduleApplyFilters() {
        if (applyTimer) clearTimeout(applyTimer);
        applyTimer = setTimeout(() => { applyFilters(); applyTimer = null; }, 40);
    }

    // ===== Helpers =====
    function esc(s) { return s == null ? '' : String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
    function formatPrice(price) { if (price == null) return 'Liên hệ'; return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ'; }
    function toLower(v) { return (v || '').toString().toLowerCase(); }
    function normalizeCondition(v) {
        const c = toLower(v).trim();
        if (['mới', 'new', 'moi'].includes(c)) return 'new';
        if (['đã sử dụng', 'used', 'da su dung'].includes(c)) return 'used';
        return c;
    }
    function isElectric(v) {
        const t = toLower(v.title || '');
        const c = toLower(v.category?.categoryName || '');
        return c.includes('điện') || t.includes('điện') || t.includes('ev') || t.includes('electric');
    }
    function getTimeAgo(dt) {
        if (!dt) return '';
        const d = new Date(dt), n = new Date(), diff = (n - d) / 1000;
        if (diff < 60) return `${Math.floor(diff)} giây trước`;
        const m = diff / 60;
        if (m < 60) return `${Math.floor(m)} phút trước`;
        const h = m / 60;
        if (h < 24) return `${Math.floor(h)} giờ trước`;
        const days = h / 24;
        if (days < 7) return `${Math.floor(days)} ngày trước`;
        return d.toLocaleDateString('vi-VN');
    }

    // ===== Brand pills sync =====
    function setBrandSelection(brand, selected) {
        const sel = `.flt-brand[value="${CSS.escape(brand)}"]`;
        document.querySelectorAll(`#popup-filter ${sel}, #popup-brand ${sel}, .sidebar-section ${sel}`)
            .forEach(i => { i.checked = selected; });
        document.querySelectorAll(`.brand-pill[data-brand="${CSS.escape(brand)}"]`)
            .forEach(p => p.classList.toggle('active', !!selected));
        syncFromPopupToSidebar();
        updateSelectedFilters();
    }
    function syncBrandPillsFromInputs() {
        document.querySelectorAll('.brand-pill').forEach(p => {
            const brand = p.dataset.brand;
            const anyChecked = !!document.querySelector(`.flt-brand[value="${CSS.escape(brand)}"]:checked`);
            p.classList.toggle('active', anyChecked);
        });
    }

    // ===== Sync popup <-> sidebar =====
    function syncFromPopupToSidebar() {
        ['brand', 'type', 'color'].forEach(cls => {
            document.querySelectorAll(`#popup-filter .flt-${cls}`).forEach(pi => {
                document.querySelectorAll(`.sidebar-section .flt-${cls}[value="${CSS.escape(pi.value)}"]`)
                    .forEach(si => si.checked = pi.checked);
            });
        });
        // condition
        const conds = Array.from(document.querySelectorAll('#popup-filter .flt-condition:checked'))
            .map(i => normalizeCondition(i.value));
        const sidebarRadios = document.querySelectorAll('input[name="sidebar-condition"]');
        const statusRadios = document.querySelectorAll('#popup-status input[name="status"]');
        if (conds.length === 1) {
            const vn = conds[0] === 'new' ? 'Mới' : 'Đã sử dụng';
            sidebarRadios.forEach(r => r.checked = r.value.trim().toLowerCase() === vn.toLowerCase());
            statusRadios.forEach(r => r.checked = normalizeCondition(r.value) === conds[0]);
        } else {
            sidebarRadios.forEach(r => r.checked = false);
            statusRadios.forEach(r => r.checked = false);
        }
        syncBrandPillsFromInputs();
    }
    function syncFromSidebarToPopup() {
        ['brand', 'type', 'color'].forEach(cls => {
            document.querySelectorAll(`.sidebar-section .flt-${cls}`).forEach(si => {
                document.querySelectorAll(`#popup-filter .flt-${cls}[value="${CSS.escape(si.value)}"]`)
                    .forEach(pi => pi.checked = si.checked);
            });
        });
        const sr = document.querySelector('input[name="sidebar-condition"]:checked');
        const key = sr ? normalizeCondition(sr.value) : null;
        document.querySelectorAll('#popup-filter .flt-condition').forEach(pi => {
            const k = normalizeCondition(pi.value);
            pi.checked = !!key && k === key;
        });
        syncBrandPillsFromInputs();
        updateSelectedFilters();
    }

    // ===== Render cards & pagination =====
    function createCard(v) {
        const img = v.vehicleImages?.[0]?.imagePath || '/images/default-vehicle.jpg';
        return `
      <div class="card listing-card mb-3" data-vehicle-id="${v.vehicleId}">
        <div class="row g-0">
          <div class="col-md-4 col-lg-3 position-relative">
            <img src="${esc(img)}" class="card-img-top listing-image" alt="${esc(v.title)}" loading="lazy">
            <span class="badge bg-dark text-white position-absolute top-0 start-0 m-2">${getTimeAgo(v.postedAt)}</span>
            <button class="btn btn-light btn-sm position-absolute bottom-0 end-0 m-2 favorite-btn" data-id="${v.vehicleId}"><i class="far fa-heart"></i></button>
          </div>
          <div class="col-md-8 col-lg-9">
            <div class="card-body h-100 d-flex flex-column">
              <h5 class="card-title listing-title">${esc(v.title)}</h5>
              <h6 class="card-price text-danger fw-bold mb-2">${formatPrice(v.salePrice)}</h6>
              <div class="card-meta text-muted small mb-2">
                ${v.manufactureYear ? `<span>${esc(v.manufactureYear)}</span>` : ''}
                ${v.category?.categoryName ? `<span>${esc(v.category.categoryName)}</span>` : ''}
                ${v.condition ? `<span>${esc(v.condition)}</span>` : ''}
              </div>
              <p class="card-location text-muted small mt-auto mb-0">
                <i class="fas fa-map-marker-alt me-1"></i>${esc(v.store?.address)}
              </p>
            </div>
          </div>
        </div>
      </div>`;
    }
    function renderVehicles() {
        const container = document.getElementById('listings-container');
        if (!container) return;
        const start = (state.currentPage - 1) * state.itemsPerPage;
        const items = state.filtered.slice(start, start + state.itemsPerPage);
        container.innerHTML = items.length === 0
            ? `<div class="text-center py-5"><h5 class="text-muted">Không tìm thấy xe phù hợp</h5></div>`
            : items.map(createCard).join('');
        bindCardInteractions();
        updatePagination();
    }
    function updatePagination() {
        const total = Math.max(1, Math.ceil(state.filtered.length / state.itemsPerPage));
        const nav = document.querySelector('.pagination-container');
        if (!nav) return;
        if (total <= 1) { nav.style.display = 'none'; return; }
        nav.style.display = 'flex';
        let html = `<a href="#" class="page-link ${state.currentPage === 1 ? 'disabled' : ''}" onclick="return false;">&lsaquo;</a>`;
        const max = Math.min(total, 9);
        for (let i = 1; i <= max; i++) {
            html += `<a href="#" class="page-link ${i === state.currentPage ? 'active' : ''}" data-page="${i}">${i}</a>`;
        }
        html += `<a href="#" class="page-link ${state.currentPage === total ? 'disabled' : ''}" onclick="return false;">&rsaquo;</a>`;
        nav.innerHTML = html;
        nav.querySelectorAll('.page-link[data-page]').forEach(a => a.addEventListener('click', e => {
            e.preventDefault();
            const p = Number(a.dataset.page);
            if (p) { state.currentPage = p; renderVehicles(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
        }));
    }
    function bindCardInteractions() {
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.removeEventListener('click', favHandler);
            btn.addEventListener('click', favHandler);
        });
        document.querySelectorAll('.listing-card').forEach(card => {
            card.removeEventListener('click', cardClickHandler);
            card.addEventListener('click', cardClickHandler);
        });
    }
    function favHandler(e) { e.stopPropagation(); const id = this.dataset.id; if (id) toggleFavorite(Number(id), this); }
    function cardClickHandler() { const id = this.dataset.vehicleId; if (id) location.href = `/Home/VehicleDetail/${id}`; }

    // ===== Data fetch =====
    async function fetchAllVehicles() {
        try {
            const res = await fetch('/Home/GetAllVehicles');
            const json = await res.json();
            if (!json.success) return [];
            return (json.data || []).filter(v => isElectric(v));
        } catch (err) {
            console.error('fetchAllVehicles', err);
            return [];
        }
    }
    async function fetchMetaFromServer() {
        try {
            const res = await fetch('/Home/GetElectricFilterData');
            const json = await res.json();
            if (json.success) return json;
            return null;
        } catch {
            return null;
        }
    }

    // ===== Build filter sets =====
    function buildFiltersFromVehicles(vehicles) {
        if (state.filtersBuilt) return;
        const brands = new Set();
        const colors = new Set();
        const types = new Set();
        const conditions = new Set();

        vehicles.forEach(v => {
            if (v.brand?.brandName) brands.add(v.brand.brandName.trim());
            if (v.color) colors.add(v.color.trim());
            if (v.condition) conditions.add(v.condition.trim());
            const src = toLower(`${v.category?.categoryName || ''} ${v.title || ''}`);
            if (src.includes('xe đạp')) types.add('Xe đạp điện');
            if (src.includes('scooter') || src.includes('tay ga') || src.includes('xe máy điện')) types.add('Xe máy điện');
            if (src.includes('mô tô') || src.includes('moto')) types.add('Mô tô điện');
            if (src.includes('scooter')) types.add('Scooter điện');
        });

        injectFilterOptions({ brands, colors, types, conditions });
        state.filtersBuilt = true;
    }

    // ===== Inject dynamic popup + sidebar =====
    function fillPopup(containerId, cssClass, set) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '';
        [...set].sort().forEach(v => {
            el.insertAdjacentHTML('beforeend',
                `<label class="me-2"><input type="checkbox" class="${cssClass} flt" value="${esc(v)}" /> ${esc(v)}</label>`);
        });
    }
    function fillPopupCondition(containerId, set) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '';
        const present = new Set([...set].map(c => normalizeCondition(c)));
        if (present.has('new'))
            el.insertAdjacentHTML('beforeend', `<label class="me-2"><input type="checkbox" class="flt-condition flt" value="Mới" /> Mới</label>`);
        if (present.has('used'))
            el.insertAdjacentHTML('beforeend', `<label class="me-2"><input type="checkbox" class="flt-condition flt" value="Đã sử dụng" /> Đã sử dụng</label>`);
    }
    function fillSidebar(id, cls, set) {
        const wrap = document.getElementById(id);
        if (!wrap || !set) return;
        Array.from(wrap.querySelectorAll('.sidebar-option')).forEach(op => op.remove());
        [...set].sort().forEach(v => {
            wrap.insertAdjacentHTML('beforeend', `<div class="sidebar-option"><input class="${cls}" type="checkbox" value="${esc(v)}" /> ${esc(v)}</div>`);
        });
    }
    function fillSidebarCondition(set) {
        const wrap = document.getElementById('sb-condition');
        if (!wrap) return;
        Array.from(wrap.querySelectorAll('.sidebar-option')).forEach(op => op.remove());
        const present = new Set([...set].map(c => normalizeCondition(c)));
        if (present.has('new'))
            wrap.insertAdjacentHTML('beforeend', `<div class="sidebar-option"><input name="sidebar-condition" class="flt-condition" type="radio" value="Mới" /> Mới</div>`);
        if (present.has('used'))
            wrap.insertAdjacentHTML('beforeend', `<div class="sidebar-option"><input name="sidebar-condition" class="flt-condition" type="radio" value="Đã sử dụng" /> Đã sử dụng</div>`);
    }

    function injectFilterOptions(metaSets) {
        // Popup
        fillPopup('brand-list-short', 'flt-brand', metaSets.brands); // short list
        fillPopup('popup-colors', 'flt-color', metaSets.colors);
        fillPopup('popup-types', 'flt-type', metaSets.types);
        fillPopupCondition('popup-condition', metaSets.conditions);

        // Full brand popup
        const brandFull = document.getElementById('brand-list-full');
        if (brandFull) {
            brandFull.innerHTML = '';
            [...metaSets.brands].sort().forEach(b =>
                brandFull.insertAdjacentHTML('beforeend', `<label><input type="checkbox" class="flt-brand flt" value="${esc(b)}" /> ${esc(b)}</label>`));
        }

        // Sidebar
        fillSidebar('sb-brands', 'flt-brand', metaSets.brands);
        fillSidebar('sb-colors', 'flt-color', metaSets.colors);
        fillSidebar('sb-types', 'flt-type', metaSets.types);
        fillSidebarCondition(metaSets.conditions);

        renderBrandPills(metaSets.brands);
        wireFilterEvents();
    }

    // ===== Events =====
    function wireFilterEvents() {
        document.querySelectorAll('#popup-filter .flt, #popup-brand .flt-brand')
            .forEach(chk => chk.addEventListener('change', () => {
                syncFromPopupToSidebar(); updateSelectedFilters(); scheduleApplyFilters();
            }));
        document.querySelectorAll('.sidebar-section input')
            .forEach(chk => chk.addEventListener('change', () => {
                syncFromSidebarToPopup(); scheduleApplyFilters();
            }));
    }

    // ===== Read filters =====
    function readDOMFilters() {
        const min = Number(document.getElementById('minPriceInput')?.value || 0);
        const max = Number(document.getElementById('maxPriceInput')?.value || 200000000);
        const popupChecked = Array.from(document.querySelectorAll('#popup-filter .flt:checked'));
        const popupBrands = popupChecked.filter(i => i.classList.contains('flt-brand')).map(i => i.value);
        const popupTypes = popupChecked.filter(i => i.classList.contains('flt-type')).map(i => i.value);
        const popupColors = popupChecked.filter(i => i.classList.contains('flt-color')).map(i => i.value);
        const popupConds = popupChecked.filter(i => i.classList.contains('flt-condition')).map(i => i.value);

        const sidebarBrands = Array.from(document.querySelectorAll('.sidebar-section .flt-brand:checked')).map(i => i.value);
        const sidebarTypes = Array.from(document.querySelectorAll('.sidebar-section .flt-type:checked')).map(i => i.value);
        const sidebarColors = Array.from(document.querySelectorAll('.sidebar-section .flt-color:checked')).map(i => i.value);
        const sidebarStatus = document.querySelector('input[name="sidebar-condition"]:checked')?.value || null;
        const popupStatus = document.querySelector('#popup-status input[name="status"]:checked')?.value || null;

        return {
            min, max,
            popupBrands, popupTypes, popupColors, popupConds,
            sidebarBrands, sidebarTypes, sidebarColors,
            popupStatus, sidebarStatus
        };
    }

    // ===== Apply filters =====
    async function applyFilters() {
        if (!state.filtersBuilt) {
            state.all = await fetchAllVehicles();
            state.meta = await fetchMetaFromServer();
            if (state.meta) {
                injectFilterOptions({
                    brands: new Set(state.meta.brands || []),
                    colors: new Set(state.meta.colors || []),
                    types: new Set(state.meta.types || []),
                    conditions: new Set(state.meta.conditions || [])
                });
                state.filtersBuilt = true;
            } else {
                buildFiltersFromVehicles(state.all);
            }
        } else {
            state.all = await fetchAllVehicles();
        }

        state.filtered = state.all.slice();
        const f = readDOMFilters();

        state.filtered = state.filtered.filter(v => {
            const price = v.salePrice || 0;
            if (price < f.min || price > f.max) return false;

            const vb = toLower(v.brand?.brandName);
            if (f.popupBrands.length && !f.popupBrands.some(b => toLower(b) === vb)) return false;
            if (f.sidebarBrands.length && !f.sidebarBrands.some(b => toLower(b) === vb)) return false;

            const typeSrc = toLower(`${v.category?.categoryName || ''} ${v.title || ''} ${v.model || ''}`);
            const matchesType = arr => arr.some(t => typeSrc.includes(toLower(t)));
            if (f.popupTypes.length && !matchesType(f.popupTypes)) return false;
            if (f.sidebarTypes.length && !matchesType(f.sidebarTypes)) return false;

            const col = toLower(v.color || '');
            if (f.popupColors.length && !f.popupColors.some(c => col.includes(toLower(c)))) return false;
            if (f.sidebarColors.length && !f.sidebarColors.some(c => col.includes(toLower(c)))) return false;

            const vCondNorm = normalizeCondition(v.condition);
            if (f.popupConds.length) {
                const ok = f.popupConds.some(pc => normalizeCondition(pc) === vCondNorm);
                if (!ok) return false;
            } else {
                const selStatus = f.popupStatus || f.sidebarStatus;
                if (selStatus) {
                    const s = normalizeCondition(selStatus);
                    if (s === 'new' && vCondNorm !== 'new') return false;
                    if (s === 'used' && vCondNorm !== 'used') return false;
                }
            }
            return true;
        });

        if (state.sort === 'price-asc') state.filtered.sort((a, b) => (a.salePrice || 0) - (b.salePrice || 0));
        else if (state.sort === 'price-desc') state.filtered.sort((a, b) => (b.salePrice || 0) - (a.salePrice || 0));
        else state.filtered.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));

        state.currentPage = 1;
        renderVehicles();
        renderActiveFilters();
    }

    // ===== Active filters chips =====
    function renderActiveFilters() {
        const container = document.getElementById('active-filters-container');
        const display = document.getElementById('active-filters-display');
        if (!container || !display) return;
        display.innerHTML = '';
        let has = false;

        const min = Number(document.getElementById('minPriceInput')?.value || 0);
        const max = Number(document.getElementById('maxPriceInput')?.value || 200000000);
        if (min > 0 || max < 200000000) {
            display.insertAdjacentHTML('beforeend',
                `<span class="filter-chip">${formatPrice(min)} - ${formatPrice(max)} <i class="fas fa-times" data-action="clear-price"></i></span>`);
            has = true;
        }

        const checked = Array.from(document.querySelectorAll(
            '#popup-filter .flt:not(.flt-condition):checked, .sidebar-section .flt-brand:checked, .sidebar-section .flt-type:checked, .sidebar-section .flt-color:checked'
        ));

        const seen = new Set();
        checked.forEach(ch => {
            const val = ch.value || '';
            const key = val.toLowerCase();
            if (seen.has(key)) return;
            seen.add(key);
            const label = ch.parentElement?.textContent?.trim() || val;
            display.insertAdjacentHTML('beforeend',
                `<span class="filter-chip">${esc(label)} <i class="fas fa-times" data-remove="${esc(val)}"></i></span>`);
            has = true;
        });

        const stRaw = document.querySelector('#popup-status input[name="status"]:checked')?.value
            || document.querySelector('input[name="sidebar-condition"]:checked')?.value;
        if (stRaw) {
            const stVi = stRaw === 'new' ? 'Mới' : (stRaw === 'used' ? 'Đã sử dụng' : stRaw);
            display.insertAdjacentHTML('beforeend',
                `<span class="filter-chip">${esc(stVi)} <i class="fas fa-times" data-action="clear-status"></i></span>`);
            has = true;
        }

        container.style.display = has ? 'block' : 'none';

        display.querySelectorAll('[data-remove]').forEach(el => {
            el.addEventListener('click', () => {
                const val = el.getAttribute('data-remove');
                document.querySelectorAll(`#popup-filter .flt[value="${CSS.escape(val)}"], #popup-brand .flt[value="${CSS.escape(val)}"]`)
                    .forEach(i => i.checked = false);
                document.querySelectorAll(`.sidebar-section input[value="${CSS.escape(val)}"]`)
                    .forEach(i => i.checked = false);
                document.querySelectorAll(`.brand-pill[data-brand="${CSS.escape(val)}"]`)
                    .forEach(p => p.classList.remove('active'));
                syncFromPopupToSidebar();
                scheduleApplyFilters();
            });
        });
        const clearPriceBtn = display.querySelector('[data-action="clear-price"]');
        if (clearPriceBtn) clearPriceBtn.addEventListener('click', () => {
            const minI = document.getElementById('minPriceInput'), maxI = document.getElementById('maxPriceInput');
            if (minI) minI.value = 0; if (maxI) maxI.value = 200000000;
            if (typeof updateSliderFromInput === 'function') updateSliderFromInput();
            scheduleApplyFilters();
        });
        const clearStatusBtn = display.querySelector('[data-action="clear-status"]');
        if (clearStatusBtn) clearStatusBtn.addEventListener('click', () => {
            document.querySelectorAll('input[name="status"], input[name="sidebar-condition"]').forEach(r => r.checked = false);
            document.querySelectorAll('#popup-filter .flt-condition').forEach(i => i.checked = false);
            scheduleApplyFilters();
        });
    }

    // ===== Sort menu / favorites / slider / view toggle =====
    function createSortMenu() {
        const sortBar = document.querySelector('.sort-bar');
        if (!sortBar) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'sort-dropdown ms-2 position-relative';
        wrapper.innerHTML = `
      <button class="sort-btn btn btn-sm btn-outline-secondary">Tin mới nhất <i class="fas fa-chevron-down ms-1" style="font-size:10px"></i></button>
      <div class="sort-menu position-absolute bg-white border rounded shadow-sm" style="display:none; right:0; z-index:2000; min-width:180px;">
        <a href="#" class="sort-option d-block px-3 py-2" data-sort="newest">Tin mới nhất</a>
        <a href="#" class="sort-option d-block px-3 py-2" data-sort="price-asc">Giá: thấp → cao</a>
        <a href="#" class="sort-option d-block px-3 py-2" data-sort="price-desc">Giá: cao → thấp</a>
      </div>`;
        sortBar.insertBefore(wrapper, sortBar.querySelector('.view-toggle') || null);
        const btn = wrapper.querySelector('.sort-btn');
        const menu = wrapper.querySelector('.sort-menu');
        btn.addEventListener('click', e => { e.stopPropagation(); menu.style.display = menu.style.display === 'block' ? 'none' : 'block'; });
        document.addEventListener('click', () => { if (menu) menu.style.display = 'none'; });
        wrapper.querySelectorAll('.sort-option').forEach(opt => {
            opt.addEventListener('click', e => {
                e.preventDefault();
                state.sort = opt.dataset.sort || 'newest';
                btn.innerHTML = `${opt.textContent} <i class="fas fa-chevron-down ms-1" style="font-size:10px"></i>`;
                scheduleApplyFilters();
                menu.style.display = 'none';
            });
        });
    }
    async function toggleFavorite(id, btn) {
        try {
            const res = await fetch('/Home/ToggleFavorite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `vehicleId=${encodeURIComponent(id)}`
            });
            const json = await res.json();
            if (!json.success) {
                if (json.needLogin) location.href = `/Account/Login?returnUrl=${encodeURIComponent(location.pathname)}`;
                else alert(json.message || 'Lỗi');
                return;
            }
            const isAdded = json.action === 'added';
            const icon = btn.querySelector('i');
            if (icon) {
                icon.classList.toggle('far', !isAdded);
                icon.classList.toggle('fas', isAdded);
            }
            btn.classList.toggle('active', isAdded);
        } catch (err) { console.error('toggleFavorite', err); }
    }
    function initPriceSlider() {
        const slider = document.getElementById('price-slider');
        if (!slider || typeof noUiSlider === 'undefined' || slider.noUiSlider) return;
        const MAX_PRICE = 200000000;
        noUiSlider.create(slider, {
            start: [0, MAX_PRICE],
            connect: true,
            range: { min: 0, max: MAX_PRICE },
            step: 1000000,
            format: { to: v => Math.round(v), from: v => Number(v) }
        });
        slider.noUiSlider.on('update', values => {
            const minI = document.getElementById('minPriceInput');
            const maxI = document.getElementById('maxPriceInput');
            if (minI) minI.value = values[0];
            if (maxI) maxI.value = values[1];
        });
        window.updateSliderFromInput = function () {
            let min = parseInt(document.getElementById('minPriceInput')?.value || '0', 10);
            let max = parseInt(document.getElementById('maxPriceInput')?.value || '200000000', 10);
            if (min > max) [min, max] = [max, min];
            slider.noUiSlider.set([min, max]);
        };
    }
    function initViewToggle() {
        const l = document.getElementById('list-view-btn'),
            g = document.getElementById('grid-view-btn'),
            c = document.getElementById('listings-container');
        if (!l || !g || !c) return;
        l.addEventListener('click', () => {
            c.classList.remove('grid-view'); c.classList.add('list-view');
            l.classList.add('active'); g.classList.remove('active');
        });
        g.addEventListener('click', () => {
            c.classList.remove('list-view'); c.classList.add('grid-view');
            g.classList.add('active'); l.classList.remove('active');
        });
    }

    // ===== Selected filters box (popup right) =====
    function updateSelectedFilters() {
        const box = document.getElementById('selected-filters');
        if (!box) return;
        const checked = Array.from(document.querySelectorAll('#popup-filter .flt:checked'));
        if (checked.length === 0) { box.innerHTML = 'Lọc theo:'; return; }
        const seen = new Set();
        box.innerHTML = 'Lọc theo: ';
        checked.forEach(c => {
            const key = c.value.toLowerCase();
            if (seen.has(key)) return;
            seen.add(key);
            const txt = c.parentElement?.textContent.trim() || c.value;
            box.insertAdjacentHTML('beforeend',
                `<span class="chip">${esc(txt)}<button class="chip-delete" data-remove="${esc(c.value)}">&times;</button></span>`);
        });
        box.querySelectorAll('[data-remove]').forEach(b => {
            b.addEventListener('click', () => {
                const v = b.dataset.remove;
                document.querySelectorAll(`#popup-filter .flt[value="${CSS.escape(v)}"]`).forEach(i => i.checked = false);
                syncFromPopupToSidebar();
                updateSelectedFilters();
                scheduleApplyFilters();
            });
        });
    }

    // ===== Clear functions =====
    function clearAllFilters() {
        document.querySelectorAll('#popup-filter .flt').forEach(i => i.checked = false);
        document.querySelectorAll('#popup-brand .flt').forEach(i => i.checked = false);
        document.querySelectorAll('.sidebar-section input[type=checkbox], .sidebar-section input[type=radio]')
            .forEach(i => i.checked = false);
        document.querySelectorAll('.brand-pill').forEach(p => p.classList.remove('active'));
        const min = document.getElementById('minPriceInput'), max = document.getElementById('maxPriceInput');
        if (min) min.value = 0;
        if (max) max.value = 200000000;
        if (typeof updateSliderFromInput === 'function') updateSliderFromInput();
        syncFromPopupToSidebar();
        updateSelectedFilters();
        scheduleApplyFilters();
    }

    // ===== Global listeners init =====
    function initListenAllChanges() {
        document.addEventListener('change', e => {
            const t = e.target;
            if (!t) return;
            if (t.closest('#popup-filter') && t.classList.contains('flt')) {
                syncFromPopupToSidebar(); updateSelectedFilters(); scheduleApplyFilters(); return;
            }
            if (t.closest('#popup-brand') && t.classList.contains('flt-brand')) {
                syncFromPopupToSidebar(); updateSelectedFilters(); scheduleApplyFilters(); return;
            }
            if (t.closest('.sidebar-section') &&
                (t.matches('.flt-brand, .flt-type, .flt-color') || t.matches('input[name="sidebar-condition"]'))) {
                syncFromSidebarToPopup(); scheduleApplyFilters(); return;
            }
            if (t.matches('#popup-status input[name="status"]')) {
                const key = normalizeCondition(t.value);
                document.querySelectorAll('input[name="sidebar-condition"]').forEach(r => r.checked = normalizeCondition(r.value) === key);
                document.querySelectorAll('#popup-filter .flt-condition').forEach(pi => pi.checked = normalizeCondition(pi.value) === key);
                updateSelectedFilters();
                scheduleApplyFilters();
                return;
            }
        });
    }

    function initBrandPills() {
        document.querySelectorAll('.brand-pill').forEach(p => {
            p.addEventListener('click', function () {
                const brand = this.dataset.brand;
                if (!brand) return;
                const willSelect = !this.classList.contains('active');
                setBrandSelection(brand, willSelect);
                this.classList.toggle('active', willSelect);
                scheduleApplyFilters();
            });
        });
    }

    function init() {
        document.addEventListener('DOMContentLoaded', () => {
            initViewToggle();
            createSortMenu();
            initBrandPills();
            initListenAllChanges();
            initPriceSlider();
            const clearAll = document.getElementById('clear-all-filters-link');
            if (clearAll) clearAll.addEventListener('click', e => { e.preventDefault(); clearAllFilters(); });
            scheduleApplyFilters(); // first build
        });
    }

    // ===== Expose =====
    window.applyFilters = applyFilters;
    window.updateSelectedFilters = updateSelectedFilters;
    window.applyPopupFilters = function () {
        syncFromPopupToSidebar(); updateSelectedFilters(); scheduleApplyFilters();
        if (typeof closePopup === 'function') closePopup('popup-filter');
    };
    window.clearPopupFilters = function () {
        document.querySelectorAll('#popup-filter .flt').forEach(f => f.checked = false);
        syncFromPopupToSidebar(); updateSelectedFilters(); scheduleApplyFilters();
    };
    window.clearAllFilters = clearAllFilters;
    window.clearAllAndApply = function () {
        clearAllFilters(); if (typeof closePopup === 'function') closePopup('popup-filter');
    };
    window.applyPrice = function () {
        scheduleApplyFilters(); if (typeof closePopup === 'function') closePopup('popup-price');
    };
    window.clearPrice = function () {
        const slider = document.getElementById('price-slider');
        if (slider?.noUiSlider) slider.noUiSlider.set([0, 200000000]);
    };
    window.selectStatus = function () { scheduleApplyFilters(); };
    window.clearStatus = function () {
        document.querySelectorAll('#popup-status input[type=radio]').forEach(el => el.checked = false);
        scheduleApplyFilters();
    };

    init();

    // ===== Brand pills render =====
    function renderBrandPills(brandsSet) {
        const cont = document.getElementById('ev-brand-strip') || document.querySelector('.brand-strip');
        if (!cont) return;
        const arr = Array.from(brandsSet || []).filter(Boolean).sort();
        cont.innerHTML = arr.map(b =>
            `<div class="brand-pill text-center" data-brand="${esc(b)}"><div class="small mt-1">${esc(b)}</div></div>`
        ).join('');
        initBrandPills();
        syncBrandPillsFromInputs();
    }
})();
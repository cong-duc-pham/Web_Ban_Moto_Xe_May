// Biến toàn cục để lưu dữ liệu thật từ server
let allVehicles = []; // Lưu trữ toàn bộ xe từ server
let filteredVehicles = []; // Lưu trữ xe sau khi lọc
let globalDropdownData = {}; // Lưu trữ Hãng, Danh mục, Cửa hàng

// Cài đặt phân trang
let currentPage = 1;
const itemsPerPage = 10; // Số mục mỗi trang

/**
 * Hàm khởi tạo chính, chạy khi trang tải xong
 */
document.addEventListener('DOMContentLoaded', async function () {
    await loadAllDropdownData();
    await loadAllVehicles();
    setupEventListeners();
});

/**
 * Tải tất cả xe từ C# Backend
 */
async function loadAllVehicles() {
    try {
        const response = await fetch('/Home/GetAllVehicles');
        if (!response.ok) throw new Error('Network error');
        const result = await response.json();

        if (result.success) {
            allVehicles = result.data.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
            filteredVehicles = allVehicles;
            updateStatsCards(allVehicles);
            applyFilters();
        } else {
            showNotification('Không thể tải danh sách xe: ' + result.message, 'danger');
        }
    } catch (error) {
        console.error(error);
        showNotification('Lỗi kết nối máy chủ', 'danger');
    }
}

/**
 * Tải dữ liệu cho các Dropdown (Hãng, Danh mục, Cửa hàng)
 */
async function loadAllDropdownData() {
    try {
        const response = await fetch('/Home/GetDropdownData');
        if (!response.ok) throw new Error('Network error');
        const result = await response.json();

        if (result.success) {
            globalDropdownData = result;
            populateDropdown('categoryFilter', result.categories, true);
            populateDropdown('brandId', result.brands);
            populateDropdown('categoryId', result.categories);
            populateDropdown('storeId', result.stores);

            // Các select trong modal có id tiếng Việt — đồng bộ nếu tồn tại
            populateDropdownIfExists('danhMuc', result.categories);
            populateDropdownIfExists('thuongHieu', result.brands);
            populateDropdownIfExists('cuaHang', result.stores);
        } else {
            console.warn("API /Home/GetDropdownData không chạy, dùng dữ liệu tạm.");
            populateDropdown('categoryFilter', [{ id: 'oto', name: 'Ô tô' }, { id: 'xemay', name: 'Xe máy' }], true);
        }
    } catch (error) {
        console.error(error);
    }
}

function populateDropdown(selectId, data, includeAll = false) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = includeAll ? '<option value="">Tất cả danh mục</option>' : '<option value="">-- Chọn --</option>';
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        select.appendChild(option);
    });
}

function populateDropdownIfExists(selectId, data) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">-- Chọn --</option>';
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        select.appendChild(option);
    });
}

/**
 * Gán sự kiện cho các nút
 */
function setupEventListeners() {
    const filterButton = document.querySelector('button[onclick="applyFilters()"]');
    if (filterButton) filterButton.addEventListener('click', applyFilters);

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('keyup', function (e) {
        if (e.key === 'Enter') applyFilters();
    });

    // Save button (support both id variants)
    const saveButton = document.getElementById('saveVehicleBtn') || document.getElementById('btnSave');
    if (saveButton) saveButton.addEventListener('click', handleSaveVehicle);

    // Also listen submit on the form to avoid default submit behavior
    const formElement = document.getElementById('vehicleForm') || document.getElementById('xeMayForm');
    if (formElement) {
        formElement.addEventListener('submit', function (e) {
            e.preventDefault();
            handleSaveVehicle(e);
        });
    }

    const tableBody = document.getElementById('vehicleTableBody');
    if (tableBody) tableBody.addEventListener('click', function (e) {
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) {
            e.preventDefault();
            const id = editBtn.getAttribute('data-id');
            showEditModal(id);
        }
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            e.preventDefault();
            const id = deleteBtn.getAttribute('data-id');
            confirmDelete(id);
        }
    });

    const addVehicleModal = document.getElementById('addVehicleModal');
    if (addVehicleModal) {
        addVehicleModal.addEventListener('hidden.bs.modal', function () {
            const form = document.getElementById('vehicleForm') || document.getElementById('xeMayForm');
            if (form) form.reset();
            const vid = document.getElementById('vehicleId') || document.getElementById('xeID');
            if (vid) vid.value = '0';
            const modalTitle = document.getElementById('modalTitle');
            if (modalTitle) modalTitle.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Thêm Bài Đăng Mới';
            const upload = document.getElementById('imageUploadSection');
            if (upload) upload.style.display = 'block';
            const preview = document.getElementById('imagePreview');
            if (preview) preview.innerHTML = '';
            // Re-enable save button if disabled
            const saveBtn = document.getElementById('saveVehicleBtn') || document.getElementById('btnSave');
            if (saveBtn) saveBtn.disabled = false;
        });
    }

    // Image preview
    const hinhAnhInput = document.getElementById('hinhAnh');
    if (hinhAnhInput) hinhAnhInput.addEventListener('change', function (e) {
        const files = Array.from(e.target.files || []);
        renderImagePreview(files);
    });

    // Format inputs: support both 'salePrice' and 'gia'
    const salePriceInput = document.getElementById('salePrice') || document.getElementById('gia');
    if (salePriceInput && salePriceInput.tagName === 'INPUT' && salePriceInput.type !== 'number') {
        salePriceInput.addEventListener('input', function (e) {
            e.target.value = formatNumber(e.target.value);
        });
    }
}

/**
 * Render preview thumbnails
 */
function renderImagePreview(files) {
    const preview = document.getElementById('imagePreview');
    if (!preview) return;
    preview.innerHTML = '';
    files.forEach((file, idx) => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = function (ev) {
            const wrapper = document.createElement('div');
            wrapper.className = 'position-relative';
            wrapper.style.width = '100px';
            wrapper.style.height = '70px';
            wrapper.style.overflow = 'hidden';
            wrapper.style.border = '1px solid #ddd';
            wrapper.style.borderRadius = '6px';
            wrapper.style.display = 'inline-block';
            wrapper.style.marginRight = '6px';

            const img = document.createElement('img');
            img.src = ev.target.result;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';

            const badge = document.createElement('span');
            badge.className = 'badge bg-primary position-absolute';
            badge.style.right = '6px';
            badge.style.top = '6px';
            badge.textContent = idx === 0 ? 'Ảnh chính' : '';

            wrapper.appendChild(img);
            wrapper.appendChild(badge);
            preview.appendChild(wrapper);
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Lọc danh sách xe dựa trên các lựa chọn
 */
function applyFilters() {
    const search = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const category = document.getElementById('categoryFilter')?.value;
    const status = document.getElementById('statusFilter')?.value;

    filteredVehicles = allVehicles.filter(v => {
        const matchSearch = !search ||
            (v.title && v.title.toLowerCase().includes(search)) ||
            (v.store?.address && v.store.address.toLowerCase().includes(search));
        const matchCategory = !category || (v.category && v.category.categoryId == category);

        let matchStatus = false;
        if (status === "") matchStatus = true;
        else if (status === "active") matchStatus = v.status === "Available";
        else if (status === "pending") matchStatus = v.status === "Pending";
        else if (status === "sold") matchStatus = v.status === "SoldOut";
        else if (status === "hidden") matchStatus = v.status !== "Available" && v.status !== "Pending" && v.status !== "SoldOut";

        return matchSearch && matchCategory && matchStatus;
    });

    currentPage = 1;
    renderTable();
    renderPagination();
}

/**
 * Render bảng
 */
function renderTable() {
    const tbody = document.getElementById('vehicleTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const data = filteredVehicles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center p-4">Không tìm thấy bài đăng nào.</td></tr>';
        return;
    }

    data.forEach(vehicle => {
        const statusClass = { 'Available': 'bg-success', 'Pending': 'bg-warning text-dark', 'SoldOut': 'bg-secondary' };
        const statusText = { 'Available': 'Đang hoạt động', 'Pending': 'Chờ duyệt', 'SoldOut': 'Đã bán' };
        const primaryImage = vehicle.vehicleImages?.find(img => img.isPrimary) || vehicle.vehicleImages?.[0];
        const imagePath = primaryImage?.imagePath || 'https://via.placeholder.com/200x150/6c757d/ffffff?text=No+Image';

        const row = `
            <tr class="fade-in">
                <td data-label=""><input type="checkbox" class="form-check-input"></td>
                <td data-label="Hình ảnh:"><img src="${imagePath}" class="vehicle-img" alt="${vehicle.title}"></td>
                <td data-label="Tiêu đề:">
                    <strong>${vehicle.title}</strong><br>
                    <small class="text-muted">${vehicle.manufactureYear || ''} • ${vehicle.condition || 'N/A'}</small>
                </td>
                <td data-label="Danh mục:"><span class="badge bg-primary">${vehicle.category?.categoryName || 'N/A'}</span></td>
                <td data-label="Giá:"><span class="price-text">${vehicle.salePrice ? vehicle.salePrice.toLocaleString('vi-VN') + ' đ' : 'Liên hệ'}</span></td>
                <td data-label="Địa điểm:"><i class="bi bi-geo-alt text-danger me-1"></i> ${vehicle.store?.address || 'N/A'}</td>
                <td data-label="Trạng thái:"><span class="badge-status ${statusClass[vehicle.status] || 'bg-dark'}">${statusText[vehicle.status] || vehicle.status}</span></td>
                <td data-label="Ngày đăng:"><small class="text-muted">${getTimeAgo(vehicle.postedAt)}<br>${vehicle.vehicleImages?.length || 0} ảnh</small></td>
                <td data-label="Thao tác:">
                    <button class="btn btn-sm btn-primary btn-action edit-btn" data-id="${vehicle.vehicleId}" title="Chỉnh sửa">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-action delete-btn" data-id="${vehicle.vehicleId}" title="Xóa">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

/**
 * Cập nhật các thẻ thống kê
 */
function updateStatsCards(vehicles) {
    document.getElementById('totalPosts').textContent = vehicles.length.toLocaleString('vi-VN');
    document.getElementById('activePosts').textContent = vehicles.filter(v => v.status === 'Available').length.toLocaleString('vi-VN');
    document.getElementById('pendingPosts').textContent = vehicles.filter(v => v.status === 'Pending').length.toLocaleString('vi-VN');
    document.getElementById('hiddenPosts').textContent = vehicles.filter(v => v.status === 'SoldOut').length.toLocaleString('vi-VN');
}

/**
 * Render thanh phân trang
 */
function renderPagination() {
    const totalItems = filteredVehicles.length;
    const pageCount = Math.ceil(totalItems / itemsPerPage);
    const container = document.getElementById('pagination');
    if (!container) return;

    const startItem = (totalItems > 0) ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    document.getElementById('showingCount').textContent = `${startItem}-${endItem}`;
    document.getElementById('totalCount').textContent = totalItems.toLocaleString('vi-VN');

    if (pageCount <= 1) { container.innerHTML = ''; return; }

    let paginationHTML = `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}"><a class="page-link" href="#" onclick="changePage(event, ${currentPage - 1})"><span>&laquo;</span></a></li>`;
    for (let i = 1; i <= pageCount; i++) {
        paginationHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="#" onclick="changePage(event, ${i})">${i}</a></li>`;
    }
    paginationHTML += `<li class="page-item ${currentPage === pageCount ? 'disabled' : ''}"><a class="page-link" href="#" onclick="changePage(event, ${currentPage + 1})"><span>&raquo;</span></a></li>`;

    container.innerHTML = paginationHTML;
}

/**
 * Chuyển trang
 */
function changePage(event, page) {
    event.preventDefault();
    const pageCount = Math.ceil(filteredVehicles.length / itemsPerPage);
    if (page < 1) page = 1;
    if (page > pageCount) page = pageCount;
    currentPage = page;
    renderTable();
    renderPagination();
    window.scrollTo(0, 0);
}

/* -------------------------
   Add / Edit / Delete logic
   ------------------------- */

/**
 * Mở modal để Thêm
 */
function showAddModal() {
    const form = document.getElementById('vehicleForm') || document.getElementById('xeMayForm');
    if (form) form.reset();
    const vid = document.getElementById('vehicleId') || document.getElementById('xeID');
    if (vid) vid.value = '0';
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Thêm Bài Đăng Mới';
    const upload = document.getElementById('imageUploadSection');
    if (upload) upload.style.display = 'block';
    const preview = document.getElementById('imagePreview');
    if (preview) preview.innerHTML = '';
    const modal = new bootstrap.Modal(document.getElementById('addVehicleModal'));
    modal.show();
}

/**
 * Mở modal để Sửa (lấy dữ liệu từ API và điền vào form)
 */
async function showEditModal(id) {
    try {
        const response = await fetch(`/Home/GetVehicleById?id=${id}`);
        if (!response.ok) throw new Error('Không tìm thấy xe');
        const result = await response.json();
        if (!result.success) { showNotification(result.message, 'danger'); return; }
        const vehicle = result.data;

        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) modalTitle.innerHTML = '<i class="bi bi-pencil me-2"></i>Chỉnh Sửa Bài Đăng';

        // Hidden id fields
        const vid = document.getElementById('vehicleId') || document.getElementById('xeID');
        if (vid) vid.value = vehicle.vehicleId ?? id;

        // Điền các trường (ưu tiên id tiếng Việt có trong modal)
        setValueIfExists('tenXe', vehicle.title);
        setValueIfExists('title', vehicle.title);

        setValueIfExists('gia', vehicle.salePrice);
        setValueIfExists('salePrice', formatNumber(vehicle.salePrice));

        setValueIfExists('moTa', vehicle.description);
        setValueIfExists('description', vehicle.description);

        setValueIfExists('soLuong', vehicle.stockQuantity);
        setValueIfExists('stockQuantity', vehicle.stockQuantity);

        setValueIfExists('thuongHieu', vehicle.brandId);
        setValueIfExists('brandId', vehicle.brandId);

        setValueIfExists('danhMuc', vehicle.categoryId);
        setValueIfExists('categoryId', vehicle.categoryId);

        setValueIfExists('cuaHang', vehicle.storeId);
        setValueIfExists('storeId', vehicle.storeId);

        setValueIfExists('model', vehicle.model);
        setValueIfExists('namSX', vehicle.manufactureYear);
        setValueIfExists('manufactureYear', vehicle.manufactureYear);

        setValueIfExists('dungTich', vehicle.engineCapacity);
        setValueIfExists('mauSac', vehicle.color);
        setValueIfExists('color', vehicle.color);

        // Ẩn upload khi sửa (giữ như MotorbikeOnline)
        const upload = document.getElementById('imageUploadSection');
        if (upload) upload.style.display = 'none';

        // Hiển thị ảnh hiện có (nếu trả về)
        const preview = document.getElementById('imagePreview');
        if (preview) {
            preview.innerHTML = '';
            if (vehicle.vehicleImages && vehicle.vehicleImages.length > 0) {
                vehicle.vehicleImages.forEach((img, idx) => {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'position-relative';
                    wrapper.style.width = '100px';
                    wrapper.style.height = '70px';
                    wrapper.style.overflow = 'hidden';
                    wrapper.style.border = '1px solid #ddd';
                    wrapper.style.borderRadius = '6px';
                    wrapper.style.display = 'inline-block';
                    wrapper.style.marginRight = '6px';

                    const imageEl = document.createElement('img');
                    imageEl.src = img.imagePath;
                    imageEl.style.width = '100%';
                    imageEl.style.height = '100%';
                    imageEl.style.objectFit = 'cover';

                    const badge = document.createElement('span');
                    badge.className = 'badge bg-primary position-absolute';
                    badge.style.right = '6px';
                    badge.style.top = '6px';
                    badge.textContent = img.isPrimary ? 'Ảnh chính' : '';

                    wrapper.appendChild(imageEl);
                    wrapper.appendChild(badge);
                    preview.appendChild(wrapper);
                });
            }
        }

        const modal = new bootstrap.Modal(document.getElementById('addVehicleModal'));
        modal.show();
    } catch (error) {
        showNotification('Lỗi khi lấy thông tin xe: ' + error.message, 'danger');
    }
}

function setValueIfExists(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'SELECT' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.value = value ?? '';
    }
}

/**
 * Xóa xe (gọi API)
 */
async function confirmDelete(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa bài đăng này?')) return;
    try {
        const response = await fetch(`/Home/DeleteVehicle?id=${id}`, { method: 'POST' });
        const result = await response.json();
        if (result.success) {
            showNotification('Đã xóa bài đăng thành công!', 'success');
            await loadAllVehicles();
        } else {
            showNotification(result.message, 'danger');
        }
    } catch (error) {
        showNotification('Lỗi khi xóa bài đăng', 'danger');
    }
}

/**
 * Lưu (Thêm mới hoặc Cập nhật)
 * Implemented using logic from MotorbikeOnlineAdmin.js:
 * - Add: FormData with files, fields mapped to server model
 * - Edit: JSON payload sent to /Home/EditVehicle
 */
async function handleSaveVehicle(event) {
    if (event) event.preventDefault();

    const form = document.getElementById('vehicleForm') || document.getElementById('xeMayForm');
    if (!form) return;

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const btnSave = document.getElementById('saveVehicleBtn') || document.getElementById('btnSave');
    const originalBtnHtml = btnSave ? btnSave.innerHTML : null;
    if (btnSave) {
        btnSave.disabled = true;
        btnSave.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    }

    const vehicleIdEl = document.getElementById('vehicleId') || document.getElementById('xeID');
    const vehicleId = vehicleIdEl ? parseInt(vehicleIdEl.value || '0') : 0;
    const isAdd = vehicleId === 0;

    try {
        if (isAdd) {
            // Build FormData similar to MotorbikeOnlineAdmin.js
            const formData = new FormData(form);
            const title = formData.get('TenXe') || formData.get('tenXe') || formData.get('Title') || '';
            const saleRaw = formData.get('Gia') || formData.get('gia') || formData.get('SalePrice') || '';
            const storeId = formData.get('StoreId') || formData.get('cuaHang') || '';
            const categoryId = formData.get('CategoryId') || formData.get('danhMuc') || '';
            const brandId = formData.get('BrandId') || formData.get('thuongHieu') || '';

            const submitData = new FormData();
            submitData.append('VehicleId', vehicleId);
            submitData.append('Title', title);
            submitData.append('Model', formData.get('Model') || formData.get('model') || '');
            submitData.append('SalePrice', parseFloat(unformatNumber(saleRaw || '0')) || 0);
            submitData.append('ManufactureYear', formData.get('ManufactureYear') || formData.get('namSX') || '0');
            submitData.append('EngineCapacity', formData.get('EngineCapacity') || formData.get('dungTich') || '0');
            submitData.append('Color', formData.get('Color') || formData.get('mauSac') || '');
            submitData.append('Description', formData.get('MoTa') || formData.get('moTa') || '');
            submitData.append('StoreId', storeId);
            submitData.append('CategoryId', categoryId);
            submitData.append('BrandId', brandId);
            submitData.append('Status', 'Available');
            submitData.append('Condition', formData.get('Condition') || 'Mới');

            // Append files if any
            const fileInput = document.getElementById('hinhAnh');
            if (fileInput && fileInput.files) {
                for (let i = 0; i < fileInput.files.length; i++) {
                    submitData.append('HinhAnh', fileInput.files[i]);
                }
            }

            // Debug log
            console.group('AddVehicle payload (FormData)');
            for (const pair of submitData.entries()) {
                console.log(pair[0], pair[1]);
            }
            console.groupEnd();

            const response = await fetch('/Home/AddVehicle', { method: 'POST', body: submitData });
            const text = await response.text();
            let result;
            try { result = JSON.parse(text); } catch (e) { result = { success: false, message: `Invalid server response: ${text}` }; }

            console.log('AddVehicle response:', response.status, result);

            if (result.success) {
                const modalEl = document.getElementById('addVehicleModal') || document.getElementById('xeMayModal');
                const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modalInstance.hide();
                await loadAllVehicles();
                showNotification(result.message || 'Thêm thành công', 'success');
            } else {
                showNotification(result.message || 'Không thể thêm', 'danger');
            }
        } else {
            // Build JSON object for edit (match MotorbikeOnlineAdmin.js)
            const formData = new FormData(form);
            const saleValue = formData.get('SalePrice') || formData.get('Gia') || formData.get('gia') || '0';
            const obj = {
                VehicleId: vehicleId,
                Title: formData.get('Title') || formData.get('TenXe') || formData.get('tenXe') || '',
                Model: formData.get('Model') || formData.get('model') || null,
                SalePrice: parseFloat(unformatNumber(saleValue)) || 0,
                ManufactureYear: formData.get('ManufactureYear') ? parseInt(formData.get('ManufactureYear')) : (formData.get('namSX') ? parseInt(formData.get('namSX')) : null),
                EngineCapacity: formData.get('EngineCapacity') ? parseInt(formData.get('EngineCapacity')) : (formData.get('dungTich') ? parseInt(formData.get('dungTich')) : null),
                Color: formData.get('Color') || formData.get('mauSac') || null,
                Description: formData.get('Description') || formData.get('MoTa') || formData.get('moTa') || '',
                StoreId: formData.get('StoreId') ? parseInt(formData.get('StoreId')) : (formData.get('cuaHang') ? parseInt(formData.get('cuaHang')) : 0),
                CategoryId: formData.get('CategoryId') ? parseInt(formData.get('CategoryId')) : (formData.get('danhMuc') ? parseInt(formData.get('danhMuc')) : 0),
                BrandId: formData.get('BrandId') ? parseInt(formData.get('BrandId')) : (formData.get('thuongHieu') ? parseInt(formData.get('thuongHieu')) : 0),
                Status: 'Available',
                Condition: formData.get('Condition') || 'Mới'
            };

            // Debug payload
            console.group('EditVehicle payload (JSON)');
            console.log(obj);
            console.groupEnd();

            const response = await fetch('/Home/EditVehicle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(obj)
            });

            const text = await response.text();
            let result;
            try { result = JSON.parse(text); } catch (e) { result = { success: false, message: `Invalid server response: ${text}` }; }

            console.log('EditVehicle response:', response.status, result);

            if (result.success) {
                const modalEl = document.getElementById('addVehicleModal') || document.getElementById('xeMayModal');
                const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modalInstance.hide();
                await loadAllVehicles();
                showNotification(result.message || 'Cập nhật thành công', 'success');
            } else {
                console.error('EditVehicle failed:', result);
                showNotification(result.message || 'Không thể cập nhật', 'danger');
            }
        }
    } catch (error) {
        console.error('Error saving vehicle:', error);
        showNotification('Lỗi khi lưu bài đăng: ' + (error.message || error), 'danger');
    } finally {
        if (btnSave) {
            btnSave.disabled = false;
            if (originalBtnHtml) btnSave.innerHTML = originalBtnHtml;
        }
    }
}

/**
 * Hiển thị thông báo (toast)
 */
function showNotification(message, type) {
    const toastContainer = document.getElementById('toastContainer') || document.createElement('div');
    if (!toastContainer.id) {
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }

    const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill';

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0 show`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="bi ${icon} me-2"></i> ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    toastContainer.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

/**
 * Hàm tiện ích tính toán thời gian
 */
function getTimeAgo(dateString) {
    if (!dateString) return 'Không rõ';
    const date = new Date(dateString);
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
    if (seconds < 10) return `Vừa xong`;
    return `${seconds} giây trước`;
}

// --- HÀM ĐỊNH DẠNG SỐ (ĐỂ XỬ LÝ DẤU CHẤM) ---
/**
 * Định dạng số (10000000 -> "10.000.000")
 */
function formatNumber(n) {
    if (n === undefined || n === null) return '';
    let num = n.toString().replace(/[^0-9]/g, '');
    if (num === '') return '';
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Xóa định dạng ("10.000.000" -> "10000000")
 */
function unformatNumber(s) {
    if (!s) return '';
    return s.toString().replace(/\./g, '');
}

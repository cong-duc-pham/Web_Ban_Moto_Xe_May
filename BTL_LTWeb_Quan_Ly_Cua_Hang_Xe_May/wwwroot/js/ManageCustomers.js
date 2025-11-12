// Global variables
let allCustomers = [];
let filteredCustomers = [];
let currentPage = 1;
const itemsPerPage = 10;
let deleteTargetId = null;

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', async function () {
    await loadAllCustomers();
    setupEventListeners();
});

/**
 * Load all customers from server
 */
async function loadAllCustomers() {
    try {
        const response = await fetch('/Account/GetCustomersJson');
        if (!response.ok) throw new Error('Network error');

        // API này trả về array trực tiếp, không phải { success: true, data: [...] }
        const customers = await response.json();

        if (Array.isArray(customers)) {
            // Map lại để match với cấu trúc expected
            allCustomers = customers.map(c => ({
                userId: c.userId,
                fullName: c.fullName,
                phoneNumber: c.phoneNumber,
                email: c.email,
                status: c.status,
                roleId: c.roleId,
                roleName: c.roleName
            }));

            filteredCustomers = allCustomers;
            updateStatsCards(allCustomers);
            currentPage = 1;
            renderTable();
            applyFilters();
        } else {
            showNotification('Không thể tải danh sách khách hàng', 'danger');
        }
    } catch (error) {
        console.error(error);
        showNotification('Lỗi kết nối máy chủ', 'danger');
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    document.getElementById('saveBtn')?.addEventListener('click', handleSaveCustomer);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', handleConfirmDelete);
    document.getElementById('searchInput')?.addEventListener('keyup', () => {
        currentPage = 1;
        applyFilters();
    });
    document.getElementById('customerModal')?.addEventListener('hidden.bs.modal', resetForm);
}

/**
 * Update statistics cards
 */
//function updateStatsCards(customers) {
//    const total = customers.length;
//    const active = customers.filter(c => c.status === 'Active').length;
//    const locked = customers.filter(c => c.status === 'Locked').length;
//    const roleCustomer = customers.filter(c => c.roleId === 3).length;

//    document.getElementById('totalCustomers').textContent = total.toLocaleString('vi-VN');
//    document.getElementById('activeCustomers').textContent = active.toLocaleString('vi-VN');
//    document.getElementById('lockedCustomers').textContent = locked.toLocaleString('vi-VN');
//    document.getElementById('customerRoleCount').textContent = roleCustomer.toLocaleString('vi-VN');
//}
function updateStatsCards(customers) {
    const total = customers.length;
    const active = customers.filter(c => c.status === 'Active').length;
    const locked = customers.filter(c => c.status === 'Locked').length;
    const roleCustomer = customers.filter(c => c.roleId === 3).length;

    // Kiểm tra phần tử tồn tại trước khi set textContent
    const totalEl = document.getElementById('totalCustomers');
    if (totalEl) totalEl.textContent = total.toLocaleString('vi-VN');

    const activeEl = document.getElementById('activeCustomers');
    if (activeEl) activeEl.textContent = active.toLocaleString('vi-VN');

    const lockedEl = document.getElementById('lockedCustomers');
    if (lockedEl) lockedEl.textContent = locked.toLocaleString('vi-VN');

    const roleEl = document.getElementById('customerRoleCount');
    if (roleEl) roleEl.textContent = roleCustomer.toLocaleString('vi-VN');
}
/**
 * Client-side validation for payload
 */
function validatePayload(payload, isAdd) {
    if (!payload.fullName || payload.fullName.trim().length < 3 || payload.fullName.trim().length > 100) {
        return { valid: false, message: 'Họ và tên phải có độ dài từ 3 đến 100 ký tự.' };
    }

    if (!payload.phoneNumber || !/^\d{9,11}$/.test(payload.phoneNumber.trim())) {
        return { valid: false, message: 'Số điện thoại không hợp lệ. Vui lòng nhập 9-11 chữ số.' };
    }

    if (payload.email && payload.email.trim().length > 0) {
        // simple email regex
        const email = payload.email.trim();
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(email)) {
            return { valid: false, message: 'Email không hợp lệ.' };
        }
    }

    if (isAdd) {
        if (!payload.password || payload.password.length < 6) {
            return { valid: false, message: 'Mật khẩu bắt buộc và phải có ít nhất 6 ký tự.' };
        }
    } else {
        if (payload.password && payload.password.length > 0 && payload.password.length < 6) {
            return { valid: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' };
        }
    }

    if (payload.status && payload.status !== 'Active' && payload.status !== 'Locked') {
        return { valid: false, message: 'Trạng thái không hợp lệ.' };
    }

    return { valid: true, message: '' };
}

/**
 * Apply filters
 */
function applyFilters() {
    const search = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const status = document.getElementById('statusFilter')?.value || '';

    filteredCustomers = allCustomers.filter(c => {
        const matchSearch = !search ||
            (c.fullName && c.fullName.toLowerCase().includes(search)) ||
            (c.email && c.email.toLowerCase().includes(search)) ||
            (c.phoneNumber && c.phoneNumber.includes(search));

        const matchStatus = !status || c.status === status;

        return matchSearch && matchStatus;
    });

    currentPage = 1;
    renderTable();
    renderPagination();
}

/**
 * Render table
 */
function renderTable() {
    const tbody = document.getElementById('customerTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const data = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center p-4"><i class="fas fa-inbox text-muted me-2"></i>Không tìm thấy khách hàng nào.</td></tr>';
        return;
    }

    data.forEach((customer) => {
        const statusClass = {
            'Active': 'bg-success',
            'Locked': 'bg-warning'
        };
        const statusText = {
            'Active': 'Đang hoạt động',
            'Locked': 'Bị khóa'
        };

        const row = `
            <tr class="fade-in">
                <td><input type="checkbox" class="form-check-input" value="${customer.userId}"></td>
                <td>
                    <strong>${customer.fullName}</strong>
                </td>
                <td><small>${customer.email || 'N/A'}</small></td>
                <td><small>${customer.phoneNumber}</small></td>
                <td>
                    <span class="badge-status ${statusClass[customer.status] || 'bg-secondary'}">${statusText[customer.status] || customer.status}</span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary btn-action" onclick="showEditModal(${customer.userId})" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-action" onclick="showDeleteModal(${customer.userId})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

/**
 * Render pagination
 */
function renderPagination() {
    const totalItems = filteredCustomers.length;
    const pageCount = Math.ceil(totalItems / itemsPerPage);
    const container = document.getElementById('pagination');
    if (!container) return;

    const startItem = (totalItems > 0) ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    document.getElementById('showingCount').textContent = `${startItem}-${endItem}`;
    document.getElementById('totalCount').textContent = totalItems.toLocaleString('vi-VN');

    if (pageCount <= 1) {
        container.innerHTML = '';
        return;
    }

    let paginationHTML = `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}"><a class="page-link" href="#" onclick="changePage(event, ${currentPage - 1})">« Trước</a></li>`;
    for (let i = 1; i <= pageCount; i++) {
        paginationHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="#" onclick="changePage(event, ${i})">${i}</a></li>`;
    }
    paginationHTML += `<li class="page-item ${currentPage === pageCount ? 'disabled' : ''}"><a class="page-link" href="#" onclick="changePage(event, ${currentPage + 1})">Sau »</a></li>`;

    container.innerHTML = paginationHTML;
}

/**
 * Change page
 */
function changePage(event, page) {
    event.preventDefault();
    const pageCount = Math.ceil(filteredCustomers.length / itemsPerPage);
    if (page < 1 || page > pageCount) return;
    currentPage = page;
    renderTable();
    renderPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Show add modal
 */
function showAddModal() {
    resetForm();
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-plus me-2"></i>Thêm Khách Hàng';
    document.getElementById('customerId').value = '0';
    document.getElementById('password').required = true;
    document.getElementById('password').value = '';
    // ensure roleId = 3
    const roleSelect = document.getElementById('roleId');
    if (roleSelect) roleSelect.value = '3';
    const statusSelect = document.getElementById('status');
    if (statusSelect) statusSelect.value = 'Active';
    const modal = new bootstrap.Modal(document.getElementById('customerModal'));
    modal.show();
}

/**
 * Show edit modal
 */
async function showEditModal(id) {
    try {
        const response = await fetch(`/Account/GetUserById?id=${id}`);
        if (!response.ok) throw new Error('Not found');
        const json = await response.json();

        // Hỗ trợ cả kiểu trả về trực tiếp hoặc { success: true, data: {...} }
        const customer = (json && json.success) ? json.data : json;

        if (!customer) {
            showNotification('Không tìm thấy khách hàng', 'danger');
            return;
        }

        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-edit me-2"></i>Chỉnh Sửa Khách Hàng';
        document.getElementById('customerId').value = customer.userId ?? customer.UserId ?? 0;
        document.getElementById('fullName').value = customer.fullName ?? customer.FullName ?? '';
        document.getElementById('email').value = customer.email ?? customer.Email ?? '';
        document.getElementById('phoneNumber').value = customer.phoneNumber ?? customer.PhoneNumber ?? '';
        // Ensure roleId exists (this UI manages only customers)
        const roleSelect = document.getElementById('roleId');
        if (roleSelect) {
            roleSelect.value = (customer.roleId ?? customer.RoleId ?? 3).toString();
        }
        document.getElementById('status').value = customer.status ?? customer.Status ?? 'Active';
        document.getElementById('password').required = false;
        document.getElementById('password').value = '';
        document.getElementById('password').placeholder = 'Để trống nếu không thay đổi';

        const modal = new bootstrap.Modal(document.getElementById('customerModal'));
        modal.show();
    } catch (error) {
        showNotification('Lỗi khi tải thông tin: ' + error.message, 'danger');
    }
}

/**
 * Show delete confirmation
 */
function showDeleteModal(id) {
    deleteTargetId = id;
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}

/**
 * Confirm and execute delete
 */
async function handleConfirmDelete() {
    if (!deleteTargetId) return;

    try {
        const response = await fetch(`/Account/DeleteConfirmed/${deleteTargetId}`, { method: 'POST' });
        const result = await response.json();

        if (result.success) {
            bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
            showNotification('Đã xóa khách hàng thành công!', 'success');
            await loadAllCustomers();
        } else {
            showNotification(result.message, 'danger');
        }
    } catch (error) {
        showNotification('Lỗi khi xóa: ' + error.message, 'danger');
    }
}

/**
 * Save customer (add or edit)
 */
async function handleSaveCustomer() {
    const form = document.getElementById('customerForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const customerId = parseInt(document.getElementById('customerId').value || '0');
    const isAdd = customerId === 0;

    const payload = {
        userId: customerId,
        fullName: (document.getElementById('fullName').value || '').trim(),
        email: (document.getElementById('email').value || '').trim(),
        phoneNumber: (document.getElementById('phoneNumber').value || '').trim(),
        roleId: parseInt(document.getElementById('roleId')?.value || '3'),
        status: document.getElementById('status')?.value || 'Active',
        password: isAdd ? (document.getElementById('password').value || '') : (document.getElementById('password').value || '')
    };

    const v = validatePayload(payload, isAdd);
    if (!v.valid) {
        showNotification(v.message, 'danger');
        return;
    }

    const btn = document.getElementById('saveBtn');
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

    try {
        const endpoint = isAdd ? '/Account/Register' : '/Account/Edit';
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // nếu server trả lỗi http
        if (!response.ok) {
            let text;
            try { text = await response.text(); } catch { text = response.statusText; }
            throw new Error('Server error: ' + text);
        }

        const result = await response.json();

        if (result.success) {
            bootstrap.Modal.getInstance(document.getElementById('customerModal')).hide();
            showNotification(result.message || (isAdd ? 'Thêm thành công' : 'Cập nhật thành công'), 'success');
            await loadAllCustomers();
        } else {
            showNotification(result.message || 'Có lỗi xảy ra', 'danger');
        }
    } catch (error) {
        console.error(error);
        showNotification('Lỗi: ' + (error.message || 'Không thể kết nối'), 'danger');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
    }
}

/**
 * Reset form
 */
function resetForm() {
    document.getElementById('customerForm').reset();
    document.getElementById('customerId').value = '0';
    document.getElementById('password').required = true;
    document.getElementById('password').placeholder = 'Nhập mật khẩu';
}

/**
 * Toggle password visibility
 */
function togglePassword() {
    const input = document.getElementById('password');
    input.type = input.type === 'password' ? 'text' : 'password';
}

/**
 * Show notification
 */
function showNotification(message, type) {
    const toastContainer = document.getElementById('toastContainer') || document.createElement('div');
    if (!toastContainer.id) {
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }

    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';
    const bgClass = `bg-${type}`;

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white ${bgClass} border-0 show`;
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas ${icon} me-2"></i> ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    toastContainer.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}
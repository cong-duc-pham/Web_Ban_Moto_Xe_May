// ========== QUẢN LÝ NHÂN VIÊN ==========

document.addEventListener('DOMContentLoaded', function () {
    initializeEmployeeManagement();
    initializeSearch();
});

// Khởi tạo form
function initializeEmployeeManagement() {
    const form = document.getElementById('employeeForm');
    if (form) {
        form.addEventListener('submit', handleEmployeeFormSubmit);
    }
}

// ✅ MỞ MODAL THÊM NHÂN VIÊN
function openEmployeeForm() {
    console.log('📝 Mở form thêm nhân viên');

    // Reset form
    document.getElementById('employeeForm').reset();

    // Set title
    document.getElementById('employeeModalTitle').textContent = 'Thêm nhân viên mới';

    // Clear ID (để biết là thêm mới)
    document.getElementById('employeeId').value = '';

    // ✅ SET RoleId = 2 (SALER)
    document.getElementById('employeeRole').value = '2';

    // ✅ HIỂN THỊ TRƯỜNG MẬT KHẨU
    const passwordGroup = document.getElementById('passwordGroup');
    const passwordInput = document.getElementById('employeePassword');

    passwordGroup.style.display = 'block';
    passwordInput.setAttribute('required', 'required');
    passwordInput.value = ''; // Clear password cũ

    console.log('✅ RoleId:', document.getElementById('employeeRole').value);

    // Mở modal
    const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
    modal.show();
}

// ✅ MỞ MODAL SỬA NHÂN VIÊN
function editEmployee(id, fullName, email, phone, roleId) {
    console.log('✏️ Sửa nhân viên ID:', id);

    // Set title
    document.getElementById('employeeModalTitle').textContent = 'Sửa thông tin nhân viên';

    // Fill data
    document.getElementById('employeeId').value = id;
    document.getElementById('employeeName').value = fullName;
    document.getElementById('employeeEmail').value = email;
    document.getElementById('employeePhone').value = phone || '';

    // ✅ SET RoleId = 2 (LUÔN LÀ SALER)
    document.getElementById('employeeRole').value = '2';

    // ✅ ẨN TRƯỜNG MẬT KHẨU KHI SỬA
    const passwordGroup = document.getElementById('passwordGroup');
    const passwordInput = document.getElementById('employeePassword');

    passwordGroup.style.display = 'none';
    passwordInput.removeAttribute('required');
    passwordInput.value = ''; // Clear password

    console.log('✅ Edit mode - RoleId:', document.getElementById('employeeRole').value);

    // Mở modal
    const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
    modal.show();
}

// ✅ XỬ LÝ SUBMIT FORM
function handleEmployeeFormSubmit(e) {
    e.preventDefault();

    console.log('📤 Submit form nhân viên');

    const formData = new FormData(e.target);

    // ✅ ĐẢM BẢO RoleId = 2
    formData.set('RoleId', '2');
    formData.set('Status', 'Active');

    // Log để kiểm tra
    console.log('📋 FormData:');
    for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
    }

    const employeeId = document.getElementById('employeeId').value;
    const url = employeeId ? '/Home/EditEmployee' : '/Home/AddEmployee';

    console.log('🌐 URL:', url);
    console.log('🆔 EmployeeId:', employeeId || '(new)');

    // ✅ VALIDATE PASSWORD KHI THÊM MỚI
    if (!employeeId) {
        const password = formData.get('Password');
        if (!password || password.length < 6) {
            showAlert('danger', 'Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }
    }

    fetch(url, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log('📥 Response:', data);

            if (data.success) {
                showAlert('success', data.message);

                // Đóng modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('employeeModal'));
                if (modal) modal.hide();

                // Reload sau 1.2s
                setTimeout(() => location.reload(), 1200);
            } else {
                showAlert('danger', data.message || 'Có lỗi xảy ra khi lưu thông tin');
            }
        })
        .catch(error => {
            console.error('❌ Error:', error);
            showAlert('danger', 'Có lỗi xảy ra khi lưu thông tin: ' + error.message);
        });
}

// ✅ XÓA NHÂN VIÊN
function deleteEmployee(id, fullName) {
    if (!confirm(`Bạn có chắc chắn muốn xóa nhân viên "${fullName}"?`)) {
        return;
    }

    console.log('🗑️ Xóa nhân viên ID:', id);

    fetch(`/Home/DeleteEmployee/${id}`, {
        method: 'POST'
    })
        .then(response => response.json())
        .then(data => {
            console.log('📥 Delete response:', data);

            if (data.success) {
                showAlert('success', data.message);
                setTimeout(() => location.reload(), 1500);
            } else {
                showAlert('danger', data.message || 'Có lỗi xảy ra khi xóa nhân viên');
            }
        })
        .catch(error => {
            console.error('❌ Error:', error);
            showAlert('danger', 'Có lỗi xảy ra: ' + error.message);
        });
}

// ✅ TÌM KIẾM
function initializeSearch() {
    const searchBox = document.getElementById('searchBox');
    if (!searchBox) return;

    searchBox.addEventListener('input', function (e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        const rows = document.querySelectorAll('#employeeTableBody tr');

        let visibleCount = 0;

        rows.forEach(row => {
            // Bỏ qua row "no results"
            if (row.classList.contains('no-results')) {
                row.remove();
                return;
            }

            const text = row.textContent.toLowerCase();

            if (searchTerm === '' || text.includes(searchTerm)) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        // Hiển thị "Không tìm thấy" nếu không có kết quả
        const existingNoResult = document.querySelector('.no-results');
        if (existingNoResult) existingNoResult.remove();

        if (searchTerm !== '' && visibleCount === 0) {
            const tbody = document.getElementById('employeeTableBody');
            const noResultRow = document.createElement('tr');
            noResultRow.className = 'no-results';
            noResultRow.innerHTML = `
                <td colspan="7" class="text-center py-4">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <p class="text-muted mb-0">Không tìm thấy nhân viên nào phù hợp với "${searchTerm}"</p>
                </td>
            `;
            tbody.appendChild(noResultRow);
        }
    });
}

// ✅ HIỂN THỊ THÔNG BÁO
function showAlert(type, message) {
    // Xóa alert cũ
    const oldAlerts = document.querySelectorAll('.alert.position-fixed');
    oldAlerts.forEach(alert => alert.remove());

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alertDiv);

    // Auto remove sau 5s
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }
    }, 5000);
}
document.addEventListener('DOMContentLoaded', function () {
    initializeEmployeeManagement();
    initializeSearch();
});

// Khởi tạo form thêm/sửa, bật tắt password
function initializeEmployeeManagement() {
    const form = document.getElementById('employeeForm');
    if (form) {
        form.addEventListener('submit', handleEmployeeFormSubmit);

        document.getElementById('employeeRole').addEventListener('change', function () {
            const passwordGroup = document.getElementById('passwordGroup');
            if (this.value === '') {
                passwordGroup.style.display = 'none';
                document.getElementById('employeePassword').removeAttribute('required');
            } else {
                passwordGroup.style.display = 'block';
                document.getElementById('employeePassword').setAttribute('required', 'required');
            }
        });
    }
}

// Mở modal Thêm nhân viên
function openEmployeeForm() {
    document.getElementById('employeeModalTitle').textContent = 'Thêm nhân viên mới';
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeRole').value = "2";
    // Đặt lại RoleId về trống
    document.getElementById('employeeRole').value = "";
    document.getElementById('passwordGroup').style.display = 'block';
    document.getElementById('employeePassword').setAttribute('required', 'required');
    const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
    modal.show();
}

// Sửa nhân viên (roleId PHẢI là số)
function editEmployee(id, fullName, email, phone, roleId) {
    document.getElementById('employeeModalTitle').textContent = 'Sửa thông tin nhân viên';
    document.getElementById('employeeId').value = id;
    document.getElementById('employeeName').value = fullName;
    document.getElementById('employeeEmail').value = email;
    document.getElementById('employeePhone').value = phone;
    document.getElementById('employeeRole').value = "2";

    document.getElementById('passwordGroup').style.display = 'none';
    document.getElementById('employeePassword').removeAttribute('required');
    const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
    modal.show();
}

// Xóa nhân viên
function deleteEmployee(id, fullName) {
    if (confirm(`Bạn có chắc chắn muốn xóa nhân viên "${fullName}"?`)) {
        fetch(`/Home/DeleteEmployee/${id}`, {
            method: 'POST',
            headers: {
                'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]')?.value || ''
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('success', data.message);
                    setTimeout(() => location.reload(), 1500);
                } else {
                    showAlert('danger', data.message || 'Có lỗi xóa nhân viên!');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('danger', error.message || 'Có lỗi xảy ra khi xóa nhân viên');
            });
    }
}

// Xử lý form thêm/sửa
function handleEmployeeFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this);

    formData.set('RoleId', "2");

    const id = document.getElementById('employeeId').value;
    const url = id ? `/Home/EditEmployee` : '/Home/AddEmployee';


    fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
            'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]')?.value || ''
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('success', data.message);
                bootstrap.Modal.getInstance(document.getElementById('employeeModal')).hide();
                setTimeout(() => location.reload(), 1200);
            } else {
                showAlert('danger', data.message || 'Có lỗi xảy ra khi lưu thông tin');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('danger', error.message || 'Có lỗi xảy ra khi lưu thông tin');
        });
}


// Tìm kiếm bảng
function initializeSearch() {
    const searchBox = document.getElementById('searchBox');
    if (searchBox) {
        searchBox.addEventListener('input', function (e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#employeeTableBody tr');
            let visible = 0;
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm) || searchTerm.length === 0) {
                    row.style.display = '';
                    visible++;
                } else {
                    row.style.display = 'none';
                }
            });
            if (searchTerm.length > 0 && visible === 0) {
                const noResultsRow = document.createElement('tr');
                noResultsRow.className = 'no-results';
                noResultsRow.innerHTML = `
                    <td colspan="8" class="text-center py-4">
                        <i class="fas fa-search fa-3x text-muted mb-3"></i>
                        <p class="text-muted mb-0">Không tìm thấy nhân viên nào phù hợp với "${searchTerm}"</p>
                    </td>`;
                document.getElementById('employeeTableBody').appendChild(noResultsRow);
            } else if (searchTerm.length === 0) {
                const noResultsRow = document.querySelector('.no-results');
                if (noResultsRow) noResultsRow.remove();
            }
        });
    }
}

// Hiển thị cảnh báo
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => {
        if (alertDiv.parentNode) alertDiv.remove();
    }, 5000);
}

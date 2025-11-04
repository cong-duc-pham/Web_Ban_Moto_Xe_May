// Biến lưu ID của xe cần xóa
let deleteXeId = 0;

// Hàm hiển thị modal thêm xe mới
function showAddModal() {
    document.getElementById('modalTitle').textContent = 'Thêm Xe Máy Mới';
    document.getElementById('xeID').value = '0';
    document.getElementById('tenXe').value = '';
    document.getElementById('gia').value = '';
    document.getElementById('hinhAnh').value = '';
    document.getElementById('moTa').value = '';
    
    const modal = new bootstrap.Modal(document.getElementById('xeMayModal'));
    modal.show();
}

// Hàm hiển thị modal sửa xe
function showEditModal(id, tenXe, gia, hinhAnh, moTa) {
    document.getElementById('modalTitle').textContent = 'Sửa Thông Tin Xe Máy';
    document.getElementById('xeID').value = id;
    document.getElementById('tenXe').value = tenXe;
    document.getElementById('gia').value = gia;
    document.getElementById('hinhAnh').value = hinhAnh;
    document.getElementById('moTa').value = moTa || '';
    
    const modal = new bootstrap.Modal(document.getElementById('xeMayModal'));
    modal.show();
}

// Hàm hiển thị modal xác nhận xóa
function confirmDelete(id, tenXe) {
    deleteXeId = id;
    document.getElementById('deleteXeName').textContent = tenXe;
    
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}

// Xử lý sự kiện khi DOM đã load
document.addEventListener('DOMContentLoaded', function() {
    // Xử lý submit form thêm/sửa
    const xeMayForm = document.getElementById('xeMayForm');
    
    if (xeMayForm) {
        xeMayForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Lấy dữ liệu từ form
            const formData = new FormData(this);
            const xeID = parseInt(formData.get('ID'));
            const data = {
                ID: xeID,
                TenXe: formData.get('TenXe'),
                Gia: parseFloat(formData.get('Gia')),
                HinhAnh: formData.get('HinhAnh'),
                MoTa: formData.get('MoTa') || ''
            };
            
            // Validate
            if (!data.TenXe || !data.Gia || !data.HinhAnh) {
                showAlert('warning', 'Vui lòng điền đầy đủ thông tin bắt buộc!');
                return;
            }
            
            // Xác định action (thêm hay sửa)
            const action = xeID === 0 ? '/Home/AddXeMay' : '/Home/EditXeMay';
            
            // Disable button để tránh click nhiều lần
            const btnSave = document.getElementById('btnSave');
            btnSave.disabled = true;
            btnSave.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
            
            try {
                const response = await fetch(action, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Đóng modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('xeMayModal'));
                    modal.hide();
                    
                    // Hiển thị thông báo thành công
                    showAlert('success', result.message);
                    
                    // Reload trang sau 1 giây
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    showAlert('danger', result.message || 'Có lỗi xảy ra!');
                    btnSave.disabled = false;
                    btnSave.innerHTML = '<i class="fas fa-save"></i> Lưu';
                }
            } catch (error) {
                console.error('Error:', error);
                showAlert('danger', 'Có lỗi xảy ra khi kết nối đến server!');
                btnSave.disabled = false;
                btnSave.innerHTML = '<i class="fas fa-save"></i> Lưu';
            }
        });
    }
    
    // Xử lý nút xác nhận xóa
    const btnConfirmDelete = document.getElementById('btnConfirmDelete');
    if (btnConfirmDelete) {
        btnConfirmDelete.addEventListener('click', async function() {
            // Disable button
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xóa...';
            
            try {
                const response = await fetch(`/Home/DeleteXeMay/${deleteXeId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Đóng modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
                    modal.hide();
                    
                    // Hiển thị thông báo thành công
                    showAlert('success', result.message);
                    
                    // Reload trang sau 1 giây
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    showAlert('danger', result.message || 'Có lỗi xảy ra!');
                    this.disabled = false;
                    this.innerHTML = '<i class="fas fa-trash"></i> Xóa';
                }
            } catch (error) {
                console.error('Error:', error);
                showAlert('danger', 'Có lỗi xảy ra khi kết nối đến server!');
                this.disabled = false;
                this.innerHTML = '<i class="fas fa-trash"></i> Xóa';
            }
        });
    }
});

// Hàm hiển thị thông báo
function showAlert(type, message) {
    // Xóa thông báo cũ nếu có
    const oldAlert = document.querySelector('.alert-custom');
    if (oldAlert) {
        oldAlert.remove();
    }
    
    // Icon theo loại thông báo
    let icon = '';
    switch(type) {
        case 'success':
            icon = '<i class="fas fa-check-circle me-2"></i>';
            break;
        case 'danger':
            icon = '<i class="fas fa-exclamation-circle me-2"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle me-2"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle me-2"></i>';
    }
    
    // Tạo thông báo mới
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show alert-custom`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 500px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease-out;
    `;
    alertDiv.innerHTML = `
        ${icon}${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Tự động ẩn sau 5 giây
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 150);
    }, 5000);
}

// Animation cho alert
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

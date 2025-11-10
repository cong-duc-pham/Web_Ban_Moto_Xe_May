// Biến lưu ID của xe cần xóa
let deleteXeId = 0;
let selectedFiles = [];

// Hàm hiển thị preview hình ảnh
function displayImagePreviews(files) {
    const previewContainer = document.getElementById('imagePreview');
    previewContainer.innerHTML = '';
    
    selectedFiles = Array.from(files);
    
    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const div = document.createElement('div');
            div.className = 'preview-image-container';
            div.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <button type="button" class="remove-image" onclick="removeImage(${index})">
                    <i class="fas fa-times"></i>
                </button>
                ${index === 0 ? '<div class="primary-badge">Ảnh đại diện</div>' : ''}
            `;
            previewContainer.appendChild(div);
        };
        
        reader.readAsDataURL(file);
    });
}

// Hàm xóa hình ảnh khỏi preview
function removeImage(index) {
    selectedFiles.splice(index, 1);
    
    // Tạo DataTransfer object mới để cập nhật input file
    const dataTransfer = new DataTransfer();
    selectedFiles.forEach(file => dataTransfer.items.add(file));
    document.getElementById('hinhAnh').files = dataTransfer.files;
    
    // Hiển thị lại preview
    displayImagePreviews(selectedFiles);
}

// Hàm hiển thị modal thêm xe mới
function showAddModal() {
    document.getElementById('modalTitle').textContent = 'Thêm Xe Máy Mới';
    document.getElementById('xeID').value = '0';
    document.getElementById('tenXe').value = '';
    document.getElementById('cuaHang').value = '';
    document.getElementById('danhMuc').value = '';
    document.getElementById('thuongHieu').value = '';
    document.getElementById('gia').value = '';
    document.getElementById('model').value = '';
    document.getElementById('namSX').value = '';
    document.getElementById('dungTich').value = '';
    document.getElementById('mauSac').value = '';
    document.getElementById('moTa').value = '';
    document.getElementById('hinhAnh').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    selectedFiles = [];
    
    const modal = new bootstrap.Modal(document.getElementById('xeMayModal'));
    modal.show();
}

// Hàm hiển thị modal sửa xe
function showEditModal(id, tenXe, gia, moTa, storeId, categoryId, brandId, model, namSX, dungTich, mauSac, soLuong) {
    console.log('=== showEditModal called ===');
    console.log('Parameters:', { id, tenXe, gia, moTa, storeId, categoryId, brandId, model, namSX, dungTich, mauSac, soLuong });
    
    document.getElementById('modalTitle').textContent = 'Sửa Thông Tin Xe Máy';
    document.getElementById('xeID').value = id;
    document.getElementById('tenXe').value = tenXe;
    document.getElementById('gia').value = gia;
    document.getElementById('moTa').value = moTa || '';
    
    // Set dropdown values
    if (storeId) document.getElementById('cuaHang').value = storeId;
    if (categoryId) document.getElementById('danhMuc').value = categoryId;
    if (brandId) document.getElementById('thuongHieu').value = brandId;
    
    // Set additional fields
    if (model) document.getElementById('model').value = model;
    if (namSX) document.getElementById('namSX').value = namSX;
    if (dungTich) document.getElementById('dungTich').value = dungTich;
    if (mauSac) document.getElementById('mauSac').value = mauSac;
    
    // Set stock quantity
    if (soLuong !== undefined && soLuong !== null) {
        document.getElementById('soLuong').value = soLuong;
    } else {
        document.getElementById('soLuong').value = 1; // Default
    }
    
    console.log('Opening modal...');
    const modalElement = document.getElementById('xeMayModal');
    console.log('Modal element:', modalElement);
    
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    console.log('Modal shown');
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
    // Xử lý thay đổi input file hình ảnh
    const hinhAnhInput = document.getElementById('hinhAnh');
    if (hinhAnhInput) {
        hinhAnhInput.addEventListener('change', function(e) {
            if (this.files && this.files.length > 0) {
                displayImagePreviews(this.files);
            }
        });
    }
    
    // Xử lý submit form thêm/sửa
    const xeMayForm = document.getElementById('xeMayForm');
    
    if (xeMayForm) {
        xeMayForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Lấy dữ liệu từ form
            const formData = new FormData(this);
            const xeID = parseInt(formData.get('ID'));
            
            // Validate
            const title = formData.get('TenXe');
            const salePrice = formData.get('Gia');
            const storeId = formData.get('StoreId');
            const categoryId = formData.get('CategoryId');
            const brandId = formData.get('BrandId');
            
            if (!title || !salePrice || !storeId || !categoryId || !brandId) {
                showAlert('warning', 'Vui lòng điền đầy đủ thông tin bắt buộc (Tên xe, Giá, Cửa hàng, Danh mục, Thương hiệu)!');
                return;
            }
            
            // Xác định action (thêm hay sửa)
            const isAdd = xeID === 0;
            const action = isAdd ? '/Home/AddVehicle' : '/Home/EditVehicle';
            
            let submitData;
            let requestOptions;
            
            if (isAdd) {
                // THÊM MỚI: Gửi FormData với file
                submitData = new FormData();
                submitData.append('VehicleId', xeID);
                submitData.append('Title', title);
                submitData.append('Model', formData.get('Model') || '');
                submitData.append('SalePrice', parseFloat(salePrice));
                submitData.append('ManufactureYear', formData.get('ManufactureYear') || '0');
                submitData.append('EngineCapacity', formData.get('EngineCapacity') || '0');
                submitData.append('Color', formData.get('Color') || '');
                submitData.append('Description', formData.get('MoTa') || '');
                submitData.append('StoreId', storeId);
                submitData.append('CategoryId', categoryId);
                submitData.append('BrandId', brandId);
                submitData.append('StockQuantity', formData.get('StockQuantity') || '1');
                submitData.append('Status', 'Available');
                submitData.append('Condition', 'New');
                
                // Thêm file hình ảnh
                const fileInput = document.getElementById('hinhAnh');
                if (fileInput && fileInput.files) {
                    for (let i = 0; i < fileInput.files.length; i++) {
                        submitData.append('HinhAnh', fileInput.files[i]);
                    }
                }
                
                requestOptions = {
                    method: 'POST',
                    body: submitData
                };
            } else {
                // SỬA: Gửi JSON (không upload ảnh khi sửa)
                const data = {
                    VehicleId: xeID,
                    Title: title,
                    Model: formData.get('Model') || null,
                    SalePrice: parseFloat(salePrice),
                    ManufactureYear: formData.get('ManufactureYear') ? parseInt(formData.get('ManufactureYear')) : null,
                    EngineCapacity: formData.get('EngineCapacity') ? parseInt(formData.get('EngineCapacity')) : null,
                    Color: formData.get('Color') || null,
                    Description: formData.get('MoTa') || '',
                    StoreId: parseInt(storeId),
                    CategoryId: parseInt(categoryId),
                    BrandId: parseInt(brandId),
                    StockQuantity: formData.get('StockQuantity') ? parseInt(formData.get('StockQuantity')) : 1,
                    Status: 'Available',
                    Condition: 'New'
                };
                
                requestOptions = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                };
            }
            
            // Disable button để tránh click nhiều lần
            const btnSave = document.getElementById('btnSave');
            btnSave.disabled = true;
            btnSave.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
            
            try {
                console.log('Đang gửi request đến:', action);
                console.log('Loại request:', isAdd ? 'THÊM MỚI (FormData)' : 'SỬA (JSON)');
                
                const response = await fetch(action, requestOptions);
                
                console.log('Response status:', response.status);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Response error:', errorText);
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                }
                
                const result = await response.json();
                console.log('Result:', result);
                
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
                console.error('Error details:', error);
                showAlert('danger', 'Có lỗi xảy ra: ' + error.message);
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
                const response = await fetch(`/Home/DeleteVehicle/${deleteXeId}`, {
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

// ===== QUẢN LÝ MUA XE =====

// Hiển thị modal mua xe
function showBuyModal(vehicleId, vehicleName, vehiclePrice) {
    document.getElementById('buyVehicleId').value = vehicleId;
    document.getElementById('buyVehicleName').textContent = vehicleName;
    document.getElementById('buyVehiclePrice').textContent = vehiclePrice.toLocaleString('vi-VN') + ' đ';
    
    // Reset form
    document.getElementById('customerAddress').value = '';
    document.getElementById('depositAmount').value = '';
    document.getElementById('paymentMethod').value = 'Tiền mặt';
    document.getElementById('orderNote').value = '';
    
    // Hiển thị modal
    const modal = new bootstrap.Modal(document.getElementById('buyModal'));
    modal.show();
}

// Xử lý form mua xe
document.addEventListener('DOMContentLoaded', function() {
    const buyForm = document.getElementById('buyForm');
    if (buyForm) {
        buyForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const vehicleId = parseInt(document.getElementById('buyVehicleId').value);
            const customerAddress = document.getElementById('customerAddress').value.trim();
            const depositAmount = document.getElementById('depositAmount').value;
            const orderNote = document.getElementById('orderNote').value.trim();
            
            // Validate
            if (!customerAddress) {
                alert('Vui lòng nhập địa chỉ nhận xe!');
                document.getElementById('customerAddress').focus();
                return;
            }
            
            if (!depositAmount || parseFloat(depositAmount) < 100000) {
                alert('Vui lòng nhập tiền đặt cọc tối thiểu 100,000 đ!');
                document.getElementById('depositAmount').focus();
                return;
            }
            
            const data = {
                vehicleId: vehicleId,
                customerAddress: customerAddress,
                depositAmount: parseFloat(depositAmount),
                paymentMethod: 'Chuyển khoản', // Cố định chuyển khoản
                note: orderNote || null
            };
            
            try {
                const response = await fetch('/Home/BuyVehicle', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                    },
                    body: JSON.stringify(data)
                });
                
                if (!response.ok) {
                    alert('Lỗi server: ' + response.status);
                    return;
                }
                
                const result = await response.json();
                
                if (result.success) {
                    // Đóng modal mua xe
                    const buyModalEl = document.getElementById('buyModal');
                    const buyModalInstance = bootstrap.Modal.getInstance(buyModalEl);
                    if (buyModalInstance) {
                        buyModalInstance.hide();
                    }
                    
                    // Hiển thị modal QR Code
                    showQRCodeModal(result.orderId, depositAmount, result.orderNumber || `ORD${Date.now()}`);
                } else {
                    alert(result.message || 'Có lỗi xảy ra!');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Lỗi kết nối: ' + error.message);
            }
        });
    }
});

// Hàm hiển thị modal QR Code
function showQRCodeModal(orderId, depositAmount, orderNumber) {
    // Điền thông tin vào modal
    document.getElementById('qrOrderNumber').textContent = orderNumber;
    document.getElementById('qrDepositAmount').textContent = parseFloat(depositAmount).toLocaleString('vi-VN') + ' đ';
    document.getElementById('qrTransferContent').textContent = `${orderNumber} DatCoc`;
    
    // Hiển thị modal
    const qrModal = new bootstrap.Modal(document.getElementById('qrCodeModal'));
    qrModal.show();
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


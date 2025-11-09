
// Sample data
let vehicles = [
    {
        id: 1,
        title: "Kia Carnival 2021 form 2022 bản 2.2D Signature",
        category: "oto",
        price: "1.145.000.000 đ",
        year: 2021,
        km: "64000 km",
        condition: "Đã sử dụng",
        location: "Thành Phố Thủ Đức",
        status: "active",
        date: "1 phút trước",
        images: 18,
        image: "https://via.placeholder.com/200x150/667eea/ffffff?text=Kia+Carnival"
    },
    {
        id: 2,
        title: "Xe máy đầu 5 bánh Kubota 22 mã lực VÍ TUYỆN",
        category: "xemay",
        price: "87.000.000 đ",
        year: 2020,
        km: "15000 km",
        condition: "Đã sử dụng",
        location: "Huyện Diên Châu",
        status: "active",
        date: "2 phút trước",
        images: 2,
        image: "https://via.placeholder.com/200x150/10b981/ffffff?text=Kubota"
    },
    {
        id: 3,
        title: "Bọc lốp xe oto vượt địa hình. Hàng Japan",
        category: "phutung",
        price: "860.000 đ",
        year: 2024,
        km: "0 km",
        condition: "Mới",
        location: "Thành Phố Thủ Đức",
        status: "active",
        date: "5 phút trước",
        images: 11,
        image: "https://via.placeholder.com/200x150/f59e0b/ffffff?text=Phu+Tung"
    },
    {
        id: 4,
        title: "Cá nhân bán",
        category: "phutung",
        price: "850.000 đ",
        year: 2023,
        km: "5000 km",
        condition: "Đã sử dụng",
        location: "Quận Bình Tân",
        status: "pending",
        date: "6 phút trước",
        images: 5,
        image: "https://via.placeholder.com/200x150/ef4444/ffffff?text=Vo+Lang"
    },
    {
        id: 5,
        title: "TrailBlazer LTZ 2018 2.5 Bản Full",
        category: "oto",
        price: "560.000.000 đ",
        year: 2018,
        km: "86000 km",
        condition: "Đã sử dụng",
        location: "Quận Thanh Xuân",
        status: "active",
        date: "6 phút trước",
        images: 12,
        image: "https://via.placeholder.com/200x150/8b5cf6/ffffff?text=TrailBlazer"
    }
];

// Render table
function renderTable(data = vehicles) {
    const tbody = document.getElementById('vehicleTableBody');
    tbody.innerHTML = '';

    data.forEach(vehicle => {
        const statusClass = {
            'active': 'bg-success',
            'pending': 'bg-warning',
            'hidden': 'bg-secondary',
            'sold': 'bg-info'
        };

        const statusText = {
            'active': 'Hoạt động',
            'pending': 'Chờ duyệt',
            'hidden': 'Đã ẩn',
            'sold': 'Đã bán'
        };

        const row = `
            <tr class="fade-in">
                <td data-label=""><input type="checkbox" class="form-check-input"></td>
                <td data-label="Hình ảnh:"><img src="${vehicle.image}" class="vehicle-img" alt="${vehicle.title}"></td>
                <td data-label="Tiêu đề:">
                    <strong>${vehicle.title}</strong><br>
                    <small class="text-muted">${vehicle.year} • ${vehicle.km} • ${vehicle.condition}</small>
                </td>
                <td data-label="Danh mục:"><span class="badge bg-primary">${getCategoryName(vehicle.category)}</span></td>
                <td data-label="Giá:"><span class="price-text">${vehicle.price}</span></td>
                <td data-label="Địa điểm:"><i class="bi bi-geo-alt text-danger"></i> ${vehicle.location}</td>
                <td data-label="Trạng thái:"><span class="badge-status ${statusClass[vehicle.status]}">${statusText[vehicle.status]}</span></td>
                <td data-label="Ngày đăng:"><small class="text-muted">${vehicle.date}<br>${vehicle.images} ảnh</small></td>
                <td data-label="Thao tác:">
                    <button class="btn btn-sm btn-primary btn-action" onclick="editVehicle(${vehicle.id})" title="Chỉnh sửa">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-info btn-action text-white" onclick="viewVehicle(${vehicle.id})" title="Xem chi tiết">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-action" onclick="deleteVehicle(${vehicle.id})" title="Xóa">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function getCategoryName(category) {
    const names = {
        'oto': 'Ô tô',
        'xemay': 'Xe máy',
        'xetai': 'Xe tải',
        'xedien': 'Xe điện',
        'xedap': 'Xe đạp',
        'phutung': 'Phụ tùng'
    };
    return names[category] || category;
}

function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const status = document.getElementById('statusFilter').value;

    let filtered = vehicles.filter(v => {
        const matchSearch = !search || v.title.toLowerCase().includes(search) || v.location.toLowerCase().includes(search);
        const matchCategory = !category || v.category === category;
        const matchStatus = !status || v.status === status;
        return matchSearch && matchCategory && matchStatus;
    });

    renderTable(filtered);
}

function editVehicle(id) {
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) return;

    document.getElementById('modalTitle').innerHTML = '<i class="bi bi-pencil me-2"></i>Chỉnh Sửa Bài Đăng';
    document.getElementById('vehicleId').value = vehicle.id;
    document.getElementById('vehicleTitle').value = vehicle.title;
    document.getElementById('vehicleCategory').value = vehicle.category;
    document.getElementById('vehiclePrice').value = vehicle.price;
    document.getElementById('vehicleYear').value = vehicle.year;
    document.getElementById('vehicleKm').value = vehicle.km;
    document.getElementById('vehicleLocation').value = vehicle.location;
    document.getElementById('vehicleStatus').value = vehicle.status;

    new bootstrap.Modal(document.getElementById('addVehicleModal')).show();
}

function viewVehicle(id) {
    alert('Xem chi tiết bài đăng ID: ' + id);
}

function deleteVehicle(id) {
    if (confirm('Bạn có chắc chắn muốn xóa bài đăng này?')) {
        vehicles = vehicles.filter(v => v.id !== id);
        renderTable();
        showNotification('Đã xóa bài đăng thành công!', 'success');
    }
}

function saveVehicle() {
    const id = document.getElementById('vehicleId').value;
    const title = document.getElementById('vehicleTitle').value;
    const category = document.getElementById('vehicleCategory').value;
    const price = document.getElementById('vehiclePrice').value;
    const year = document.getElementById('vehicleYear').value;
    const km = document.getElementById('vehicleKm').value;
    const location = document.getElementById('vehicleLocation').value;
    const status = document.getElementById('vehicleStatus').value;

    if (!title || !category || !price || !location) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }

    if (id) {
        // Update existing
        const vehicle = vehicles.find(v => v.id === parseInt(id));
        if (vehicle) {
            vehicle.title = title;
            vehicle.category = category;
            vehicle.price = price;
            vehicle.year = year;
            vehicle.km = km;
            vehicle.location = location;
            vehicle.status = status;
        }
        showNotification('Cập nhật bài đăng thành công!', 'success');
    } else {
        // Add new
        const newVehicle = {
            id: vehicles.length + 1,
            title, category, price, year, km, location, status,
            condition: document.getElementById('vehicleCondition').value,
            date: 'Vừa xong',
            images: 0,
            image: 'https://via.placeholder.com/200x150/64748b/ffffff?text=New+Vehicle'
        };
        vehicles.unshift(newVehicle);
        showNotification('Thêm bài đăng mới thành công!', 'success');
    }

    renderTable();
    bootstrap.Modal.getInstance(document.getElementById('addVehicleModal')).hide();
    document.getElementById('vehicleForm').reset();
    document.getElementById('vehicleId').value = '';
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '9999';
    notification.innerHTML = `
        <i class="bi bi-check-circle me-2"></i>${message}
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Reset form when modal closes
document.getElementById('addVehicleModal').addEventListener('hidden.bs.modal', function () {
    document.getElementById('vehicleForm').reset();
    document.getElementById('vehicleId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Thêm Bài Đăng Mới';
});

// Initialize
renderTable();
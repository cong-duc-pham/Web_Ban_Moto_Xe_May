# 🔐 Hướng Dẫn Phân Quyền Quản Lý Xe Máy

## 📋 Tổng Quan

Đã thêm **phân quyền** cho các chức năng quản lý xe máy. Chỉ người dùng có vai trò **Admin** hoặc **QuanLy** mới có thể thêm/sửa/xóa xe.

---

## 👥 Vai Trò (Roles)

### 1. **Admin / QuanLy** (Quản lý)
✅ **Có thể làm:**
- ✅ Xem danh sách xe
- ✅ Thêm xe mới
- ✅ Sửa thông tin xe
- ✅ Xóa xe

### 2. **User / Guest** (Người dùng thường)
⚠️ **Chỉ có thể:**
- ✅ Xem danh sách xe
- ❌ KHÔNG thể thêm xe
- ❌ KHÔNG thể sửa xe
- ❌ KHÔNG thể xóa xe

---

## 🔍 Cách Kiểm Tra Vai Trò

### Trong Session
```csharp
var vaiTro = HttpContext.Session.GetString("VaiTro");
```

### Vai trò được chấp nhận:
- `"Admin"` (không phân biệt hoa thường)
- `"QuanLy"` (không phân biệt hoa thường)

---

## 🎨 Giao Diện

### Khi là Admin/QuanLy:
```
✅ Hiển thị nút "Thêm xe mới"
✅ Hiển thị nút "Sửa" và "Xóa" trên mỗi card
✅ Thông báo: "Chế độ Quản lý: Bạn có thể thêm, sửa, xóa sản phẩm"
```

### Khi là User thường:
```
❌ Ẩn nút "Thêm xe mới"
❌ Ẩn nút "Sửa" và "Xóa" trên mỗi card
ℹ️ Thông báo: "Chế độ Xem: Bạn chỉ có thể xem danh sách..."
```

---

## 🔒 Bảo Mật Backend

### Controller (HomeController.cs)

#### Hàm kiểm tra quyền:
```csharp
private bool IsAdmin()
{
    var vaiTro = HttpContext.Session.GetString("VaiTro");
    return !string.IsNullOrEmpty(vaiTro) && 
           (vaiTro.Equals("Admin", StringComparison.OrdinalIgnoreCase) || 
            vaiTro.Equals("QuanLy", StringComparison.OrdinalIgnoreCase));
}
```

#### Được áp dụng vào:
- ✅ `AddXeMay()` - Thêm xe
- ✅ `EditXeMay()` - Sửa xe
- ✅ `DeleteXeMay()` - Xóa xe

#### Thông báo lỗi:
```json
{
    "success": false,
    "message": "Bạn không có quyền thực hiện chức năng này! Chỉ Quản lý mới có thể [thêm/sửa/xóa] xe."
}
```

---

## 🧪 Cách Test

### 1. Test với Admin/QuanLy

#### Bước 1: Đăng nhập
```csharp
// Trong AccountController khi đăng nhập thành công
HttpContext.Session.SetString("VaiTro", "Admin"); // hoặc "QuanLy"
HttpContext.Session.SetString("TenDangNhap", username);
HttpContext.Session.SetString("HoVaTen", hoVaTen);
HttpContext.Session.SetInt32("UserID", userId);
```

#### Bước 2: Kiểm tra
- ✅ Thấy nút "Thêm xe mới"
- ✅ Thấy nút Sửa/Xóa khi hover vào card
- ✅ Có thể thêm xe thành công
- ✅ Có thể sửa xe thành công
- ✅ Có thể xóa xe thành công
- ✅ Thấy thông báo "Chế độ Quản lý"

### 2. Test với User thường

#### Bước 1: Đăng nhập hoặc không đăng nhập
```csharp
// Session không có hoặc vai trò = "User"
HttpContext.Session.SetString("VaiTro", "User");
```

#### Bước 2: Kiểm tra
- ❌ Không thấy nút "Thêm xe mới"
- ❌ Không thấy nút Sửa/Xóa trên card
- ❌ Nếu gọi API trực tiếp → Lỗi "Không có quyền"
- ✅ Thấy thông báo "Chế độ Xem"

### 3. Test Bypass (Security Test)

#### Thử gọi API trực tiếp bằng Postman/AJAX:
```javascript
// Thử thêm xe khi không phải admin
fetch('/Home/AddXeMay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        ID: 0,
        TenXe: "Test Xe",
        Gia: 1000000,
        HinhAnh: "test.jpg",
        MoTa: "Test"
    })
})
```

**Kết quả mong đợi:**
```json
{
    "success": false,
    "message": "Bạn không có quyền thực hiện chức năng này! Chỉ Quản lý mới có thể thêm xe."
}
```

---

## 📝 Code Changes

### 1. HomeController.cs

#### MotorbikeOnline Action:
```csharp
public async Task<IActionResult> MotorbikeOnline()
{
    List<XeMay> lstXeMay = await _xeMayService.GetAllXeMayAsync();
    ViewBag.lstXeMay = lstXeMay;
    
    // Kiểm tra vai trò
    var vaiTro = HttpContext.Session.GetString("VaiTro");
    ViewBag.IsAdmin = !string.IsNullOrEmpty(vaiTro) && 
                     (vaiTro.Equals("Admin", StringComparison.OrdinalIgnoreCase) || 
                      vaiTro.Equals("QuanLy", StringComparison.OrdinalIgnoreCase));
    
    return View();
}
```

#### API Methods:
```csharp
[HttpPost]
public async Task<IActionResult> AddXeMay([FromBody] XeMay xeMay)
{
    // Kiểm tra quyền
    if (!IsAdmin())
    {
        return Json(new { 
            success = false, 
            message = "Bạn không có quyền..." 
        });
    }
    
    // Logic thêm xe...
}
```

### 2. MotorbikeOnline.cshtml

#### Nút Thêm Xe:
```cshtml
@if (ViewBag.IsAdmin == true)
{
    <button class="btn btn-primary" onclick="showAddModal()">
        <i class="fas fa-plus"></i> Thêm xe mới
    </button>
}
```

#### Nút Sửa/Xóa:
```cshtml
@if (ViewBag.IsAdmin == true)
{
    <div class="product-actions">
        <button class="btn btn-sm btn-warning" onclick='showEditModal(...)'>
            <i class="fas fa-edit"></i> Sửa
        </button>
        <button class="btn btn-sm btn-danger" onclick='confirmDelete(...)'>
            <i class="fas fa-trash"></i> Xóa
        </button>
    </div>
}
```

#### Thông báo:
```cshtml
@if (ViewBag.IsAdmin == true)
{
    <div class="alert alert-success">
        <strong>Chế độ Quản lý:</strong> Bạn có thể thêm, sửa, xóa sản phẩm.
    </div>
}
else
{
    <div class="alert alert-info">
        <strong>Chế độ Xem:</strong> Bạn chỉ có thể xem danh sách...
    </div>
}
```

---

## 🔧 Cách Thiết Lập Vai Trò

### Trong AccountController khi đăng nhập:

```csharp
[HttpPost]
public async Task<IActionResult> Login(string tenDangNhap, string matKhau)
{
    var taiKhoan = await _loginService.ValidateUserAsync(tenDangNhap, matKhau);
    
    if (taiKhoan != null)
    {
        // Lưu thông tin vào session
        HttpContext.Session.SetString("TenDangNhap", taiKhoan.TenDangNhap);
        HttpContext.Session.SetString("HoVaTen", taiKhoan.HovaTen);
        HttpContext.Session.SetString("VaiTro", taiKhoan.VaiTro); // ← QUAN TRỌNG
        HttpContext.Session.SetInt32("UserID", taiKhoan.ID);
        
        return RedirectToAction("Index", "Home");
    }
    
    return View();
}
```

### Trong Database (Bảng TaiKhoan):

```sql
-- Tạo tài khoản Admin
INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HovaTen, Email, VaiTro)
VALUES ('admin', '123456', 'Administrator', 'admin@example.com', 'Admin');

-- Tạo tài khoản Quản Lý
INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HovaTen, Email, VaiTro)
VALUES ('quanly', '123456', 'Quản Lý Cửa Hàng', 'quanly@example.com', 'QuanLy');

-- Tạo tài khoản User thường
INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HovaTen, Email, VaiTro)
VALUES ('user', '123456', 'Người Dùng', 'user@example.com', 'User');
```

---

## ⚠️ Lưu Ý Bảo Mật

### 1. Client-Side Security (Frontend)
- ✅ Ẩn nút để UX tốt hơn
- ❌ KHÔNG đủ để bảo mật
- ⚠️ User vẫn có thể inspect và call API

### 2. Server-Side Security (Backend)
- ✅ **BẮT BUỘC** kiểm tra quyền trong Controller
- ✅ Mọi API đều phải validate
- ✅ Đây là tầng bảo mật thật sự

### 3. Các Lỗ Hổng Cần Chú Ý:
```
❌ Chỉ ẩn nút ở frontend → User có thể bypass
✅ Kiểm tra quyền ở backend → An toàn

❌ Session không có timeout → Nguy hiểm
✅ Session có timeout 30 phút → Tốt hơn

❌ Vai trò hardcode trong code → Khó mở rộng
✅ Vai trò lưu trong DB → Linh hoạt

❌ Không log ai thêm/sửa/xóa → Khó audit
✅ Có logging đầy đủ → Dễ truy vết
```

---

## 🚀 Mở Rộng Trong Tương Lai

### 1. Thêm Vai Trò Mới
```csharp
// Ví dụ: Thêm vai trò "NhanVien" có thể sửa nhưng không xóa
private bool CanEdit()
{
    var vaiTro = HttpContext.Session.GetString("VaiTro");
    return new[] { "Admin", "QuanLy", "NhanVien" }
        .Contains(vaiTro, StringComparer.OrdinalIgnoreCase);
}

private bool CanDelete()
{
    var vaiTro = HttpContext.Session.GetString("VaiTro");
    return new[] { "Admin", "QuanLy" }
        .Contains(vaiTro, StringComparer.OrdinalIgnoreCase);
}
```

### 2. Sử dụng ASP.NET Identity
```csharp
// Thay vì Session, dùng Claims-based authentication
[Authorize(Roles = "Admin,QuanLy")]
public async Task<IActionResult> AddXeMay([FromBody] XeMay xeMay)
{
    // ...
}
```

### 3. Permission-Based
```csharp
// Thay vì role, dùng permissions chi tiết hơn
[Authorize(Policy = "CanManageProducts")]
public async Task<IActionResult> AddXeMay([FromBody] XeMay xeMay)
{
    // ...
}
```

---

## 📞 Troubleshooting

### Vấn đề: Đăng nhập admin nhưng vẫn không thấy nút
**Giải pháp:**
1. Kiểm tra Session có lưu VaiTro không:
   ```csharp
   var vaiTro = HttpContext.Session.GetString("VaiTro");
   Debug.WriteLine($"Vai tro: {vaiTro}");
   ```
2. Kiểm tra spelling: "Admin" vs "admin" vs "ADMIN"
3. Kiểm tra trong database: `SELECT VaiTro FROM TaiKhoan WHERE TenDangNhap = 'admin'`

### Vấn đề: API trả về lỗi "Không có quyền" dù đã là admin
**Giải pháp:**
1. Kiểm tra Session timeout
2. Clear cache và cookies
3. Đăng nhập lại
4. Kiểm tra logic trong `IsAdmin()`

### Vấn đề: User thường vẫn gọi được API
**Giải pháp:**
- Kiểm tra có gọi `IsAdmin()` trong API method không
- Xem log để biết ai đang bypass

---

## 📊 Summary

| Tính năng | Admin/QuanLy | User |
|-----------|--------------|------|
| Xem danh sách | ✅ | ✅ |
| Thêm xe | ✅ | ❌ |
| Sửa xe | ✅ | ❌ |
| Xóa xe | ✅ | ❌ |
| Thấy nút actions | ✅ | ❌ |
| Call API | ✅ | ❌ |

---

**Phân quyền đã hoàn tất! 🎉**

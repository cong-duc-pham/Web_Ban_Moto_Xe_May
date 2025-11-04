# Hướng Dẫn Sử Dụng Services

## Tổng Quan

Dự án đã được cấu trúc lại để sử dụng **Service Pattern**, giúp tách biệt logic nghiệp vụ khỏi Controller và truy cập database một cách an toàn, dễ bảo trì.

## Các Service Đã Triển Khai

### 1. **IXeMayService / XeMayService**
Service quản lý xe máy với các chức năng:

#### Các Phương Thức:
- `GetAllXeMayAsync()` - Lấy tất cả xe máy
- `GetXeMayByIdAsync(int id)` - Lấy xe máy theo ID
- `AddXeMayAsync(XeMay xeMay)` - Thêm xe máy mới
- `UpdateXeMayAsync(XeMay xeMay)` - Cập nhật xe máy
- `DeleteXeMayAsync(int id)` - Xóa xe máy
- `SearchXeMayByNameAsync(string tenXe)` - Tìm kiếm xe máy theo tên
- `GetXeMayByPriceRangeAsync(decimal minPrice, decimal maxPrice)` - Lọc xe máy theo giá

#### Ví Dụ Sử Dụng Trong Controller:

```csharp
public class HomeController : Controller
{
    private readonly IXeMayService _xeMayService;

    public HomeController(IXeMayService xeMayService)
    {
        _xeMayService = xeMayService;
    }

    public async Task<IActionResult> DanhSachXe()
    {
        // Lấy tất cả xe máy từ database
        var danhSach = await _xeMayService.GetAllXeMayAsync();
        return View(danhSach);
    }

    public async Task<IActionResult> TimKiem(string tenXe)
    {
        // Tìm kiếm xe máy theo tên
        var ketQua = await _xeMayService.SearchXeMayByNameAsync(tenXe);
        return View(ketQua);
    }
}
```

---

### 2. **ilogin / Login**
Service quản lý tài khoản người dùng với các chức năng:

#### Các Phương Thức:
- `ValidateUserAsync(string tenDangNhap, string matKhau)` - Xác thực đăng nhập
- `RegisterUserAsync(TaiKhoan taiKhoan)` - Đăng ký tài khoản mới
- `GetUserByUsernameAsync(string tenDangNhap)` - Lấy tài khoản theo tên đăng nhập
- `GetAllUsersAsync()` - Lấy tất cả tài khoản
- `GetUserByIdAsync(int id)` - Lấy tài khoản theo ID
- `UpdateUserAsync(TaiKhoan taiKhoan)` - Cập nhật tài khoản
- `DeleteUserAsync(int id)` - Xóa tài khoản
- `GetUsersByRoleAsync(string vaiTro)` - Lấy tài khoản theo vai trò

#### Ví Dụ Sử Dụng Trong Controller:

```csharp
public class AccountController : Controller
{
    private readonly ilogin _loginService;

    public AccountController(ilogin loginService)
    {
        _loginService = loginService;
    }

    [HttpPost]
    public async Task<IActionResult> Login(string tenDangNhap, string matKhau)
    {
        // Xác thực đăng nhập
        var taiKhoan = await _loginService.ValidateUserAsync(tenDangNhap, matKhau);
        
        if (taiKhoan != null)
        {
            // Đăng nhập thành công
            HttpContext.Session.SetString("UserID", taiKhoan.ID.ToString());
            return RedirectToAction("Index", "Home");
        }
        
        // Đăng nhập thất bại
        ModelState.AddModelError("", "Thông tin đăng nhập không đúng");
        return View();
    }

    public async Task<IActionResult> DanhSachAdmin()
    {
        // Lấy danh sách tài khoản có vai trò Admin
        var danhSach = await _loginService.GetUsersByRoleAsync("Admin");
        return View(danhSach);
    }
}
```

---

## Cấu Hình Trong Program.cs

Các service đã được đăng ký trong `Program.cs`:

```csharp
// Đăng ký service Login
builder.Services.AddScoped<ilogin, Login>();

// Đăng ký service XeMay
builder.Services.AddScoped<IXeMayService, XeMayService>();
```

---

## Controllers Đã Tạo Sẵn

### 1. **XeMayController**
Controller đầy đủ để quản lý xe máy:
- `Index()` - Hiển thị danh sách xe máy
- `Details(int id)` - Xem chi tiết xe máy
- `Create()` / `Create(XeMay)` - Thêm xe máy mới
- `Edit(int id)` / `Edit(int id, XeMay)` - Chỉnh sửa xe máy
- `Delete(int id)` / `DeleteConfirmed(int id)` - Xóa xe máy
- `Search(string tenXe)` - Tìm kiếm xe máy
- `FilterByPrice(decimal? minPrice, decimal? maxPrice)` - Lọc theo giá
- `GetXeMayJson()` - API trả về JSON
- `GetXeMayByIdJson(int id)` - API lấy xe máy theo ID

### 2. **AccountController**
Controller đầy đủ để quản lý tài khoản:
- `Index()` - Hiển thị danh sách tài khoản
- `Details(int id)` - Xem chi tiết tài khoản
- `Register()` / `Register(TaiKhoan)` - Đăng ký tài khoản
- `Login()` / `Login(string, string)` - Đăng nhập
- `Logout()` - Đăng xuất
- `Edit(int id)` / `Edit(int id, TaiKhoan)` - Chỉnh sửa tài khoản
- `Delete(int id)` / `DeleteConfirmed(int id)` - Xóa tài khoản
- `GetByRole(string vaiTro)` - Lọc theo vai trò
- `GetUsersJson()` - API trả về JSON
- `CheckUsernameExists(string tenDangNhap)` - Kiểm tra tên đăng nhập

---

## Lợi Ích Của Service Pattern

1. **Tách biệt logic**: Controller chỉ xử lý HTTP requests, logic nghiệp vụ nằm trong Service
2. **Dễ kiểm thử**: Có thể test Service độc lập không cần Controller
3. **Tái sử dụng**: Một Service có thể được sử dụng bởi nhiều Controller
4. **Bảo mật**: Tránh lộ thông tin nhạy cảm như mật khẩu khi trả về JSON
5. **Dễ bảo trì**: Thay đổi logic nghiệp vụ chỉ cần sửa trong Service

---

## Ví Dụ Sử Dụng Trong View

### Hiển thị danh sách xe máy:

```cshtml
@model List<XeMay>

<h2>Danh Sách Xe Máy</h2>

@foreach (var xe in Model)
{
    <div class="xe-item">
        <h3>@xe.TenXe</h3>
        <p>Giá: @xe.Gia.ToString("N0") VNĐ</p>
        <img src="@xe.HinhAnh" alt="@xe.TenXe" />
        <p>@xe.MoTa</p>
    </div>
}
```

### Sử dụng AJAX để lấy dữ liệu:

```javascript
// Lấy danh sách xe máy dạng JSON
fetch('/XeMay/GetXeMayJson')
    .then(response => response.json())
    .then(data => {
        console.log('Danh sách xe máy:', data);
        // Xử lý dữ liệu...
    });

// Kiểm tra tên đăng nhập đã tồn tại
fetch(`/Account/CheckUsernameExists?tenDangNhap=${username}`)
    .then(response => response.json())
    .then(data => {
        if (data.exists) {
            alert('Tên đăng nhập đã tồn tại!');
        }
    });
```

---

## Lưu Ý

1. **Async/Await**: Tất cả các phương thức trong Service đều là bất đồng bộ (async) để tối ưu hiệu suất
2. **Error Handling**: Service đã có xử lý lỗi cơ bản, trả về `null` hoặc `false` khi có lỗi
3. **Security**: Nên mã hóa mật khẩu (hash) trước khi lưu vào database
4. **Validation**: Controller sử dụng `ModelState.IsValid` để kiểm tra dữ liệu đầu vào
5. **Session**: Sử dụng Session để lưu trữ thông tin đăng nhập

---

## Các Bước Tiếp Theo

1. Tạo các View tương ứng cho các Controller
2. Thêm validation cho các Model
3. Implement hash password (BCrypt hoặc Identity)
4. Thêm Authorization/Authentication
5. Tạo migration và update database
6. Thêm logging và error handling nâng cao

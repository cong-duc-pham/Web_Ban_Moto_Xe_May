using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Services;
using Microsoft.AspNetCore.Mvc;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Controllers
{
    public class AccountController : Controller
    {
        private readonly ILoginService _loginService;

        public AccountController(ILoginService loginService)
        {
            _loginService = loginService;
        }

        // GET: Danh sách tất cả tài khoản
        public async Task<IActionResult> Index()
        {
            var danhSachTaiKhoan = await _loginService.GetAllUsersAsync();
            return View(danhSachTaiKhoan);
        }

        // GET: Chi tiết tài khoản
        public async Task<IActionResult> Details(int id)
        {
            var taiKhoan = await _loginService.GetUserByIdAsync(id);
            if (taiKhoan == null)
            {
                return NotFound();
            }
            return View(taiKhoan);
        }

        // GET: Form đăng ký
        public IActionResult Register()
        {
            return View();
        }

        // POST: Đăng ký tài khoản
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Register(TaiKhoan taiKhoan)
        {
            if (ModelState.IsValid)
            {
                // Kiểm tra tên đăng nhập đã tồn tại
                var existingUser = await _loginService.GetUserByUsernameAsync(taiKhoan.TenDangNhap);
                if (existingUser != null)
                {
                    ModelState.AddModelError("TenDangNhap", "Tên đăng nhập đã tồn tại!");
                    return View(taiKhoan);
                }

                var result = await _loginService.RegisterUserAsync(taiKhoan);
                if (result)
                {
                    TempData["SuccessMessage"] = "Đăng ký tài khoản thành công!";
                    return RedirectToAction("Login", "Home");
                }
                ModelState.AddModelError("", "Không thể đăng ký tài khoản. Vui lòng thử lại.");
            }
            return View(taiKhoan);
        }

        // GET: Form đăng nhập
        public IActionResult Login()
        {
            return View();
        }

        // POST: Đăng nhập
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(string tenDangNhap, string matKhau)
        {
            if (string.IsNullOrEmpty(tenDangNhap) || string.IsNullOrEmpty(matKhau))
            {
                ModelState.AddModelError("", "Vui lòng nhập đầy đủ thông tin!");
                return View();
            }

            var taiKhoan = await _loginService.ValidateUserAsync(tenDangNhap, matKhau);
            if (taiKhoan != null)
            {
                // Lưu thông tin vào session
                HttpContext.Session.SetString("TenDangNhap", taiKhoan.TenDangNhap);
                HttpContext.Session.SetString("HoVaTen", taiKhoan.HovaTen);
                HttpContext.Session.SetString("VaiTro", taiKhoan.VaiTro);
                HttpContext.Session.SetInt32("UserID", taiKhoan.ID);

                TempData["SuccessMessage"] = $"Chào mừng {taiKhoan.HovaTen}!";
                return RedirectToAction("Index", "Home");
            }

            ModelState.AddModelError("", "Tên đăng nhập hoặc mật khẩu không đúng!");
            return View();
        }

        // GET: Đăng xuất
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            TempData["SuccessMessage"] = "Đăng xuất thành công!";
            return RedirectToAction("Index", "Home");
        }

        // GET: Form chỉnh sửa tài khoản
        public async Task<IActionResult> Edit(int id)
        {
            var taiKhoan = await _loginService.GetUserByIdAsync(id);
            if (taiKhoan == null)
            {
                return NotFound();
            }
            return View(taiKhoan);
        }

        // POST: Cập nhật tài khoản
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, TaiKhoan taiKhoan)
        {
            if (id != taiKhoan.ID)
            {
                return BadRequest();
            }

            if (ModelState.IsValid)
            {
                var result = await _loginService.UpdateUserAsync(taiKhoan);
                if (result)
                {
                    TempData["SuccessMessage"] = "Cập nhật tài khoản thành công!";
                    return RedirectToAction(nameof(Index));
                }
                ModelState.AddModelError("", "Không thể cập nhật tài khoản. Vui lòng thử lại.");
            }
            return View(taiKhoan);
        }

        // GET: Xác nhận xóa tài khoản
        public async Task<IActionResult> Delete(int id)
        {
            var taiKhoan = await _loginService.GetUserByIdAsync(id);
            if (taiKhoan == null)
            {
                return NotFound();
            }
            return View(taiKhoan);
        }

        // POST: Xóa tài khoản
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var result = await _loginService.DeleteUserAsync(id);
            if (result)
            {
                TempData["SuccessMessage"] = "Xóa tài khoản thành công!";
            }
            else
            {
                TempData["ErrorMessage"] = "Không thể xóa tài khoản. Vui lòng thử lại.";
            }
            return RedirectToAction(nameof(Index));
        }

        // GET: Lấy danh sách tài khoản theo vai trò
        public async Task<IActionResult> GetByRole(string vaiTro)
        {
            if (string.IsNullOrEmpty(vaiTro))
            {
                return RedirectToAction(nameof(Index));
            }

            var danhSachTaiKhoan = await _loginService.GetUsersByRoleAsync(vaiTro);
            ViewBag.VaiTro = vaiTro;
            return View("Index", danhSachTaiKhoan);
        }

        // API: Lấy danh sách tài khoản dạng JSON
        [HttpGet]
        public async Task<JsonResult> GetUsersJson()
        {
            var danhSachTaiKhoan = await _loginService.GetAllUsersAsync();
            // Ẩn mật khẩu khi trả về JSON
            var result = danhSachTaiKhoan.Select(t => new
            {
                t.ID,
                t.TenDangNhap,
                t.HovaTen,
                t.NgaySinh,
                t.GioiTinh,
                t.Email,
                t.VaiTro
            });
            return Json(result);
        }

        // API: Kiểm tra tên đăng nhập có tồn tại
        [HttpGet]
        public async Task<JsonResult> CheckUsernameExists(string tenDangNhap)
        {
            if (string.IsNullOrEmpty(tenDangNhap))
            {
                return Json(new { exists = false });
            }

            var user = await _loginService.GetUserByUsernameAsync(tenDangNhap);
            return Json(new { exists = user != null });
        }
    }
}

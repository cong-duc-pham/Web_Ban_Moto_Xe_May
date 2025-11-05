using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Services;
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;
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
            var danhSachUser = await _loginService.GetAllUsersAsync();
            return View(danhSachUser);
        }

        // GET: Chi tiết tài khoản
        public async Task<IActionResult> Details(int id)
        {
            var user = await _loginService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            return View(user);
        }

        // GET: Form đăng ký
        public IActionResult Register()
        {
            return View();
        }

        // POST: Đăng ký tài khoản
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Register(User user)
        {
            if (ModelState.IsValid)
            {
                // Kiểm tra số điện thoại đã tồn tại
                var existingUser = await _loginService.GetUserByPhoneAsync(user.PhoneNumber);
                if (existingUser != null)
                {
                    ModelState.AddModelError("PhoneNumber", "Số điện thoại đã được đăng ký!");
                    return View(user);
                }

                // Set giá trị mặc định cho user mới
                user.Status = "Active";
                user.RoleId = 3; // Giả sử RoleId = 3 là Customer/Buyer, điều chỉnh theo database

                var result = await _loginService.RegisterUserAsync(user);
                if (result)
                {
                    TempData["SuccessMessage"] = "Đăng ký tài khoản thành công!";
                    return RedirectToAction("Login", "Home");
                }
                ModelState.AddModelError("", "Không thể đăng ký tài khoản. Vui lòng thử lại.");
            }
            return View(user);
        }

        // GET: Form đăng nhập
        public IActionResult Login()
        {
            return View();
        }

        // POST: Đăng nhập
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(string phoneNumber, string password)
        {
            if (string.IsNullOrEmpty(phoneNumber) || string.IsNullOrEmpty(password))
            {
                ModelState.AddModelError("", "Vui lòng nhập đầy đủ thông tin!");
                return View();
            }

            var user = await _loginService.ValidateUserAsync(phoneNumber, password);
            if (user != null)
            {
                // Lưu thông tin vào session
                HttpContext.Session.SetString("PhoneNumber", user.PhoneNumber);
                HttpContext.Session.SetString("FullName", user.FullName);
                HttpContext.Session.SetString("RoleName", user.Role.RoleName);
                HttpContext.Session.SetInt32("UserId", user.UserId);
                HttpContext.Session.SetInt32("RoleId", user.RoleId);

                if (!string.IsNullOrEmpty(user.Email))
                {
                    HttpContext.Session.SetString("Email", user.Email);
                }

                TempData["SuccessMessage"] = $"Chào mừng {user.FullName}!";
                return RedirectToAction("Index", "Home");
            }

            ModelState.AddModelError("", "Số điện thoại hoặc mật khẩu không đúng!");
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
            // Kiểm tra quyền: chỉ cho phép sửa tài khoản của chính mình hoặc admin
            var currentUserId = HttpContext.Session.GetInt32("UserId");
            var currentRoleId = HttpContext.Session.GetInt32("RoleId");

            if (currentUserId != id && currentRoleId != 1) // RoleId = 1 là Admin
            {
                TempData["ErrorMessage"] = "Bạn không có quyền chỉnh sửa tài khoản này!";
                return RedirectToAction("Index", "Home");
            }

            var user = await _loginService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            return View(user);
        }

        // POST: Cập nhật tài khoản
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, User user)
        {
            if (id != user.UserId)
            {
                return BadRequest();
            }

            // Kiểm tra quyền
            var currentUserId = HttpContext.Session.GetInt32("UserId");
            var currentRoleId = HttpContext.Session.GetInt32("RoleId");

            if (currentUserId != id && currentRoleId != 1)
            {
                TempData["ErrorMessage"] = "Bạn không có quyền chỉnh sửa tài khoản này!";
                return RedirectToAction("Index", "Home");
            }

            if (ModelState.IsValid)
            {
                var result = await _loginService.UpdateUserAsync(user);
                if (result)
                {
                    // Cập nhật lại session nếu sửa tài khoản của chính mình
                    if (currentUserId == id)
                    {
                        HttpContext.Session.SetString("FullName", user.FullName);
                        if (!string.IsNullOrEmpty(user.Email))
                        {
                            HttpContext.Session.SetString("Email", user.Email);
                        }
                    }

                    TempData["SuccessMessage"] = "Cập nhật tài khoản thành công!";
                    return RedirectToAction(nameof(Index));
                }
                ModelState.AddModelError("", "Không thể cập nhật tài khoản. Vui lòng thử lại.");
            }
            return View(user);
        }

        // GET: Xác nhận xóa tài khoản
        public async Task<IActionResult> Delete(int id)
        {
            // Chỉ admin mới được xóa tài khoản
            var currentRoleId = HttpContext.Session.GetInt32("RoleId");
            if (currentRoleId != 1)
            {
                TempData["ErrorMessage"] = "Chỉ Admin mới có quyền xóa tài khoản!";
                return RedirectToAction(nameof(Index));
            }

            var user = await _loginService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            return View(user);
        }

        // POST: Xóa tài khoản
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            // Chỉ admin mới được xóa tài khoản
            var currentRoleId = HttpContext.Session.GetInt32("RoleId");
            if (currentRoleId != 1)
            {
                TempData["ErrorMessage"] = "Chỉ Admin mới có quyền xóa tài khoản!";
                return RedirectToAction(nameof(Index));
            }

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

        // GET: Lấy danh sách tài khoản theo RoleId
        public async Task<IActionResult> GetByRole(int roleId)
        {
            var danhSachUser = await _loginService.GetUsersByRoleAsync(roleId);
            ViewBag.RoleId = roleId;
            return View("Index", danhSachUser);
        }

        // GET: Lấy danh sách tài khoản theo tên vai trò
        public async Task<IActionResult> GetByRoleName(string roleName)
        {
            if (string.IsNullOrEmpty(roleName))
            {
                return RedirectToAction(nameof(Index));
            }

            var danhSachUser = await _loginService.GetUsersByRoleNameAsync(roleName);
            ViewBag.RoleName = roleName;
            return View("Index", danhSachUser);
        }

        // GET: Form đổi mật khẩu
        public IActionResult ChangePassword()
        {
            return View();
        }

        // POST: Đổi mật khẩu
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ChangePassword(string oldPassword, string newPassword, string confirmPassword)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue)
            {
                TempData["ErrorMessage"] = "Vui lòng đăng nhập để đổi mật khẩu!";
                return RedirectToAction("Login", "Home");
            }

            if (string.IsNullOrEmpty(oldPassword) || string.IsNullOrEmpty(newPassword))
            {
                ModelState.AddModelError("", "Vui lòng nhập đầy đủ thông tin!");
                return View();
            }

            if (newPassword != confirmPassword)
            {
                ModelState.AddModelError("", "Mật khẩu mới và xác nhận mật khẩu không khớp!");
                return View();
            }

            var result = await _loginService.ChangePasswordAsync(userId.Value, oldPassword, newPassword);
            if (result)
            {
                TempData["SuccessMessage"] = "Đổi mật khẩu thành công!";
                return RedirectToAction("Index", "Home");
            }

            ModelState.AddModelError("", "Mật khẩu cũ không đúng!");
            return View();
        }

        // API: Lấy danh sách tài khoản dạng JSON
        [HttpGet]
        public async Task<JsonResult> GetUsersJson()
        {
            var danhSachUser = await _loginService.GetAllUsersAsync();
            // Ẩn mật khẩu khi trả về JSON
            var result = danhSachUser.Select(u => new
            {
                u.UserId,
                u.FullName,
                u.PhoneNumber,
                u.Email,
                u.Status,
                RoleName = u.Role?.RoleName,
                u.RoleId
            });
            return Json(result);
        }

        // API: Kiểm tra số điện thoại có tồn tại
        [HttpGet]
        public async Task<JsonResult> CheckPhoneExists(string phoneNumber)
        {
            if (string.IsNullOrEmpty(phoneNumber))
            {
                return Json(new { exists = false });
            }

            var user = await _loginService.GetUserByPhoneAsync(phoneNumber);
            return Json(new { exists = user != null });
        }

        // API: Thay đổi trạng thái tài khoản
        [HttpPost]
        public async Task<JsonResult> ChangeStatus(int id, string status)
        {
            // Chỉ admin mới được thay đổi trạng thái
            var currentRoleId = HttpContext.Session.GetInt32("RoleId");
            if (currentRoleId != 1)
            {
                return Json(new { success = false, message = "Chỉ Admin mới có quyền thay đổi trạng thái!" });
            }

            try
            {
                var user = await _loginService.GetUserByIdAsync(id);
                if (user == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy tài khoản" });
                }

                user.Status = status;
                var result = await _loginService.UpdateUserAsync(user);

                if (result)
                {
                    return Json(new { success = true, message = "Cập nhật trạng thái thành công" });
                }

                return Json(new { success = false, message = "Không thể cập nhật trạng thái" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
    }
}

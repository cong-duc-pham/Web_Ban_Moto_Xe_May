using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Services;
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.EF;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Text.RegularExpressions;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Mail;
using System.Security.Claims;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Controllers

{
    public class AccountController : Controller
    {
        private readonly ILoginService _loginService;
        private readonly ILogger<AccountController> _logger;
        private readonly ApplicationDbContext _context;
        private static Dictionary<string, string> OtpStore = new();

        public AccountController(ILoginService loginService, ILogger<AccountController> logger, ApplicationDbContext context)
        {
            _loginService = loginService;
            _logger = logger;
            _context = context;
        }

        // ==== QUÊN MẬT KHẨU - EMAIL, OTP, RESET PASSWORD ====

        [HttpGet]
        public IActionResult ForgetPassword()
        {
            ViewBag.Step = "Email";
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> SendOtp(string Email)
        {
            var user = await _loginService.GetUserByEmailAsync(Email);
            if (user == null)
            {
                ViewBag.ErrorMessage = "Email không tồn tại trong hệ thống!";
                ViewBag.Step = "Email";
                return View("ForgetPassword");
            }

            // Sinh OTP ngẫu nhiên 6 số
            var otp = new Random().Next(100000, 999999).ToString();
            OtpStore[Email] = otp;

            try
            {
                var smtp = new SmtpClient("smtp.gmail.com")
                {
                    Port = 587,
                    Credentials = new NetworkCredential("congducpham2010@gmail.com", "cyqw jmqj xuyh eimb"),
                    EnableSsl = true,
                };
                smtp.Send(new MailMessage
                {
                    From = new MailAddress("congducpham2010@gmail.com", "Hệ thống cửa hàng xe máy"),
                    Subject = "Mã OTP lấy lại mật khẩu",
                    Body = $"Mã OTP để đặt lại mật khẩu là: {otp}",
                    IsBodyHtml = false,
                    To = { Email }
                });
                ViewBag.Message = "Mã OTP đã gửi tới email của bạn. Vui lòng kiểm tra hộp thư!";
            }
            catch
            {
                ViewBag.ErrorMessage = "Không thể gửi mã OTP. (Kiểm tra cấu hình email hoặc thử lại)";
            }

            ViewBag.Email = Email;
            ViewBag.Step = "OTP";
            return View("ForgetPassword");
        }

        [HttpPost]
        public IActionResult VerifyOtp(string Email, string Otp)
        {
            if (OtpStore.TryGetValue(Email, out var realOtp) && realOtp == Otp.Trim())
            {
                ViewBag.Step = "NewPassword";
                ViewBag.Email = Email;
                return View("ForgetPassword");
            }
            ViewBag.OtpError = "Mã OTP không chính xác hoặc đã hết hạn!";
            ViewBag.Step = "OTP";
            ViewBag.Email = Email;
            return View("ForgetPassword");
        }

        // ĐỔI CHO QUÊN MẬT KHẨU BẰNG EMAIL VÀ OTP:
        [HttpPost]
        public async Task<IActionResult> ResetPassword(string Email, string NewPassword)
        {
            var user = await _loginService.GetUserByEmailAsync(Email);
            if (user == null)
            {
                ViewBag.PassError = "Email không tồn tại!";
                ViewBag.Step = "Email";
                return View("ForgetPassword");
            }

            user.Password = NewPassword;
            await _loginService.UpdateUserAsync(user);

            if (OtpStore.ContainsKey(Email))
                OtpStore.Remove(Email);

            ViewBag.PassChanged = "Đổi mật khẩu thành công! Bạn có thể đăng nhập lại.";
            ViewBag.Step = "Email";
            return View("ForgetPassword");
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
        public async Task<IActionResult> Register(User user, string UserType, string ConfirmPassword)
        {
            try
            {
                _logger?.LogInformation($"=== ĐĂNG KÝ: UserType={UserType}, Phone={user.PhoneNumber}");

                // VALIDATION
                if (string.IsNullOrWhiteSpace(UserType))
                {
                    TempData["ErrorMessage"] = "Vui lòng chọn loại tài khoản!";
                    return View(user);
                }

                if (string.IsNullOrWhiteSpace(user.FullName))
                {
                    TempData["ErrorMessage"] = "Vui lòng nhập họ tên!";
                    return View(user);
                }

                if (string.IsNullOrWhiteSpace(user.PhoneNumber) || user.PhoneNumber.Length < 10)
                {
                    TempData["ErrorMessage"] = "Số điện thoại phải có 10-11 chữ số!";
                    return View(user);
                }

                if (string.IsNullOrWhiteSpace(user.Password) || user.Password.Length < 6)
                {
                    TempData["ErrorMessage"] = "Mật khẩu phải có ít nhất 6 ký tự!";
                    return View(user);
                }

                if (user.Password != ConfirmPassword)
                {
                    TempData["ErrorMessage"] = "Mật khẩu xác nhận không khớp!";
                    return View(user);
                }

                // KIỂM TRA SĐT ĐÃ TỒN TẠI
                var existingUser = await _loginService.GetUserByPhoneAsync(user.PhoneNumber);
                if (existingUser != null)
                {
                    TempData["ErrorMessage"] = "Số điện thoại đã được đăng ký!";
                    return View(user);
                }

                // SET GIÁ TRỊ MẶC ĐỊNH
                user.Status = "Active";

                // Lấy RoleId từ database (kiểm tra cả RoleId và RoleName)
                Role? role = null;
                if (UserType == "Customer")
                {
                    // Tìm theo RoleName hoặc RoleId = 3
                    role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Customer" || r.RoleId == 3);
                    if (role == null)
                    {
                        TempData["ErrorMessage"] = "Lỗi: Không tìm thấy Role 'Customer' (RoleId=3) trong hệ thống!";
                        return View(user);
                    }
                    user.RoleId = role.RoleId;
                }
                else if (UserType == "Employee")
                {
                    // Tìm theo RoleName hoặc RoleId = 2
                    role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Saler" || r.RoleId == 2);
                    if (role == null)
                    {
                        TempData["ErrorMessage"] = "Lỗi: Không tìm thấy Role 'Saler' (RoleId=2) trong hệ thống!";
                        return View(user);
                    }
                    user.RoleId = role.RoleId;
                }
                else
                {
                    TempData["ErrorMessage"] = "Loại tài khoản không hợp lệ!";
                    return View(user);
                }

                // LƯU VÀO DATABASE
                var result = await _loginService.RegisterUserAsync(user);

                if (result)
                {
                    _logger?.LogInformation($"✅ Đăng ký thành công! UserId={user.UserId}");
                    TempData["SuccessMessage"] = "Đăng ký thành công! Vui lòng đăng nhập.";
                    return RedirectToAction("Login", "Account");
                }
                else
                {
                    TempData["ErrorMessage"] = "Không thể đăng ký. Vui lòng thử lại.";
                    return View(user);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Lỗi đăng ký");
                TempData["ErrorMessage"] = $"Lỗi: {ex.Message}";
                return View(user);
            }
        }

        // GET: Form đăng nhập
        public IActionResult Login(string? returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;
            return View();
        }

        // POST: Đăng nhập
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(string phoneNumber, string password, string? returnUrl = null)
        {
            if (string.IsNullOrEmpty(phoneNumber) || string.IsNullOrEmpty(password))
            {
                ModelState.AddModelError("", "Vui lòng nhập đầy đủ thông tin!");
                return View();
            }

            var user = await _loginService.ValidateUserAsync(phoneNumber, password);
            if (user != null)
            {
                // Đây là thông tin sẽ được mã hóa và lưu trong cookie
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.FullName), // Tên đầy đủ
                    new Claim(ClaimTypes.MobilePhone, user.PhoneNumber), // Số điện thoại
                    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()), // ID người dùng
                    new Claim(ClaimTypes.Role, user.Role.RoleName) // QUAN TRỌNG NHẤT: Vai trò
                };

                // Thêm Email nếu có
                if (!string.IsNullOrEmpty(user.Email))
                {
                    claims.Add(new Claim(ClaimTypes.Email, user.Email));
                }

                // 2. Tạo một "Danh tính" (Identity)
                var claimsIdentity = new ClaimsIdentity(
                    claims, CookieAuthenticationDefaults.AuthenticationScheme);

                // 3. Thực hiện đăng nhập (phát hành cookie)
                await HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    new ClaimsPrincipal(claimsIdentity),
                    new AuthenticationProperties
                    {
                        IsPersistent = true, // Ghi nhớ đăng nhập
                        ExpiresUtc = DateTime.UtcNow.AddDays(1)
                    });

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

                if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                    return Redirect(returnUrl);
                //if (user.Role.RoleName == "Admin" || user.Role.RoleId == 1)
                //{
                //    return RedirectToAction("AdminDashboard", "Home");
                //}
                return RedirectToAction("Index", "Home");
            }

            ModelState.AddModelError("", "Số điện thoại hoặc mật khẩu không đúng!");
            return View();
        }

        // JSON: Lấy user theo id cho AJAX
        [HttpGet]
        public async Task<JsonResult> GetUserById(int id)
        {
            var user = await _loginService.GetUserByIdAsync(id);
            if (user == null)
            {
                return Json(new { success = false, message = "Không tìm thấy người dùng" });
            }

            return Json(new
            {
                success = true,
                data = new
                {
                    user.UserId,
                    user.FullName,
                    user.PhoneNumber,
                    user.Email,
                    user.Status,
                    user.RoleId,
                    RoleName = user.Role?.RoleName
                }
            });
        }

        // JSON: Thêm khách hàng (AJAX) - nhận application/json
        [HttpPost]
        [Consumes("application/json")]
        public async Task<JsonResult> Register([FromBody] UserDto dto)
        {
            var (isValid, message) = ValidateUserDto(dto, isAdd: true);
            if (!isValid)
                return Json(new { success = false, message });

            // kiểm tra số điện thoại đã tồn tại
            var existing = await _loginService.GetUserByPhoneAsync(dto.PhoneNumber);
            if (existing != null)
                return Json(new { success = false, message = "Số điện thoại đã được đăng ký" });

            var user = new User
            {
                FullName = dto.FullName.Trim(),
                PhoneNumber = dto.PhoneNumber.Trim(),
                Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim(),
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Active" : dto.Status,
                RoleId = 3 // ép role = Customer từ UI quản lý khách hàng
            };

            // Mật khẩu bắt buộc khi thêm
            user.Password = dto.Password;

            var result = await _loginService.RegisterUserAsync(user);
            if (result)
                return Json(new { success = true, message = "Thêm khách hàng thành công" });

            return Json(new { success = false, message = "Không thể thêm khách hàng. Vui lòng thử lại." });
        }

        // JSON: Sửa khách hàng (AJAX) - nhận application/json
        [HttpPost]
        [Consumes("application/json")]
        public async Task<JsonResult> Edit([FromBody] UserDto dto)
        {
            if (dto == null || dto.UserId <= 0)
                return Json(new { success = false, message = "Dữ liệu không hợp lệ" });

            // Quyền: chỉ Admin (RoleId=1) hoặc chính chủ mới được edit
            var currentUserId = HttpContext.Session.GetInt32("UserId");
            var currentRoleId = HttpContext.Session.GetInt32("RoleId");
            if (currentUserId != dto.UserId && currentRoleId != 1)
                return Json(new { success = false, message = "Bạn không có quyền chỉnh sửa tài khoản này!" });

            var (isValid, message) = ValidateUserDto(dto, isAdd: false);
            if (!isValid)
                return Json(new { success = false, message });

            var existing = await _loginService.GetUserByIdAsync(dto.UserId);
            if (existing == null)
                return Json(new { success = false, message = "Không tìm thấy tài khoản" });

            // Cập nhật những trường cho phép
            existing.FullName = dto.FullName.Trim();
            existing.Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim();
            existing.PhoneNumber = dto.PhoneNumber.Trim();
            existing.Status = string.IsNullOrWhiteSpace(dto.Status) ? existing.Status : dto.Status;
            existing.RoleId = 3; // ép role = Customer tránh leo thang quyền

            // Nếu có mật khẩu mới, cập nhật (service nên xử lý hashing)
            if (!string.IsNullOrWhiteSpace(dto.Password))
                existing.Password = dto.Password;

            var updated = await _loginService.UpdateUserAsync(existing);
            if (updated)
            {
                // Cập nhật session nếu chính chủ sửa
                if (currentUserId == existing.UserId)
                {
                    HttpContext.Session.SetString("FullName", existing.FullName);
                    if (!string.IsNullOrEmpty(existing.Email))
                        HttpContext.Session.SetString("Email", existing.Email);
                }
                return Json(new { success = true, message = "Cập nhật khách hàng thành công" });
            }

            return Json(new { success = false, message = "Không thể cập nhật khách hàng. Vui lòng thử lại." });
        }

        // JSON: Xóa (AJAX) - route khớp ManageCustomers.js POST /Account/DeleteConfirmed/{id}
        [HttpPost("DeleteConfirmed/{id}")]
        public async Task<JsonResult> DeleteConfirmedAjax(int id)
        {
            var currentRoleId = HttpContext.Session.GetInt32("RoleId");
            if (currentRoleId != 1)
                return Json(new { success = false, message = "Chỉ Admin mới có quyền xóa tài khoản!" });

            var user = await _loginService.GetUserByIdAsync(id);
            if (user == null)
                return Json(new { success = false, message = "Không tìm thấy tài khoản" });

            var result = await _loginService.DeleteUserAsync(id);
            if (result)
                return Json(new { success = true, message = "Xóa tài khoản thành công" });

            return Json(new { success = false, message = "Không thể xóa tài khoản. Vui lòng thử lại." });
        }

        // GET: Đăng xuất
        public async Task<IActionResult> Logout()
        {
            // Xóa cookie xác thực
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            // Xóa session
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
                return RedirectToAction("Login", "Account");
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
        // API: Lấy danh sách tài khoản dạng JSON (chỉ Customer RoleId = 3)
        [HttpGet]
        public async Task<JsonResult> GetCustomersJson()
        {
            // Lấy trực tiếp những user có RoleId = 3 (Customer)
            var danhSachCustomer = await _loginService.GetUsersByRoleAsync(3);
            var result = danhSachCustomer.Select(u => new
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
        // ----------------- Helpers -----------------
        private (bool isValid, string message) ValidateUserDto(UserDto dto, bool isAdd)
        {
            if (dto == null)
                return (false, "Dữ liệu bắt buộc.");

            if (string.IsNullOrWhiteSpace(dto.FullName) || dto.FullName.Trim().Length < 3 || dto.FullName.Trim().Length > 100)
                return (false, "Họ và tên phải có độ dài từ 3 đến 100 ký tự.");

            if (string.IsNullOrWhiteSpace(dto.PhoneNumber))
                return (false, "Số điện thoại là bắt buộc.");

            // Kiểm tra số điện thoại: chỉ chứa chữ số, độ dài 9-11
            var phone = dto.PhoneNumber.Trim();
            if (!Regex.IsMatch(phone, @"^\d{9,11}$"))
                return (false, "Số điện thoại không hợp lệ. Vui lòng nhập 9-11 chữ số.");

            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var emailAttr = new EmailAddressAttribute();
                if (!emailAttr.IsValid(dto.Email.Trim()))
                    return (false, "Email không hợp lệ.");
            }

            if (isAdd)
            {
                if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 6)
                    return (false, "Mật khẩu bắt buộc và phải có ít nhất 6 ký tự.");
            }
            else
            {
                // Nếu cung cấp mật khẩu mới thì cũng yêu cầu tối thiểu 6 ký tự
                if (!string.IsNullOrWhiteSpace(dto.Password) && dto.Password.Length < 6)
                    return (false, "Mật khẩu mới phải có ít nhất 6 ký tự.");
            }

            // Trạng thái hợp lệ
            if (!string.IsNullOrWhiteSpace(dto.Status))
            {
                var s = dto.Status.Trim();
                if (s != "Active" && s != "Locked")
                    return (false, "Trạng thái không hợp lệ.");
            }

            return (true, string.Empty);
        }
        // Thêm action này vào AccountController
        public async Task<IActionResult> AccountProfile(int? id)
        {
            // Lấy UserId từ session
            var sessionUserId = HttpContext.Session.GetInt32("UserId");

            // Nếu có id parameter, kiểm tra quyền (chỉ Admin hoặc chính chủ)
            int userId = id ?? sessionUserId ?? 0;

            if (userId <= 0)
            {
                TempData["ErrorMessage"] = "Vui lòng đăng nhập để xem tài khoản!";
                return RedirectToAction("Login", "Account");
            }

            var currentRoleId = HttpContext.Session.GetInt32("RoleId");
            if (sessionUserId != userId && currentRoleId != 1)
            {
                TempData["ErrorMessage"] = "Bạn không có quyền xem tài khoản này!";
                return RedirectToAction("Index", "Home");
            }

            var user = await _loginService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound("Không tìm thấy tài khoản!");
            }

            return View(user);
        }

        // API: Cập nhật thông tin tài khoản (chỉ chỉnh sửa được fields cho phép)
        [HttpPost]
        [Consumes("application/json")]
        public async Task<JsonResult> UpdateProfile([FromBody] AccountController.UserDto dto)
        {
            var sessionUserId = HttpContext.Session.GetInt32("UserId");
            var currentRoleId = HttpContext.Session.GetInt32("RoleId");

            // Chỉ được sửa tài khoản của chính mình hoặc admin
            if (sessionUserId != dto.UserId && currentRoleId != 1)
            {
                return Json(new { success = false, message = "Bạn không có quyền chỉnh sửa tài khoản này!" });
            }

            if (dto.UserId <= 0)
            {
                return Json(new { success = false, message = "Dữ liệu không hợp lệ" });
            }

            // Validate basic info
            if (string.IsNullOrWhiteSpace(dto.FullName) || dto.FullName.Trim().Length < 3)
            {
                return Json(new { success = false, message = "Họ và tên phải có ít nhất 3 ký tự" });
            }

            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var emailAttr = new System.ComponentModel.DataAnnotations.EmailAddressAttribute();
                if (!emailAttr.IsValid(dto.Email.Trim()))
                {
                    return Json(new { success = false, message = "Email không hợp lệ" });
                }
            }

            var user = await _loginService.GetUserByIdAsync(dto.UserId);
            if (user == null)
            {
                return Json(new { success = false, message = "Không tìm thấy tài khoản" });
            }

            // Cập nhật fields cho phép
            user.FullName = dto.FullName.Trim();
            user.Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim();
            user.PhoneNumber = dto.PhoneNumber.Trim();

            // Nếu có mật khẩu mới, validate và cập nhật
            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                if (dto.Password.Length < 6)
                {
                    return Json(new { success = false, message = "Mật khẩu mới phải có ít nhất 6 ký tự" });
                }
                user.Password = dto.Password.Trim();
            }

            var updated = await _loginService.UpdateUserAsync(user);
            if (updated)
            {
                // Cập nhật session nếu sửa tài khoản của chính mình
                if (sessionUserId == dto.UserId)
                {
                    HttpContext.Session.SetString("FullName", user.FullName);
                    if (!string.IsNullOrEmpty(user.Email))
                    {
                        HttpContext.Session.SetString("Email", user.Email);
                    }
                }

                return Json(new
                {
                    success = true,
                    message = "Cập nhật thông tin thành công!",
                    user = new
                    {
                        user.UserId,
                        user.FullName,
                        user.PhoneNumber,
                        user.Email,
                        user.Status,
                        RoleName = user.Role?.RoleName
                    }
                });
            }

            return Json(new { success = false, message = "Cập nhật thất bại, vui lòng thử lại" });
        }
        // Thêm action này vào AccountController (trước dòng dấu kết thúc class)

        [HttpGet]
        public async Task<IActionResult> Favorite()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue)
            {
                TempData["ErrorMessage"] = "Vui lòng đăng nhập để xem yêu thích!";
                return RedirectToAction("Login", "Account");
            }

            var user = await _loginService.GetUserByIdAsync(userId.Value);
            if (user == null)
            {
                return NotFound();
            }

            ViewBag.UserId = userId.Value;
            ViewBag.UserName = user.FullName;

            return View();
        }

        [HttpGet]
        [Produces("application/json")]
        public async Task<IActionResult> GetUserFavorites()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue)
            {
                return Json(new { success = false, message = "Vui lòng đăng nhập" });
            }

            try
            {
                var favorites = await _loginService.GetFavoritesAsync(userId.Value);

                var result = favorites.Select(fav => new
                {
                    vehicleId = fav.Vehicle.VehicleId,
                    title = fav.Vehicle.Title,
                    model = fav.Vehicle.Model,
                    condition = fav.Vehicle.Condition,
                    salePrice = fav.Vehicle.SalePrice,
                    originalPrice = fav.Vehicle.OriginalPrice,
                    status = fav.Vehicle.Status,
                    stockQuantity = fav.Vehicle.StockQuantity,
                    soldCount = fav.Vehicle.SoldCount,
                    brand = fav.Vehicle.Brand?.BrandName,
                    category = fav.Vehicle.Category?.CategoryName,
                    store = fav.Vehicle.Store?.StoreName,
                    storeAddress = fav.Vehicle.Store?.Address,
                    primaryImage = fav.Vehicle.VehicleImages?
                        .FirstOrDefault(img => img.IsPrimary == true)?.ImagePath
                        ?? fav.Vehicle.VehicleImages?.FirstOrDefault()?.ImagePath
                        ?? "/images/default-vehicle.jpg",
                    createdAt = fav.CreatedAt
                }).OrderByDescending(x => x.createdAt).ToList();

                return Json(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách yêu thích");
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> RemoveFavorite(int vehicleId)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue)
            {
                return Json(new { success = false, message = "Vui lòng đăng nhập" });
            }

            try
            {
                var result = await _loginService.RemoveFavoriteAsync(userId.Value, vehicleId);
                if (result)
                {
                    return Json(new { success = true, message = "Đã xóa khỏi yêu thích" });
                }
                return Json(new { success = false, message = "Không tìm thấy yêu thích" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa yêu thích");
                return Json(new { success = false, message = ex.Message });
            }
        }
        // DTO dùng cho AJAX create/edit
        public class UserDto
        {
            public int UserId { get; set; }
            public string FullName { get; set; } = string.Empty;
            public string PhoneNumber { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string Status { get; set; } = "Active";
            public int RoleId { get; set; } = 3;
        }
    }
}
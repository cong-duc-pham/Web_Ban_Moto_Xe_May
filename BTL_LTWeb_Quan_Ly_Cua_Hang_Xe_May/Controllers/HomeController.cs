
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models;
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.EF;
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Diagnostics;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IXeMayService _xeMayService;
        private readonly ILoginService _loginService;

        public HomeController(ILogger<HomeController> logger, IXeMayService xeMayService, ILoginService loginService)
        {
            _logger = logger;
            _xeMayService = xeMayService;
            _loginService = loginService;
        }


        public IActionResult QaA() { 
            return View();
        }
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult MotorbikeStore()
        {
            return View();
        }

        public async Task<IActionResult> MotorbikeOnline()
        {
            // Sử dụng service để lấy danh sách xe máy
            List<XeMay> lstXeMay = await _xeMayService.GetAllXeMayAsync();
            ViewBag.lstXeMay = lstXeMay;
            return View();
        }
        public IActionResult Login()
        {
            return View();
        }

        public IActionResult Register()
        {
            return View();
        }
        public IActionResult Privacy()
        {
            return View();
        }

        public IActionResult LiquidationCar()
        {
            return View();
        }

        public IActionResult News() {    
            return View();
        }

        // ==================== API XE MÁY ====================
        
        // API: Thêm xe máy mới
        [HttpPost]
        public async Task<IActionResult> AddXeMay([FromBody] XeMay xeMay)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return Json(new { success = false, message = "Dữ liệu không hợp lệ!" });
                }

                // Kiểm tra dữ liệu bắt buộc
                if (string.IsNullOrWhiteSpace(xeMay.TenXe))
                {
                    return Json(new { success = false, message = "Tên xe không được để trống!" });
                }

                if (xeMay.Gia <= 0)
                {
                    return Json(new { success = false, message = "Giá xe phải lớn hơn 0!" });
                }

                if (string.IsNullOrWhiteSpace(xeMay.HinhAnh))
                {
                    return Json(new { success = false, message = "Hình ảnh không được để trống!" });
                }

                var result = await _xeMayService.AddXeMayAsync(xeMay);
                
                if (result)
                {
                    _logger.LogInformation($"Đã thêm xe mới: {xeMay.TenXe} - ID: {xeMay.ID}");
                    return Json(new { success = true, message = "Thêm xe máy thành công!" });
                }
                
                return Json(new { success = false, message = "Không thể thêm xe máy. Vui lòng thử lại!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi thêm xe máy");
                return Json(new { success = false, message = "Có lỗi xảy ra: " + ex.Message });
            }
        }

        // API: Sửa thông tin xe máy
        [HttpPost]
        public async Task<IActionResult> EditXeMay([FromBody] XeMay xeMay)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return Json(new { success = false, message = "Dữ liệu không hợp lệ!" });
                }

                // Kiểm tra xe có tồn tại không
                var existingXe = await _xeMayService.GetXeMayByIdAsync(xeMay.ID);
                if (existingXe == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy xe cần sửa!" });
                }

                // Kiểm tra dữ liệu bắt buộc
                if (string.IsNullOrWhiteSpace(xeMay.TenXe))
                {
                    return Json(new { success = false, message = "Tên xe không được để trống!" });
                }

                if (xeMay.Gia <= 0)
                {
                    return Json(new { success = false, message = "Giá xe phải lớn hơn 0!" });
                }

                if (string.IsNullOrWhiteSpace(xeMay.HinhAnh))
                {
                    return Json(new { success = false, message = "Hình ảnh không được để trống!" });
                }

                var result = await _xeMayService.UpdateXeMayAsync(xeMay);
                
                if (result)
                {
                    _logger.LogInformation($"Đã cập nhật xe: {xeMay.TenXe} - ID: {xeMay.ID}");
                    return Json(new { success = true, message = "Cập nhật xe máy thành công!" });
                }
                
                return Json(new { success = false, message = "Không thể cập nhật xe máy. Vui lòng thử lại!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật xe máy");
                return Json(new { success = false, message = "Có lỗi xảy ra: " + ex.Message });
            }
        }

        // API: Xóa xe máy
        [HttpPost]
        public async Task<IActionResult> DeleteXeMay(int id)
        {
            try
            {
                // Kiểm tra xe có tồn tại không
                var existingXe = await _xeMayService.GetXeMayByIdAsync(id);
                if (existingXe == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy xe cần xóa!" });
                }

                var result = await _xeMayService.DeleteXeMayAsync(id);
                
                if (result)
                {
                    _logger.LogInformation($"Đã xóa xe: {existingXe.TenXe} - ID: {id}");
                    return Json(new { success = true, message = $"Đã xóa xe '{existingXe.TenXe}' thành công!" });
                }
                
                return Json(new { success = false, message = "Không thể xóa xe máy. Vui lòng thử lại!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi xóa xe máy ID: {id}");
                return Json(new { success = false, message = "Có lỗi xảy ra: " + ex.Message });
            }
        }

        // API: Lấy thông tin xe máy theo ID (dùng cho AJAX)
        [HttpGet]
        public async Task<IActionResult> GetXeMayById(int id)
        {
            try
            {
                var xeMay = await _xeMayService.GetXeMayByIdAsync(id);
                
                if (xeMay != null)
                {
                    return Json(new { success = true, data = xeMay });
                }
                
                return Json(new { success = false, message = "Không tìm thấy xe máy!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy thông tin xe máy ID: {id}");
                return Json(new { success = false, message = "Có lỗi xảy ra: " + ex.Message });
            }
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}

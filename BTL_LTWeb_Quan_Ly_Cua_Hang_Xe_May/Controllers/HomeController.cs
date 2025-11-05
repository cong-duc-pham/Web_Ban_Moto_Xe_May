using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models;
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Services;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Controllers
{
    // ViewModel tổng hợp cho trang chủ
    public class HomePageViewModel
    {
        public List<Vehicle> Vehicles { get; set; }
        public List<Store> FeaturedStores { get; set; }
        public List<News> NewsItems { get; set; }
        // Bạn có thể mở rộng thêm các property: Banner, Danh mục, Promotion...
    }

    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IXeMayService _xeMayService;
        private readonly ILoginService _loginService;
        // Nếu có StoreService, NewsService thì thêm vào và inject ở constructor

        public HomeController(
            ILogger<HomeController> logger,
            IXeMayService xeMayService,
            ILoginService loginService
        // Thêm INewsService newsService, IStoreService storeService nếu có
        )
        {
            _logger = logger;
            _xeMayService = xeMayService;
            _loginService = loginService;
            // Gán thêm các service khác nếu cần
        }

        public async Task<IActionResult> Index()
        {
            // Lấy dữ liệu (ở đây stores/news nếu chưa code thì để danh sách rỗng - có thể sửa sau)
            var vehicles = await _xeMayService.GetAllVehiclesAsync();
            var stores = new List<Store>();
            var news = new List<News>();

            var model = new HomePageViewModel
            {
                Vehicles = vehicles,
                FeaturedStores = stores,
                NewsItems = news
            };

            return View(model);
        }

        public IActionResult QaA() => View();
        public IActionResult MotorbikeStore() => View();

        public async Task<IActionResult> MotorbikeOnline()
        {
            List<Vehicle> lstVehicle = await _xeMayService.GetAllVehiclesAsync();
            ViewBag.lstVehicle = lstVehicle;
            var roleId = HttpContext.Session.GetInt32("RoleId");
            ViewBag.IsAdmin = roleId.HasValue && roleId.Value == 1;
            return View();
        }

        public IActionResult Login() => View();
        public IActionResult Register() => View();
        public IActionResult Privacy() => View();
        public IActionResult LiquidationCar() => View();
        public IActionResult News() => View();

        // ======= API, chức năng CRUD xe giữ nguyên như trước =======
        private bool IsAdmin()
        {
            var roleId = HttpContext.Session.GetInt32("RoleId");
            return roleId.HasValue && roleId.Value == 1;
        }

        [HttpPost]
        public async Task<IActionResult> AddVehicle([FromBody] Vehicle vehicle)
        {
            try
            {
                if (!IsAdmin())
                    return Json(new { success = false, message = "Bạn không có quyền thực hiện chức năng này! Chỉ Quản lý mới có thể thêm xe." });

                if (!ModelState.IsValid)
                    return Json(new { success = false, message = "Dữ liệu không hợp lệ!" });

                if (string.IsNullOrWhiteSpace(vehicle.Title))
                    return Json(new { success = false, message = "Tiêu đề xe không được để trống!" });

                if (vehicle.SalePrice <= 0)
                    return Json(new { success = false, message = "Giá xe phải lớn hơn 0!" });

                vehicle.Status = "Available";
                vehicle.ViewCount = 0;
                vehicle.IsFeatured = false;
                vehicle.PostedAt = DateTime.Now;
                vehicle.UpdatedAt = DateTime.Now;

                var result = await _xeMayService.AddVehicleAsync(vehicle);

                if (result)
                {
                    _logger.LogInformation($"Đã thêm xe mới: {vehicle.Title} - ID: {vehicle.VehicleId}");
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

        [HttpPost]
        public async Task<IActionResult> EditVehicle([FromBody] Vehicle vehicle)
        {
            try
            {
                if (!IsAdmin())
                    return Json(new { success = false, message = "Bạn không có quyền thực hiện chức năng này! Chỉ Quản lý mới có thể sửa thông tin xe." });

                if (!ModelState.IsValid)
                    return Json(new { success = false, message = "Dữ liệu không hợp lệ!" });

                var existingVehicle = await _xeMayService.GetVehicleByIdAsync(vehicle.VehicleId);
                if (existingVehicle == null)
                    return Json(new { success = false, message = "Không tìm thấy xe cần sửa!" });

                if (string.IsNullOrWhiteSpace(vehicle.Title))
                    return Json(new { success = false, message = "Tiêu đề xe không được để trống!" });

                if (vehicle.SalePrice <= 0)
                    return Json(new { success = false, message = "Giá xe phải lớn hơn 0!" });

                vehicle.UpdatedAt = DateTime.Now;
                var result = await _xeMayService.UpdateVehicleAsync(vehicle);

                if (result)
                {
                    _logger.LogInformation($"Đã cập nhật xe: {vehicle.Title} - ID: {vehicle.VehicleId}");
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

        [HttpPost]
        public async Task<IActionResult> DeleteVehicle(int id)
        {
            try
            {
                if (!IsAdmin())
                    return Json(new { success = false, message = "Bạn không có quyền thực hiện chức năng này! Chỉ Quản lý mới có thể xóa xe." });

                var existingVehicle = await _xeMayService.GetVehicleByIdAsync(id);
                if (existingVehicle == null)
                    return Json(new { success = false, message = "Không tìm thấy xe cần xóa!" });

                var result = await _xeMayService.DeleteVehicleAsync(id);

                if (result)
                {
                    _logger.LogInformation($"Đã xóa xe: {existingVehicle.Title} - ID: {id}");
                    return Json(new { success = true, message = $"Đã xóa xe '{existingVehicle.Title}' thành công!" });
                }

                return Json(new { success = false, message = "Không thể xóa xe máy. Vui lòng thử lại!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi xóa xe máy ID: {id}");
                return Json(new { success = false, message = "Có lỗi xảy ra: " + ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetVehicleById(int id)
        {
            try
            {
                var vehicle = await _xeMayService.GetVehicleByIdAsync(id);

                if (vehicle != null)
                    return Json(new { success = true, data = vehicle });

                return Json(new { success = false, message = "Không tìm thấy xe máy!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy thông tin xe máy ID: {id}");
                return Json(new { success = false, message = "Có lỗi xảy ra: " + ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> IncreaseViewCount(int id)
        {
            try
            {
                var result = await _xeMayService.IncreaseViewCountAsync(id);
                return Json(new { success = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi tăng lượt xem ID: {id}");
                return Json(new { success = false });
            }
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}

using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models;
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Services;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Controllers
{
    // ViewModel tổng hợp cho trang chủ
    public class HomePageViewModel
    {
        public List<Vehicle> Vehicles { get; set; }
        public List<Store> FeaturedStores { get; set; }
        public List<News> NewsItems { get; set; }
        // Bạn có thể mở rộng thêm các property: Banner, Danh mục, Promotion...
        public List<CategoryStatViewModel> CategoryStats { get; set; }
        public List<BrandStatViewModel> BrandStats { get; set; }
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
        [Authorize(Roles = "Admin")]
        [Route("/admin")] // Định nghĩa đường dẫn là /admin
        public IActionResult AdminDashboard()
        {
            return View("AdminDashboard");
        }

        [Route("/Home/AccessDenied")]
        public IActionResult AccessDenied()
        {
            // Trả về view báo lỗi không có quyền
            return View();
        }
        public async Task<IActionResult> Index()
        {
            try
            {
                // Debug session
                var roleName = HttpContext.Session.GetString("RoleName");
                var roleId = HttpContext.Session.GetInt32("RoleId");
                var userId = HttpContext.Session.GetInt32("UserId");
                var fullName = HttpContext.Session.GetString("FullName");

                _logger.LogInformation($"=== INDEX PAGE - Session Info ===");
                _logger.LogInformation($"FullName: {fullName}");
                _logger.LogInformation($"UserId: {userId}");
                _logger.LogInformation($"RoleName: '{roleName}'");
                _logger.LogInformation($"RoleId: {roleId}");

                // Set ViewBag để hiển thị menu đúng với vai trò
                ViewBag.IsAdmin = IsAdmin();
                ViewBag.IsSaler = IsSaler();

                // Lấy dữ liệu vehicles
                var vehicles = await _xeMayService.GetAllVehiclesAsync();
                var stores = new List<Store>();
                var news = new List<News>();

                // ✅ CHECK NULL VEHICLES
                if (vehicles == null || !vehicles.Any())
                {
                    _logger.LogWarning("⚠️ Không có dữ liệu xe trong database");

                    var emptyModel = new HomePageViewModel
                    {
                        Vehicles = new List<Vehicle>(),
                        FeaturedStores = new List<Store>(),
                        NewsItems = new List<News>(),
                        CategoryStats = new List<CategoryStatViewModel>(),
                        BrandStats = new List<BrandStatViewModel>()
                    };

                    return View(emptyModel);
                }

                _logger.LogInformation($"✅ Đã load {vehicles.Count} xe từ database");

                // ✅ TÍNH TOÁN CATEGORY STATS với NULL CHECKS
                var categoryStatsTemp = vehicles
                    .Where(v => v.Category != null)  // ⭐ Lọc null
                    .GroupBy(v => v.Category)
                    .Select(g => new
                    {
                        Category = g.Key,
                        TotalSold = g.Sum(v => v.SoldCount),
                        TotalListings = g.Count(),
                        MinPrice = g.Min(v => v.SalePrice ?? 0),
                        MaxPrice = g.Max(v => v.SalePrice ?? 0),
                        SampleImage = g.FirstOrDefault()?.VehicleImages?
                            .FirstOrDefault(img => img.IsPrimary == true)?.ImagePath
                            ?? g.FirstOrDefault()?.VehicleImages?.FirstOrDefault()?.ImagePath
                            ?? "/images/default-vehicle.jpg"
                    })
                    .OrderByDescending(c => c.TotalSold)
                    .Take(4)
                    .ToList();

                // Thêm badge cho từng category
                var badges = new[]
                {
            new { Icon = "fire", Text = "Bán chạy nhất", Color = "#FF3B3B" },
            new { Icon = "trophy", Text = "Phổ biến nhất", Color = "#FFD54F" },
            new { Icon = "chart-line", Text = "Tăng trưởng", Color = "#4CAF50" },
            new { Icon = "bolt", Text = "Xu hướng", Color = "#2196F3" }
        };

                var categoryStats = categoryStatsTemp.Select((c, index) => new CategoryStatViewModel
                {
                    CategoryId = c.Category.CategoryId,
                    CategoryName = c.Category.CategoryName ?? "Chưa phân loại",  // ⭐ Null check
                    TotalSold = c.TotalSold,
                    TotalListings = c.TotalListings,
                    MinPrice = c.MinPrice,
                    MaxPrice = c.MaxPrice,
                    SampleImage = c.SampleImage,
                    BadgeIcon = index < badges.Length ? badges[index].Icon : "circle",  // ⭐ Bounds check
                    BadgeText = index < badges.Length ? badges[index].Text : "Mới",
                    BadgeColor = index < badges.Length ? badges[index].Color : "#999"
                }).ToList();

                _logger.LogInformation($"✅ Tính toán xong {categoryStats.Count} categories");

                // ✅ TÍNH TOÁN BRAND STATS với NULL CHECKS
                var brandStatsTemp = vehicles
                    .Where(v => v.Brand != null)  // ⭐ Lọc null
                    .GroupBy(v => v.Brand)
                    .Select(g => new
                    {
                        Brand = g.Key,
                        TotalSold = g.Sum(v => v.SoldCount),
                        TotalListings = g.Count(),
                        TopModels = g
                            .Where(v => !string.IsNullOrEmpty(v.Model))  // ⭐ Lọc Model null
                            .GroupBy(v => v.Model)
                            .Select(m => new TopModelViewModel
                            {
                                ModelName = m.Key ?? "Chưa rõ",  // ⭐ Null check
                                Sales = m.Sum(v => v.SoldCount)
                            })
                            .OrderByDescending(m => m.Sales)
                            .Take(3)
                            .ToList()
                    })
                    .OrderByDescending(b => b.TotalSold)
                    .Take(4)
                    .ToList();

                var brandStats = brandStatsTemp.Select((b, index) => new BrandStatViewModel
                {
                    BrandId = b.Brand.BrandId,
                    BrandName = b.Brand.BrandName ?? "Không rõ",  // ⭐ Null check
                    BrandLogo = string.IsNullOrEmpty(b.Brand.Logo)
                        ? $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(b.Brand.BrandName ?? "Unknown")}&background=random&size=80"
                        : b.Brand.Logo,
                    TotalSold = b.TotalSold,
                    TotalListings = b.TotalListings,
                    Rank = index + 1,
                    TopModels = b.TopModels ?? new List<TopModelViewModel>()  // ⭐ Null check
                }).ToList();

                _logger.LogInformation($"✅ Tính toán xong {brandStats.Count} brands");

                // ✅ TẠO MODEL với NULL CHECKS
                var model = new HomePageViewModel
                {
                    Vehicles = vehicles ?? new List<Vehicle>(),
                    FeaturedStores = stores ?? new List<Store>(),
                    NewsItems = news ?? new List<News>(),
                    CategoryStats = categoryStats ?? new List<CategoryStatViewModel>(),
                    BrandStats = brandStats ?? new List<BrandStatViewModel>()
                };

                _logger.LogInformation($"🎉 HOÀN THÀNH: {categoryStats.Count} categories, {brandStats.Count} brands");

                return View(model);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ LỖI NGHIÊM TRỌNG khi load trang Index");

                // Trả về model rỗng thay vì crash
                var errorModel = new HomePageViewModel
                {
                    Vehicles = new List<Vehicle>(),
                    FeaturedStores = new List<Store>(),
                    NewsItems = new List<News>(),
                    CategoryStats = new List<CategoryStatViewModel>(),
                    BrandStats = new List<BrandStatViewModel>()
                };

                TempData["ErrorMessage"] = "Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.";
                return View(errorModel);
            }
        }
        public IActionResult QaA() => View();
        public IActionResult MotorbikeStore() => View();

        public async Task<IActionResult> MotorbikeOnline()
        {
            _logger.LogInformation("=== VÀO TRANG MOTORBIKE ONLINE ===");
            
            List<Vehicle> lstVehicle = await _xeMayService.GetAllVehiclesAsync();
            _logger.LogInformation($"Tổng số xe trong database: {lstVehicle?.Count ?? 0}");
            
            // Kiểm tra quyền: Admin hoặc Saler thấy tất cả, khách hàng chỉ thấy xe còn hàng
            var isAdminOrSaler = IsAdminOrSaler();
            ViewBag.IsAdmin = IsAdmin(); // Chỉ Admin mới có nút thêm/sửa/xóa
            ViewBag.IsSaler = IsSaler(); // Saler không có nút thêm/sửa/xóa
            
            _logger.LogInformation($"IsAdmin: {ViewBag.IsAdmin}, IsSaler: {ViewBag.IsSaler}");
            
            // Log trạng thái của các xe để debug
            if (lstVehicle != null && lstVehicle.Any())
            {
                foreach (var v in lstVehicle.Take(5))
                {
                    _logger.LogInformation($"Xe ID={v.VehicleId}: Stock={v.StockQuantity}, Sold={v.SoldCount}, Status='{v.Status}'");
                }
            }
            
            // Lọc xe theo quyền:
            // - Admin/Saler: Thấy tất cả
            // - Khách hàng: Chỉ thấy xe còn hàng (StockQuantity > 0)
            if (!isAdminOrSaler)
            {
                var beforeFilter = lstVehicle.Count;
                lstVehicle = lstVehicle.Where(v => v.StockQuantity > 0).ToList();
                _logger.LogInformation($"Lọc xe cho khách: {beforeFilter} -> {lstVehicle.Count} (StockQuantity > 0)");
            }
            
            ViewBag.lstVehicle = lstVehicle;
            _logger.LogInformation($"Số lượng xe hiển thị: {lstVehicle?.Count ?? 0}");
            
            // Load dropdown data
            var stores = await _xeMayService.GetAllStoresAsync();
            ViewBag.Stores = stores;
            _logger.LogInformation($"Số lượng Store: {stores?.Count ?? 0}");
            
            var categories = await _xeMayService.GetAllCategoriesAsync();
            ViewBag.Categories = categories;
            _logger.LogInformation($"Số lượng Category: {categories?.Count ?? 0}");
            
            var brands = await _xeMayService.GetAllBrandsAsync();
            ViewBag.Brands = brands;
            _logger.LogInformation($"Số lượng Brand: {brands?.Count ?? 0}");
            
            return View();
        }

        public IActionResult Login() => View();
        public IActionResult Register() => View();
        public IActionResult Privacy() => View();
        public IActionResult LiquidationCar() => View();
        public IActionResult News() => View();
        public IActionResult AllVehicles() => View();


        // ======= Helper Methods - Kiểm tra quyền =======
        private bool IsAdmin()
        {
            var roleId = HttpContext.Session.GetInt32("RoleId");
            return roleId.HasValue && roleId.Value == 1;
        }

        private bool IsSaler()
        {
            var roleName = HttpContext.Session.GetString("RoleName");
            return !string.IsNullOrEmpty(roleName) && 
                   roleName.Trim().Equals("Saler", StringComparison.OrdinalIgnoreCase);
        }

        private bool IsAdminOrSaler()
        {
            return IsAdmin() || IsSaler();
        }

        // ======= API, chức năng CRUD xe =======
        public async Task<IActionResult> AddVehicle([FromForm] Vehicle vehicle, [FromForm] List<IFormFile> HinhAnh)
        {
            try
            {
                _logger.LogInformation("=== BẮT ĐẦU THÊM XE ===");
                _logger.LogInformation($"Dữ liệu nhận được: Title={vehicle?.Title}, SalePrice={vehicle?.SalePrice}");
                _logger.LogInformation($"Số lượng hình ảnh: {HinhAnh?.Count ?? 0}");
                
                if (!IsAdmin())
                {
                    _logger.LogWarning("Người dùng không có quyền Admin");
                    return Json(new { success = false, message = "Bạn không có quyền thực hiện chức năng này! Chỉ Quản lý mới có thể thêm xe." });
                }

                if (string.IsNullOrWhiteSpace(vehicle.Title))
                {
                    _logger.LogWarning("Title rỗng");
                    return Json(new { success = false, message = "Tiêu đề xe không được để trống!" });
                }

                if (vehicle.SalePrice <= 0)
                {
                    _logger.LogWarning($"SalePrice không hợp lệ: {vehicle.SalePrice}");
                    return Json(new { success = false, message = "Giá xe phải lớn hơn 0!" });
                }

                // Validate stock quantity
                if (vehicle.StockQuantity < 0)
                {
                    _logger.LogWarning($"StockQuantity không hợp lệ: {vehicle.StockQuantity}");
                    return Json(new { success = false, message = "Số lượng xe không được âm!" });
                }

                // Set default values
                vehicle.Status = "Available";
                vehicle.ViewCount = 0;
                vehicle.IsFeatured = false;
                vehicle.PostedAt = DateTime.Now;
                vehicle.UpdatedAt = DateTime.Now;
                vehicle.SoldCount = 0; // Xe mới chưa bán chiếc nào
                
                // Nếu không nhập stock, mặc định là 1
                if (vehicle.StockQuantity == 0)
                {
                    vehicle.StockQuantity = 1;
                }
                
                _logger.LogInformation($"Chuẩn bị gọi AddVehicleAsync với Title={vehicle.Title}, StockQuantity={vehicle.StockQuantity}");

                var result = await _xeMayService.AddVehicleAsync(vehicle);

                if (result)
                {
                    _logger.LogInformation($"✅ Đã thêm xe thành công: {vehicle.Title} - ID: {vehicle.VehicleId}");
                    
                    // Xử lý upload hình ảnh
                    if (HinhAnh != null && HinhAnh.Count > 0)
                    {
                        var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "vehicles");
                        
                        // Tạo thư mục nếu chưa tồn tại
                        if (!Directory.Exists(uploadPath))
                        {
                            Directory.CreateDirectory(uploadPath);
                            _logger.LogInformation($"Đã tạo thư mục: {uploadPath}");
                        }

                        for (int i = 0; i < HinhAnh.Count; i++)
                        {
                            var file = HinhAnh[i];
                            if (file.Length > 0)
                            {
                                // Tạo tên file unique
                                var fileName = $"{vehicle.VehicleId}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                                var filePath = Path.Combine(uploadPath, fileName);
                                
                                // Lưu file
                                using (var stream = new FileStream(filePath, FileMode.Create))
                                {
                                    await file.CopyToAsync(stream);
                                }
                                
                                // Lưu thông tin vào database
                                var vehicleImage = new VehicleImage
                                {
                                    VehicleId = vehicle.VehicleId,
                                    ImagePath = $"/images/vehicles/{fileName}",
                                    IsPrimary = (i == 0), // Ảnh đầu tiên là ảnh chính
                                    DisplayOrder = i
                                };
                                
                                await _xeMayService.AddVehicleImageAsync(vehicleImage);
                                _logger.LogInformation($"Đã lưu ảnh: {fileName}, IsPrimary: {i == 0}");
                            }
                        }
                    }
                    
                    return Json(new { success = true, message = "Thêm xe máy thành công!" });
                }

                _logger.LogWarning("❌ Service trả về false");
                return Json(new { success = false, message = "Không thể thêm xe máy. Vui lòng thử lại!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ LỖI KHI THÊM XE: {ex.Message}");
                _logger.LogError($"StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    _logger.LogError($"InnerException: {ex.InnerException.Message}");
                }
                return Json(new { success = false, message = "Có lỗi xảy ra: " + ex.Message + (ex.InnerException != null ? " | " + ex.InnerException.Message : "") });
            }
        }

        [HttpPost]
        public async Task<IActionResult> EditVehicle([FromBody] Vehicle vehicle)
        {
            try
            {
                _logger.LogInformation($"=== BẮT ĐẦU SỬA XE ID={vehicle?.VehicleId} ===");
                _logger.LogInformation($"Dữ liệu: Title={vehicle?.Title}, SalePrice={vehicle?.SalePrice}");
                
                if (!IsAdmin())
                    return Json(new { success = false, message = "Bạn không có quyền thực hiện chức năng này! Chỉ Quản lý mới có thể sửa thông tin xe." });

                if (vehicle == null || vehicle.VehicleId <= 0)
                    return Json(new { success = false, message = "Dữ liệu không hợp lệ!" });

                var existingVehicle = await _xeMayService.GetVehicleByIdAsync(vehicle.VehicleId);
                if (existingVehicle == null)
                    return Json(new { success = false, message = "Không tìm thấy xe cần sửa!" });

                if (string.IsNullOrWhiteSpace(vehicle.Title))
                    return Json(new { success = false, message = "Tiêu đề xe không được để trống!" });

                if (vehicle.SalePrice <= 0)
                    return Json(new { success = false, message = "Giá xe phải lớn hơn 0!" });

                // Service sẽ tự động lấy và giữ lại PostedAt, ViewCount
                var result = await _xeMayService.UpdateVehicleAsync(vehicle);

                if (result)
                {
                    _logger.LogInformation($"✅ Đã cập nhật xe: {vehicle.Title} - ID: {vehicle.VehicleId}");
                    return Json(new { success = true, message = "Cập nhật xe máy thành công!" });
                }

                _logger.LogWarning("❌ Service trả về false");
                return Json(new { success = false, message = "Không thể cập nhật xe máy. Vui lòng thử lại!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Lỗi khi cập nhật xe máy");
                if (ex.InnerException != null)
                {
                    _logger.LogError($"InnerException: {ex.InnerException.Message}");
                }
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

        // ===== QUẢN LÝ ĐƠN HÀNG =====

        // Khách hàng mua xe
        [HttpPost]
        public async Task<IActionResult> BuyVehicle([FromBody] BuyVehicleRequest request)
        {
            try
            {
                _logger.LogInformation("=== BẮT ĐẦU MUA XE ===");
                
                // request
                if (request == null)
                {
                    _logger.LogWarning("Request null");
                    return Json(new { success = false, message = "Dữ liệu không hợp lệ!" });
                }

                _logger.LogInformation($"VehicleId: {request.VehicleId}");
                _logger.LogInformation($"CustomerAddress: {request.CustomerAddress}");
                _logger.LogInformation($"DepositAmount: {request.DepositAmount}");
                _logger.LogInformation($"PaymentMethod: {request.PaymentMethod}");
                
                //  địa chỉ
                if (string.IsNullOrWhiteSpace(request.CustomerAddress))
                {
                    _logger.LogWarning("CustomerAddress rỗng");
                    return Json(new { success = false, message = "Vui lòng nhập địa chỉ nhận xe!" });
                }

                // Kiểm tra đăng nhập   
                var userId = HttpContext.Session.GetInt32("UserId");
                _logger.LogInformation($"UserId from session: {userId}");
                
                if (!userId.HasValue)
                {
                    _logger.LogWarning("UserId null - chưa đăng nhập");
                    return Json(new { success = false, message = "Vui lòng đăng nhập để mua xe!" });
                }
                
                _logger.LogInformation($"UserId: {userId.Value}");
                
                var fullName = HttpContext.Session.GetString("FullName") ?? "";
                var phoneNumber = HttpContext.Session.GetString("PhoneNumber") ?? "";
                
                _logger.LogInformation($"FullName: '{fullName}', PhoneNumber: '{phoneNumber}'");

                // Kiểm tra xe tồn tại và đang bán
                var vehicle = await _xeMayService.GetVehicleByIdAsync(request.VehicleId);
                if (vehicle == null)
                {
                    return Json(new { success = false, message = "Xe không tồn tại!" });
                }

                if (vehicle.Status != "Available")
                {
                    return Json(new { success = false, message = "Xe này hiện không còn bán!" });
                }

                // Kiểm tra tồn kho
                if (vehicle.StockQuantity <= 0)
                {
                    return Json(new { 
                        success = false, 
                        message = "Xe này đã hết hàng! Vui lòng liên hệ cửa hàng để biết thêm chi tiết." 
                    });
                }

                // Số tiền đặt cọc phải nhỏ hơn giá xe
                var vehiclePrice = vehicle.SalePrice ?? 0;
                var depositAmount = request.DepositAmount ?? 0;
                
                if (depositAmount >= vehiclePrice)
                {
                    return Json(new { 
                        success = false, 
                        message = $"Số tiền đặt cọc phải nhỏ hơn giá xe! Giá xe: {vehiclePrice:N0} đ" 
                    });
                }
                
                if (depositAmount <= 0)
                {
                    return Json(new { 
                        success = false, 
                        message = "Số tiền đặt cọc phải lớn hơn 0!" 
                    });
                }

                _logger.LogInformation($"Validation passed - VehiclePrice: {vehiclePrice:N0}, DepositAmount: {depositAmount:N0}");

                // Tạo mã đơn hàng
                
                var orderNumber = $"ORD{DateTime.Now:yyMMddHHmmss}";
                _logger.LogInformation($"OrderNumber: {orderNumber} (Length: {orderNumber.Length})");

                // Tạo đơn hàng
                _logger.LogInformation("Đang tạo OrderInfo object...");
                // Xử lý PaymentMethod - cắt ngắn nếu quá dài
                var paymentMethod = string.IsNullOrWhiteSpace(request.PaymentMethod) 
                    ? "Cash" 
                    : (request.PaymentMethod.Length > 20 
                        ? request.PaymentMethod.Substring(0, 20) 
                        : request.PaymentMethod);
                
                _logger.LogInformation($"PaymentMethod after trim: '{paymentMethod}' (Length: {paymentMethod.Length})");
                
                var order = new OrderInfo
                {
                    OrderNumber = orderNumber,
                    VehicleId = vehicle.VehicleId,
                    StoreId = vehicle.StoreId ?? 1, // Default store nếu không có
                    CustomerId = userId.Value,
                    CustomerName = fullName,
                    CustomerPhone = phoneNumber,
                    CustomerAddress = request.CustomerAddress ?? "",
                    VehiclePrice = vehicle.SalePrice ?? 0,
                    DepositAmount = request.DepositAmount ?? 0,
                    TotalPrice = vehicle.SalePrice ?? 0,
                    PaymentMethod = paymentMethod,
                    PaymentStatus = "Unpaid",
                    OrderStatus = "Pending",
                    Note = request.Note ?? "",
                    OrderedAt = DateTime.Now
                };
                
                _logger.LogInformation($"Order created: CustomerId={order.CustomerId}, VehicleId={order.VehicleId}, CustomerName='{order.CustomerName}'");
                _logger.LogInformation($"📋 Full Order Details:");
                _logger.LogInformation($"  OrderNumber: {order.OrderNumber} (Length: {order.OrderNumber.Length})");
                _logger.LogInformation($"  PaymentMethod: '{order.PaymentMethod}' (Length: {order.PaymentMethod.Length})");
                _logger.LogInformation($"  PaymentStatus: '{order.PaymentStatus}' (Length: {order.PaymentStatus.Length})");
                _logger.LogInformation($"  OrderStatus: '{order.OrderStatus}' (Length: {order.OrderStatus.Length})");
                _logger.LogInformation($"  Note: '{order.Note}' (Length: {order.Note.Length})");
                _logger.LogInformation("Đang gọi CreateOrderAsync...");

                var createdOrder = await _xeMayService.CreateOrderAsync(order);
                
                _logger.LogInformation($"CreateOrderAsync returned: {(createdOrder != null ? "Success" : "Null")}");
                
                if (createdOrder != null)
                {
                    // Cập nhật trạng thái xe sang "Pending" để ẩn khỏi trang web
                    await _xeMayService.UpdateVehicleStatusAsync(vehicle.VehicleId, "Pending");
                    
                    return Json(new { 
                        success = true, 
                        message = "Đặt mua xe thành công! Vui lòng chuyển khoản để xác nhận.",
                        orderId = createdOrder.OrderId,
                        orderNumber = order.OrderNumber
                    });
                }

                return Json(new { success = false, message = "Có lỗi xảy ra khi tạo đơn hàng!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo đơn hàng");
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        //Xem trạng thái tất cả xe
        public async Task<IActionResult> DebugVehicles()
        {
            var vehicles = await _xeMayService.GetAllVehiclesAsync();
            
            var debugInfo = vehicles.Select(v => new
            {
                v.VehicleId,
                v.Title,
                Status = v.Status,
                StatusLength = v.Status?.Length ?? 0,
                StatusBytes = v.Status != null ? System.Text.Encoding.UTF8.GetBytes(v.Status) : null,
                v.PostedAt
            }).ToList();
            
            return Json(new { 
                TotalVehicles = vehicles.Count,
                Vehicles = debugInfo,
                StatusGroups = vehicles.GroupBy(v => v.Status).Select(g => new { Status = g.Key, Count = g.Count() })
            });
        }

        //  Xem trạng thái xe 
        public async Task<IActionResult> DebugVehiclesPage()
        {
            var vehicles = await _xeMayService.GetAllVehiclesAsync();
            ViewBag.AllVehicles = vehicles;
            
            var roleId = HttpContext.Session.GetInt32("RoleId");
            ViewBag.CurrentRoleId = roleId;
            ViewBag.IsAdminSession = roleId.HasValue && roleId.Value == 1;
            
            // Lọc như code thật
            var filteredVehicles = vehicles.Where(v => 
                !string.IsNullOrEmpty(v.Status) && 
                v.Status.Trim().Equals("Available", StringComparison.OrdinalIgnoreCase)
            ).ToList();
            
            ViewBag.FilteredVehicles = filteredVehicles;
            
            return View();
        }

        // API: Lấy xe bán chạy nhất (JSON)
        [HttpGet]
        public async Task<IActionResult> GetBestSellingVehicles(int count = 5)
        {
            try
            {
                var bestSellers = await _xeMayService.GetBestSellingVehiclesAsync(count);
                
                var result = bestSellers.Select(v => new
                {
                    vehicleId = v.VehicleId,
                    title = v.Title,
                    model = v.Model,
                    brand = v.Brand?.BrandName ?? "",
                    salePrice = v.SalePrice,
                    soldCount = v.SoldCount,
                    stockQuantity = v.StockQuantity,
                    status = v.Status,
                    imagePath = v.VehicleImages?.FirstOrDefault(img => img.IsPrimary == true)?.ImagePath 
                                ?? v.VehicleImages?.FirstOrDefault()?.ImagePath 
                                ?? "/images/default-vehicle.jpg"
                }).ToList();

                return Json(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy xe bán chạy");
                return Json(new { success = false, message = ex.Message });
            }
        }

        // Xem đơn hàng của khách hàng
        public async Task<IActionResult> MyOrders()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue)
            {
                return RedirectToAction("Login", "Account");
            }

            var orders = await _xeMayService.GetOrdersByCustomerIdAsync(userId.Value);
            
            return View(orders);
        }

        // Quản lý đơn hàng (Admin)
        public async Task<IActionResult> ManageOrders()
        {
            // Kiểm tra quyền: Admin hoặc Saler
            if (!IsAdminOrSaler())
            {
                TempData["ErrorMessage"] = "Bạn không có quyền truy cập chức năng này!";
                _logger.LogWarning($"Access denied to ManageOrders - RoleName: {HttpContext.Session.GetString("RoleName")}");
                return RedirectToAction("Index");
            }

            var orders = await _xeMayService.GetAllOrdersAsync();
            
            // Truyền thông tin role để view biết
            ViewBag.IsAdmin = IsAdmin();
            ViewBag.IsSaler = IsSaler();
            
            return View(orders);
        }

        // Xác nhận đơn hàng (Admin hoặc Saler)
        [HttpPost]
        public async Task<IActionResult> ApproveOrder(int orderId)
        {
            try
            {
                // Kiểm tra quyền: Admin hoặc Saler
                if (!IsAdminOrSaler())
                {
                    return Json(new { success = false, message = "Bạn không có quyền thực hiện thao tác này!" });
                }

                var result = await _xeMayService.UpdateOrderStatusAsync(orderId, "Approved");
                
                if (result)
                {
                    return Json(new { success = true, message = "Đã xác nhận đơn hàng!" });
                }

                return Json(new { success = false, message = "Không tìm thấy đơn hàng!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi xác nhận đơn hàng ID: {orderId}");
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // Từ chối đơn hàng (Admin hoặc Saler)
        [HttpPost]
        public async Task<IActionResult> RejectOrder([FromBody] RejectOrderRequest request)
        {
            try
            {
                // Kiểm tra quyền: Admin hoặc Saler
                if (!IsAdminOrSaler())
                {
                    return Json(new { success = false, message = "Bạn không có quyền thực hiện thao tác này!" });
                }

                var result = await _xeMayService.UpdateOrderStatusAsync(request.OrderId, "Rejected", request.CancelReason);
                
                if (result)
                {
                    return Json(new { success = true, message = "Đã từ chối đơn hàng. Xe đã được đưa trở lại trang bán!" });
                }

                return Json(new { success = false, message = "Không tìm thấy đơn hàng!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi từ chối đơn hàng ID: {request.OrderId}");
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // Xác nhận đã chuyển khoản (Admin/Saler)
        [HttpPost]
        public async Task<IActionResult> ConfirmPayment(int orderId)
        {
            try
            {
                // Kiểm tra quyền: Admin hoặc Saler
                if (!IsAdminOrSaler())
                {
                    return Json(new { success = false, message = "Bạn không có quyền thực hiện thao tác này!" });
                }

                var order = await _xeMayService.GetOrderByIdAsync(orderId);
                if (order == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy đơn hàng!" });
                }

                if (order.PaymentStatus != "Unpaid")
                {
                    return Json(new { success = false, message = "Đơn hàng đã được thanh toán rồi!" });
                }

                // Cập nhật trạng thái thanh toán
                order.PaymentStatus = "Paid";
                var result = await _xeMayService.UpdateOrderAsync(order);
                
                if (!result)
                {
                    return Json(new { success = false, message = "Cập nhật thất bại, vui lòng thử lại!" });
                }

                _logger.LogInformation($"Đã xác nhận thanh toán cho OrderId={orderId}");

                return Json(new { success = true, message = "Đã xác nhận chuyển khoản thành công!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi xác nhận thanh toán ID: {orderId}");
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // Admin/Saler xác nhận đã giao hàng (chuyển trạng thái Approved -> Delivered)
        [HttpPost]
        public async Task<IActionResult> MarkAsDelivered(int orderId)
        {
            try
            {
                // Kiểm tra quyền: Admin hoặc Saler
                if (!IsAdminOrSaler())
                {
                    return Json(new { success = false, message = "Bạn không có quyền thực hiện thao tác này!" });
                }

                var result = await _xeMayService.UpdateOrderStatusAsync(orderId, "Delivered");
                
                if (result)
                {
                    return Json(new { success = true, message = "Đã xác nhận giao hàng! Chờ khách hàng xác nhận nhận xe." });
                }

                return Json(new { success = false, message = "Không tìm thấy đơn hàng!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi xác nhận giao hàng ID: {orderId}");
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // Khách hàng xác nhận đã nhận xe (chuyển trạng thái Delivered -> Completed)
        [HttpPost]
        public async Task<IActionResult> ConfirmReceived(int orderId)
        {
            try
            {
                // Kiểm tra đăng nhập
                var userId = HttpContext.Session.GetInt32("UserId");
                if (!userId.HasValue)
                {
                    return Json(new { success = false, message = "Vui lòng đăng nhập!" });
                }

                // Kiểm tra đơn hàng có thuộc về khách hàng này không
                var order = await _xeMayService.GetOrderByIdAsync(orderId);
                if (order == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy đơn hàng!" });
                }

                if (order.CustomerId != userId.Value)
                {
                    return Json(new { success = false, message = "Bạn không có quyền xác nhận đơn hàng này!" });
                }

                if (order.OrderStatus != "Delivered")
                {
                    return Json(new { success = false, message = "Đơn hàng chưa được giao, không thể xác nhận!" });
                }

                // ===== NGHIỆP VỤ TỒN KHO =====
                // Khi khách hàng xác nhận nhận xe -> hoàn tất giao dịch
                // 1. Trừ số lượng tồn kho (StockQuantity)
                // 2. Tăng số lượng đã bán (SoldCount)
                // 3. Cập nhật trạng thái xe nếu hết hàng
                
                var vehicle = await _xeMayService.GetVehicleByIdAsync(order.VehicleId);
                if (vehicle != null)
                {
                    // Trừ tồn kho
                    vehicle.StockQuantity--;
                    
                    // Tăng số lượng đã bán
                    vehicle.SoldCount++;
                    
                    // Nếu hết hàng, đổi trạng thái
                    if (vehicle.StockQuantity <= 0)
                    {
                        vehicle.Status = "SoldOut";
                        _logger.LogInformation($"Xe VehicleId={vehicle.VehicleId} đã hết hàng!");
                    }
                    
                    // Lưu thay đổi
                    await _xeMayService.UpdateVehicleAsync(vehicle);
                    _logger.LogInformation($"Cập nhật tồn kho: VehicleId={vehicle.VehicleId}, StockQuantity={vehicle.StockQuantity}, SoldCount={vehicle.SoldCount}");
                }

                var result = await _xeMayService.UpdateOrderStatusAsync(orderId, "Completed");
                
                if (result)
                {
                    return Json(new { success = true, message = "Cảm ơn bạn đã xác nhận nhận xe!" });
                }

                return Json(new { success = false, message = "Có lỗi xảy ra!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi khách hàng xác nhận nhận xe ID: {orderId}");
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
        // API: Lấy tất cả xe (dùng cho AllVehicles page)
        [HttpGet]
        public async Task<IActionResult> GetAllVehicles()
        {
            try
            {
                var vehicles = await _xeMayService.GetAllVehiclesAsync();

                // Kiểm tra quyền: Admin/Saler thấy tất cả, khách hàng chỉ thấy xe còn hàng
                var isAdminOrSaler = IsAdminOrSaler();

                if (!isAdminOrSaler)
                {
                    vehicles = vehicles.Where(v => v.StockQuantity > 0).ToList();
                }

                var result = vehicles.Select(v => new
                {
                    vehicleId = v.VehicleId,
                    title = v.Title,
                    model = v.Model,
                    condition = v.Condition,
                    manufactureYear = v.ManufactureYear,
                    salePrice = v.SalePrice,
                    originalPrice = v.OriginalPrice,
                    engineCapacity = v.EngineCapacity,
                    color = v.Color,
                    description = v.Description,
                    status = v.Status,
                    stockQuantity = v.StockQuantity,
                    soldCount = v.SoldCount,
                    viewCount = v.ViewCount,
                    isFeatured = v.IsFeatured,
                    postedAt = v.PostedAt,
                    brand = v.Brand != null ? new
                    {
                        brandId = v.Brand.BrandId,
                        brandName = v.Brand.BrandName
                    } : null,
                    category = v.Category != null ? new
                    {
                        categoryId = v.Category.CategoryId,
                        categoryName = v.Category.CategoryName
                    } : null,
                    store = v.Store != null ? new
                    {
                        storeId = v.Store.StoreId,
                        storeName = v.Store.StoreName,
                        address = v.Store.Address,
                        rating = v.Store.Rating
                    } : null,
                    vehicleImages = v.VehicleImages.Select(img => new
                    {
                        imageId = img.ImageId,
                        imagePath = img.ImagePath,
                        isPrimary = img.IsPrimary,
                        displayOrder = img.DisplayOrder
                    }).OrderBy(img => img.displayOrder).ToList()
                }).ToList();

                return Json(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách xe");
                return Json(new { success = false, message = ex.Message });
            }
        }

        // API: Tìm kiếm xe
        [HttpGet]
        public async Task<IActionResult> SearchVehicles(
            string? keyword,
            int? categoryId,
            int? brandId,
            decimal? minPrice,
            decimal? maxPrice,
            string? condition)
        {
            try
            {
                var vehicles = await _xeMayService.GetAllVehiclesAsync();

                // Áp dụng bộ lọc
                if (!string.IsNullOrEmpty(keyword))
                {
                    vehicles = vehicles.Where(v =>
                        v.Title.Contains(keyword, StringComparison.OrdinalIgnoreCase) ||
                        (v.Model != null && v.Model.Contains(keyword, StringComparison.OrdinalIgnoreCase))
                    ).ToList();
                }

                if (categoryId.HasValue)
                {
                    vehicles = vehicles.Where(v => v.CategoryId == categoryId.Value).ToList();
                }

                if (brandId.HasValue)
                {
                    vehicles = vehicles.Where(v => v.BrandId == brandId.Value).ToList();
                }

                if (minPrice.HasValue)
                {
                    vehicles = vehicles.Where(v => v.SalePrice >= minPrice.Value).ToList();
                }

                if (maxPrice.HasValue)
                {
                    vehicles = vehicles.Where(v => v.SalePrice <= maxPrice.Value).ToList();
                }

                if (!string.IsNullOrEmpty(condition))
                {
                    vehicles = vehicles.Where(v =>
                        v.Condition != null &&
                        v.Condition.Equals(condition, StringComparison.OrdinalIgnoreCase)
                    ).ToList();
                }

                // Kiểm tra quyền
                if (!IsAdminOrSaler())
                {
                    vehicles = vehicles.Where(v => v.StockQuantity > 0).ToList();
                }

                var result = vehicles.Select(v => new
                {
                    vehicleId = v.VehicleId,
                    title = v.Title,
                    model = v.Model,
                    condition = v.Condition,
                    manufactureYear = v.ManufactureYear,
                    salePrice = v.SalePrice,
                    status = v.Status,
                    stockQuantity = v.StockQuantity,
                    brand = v.Brand?.BrandName,
                    category = v.Category?.CategoryName,
                    storeName = v.Store?.StoreName,
                    primaryImage = v.VehicleImages?
                        .FirstOrDefault(img => img.IsPrimary == true)?.ImagePath
                        ?? v.VehicleImages?.FirstOrDefault()?.ImagePath
                        ?? "/images/default-vehicle.jpg"
                }).ToList();

                return Json(new { success = true, data = result, count = result.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tìm kiếm xe");
                return Json(new { success = false, message = ex.Message });
            }
        }

        // API: Lấy dropdown data (Categories, Brands, Stores)
        [HttpGet]
        public async Task<IActionResult> GetDropdownData()
        {
            try
            {
                var categories = await _xeMayService.GetAllCategoriesAsync();
                var brands = await _xeMayService.GetAllBrandsAsync();
                var stores = await _xeMayService.GetAllStoresAsync();

                return Json(new
                {
                    success = true,
                    categories = categories.Select(c => new { id = c.CategoryId, name = c.CategoryName }),
                    brands = brands.Select(b => new { id = b.BrandId, name = b.BrandName }),
                    stores = stores.Select(s => new { id = s.StoreId, name = s.StoreName })
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy dropdown data");
                return Json(new { success = false, message = ex.Message });
            }
        }

        // API: Lấy thống kê theo danh mục xe (Loại xe có lượt bán cao nhất)
        [HttpGet]
        public async Task<IActionResult> GetCategoryStats()
        {
            try
            {
                var vehicles = await _xeMayService.GetAllVehiclesAsync();

                var categoryStats = vehicles
                    .Where(v => v.Category != null)
                    .GroupBy(v => v.Category)
                    .Select(g => new
                    {
                        categoryId = g.Key.CategoryId,
                        categoryName = g.Key.CategoryName,
                        totalSold = g.Sum(v => v.SoldCount),
                        totalListings = g.Count(),
                        minPrice = g.Min(v => v.SalePrice ?? 0),
                        maxPrice = g.Max(v => v.SalePrice ?? 0),
                        sampleImage = g.FirstOrDefault()?.VehicleImages?
                            .FirstOrDefault(img => img.IsPrimary == true)?.ImagePath
                            ?? g.FirstOrDefault()?.VehicleImages?.FirstOrDefault()?.ImagePath
                            ?? "/images/default-vehicle.jpg"
                    })
                    .OrderByDescending(c => c.totalSold)
                    .Take(4)
                    .ToList();

                return Json(new { success = true, data = categoryStats });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy thống kê danh mục");
                return Json(new { success = false, message = ex.Message });
            }
        }

        // API: Lấy thống kê theo hãng xe (Hãng xe có xe bán cao nhất)
        [HttpGet]
        public async Task<IActionResult> GetBrandStats()
        {
            try
            {
                var vehicles = await _xeMayService.GetAllVehiclesAsync();

                var brandStats = vehicles
                    .Where(v => v.Brand != null)
                    .GroupBy(v => v.Brand)
                    .Select(g => new
                    {
                        brandId = g.Key.BrandId,
                        brandName = g.Key.BrandName,
                        brandLogo = g.Key.Logo ?? $"https://ui-avatars.com/api/?name={g.Key.BrandName}&background=random&size=80",
                        totalSold = g.Sum(v => v.SoldCount),
                        totalListings = g.Count(),
                        topModels = g
                            .GroupBy(v => v.Model)
                            .Select(m => new
                            {
                                modelName = m.Key ?? "Chưa rõ",
                                sales = m.Sum(v => v.SoldCount)
                            })
                            .OrderByDescending(m => m.sales)
                            .Take(3)
                            .ToList()
                    })
                    .OrderByDescending(b => b.totalSold)
                    .Take(4)
                    .ToList();

                return Json(new { success = true, data = brandStats });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy thống kê hãng xe");
                return Json(new { success = false, message = ex.Message });
            }
        }
    }



    // Request models
    public class BuyVehicleRequest
    {
        public int VehicleId { get; set; }
        
        private string? _customerAddress;
        public string? CustomerAddress 
        { 
            get => _customerAddress;
            set => _customerAddress = value?.Trim();
        }
        
        public decimal? DepositAmount { get; set; }
        public string PaymentMethod { get; set; } = "Tiền mặt";
        
        private string? _note;
        public string? Note 
        { 
            get => _note;
            set => _note = value?.Trim();
        }
    }

    public class RejectOrderRequest
    {
        public int OrderId { get; set; }
        public string? CancelReason { get; set; }
    }

    public class CategoryStatViewModel
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public int TotalSold { get; set; }
        public int TotalListings { get; set; }
        public decimal MinPrice { get; set; }
        public decimal MaxPrice { get; set; }
        public string SampleImage { get; set; }
        public string BadgeText { get; set; }
        public string BadgeIcon { get; set; }
        public string BadgeColor { get; set; }
    }

    public class BrandStatViewModel
    {
        public int BrandId { get; set; }
        public string BrandName { get; set; }
        public string BrandLogo { get; set; }
        public int TotalSold { get; set; }
        public int TotalListings { get; set; }
        public int Rank { get; set; }
        public List<TopModelViewModel> TopModels { get; set; }
    }

    public class TopModelViewModel
    {
        public string ModelName { get; set; }
        public int Sales { get; set; }
    }
}

using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Services;
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;
using Microsoft.AspNetCore.Mvc;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Controllers
{
    public class XeMayController : Controller
    {
        private readonly IXeMayService _xeMayService;

        public XeMayController(IXeMayService xeMayService)
        {
            _xeMayService = xeMayService;
        }

        // GET: Danh sách tất cả xe máy
        public async Task<IActionResult> Index()
        {
            var danhSachVehicle = await _xeMayService.GetAllVehiclesAsync();
            return View(danhSachVehicle);
        }

        // GET: Chi tiết xe máy theo ID
        public async Task<IActionResult> Details(int id)
        {
            var vehicle = await _xeMayService.GetVehicleByIdAsync(id);
            if (vehicle == null)
            {
                return NotFound();
            }

            // Tăng lượt xem
            await _xeMayService.IncreaseViewCountAsync(id);

            return View(vehicle);
        }

        // GET: Form tạo xe máy mới
        public IActionResult Create()
        {
            return View();
        }

        // POST: Tạo xe máy mới
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Vehicle vehicle)
        {
            if (ModelState.IsValid)
            {
                // Set giá trị mặc định
                vehicle.Status = "Available";
                vehicle.ViewCount = 0;
                vehicle.IsFeatured = false;
                vehicle.PostedAt = DateTime.Now;
                vehicle.UpdatedAt = DateTime.Now;

                var result = await _xeMayService.AddVehicleAsync(vehicle);
                if (result)
                {
                    TempData["SuccessMessage"] = "Thêm xe máy thành công!";
                    return RedirectToAction(nameof(Index));
                }
                ModelState.AddModelError("", "Không thể thêm xe máy. Vui lòng thử lại.");
            }
            return View(vehicle);
        }

        // GET: Form chỉnh sửa xe máy
        public async Task<IActionResult> Edit(int id)
        {
            var vehicle = await _xeMayService.GetVehicleByIdAsync(id);
            if (vehicle == null)
            {
                return NotFound();
            }
            return View(vehicle);
        }

        // POST: Cập nhật xe máy
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Vehicle vehicle)
        {
            if (id != vehicle.VehicleId)
            {
                return BadRequest();
            }

            if (ModelState.IsValid)
            {
                // Cập nhật thời gian
                vehicle.UpdatedAt = DateTime.Now;

                var result = await _xeMayService.UpdateVehicleAsync(vehicle);
                if (result)
                {
                    TempData["SuccessMessage"] = "Cập nhật xe máy thành công!";
                    return RedirectToAction(nameof(Index));
                }
                ModelState.AddModelError("", "Không thể cập nhật xe máy. Vui lòng thử lại.");
            }
            return View(vehicle);
        }

        // GET: Xác nhận xóa xe máy
        public async Task<IActionResult> Delete(int id)
        {
            var vehicle = await _xeMayService.GetVehicleByIdAsync(id);
            if (vehicle == null)
            {
                return NotFound();
            }
            return View(vehicle);
        }

        // POST: Xóa xe máy
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var result = await _xeMayService.DeleteVehicleAsync(id);
            if (result)
            {
                TempData["SuccessMessage"] = "Xóa xe máy thành công!";
            }
            else
            {
                TempData["ErrorMessage"] = "Không thể xóa xe máy. Vui lòng thử lại.";
            }
            return RedirectToAction(nameof(Index));
        }

        // GET: Tìm kiếm xe máy theo tiêu đề
        public async Task<IActionResult> Search(string keyword)
        {
            if (string.IsNullOrEmpty(keyword))
            {
                return RedirectToAction(nameof(Index));
            }

            var danhSachVehicle = await _xeMayService.SearchVehiclesByTitleAsync(keyword);
            ViewBag.SearchKeyword = keyword;
            return View("Index", danhSachVehicle);
        }

        // GET: Lọc xe máy theo khoảng giá
        public async Task<IActionResult> FilterByPrice(decimal? minPrice, decimal? maxPrice)
        {
            if (!minPrice.HasValue || !maxPrice.HasValue)
            {
                return RedirectToAction(nameof(Index));
            }

            var danhSachVehicle = await _xeMayService.GetVehiclesByPriceRangeAsync(minPrice.Value, maxPrice.Value);
            ViewBag.MinPrice = minPrice;
            ViewBag.MaxPrice = maxPrice;
            return View("Index", danhSachVehicle);
        }

        // GET: Lọc xe máy theo hãng
        public async Task<IActionResult> FilterByBrand(int brandId)
        {
            var danhSachVehicle = await _xeMayService.GetVehiclesByBrandAsync(brandId);
            return View("Index", danhSachVehicle);
        }

        // GET: Lọc xe máy theo danh mục
        public async Task<IActionResult> FilterByCategory(int categoryId)
        {
            var danhSachVehicle = await _xeMayService.GetVehiclesByCategoryAsync(categoryId);
            return View("Index", danhSachVehicle);
        }

        // GET: Lọc xe máy theo cửa hàng
        public async Task<IActionResult> FilterByStore(int storeId)
        {
            var danhSachVehicle = await _xeMayService.GetVehiclesByStoreAsync(storeId);
            return View("Index", danhSachVehicle);
        }

        // GET: Xe máy nổi bật
        public async Task<IActionResult> Featured()
        {
            var danhSachVehicle = await _xeMayService.GetFeaturedVehiclesAsync();
            return View("Index", danhSachVehicle);
        }

        // API: Lấy danh sách xe máy dạng JSON
        [HttpGet]
        public async Task<JsonResult> GetVehiclesJson()
        {
            var danhSachVehicle = await _xeMayService.GetAllVehiclesAsync();
            return Json(danhSachVehicle);
        }

        // API: Lấy xe máy theo ID dạng JSON
        [HttpGet]
        public async Task<JsonResult> GetVehicleByIdJson(int id)
        {
            var vehicle = await _xeMayService.GetVehicleByIdAsync(id);
            if (vehicle == null)
            {
                return Json(new { success = false, message = "Không tìm thấy xe máy" });
            }
            return Json(new { success = true, data = vehicle });
        }

        // API: Thay đổi trạng thái xe
        [HttpPost]
        public async Task<JsonResult> ChangeStatus(int id, string status)
        {
            try
            {
                var vehicle = await _xeMayService.GetVehicleByIdAsync(id);
                if (vehicle == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy xe máy" });
                }

                vehicle.Status = status;
                vehicle.UpdatedAt = DateTime.Now;

                var result = await _xeMayService.UpdateVehicleAsync(vehicle);

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

        // API: Đánh dấu xe nổi bật
        [HttpPost]
        public async Task<JsonResult> ToggleFeatured(int id)
        {
            try
            {
                var vehicle = await _xeMayService.GetVehicleByIdAsync(id);
                if (vehicle == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy xe máy" });
                }

                vehicle.IsFeatured = !vehicle.IsFeatured;
                vehicle.UpdatedAt = DateTime.Now;

                var result = await _xeMayService.UpdateVehicleAsync(vehicle);

                if (result)
                {
                    return Json(new { success = true, message = "Cập nhật thành công", isFeatured = vehicle.IsFeatured });
                }

                return Json(new { success = false, message = "Không thể cập nhật" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
    }
}

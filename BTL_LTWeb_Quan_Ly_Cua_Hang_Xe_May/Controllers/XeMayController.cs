using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Services;
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
            var danhSachXeMay = await _xeMayService.GetAllXeMayAsync();
            return View(danhSachXeMay);
        }

        // GET: Chi tiết xe máy theo ID
        public async Task<IActionResult> Details(int id)
        {
            var xeMay = await _xeMayService.GetXeMayByIdAsync(id);
            if (xeMay == null)
            {
                return NotFound();
            }
            return View(xeMay);
        }

        // GET: Form tạo xe máy mới
        public IActionResult Create()
        {
            return View();
        }

        // POST: Tạo xe máy mới
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(XeMay xeMay)
        {
            if (ModelState.IsValid)
            {
                var result = await _xeMayService.AddXeMayAsync(xeMay);
                if (result)
                {
                    TempData["SuccessMessage"] = "Thêm xe máy thành công!";
                    return RedirectToAction(nameof(Index));
                }
                ModelState.AddModelError("", "Không thể thêm xe máy. Vui lòng thử lại.");
            }
            return View(xeMay);
        }

        // GET: Form chỉnh sửa xe máy
        public async Task<IActionResult> Edit(int id)
        {
            var xeMay = await _xeMayService.GetXeMayByIdAsync(id);
            if (xeMay == null)
            {
                return NotFound();
            }
            return View(xeMay);
        }

        // POST: Cập nhật xe máy
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, XeMay xeMay)
        {
            if (id != xeMay.ID)
            {
                return BadRequest();
            }

            if (ModelState.IsValid)
            {
                var result = await _xeMayService.UpdateXeMayAsync(xeMay);
                if (result)
                {
                    TempData["SuccessMessage"] = "Cập nhật xe máy thành công!";
                    return RedirectToAction(nameof(Index));
                }
                ModelState.AddModelError("", "Không thể cập nhật xe máy. Vui lòng thử lại.");
            }
            return View(xeMay);
        }

        // GET: Xác nhận xóa xe máy
        public async Task<IActionResult> Delete(int id)
        {
            var xeMay = await _xeMayService.GetXeMayByIdAsync(id);
            if (xeMay == null)
            {
                return NotFound();
            }
            return View(xeMay);
        }

        // POST: Xóa xe máy
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var result = await _xeMayService.DeleteXeMayAsync(id);
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

        // GET: Tìm kiếm xe máy theo tên
        public async Task<IActionResult> Search(string tenXe)
        {
            if (string.IsNullOrEmpty(tenXe))
            {
                return RedirectToAction(nameof(Index));
            }

            var danhSachXeMay = await _xeMayService.SearchXeMayByNameAsync(tenXe);
            ViewBag.SearchKeyword = tenXe;
            return View("Index", danhSachXeMay);
        }

        // GET: Lọc xe máy theo khoảng giá
        public async Task<IActionResult> FilterByPrice(decimal? minPrice, decimal? maxPrice)
        {
            if (!minPrice.HasValue || !maxPrice.HasValue)
            {
                return RedirectToAction(nameof(Index));
            }

            var danhSachXeMay = await _xeMayService.GetXeMayByPriceRangeAsync(minPrice.Value, maxPrice.Value);
            ViewBag.MinPrice = minPrice;
            ViewBag.MaxPrice = maxPrice;
            return View("Index", danhSachXeMay);
        }

        // API: Lấy danh sách xe máy dạng JSON
        [HttpGet]
        public async Task<JsonResult> GetXeMayJson()
        {
            var danhSachXeMay = await _xeMayService.GetAllXeMayAsync();
            return Json(danhSachXeMay);
        }

        // API: Lấy xe máy theo ID dạng JSON
        [HttpGet]
        public async Task<JsonResult> GetXeMayByIdJson(int id)
        {
            var xeMay = await _xeMayService.GetXeMayByIdAsync(id);
            if (xeMay == null)
            {
                return Json(new { success = false, message = "Không tìm thấy xe máy" });
            }
            return Json(new { success = true, data = xeMay });
        }
    }
}


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

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}


using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models;
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.EF;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Diagnostics;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ApplicationDbContext _context;

        public HomeController(ILogger<HomeController> logger, ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
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

        public IActionResult MotorbikeOnline()
        {
            var lstXeMay = _context.XeMay.AsNoTracking().ToList();
            ViewData["lstXeMay"] = lstXeMay;
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

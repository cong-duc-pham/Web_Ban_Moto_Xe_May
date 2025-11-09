using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Services;
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.EF;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Đăng ký DbContext với Database First
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString),
    ServiceLifetime.Scoped);

// Đăng ký service Login
builder.Services.AddScoped<ILoginService, Login>();

// Đăng ký service XeMay
builder.Services.AddScoped<IXeMayService, XeMayService>();

// Thêm session
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});
// 1. Cấu hình dịch vụ Authentication (Xác thực)
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "WebQLCHXM.AuthCookie"; // Tên cookie
        options.ExpireTimeSpan = TimeSpan.FromDays(1); // Thời gian hết hạn
        options.SlidingExpiration = true; // Tự động gia hạn khi truy cập
        options.LoginPath = "/Account/Login"; // Trang chuyển đến nếu chưa đăng nhập
        options.LogoutPath = "/Account/Logout"; // Trang đăng xuất
        options.AccessDeniedPath = "/Home/AccessDenied"; // Trang chuyển đến nếu không có quyền
    });

// 2. Cấu hình dịch vụ Authorization (Phân quyền)
builder.Services.AddAuthorization(options =>
{
    // Tạo một "Chính sách" (Policy) tên là "AdminOnly"
    // Yêu cầu người dùng phải có Role (vai trò) là "Admin"
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireRole("Admin"));

    // Bạn có thể thêm các policy khác ở đây, ví dụ:
    // options.AddPolicy("SalerOnly", policy => 
    //    policy.RequireRole("Admin", "Saler")); // Admin hoặc Saler
});
var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseSession();

app.UseAuthentication();
app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

app.Run();

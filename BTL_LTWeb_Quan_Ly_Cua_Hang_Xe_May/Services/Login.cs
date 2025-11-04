using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.EF;
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Services
{
    public class Login : ILoginService
    {
        private readonly ApplicationDbContext _context;

        public Login(ApplicationDbContext context)
        {
            _context = context;
        }

        // Kiểm tra đăng nhập
        public async Task<TaiKhoan?> ValidateUserAsync(string tenDangNhap, string matKhau)
        {
            // Tìm tài khoản với tên đăng nhập và mật khẩu
            var taiKhoan = await _context.TaiKhoan
                .FirstOrDefaultAsync(t => t.TenDangNhap == tenDangNhap && t.MatKhau == matKhau);
            
            return taiKhoan;
        }

        // Đăng ký tài khoản mới
        public async Task<bool> RegisterUserAsync(TaiKhoan taiKhoan)
        {
            try
            {
                // Kiểm tra xem tên đăng nhập đã tồn tại chưa
                var existingUser = await _context.TaiKhoan
                    .FirstOrDefaultAsync(t => t.TenDangNhap == taiKhoan.TenDangNhap);

                if (existingUser != null)
                {
                    return false;
                }

                // Thêm tài khoản mới
                _context.TaiKhoan.Add(taiKhoan);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        // Lấy thông tin tài khoản theo tên đăng nhập
        public async Task<TaiKhoan?> GetUserByUsernameAsync(string tenDangNhap)
        {
            return await _context.TaiKhoan
                .FirstOrDefaultAsync(t => t.TenDangNhap == tenDangNhap);
        }

        // Lấy tất cả tài khoản
        public async Task<List<TaiKhoan>> GetAllUsersAsync()
        {
            try
            {
                return await _context.TaiKhoan.ToListAsync();
            }
            catch
            {
                return new List<TaiKhoan>();
            }
        }

        // Lấy tài khoản theo ID
        public async Task<TaiKhoan?> GetUserByIdAsync(int id)
        {
            try
            {
                return await _context.TaiKhoan.FindAsync(id);
            }
            catch
            {
                return null;
            }
        }

        // Cập nhật tài khoản
        public async Task<bool> UpdateUserAsync(TaiKhoan taiKhoan)
        {
            try
            {
                var existingUser = await _context.TaiKhoan.FindAsync(taiKhoan.ID);
                if (existingUser == null)
                {
                    return false;
                }

                existingUser.TenDangNhap = taiKhoan.TenDangNhap;
                existingUser.MatKhau = taiKhoan.MatKhau;
                existingUser.HovaTen = taiKhoan.HovaTen;
                existingUser.NgaySinh = taiKhoan.NgaySinh;
                existingUser.GioiTinh = taiKhoan.GioiTinh;
                existingUser.Email = taiKhoan.Email;
                existingUser.VaiTro = taiKhoan.VaiTro;

                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        // Xóa tài khoản
        public async Task<bool> DeleteUserAsync(int id)
        {
            try
            {
                var user = await _context.TaiKhoan.FindAsync(id);
                if (user == null)
                {
                    return false;
                }

                _context.TaiKhoan.Remove(user);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        // Lấy tài khoản theo vai trò
        public async Task<List<TaiKhoan>> GetUsersByRoleAsync(string vaiTro)
        {
            try
            {
                return await _context.TaiKhoan
                    .Where(t => t.VaiTro == vaiTro)
                    .ToListAsync();
            }
            catch
            {
                return new List<TaiKhoan>();
            }
        }
    }
}

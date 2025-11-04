using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Services
{
    public interface ILoginService
    {
        // Xác thực đăng nhập
        Task<TaiKhoan?> ValidateUserAsync(string tenDangNhap, string matKhau);
        
        // Đăng ký tài khoản mới
        Task<bool> RegisterUserAsync(TaiKhoan taiKhoan);
        
        // Lấy tài khoản theo tên đăng nhập
        Task<TaiKhoan?> GetUserByUsernameAsync(string tenDangNhap);
        
        // Lấy tất cả tài khoản
        Task<List<TaiKhoan>> GetAllUsersAsync();
        
        // Lấy tài khoản theo ID
        Task<TaiKhoan?> GetUserByIdAsync(int id);
        
        // Cập nhật tài khoản
        Task<bool> UpdateUserAsync(TaiKhoan taiKhoan);
        
        // Xóa tài khoản
        Task<bool> DeleteUserAsync(int id);
        
        // Lấy tài khoản theo vai trò
        Task<List<TaiKhoan>> GetUsersByRoleAsync(string vaiTro);
    }
}

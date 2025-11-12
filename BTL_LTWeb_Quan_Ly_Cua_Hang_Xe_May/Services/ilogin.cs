using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Services
{
    public interface ILoginService
    {
        // Lấy tài khoản theo email
        Task<User?> GetUserByEmailAsync(string email);
        // Xác thực đăng nhập bằng số điện thoại và mật khẩu
        Task<User?> ValidateUserAsync(string phoneNumber, string password);

        // Đăng ký tài khoản mới
        Task<bool> RegisterUserAsync(User user);

        // Lấy tài khoản theo số điện thoại
        Task<User?> GetUserByPhoneAsync(string phoneNumber);

        // Lấy tất cả tài khoản
        Task<List<User>> GetAllUsersAsync();

        // Lấy tài khoản theo ID
        Task<User?> GetUserByIdAsync(int id);

        // Cập nhật tài khoản
        Task<bool> UpdateUserAsync(User user);

        // Xóa tài khoản
        Task<bool> DeleteUserAsync(int id);

        // Lấy tài khoản theo RoleId
        Task<List<User>> GetUsersByRoleAsync(int roleId);

        // Lấy tài khoản theo tên vai trò
        Task<List<User>> GetUsersByRoleNameAsync(string roleName);

        // Thay đổi mật khẩu
        Task<bool> ChangePasswordAsync(int userId, string oldPassword, string newPassword);
    }
}

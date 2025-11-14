using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.EF;
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Services
{
    public class Login : ILoginService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<Login>? _logger;

        public Login(ApplicationDbContext context, ILogger<Login>? logger = null)
        {
            _context = context;
            _logger = logger;
        }

        // Lấy tài khoản theo email
        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        // Kiểm tra đăng nhập
        public async Task<User?> ValidateUserAsync(string phoneNumber, string password)
        {
            // Tìm tài khoản với số điện thoại và mật khẩu
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.PhoneNumber == phoneNumber && u.Password == password && u.Status == "Active");

            return user;
        }

        // Đăng ký tài khoản mới
        public async Task<bool> RegisterUserAsync(User user)
        {
            try
            {
                // Kiểm tra xem số điện thoại đã tồn tại chưa
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.PhoneNumber == user.PhoneNumber);

                if (existingUser != null)
                {
                    return false;
                }

                // Thêm tài khoản mới
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        // Lấy thông tin tài khoản theo số điện thoại
        public async Task<User?> GetUserByPhoneAsync(string phoneNumber)
        {
            return await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.PhoneNumber == phoneNumber);
        }

        // Lấy tất cả tài khoản
        public async Task<List<User>> GetAllUsersAsync()
        {
            try
            {
                return await _context.Users
                    .Include(u => u.Role)
                    .ToListAsync();
            }
            catch
            {
                return new List<User>();
            }
        }

        // Lấy tài khoản theo ID
        public async Task<User?> GetUserByIdAsync(int id)
        {
            try
            {
                return await _context.Users
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.UserId == id);
            }
            catch
            {
                return null;
            }
        }

        // Cập nhật tài khoản
        public async Task<bool> UpdateUserAsync(User user)
        {
            try
            {
                var existingUser = await _context.Users.FindAsync(user.UserId);
                if (existingUser == null)
                {
                    return false;
                }

                existingUser.FullName = user.FullName;
                existingUser.PhoneNumber = user.PhoneNumber;
                existingUser.Email = user.Email;
                existingUser.Password = user.Password;
                existingUser.RoleId = user.RoleId;
                existingUser.Status = user.Status;

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
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return false;
                }

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        // Lấy tài khoản theo vai trò (RoleId)
        public async Task<List<User>> GetUsersByRoleAsync(int roleId)
        {
            try
            {
                return await _context.Users
                    .Include(u => u.Role)
                    .Where(u => u.RoleId == roleId)
                    .ToListAsync();
            }
            catch
            {
                return new List<User>();
            }
        }

        // Lấy tài khoản theo tên vai trò
        public async Task<List<User>> GetUsersByRoleNameAsync(string roleName)
        {
            try
            {
                return await _context.Users
                    .Include(u => u.Role)
                    .Where(u => u.Role.RoleName == roleName)
                    .ToListAsync();
            }
            catch
            {
                return new List<User>();
            }
        }

        // Thay đổi mật khẩu
        public async Task<bool> ChangePasswordAsync(int userId, string oldPassword, string newPassword)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null || user.Password != oldPassword)
                {
                    return false;
                }

                user.Password = newPassword;
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }
        public async Task<List<Favorite>> GetFavoritesAsync(int userId)
        {
            try
            {
                return await _context.Favorites
                    .Where(f => f.UserId == userId)
                    .Include(f => f.Vehicle)
                        .ThenInclude(v => v.Brand)
                    .Include(f => f.Vehicle)
                        .ThenInclude(v => v.Category)
                    .Include(f => f.Vehicle)
                        .ThenInclude(v => v.Store)
                    .Include(f => f.Vehicle)
                        .ThenInclude(v => v.VehicleImages)
                    .OrderByDescending(f => f.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Lỗi khi lấy danh sách yêu thích của user {userId}");
                return new List<Favorite>();
            }
        }

        /// <summary>
        /// Xóa bài đăng khỏi yêu thích
        /// </summary>
        public async Task<bool> RemoveFavoriteAsync(int userId, int vehicleId)
        {
            try
            {
                var favorite = await _context.Favorites
                    .FirstOrDefaultAsync(f => f.UserId == userId && f.VehicleId == vehicleId);

                if (favorite == null)
                {
                    _logger?.LogWarning($"Không tìm thấy yêu thích của user {userId} cho xe {vehicleId}");
                    return false;
                }

                _context.Favorites.Remove(favorite);
                await _context.SaveChangesAsync();

                _logger?.LogInformation($"Xóa yêu thích của user {userId} cho xe {vehicleId} thành công");
                return true;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Lỗi khi xóa yêu thích của user {userId} cho xe {vehicleId}");
                return false;
            }
        }
    }
}

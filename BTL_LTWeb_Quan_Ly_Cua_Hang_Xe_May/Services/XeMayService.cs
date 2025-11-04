using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.EF;
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Services
{
    public class XeMayService : IXeMayService
    {
        private readonly ApplicationDbContext _context;

        public XeMayService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Lấy tất cả xe máy
        public async Task<List<XeMay>> GetAllXeMayAsync()
        {
            try
            {
                return await _context.XeMay.ToListAsync();
            }
            catch
            {
                return new List<XeMay>();
            }
        }

        // Lấy xe máy theo ID
        public async Task<XeMay?> GetXeMayByIdAsync(int id)
        {
            try
            {
                return await _context.XeMay.FindAsync(id);
            }
            catch
            {
                return null;
            }
        }

        // Thêm xe máy mới
        public async Task<bool> AddXeMayAsync(XeMay xeMay)
        {
            try
            {
                _context.XeMay.Add(xeMay);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        // Cập nhật xe máy
        public async Task<bool> UpdateXeMayAsync(XeMay xeMay)
        {
            try
            {
                var existingXeMay = await _context.XeMay.FindAsync(xeMay.ID);
                if (existingXeMay == null)
                {
                    return false;
                }

                existingXeMay.TenXe = xeMay.TenXe;
                existingXeMay.Gia = xeMay.Gia;
                existingXeMay.HinhAnh = xeMay.HinhAnh;
                existingXeMay.MoTa = xeMay.MoTa;

                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        // Xóa xe máy
        public async Task<bool> DeleteXeMayAsync(int id)
        {
            try
            {
                var xeMay = await _context.XeMay.FindAsync(id);
                if (xeMay == null)
                {
                    return false;
                }

                _context.XeMay.Remove(xeMay);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        // Tìm kiếm xe máy theo tên
        public async Task<List<XeMay>> SearchXeMayByNameAsync(string tenXe)
        {
            try
            {
                return await _context.XeMay
                    .Where(x => x.TenXe.Contains(tenXe))
                    .ToListAsync();
            }
            catch
            {
                return new List<XeMay>();
            }
        }

        // Lấy xe máy theo khoảng giá
        public async Task<List<XeMay>> GetXeMayByPriceRangeAsync(decimal minPrice, decimal maxPrice)
        {
            try
            {
                return await _context.XeMay
                    .Where(x => x.Gia >= minPrice && x.Gia <= maxPrice)
                    .ToListAsync();
            }
            catch
            {
                return new List<XeMay>();
            }
        }
    }
}

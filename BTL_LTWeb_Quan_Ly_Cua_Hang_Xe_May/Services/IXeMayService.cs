using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Services
{
    public interface IXeMayService
    {
        // Lấy tất cả xe máy
        Task<List<XeMay>> GetAllXeMayAsync();
        
        // Lấy xe máy theo ID
        Task<XeMay?> GetXeMayByIdAsync(int id);
        
        // Thêm xe máy mới
        Task<bool> AddXeMayAsync(XeMay xeMay);
        
        // Cập nhật xe máy
        Task<bool> UpdateXeMayAsync(XeMay xeMay);
        
        // Xóa xe máy
        Task<bool> DeleteXeMayAsync(int id);
        
        // Tìm kiếm xe máy theo tên
        Task<List<XeMay>> SearchXeMayByNameAsync(string tenXe);
        
        // Lấy xe máy theo khoảng giá
        Task<List<XeMay>> GetXeMayByPriceRangeAsync(decimal minPrice, decimal maxPrice);
    }
}

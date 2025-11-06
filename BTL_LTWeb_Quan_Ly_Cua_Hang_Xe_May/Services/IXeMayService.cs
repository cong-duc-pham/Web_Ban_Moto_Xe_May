using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Services
{
    public interface IXeMayService
    {
        // Lấy tất cả xe máy
        Task<List<Vehicle>> GetAllVehiclesAsync();

        // Lấy xe máy theo ID
        Task<Vehicle?> GetVehicleByIdAsync(int id);

        // Thêm xe máy mới
        Task<bool> AddVehicleAsync(Vehicle vehicle);

        // Cập nhật xe máy
        Task<bool> UpdateVehicleAsync(Vehicle vehicle);

        // Xóa xe máy
        Task<bool> DeleteVehicleAsync(int id);

        // Tìm kiếm xe máy theo tiêu đề
        Task<List<Vehicle>> SearchVehiclesByTitleAsync(string title);

        // Lấy xe máy theo khoảng giá
        Task<List<Vehicle>> GetVehiclesByPriceRangeAsync(decimal minPrice, decimal maxPrice);

        // Lấy xe máy theo hãng
        Task<List<Vehicle>> GetVehiclesByBrandAsync(int brandId);

        // Lấy xe máy theo danh mục
        Task<List<Vehicle>> GetVehiclesByCategoryAsync(int categoryId);

        // Lấy xe máy theo cửa hàng
        Task<List<Vehicle>> GetVehiclesByStoreAsync(int storeId);

        // Lấy xe máy nổi bật
        Task<List<Vehicle>> GetFeaturedVehiclesAsync();

        // Lấy xe máy theo trạng thái
        Task<List<Vehicle>> GetVehiclesByStatusAsync(string status);

        // Tăng lượt xem
        Task<bool> IncreaseViewCountAsync(int vehicleId);

        // Lấy xe máy mới nhất
        Task<List<Vehicle>> GetLatestVehiclesAsync(int count);

        // Lấy xe máy được xem nhiều nhất
        Task<List<Vehicle>> GetMostViewedVehiclesAsync(int count);

        // Lấy danh sách Store
        Task<List<Store>> GetAllStoresAsync();

        // Lấy danh sách Category
        Task<List<VehicleCategory>> GetAllCategoriesAsync();

        // Lấy danh sách Brand
        Task<List<Brand>> GetAllBrandsAsync();

        // Thêm hình ảnh xe máy
        Task<bool> AddVehicleImageAsync(VehicleImage vehicleImage);

        // Quản lý đơn hàng
        Task<OrderInfo?> CreateOrderAsync(OrderInfo order);
        Task<List<OrderInfo>> GetOrdersByCustomerIdAsync(int customerId);
        Task<List<OrderInfo>> GetAllOrdersAsync();
        Task<bool> UpdateOrderStatusAsync(int orderId, string status, string? cancelReason = null);
        Task<bool> UpdateVehicleStatusAsync(int vehicleId, string status);
    }
}


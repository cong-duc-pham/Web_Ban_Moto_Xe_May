using Microsoft.EntityFrameworkCore;
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.EF;
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;

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
        public async Task<List<Vehicle>> GetAllVehiclesAsync()
        {
            try
            {
                return await _context.Vehicles
                    .Include(v => v.Brand)
                    .Include(v => v.Category)
                    .Include(v => v.Store)
                    .Include(v => v.VehicleImages)
                    .OrderByDescending(v => v.PostedAt)
                    .ToListAsync();
            }
            catch
            {
                return new List<Vehicle>();
            }
        }

        // Lấy xe máy theo ID
        public async Task<Vehicle?> GetVehicleByIdAsync(int id)
        {
            try
            {
                return await _context.Vehicles
                    .Include(v => v.Brand)
                    .Include(v => v.Category)
                    .Include(v => v.Store)
                    .Include(v => v.VehicleImages)
                    .FirstOrDefaultAsync(v => v.VehicleId == id);
            }
            catch
            {
                return null;
            }
        }

        // Thêm xe máy mới
        public async Task<bool> AddVehicleAsync(Vehicle vehicle)
        {
            try
            {
                Console.WriteLine($"[XeMayService] Thêm vehicle: Title={vehicle.Title}, SalePrice={vehicle.SalePrice}");
                Console.WriteLine($"[XeMayService] StoreId={vehicle.StoreId}, CategoryId={vehicle.CategoryId}, BrandId={vehicle.BrandId}");
                
                _context.Vehicles.Add(vehicle);
                
                Console.WriteLine("[XeMayService] Đang gọi SaveChangesAsync...");
                var result = await _context.SaveChangesAsync();
                
                Console.WriteLine($"[XeMayService] SaveChanges trả về: {result} dòng");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[XeMayService] ❌ LỖI: {ex.Message}");
                Console.WriteLine($"[XeMayService] StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[XeMayService] InnerException: {ex.InnerException.Message}");
                }
                return false;
            }
        }

        // Cập nhật xe máy
        public async Task<bool> UpdateVehicleAsync(Vehicle vehicle)
        {
            try
            {
                Console.WriteLine($"[XeMayService] Bắt đầu cập nhật xe ID={vehicle.VehicleId}");
                Console.WriteLine($"[XeMayService] Title={vehicle.Title}, SalePrice={vehicle.SalePrice}");
                Console.WriteLine($"[XeMayService] StoreId={vehicle.StoreId}, CategoryId={vehicle.CategoryId}, BrandId={vehicle.BrandId}");
                
                // Lấy xe hiện tại từ database (CÓ tracking để update)
                var existingVehicle = await _context.Vehicles
                    .FirstOrDefaultAsync(v => v.VehicleId == vehicle.VehicleId);
                
                if (existingVehicle == null)
                {
                    Console.WriteLine($"[XeMayService] ❌ Không tìm thấy xe ID={vehicle.VehicleId}");
                    return false;
                }

                Console.WriteLine($"[XeMayService] Tìm thấy xe: {existingVehicle.Title}");

                // Cập nhật từng thuộc tính trên entity đã được track
                existingVehicle.StoreId = vehicle.StoreId;
                existingVehicle.CategoryId = vehicle.CategoryId;
                existingVehicle.BrandId = vehicle.BrandId;
                existingVehicle.Title = vehicle.Title;
                existingVehicle.Model = vehicle.Model;
                existingVehicle.Condition = vehicle.Condition;
                existingVehicle.ManufactureYear = vehicle.ManufactureYear;
                existingVehicle.SalePrice = vehicle.SalePrice;
                existingVehicle.OriginalPrice = vehicle.OriginalPrice;
                existingVehicle.EngineCapacity = vehicle.EngineCapacity;
                existingVehicle.Color = vehicle.Color;
                existingVehicle.Description = vehicle.Description;
                existingVehicle.Status = vehicle.Status;
                existingVehicle.UpdatedAt = DateTime.Now;
                // PostedAt, ViewCount giữ nguyên

                Console.WriteLine($"[XeMayService] Đang lưu vào database...");
                var changes = await _context.SaveChangesAsync();
                Console.WriteLine($"[XeMayService] ✅ Cập nhật thành công! Số thay đổi: {changes}");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[XeMayService] ❌ LỖI khi cập nhật xe: {ex.Message}");
                Console.WriteLine($"[XeMayService] Type: {ex.GetType().Name}");
                
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[XeMayService] InnerException: {ex.InnerException.Message}");
                    Console.WriteLine($"[XeMayService] InnerException Type: {ex.InnerException.GetType().Name}");
                }
                
                return false;
            }
        }

        // Xóa xe máy
        public async Task<bool> DeleteVehicleAsync(int id)
        {
            try
            {
                var vehicle = await _context.Vehicles.FindAsync(id);
                if (vehicle == null)
                {
                    return false;
                }

                _context.Vehicles.Remove(vehicle);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        // Tìm kiếm xe máy theo tiêu đề
        public async Task<List<Vehicle>> SearchVehiclesByTitleAsync(string title)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(title))
                {
                    return await GetAllVehiclesAsync();
                }

                return await _context.Vehicles
                    .Include(v => v.Brand)
                    .Include(v => v.Category)
                    .Include(v => v.Store)
                    .Include(v => v.VehicleImages)
                    .Where(v => v.Title.Contains(title) || v.Model.Contains(title))
                    .OrderByDescending(v => v.PostedAt)
                    .ToListAsync();
            }
            catch
            {
                return new List<Vehicle>();
            }
        }

        // Lấy xe máy theo khoảng giá
        public async Task<List<Vehicle>> GetVehiclesByPriceRangeAsync(decimal minPrice, decimal maxPrice)
        {
            try
            {
                return await _context.Vehicles
                    .Include(v => v.Brand)
                    .Include(v => v.Category)
                    .Include(v => v.Store)
                    .Include(v => v.VehicleImages)
                    .Where(v => v.SalePrice >= minPrice && v.SalePrice <= maxPrice)
                    .OrderBy(v => v.SalePrice)
                    .ToListAsync();
            }
            catch
            {
                return new List<Vehicle>();
            }
        }

        // Lấy xe máy theo hãng
        public async Task<List<Vehicle>> GetVehiclesByBrandAsync(int brandId)
        {
            try
            {
                return await _context.Vehicles
                    .Include(v => v.Brand)
                    .Include(v => v.Category)
                    .Include(v => v.Store)
                    .Include(v => v.VehicleImages)
                    .Where(v => v.BrandId == brandId)
                    .OrderByDescending(v => v.PostedAt)
                    .ToListAsync();
            }
            catch
            {
                return new List<Vehicle>();
            }
        }

        // Lấy xe máy theo danh mục
        public async Task<List<Vehicle>> GetVehiclesByCategoryAsync(int categoryId)
        {
            try
            {
                return await _context.Vehicles
                    .Include(v => v.Brand)
                    .Include(v => v.Category)
                    .Include(v => v.Store)
                    .Include(v => v.VehicleImages)
                    .Where(v => v.CategoryId == categoryId)
                    .OrderByDescending(v => v.PostedAt)
                    .ToListAsync();
            }
            catch
            {
                return new List<Vehicle>();
            }
        }

        // Lấy xe máy theo cửa hàng
        public async Task<List<Vehicle>> GetVehiclesByStoreAsync(int storeId)
        {
            try
            {
                return await _context.Vehicles
                    .Include(v => v.Brand)
                    .Include(v => v.Category)
                    .Include(v => v.Store)
                    .Include(v => v.VehicleImages)
                    .Where(v => v.StoreId == storeId)
                    .OrderByDescending(v => v.PostedAt)
                    .ToListAsync();
            }
            catch
            {
                return new List<Vehicle>();
            }
        }

        // Lấy xe máy nổi bật
        public async Task<List<Vehicle>> GetFeaturedVehiclesAsync()
        {
            try
            {
                return await _context.Vehicles
                    .Include(v => v.Brand)
                    .Include(v => v.Category)
                    .Include(v => v.Store)
                    .Include(v => v.VehicleImages)
                    .Where(v => v.IsFeatured == true && v.Status == "Available")
                    .OrderByDescending(v => v.PostedAt)
                    .ToListAsync();
            }
            catch
            {
                return new List<Vehicle>();
            }
        }

        // Lấy xe máy theo trạng thái
        public async Task<List<Vehicle>> GetVehiclesByStatusAsync(string status)
        {
            try
            {
                return await _context.Vehicles
                    .Include(v => v.Brand)
                    .Include(v => v.Category)
                    .Include(v => v.Store)
                    .Include(v => v.VehicleImages)
                    .Where(v => v.Status == status)
                    .OrderByDescending(v => v.PostedAt)
                    .ToListAsync();
            }
            catch
            {
                return new List<Vehicle>();
            }
        }

        // Tăng lượt xem
        public async Task<bool> IncreaseViewCountAsync(int vehicleId)
        {
            try
            {
                var vehicle = await _context.Vehicles.FindAsync(vehicleId);
                if (vehicle == null)
                {
                    return false;
                }

                vehicle.ViewCount++;
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        // Lấy xe máy mới nhất
        public async Task<List<Vehicle>> GetLatestVehiclesAsync(int count)
        {
            try
            {
                return await _context.Vehicles
                    .Include(v => v.Brand)
                    .Include(v => v.Category)
                    .Include(v => v.Store)
                    .Include(v => v.VehicleImages)
                    .Where(v => v.Status == "Available")
                    .OrderByDescending(v => v.PostedAt)
                    .Take(count)
                    .ToListAsync();
            }
            catch
            {
                return new List<Vehicle>();
            }
        }

        // Lấy xe máy được xem nhiều nhất
        public async Task<List<Vehicle>> GetMostViewedVehiclesAsync(int count)
        {
            try
            {
                return await _context.Vehicles
                    .Include(v => v.Brand)
                    .Include(v => v.Category)
                    .Include(v => v.Store)
                    .Include(v => v.VehicleImages)
                    .Where(v => v.Status == "Available")
                    .OrderByDescending(v => v.ViewCount)
                    .Take(count)
                    .ToListAsync();
            }
            catch
            {
                return new List<Vehicle>();
            }
        }

        // Lấy danh sách Store
        public async Task<List<Store>> GetAllStoresAsync()
        {
            try
            {
                Console.WriteLine("[XeMayService] Đang lấy danh sách Store...");
                // Tạm thời lấy tất cả Store để debug
                var stores = await _context.Stores
                    .OrderBy(s => s.StoreName)
                    .ToListAsync();
                Console.WriteLine($"[XeMayService] Đã lấy được {stores.Count} Store");
                
                // Log chi tiết từng store
                foreach (var store in stores)
                {
                    Console.WriteLine($"  - Store: Id={store.StoreId}, Name={store.StoreName}, Status={store.Status}");
                }
                
                return stores;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[XeMayService] LỖI khi lấy Store: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"[XeMayService] Chi tiết: {ex.InnerException.Message}");
                return new List<Store>();
            }
        }

        // Lấy danh sách Category
        public async Task<List<VehicleCategory>> GetAllCategoriesAsync()
        {
            try
            {
                Console.WriteLine("[XeMayService] Đang lấy danh sách VehicleCategory...");
                var categories = await _context.VehicleCategories
                    .OrderBy(c => c.CategoryName)
                    .ToListAsync();
                Console.WriteLine($"[XeMayService] Đã lấy được {categories.Count} Category");
                return categories;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[XeMayService] LỖI khi lấy Category: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"[XeMayService] Chi tiết: {ex.InnerException.Message}");
                return new List<VehicleCategory>();
            }
        }

        // Lấy danh sách Brand
        public async Task<List<Brand>> GetAllBrandsAsync()
        {
            try
            {
                Console.WriteLine("[XeMayService] Đang lấy danh sách Brand...");
                var brands = await _context.Brands
                    .OrderBy(b => b.BrandName)
                    .ToListAsync();
                Console.WriteLine($"[XeMayService] Đã lấy được {brands.Count} Brand");
                return brands;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[XeMayService] LỖI khi lấy Brand: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"[XeMayService] Chi tiết: {ex.InnerException.Message}");
                return new List<Brand>();
            }
        }

        // Thêm hình ảnh xe máy
        public async Task<bool> AddVehicleImageAsync(VehicleImage vehicleImage)
        {
            try
            {
                Console.WriteLine($"[XeMayService] Thêm ảnh cho VehicleId={vehicleImage.VehicleId}, Path={vehicleImage.ImagePath}");
                await _context.VehicleImages.AddAsync(vehicleImage);
                await _context.SaveChangesAsync();
                Console.WriteLine($"[XeMayService] ✅ Đã thêm ảnh thành công");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[XeMayService] ❌ LỖI khi thêm ảnh: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"[XeMayService] Chi tiết: {ex.InnerException.Message}");
                return false;
            }
        }
    }
}


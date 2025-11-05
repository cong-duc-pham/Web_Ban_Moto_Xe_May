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
                _context.Vehicles.Add(vehicle);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        // Cập nhật xe máy
        public async Task<bool> UpdateVehicleAsync(Vehicle vehicle)
        {
            try
            {
                var existingVehicle = await _context.Vehicles.FindAsync(vehicle.VehicleId);
                if (existingVehicle == null)
                {
                    return false;
                }

                // Cập nhật các thuộc tính
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
                existingVehicle.Odometer = vehicle.Odometer;
                existingVehicle.BodyType = vehicle.BodyType;
                existingVehicle.Transmission = vehicle.Transmission;
                existingVehicle.FuelType = vehicle.FuelType;
                existingVehicle.Seats = vehicle.Seats;
                existingVehicle.Origin = vehicle.Origin;
                existingVehicle.Description = vehicle.Description;
                existingVehicle.LicensePlate = vehicle.LicensePlate;
                existingVehicle.FirstOwner = vehicle.FirstOwner;
                existingVehicle.Status = vehicle.Status;
                existingVehicle.IsFeatured = vehicle.IsFeatured;
                existingVehicle.UpdatedAt = DateTime.Now;

                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
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
    }
}

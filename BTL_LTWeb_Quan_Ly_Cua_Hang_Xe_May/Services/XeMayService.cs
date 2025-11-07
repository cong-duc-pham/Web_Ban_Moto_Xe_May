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

        // ===== QUẢN LÝ ĐỚN HÀNG =====
        
        // Tạo đơn hàng mới
        public async Task<OrderInfo?> CreateOrderAsync(OrderInfo order)
        {
            try
            {
                Console.WriteLine($"[XeMayService] Tạo đơn hàng cho xe ID={order.VehicleId}, Khách hàng ID={order.CustomerId}");
                Console.WriteLine($"[XeMayService] OrderNumber: {order.OrderNumber}");
                Console.WriteLine($"[XeMayService] CustomerName: '{order.CustomerName}'");
                Console.WriteLine($"[XeMayService] CustomerPhone: '{order.CustomerPhone}'");
                Console.WriteLine($"[XeMayService] CustomerAddress: '{order.CustomerAddress}'");
                Console.WriteLine($"[XeMayService] VehiclePrice: {order.VehiclePrice}");
                Console.WriteLine($"[XeMayService] DepositAmount: {order.DepositAmount}");
                Console.WriteLine($"[XeMayService] TotalPrice: {order.TotalPrice}");
                Console.WriteLine($"[XeMayService] PaymentMethod: '{order.PaymentMethod}'");
                Console.WriteLine($"[XeMayService] StoreId: {order.StoreId}");
                
                // Kiểm tra StoreId, CustomerId, VehicleId tồn tại trong database
                var storeExists = await _context.Stores.AnyAsync(s => s.StoreId == order.StoreId);
                if (!storeExists)
                {
                    Console.WriteLine($"[XeMayService] ❌ Store ID {order.StoreId} không tồn tại!");
                    return null;
                }
                
                var customerExists = await _context.Users.AnyAsync(u => u.UserId == order.CustomerId);
                if (!customerExists)
                {
                    Console.WriteLine($"[XeMayService] ❌ Customer ID {order.CustomerId} không tồn tại!");
                    return null;
                }
                
                var vehicleExists = await _context.Vehicles.AnyAsync(v => v.VehicleId == order.VehicleId);
                if (!vehicleExists)
                {
                    Console.WriteLine($"[XeMayService] ❌ Vehicle ID {order.VehicleId} không tồn tại!");
                    return null;
                }
                
                Console.WriteLine($"[XeMayService] ✓ Đã validate: Store, Customer, Vehicle tồn tại");
                
                // Thêm đơn hàng
                Console.WriteLine($"[XeMayService] Đang gọi AddAsync...");
                await _context.OrderInfos.AddAsync(order);
                
                Console.WriteLine($"[XeMayService] Đang gọi SaveChangesAsync...");
                await _context.SaveChangesAsync();
                
                Console.WriteLine($"[XeMayService] ✓ Đơn hàng đã tạo: OrderId={order.OrderId}");
                return order;
            }
            catch (DbUpdateException dbEx)
            {
                Console.WriteLine($"[XeMayService] ❌ DATABASE UPDATE ERROR: {dbEx.Message}");
                Console.WriteLine($"[XeMayService] Exception Type: {dbEx.GetType().Name}");
                
                if (dbEx.InnerException != null)
                {
                    Console.WriteLine($"[XeMayService] 🔴 InnerException: {dbEx.InnerException.Message}");
                    
                    // Chi tiết lỗi SQL Server
                    if (dbEx.InnerException.InnerException != null)
                    {
                        Console.WriteLine($"[XeMayService] 🔴🔴 SQL Error: {dbEx.InnerException.InnerException.Message}");
                    }
                }
                
                // Log thông tin đơn hàng để debug
                Console.WriteLine($"[XeMayService] 📋 Order Data:");
                Console.WriteLine($"  - OrderNumber: {order.OrderNumber}");
                Console.WriteLine($"  - CustomerId: {order.CustomerId}");
                Console.WriteLine($"  - VehicleId: {order.VehicleId}");
                Console.WriteLine($"  - StoreId: {order.StoreId}");
                Console.WriteLine($"  - CustomerName: '{order.CustomerName}'");
                Console.WriteLine($"  - CustomerPhone: '{order.CustomerPhone}'");
                Console.WriteLine($"  - CustomerAddress: '{order.CustomerAddress}'");
                Console.WriteLine($"  - VehiclePrice: {order.VehiclePrice}");
                Console.WriteLine($"  - DepositAmount: {order.DepositAmount}");
                Console.WriteLine($"  - TotalPrice: {order.TotalPrice}");
                Console.WriteLine($"  - PaymentMethod: '{order.PaymentMethod}'");
                Console.WriteLine($"  - PaymentStatus: '{order.PaymentStatus}'");
                Console.WriteLine($"  - OrderStatus: '{order.OrderStatus}'");
                Console.WriteLine($"  - Note: '{order.Note}'");
                
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[XeMayService] ❌ GENERAL ERROR: {ex.Message}");
                Console.WriteLine($"[XeMayService] StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[XeMayService] InnerException: {ex.InnerException.Message}");
                }
                return null;
            }
        }

        // Lấy đơn hàng theo khách hàng
        public async Task<List<OrderInfo>> GetOrdersByCustomerIdAsync(int customerId)
        {
            try
            {
                return await _context.OrderInfos
                    .Include(o => o.Vehicle)
                        .ThenInclude(v => v.VehicleImages)
                    .Include(o => o.Vehicle.Brand)
                    .Include(o => o.Store)
                    .Where(o => o.CustomerId == customerId)
                    .OrderByDescending(o => o.OrderedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[XeMayService] ❌ LỖI khi lấy đơn hàng: {ex.Message}");
                return new List<OrderInfo>();
            }
        }

        // Lấy đơn hàng theo ID
        public async Task<OrderInfo?> GetOrderByIdAsync(int orderId)
        {
            try
            {
                return await _context.OrderInfos
                    .Include(o => o.Vehicle)
                        .ThenInclude(v => v.VehicleImages)
                    .Include(o => o.Vehicle.Brand)
                    .Include(o => o.Store)
                    .Include(o => o.Customer)
                    .FirstOrDefaultAsync(o => o.OrderId == orderId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[XeMayService] ❌ LỖI khi lấy đơn hàng ID {orderId}: {ex.Message}");
                return null;
            }
        }

        // Lấy tất cả đơn hàng (cho admin)
        public async Task<List<OrderInfo>> GetAllOrdersAsync()
        {
            try
            {
                return await _context.OrderInfos
                    .Include(o => o.Vehicle)
                        .ThenInclude(v => v.VehicleImages)
                    .Include(o => o.Vehicle.Brand)
                    .Include(o => o.Store)
                    .Include(o => o.Customer)
                    .OrderByDescending(o => o.OrderedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[XeMayService] ❌ LỖI khi lấy tất cả đơn hàng: {ex.Message}");
                return new List<OrderInfo>();
            }
        }

        // Cập nhật trạng thái đơn hàng
        public async Task<bool> UpdateOrderStatusAsync(int orderId, string status, string? cancelReason = null)
        {
            try
            {
                Console.WriteLine($"[XeMayService] Cập nhật trạng thái đơn hàng ID={orderId} sang '{status}'");
                
                var order = await _context.OrderInfos
                    .Include(o => o.Vehicle)
                    .FirstOrDefaultAsync(o => o.OrderId == orderId);
                
                if (order == null)
                {
                    Console.WriteLine($"[XeMayService] ❌ Không tìm thấy đơn hàng ID={orderId}");
                    return false;
                }

                order.OrderStatus = status;
                
                if (status == "Approved" || status == "Đã xác nhận")
                {
                    order.CompletedAt = DateTime.Now;
                    // Xe vẫn ở trạng thái "Pending" để ẩn khỏi trang web
                    // Không thay đổi trạng thái xe
                }
                else if (status == "Rejected" || status == "Từ chối")
                {
                    order.CancelReason = cancelReason;
                    // Đưa xe trở lại trạng thái "Available" (đang bán)
                    if (order.Vehicle != null)
                    {
                        order.Vehicle.Status = "Available";
                    }
                }

                await _context.SaveChangesAsync();
                Console.WriteLine($"[XeMayService] ✓ Đã cập nhật trạng thái đơn hàng");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[XeMayService] ❌ LỖI khi cập nhật trạng thái đơn hàng: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"[XeMayService] Chi tiết: {ex.InnerException.Message}");
                return false;
            }
        }

        // Cập nhật trạng thái xe
        public async Task<bool> UpdateVehicleStatusAsync(int vehicleId, string status)
        {
            try
            {
                Console.WriteLine($"[XeMayService] Cập nhật trạng thái xe ID={vehicleId} sang '{status}'");
                
                var vehicle = await _context.Vehicles.FindAsync(vehicleId);
                if (vehicle == null)
                {
                    Console.WriteLine($"[XeMayService] ❌ Không tìm thấy xe ID={vehicleId}");
                    return false;
                }

                vehicle.Status = status;
                vehicle.UpdatedAt = DateTime.Now;
                
                await _context.SaveChangesAsync();
                Console.WriteLine($"[XeMayService] ✓ Đã cập nhật trạng thái xe");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[XeMayService] ❌ LỖI khi cập nhật trạng thái xe: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"[XeMayService] Chi tiết: {ex.InnerException.Message}");
                return false;
            }
        }
    }
}


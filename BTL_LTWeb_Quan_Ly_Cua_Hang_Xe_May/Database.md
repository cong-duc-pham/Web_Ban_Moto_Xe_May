# 📦 HƯỚNG DẪN THÊM DỮ LIỆU MẪU VÀO DATABASE

## 🎯 Mục đích
Thêm dữ liệu mẫu cho:
- **Store** (Cửa hàng): 5 cửa hàng
- **VehicleCategory** (Danh mục): 8 loại xe
- **Brand** (Thương hiệu): 12 hãng xe
- **Vehicle** (Xe): 12 xe mẫu
- **VehicleImage** (Hình ảnh): 20 ảnh

---

## 📋 BƯỚC 1: Chạy File SQL

### Cách 1: Sử dụng SQL Server Management Studio (SSMS)

1. Mở **SQL Server Management Studio**
2. Kết nối đến server: `localhost,1434`
3. Login: `Admin_QLCHXM` / Password: `123`
4. Click **New Query**
5. Chạy **LẦN LƯỢT** các file:

#### a) Thêm Store, Category, Brand:
```sql
-- Mở và chạy file: insert_sample_data.sql
```
- Click **Open** → Chọn file `insert_sample_data.sql`
- Click **Execute** (F5)
- Xem kết quả ở Messages tab

#### b) Thêm Vehicle và Images:
```sql
-- Mở và chạy file: insert_vehicle_data.sql
```
- Click **Open** → Chọn file `insert_vehicle_data.sql`
- Click **Execute** (F5)
- Xem danh sách xe vừa thêm

---

### Cách 2: Sử dụng Azure Data Studio

1. Mở **Azure Data Studio**
2. Connect đến server
3. Click **New Query**
4. Copy nội dung từ `insert_sample_data.sql` → Paste → **Run**
5. Copy nội dung từ `insert_vehicle_data.sql` → Paste → **Run**

---

### Cách 3: Sử dụng Command Line (sqlcmd)

```powershell
# Di chuyển đến thư mục project
cd f:\BTL_LTWeb\BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May

# Chạy file 1: Thêm Store, Category, Brand
sqlcmd -S localhost,1434 -U Admin_QLCHXM -P 123 -d QLCHXM -i insert_sample_data.sql

# Chạy file 2: Thêm Vehicle và Images
sqlcmd -S localhost,1434 -U Admin_QLCHXM -P 123 -d QLCHXM -i insert_vehicle_data.sql
```

---

## ✅ BƯỚC 2: Kiểm Tra Dữ Liệu

Chạy các query sau để kiểm tra:

```sql
USE QLCHXM;

-- Kiểm tra Store
SELECT StoreId, StoreName, Phone FROM Store;

-- Kiểm tra Category
SELECT CategoryId, CategoryName FROM VehicleCategory;

-- Kiểm tra Brand
SELECT BrandId, BrandName, Country FROM Brand;

-- Kiểm tra Vehicle
SELECT 
    V.VehicleId,
    V.Title,
    B.BrandName,
    V.SalePrice,
    COUNT(VI.ImageId) AS TotalImages
FROM Vehicle V
LEFT JOIN Brand B ON V.BrandId = B.BrandId
LEFT JOIN VehicleImage VI ON V.VehicleId = VI.VehicleId
GROUP BY V.VehicleId, V.Title, B.BrandName, V.SalePrice;
```

**Kết quả mong đợi:**
- ✅ 5 Store
- ✅ 8 VehicleCategory
- ✅ 12 Brand
- ✅ 12 Vehicle
- ✅ 20 VehicleImage

---

## 🚀 BƯỚC 3: Chạy Ứng Dụng

Sau khi đã có dữ liệu:

```powershell
cd f:\BTL_LTWeb\BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May
dotnet run
```

Vào trang: `http://localhost:5000/Home/MotorbikeOnline`

**Bạn sẽ thấy:**
- 12 xe hiển thị
- Chia thành 4 hàng, mỗi hàng 3 xe
- Có hình ảnh, tên xe, giá, mô tả

---

## 🔧 BƯỚC 4: Test Thêm Xe Mới

1. **Đăng nhập** với tài khoản Admin (RoleId = 1)
2. Vào trang **MotorbikeOnline**
3. Click nút **"Thêm xe mới"**
4. Điền thông tin:
   - **Tên xe**: Honda SH 160i
   - **Giá**: 80000000
   - **Mô tả**: Xe tay ga cao cấp

5. Click **Lưu**

**Giờ sẽ KHÔNG còn lỗi "Không thể thêm xe"** vì:
- ✅ StoreId = 1 đã có trong database
- ✅ CategoryId = 1 đã có trong database
- ✅ BrandId = 1 đã có trong database

---

## 📊 Dữ Liệu Mẫu

### 🏪 Store (Cửa hàng)
| ID | Tên | Địa chỉ |
|----|-----|---------|
| 1 | VinFast Official Store | Long Biên, Hà Nội |
| 2 | Honda Đại Lý Chính Hãng | Hoàng Mai, Hà Nội |
| 3 | Yamaha Việt Nam | Đống Đa, Hà Nội |
| 4 | Piaggio Vespa Showroom | Cầu Giấy, Hà Nội |
| 5 | SYM Việt Nam | Cầu Giấy, Hà Nội |

### 📦 VehicleCategory (Danh mục)
| ID | Tên |
|----|-----|
| 1 | Xe ga |
| 2 | Xe số |
| 3 | Xe côn tay |
| 4 | Xe điện |
| 5 | Xe PKL |
| 6 | Xe mô tô |
| 7 | Xe tay ga cao cấp |
| 8 | Xe cub |

### 🏭 Brand (Thương hiệu)
| ID | Tên | Quốc gia |
|----|-----|----------|
| 1 | Honda | Japan |
| 2 | Yamaha | Japan |
| 3 | VinFast | Vietnam |
| 4 | SYM | Taiwan |
| 5 | Piaggio | Italy |
| 6 | Vespa | Italy |
| 7 | Suzuki | Japan |
| 8 | Kawasaki | Japan |
| 9 | Ducati | Italy |
| 10 | BMW | Germany |
| 11 | Harley-Davidson | USA |
| 12 | KTM | Austria |

### 🏍️ Vehicle (Xe mẫu)
1. VinFast Klara S - 39,900,000đ
2. VinFast Evo200 - 45,900,000đ
3. Honda Air Blade 160 - 55,000,000đ
4. Honda Wave Alpha - 19,500,000đ
5. Honda Winner X - 48,000,000đ
6. Yamaha NVX 155 - 54,900,000đ
7. Yamaha Exciter 155 - 48,500,000đ
8. Yamaha Janus - 31,500,000đ
9. SYM Star SR 170 - 48,000,000đ
10. SYM Attila Venus - 33,500,000đ
11. Vespa Primavera 125 - 84,000,000đ
12. Vespa Sprint 150 - 96,000,000đ

---

## ⚠️ Lưu Ý Quan Trọng

### 1. Hình Ảnh Xe
File SQL tạo reference đến hình ảnh trong thư mục `/images/vehicles/`.
Hiện tại **chưa có file ảnh thật**, nên:
- Ảnh sẽ hiển thị placeholder: `https://via.placeholder.com/400x300?text=No+Image`
- Hoặc bạn có thể thêm ảnh thật vào: `wwwroot/images/vehicles/`

### 2. Nếu Chạy Lại Script
Nếu bạn chạy lại script và bị lỗi **"Violation of PRIMARY KEY constraint"**:

```sql
-- Xóa dữ liệu cũ trước
DELETE FROM VehicleImage;
DELETE FROM Vehicle;
DELETE FROM Store;
DELETE FROM VehicleCategory;
DELETE FROM Brand;

-- Reset Identity
DBCC CHECKIDENT ('VehicleImage', RESEED, 0);
DBCC CHECKIDENT ('Vehicle', RESEED, 0);
DBCC CHECKIDENT ('Store', RESEED, 0);
DBCC CHECKIDENT ('VehicleCategory', RESEED, 0);
DBCC CHECKIDENT ('Brand', RESEED, 0);

-- Sau đó chạy lại insert_sample_data.sql và insert_vehicle_data.sql
```

---

## 🎉 Hoàn Thành!

Sau khi chạy xong:
- ✅ Database có đầy đủ dữ liệu mẫu
- ✅ Có thể test chức năng xem danh sách xe
- ✅ Có thể test chức năng thêm/sửa/xóa xe
- ✅ Không còn lỗi Foreign Key khi thêm xe mới

**Bây giờ hãy chạy ứng dụng và test thôi! 🚀**

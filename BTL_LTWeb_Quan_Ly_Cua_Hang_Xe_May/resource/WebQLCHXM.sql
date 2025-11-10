-- Bảng Vai trò

create database QLCHXM;
use QLCHXM;
CREATE TABLE Role (
    RoleId INT PRIMARY KEY IDENTITY(1,1),               -- Khóa chính (mã vai trò)
    RoleName NVARCHAR(50) NOT NULL,                     -- Tên vai trò
    Description NVARCHAR(255)                           -- Mô tả vai trò
);

-- Bảng Người dùng
CREATE TABLE [User] (
    UserId INT PRIMARY KEY IDENTITY(1,1),               -- Khóa chính (mã người dùng)
    FullName NVARCHAR(100) NOT NULL,                    -- Họ và tên
    PhoneNumber VARCHAR(15) UNIQUE NOT NULL,            -- Số điện thoại
    Email VARCHAR(100),                                 -- Địa chỉ email
    Password VARCHAR(255) NOT NULL,                     -- Mật khẩu
    RoleId INT NOT NULL,                                -- Khóa ngoại tới bảng Role
    Status VARCHAR(20) NOT NULL DEFAULT 'Active',       -- Trạng thái hoạt động
    FOREIGN KEY (RoleId) REFERENCES Role(RoleId)
);

-- Bảng Cửa hàng
CREATE TABLE Store (
    StoreId INT PRIMARY KEY IDENTITY(1,1),              -- Khóa chính (mã cửa hàng)
    OwnerId INT NOT NULL,                               -- Mã người chủ (khóa ngoại User)
    StoreName NVARCHAR(150) NOT NULL,                   -- Tên cửa hàng
    PhoneNumber VARCHAR(15) NOT NULL,                   -- Số điện thoại cửa hàng
    Address NVARCHAR(255) NOT NULL,                     -- Địa chỉ
    Description NVARCHAR(1000),                         -- Mô tả cửa hàng
    Image VARCHAR(255),                                 -- Ảnh đại diện cửa hàng
    Rating DECIMAL(2,1) DEFAULT 0,                      -- Điểm đánh giá trung bình
    TotalRating INT DEFAULT 0,                          -- Tổng số đánh giá
    Status VARCHAR(20) NOT NULL DEFAULT 'Active',       -- Trạng thái
    CreatedAt DATETIME2 DEFAULT GETDATE(),              -- Ngày tạo cửa hàng
    FOREIGN KEY (OwnerId) REFERENCES [User](UserId)
);

-- Bảng Danh mục xe
CREATE TABLE VehicleCategory (
    CategoryId INT PRIMARY KEY IDENTITY(1,1),           -- Mã danh mục xe
    CategoryName NVARCHAR(50) NOT NULL,                 -- Tên danh mục xe
    CategoryCode VARCHAR(20) UNIQUE NOT NULL,           -- Mã code danh mục
    DisplayOrder INT DEFAULT 0                          -- Thứ tự hiển thị
);

-- Bảng Hãng xe
CREATE TABLE Brand (
    BrandId INT PRIMARY KEY IDENTITY(1,1),              -- Mã hãng xe
    BrandName NVARCHAR(50) NOT NULL,                    -- Tên hãng
    BrandCode VARCHAR(20) UNIQUE NOT NULL,              -- Mã hãng code
    Logo VARCHAR(255)                                   -- Logo hãng xe
);

-- Bảng Xe
CREATE TABLE Vehicle (
    VehicleId INT PRIMARY KEY IDENTITY(1,1),            -- Mã xe
    StoreId INT,                                        -- Khóa ngoại cửa hàng
    CategoryId INT,                                     -- Khóa ngoại danh mục xe
    BrandId INT,                                        -- Khóa ngoại hãng xe
    Title NVARCHAR(255),                                -- Tiêu đề xe
    Model NVARCHAR(100),                                -- Dòng xe/model
    Condition VARCHAR(20),                              -- Tình trạng
    ManufactureYear INT,                                -- Năm sản xuất
    SalePrice DECIMAL(15,0),                            -- Giá bán
    OriginalPrice DECIMAL(15,0),                        -- Giá gốc
    EngineCapacity INT,                                 -- Dung tích xi lanh
    Color NVARCHAR(50),                                 -- Màu sắc
    Odometer INT,                                       -- Số km đã đi
    BodyType NVARCHAR(50),                              -- Kiểu dáng
    Transmission VARCHAR(20),                           -- Hộp số
    FuelType VARCHAR(20),                               -- Nhiên liệu
    Seats INT,                                          -- Số ghế ngồi
    Origin NVARCHAR(50),                                -- Xuất xứ
    Description NVARCHAR(MAX),                          -- Mô tả
    LicensePlate VARCHAR(20),                           -- Biển số xe
    FirstOwner BIT DEFAULT 1,                           -- Chủ đầu tiên
    Status VARCHAR(20) NOT NULL DEFAULT 'Available',    -- Trạng thái xe
    IsFeatured BIT DEFAULT 0,                           -- Xe nổi bật
    ViewCount INT DEFAULT 0,                            -- Lượt xem
    PostedAt DATETIME2 DEFAULT GETDATE(),               -- Ngày đăng
    UpdatedAt DATETIME2 DEFAULT GETDATE(),              -- Ngày cập nhật
	StockQuantity INT NOT NULL DEFAULT 0,				-- Số lượng xe
	SoldCount INT,										-- Số lượng xe đã bán 
    FOREIGN KEY (StoreId) REFERENCES Store(StoreId) ON DELETE CASCADE,
    FOREIGN KEY (CategoryId) REFERENCES VehicleCategory(CategoryId),
    FOREIGN KEY (BrandId) REFERENCES Brand(BrandId)
);


drop table Vehicle;
-- Bảng Hình ảnh xe
CREATE TABLE VehicleImage (
    ImageId INT PRIMARY KEY IDENTITY(1,1),              -- Mã hình ảnh xe
    VehicleId INT NOT NULL,                             -- Khóa ngoại xe
    ImagePath VARCHAR(255) NOT NULL,                    -- Đường dẫn ảnh
    IsPrimary BIT DEFAULT 0,                            -- Ảnh chính
    DisplayOrder INT DEFAULT 0,                         -- Thứ tự hiển thị
    FOREIGN KEY (VehicleId) REFERENCES Vehicle(VehicleId) ON DELETE CASCADE
);

drop table VehicleImage;
-- Bảng Yêu thích
CREATE TABLE Favorite (
    FavoriteId INT PRIMARY KEY IDENTITY(1,1),           -- Mã yêu thích
    UserId INT NOT NULL,                                -- Khóa ngoại người dùng
    VehicleId INT NOT NULL,                             -- Khóa ngoại xe
    CreatedAt DATETIME2 DEFAULT GETDATE(),              -- Ngày tạo
    FOREIGN KEY (UserId) REFERENCES [User](UserId) ON DELETE CASCADE,
    FOREIGN KEY (VehicleId) REFERENCES Vehicle(VehicleId) ON DELETE CASCADE,
    CONSTRAINT UQ_Favorite_UserVehicle UNIQUE (UserId, VehicleId)
);

drop table Favorite;
-- Bảng Thông tin đơn hàng
CREATE TABLE OrderInfo (
    OrderId INT PRIMARY KEY IDENTITY(1,1),              -- Mã đơn hàng
    OrderNumber VARCHAR(20) UNIQUE NOT NULL,            -- Mã đơn
    VehicleId INT NOT NULL,                             -- Khóa ngoại xe
    StoreId INT NOT NULL,                               -- Khóa ngoại cửa hàng
    CustomerId INT NOT NULL,                            -- Khóa ngoại người mua
    CustomerName NVARCHAR(100) NOT NULL,                -- Tên khách hàng
    CustomerPhone VARCHAR(15) NOT NULL,                 -- Số điện thoại khách
    CustomerAddress NVARCHAR(255),                      -- Địa chỉ khách
    VehiclePrice DECIMAL(15,0) NOT NULL,                -- Giá trị xe
    DepositAmount DECIMAL(15,0) DEFAULT 0,              -- Số tiền đặt cọc
    TotalPrice DECIMAL(15,0) NOT NULL,                  -- Tổng tiền đơn
    PaymentMethod VARCHAR(20) NOT NULL DEFAULT 'Cash',  -- Phương thức thanh toán
    PaymentStatus VARCHAR(20) NOT NULL DEFAULT 'Unpaid', -- Trạng thái thanh toán
    OrderStatus VARCHAR(20) NOT NULL DEFAULT 'Pending', -- Trạng thái đơn hàng
    Note NVARCHAR(500),                                 -- Ghi chú
    CancelReason NVARCHAR(500),                         -- Lý do hủy
    OrderedAt DATETIME2 DEFAULT GETDATE(),              -- Ngày đặt đơn
    CompletedAt DATETIME2 NULL,                         -- Ngày hoàn thành
    FOREIGN KEY (VehicleId) REFERENCES Vehicle(VehicleId),
    FOREIGN KEY (StoreId) REFERENCES Store(StoreId),
    FOREIGN KEY (CustomerId) REFERENCES [User](UserId)
);

drop table OrderInfo;
-- Bảng Trả góp
CREATE TABLE Installment (
    InstallmentId INT PRIMARY KEY IDENTITY(1,1),        -- Mã trả góp
    OrderId INT NOT NULL,                               -- Khóa ngoại đơn hàng
    BankName NVARCHAR(100),                             -- Ngân hàng
    LoanAmount DECIMAL(15,0) NOT NULL,                  -- Số tiền vay
    DownPayment DECIMAL(15,0) NOT NULL,                 -- Trả trước
    InterestRate DECIMAL(5,2),                          -- Lãi suất
    Months INT NOT NULL,                                -- Thời gian trả góp (tháng)
    MonthlyPayment DECIMAL(15,0) NOT NULL,              -- Số tiền trả hàng tháng
    Status VARCHAR(20) NOT NULL DEFAULT 'Pending',      -- Trạng thái trả góp
    CreatedAt DATETIME2 DEFAULT GETDATE(),              -- Ngày tạo
    FOREIGN KEY (OrderId) REFERENCES OrderInfo(OrderId) ON DELETE CASCADE
);

drop table Installment;
-- Bảng Đánh giá
CREATE TABLE Review (
    ReviewId INT PRIMARY KEY IDENTITY(1,1),             -- Mã đánh giá
    StoreId INT NOT NULL,                               -- Khóa ngoại cửa hàng
    UserId INT NOT NULL,                                -- Khóa ngoại người dùng
    OrderId INT,                                        -- Khóa ngoại đơn hàng
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5), -- Số sao
    Content NVARCHAR(1000),                             -- Nội dung đánh giá
    ReviewedAt DATETIME2 DEFAULT GETDATE(),             -- Thời gian đánh giá
    FOREIGN KEY (StoreId) REFERENCES Store(StoreId) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES [User](UserId) ON DELETE CASCADE,
    FOREIGN KEY (OrderId) REFERENCES OrderInfo(OrderId)
);

drop table Review;
-- Bảng Tin tức
CREATE TABLE News (
    NewsId INT PRIMARY KEY IDENTITY(1,1),               -- Mã tin tức
    AuthorId INT NOT NULL,                              -- Khóa ngoại người đăng
    Title NVARCHAR(255) NOT NULL,                       -- Tiêu đề
    Summary NVARCHAR(500),                              -- Tóm tắt
    Content NVARCHAR(MAX) NOT NULL,                     -- Nội dung
    Thumbnail VARCHAR(255),                             -- Ảnh đại diện
    NewsType VARCHAR(20) NOT NULL DEFAULT 'News',       -- Loại tin
    ViewCount INT DEFAULT 0,                            -- Lượt xem
    Status VARCHAR(20) NOT NULL DEFAULT 'Draft',        -- Trạng thái
    PublishedAt DATETIME2 NULL,                         -- Ngày xuất bản
    CreatedAt DATETIME2 DEFAULT GETDATE(),              -- Ngày tạo
    FOREIGN KEY (AuthorId) REFERENCES [User](UserId)
);

-- Bảng Banner
CREATE TABLE Banner (
    BannerId INT PRIMARY KEY IDENTITY(1,1),             -- Mã banner
    Title NVARCHAR(150),                                -- Tiêu đề
    ImagePath VARCHAR(255) NOT NULL,                    -- Đường dẫn ảnh
    Link VARCHAR(255),                                  -- Link
    Position VARCHAR(20) NOT NULL DEFAULT 'Homepage',   -- Vị trí hiển thị
    DisplayOrder INT DEFAULT 0,                         -- Thứ tự hiển thị
    StartDate DATETIME2,                                -- Ngày bắt đầu
    EndDate DATETIME2,                                  -- Ngày kết thúc
    IsActive BIT DEFAULT 1,                             -- Trạng thái hoạt động
    CreatedAt DATETIME2 DEFAULT GETDATE()               -- Ngày tạo
);

-- Bảng Thông báo
CREATE TABLE Notification (
    NotificationId INT PRIMARY KEY IDENTITY(1,1),       -- Mã thông báo
    UserId INT NOT NULL,                                -- Khóa ngoại người nhận
    NotificationType VARCHAR(20) NOT NULL DEFAULT 'System', -- Loại thông báo
    Title NVARCHAR(150) NOT NULL,                       -- Tiêu đề
    Content NVARCHAR(500),                              -- Nội dung
    Link VARCHAR(255),                                  -- Link kèm
    IsRead BIT DEFAULT 0,                               -- Đã đọc/chưa
    CreatedAt DATETIME2 DEFAULT GETDATE(),              -- Ngày tạo
    FOREIGN KEY (UserId) REFERENCES [User](UserId) ON DELETE CASCADE
);

-- Tạo bảng Question
CREATE TABLE Question (
    QuestionId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Title NVARCHAR(500) NOT NULL,
    Content NVARCHAR(2000) NOT NULL,
    VehicleId INT NULL,
    Category NVARCHAR(50) NOT NULL DEFAULT 'General',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Open',
    ViewCount INT NOT NULL DEFAULT 0,
    AnswerCount INT NOT NULL DEFAULT 0,
    CONSTRAINT FK_Question_User FOREIGN KEY (UserId) REFERENCES [User](UserId) ON DELETE CASCADE,
    CONSTRAINT FK_Question_Vehicle FOREIGN KEY (VehicleId) REFERENCES Vehicle(VehicleId) ON DELETE SET NULL
);

drop table Question;
-- Tạo bảng Answer
CREATE TABLE Answer (
    AnswerId INT IDENTITY(1,1) PRIMARY KEY,
    QuestionId INT NOT NULL,
    UserId INT NOT NULL,
    Content NVARCHAR(2000) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,
    IsAccepted BIT NOT NULL DEFAULT 0,
    LikeCount INT NOT NULL DEFAULT 0,
    CONSTRAINT FK_Answer_Question FOREIGN KEY (QuestionId) REFERENCES Question(QuestionId) ON DELETE CASCADE,
    CONSTRAINT FK_Answer_User FOREIGN KEY (UserId) REFERENCES [User](UserId) ON DELETE NO ACTION
);

drop table Answer;
-- Tạo index
CREATE INDEX IX_Question_UserId ON Question(UserId);
CREATE INDEX IX_Question_VehicleId ON Question(VehicleId);
CREATE INDEX IX_Question_Category ON Question(Category);
CREATE INDEX IX_Question_Status ON Question(Status);
CREATE INDEX IX_Question_CreatedAt ON Question(CreatedAt DESC);
CREATE INDEX IX_Answer_QuestionId ON Answer(QuestionId);
CREATE INDEX IX_Answer_UserId ON Answer(UserId);

-- ============================================
-- DỮ LIỆU MẪU DỰA TRÊN 2 BẢNG USER & ROLE
-- ============================================

-- 1. Bảng Role

-- 3. Bảng Store
INSERT INTO Store (OwnerId, StoreName, PhoneNumber, Address, Description, Image, Rating, TotalRating, Status)
VALUES
(1, N'Cửa hàng xe máy Thành Đạt', '0333125332', N'TP. Thủ Đức, TP.HCM',
 N'Chuyên mua bán, ký gửi xe máy.', 'store1.jpg', 4.5, 10, 'Active');

-- 4. Bảng Brand
INSERT INTO Brand (BrandName, BrandCode)
VALUES
(N'Honda', 'HONDA'),
(N'Yamaha', 'YAMAHA'),
(N'Suzuki', 'SUZUKI');

-- 5. Bảng VehicleCategory
INSERT INTO VehicleCategory (CategoryName, CategoryCode, DisplayOrder)
VALUES
(N'Xe số', 'XESO', 1),
(N'Xe tay ga', 'XETAYGA', 2),
(N'Xe côn tay', 'XECONTAY', 3),
(N'Xe điện', 'XE DIEN', 4),
(N'Xe mô tô', 'XEMOTO', 5);

-- 6. Bảng Vehicle
INSERT INTO Vehicle (
    StoreId, CategoryId, BrandId, Title, Model, [Condition],
    ManufactureYear, SalePrice, OriginalPrice, EngineCapacity,
    Color, Odometer, BodyType, Transmission, FuelType, Seats,
    Origin, Description, LicensePlate, FirstOwner, Status,
    IsFeatured, ViewCount, StockQuantity, SoldCount
)
VALUES
(1, 2, 1,
 N'Honda Vario 160 2023', N'Vario 160', 'Used',
 2023, 42000000, 50000000, 160,
 N'Đen đỏ', 3500, N'Tay ga', 'AT', 'Xang', 2,
 N'Việt Nam', N'Xe nhà chạy kỹ, bảo dưỡng đầy đủ.',
 '59X3-123.45', 1, 'Available', 1, 25, 3, 0);

-- 7. Bảng VehicleImage
INSERT INTO VehicleImage (VehicleId, ImagePath, IsPrimary, DisplayOrder)
VALUES
(1, 'images/vario160-1.jpg', 1, 1),
(1, 'images/vario160-2.jpg', 0, 2);

-- 8. Bảng Favorite
INSERT INTO Favorite (UserId, VehicleId)
VALUES (1, 1);

-- 9. Bảng OrderInfo
INSERT INTO OrderInfo (
    OrderNumber, VehicleId, StoreId, CustomerId,
    CustomerName, CustomerPhone, CustomerAddress,
    VehiclePrice, DepositAmount, TotalPrice,
    PaymentMethod, PaymentStatus, OrderStatus, Note
)
VALUES
('ORD0001', 1, 1, 1,
 N'Than Dat', '0333125332', N'TP. Thủ Đức, TP.HCM',
 42000000, 5000000, 42000000,
 'Cash', 'Unpaid', 'Pending', N'Mua xe Vario 160');

-- 10. Bảng Installment
INSERT INTO Installment (
    OrderId, BankName, LoanAmount, DownPayment,
    InterestRate, Months, MonthlyPayment, Status
)
VALUES
(1, N'VPBank', 37000000, 5000000, 12.5, 12, 3500000, 'Pending');

-- 11. Bảng Review
INSERT INTO Review (StoreId, UserId, OrderId, Rating, Content)
VALUES
(1, 1, 1, 5, N'Cửa hàng phục vụ tốt, giao xe đúng mô tả.');

-- 12. Bảng News
INSERT INTO News (
    AuthorId, Title, Summary, Content, Thumbnail,
    NewsType, ViewCount, Status, PublishedAt
)
VALUES
(1,
 N'Khai trương cửa hàng xe máy Thành Đạt',
 N'Giảm giá nhiều mẫu xe trong tháng này.',
 N'Nội dung bài viết về khai trương và ưu đãi...',
 'news1.jpg',
 'News',
 0,
 'Published',
 GETDATE());

-- 13. Bảng Banner
INSERT INTO Banner (Title, ImagePath, Link, Position, DisplayOrder, IsActive)
VALUES
(N'Khuyến mãi tháng 11', 'banners/km-thang11.jpg',
 'https://example.com/khuyen-mai', 'Homepage', 1, 1);

-- 14. Bảng Notification
INSERT INTO Notification (UserId, NotificationType, Title, Content, Link)
VALUES
(1, 'System', N'Thông báo đơn hàng', N'Đơn hàng ORD0001 của bạn đang chờ xử lý.', NULL);

-- 15. Bảng Question
INSERT INTO Question (
    UserId, Title, Content, VehicleId, Category
)
VALUES
(1,
 N'Hỏi về giấy tờ xe Vario 160',
 N'Xe đã sang tên chính chủ chưa và còn bảo hành không?',
 1,
 N'Vehicle');

-- 16. Bảng Answer
INSERT INTO Answer (QuestionId, UserId, Content, IsAccepted)
VALUES
(1, 1, N'Xe chính chủ, còn bảo hành 6 tháng tại cửa hàng.', 1);
-- ==============================================
-- XÓA DỮ LIỆU THEO THỨ TỰ AN TOÀN
-- ==============================================
PRINT N'🗑️ Đang xóa dữ liệu cũ...';

-- Xóa bảng phụ thuộc nhiều khóa ngoại (từ ngoài vào trong)
IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Answer')
    DELETE FROM Answer;

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Question')
    DELETE FROM Question;

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Notification')
    DELETE FROM Notification;

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Banner')
    DELETE FROM Banner;

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'News')
    DELETE FROM News;

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Review')
    DELETE FROM Review;

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Installment')
    DELETE FROM Installment;

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'OrderInfo')
    DELETE FROM OrderInfo;

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Favorite')
    DELETE FROM Favorite;

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'VehicleImage')
    DELETE FROM VehicleImage;

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Vehicle')
    DELETE FROM Vehicle;

-- Xóa bảng danh mục (không phụ thuộc Vehicle)
IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'VehicleCategory')
    DELETE FROM VehicleCategory;

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Brand')
    DELETE FROM Brand;

-- Xóa bảng Store (phụ thuộc User)
IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Store')
    DELETE FROM Store;

-- Xóa bảng User và Role (cuối cùng)
IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'User')
    DELETE FROM [User];

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Role')
    DELETE FROM Role;

	DBCC CHECKIDENT ('Role', RESEED, 0);
DBCC CHECKIDENT ('[User]', RESEED, 0);
DBCC CHECKIDENT ('Store', RESEED, 0);
DBCC CHECKIDENT ('Brand', RESEED, 0);
DBCC CHECKIDENT ('VehicleCategory', RESEED, 0);
DBCC CHECKIDENT ('Vehicle', RESEED, 0);
DBCC CHECKIDENT ('VehicleImage', RESEED, 0);
DBCC CHECKIDENT ('Favorite', RESEED, 0);
DBCC CHECKIDENT ('OrderInfo', RESEED, 0);
DBCC CHECKIDENT ('Installment', RESEED, 0);
DBCC CHECKIDENT ('Review', RESEED, 0);
DBCC CHECKIDENT ('News', RESEED, 0);
DBCC CHECKIDENT ('Banner', RESEED, 0);
DBCC CHECKIDENT ('Notification', RESEED, 0);
DBCC CHECKIDENT ('Question', RESEED, 0);
DBCC CHECKIDENT ('Answer', RESEED, 0);
-- ============================================
-- SCRIPT INSERT DỮ LIỆU MẪU - QLCHXM
-- ============================================
USE QLCHXM;
GO

-- 1. Role
INSERT INTO Role (RoleName, Description)
VALUES 
    (N'User', N'Người dùng thông thường'),
    (N'Admin', N'Quản trị viên hệ thống'),
    (N'StoreOwner', N'Chủ cửa hàng');

-- 2. User
INSERT INTO [User] (FullName, PhoneNumber, Email, Password, RoleId, Status)
VALUES 
    (N'ThanDat', '0333125332', 'duccong@duccong.com', '123', 1, 'Active'),
    (N'Nguyễn Văn A', '0901234567', 'nguyenvana@example.com', 'password123', 1, 'Active'),
    (N'Trần Thị B', '0907654321', 'tranthib@example.com', 'password456', 1, 'Active'),
    (N'Admin System', '0912345678', 'admin@qlchxm.com', 'admin123', 2, 'Active'),
    (N'Lê Văn C', '0938765432', 'levanc@example.com', 'password789', 1, 'Active');

-- 3. Store
INSERT INTO Store (OwnerId, StoreName, PhoneNumber, Address, Description, Image, Rating, TotalRating, Status)
VALUES 
    (1, N'Cửa hàng xe máy Thành Đạt', '0333125332', N'123 Đường Võ Văn Ngân, TP. Thủ Đức, TP.HCM',
     N'Chuyên mua bán, ký gửi xe máy các loại. Cam kết xe đẹp, giá tốt, bảo hành chu đáo.', 
     'store1.jpg', 4.5, 10, 'Active'),
    (1, N'Xe Máy Hoàng Gia', '0901111111', N'456 Đường Lê Văn Việt, Quận 9, TP.HCM',
     N'Chuyên xe tay ga cao cấp, xe nhập khẩu chính hãng. Hỗ trợ trả góp 0%.', 
     'store2.jpg', 4.7, 15, 'Active');

-- 4. Brand
INSERT INTO Brand (BrandName, BrandCode, Logo)
VALUES 
    (N'Honda', 'HONDA', 'honda_logo.png'),
    (N'Yamaha', 'YAMAHA', 'yamaha_logo.png'),
    (N'Suzuki', 'SUZUKI', 'suzuki_logo.png'),
    (N'SYM', 'SYM', 'sym_logo.png'),
    (N'Piaggio', 'PIAGGIO', 'piaggio_logo.png');

-- 5. VehicleCategory
INSERT INTO VehicleCategory (CategoryName, CategoryCode, DisplayOrder)
VALUES 
    (N'Xe số', 'XESO', 1),
    (N'Xe tay ga', 'XETAYGA', 2),
    (N'Xe côn tay', 'XECONTAY', 3),
    (N'Xe điện', 'XEDIEN', 4),
    (N'Xe mô tô', 'XEMOTO', 5);

-- 6. Vehicle
INSERT INTO Vehicle (
    StoreId, CategoryId, BrandId, Title, Model, [Condition],
    ManufactureYear, SalePrice, OriginalPrice, EngineCapacity,
    Color, Odometer, BodyType, Transmission, FuelType, Seats,
    Origin, Description, LicensePlate, FirstOwner, Status,
    IsFeatured, ViewCount, StockQuantity, SoldCount
)
VALUES 
    (1, 2, 1, N'Honda Vario 160 2023 - Như Mới', N'Vario 160', 'Used',
     2023, 42000000, 50000000, 160, N'Đen đỏ', 3500, N'Tay ga', 'AT', 'Xang', 2,
     N'Việt Nam', N'Xe nhà chạy kỹ, bảo dưỡng định kỳ đầy đủ tại hãng. Phanh ABS, smartkey, còn BH 6 tháng.',
     '59X3-123.45', 1, 'Available', 1, 25, 3, 0),
    
    (1, 2, 2, N'Yamaha NVX 155 2022 - Đẹp Long Lanh', N'NVX 155', 'Used',
     2022, 38000000, 52000000, 155, N'Trắng xanh', 8500, N'Tay ga thể thao', 'AT', 'Xang', 2,
     N'Việt Nam', N'Xe zin nguyên bản, phanh đĩa trước sau, đồng hồ điện tử đa năng.',
     '59Y4-567.89', 1, 'Available', 1, 18, 2, 0),
    
    (1, 1, 1, N'Honda Wave Alpha 110cc 2021', N'Wave Alpha', 'Used',
     2021, 18000000, 20000000, 110, N'Đỏ đen', 12000, N'Xe số', 'MT', 'Xang', 2,
     N'Việt Nam', N'Xe tiết kiệm xăng, phù hợp đi làm, đi học. Máy móc hoạt động tốt.',
     '59C5-111.22', 0, 'Available', 0, 30, 5, 1),
    
    (1, 3, 3, N'Suzuki Raider 150 Fi 2020', N'Raider 150', 'Used',
     2020, 32000000, 40000000, 150, N'Đen nhám', 15000, N'Côn tay', 'MT', 'Xang', 2,
     N'Việt Nam', N'Xe côn tay đầm chắc, phù hợp chạy đường dài. Máy phun xăng điện tử.',
     '59D6-222.33', 1, 'Available', 0, 12, 2, 0),
    
    (2, 2, 1, N'Honda SH Mode 125 2023 - Cao Cấp', N'SH Mode 125', 'New',
     2023, 56000000, 56000000, 125, N'Trắng', 0, N'Tay ga', 'AT', 'Xang', 2,
     N'Việt Nam', N'Xe mới 100%, smartkey, phanh ABS, full option. Bảo hành chính hãng 3 năm.',
     NULL, 1, 'Available', 1, 45, 4, 0),
    
    (1, 3, 2, N'Yamaha Exciter 155 VVA 2021', N'Exciter 155', 'Used',
     2021, 48000000, 55000000, 155, N'Xanh GP', 6800, N'Côn tay thể thao', 'MT', 'Xang', 2,
     N'Việt Nam', N'Xe thể thao, động cơ VVA mạnh mẽ. Phanh ABS 2 kênh an toàn.',
     '59E7-333.44', 1, 'Available', 1, 22, 2, 0);

-- 7. VehicleImage
INSERT INTO VehicleImage (VehicleId, ImagePath, IsPrimary, DisplayOrder)
VALUES 
    (1, 'images/vehicles/vario160-1.jpg', 1, 1),
    (1, 'images/vehicles/vario160-2.jpg', 0, 2),
    (1, 'images/vehicles/vario160-3.jpg', 0, 3),
    (2, 'images/vehicles/nvx155-1.jpg', 1, 1),
    (2, 'images/vehicles/nvx155-2.jpg', 0, 2),
    (3, 'images/vehicles/wave-1.jpg', 1, 1),
    (3, 'images/vehicles/wave-2.jpg', 0, 2),
    (4, 'images/vehicles/raider-1.jpg', 1, 1),
    (4, 'images/vehicles/raider-2.jpg', 0, 2),
    (5, 'images/vehicles/shmode-1.jpg', 1, 1),
    (5, 'images/vehicles/shmode-2.jpg', 0, 2),
    (5, 'images/vehicles/shmode-3.jpg', 0, 3),
    (6, 'images/vehicles/exciter-1.jpg', 1, 1),
    (6, 'images/vehicles/exciter-2.jpg', 0, 2);

-- 8. Favorite
INSERT INTO Favorite (UserId, VehicleId)
VALUES 
    (1, 1), (2, 1), (2, 5), (3, 3), (5, 6);

-- 9. OrderInfo
INSERT INTO OrderInfo (
    OrderNumber, VehicleId, StoreId, CustomerId,
    CustomerName, CustomerPhone, CustomerAddress,
    VehiclePrice, DepositAmount, TotalPrice,
    PaymentMethod, PaymentStatus, OrderStatus, Note, CancelReason,
    OrderedAt, CompletedAt
)
VALUES 
    ('ORD0001', 1, 1, 2, N'Nguyễn Văn A', '0901234567', N'123 Đường ABC, Quận 1, TP.HCM',
     42000000, 5000000, 42000000, 'Cash', 'PartiallyPaid', 'Processing', 
     N'Khách đặt cọc 5 triệu, hẹn lấy xe cuối tuần', NULL, GETDATE(), NULL),
    
    ('ORD0002', 3, 1, 3, N'Trần Thị B', '0907654321', N'456 Đường DEF, Quận 2, TP.HCM',
     18000000, 0, 18000000, 'BankTransfer', 'Paid', 'Completed', 
     N'Khách chuyển khoản đầy đủ', NULL, DATEADD(day, -5, GETDATE()), DATEADD(day, -2, GETDATE())),
    
    ('ORD0003', 6, 1, 5, N'Lê Văn C', '0938765432', N'789 Đường GHI, Quận 3, TP.HCM',
     48000000, 10000000, 48000000, 'Installment', 'PartiallyPaid', 'Pending', 
     N'Khách muốn trả góp 12 tháng', NULL, GETDATE(), NULL);

-- 10. Installment
INSERT INTO Installment (OrderId, BankName, LoanAmount, DownPayment, InterestRate, Months, MonthlyPayment, Status)
VALUES 
    (1, N'VPBank', 37000000, 5000000, 12.5, 12, 3500000, 'Approved'),
    (3, N'TPBank', 38000000, 10000000, 11.0, 12, 3600000, 'Pending');

-- 11. Review
INSERT INTO Review (StoreId, UserId, OrderId, Rating, Content)
VALUES 
    (1, 3, 2, 5, N'Cửa hàng phục vụ tốt, giao xe đúng mô tả. Xe chạy êm, giấy tờ đầy đủ. Rất hài lòng!'),
    (1, 2, NULL, 4, N'Shop nhiệt tình tư vấn, xe đẹp. Giá hơi cao một chút nhưng đáng tiền.'),
    (1, 5, NULL, 5, N'Mua xe ở đây yên tâm, anh chủ nhiệt tình. Sẽ giới thiệu bạn bè đến mua.'),
    (2, 1, NULL, 5, N'Cửa hàng chuyên nghiệp, xe nhập khẩu chính hãng, giá tốt!');

-- 12. News
INSERT INTO News (AuthorId, Title, Summary, Content, Thumbnail, NewsType, ViewCount, Status, PublishedAt)
VALUES 
    (4, N'Khai trương cửa hàng xe máy Thành Đạt',
     N'Giảm giá 10% cho tất cả xe tay ga trong tháng 11/2025.',
     N'<p>Cửa hàng xe máy Thành Đạt chính thức khai trương với nhiều ưu đãi hấp dẫn.</p>',
     'news/khai-truong.jpg', 'News', 120, 'Published', DATEADD(day, -10, GETDATE())),
    
    (4, N'Hướng dẫn bảo dưỡng xe máy đúng cách',
     N'Các bước cơ bản để bảo dưỡng xe máy tại nhà.',
     N'<p>Bảo dưỡng xe máy định kỳ giúp xe luôn hoạt động tốt và kéo dài tuổi thọ.</p>',
     'news/bao-duong-xe.jpg', 'Guide', 85, 'Published', DATEADD(day, -5, GETDATE())),
    
    (4, N'Top 5 xe tay ga bán chạy nhất tháng 11/2025',
     N'Những mẫu xe tay ga được khách hàng yêu thích nhất.',
     N'<p>1. Honda Vario 160<br>2. Yamaha NVX 155<br>3. Honda SH Mode</p>',
     'news/top-5-xe.jpg', 'News', 150, 'Published', DATEADD(day, -2, GETDATE()));

-- 13. Banner
INSERT INTO Banner (Title, ImagePath, Link, Position, DisplayOrder, StartDate, EndDate, IsActive)
VALUES 
    (N'Khuyến mãi tháng 11 - Giảm đến 15%', 'banners/km-thang11.jpg',
     '/khuyen-mai/thang-11', 'Homepage', 1, DATEADD(day, -5, GETDATE()), DATEADD(day, 25, GETDATE()), 1),
    
    (N'Black Friday Sale - Ưu đãi cực sốc', 'banners/black-friday.jpg',
     '/khuyen-mai/black-friday', 'Homepage', 2, GETDATE(), DATEADD(day, 15, GETDATE()), 1),
    
    (N'Trả góp 0% lãi suất', 'banners/tra-gop-0.jpg',
     '/tra-gop', 'Homepage', 3, DATEADD(day, -10, GETDATE()), DATEADD(day, 20, GETDATE()), 1);

-- 14. Notification
INSERT INTO Notification (UserId, NotificationType, Title, Content, Link, IsRead)
VALUES 
    (2, 'Order', N'Đơn hàng ORD0001 đã được xác nhận',
     N'Đơn hàng của bạn đã được cửa hàng xác nhận và đang chuẩn bị giao xe.', '/don-hang/ORD0001', 0),
    
    (3, 'Order', N'Đơn hàng ORD0002 đã hoàn thành',
     N'Cảm ơn bạn đã mua hàng. Đánh giá của bạn sẽ giúp chúng tôi phục vụ tốt hơn!', '/don-hang/ORD0002', 1),
    
    (2, 'System', N'Chào mừng bạn đến với QLCHXM',
     N'Cảm ơn bạn đã đăng ký tài khoản. Hãy khám phá các mẫu xe đẹp nhé!', '/', 1),
    
    (5, 'Order', N'Hồ sơ trả góp đang được xử lý',
     N'Hồ sơ trả góp cho đơn hàng ORD0003 của bạn đang được ngân hàng xem xét.', '/don-hang/ORD0003', 0);

-- 15. Question
INSERT INTO Question (UserId, Title, Content, VehicleId, Category, Status, ViewCount, AnswerCount)
VALUES 
    (2, N'Hỏi về giấy tờ xe Vario 160',
     N'Xe đã sang tên chính chủ chưa và còn bảo hành không? Xe có lịch sử tai nạn không?',
     1, N'Vehicle', 'Answered', 15, 1),
    
    (3, N'Mua xe trả góp cần giấy tờ gì?',
     N'Mình muốn mua xe trả góp qua ngân hàng, cần chuẩn bị giấy tờ gì ạ? Thời gian duyệt bao lâu?',
     NULL, N'General', 'Answered', 28, 2),
    
    (5, N'So sánh Vario 160 và NVX 155',
     N'Ae cho mình xin ý kiến nên mua Vario 160 hay NVX 155 ạ? Mình hay chạy đường dài.',
     NULL, N'General', 'Open', 12, 0);

-- 16. Answer
INSERT INTO Answer (QuestionId, UserId, Content, IsAccepted, LikeCount)
VALUES 
    (1, 1, N'Xe chính chủ, còn bảo hành 6 tháng tại cửa hàng. Xe không có lịch sử tai nạn, toàn bộ giấy tờ đầy đủ.', 1, 5),
    
    (2, 4, N'Bạn cần chuẩn bị: CMND/CCCD, Hộ khẩu, Giấy xác nhận thu nhập. Thời gian duyệt từ 1-3 ngày.', 1, 8),
    
    (2, 1, N'Shop hỗ trợ làm hồ sơ trả góp, bạn chỉ cần mang giấy tờ tùy thân. Duyệt khoảng 1-2 ngày.', 0, 3);


-- Bảng Vai trò
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


INSERT INTO Brand (BrandName, BrandCode)
VALUES
(N'Honda', 'HONDA'),
(N'Yamaha', 'YAMAHA'),
(N'Suzuki', 'SUZUKI');

INSERT INTO Store (OwnerId, StoreName, PhoneNumber, Address, Description, Image, Rating, TotalRating, Status)
VALUES
(1, N'Cửa hàng xe máy Minh Tâm', '0905123456', N'123 Nguyễn Văn Linh, Đà Nẵng', N'Chuyên bán các dòng xe Honda và Yamaha chính hãng.', 'store1.jpg', 4.5, 120, 'Active');

INSERT INTO VehicleCategory (CategoryName, CategoryCode, DisplayOrder)
VALUES
(N'Xe số', 'XESO', 1),
(N'Xe tay ga', 'XETAYGA', 2),
(N'Xe côn tay', 'XECONTAY', 3),
(N'Xe điện', 'XE DIEN', 4),
(N'Xe mô tô', 'XEMOTO', 5);

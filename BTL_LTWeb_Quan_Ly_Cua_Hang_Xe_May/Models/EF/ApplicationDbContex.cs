using Microsoft.EntityFrameworkCore;
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.EF
{
    public partial class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext()
        {
        }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Role> Roles { get; set; }
        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<Store> Stores { get; set; }
        public virtual DbSet<VehicleCategory> VehicleCategories { get; set; }
        public virtual DbSet<Brand> Brands { get; set; }
        public virtual DbSet<Vehicle> Vehicles { get; set; }
        public virtual DbSet<VehicleImage> VehicleImages { get; set; }
        public virtual DbSet<Favorite> Favorites { get; set; }
        public virtual DbSet<OrderInfo> OrderInfos { get; set; }
        public virtual DbSet<Installment> Installments { get; set; }
        public virtual DbSet<Review> Reviews { get; set; }
        public virtual DbSet<News> News { get; set; }
        public virtual DbSet<Banner> Banners { get; set; }
        public virtual DbSet<Notification> Notifications { get; set; }
        public virtual DbSet<Question> Questions { get; set; }
        public virtual DbSet<Answer> Answers { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer(
                    "Server=localhost,1434;Database=QLCHXM;MultipleActiveResultSets=True;TrustServerCertificate=True;User id=Admin_QLCHXM;Password=123;");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Role
            modelBuilder.Entity<Role>(entity =>
            {
                entity.ToTable("Role");
                entity.HasKey(e => e.RoleId);
                entity.Property(e => e.RoleName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).HasMaxLength(255);
            });

            // User
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("User");
                entity.HasKey(e => e.UserId);
                entity.Property(e => e.FullName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PhoneNumber).IsRequired().HasMaxLength(15);
                entity.HasIndex(e => e.PhoneNumber).IsUnique();
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.Password).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Active");
                entity.HasOne(d => d.Role)
                      .WithMany(p => p.Users)
                      .HasForeignKey(d => d.RoleId)
                      .OnDelete(DeleteBehavior.ClientSetNull);
            });

            // Store
            modelBuilder.Entity<Store>(entity =>
            {
                entity.ToTable("Store");
                entity.HasKey(e => e.StoreId);
                entity.Property(e => e.StoreName).IsRequired().HasMaxLength(150);
                entity.Property(e => e.PhoneNumber).IsRequired().HasMaxLength(15);
                entity.Property(e => e.Address).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Description).HasMaxLength(1000);
                entity.Property(e => e.Image).HasMaxLength(255);
                entity.Property(e => e.Rating).HasColumnType("decimal(2,1)").HasDefaultValue(0m);
                entity.Property(e => e.TotalRating).HasDefaultValue(0);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Active");
                entity.Property(e => e.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("GETDATE()");
                entity.HasOne(d => d.Owner)
                      .WithMany(p => p.Stores)
                      .HasForeignKey(d => d.OwnerId)
                      .OnDelete(DeleteBehavior.ClientSetNull);
            });

            // VehicleCategory
            modelBuilder.Entity<VehicleCategory>(entity =>
            {
                entity.ToTable("VehicleCategory");
                entity.HasKey(e => e.CategoryId);
                entity.Property(e => e.CategoryName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.CategoryCode).IsRequired().HasMaxLength(20);
                entity.HasIndex(e => e.CategoryCode).IsUnique();
                entity.Property(e => e.DisplayOrder).HasDefaultValue(0);
            });

            // Brand
            modelBuilder.Entity<Brand>(entity =>
            {
                entity.ToTable("Brand");
                entity.HasKey(e => e.BrandId);
                entity.Property(e => e.BrandName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.BrandCode).IsRequired().HasMaxLength(20);
                entity.HasIndex(e => e.BrandCode).IsUnique();
                entity.Property(e => e.Logo).HasMaxLength(255);
            });

            // Vehicle
            modelBuilder.Entity<Vehicle>(entity =>
            {
                entity.ToTable("Vehicle");
                entity.HasKey(e => e.VehicleId);
                entity.Property(e => e.Title).HasMaxLength(255);
                entity.Property(e => e.Model).HasMaxLength(100);
                entity.Property(e => e.Condition).HasMaxLength(20);
                entity.Property(e => e.SalePrice).HasColumnType("decimal(15,0)");
                entity.Property(e => e.OriginalPrice).HasColumnType("decimal(15,0)");
                entity.Property(e => e.Color).HasMaxLength(50);
                entity.Property(e => e.BodyType).HasMaxLength(50);
                entity.Property(e => e.Transmission).HasMaxLength(20);
                entity.Property(e => e.FuelType).HasMaxLength(20);
                entity.Property(e => e.Origin).HasMaxLength(50);
                entity.Property(e => e.Description).HasColumnType("nvarchar(max)");
                entity.Property(e => e.LicensePlate).HasMaxLength(20);
                entity.Property(e => e.FirstOwner).HasDefaultValue(true);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Available");
                entity.Property(e => e.IsFeatured).HasDefaultValue(false);
                entity.Property(e => e.ViewCount).HasDefaultValue(0);
                entity.Property(e => e.PostedAt).HasColumnType("datetime2").HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.UpdatedAt).HasColumnType("datetime2").HasDefaultValueSql("GETDATE()");
                entity.HasOne(d => d.Store)
                      .WithMany(p => p.Vehicles)
                      .HasForeignKey(d => d.StoreId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(d => d.Category)
                      .WithMany(p => p.Vehicles)
                      .HasForeignKey(d => d.CategoryId)
                      .OnDelete(DeleteBehavior.ClientSetNull);
                entity.HasOne(d => d.Brand)
                      .WithMany(p => p.Vehicles)
                      .HasForeignKey(d => d.BrandId)
                      .OnDelete(DeleteBehavior.ClientSetNull);
            });

            // VehicleImage
            modelBuilder.Entity<VehicleImage>(entity =>
            {
                entity.ToTable("VehicleImage");
                entity.HasKey(e => e.ImageId);
                entity.Property(e => e.ImagePath).IsRequired().HasMaxLength(255);
                entity.Property(e => e.IsPrimary).HasDefaultValue(false);
                entity.Property(e => e.DisplayOrder).HasDefaultValue(0);
                entity.HasOne(d => d.Vehicle)
                      .WithMany(p => p.VehicleImages)
                      .HasForeignKey(d => d.VehicleId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Favorite
            modelBuilder.Entity<Favorite>(entity =>
            {
                entity.ToTable("Favorite");
                entity.HasKey(e => e.FavoriteId);
                entity.Property(e => e.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("GETDATE()");
                entity.HasIndex(e => new { e.UserId, e.VehicleId }).IsUnique().HasDatabaseName("UQ_Favorite_UserVehicle");
                entity.HasOne(d => d.User)
                      .WithMany(p => p.Favorites)
                      .HasForeignKey(d => d.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(d => d.Vehicle)
                      .WithMany(p => p.Favorites)
                      .HasForeignKey(d => d.VehicleId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // OrderInfo
            modelBuilder.Entity<OrderInfo>(entity =>
            {
                entity.ToTable("OrderInfo");
                entity.HasKey(e => e.OrderId);
                entity.Property(e => e.OrderNumber).IsRequired().HasMaxLength(20);
                entity.HasIndex(e => e.OrderNumber).IsUnique();
                entity.Property(e => e.CustomerName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.CustomerPhone).IsRequired().HasMaxLength(15);
                entity.Property(e => e.CustomerAddress).HasMaxLength(255);
                entity.Property(e => e.VehiclePrice).HasColumnType("decimal(15,0)");
                entity.Property(e => e.DepositAmount).HasColumnType("decimal(15,0)");
                entity.Property(e => e.TotalPrice).HasColumnType("decimal(15,0)");
                entity.Property(e => e.PaymentMethod).IsRequired().HasMaxLength(20).HasDefaultValue("Cash");
                entity.Property(e => e.PaymentStatus).IsRequired().HasMaxLength(20).HasDefaultValue("Unpaid");
                entity.Property(e => e.OrderStatus).IsRequired().HasMaxLength(20).HasDefaultValue("Pending");
                entity.Property(e => e.Note).HasMaxLength(500);
                entity.Property(e => e.CancelReason).HasMaxLength(500);
                entity.Property(e => e.OrderedAt).HasColumnType("datetime2").HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.CompletedAt).HasColumnType("datetime2");
                entity.HasOne(d => d.Vehicle)
                      .WithMany(p => p.OrderInfos)
                      .HasForeignKey(d => d.VehicleId)
                      .OnDelete(DeleteBehavior.ClientSetNull);
                entity.HasOne(d => d.Store)
                      .WithMany(p => p.OrderInfos)
                      .HasForeignKey(d => d.StoreId)
                      .OnDelete(DeleteBehavior.ClientSetNull);
                entity.HasOne(d => d.Customer)
                      .WithMany(p => p.OrderInfos)
                      .HasForeignKey(d => d.CustomerId)
                      .OnDelete(DeleteBehavior.ClientSetNull);
            });

            // Installment
            modelBuilder.Entity<Installment>(entity =>
            {
                entity.ToTable("Installment");
                entity.HasKey(e => e.InstallmentId);
                entity.Property(e => e.BankName).HasMaxLength(100);
                entity.Property(e => e.LoanAmount).HasColumnType("decimal(15,0)");
                entity.Property(e => e.DownPayment).HasColumnType("decimal(15,0)");
                entity.Property(e => e.InterestRate).HasColumnType("decimal(5,2)");
                entity.Property(e => e.MonthlyPayment).HasColumnType("decimal(15,0)");
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Pending");
                entity.Property(e => e.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("GETDATE()");
                entity.HasOne(d => d.Order)
                      .WithMany(p => p.Installments)
                      .HasForeignKey(d => d.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Review
            modelBuilder.Entity<Review>(entity =>
            {
                entity.ToTable("Review");
                entity.HasKey(e => e.ReviewId);
                entity.Property(e => e.Content).HasMaxLength(1000);
                entity.Property(e => e.ReviewedAt).HasColumnType("datetime2").HasDefaultValueSql("GETDATE()");
                entity.HasOne(d => d.Store)
                      .WithMany(p => p.Reviews)
                      .HasForeignKey(d => d.StoreId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(d => d.User)
                      .WithMany(p => p.Reviews)
                      .HasForeignKey(d => d.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(d => d.Order)
                      .WithMany(p => p.Reviews)
                      .HasForeignKey(d => d.OrderId)
                      .OnDelete(DeleteBehavior.ClientSetNull);
            });

            // News
            modelBuilder.Entity<News>(entity =>
            {
                entity.ToTable("News");
                entity.HasKey(e => e.NewsId);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Summary).HasMaxLength(500);
                entity.Property(e => e.Content).IsRequired().HasColumnType("nvarchar(max)");
                entity.Property(e => e.Thumbnail).HasMaxLength(255);
                entity.Property(e => e.NewsType).IsRequired().HasMaxLength(20).HasDefaultValue("News");
                entity.Property(e => e.ViewCount).HasDefaultValue(0);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Draft");
                entity.Property(e => e.PublishedAt).HasColumnType("datetime2");
                entity.Property(e => e.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("GETDATE()");
                entity.HasOne(d => d.Author)
                      .WithMany(p => p.News)
                      .HasForeignKey(d => d.AuthorId)
                      .OnDelete(DeleteBehavior.ClientSetNull);
            });

            // Banner
            modelBuilder.Entity<Banner>(entity =>
            {
                entity.ToTable("Banner");
                entity.HasKey(e => e.BannerId);
                entity.Property(e => e.Title).HasMaxLength(150);
                entity.Property(e => e.ImagePath).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Link).HasMaxLength(255);
                entity.Property(e => e.Position).IsRequired().HasMaxLength(20).HasDefaultValue("Homepage");
                entity.Property(e => e.DisplayOrder).HasDefaultValue(0);
                entity.Property(e => e.StartDate).HasColumnType("datetime2");
                entity.Property(e => e.EndDate).HasColumnType("datetime2");
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("GETDATE()");
            });

            // Notification
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.ToTable("Notification");
                entity.HasKey(e => e.NotificationId);
                entity.Property(e => e.NotificationType).IsRequired().HasMaxLength(20).HasDefaultValue("System");
                entity.Property(e => e.Title).IsRequired().HasMaxLength(150);
                entity.Property(e => e.Content).HasMaxLength(500);
                entity.Property(e => e.Link).HasMaxLength(255);
                entity.Property(e => e.IsRead).HasDefaultValue(false);
                entity.Property(e => e.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("GETDATE()");
                entity.HasOne(d => d.User)
                      .WithMany(p => p.Notifications)
                      .HasForeignKey(d => d.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Question
            modelBuilder.Entity<Question>(entity =>
            {
                entity.ToTable("Question");
                entity.HasKey(e => e.QuestionId);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
                entity.Property(e => e.Content).IsRequired().HasMaxLength(2000);
                entity.Property(e => e.Category).HasMaxLength(50).HasDefaultValue("General");
                entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Open");
                entity.Property(e => e.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.UpdatedAt).HasColumnType("datetime2");
                entity.Property(e => e.ViewCount).HasDefaultValue(0);
                entity.Property(e => e.AnswerCount).HasDefaultValue(0);
                entity.HasOne(d => d.User)
                      .WithMany()
                      .HasForeignKey(d => d.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(d => d.Vehicle)
                      .WithMany()
                      .HasForeignKey(d => d.VehicleId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // Answer
            modelBuilder.Entity<Answer>(entity =>
            {
                entity.ToTable("Answer");
                entity.HasKey(e => e.AnswerId);
                entity.Property(e => e.Content).IsRequired().HasMaxLength(2000);
                entity.Property(e => e.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.UpdatedAt).HasColumnType("datetime2");
                entity.Property(e => e.IsAccepted).HasDefaultValue(false);
                entity.Property(e => e.LikeCount).HasDefaultValue(0);
                entity.HasOne(d => d.Question)
                      .WithMany(p => p.Answers)
                      .HasForeignKey(d => d.QuestionId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(d => d.User)
                      .WithMany()
                      .HasForeignKey(d => d.UserId)
                      .OnDelete(DeleteBehavior.ClientCascade);
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}

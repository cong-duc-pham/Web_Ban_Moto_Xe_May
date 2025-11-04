using Microsoft.EntityFrameworkCore;
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.EF
{
    public class ApplicationDbContext : DbContext
    {

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }
        public DbSet<XeMay> XeMay { get; set; }
        public DbSet<TaiKhoan> TaiKhoan { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<XeMay>(entity =>
            {
                // Đặt MaXe làm khóa chính
                entity.HasKey(e => e.ID);

                // Tên bảng trong SQL
                entity.ToTable("XeMay");

                // Cấu hình thuộc tính MaXe
                entity.Property(e => e.ID)
                      .ValueGeneratedOnAdd(); // Tự tăng

                // Tên xe: bắt buộc, tối đa 200 ký tự
                entity.Property(e => e.TenXe)
                      .HasMaxLength(200)
                      .IsRequired();

                // Giá: bắt buộc, kiểu decimal(18,2)
                entity.Property(e => e.Gia)
                      .HasColumnType("decimal(18,2)")
                      .IsRequired();

                // Hình ảnh: có thể null, tối đa 255 ký tự
                entity.Property(e => e.HinhAnh)
                      .HasMaxLength(255);

                // Mô tả: có thể null, tối đa 500 ký tự
                entity.Property(e => e.MoTa)
                      .HasMaxLength(500);
            });

            modelBuilder.Entity<TaiKhoan>(entity =>
            {
                // Đặt ID làm khóa chính
                entity.HasKey(e => e.ID);

                // Tên bảng trong SQL
                entity.ToTable("TaiKhoan");

                // Cấu hình thuộc tính ID
                entity.Property(e => e.ID)
                      .ValueGeneratedOnAdd(); // Tự tăng

                // Tên đăng nhập: bắt buộc, tối đa 50 ký tự, unique
                entity.Property(e => e.TenDangNhap)
                      .HasMaxLength(50)
                      .IsRequired();
                
                entity.HasIndex(e => e.TenDangNhap)
                      .IsUnique();

                // Mật khẩu: bắt buộc, tối đa 255 ký tự
                entity.Property(e => e.MatKhau)
                      .HasMaxLength(255)
                      .IsRequired();

                // Họ và tên: bắt buộc, tối đa 100 ký tự
                entity.Property(e => e.HovaTen)
                      .HasMaxLength(100)
                      .IsRequired();

                // Ngày sinh: có thể null
                entity.Property(e => e.NgaySinh);

                // Giới tính: có thể null, tối đa 10 ký tự
                entity.Property(e => e.GioiTinh)
                      .HasMaxLength(10);

                // Email: bắt buộc, tối đa 100 ký tự
                entity.Property(e => e.Email)
                      .HasMaxLength(100)
                      .IsRequired();

                // Vai trò: bắt buộc, tối đa 20 ký tự (VD: Admin, User)
                entity.Property(e => e.VaiTro)
                      .HasMaxLength(20)
                      .IsRequired()
                      .HasDefaultValue("User");
            });
        }
        }
}

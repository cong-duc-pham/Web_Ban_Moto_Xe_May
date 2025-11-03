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
        }
        }
}

using System.ComponentModel.DataAnnotations;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities
{
    public class TaiKhoan
    {
        [Key]
        public int ID { get; set; }
        public required string TenDangNhap { get; set; }
        public required string MatKhau { get; set; }
        public required string HovaTen { get; set; }
        public DateTime? NgaySinh { get; set; }
        public string? GioiTinh { get; set; }
        public required string Email { get; set; }
        public required string VaiTro { get; set; }
    }
}

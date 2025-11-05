using System.ComponentModel.DataAnnotations;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities
{
    public class XeMay
    {
        
        public int ID { get; set; }
        public string TenXe { get; set; }
        public decimal Gia { get; set; }
        public string HinhAnh { get; set; }
        public string MoTa { get; set; }

    }
}

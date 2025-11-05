using System;
using System.Collections.Generic;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;

public partial class Brand
{
    public int BrandId { get; set; }

    public string BrandName { get; set; } = null!;

    public string BrandCode { get; set; } = null!;

    public string? Logo { get; set; }

    public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}

using System;
using System.Collections.Generic;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;

public partial class VehicleCategory
{
    public int CategoryId { get; set; }

    public string CategoryName { get; set; } = null!;

    public string CategoryCode { get; set; } = null!;

    public int? DisplayOrder { get; set; }

    public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}

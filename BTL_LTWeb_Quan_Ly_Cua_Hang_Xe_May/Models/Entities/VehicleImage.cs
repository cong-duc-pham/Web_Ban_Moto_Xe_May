using System;
using System.Collections.Generic;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;

public partial class VehicleImage
{
    public int ImageId { get; set; }

    public int VehicleId { get; set; }

    public string ImagePath { get; set; } = null!;

    public bool? IsPrimary { get; set; }

    public int? DisplayOrder { get; set; }

    public virtual Vehicle Vehicle { get; set; } = null!;
}

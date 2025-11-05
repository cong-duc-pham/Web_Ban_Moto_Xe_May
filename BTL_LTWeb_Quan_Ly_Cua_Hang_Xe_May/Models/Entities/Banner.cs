using System;
using System.Collections.Generic;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;

public partial class Banner
{
    public int BannerId { get; set; }

    public string? Title { get; set; }

    public string ImagePath { get; set; } = null!;

    public string? Link { get; set; }

    public string Position { get; set; } = null!;

    public int? DisplayOrder { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }
}

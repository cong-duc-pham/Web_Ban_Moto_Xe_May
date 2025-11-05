using System;
using System.Collections.Generic;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;

public partial class Review
{
    public int ReviewId { get; set; }

    public int StoreId { get; set; }

    public int UserId { get; set; }

    public int? OrderId { get; set; }

    public int Rating { get; set; }

    public string? Content { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public virtual OrderInfo? Order { get; set; }

    public virtual Store Store { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}

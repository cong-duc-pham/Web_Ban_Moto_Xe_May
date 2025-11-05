using System;
using System.Collections.Generic;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;

public partial class Store
{
    public int StoreId { get; set; }

    public int OwnerId { get; set; }

    public string StoreName { get; set; } = null!;

    public string PhoneNumber { get; set; } = null!;

    public string Address { get; set; } = null!;

    public string? Description { get; set; }

    public string? Image { get; set; }

    public decimal? Rating { get; set; }

    public int? TotalRating { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<OrderInfo> OrderInfos { get; set; } = new List<OrderInfo>();

    public virtual User Owner { get; set; } = null!;

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}

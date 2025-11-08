using System;
using System.Collections.Generic;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;

public partial class Vehicle
{
    public int VehicleId { get; set; }

    public int? StoreId { get; set; }

    public int? CategoryId { get; set; }

    public int? BrandId { get; set; }

    public string? Title { get; set; }

    public string? Model { get; set; }

    public string? Condition { get; set; }

    public int? ManufactureYear { get; set; }

    public decimal? SalePrice { get; set; }

    public decimal? OriginalPrice { get; set; }

    public int? EngineCapacity { get; set; }

    public string? Color { get; set; }

    public int? Odometer { get; set; }

    public string? BodyType { get; set; }

    public string? Transmission { get; set; }

    public string? FuelType { get; set; }

    public int? Seats { get; set; }

    public string? Origin { get; set; }

    public string? Description { get; set; }

    public string? LicensePlate { get; set; }

    public bool? FirstOwner { get; set; }

    public string Status { get; set; } = null!;

    public bool? IsFeatured { get; set; }

    public int? ViewCount { get; set; }

    public DateTime? PostedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int StockQuantity { get; set; } = 0;

    public int SoldCount { get; set; } = 0;

    public virtual Brand? Brand { get; set; }

    public virtual VehicleCategory? Category { get; set; }

    public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();

    public virtual ICollection<OrderInfo> OrderInfos { get; set; } = new List<OrderInfo>();

    public virtual Store? Store { get; set; }

    public virtual ICollection<VehicleImage> VehicleImages { get; set; } = new List<VehicleImage>();
}

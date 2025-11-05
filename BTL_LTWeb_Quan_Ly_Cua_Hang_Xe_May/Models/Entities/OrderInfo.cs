using System;
using System.Collections.Generic;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;

public partial class OrderInfo
{
    public int OrderId { get; set; }

    public string OrderNumber { get; set; } = null!;

    public int VehicleId { get; set; }

    public int StoreId { get; set; }

    public int CustomerId { get; set; }

    public string CustomerName { get; set; } = null!;

    public string CustomerPhone { get; set; } = null!;

    public string? CustomerAddress { get; set; }

    public decimal VehiclePrice { get; set; }

    public decimal? DepositAmount { get; set; }

    public decimal TotalPrice { get; set; }

    public string PaymentMethod { get; set; } = null!;

    public string PaymentStatus { get; set; } = null!;

    public string OrderStatus { get; set; } = null!;

    public string? Note { get; set; }

    public string? CancelReason { get; set; }

    public DateTime? OrderedAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public virtual User Customer { get; set; } = null!;

    public virtual ICollection<Installment> Installments { get; set; } = new List<Installment>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual Store Store { get; set; } = null!;

    public virtual Vehicle Vehicle { get; set; } = null!;
}

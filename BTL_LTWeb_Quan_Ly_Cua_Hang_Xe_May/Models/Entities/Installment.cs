using System;
using System.Collections.Generic;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;

public partial class Installment
{
    public int InstallmentId { get; set; }

    public int OrderId { get; set; }

    public string? BankName { get; set; }

    public decimal LoanAmount { get; set; }

    public decimal DownPayment { get; set; }

    public decimal? InterestRate { get; set; }

    public int Months { get; set; }

    public decimal MonthlyPayment { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public virtual OrderInfo Order { get; set; } = null!;
}

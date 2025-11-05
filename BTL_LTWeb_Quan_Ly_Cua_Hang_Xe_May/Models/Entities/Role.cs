using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;
[Table("Role")]
public partial class Role
{
    public int RoleId { get; set; }

    public string RoleName { get; set; } = null!;

    public string? Description { get; set; }

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}

using System;
using System.Collections.Generic;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;

public partial class News
{
    public int NewsId { get; set; }

    public int AuthorId { get; set; }

    public string Title { get; set; } = null!;

    public string? Summary { get; set; }

    public string Content { get; set; } = null!;

    public string? Thumbnail { get; set; }

    public string NewsType { get; set; } = null!;

    public int? ViewCount { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? PublishedAt { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User Author { get; set; } = null!;
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities
{
    [Table("Answer")]
    public class Answer
    {
        [Key]
        public int AnswerId { get; set; }

        [Required]
        public int QuestionId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [StringLength(2000)]
        public string Content { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime? UpdatedAt { get; set; }

        public bool IsAccepted { get; set; } = false; // Câu trả lời được chấp nhận

        public int LikeCount { get; set; } = 0;

        // Navigation properties
        [ForeignKey("QuestionId")]
        public virtual Question? Question { get; set; }

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities
{
    [Table("Question")]
    public class Question
    {
        [Key]
        public int QuestionId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [StringLength(500)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(2000)]
        public string Content { get; set; } = string.Empty;

        public int? VehicleId { get; set; }

        [StringLength(50)]
        public string Category { get; set; } = "General"; // General, Vehicle, Payment, Delivery

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime? UpdatedAt { get; set; }

        [StringLength(20)]
        public string Status { get; set; } = "Open"; 

        public int ViewCount { get; set; } = 0;

        public int AnswerCount { get; set; } = 0;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        [ForeignKey("VehicleId")]
        public virtual Vehicle? Vehicle { get; set; }

        public virtual ICollection<Answer>? Answers { get; set; }
    }
}

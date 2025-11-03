using Microsoft.EntityFrameworkCore;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.EF
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

        }
        }
}

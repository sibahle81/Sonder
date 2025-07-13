
using Microsoft.EntityFrameworkCore;

namespace RMA.Web.Login.Models
{
    public class ApplicationContext : DbContext
    {
        public ApplicationContext(DbContextOptions options)
            : base(options) { }

        public DbSet<Application> Applications { get; set; }
    }
}

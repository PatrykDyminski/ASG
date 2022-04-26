using Microsoft.EntityFrameworkCore;

namespace NotificationService
{
  public partial class NotificationsContext : DbContext
  {
    public virtual DbSet<Notification> Notifications { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
      if (!optionsBuilder.IsConfigured)
      {
        optionsBuilder.UseSqlServer("");
      }
    }
  }
}

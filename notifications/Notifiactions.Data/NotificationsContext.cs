using Microsoft.EntityFrameworkCore;

namespace Notifiactions.Data;

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

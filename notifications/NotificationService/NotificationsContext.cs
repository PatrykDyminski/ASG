using Microsoft.EntityFrameworkCore;

namespace NotificationService
{
  public partial class NotificationsContext : DbContext
  {
    public NotificationsContext()
    {
    }

    public NotificationsContext(DbContextOptions<NotificationsContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Notification> Notifications { get; set; } = null!;

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
      if (!optionsBuilder.IsConfigured)
      {
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.
        optionsBuilder.UseSqlServer(Environment.GetEnvironmentVariable("CONN_STR"));
      }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      modelBuilder.Entity<Notification>(entity =>
      {
        entity.HasKey(e => e.PersonId);

        entity.Property(e => e.PersonId).HasColumnName("PersonID");

        entity.Property(e => e.Email)
                  .HasMaxLength(255)
                  .IsUnicode(false)
                  .HasColumnName("email");

        entity.Property(e => e.EventDate)
                  .HasColumnType("date")
                  .HasColumnName("eventDate");

        entity.Property(e => e.EventLocation)
                  .HasMaxLength(255)
                  .IsUnicode(false)
                  .HasColumnName("eventLocation");

        entity.Property(e => e.EventName)
                  .HasMaxLength(255)
                  .IsUnicode(false)
                  .HasColumnName("eventName");

        entity.Property(e => e.FirstName)
                  .HasMaxLength(255)
                  .IsUnicode(false);

        entity.Property(e => e.LastName)
                  .HasMaxLength(255)
                  .IsUnicode(false);
      });

      OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
  }
}

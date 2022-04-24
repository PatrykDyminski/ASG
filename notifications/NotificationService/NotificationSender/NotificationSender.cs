using NotificationService.EmailSender;

namespace NotificationService.NotificationSender;

internal class NotificationSender : INotificationSender
{
  private readonly IEmailSender emailSender;

  public NotificationSender(IEmailSender emailSender)
  {
    this.emailSender = emailSender;
  }

  public void SendNotifications()
  {
    var now = DateTime.Now;

    using var db = new NotificationsContext();

    if (!db.Notifications.Any())
    {
      db.Notifications.Add(new Notification
      {
        FirstName = "Pawel",
        LastName = "Kowalski",
        Email = "242527@student.pwr.edu.pl",
        EventDate = DateTime.Parse("2022-05-15"),
        EventName = "AFASFAF",
        EventLocation = "Wrocuaf",
        FirstNotifSent = false,
        SecondNotifSent = false,
      });
    }

    db.SaveChanges();

    var notif = db.Notifications
      .Where(n => (bool)!n.FirstNotifSent)
      .Where(n => n.EventDate > now);

    notif.ToList().ForEach(n => HandleNotif(n, db));
  }

  private void HandleNotif(Notification n, NotificationsContext db)
  {
    emailSender.SendEmail(n.Email, "Event " + n.EventName, n.EventDate.ToString());
    n.FirstNotifSent = true;
    db.Notifications.Update(n);
    db.SaveChanges();
  }
}

using NotificationService.EmailSender;

namespace NotificationService.NotificationSender;

internal class NotificationSender : INotificationSender
{
  private readonly IEmailSender emailSender;
  private static NotificationsContext context = new();

  public NotificationSender(IEmailSender emailSender)
  {
    this.emailSender = emailSender;
  }

  public void SendNotifications()
  {
    var now = DateTime.Now;

    if (!context.Notifications.Any())
    {
      context.Notifications.Add(new Notification
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

    //context.SaveChanges();

    var notif = context.Notifications
      .Where(n => !n.FirstNotifSent)
      .Where(n => n.EventDate > now);

    notif.ToList().ForEach(n => HandleNotif(n));
  }

  private void HandleNotif(Notification n)
  {
    emailSender.SendEmail(n.Email, "Event " + n.EventName, n.EventDate.ToString());
    n.FirstNotifSent = true;
    context.SaveChanges();
  }
}

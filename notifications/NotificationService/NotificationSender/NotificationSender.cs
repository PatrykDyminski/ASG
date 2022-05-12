using Notifiactions.Data;
using Notifications.Sender.EmailSender;

namespace Notifications.Sender.NotificationSender;

internal class NotificationSender : INotificationSender
{
  private readonly IEmailSender emailSender;
  private static readonly NotificationsContext context = new();

  public NotificationSender(IEmailSender emailSender)
  {
    this.emailSender = emailSender;
  }

  public void SendNotifications()
  {
    var now = DateTime.Now;

    //For demo purposes
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

    context.SaveChanges();

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

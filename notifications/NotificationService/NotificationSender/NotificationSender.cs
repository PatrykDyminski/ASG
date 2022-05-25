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
      EventDate = DateTime.Parse("2022-06-7"),
      EventName = "AFASFAF",
      EventLocation = "Wrocuaf",
      FirstNotifSent = false,
      SecondNotifSent = false,
    });

    context.SaveChanges();

    var notif1 = context.Notifications
      .ToList()
      .Where(n => !n.FirstNotifSent)
      .Where(n => n.EventDate.DayOfYear - now.DayOfYear == 14);

    notif1
      .ToList()
      .ForEach(n => HandleNotif(n, 1));

    var notif2 = context.Notifications
      .ToList()
      .Where(n => !n.SecondNotifSent)
      .Where(n => n.EventDate.DayOfYear - now.DayOfYear == 1);

    notif2
      .ToList()
      .ForEach(n => HandleNotif(n, 2));
  }

  private void HandleNotif(Notification n, int wave)
  {
    Console.WriteLine(n);

    var text = "Event in ";

    if (wave == 1)
    {
      text += "two weeks ";
      n.FirstNotifSent = true;
    }
    else
    {
      text += "ONE DAY!!!!! ";
      n.SecondNotifSent = true;
    }

    emailSender.SendEmail(n.Email, text + n.EventName, n.EventDate.ToString());

    context.SaveChanges();
  }
}

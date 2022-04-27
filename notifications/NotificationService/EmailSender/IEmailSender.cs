namespace Notifications.Sender.EmailSender;

public interface IEmailSender
{
  void SendEmail(string to, string subject, string body);
}

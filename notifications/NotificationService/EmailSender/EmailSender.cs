using System.Net;
using System.Net.Mail;

namespace Notifications.Sender.EmailSender;

internal class EmailSender : IEmailSender
{
  public void SendEmail(string to, string subject, string body)
  {
    var email = Environment.GetEnvironmentVariable("EMAIL");
    var pass = Environment.GetEnvironmentVariable("EMAIL_PASSWORD");

    var fromAddress = new MailAddress(email, "Super Apka");
    var toAddress = new MailAddress(to, to);

    var smtp = new SmtpClient
    {
      Host = "smtp.gmail.com",
      Port = 587,
      EnableSsl = true,
      DeliveryMethod = SmtpDeliveryMethod.Network,
      UseDefaultCredentials = false,
      Credentials = new NetworkCredential(fromAddress.Address, pass)
    };

    using var message = new MailMessage(fromAddress, toAddress)
    {
      Subject = subject,
      Body = body
    };

    smtp.Send(message);
  }
}

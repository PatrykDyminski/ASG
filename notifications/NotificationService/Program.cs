using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Notifications.Sender;
using Notifications.Sender.EmailSender;
using Notifications.Sender.NotificationSender;

using var host = Host.CreateDefaultBuilder(args)
    .ConfigureServices((_, services) => services
      .AddSingleton<IEmailSender, EmailSender>()
      .AddTransient<INotificationSender, NotificationSender>())
    .Build();

var root = Directory.GetCurrentDirectory();
var dotenv = Path.Combine(root, ".env");
DotEnv.Load(dotenv);

using var serviceScope = host.Services.CreateScope();
var provider = serviceScope.ServiceProvider;

var notifSender = provider.GetRequiredService<INotificationSender>();

notifSender.SendNotifications();

Console.WriteLine(" Press [enter] to exit.");
Console.ReadLine();

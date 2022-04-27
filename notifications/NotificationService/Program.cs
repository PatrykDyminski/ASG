using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Notifications.Sender;
using Notifications.Sender.EmailSender;
using Notifications.Sender.NotificationSender;

static IHostBuilder CreateHostBuilder(string[] args)
{
  return Host.CreateDefaultBuilder(args)
    .ConfigureServices((_, services) =>
      services
        .AddSingleton<IEmailSender, EmailSender>()
        .AddTransient<INotificationSender, NotificationSender>());
}

using var host = CreateHostBuilder(args).Build();
Run(host.Services);

static async void Run(IServiceProvider services)
{
  var root = Directory.GetCurrentDirectory();
  var dotenv = Path.Combine(root, ".env");
  DotEnv.Load(dotenv);

  using var serviceScope = services.CreateScope();
  var provider = serviceScope.ServiceProvider;

  var notifSender = provider.GetRequiredService<INotificationSender>();

  notifSender.SendNotifications();

  Console.WriteLine(" Press [enter] to exit.");
  Console.ReadLine();
}
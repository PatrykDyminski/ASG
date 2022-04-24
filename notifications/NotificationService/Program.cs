using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using NotificationService;
using NotificationService.EmailSender;
using NotificationService.NotificationSender;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;

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

static void Consume(object? model, BasicDeliverEventArgs ea)
{
  var body = ea.Body.ToArray();
  var message = Encoding.UTF8.GetString(body);
  Console.WriteLine(" [x] Received {0}", message);
}

static async void Run(IServiceProvider services)
{
  var root = Directory.GetCurrentDirectory();
  var dotenv = Path.Combine(root, ".env");
  DotEnv.Load(dotenv);

  using var serviceScope = services.CreateScope();
  var provider = serviceScope.ServiceProvider;

  var notifSender = provider.GetRequiredService<INotificationSender>();

  notifSender.SendNotifications();

  var factory = new ConnectionFactory()
  {
    HostName = "localhost",
    UserName = "guest",
    Password = "guest",
    Port = 5672,
  };

  using var connection = factory.CreateConnection();
  using var channel = connection.CreateModel();

  channel.QueueDeclare(queue: "hello",
                       durable: false,
                       exclusive: false,
                       autoDelete: false,
                       arguments: null);

  //CONSUMER
  var consumer = new EventingBasicConsumer(channel);
  consumer.Received += Consume;

  channel.BasicConsume(queue: "hello",
                       autoAck: true,
                       consumer: consumer);

  Console.WriteLine(" Press [enter] to exit.");
  Console.ReadLine();
}
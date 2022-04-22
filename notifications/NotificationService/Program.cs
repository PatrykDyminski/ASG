using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using NotificationService;
using NotificationService.EmailSender;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Data.SqlClient;
using System.Text;

static IHostBuilder CreateHostBuilder(string[] args)
{
  return Host.CreateDefaultBuilder(args)
    .ConfigureServices((_, services) =>
      services
        .AddSingleton<IEmailSender, EmailSender>());
}

using var host = CreateHostBuilder(args).Build();
Run(host.Services);

static void SQLMagic()
{
  try
  {
    using SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("CONN_STR"));

    var sql = "SELECT TOP (1000) * FROM [dbo].[Notifications]";
    using SqlCommand command = new(sql, connection);

    connection.Open();
    using SqlDataReader reader = command.ExecuteReader();

    while (reader.Read())
    {
      Console.WriteLine("{0} {1}", reader.GetString(1), reader.GetString(2));
    }

    reader.Close();
    command.Dispose();
    connection.Close();
  }
  catch (SqlException e)
  {
    Console.WriteLine(e.ToString());
  }
}

static void EFMagic()
{
  using var db = new NotificationsContext();

  // Read
  Console.WriteLine("Querying for a blog");
  var notif = db.Notifications
      .First();

  Console.WriteLine(notif.FirstName);
}

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

  var emailSender = provider.GetRequiredService<IEmailSender>();

  var rnd = new Random();

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


  SQLMagic();
  EFMagic();

  Console.WriteLine(" Press [enter] to exit.");
  Console.ReadLine();
}
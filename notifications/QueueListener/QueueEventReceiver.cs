using Notifiactions.Data;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;

namespace QueueListener;

public class EventSignInReceiver : BackgroundService
{
  private static readonly string EventSignInCreate = "UserSignedInForEvent";
  private static readonly string EventsExchange = "EventsExchange";

  private readonly IConnection _connection;
  private readonly IModel _channel;

  public EventSignInReceiver(IConnectionFactory connectionFactory)
  {
    _connection = connectionFactory.CreateConnection();
    _channel = _connection.CreateModel();

    _channel.ExchangeDeclare(exchange: EventsExchange, ExchangeType.Fanout);

    _channel.QueueDeclare(
      queue: EventSignInCreate,
      durable: false,
      exclusive: false,
      autoDelete: false,
      arguments: null);

    _channel.QueueBind(
      queue: EventSignInCreate,
      exchange: EventsExchange,
      routingKey: EventSignInCreate);
  }

  protected override Task ExecuteAsync(CancellationToken stoppingToken)
  {
    stoppingToken.ThrowIfCancellationRequested();

    _channel.BasicConsume(EventSignInCreate, false, CreateSignInCreateConsumer());

    return Task.CompletedTask;
  }

  private EventingBasicConsumer CreateSignInCreateConsumer()
  {
    var consumer = new EventingBasicConsumer(_channel);
    consumer.Received += (_, ea) => OnSignInCreateReceived(ea);
    return consumer;
  }

  private void OnSignInCreateReceived(BasicDeliverEventArgs message)
  {
    var notif = JsonSerializer.Deserialize<Notification>(
      Encoding.UTF8.GetString(
        message.Body.ToArray()
      ));

    if (notif == null)
    {
      PrintMsg(message);
      _channel.BasicNack(message.DeliveryTag, false, false);
    }
    else
    {
      PrintMsg(message);
      SaveNotification(notif);
      _channel.BasicAck(message.DeliveryTag, false);
    }
  }

  private static void PrintMsg(BasicDeliverEventArgs ea)
  {
    var body = ea.Body.ToArray();
    var message = Encoding.UTF8.GetString(body);
    Console.WriteLine(message);
  }

  private static void SaveNotification(Notification notification)
  {
    NotificationsContext context = new();
    context.Notifications.Add(notification);
    context.SaveChanges();
  }

  public override void Dispose()
  {
    _channel.Dispose();
    _connection.Dispose();
    base.Dispose();
  }
}
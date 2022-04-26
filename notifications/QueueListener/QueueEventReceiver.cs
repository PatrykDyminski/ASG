using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;

namespace QueueListener;

public class EventSignInReceiver : BackgroundService
{
  public static string EventSignInCreate = nameof(EventSignInCreate);
  public static string EventsExchange = nameof(EventsExchange);

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

    var consumer = new EventingBasicConsumer(_channel);

    consumer.Received += (model, ea) =>
    {
      var body = ea.Body.ToArray();
      var message = Encoding.UTF8.GetString(body);
      var data = message;

      OnMessageReceived(data);
    };

    _channel.BasicConsume(
      queue: EventSignInCreate,
      autoAck: true,
      consumer: consumer);

    return Task.CompletedTask;
  }

  private void OnMessageReceived(string message)
  {
    Console.WriteLine(message);
  }

  public override void Dispose()
  {
    _channel.Dispose();
    _connection.Dispose();
    base.Dispose();
  }
}
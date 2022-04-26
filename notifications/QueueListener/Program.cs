using QueueListener;
using RabbitMQ.Client;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IConnectionFactory>(new ConnectionFactory
{
  HostName = builder.Configuration["RabbitMQ:HostName"],
  Port = Convert.ToInt32(builder.Configuration["RabbitMQ:Port"]),
  UserName = builder.Configuration["RabbitMQ:UserName"],
  Password = builder.Configuration["RabbitMQ:Password"]
});

builder.Services.AddHostedService<EventSignInReceiver>();

var app = builder.Build();
app.Run();
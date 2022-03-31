using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using NotificationService;
using NotificationService.EmailSender;

static IHostBuilder CreateHostBuilder(string[] args)
{
	return Host.CreateDefaultBuilder(args)
		.ConfigureServices((_, services) =>
			services
				.AddSingleton<IEmailSender, EmailSender>());
}

using var host = CreateHostBuilder(args).Build();
Run(host.Services);

static void Run(IServiceProvider services)
{
	var root = Directory.GetCurrentDirectory();
	var dotenv = Path.Combine(root, ".env");
	DotEnv.Load(dotenv);

	using var serviceScope = services.CreateScope();
	var provider = serviceScope.ServiceProvider;

	var emailSender = provider.GetRequiredService<IEmailSender>();

	emailSender.SendEmail("242527@student.pwr.edu.pl", "Elemele", "XDDD");
}
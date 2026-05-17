using Reparto_Backend.Infrastructure.DependencyInjection;
using Reparto_Backend.Application.Abstractions.Realtime;
using Reparto_Backend.Presentation.Hubs;

namespace Reparto_Backend.Presentation
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("¡Hola, mundo!");
            
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddOpenApi();
            builder.Services.AddSignalR();
            builder.Services.AddScoped<IRealtimeNotifier, SignalRRealtimeNotifier>();
            builder.Services.AddInfrastructure(builder.Configuration);

            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();
            app.UseWebSockets();

            app.MapGet("/", () => Results.Ok(new
            {
                Service = "Reparto Backend",
                Status = "Running"
            }));

            app.MapHub<DeliveryTrackingHub>("/hubs/delivery-tracking");

            app.Run();
        }
    }
}
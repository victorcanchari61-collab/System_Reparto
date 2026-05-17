using Reparto_Backend.Infrastructure.DependencyInjection;
using Reparto_Backend.Application.Abstractions.Realtime;
using Reparto_Backend.Presentation.Endpoints;
using Reparto_Backend.Presentation.Hubs;

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
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => Results.Ok(new
{
    Service = "Reparto Backend",
    Status = "Running"
}));

app.MapAuthEndpoints();
app.MapHub<DeliveryTrackingHub>("/hubs/delivery-tracking");

app.Run();

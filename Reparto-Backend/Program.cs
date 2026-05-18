using Reparto_Backend.Infrastructure.DependencyInjection;
using Reparto_Backend.Application.Abstractions.Realtime;
using Reparto_Backend.Presentation.Hubs;

namespace Reparto_Backend;

internal class Program
{
    internal static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddProblemDetails();
        builder.Services.AddControllers();
        builder.Services.AddSignalR();
        builder.Services.AddScoped<IRealtimeNotifier, SignalRRealtimeNotifier>();
        builder.Services.AddInfrastructure(builder.Configuration);

        // Configuración de CORS para permitir conexiones desde el Frontend
        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
        });

        // Registro de los servicios del Swagger clásico
        builder.Services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new Microsoft.OpenApi.OpenApiInfo 
            { 
                Title = "Reparto API", 
                Version = "v1" 
            });

            // Configuración para usar JWT Bearer en Swagger
            c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.OpenApiSecurityScheme
            {
                Description = "JWT Authorization header usando el esquema Bearer. Ejemplo: \"Bearer {token}\"",
                Name = "Authorization",
                In = Microsoft.OpenApi.ParameterLocation.Header,
                Type = Microsoft.OpenApi.SecuritySchemeType.ApiKey,
                Scheme = "Bearer"
            });

            c.AddSecurityRequirement(_ => new Microsoft.OpenApi.OpenApiSecurityRequirement
            {
                {
                    new Microsoft.OpenApi.OpenApiSecuritySchemeReference("Bearer", null),
                    []
                }
            });
        });

        var app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Reparto API v1");
                c.RoutePrefix = "swagger"; // La URL será /swagger
            });
        }

        app.UseExceptionHandler();
        app.UseHttpsRedirection();
        app.UseCors(); // Habilitar CORS
        app.UseWebSockets();
        app.UseAuthentication();
        app.UseAuthorization();

        app.MapGet("/", () => Results.Ok(new
        {
            Service = "Reparto Backend",
            Status = "Running",
            Docs = "/swagger"
        }));

        app.MapControllers();
        app.MapHub<DeliveryTrackingHub>("/hubs/delivery-tracking");

        app.Run();
    }
}

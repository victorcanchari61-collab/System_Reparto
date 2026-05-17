using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using Reparto_Backend.Infrastructure.Options;
using Reparto_Backend.Infrastructure.Persistence.PostgreSql;
using StackExchange.Redis;

namespace Reparto_Backend.Infrastructure.DependencyInjection;

public static class InfrastructureServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddPostgreSql(configuration);
        services.AddMongoDb(configuration);
        services.AddRedis(configuration);
        services.AddExternalServicesOptions(configuration);

        return services;
    }

    private static IServiceCollection AddPostgreSql(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("PostgreSql");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("Connection string 'PostgreSql' is not configured.");
        }

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString));

        return services;
    }

    private static IServiceCollection AddMongoDb(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services
            .AddOptions<MongoDbOptions>()
            .Bind(configuration.GetSection(MongoDbOptions.SectionName))
            .Validate(options => !string.IsNullOrWhiteSpace(options.ConnectionString), "MongoDb connection string is required.")
            .Validate(options => !string.IsNullOrWhiteSpace(options.DatabaseName), "MongoDb database name is required.");

        services.AddSingleton<IMongoClient>(serviceProvider =>
        {
            var options = serviceProvider.GetRequiredService<Microsoft.Extensions.Options.IOptions<MongoDbOptions>>().Value;

            return new MongoClient(options.ConnectionString);
        });

        services.AddSingleton(serviceProvider =>
        {
            var options = serviceProvider.GetRequiredService<Microsoft.Extensions.Options.IOptions<MongoDbOptions>>().Value;
            var client = serviceProvider.GetRequiredService<IMongoClient>();

            return client.GetDatabase(options.DatabaseName);
        });

        return services;
    }

    private static IServiceCollection AddRedis(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services
            .AddOptions<RedisOptions>()
            .Bind(configuration.GetSection(RedisOptions.SectionName))
            .Validate(options => !string.IsNullOrWhiteSpace(options.ConnectionString), "Redis connection string is required.");

        services.AddSingleton<IConnectionMultiplexer>(serviceProvider =>
        {
            var options = serviceProvider.GetRequiredService<Microsoft.Extensions.Options.IOptions<RedisOptions>>().Value;

            return ConnectionMultiplexer.Connect(options.ConnectionString);
        });

        services.AddSingleton(serviceProvider =>
            serviceProvider.GetRequiredService<IConnectionMultiplexer>().GetDatabase());

        return services;
    }

    private static IServiceCollection AddExternalServicesOptions(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services
            .AddOptions<ExternalServicesOptions>()
            .Bind(configuration.GetSection(ExternalServicesOptions.SectionName));

        return services;
    }
}

using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using Reparto_Backend.Application.Abstractions.Auth;
using Reparto_Backend.Application.Authorization;
using Reparto_Backend.Infrastructure.Auth;
using Reparto_Backend.Infrastructure.Options;
using Reparto_Backend.Infrastructure.Persistence.PostgreSql.Identity;
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
        services.AddIdentityCore();
        services.AddJwtAuthentication(configuration);
        services.AddMongoDb(configuration);
        services.AddRedis(configuration);
        services.AddExternalServicesOptions(configuration);
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddSingleton<IRefreshTokenService, RefreshTokenService>();

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

    private static IServiceCollection AddIdentityCore(this IServiceCollection services)
    {
        services
            .AddIdentity<ApplicationUser, ApplicationRole>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.Password.RequiredLength = 8;
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;
            })
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

        return services;
    }

    private static IServiceCollection AddJwtAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services
            .AddOptions<JwtOptions>()
            .Bind(configuration.GetSection(JwtOptions.SectionName))
            .Validate(options => !string.IsNullOrWhiteSpace(options.Issuer), "JWT issuer is required.")
            .Validate(options => !string.IsNullOrWhiteSpace(options.Audience), "JWT audience is required.")
            .Validate(options => options.SecretKey.Length >= 32, "JWT secret key must have at least 32 characters.");

        var jwtOptions = configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
            ?? throw new InvalidOperationException("JWT options are not configured.");
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SecretKey));

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtOptions.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwtOptions.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = signingKey,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromMinutes(1)
                };
            });

        services.AddAuthorizationBuilder()
            .AddPolicy("authenticated", policy => policy.RequireAuthenticatedUser());

        foreach (var permission in SystemPermissions.All)
        {
            services.AddAuthorizationBuilder()
                .AddPolicy(permission, policy => policy.RequireClaim(PermissionClaimTypes.Permission, permission));
        }

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

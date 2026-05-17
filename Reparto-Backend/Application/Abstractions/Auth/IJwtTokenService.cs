using Reparto_Backend.Infrastructure.Persistence.PostgreSql.Identity;

namespace Reparto_Backend.Application.Abstractions.Auth;

public interface IJwtTokenService
{
    Task<JwtTokenResult> CreateAccessTokenAsync(ApplicationUser user);
}

public sealed record JwtTokenResult(
    string AccessToken,
    DateTime ExpiresAtUtc);

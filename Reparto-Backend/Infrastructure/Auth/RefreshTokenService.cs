using System.Security.Cryptography;
using System.Text;
using Reparto_Backend.Application.Abstractions.Auth;

namespace Reparto_Backend.Infrastructure.Auth;

public sealed class RefreshTokenService : IRefreshTokenService
{
    public string CreateToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }

    public string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));

        return Convert.ToHexString(bytes);
    }
}

namespace Reparto_Backend.Application.Abstractions.Auth;

public interface IRefreshTokenService
{
    string CreateToken();

    string HashToken(string token);
}

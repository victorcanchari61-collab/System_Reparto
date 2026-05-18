using Reparto_Backend.Application.DTOs.Auth.Requests;
using Reparto_Backend.Application.DTOs.Auth.Responses;

namespace Reparto_Backend.Application.Abstractions.Auth;

public interface IAuthService
{
    Task<AuthResult> RegisterCompanyAsync(RegisterCompanyRequest request);
    Task<AuthResult> LoginAsync(LoginRequest request);
    Task<AuthResult> RefreshAsync(string refreshToken);
    Task LogoutAsync(string refreshToken);
}

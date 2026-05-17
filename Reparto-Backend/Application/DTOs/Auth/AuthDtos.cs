namespace Reparto_Backend.Application.DTOs.Auth;

public sealed record RegisterCompanyRequest(
    string Ruc,
    string BusinessName,
    string TradeName,
    string Address,
    string Phone,
    string CompanyEmail,
    string AdminFullName,
    string AdminEmail,
    string AdminPhone,
    string AdminPassword);

public sealed record LoginRequest(
    string Email,
    string Password);

public sealed record RefreshTokenRequest(
    string RefreshToken);

public sealed record AuthResponse(
    string AccessToken,
    DateTime AccessTokenExpiresAtUtc,
    string RefreshToken,
    Guid UserId,
    Guid CompanyId,
    string FullName,
    string Email);

public sealed record AuthResult
{
    public AuthResponse? Response { get; private init; }
    public string? Error { get; private init; }
    public bool IsSuccess => Error is null;

    public static AuthResult Success(AuthResponse response) => new() { Response = response };
    public static AuthResult Failure(string error) => new() { Error = error };
}

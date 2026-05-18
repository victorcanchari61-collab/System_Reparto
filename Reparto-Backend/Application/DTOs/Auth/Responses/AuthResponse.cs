namespace Reparto_Backend.Application.DTOs.Auth.Responses;

public sealed record AuthResponse(
    string AccessToken,
    DateTime AccessTokenExpiresAtUtc,
    string RefreshToken,
    Guid UserId,
    Guid CompanyId,
    string FullName,
    string Email,
    bool IsOwner);

/// <summary>
/// Resultado interno del servicio de autenticación.
/// Envuelve AuthResponse en caso de éxito o un mensaje de error.
/// </summary>
public sealed record AuthResult
{
    public AuthResponse? Response { get; private init; }
    public string? Error { get; private init; }
    public bool IsSuccess => Error is null;

    public static AuthResult Success(AuthResponse response) => new() { Response = response };
    public static AuthResult Failure(string error) => new() { Error = error };
}

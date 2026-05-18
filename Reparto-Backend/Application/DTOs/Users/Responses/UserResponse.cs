namespace Reparto_Backend.Application.DTOs.Users.Responses;

public sealed record UserResponse(
    Guid     Id,
    string   FullName,
    string   Email,
    string   Phone,
    bool     IsActive,
    DateTime CreatedAtUtc);

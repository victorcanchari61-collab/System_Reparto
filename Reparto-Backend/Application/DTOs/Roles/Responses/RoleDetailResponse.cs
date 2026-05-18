namespace Reparto_Backend.Application.DTOs.Roles.Responses;

public sealed record RoleDetailResponse(
    Guid                 Id,
    string               Name,
    string               Description,
    bool                 IsSystem,
    IReadOnlyList<string> Permissions);

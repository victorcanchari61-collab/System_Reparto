namespace Reparto_Backend.Application.DTOs.Roles.Responses;

public sealed record RoleResponse(
    Guid   Id,
    string Name,
    string Description,
    bool   IsSystem,
    int    PermissionsCount);

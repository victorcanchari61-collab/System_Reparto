namespace Reparto_Backend.Application.DTOs.Roles.Requests;

public sealed record UpdateRoleRequest(
    string  Name,
    string? Description);

namespace Reparto_Backend.Application.DTOs.Roles.Requests;

public sealed record CreateRoleRequest(
    string  Name,
    string? Description);

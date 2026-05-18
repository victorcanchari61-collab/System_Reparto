namespace Reparto_Backend.Application.DTOs.Permissions.Responses;

public sealed record PermissionGroupResponse(
    string                          Group,
    string                          GroupLabel,
    IReadOnlyList<PermissionItem>   Permissions);

public sealed record PermissionItem(
    string Key,
    string Label);

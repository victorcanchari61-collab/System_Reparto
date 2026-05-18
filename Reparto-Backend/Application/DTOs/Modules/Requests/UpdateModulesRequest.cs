namespace Reparto_Backend.Application.DTOs.Modules.Requests;

public sealed record UpdateModulesRequest(List<ModuleToggle> Modules);

public sealed record ModuleToggle(
    string    Key,
    bool      IsEnabled,
    DateTime? ExpiresAt = null);

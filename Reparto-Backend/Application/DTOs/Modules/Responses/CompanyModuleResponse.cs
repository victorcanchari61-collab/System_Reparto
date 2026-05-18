namespace Reparto_Backend.Application.DTOs.Modules.Responses;

public sealed record CompanyModuleResponse(
    string    Key,
    string    Label,
    string    Description,
    bool      IsEnabled,
    DateTime? ExpiresAt);

namespace Reparto_Backend.Application.DTOs.Companies.Responses;

public sealed record ToggleStatusResponse(
    Guid Id,
    bool IsActive);

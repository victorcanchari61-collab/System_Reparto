namespace Reparto_Backend.Application.DTOs.Companies.Responses;

public sealed record CompanyListItemResponse(
    Guid     Id,
    string   Ruc,
    string   BusinessName,
    string   TradeName,
    bool     IsActive,
    DateTime CreatedAtUtc);

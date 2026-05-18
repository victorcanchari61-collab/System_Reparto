namespace Reparto_Backend.Application.DTOs.Companies.Responses;

public sealed record CompanyDetailResponse(
    Guid     Id,
    string   Ruc,
    string   BusinessName,
    string   TradeName,
    string   Address,
    string   Phone,
    string   Email,
    string?  Logo,
    string?  SunatSolUser,
    bool     IsActive,
    DateTime CreatedAtUtc,
    int      ActiveModules);

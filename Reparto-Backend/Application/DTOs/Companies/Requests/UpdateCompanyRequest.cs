namespace Reparto_Backend.Application.DTOs.Companies.Requests;

public sealed record UpdateCompanyRequest(
    string  BusinessName,
    string? TradeName,
    string  Address,
    string  Phone,
    string  CompanyEmail,
    string? Logo,
    string? SunatSolUser,
    string? SunatSolPassword);

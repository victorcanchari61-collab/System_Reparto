namespace Reparto_Backend.Application.DTOs.Auth.Requests;

public sealed record RegisterCompanyRequest(
    string Ruc,
    string BusinessName,
    string TradeName,
    string Address,
    string Phone,
    string CompanyEmail,
    string? Logo,
    string? SunatSolUser,
    string? SunatSolPassword,
    string AdminFullName,
    string AdminEmail,
    string AdminPhone,
    string AdminPassword);

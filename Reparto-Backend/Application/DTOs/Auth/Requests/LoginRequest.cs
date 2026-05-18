namespace Reparto_Backend.Application.DTOs.Auth.Requests;

public sealed record LoginRequest(
    string Email,
    string Password);

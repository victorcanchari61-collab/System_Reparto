namespace Reparto_Backend.Application.DTOs.Users.Requests;

public sealed record UpdateUserRequest(
    string FullName,
    string Phone);

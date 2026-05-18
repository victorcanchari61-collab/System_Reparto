namespace Reparto_Backend.Application.DTOs.Users.Requests;

public sealed record CreateUserRequest(
    string FullName,
    string Email,
    string Phone,
    string Password,
    Guid?  RoleId = null);

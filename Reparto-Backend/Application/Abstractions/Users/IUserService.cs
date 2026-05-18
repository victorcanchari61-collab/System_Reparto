using Reparto_Backend.Application.Common;
using Reparto_Backend.Application.DTOs.Users.Requests;
using Reparto_Backend.Application.DTOs.Users.Responses;

namespace Reparto_Backend.Application.Abstractions.Users;

public interface IUserService
{
    Task<IReadOnlyList<UserResponse>>    GetAllAsync();
    Task<UserResponse?>                  GetByIdAsync(Guid id);
    Task<ServiceResult<UserResponse>>    CreateAsync(CreateUserRequest request);
    Task<ServiceResult>                  UpdateAsync(Guid id, UpdateUserRequest request);
    Task<ServiceResult>                  AssignRoleAsync(Guid userId, AssignRoleRequest request);
    Task<ServiceResult>                  ToggleStatusAsync(Guid id);
}

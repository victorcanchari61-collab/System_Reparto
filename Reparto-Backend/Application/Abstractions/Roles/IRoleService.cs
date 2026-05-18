using Reparto_Backend.Application.Common;
using Reparto_Backend.Application.DTOs.Roles.Requests;
using Reparto_Backend.Application.DTOs.Roles.Responses;

namespace Reparto_Backend.Application.Abstractions.Roles;

public interface IRoleService
{
    Task<IReadOnlyList<RoleResponse>>   GetAllAsync();
    Task<RoleDetailResponse?>           GetByIdAsync(Guid id);
    Task<ServiceResult<RoleResponse>>   CreateAsync(CreateRoleRequest request);
    Task<ServiceResult>                 UpdateAsync(Guid id, UpdateRoleRequest request);
    Task<ServiceResult>                 DeleteAsync(Guid id);
    Task<ServiceResult>                 SetPermissionsAsync(Guid id, SetRolePermissionsRequest request);
}

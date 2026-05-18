using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Reparto_Backend.Application.Abstractions.Auth;
using Reparto_Backend.Application.Abstractions.Roles;
using Reparto_Backend.Application.Authorization;
using Reparto_Backend.Application.Common;
using Reparto_Backend.Application.DTOs.Roles.Requests;
using Reparto_Backend.Application.DTOs.Roles.Responses;
using Reparto_Backend.Infrastructure.Persistence.PostgreSql.Identity;

namespace Reparto_Backend.Infrastructure.Services;

public sealed class RoleService(
    RoleManager<ApplicationRole> roleManager,
    ITenantProvider               tenantProvider) : IRoleService
{
    /* ── Consultas ───────────────────────────────────────── */

    public async Task<IReadOnlyList<RoleResponse>> GetAllAsync()
    {
        var tenantId = tenantProvider.TenantId;
        var roles    = await roleManager.Roles
            .Where(r => r.CompanyId == tenantId)
            .ToListAsync();

        var result = new List<RoleResponse>();
        foreach (var r in roles)
        {
            var claims = await roleManager.GetClaimsAsync(r);
            var count  = claims.Count(c => c.Type == PermissionClaimTypes.Permission);
            result.Add(new RoleResponse(r.Id, r.Name!, r.Description, r.IsSystem, count));
        }

        return result.OrderByDescending(r => r.IsSystem).ThenBy(r => r.Name).ToList();
    }

    public async Task<RoleDetailResponse?> GetByIdAsync(Guid id)
    {
        var role = await roleManager.Roles
            .FirstOrDefaultAsync(r => r.Id == id && r.CompanyId == tenantProvider.TenantId);
        if (role is null) return null;

        var claims      = await roleManager.GetClaimsAsync(role);
        var permissions = claims
            .Where(c => c.Type == PermissionClaimTypes.Permission)
            .Select(c => c.Value)
            .ToList();

        return new RoleDetailResponse(role.Id, role.Name!, role.Description, role.IsSystem, permissions);
    }

    /* ── Comandos ────────────────────────────────────────── */

    public async Task<ServiceResult<RoleResponse>> CreateAsync(CreateRoleRequest request)
    {
        var role = new ApplicationRole
        {
            CompanyId   = tenantProvider.TenantId,
            Name        = request.Name.Trim(),
            Description = request.Description?.Trim() ?? string.Empty,
        };

        var result = await roleManager.CreateAsync(role);
        if (!result.Succeeded)
            return ServiceResult<RoleResponse>.Failure(
                string.Join(", ", result.Errors.Select(e => e.Description)));

        return ServiceResult<RoleResponse>.Success(
            new RoleResponse(role.Id, role.Name!, role.Description, role.IsSystem, 0));
    }

    public async Task<ServiceResult> UpdateAsync(Guid id, UpdateRoleRequest request)
    {
        var role = await GetTenantRoleAsync(id);
        if (role is null) return ServiceResult.Failure("Rol no encontrado.");
        if (role.IsSystem) return ServiceResult.Failure("No se puede modificar un rol del sistema.");

        role.Name        = request.Name.Trim();
        role.Description = request.Description?.Trim() ?? role.Description;

        var result = await roleManager.UpdateAsync(role);
        return result.Succeeded
            ? ServiceResult.Success()
            : ServiceResult.Failure(string.Join(", ", result.Errors.Select(e => e.Description)));
    }

    public async Task<ServiceResult> DeleteAsync(Guid id)
    {
        var role = await GetTenantRoleAsync(id);
        if (role is null) return ServiceResult.Failure("Rol no encontrado.");
        if (role.IsSystem) return ServiceResult.Failure("No se puede eliminar un rol del sistema.");

        var result = await roleManager.DeleteAsync(role);
        return result.Succeeded
            ? ServiceResult.Success()
            : ServiceResult.Failure(string.Join(", ", result.Errors.Select(e => e.Description)));
    }

    public async Task<ServiceResult> SetPermissionsAsync(Guid id, SetRolePermissionsRequest request)
    {
        var role = await GetTenantRoleAsync(id);
        if (role is null) return ServiceResult.Failure("Rol no encontrado.");
        if (role.IsSystem) return ServiceResult.Failure("No se puede modificar permisos de un rol del sistema.");

        var existing = await roleManager.GetClaimsAsync(role);
        foreach (var claim in existing.Where(c => c.Type == PermissionClaimTypes.Permission))
            await roleManager.RemoveClaimAsync(role, claim);

        foreach (var permission in request.Permissions.Distinct().Where(SystemPermissions.All.Contains))
            await roleManager.AddClaimAsync(role, new Claim(PermissionClaimTypes.Permission, permission));

        return ServiceResult.Success();
    }

    /* ── Helpers privados ────────────────────────────────── */

    private Task<ApplicationRole?> GetTenantRoleAsync(Guid id) =>
        roleManager.Roles
            .FirstOrDefaultAsync(r => r.Id == id && r.CompanyId == tenantProvider.TenantId);
}

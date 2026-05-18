using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Reparto_Backend.Application.Abstractions.Auth;
using Reparto_Backend.Application.Abstractions.Users;
using Reparto_Backend.Application.Authorization;
using Reparto_Backend.Application.Common;
using Reparto_Backend.Application.DTOs.Users.Requests;
using Reparto_Backend.Application.DTOs.Users.Responses;
using Reparto_Backend.Infrastructure.Persistence.PostgreSql;
using Reparto_Backend.Infrastructure.Persistence.PostgreSql.Identity;

namespace Reparto_Backend.Infrastructure.Services;

public sealed class UserService(
    UserManager<ApplicationUser>  userManager,
    RoleManager<ApplicationRole>  roleManager,
    ApplicationDbContext           db,
    ITenantProvider                tenantProvider) : IUserService
{
    /* ── Consultas ───────────────────────────────────────── */

    public async Task<IReadOnlyList<UserResponse>> GetAllAsync()
    {
        var users = await (
            from u in userManager.Users
            join ur in db.UserRoles on u.Id equals ur.UserId into userRoles
            from ur in userRoles.DefaultIfEmpty()
            join r in roleManager.Roles on ur.RoleId equals r.Id into roles
            from r in roles.DefaultIfEmpty()
            orderby u.CreatedAtUtc descending
            select new UserResponse(
                u.Id, u.FullName,
                u.Email ?? string.Empty,
                u.PhoneNumber ?? string.Empty,
                u.IsActive, u.CreatedAtUtc,
                r != null ? r.Id       : (Guid?)null,
                r != null ? r.Name     : null)
        ).ToListAsync();

        return users;
    }

    public async Task<UserResponse?> GetByIdAsync(Guid id)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user is null) return null;

        var roleNames = await userManager.GetRolesAsync(user);
        var roleName  = roleNames.FirstOrDefault();
        var role      = roleName is not null
            ? await roleManager.FindByNameAsync(roleName)
            : null;

        return MapToResponse(user, role);
    }

    /* ── Comandos ────────────────────────────────────────── */

    public async Task<ServiceResult<UserResponse>> CreateAsync(CreateUserRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToUpperInvariant();
        if (await userManager.Users.AnyAsync(u => u.NormalizedEmail == normalizedEmail))
            return ServiceResult<UserResponse>.Failure("El email ya está registrado en esta empresa.");

        ApplicationRole? role = null;
        if (request.RoleId.HasValue)
        {
            role = await roleManager.Roles
                .FirstOrDefaultAsync(r => r.Id == request.RoleId.Value
                                       && r.CompanyId == tenantProvider.TenantId);
            if (role is null)
                return ServiceResult<UserResponse>.Failure("El rol especificado no existe.");
        }

        var user = new ApplicationUser
        {
            CompanyId      = tenantProvider.TenantId,
            FullName       = request.FullName.Trim(),
            UserName       = request.Email.Trim(),
            Email          = request.Email.Trim(),
            EmailConfirmed = true,
            PhoneNumber    = request.Phone.Trim()
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return ServiceResult<UserResponse>.Failure(
                string.Join(", ", result.Errors.Select(e => e.Description)));

        if (role is not null)
            await userManager.AddToRoleAsync(user, role.Name!);

        return ServiceResult<UserResponse>.Success(MapToResponse(user, role));
    }

    public async Task<ServiceResult> UpdateAsync(Guid id, UpdateUserRequest request)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user is null) return ServiceResult.Failure("Usuario no encontrado.");

        user.FullName    = request.FullName.Trim();
        user.PhoneNumber = request.Phone.Trim();

        var result = await userManager.UpdateAsync(user);
        return result.Succeeded
            ? ServiceResult.Success()
            : ServiceResult.Failure(string.Join(", ", result.Errors.Select(e => e.Description)));
    }

    public async Task<ServiceResult> AssignRoleAsync(Guid userId, AssignRoleRequest request)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null) return ServiceResult.Failure("Usuario no encontrado.");

        var role = await roleManager.Roles
            .FirstOrDefaultAsync(r => r.Id == request.RoleId
                                   && r.CompanyId == tenantProvider.TenantId);
        if (role is null) return ServiceResult.Failure("El rol especificado no existe.");

        var current = await userManager.GetRolesAsync(user);
        if (current.Any())
            await userManager.RemoveFromRolesAsync(user, current);

        await userManager.AddToRoleAsync(user, role.Name!);
        return ServiceResult.Success();
    }

    public async Task<ServiceResult> ToggleStatusAsync(Guid id)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user is null) return ServiceResult.Failure("Usuario no encontrado.");

        user.IsActive = !user.IsActive;

        var result = await userManager.UpdateAsync(user);
        return result.Succeeded
            ? ServiceResult.Success()
            : ServiceResult.Failure(string.Join(", ", result.Errors.Select(e => e.Description)));
    }

    /* ── Mapeo interno ───────────────────────────────────── */

    private static UserResponse MapToResponse(ApplicationUser user, ApplicationRole? role) =>
        new(user.Id, user.FullName,
            user.Email ?? string.Empty,
            user.PhoneNumber ?? string.Empty,
            user.IsActive, user.CreatedAtUtc,
            role?.Id, role?.Name);
}

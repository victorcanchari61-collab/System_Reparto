using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Reparto_Backend.Application.Abstractions.Auth;
using Reparto_Backend.Application.Authorization;
using Reparto_Backend.Application.DTOs.Roles.Requests;
using Reparto_Backend.Application.DTOs.Roles.Responses;
using Reparto_Backend.Infrastructure.Persistence.PostgreSql.Identity;

namespace Reparto_Backend.Presentation.Controllers;

[ApiController]
[Route("api/roles")]
[Authorize]
public class RolesController(
    RoleManager<ApplicationRole> roleManager,
    ITenantProvider tenantProvider) : ControllerBase
{
    /* ── GET /api/roles ──────────────────────────────────── */
    [HttpGet]
    [Authorize(Policy = SystemPermissions.RolesView)]
    public async Task<IActionResult> GetAll()
    {
        var tenantId = tenantProvider.TenantId;

        var roles = await roleManager.Roles
            .Where(r => r.CompanyId == tenantId)
            .ToListAsync();

        var result = new List<RoleResponse>();
        foreach (var r in roles)
        {
            var claims = await roleManager.GetClaimsAsync(r);
            var count  = claims.Count(c => c.Type == PermissionClaimTypes.Permission);
            result.Add(new RoleResponse(r.Id, r.Name!, r.Description, r.IsSystem, count));
        }

        return Ok(result.OrderByDescending(r => r.IsSystem).ThenBy(r => r.Name));
    }

    /* ── GET /api/roles/{id} ─────────────────────────────── */
    [HttpGet("{id:guid}")]
    [Authorize(Policy = SystemPermissions.RolesView)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var role = await roleManager.Roles
            .FirstOrDefaultAsync(r => r.Id == id && r.CompanyId == tenantProvider.TenantId);
        if (role is null) return NotFound();

        var claims      = await roleManager.GetClaimsAsync(role);
        var permissions = claims
            .Where(c => c.Type == PermissionClaimTypes.Permission)
            .Select(c => c.Value)
            .ToList();

        return Ok(new RoleDetailResponse(role.Id, role.Name!, role.Description, role.IsSystem, permissions));
    }

    /* ── POST /api/roles ─────────────────────────────────── */
    [HttpPost]
    [Authorize(Policy = SystemPermissions.RolesCreate)]
    public async Task<IActionResult> Create([FromBody] CreateRoleRequest request)
    {
        var role = new ApplicationRole
        {
            CompanyId   = tenantProvider.TenantId,
            Name        = request.Name.Trim(),
            Description = request.Description?.Trim() ?? string.Empty,
        };

        var result = await roleManager.CreateAsync(role);
        if (!result.Succeeded)
            return BadRequest(new { Errors = result.Errors.Select(e => e.Description) });

        return CreatedAtAction(nameof(GetById), new { id = role.Id },
            new RoleResponse(role.Id, role.Name!, role.Description, role.IsSystem, 0));
    }

    /* ── PUT /api/roles/{id} ─────────────────────────────── */
    [HttpPut("{id:guid}")]
    [Authorize(Policy = SystemPermissions.RolesUpdate)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRoleRequest request)
    {
        var role = await roleManager.Roles
            .FirstOrDefaultAsync(r => r.Id == id && r.CompanyId == tenantProvider.TenantId);
        if (role is null) return NotFound();
        if (role.IsSystem) return BadRequest(new { Message = "No se puede modificar un rol del sistema." });

        role.Name        = request.Name.Trim();
        role.Description = request.Description?.Trim() ?? role.Description;

        var result = await roleManager.UpdateAsync(role);
        if (!result.Succeeded)
            return BadRequest(new { Errors = result.Errors.Select(e => e.Description) });

        return NoContent();
    }

    /* ── DELETE /api/roles/{id} ──────────────────────────── */
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = SystemPermissions.RolesUpdate)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var role = await roleManager.Roles
            .FirstOrDefaultAsync(r => r.Id == id && r.CompanyId == tenantProvider.TenantId);
        if (role is null) return NotFound();
        if (role.IsSystem) return BadRequest(new { Message = "No se puede eliminar un rol del sistema." });

        var result = await roleManager.DeleteAsync(role);
        if (!result.Succeeded)
            return BadRequest(new { Errors = result.Errors.Select(e => e.Description) });

        return NoContent();
    }

    /* ── PUT /api/roles/{id}/permissions ─────────────────── */
    [HttpPut("{id:guid}/permissions")]
    [Authorize(Policy = SystemPermissions.RolesUpdate)]
    public async Task<IActionResult> SetPermissions(Guid id, [FromBody] SetRolePermissionsRequest request)
    {
        var role = await roleManager.Roles
            .FirstOrDefaultAsync(r => r.Id == id && r.CompanyId == tenantProvider.TenantId);
        if (role is null) return NotFound();
        if (role.IsSystem) return BadRequest(new { Message = "No se puede modificar permisos de un rol del sistema." });

        var existing = await roleManager.GetClaimsAsync(role);
        foreach (var claim in existing.Where(c => c.Type == PermissionClaimTypes.Permission))
            await roleManager.RemoveClaimAsync(role, claim);

        foreach (var permission in request.Permissions.Distinct())
        {
            if (SystemPermissions.All.Contains(permission))
                await roleManager.AddClaimAsync(role, new Claim(PermissionClaimTypes.Permission, permission));
        }

        return NoContent();
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Reparto_Backend.Application.Abstractions.Auth;
using Reparto_Backend.Application.Authorization;
using Reparto_Backend.Infrastructure.Persistence.PostgreSql.Identity;

namespace Reparto_Backend.Presentation.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITenantProvider _tenantProvider;

    public UsersController(
        UserManager<ApplicationUser> userManager,
        ITenantProvider tenantProvider)
    {
        _userManager = userManager;
        _tenantProvider = tenantProvider;
    }

    /// <summary>
    /// Obtiene la lista de todos los usuarios pertenecientes a la empresa (Tenant) del administrador actual.
    /// El filtro global de EF Core restringe automáticamente el listado a la empresa actual.
    /// </summary>
    [HttpGet]
    [Authorize(Policy = SystemPermissions.UsersView)]
    public async Task<IActionResult> GetUsers()
    {
        // The EF Core Global Query Filter automatically filters these users by CompanyId
        var users = await _userManager.Users
            .OrderByDescending(u => u.CreatedAtUtc)
            .Select(u => new UserResponse(
                u.Id,
                u.FullName,
                u.Email ?? string.Empty,
                u.PhoneNumber ?? string.Empty,
                u.IsActive,
                u.CreatedAtUtc))
            .ToListAsync();

        return Ok(users);
    }

    /// <summary>
    /// Obtiene los detalles de un usuario específico por su ID.
    /// El filtro global de EF Core garantiza seguridad IDOR: si el usuario no pertenece a la misma empresa, retornará un 404 (No Encontrado).
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize(Policy = SystemPermissions.UsersView)]
    public async Task<IActionResult> GetUserById(Guid id)
    {
        // The EF Core Global Query Filter ensures a user from another company cannot be retrieved
        var user = await _userManager.Users
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user is null)
        {
            return NotFound();
        }

        return Ok(new UserResponse(
            user.Id,
            user.FullName,
            user.Email ?? string.Empty,
            user.PhoneNumber ?? string.Empty,
            user.IsActive,
            user.CreatedAtUtc));
    }

    /// <summary>
    /// Registra y crea un nuevo usuario de tipo empleado o sub-administrador dentro de la empresa (Tenant) actual.
    /// Asocia automáticamente al usuario con la claim 'company_id' del administrador logueado.
    /// </summary>
    [HttpPost]
    [Authorize(Policy = SystemPermissions.UsersCreate)]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToUpperInvariant();
        
        // Check uniqueness within the tenant (query filter active)
        var emailExists = await _userManager.Users.AnyAsync(u => u.NormalizedEmail == normalizedEmail);
        if (emailExists)
        {
            return BadRequest(new { Message = "Email is already registered for this company." });
        }

        var user = new ApplicationUser
        {
            CompanyId = _tenantProvider.TenantId,
            FullName = request.FullName.Trim(),
            UserName = request.Email.Trim(),
            Email = request.Email.Trim(),
            EmailConfirmed = true,
            PhoneNumber = request.Phone.Trim()
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new { Errors = result.Errors.Select(e => e.Description) });
        }

        return CreatedAtAction(
            nameof(GetUserById),
            new { id = user.Id },
            new UserResponse(
                user.Id,
                user.FullName,
                user.Email ?? string.Empty,
                user.PhoneNumber ?? string.Empty,
                user.IsActive,
                user.CreatedAtUtc));
    }

    /// <summary>
    /// Actualiza la información básica (Nombre completo y Teléfono) de un usuario específico.
    /// Solo permite modificar usuarios que pertenezcan a la misma empresa (Tenant).
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = SystemPermissions.UsersUpdate)]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        // Query filter prevents editing users from other companies
        var user = await _userManager.Users
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user is null)
        {
            return NotFound();
        }

        user.FullName = request.FullName.Trim();
        user.PhoneNumber = request.Phone.Trim();

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(new { Errors = result.Errors.Select(e => e.Description) });
        }

        return NoContent();
    }

    /// <summary>
    /// Alterna el estado de activación de un usuario (Activo/Inactivo).
    /// Funciona como baja lógica (Soft Delete) o suspensión de cuenta.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = SystemPermissions.UsersUpdate)]
    public async Task<IActionResult> ToggleUserStatus(Guid id)
    {
        // Query filter prevents accessing users from other companies
        var user = await _userManager.Users
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user is null)
        {
            return NotFound();
        }

        user.IsActive = !user.IsActive;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(new { Errors = result.Errors.Select(e => e.Description) });
        }

        return NoContent();
    }
}

public sealed record CreateUserRequest(
    string FullName,
    string Email,
    string Phone,
    string Password);

public sealed record UpdateUserRequest(
    string FullName,
    string Phone);

public sealed record UserResponse(
    Guid Id,
    string FullName,
    string Email,
    string Phone,
    bool IsActive,
    DateTime CreatedAtUtc);

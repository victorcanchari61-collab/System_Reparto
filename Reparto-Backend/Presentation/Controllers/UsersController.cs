using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Reparto_Backend.Application.Abstractions.Auth;
using Reparto_Backend.Application.Authorization;
using Reparto_Backend.Application.DTOs.Users.Requests;
using Reparto_Backend.Application.DTOs.Users.Responses;
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

    [HttpGet]
    [Authorize(Policy = SystemPermissions.UsersView)]
    public async Task<IActionResult> GetUsers()
    {
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

    [HttpGet("{id:guid}")]
    [Authorize(Policy = SystemPermissions.UsersView)]
    public async Task<IActionResult> GetUserById(Guid id)
    {
        var user = await _userManager.Users
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user is null)
            return NotFound();

        return Ok(new UserResponse(
            user.Id,
            user.FullName,
            user.Email ?? string.Empty,
            user.PhoneNumber ?? string.Empty,
            user.IsActive,
            user.CreatedAtUtc));
    }

    [HttpPost]
    [Authorize(Policy = SystemPermissions.UsersCreate)]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToUpperInvariant();

        var emailExists = await _userManager.Users.AnyAsync(u => u.NormalizedEmail == normalizedEmail);
        if (emailExists)
            return BadRequest(new { Message = "Email is already registered for this company." });

        var user = new ApplicationUser
        {
            CompanyId    = _tenantProvider.TenantId,
            FullName     = request.FullName.Trim(),
            UserName     = request.Email.Trim(),
            Email        = request.Email.Trim(),
            EmailConfirmed = true,
            PhoneNumber  = request.Phone.Trim()
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return BadRequest(new { Errors = result.Errors.Select(e => e.Description) });

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

    [HttpPut("{id:guid}")]
    [Authorize(Policy = SystemPermissions.UsersUpdate)]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user is null)
            return NotFound();

        user.FullName    = request.FullName.Trim();
        user.PhoneNumber = request.Phone.Trim();

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return BadRequest(new { Errors = result.Errors.Select(e => e.Description) });

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = SystemPermissions.UsersUpdate)]
    public async Task<IActionResult> ToggleUserStatus(Guid id)
    {
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user is null)
            return NotFound();

        user.IsActive = !user.IsActive;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return BadRequest(new { Errors = result.Errors.Select(e => e.Description) });

        return NoContent();
    }
}

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Reparto_Backend.Application.Abstractions.Auth;
using Reparto_Backend.Application.Authorization;
using Reparto_Backend.Application.DTOs.Auth.Requests;

namespace Reparto_Backend.Presentation.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register-company")]
    [Authorize]
    public async Task<IActionResult> RegisterCompany([FromBody] RegisterCompanyRequest request)
    {
        var result = await _authService.RegisterCompanyAsync(request);
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error });
        return Created($"/api/companies/{result.Response!.CompanyId}", result.Response);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        if (!result.IsSuccess)
            return Unauthorized();
        return Ok(result.Response);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
    {
        var result = await _authService.RefreshAsync(request.RefreshToken);
        if (!result.IsSuccess)
            return Unauthorized();
        return Ok(result.Response);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenRequest request)
    {
        await _authService.LogoutAsync(request.RefreshToken);
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        return Ok(new
        {
            UserId    = User.FindFirstValue(ClaimTypes.NameIdentifier),
            CompanyId = User.FindFirstValue(PermissionClaimTypes.CompanyId),
            Email     = User.FindFirstValue(ClaimTypes.Email),
            FullName  = User.FindFirstValue(ClaimTypes.Name),
            Roles       = User.FindAll(ClaimTypes.Role).Select(c => c.Value).Distinct(),
            Permissions = User.FindAll(PermissionClaimTypes.Permission).Select(c => c.Value).Distinct()
        });
    }
}

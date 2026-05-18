using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Reparto_Backend.Application.Abstractions.Users;
using Reparto_Backend.Application.Authorization;
using Reparto_Backend.Application.DTOs.Users.Requests;

namespace Reparto_Backend.Presentation.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController(IUserService userService) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = SystemPermissions.UsersView)]
    public async Task<IActionResult> GetUsers()
        => Ok(await userService.GetAllAsync());

    [HttpGet("{id:guid}")]
    [Authorize(Policy = SystemPermissions.UsersView)]
    public async Task<IActionResult> GetUserById(Guid id)
    {
        var user = await userService.GetByIdAsync(id);
        return user is null ? NotFound() : Ok(user);
    }

    [HttpPost]
    [Authorize(Policy = SystemPermissions.UsersCreate)]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        var result = await userService.CreateAsync(request);
        if (!result.IsSuccess) return BadRequest(new { Message = result.Error });
        return CreatedAtAction(nameof(GetUserById), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = SystemPermissions.UsersUpdate)]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        var result = await userService.UpdateAsync(id, request);
        return result.IsSuccess ? NoContent() : BadRequest(new { Message = result.Error });
    }

    [HttpPut("{id:guid}/role")]
    [Authorize(Policy = SystemPermissions.UsersUpdate)]
    public async Task<IActionResult> AssignRole(Guid id, [FromBody] AssignRoleRequest request)
    {
        var result = await userService.AssignRoleAsync(id, request);
        return result.IsSuccess ? NoContent() : BadRequest(new { Message = result.Error });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = SystemPermissions.UsersUpdate)]
    public async Task<IActionResult> ToggleUserStatus(Guid id)
    {
        var result = await userService.ToggleStatusAsync(id);
        return result.IsSuccess ? NoContent() : BadRequest(new { Message = result.Error });
    }
}

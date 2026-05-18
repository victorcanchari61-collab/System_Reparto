using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Reparto_Backend.Application.Abstractions.Roles;
using Reparto_Backend.Application.Authorization;
using Reparto_Backend.Application.DTOs.Roles.Requests;

namespace Reparto_Backend.Presentation.Controllers;

[ApiController]
[Route("api/roles")]
[Authorize]
public class RolesController(IRoleService roleService) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = SystemPermissions.RolesView)]
    public async Task<IActionResult> GetAll()
        => Ok(await roleService.GetAllAsync());

    [HttpGet("{id:guid}")]
    [Authorize(Policy = SystemPermissions.RolesView)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var role = await roleService.GetByIdAsync(id);
        return role is null ? NotFound() : Ok(role);
    }

    [HttpPost]
    [Authorize(Policy = SystemPermissions.RolesCreate)]
    public async Task<IActionResult> Create([FromBody] CreateRoleRequest request)
    {
        var result = await roleService.CreateAsync(request);
        if (!result.IsSuccess) return BadRequest(new { Message = result.Error });
        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = SystemPermissions.RolesUpdate)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRoleRequest request)
    {
        var result = await roleService.UpdateAsync(id, request);
        return result.IsSuccess ? NoContent() : BadRequest(new { Message = result.Error });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = SystemPermissions.RolesUpdate)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await roleService.DeleteAsync(id);
        return result.IsSuccess ? NoContent() : BadRequest(new { Message = result.Error });
    }

    [HttpPut("{id:guid}/permissions")]
    [Authorize(Policy = SystemPermissions.RolesUpdate)]
    public async Task<IActionResult> SetPermissions(Guid id, [FromBody] SetRolePermissionsRequest request)
    {
        var result = await roleService.SetPermissionsAsync(id, request);
        return result.IsSuccess ? NoContent() : BadRequest(new { Message = result.Error });
    }
}

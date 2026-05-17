using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Reparto_Backend.Infrastructure.Persistence.PostgreSql;

namespace Reparto_Backend.Presentation.Controllers;

[ApiController]
[Route("api/companies")]
[Authorize]
public class CompaniesController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;

    public CompaniesController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var companies = await _dbContext.Companies
            .OrderByDescending(c => c.CreatedAtUtc)
            .Select(c => new
            {
                c.Id,
                c.Ruc,
                c.BusinessName,
                c.TradeName,
                c.IsActive,
                c.CreatedAtUtc
            })
            .ToListAsync();

        return Ok(companies);
    }
}

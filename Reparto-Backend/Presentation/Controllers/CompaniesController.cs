using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Reparto_Backend.Application.Constants;
using Reparto_Backend.Application.DTOs.Companies.Requests;
using Reparto_Backend.Application.DTOs.Companies.Responses;
using Reparto_Backend.Application.DTOs.Modules.Requests;
using Reparto_Backend.Application.DTOs.Modules.Responses;
using Reparto_Backend.Domain.Entities.Companies;
using Reparto_Backend.Infrastructure.Persistence.PostgreSql;

namespace Reparto_Backend.Presentation.Controllers;

[ApiController]
[Route("api/companies")]
[Authorize]
public class CompaniesController(ApplicationDbContext db) : ControllerBase
{
    /* ── GET /api/companies ──────────────────────────────── */
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var companies = await db.Companies
            .OrderByDescending(c => c.CreatedAtUtc)
            .Select(c => new CompanyListItemResponse(
                c.Id, c.Ruc, c.BusinessName,
                c.TradeName, c.IsActive, c.CreatedAtUtc))
            .ToListAsync();

        return Ok(companies);
    }

    /* ── GET /api/companies/{id} ─────────────────────────── */
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var c = await db.Companies
            .Where(x => x.Id == id)
            .Select(x => new CompanyDetailResponse(
                x.Id, x.Ruc, x.BusinessName, x.TradeName,
                x.Address, x.Phone, x.Email, x.Logo,
                x.SunatSolUser,
                x.IsActive, x.CreatedAtUtc,
                db.CompanyModules.Count(m => m.CompanyId == id && m.IsEnabled)))
            .FirstOrDefaultAsync();

        if (c is null) return NotFound();
        return Ok(c);
    }

    /* ── PUT /api/companies/{id} ─────────────────────────── */
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCompanyRequest request)
    {
        var company = await db.Companies.FindAsync(id);
        if (company is null) return NotFound();

        company.BusinessName     = request.BusinessName;
        company.TradeName        = request.TradeName ?? company.TradeName;
        company.Address          = request.Address;
        company.Phone            = request.Phone;
        company.Email            = request.CompanyEmail;
        company.Logo             = request.Logo;
        company.SunatSolUser     = request.SunatSolUser;
        company.SunatSolPassword = request.SunatSolPassword ?? company.SunatSolPassword;

        await db.SaveChangesAsync();
        return NoContent();
    }

    /* ── PATCH /api/companies/{id}/status ────────────────── */
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> ToggleStatus(Guid id)
    {
        var company = await db.Companies.FindAsync(id);
        if (company is null) return NotFound();

        company.IsActive = !company.IsActive;
        await db.SaveChangesAsync();

        return Ok(new ToggleStatusResponse(company.Id, company.IsActive));
    }

    /* ── GET /api/companies/{id}/modules ─────────────────── */
    [HttpGet("{id:guid}/modules")]
    public async Task<IActionResult> GetModules(Guid id)
    {
        var existing = await db.CompanyModules
            .Where(m => m.CompanyId == id)
            .ToListAsync();

        var result = SaasModules.All.Select(def => new CompanyModuleResponse(
            def.Key, def.Label, def.Description,
            existing.FirstOrDefault(e => e.ModuleKey == def.Key)?.IsEnabled ?? false,
            existing.FirstOrDefault(e => e.ModuleKey == def.Key)?.ExpiresAt));

        return Ok(result);
    }

    /* ── PUT /api/companies/{id}/modules ─────────────────── */
    [HttpPut("{id:guid}/modules")]
    public async Task<IActionResult> UpdateModules(Guid id, [FromBody] UpdateModulesRequest request)
    {
        var existing = await db.CompanyModules
            .Where(m => m.CompanyId == id)
            .ToListAsync();

        foreach (var toggle in request.Modules)
        {
            var record = existing.FirstOrDefault(e => e.ModuleKey == toggle.Key);
            if (record is null)
                db.CompanyModules.Add(new CompanyModule
                {
                    CompanyId = id, ModuleKey = toggle.Key,
                    IsEnabled = toggle.IsEnabled, ExpiresAt = toggle.ExpiresAt,
                });
            else
            {
                record.IsEnabled = toggle.IsEnabled;
                record.ExpiresAt = toggle.ExpiresAt;
            }
        }

        await db.SaveChangesAsync();

        var updated = await db.CompanyModules
            .Where(m => m.CompanyId == id)
            .ToListAsync();

        var result = SaasModules.All.Select(def => new CompanyModuleResponse(
            def.Key, def.Label, def.Description,
            updated.FirstOrDefault(e => e.ModuleKey == def.Key)?.IsEnabled ?? false,
            updated.FirstOrDefault(e => e.ModuleKey == def.Key)?.ExpiresAt));

        return Ok(result);
    }
}

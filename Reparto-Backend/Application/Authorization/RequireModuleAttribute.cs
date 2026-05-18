using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Reparto_Backend.Application.Abstractions.Auth;
using Reparto_Backend.Infrastructure.Persistence.PostgreSql;

namespace Reparto_Backend.Application.Authorization;

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public sealed class RequireModuleAttribute(string moduleKey) : Attribute, IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var tenant = context.HttpContext.RequestServices.GetRequiredService<ITenantProvider>();
        var db     = context.HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();

        var active = await db.CompanyModules.AnyAsync(m =>
            m.CompanyId  == tenant.TenantId &&
            m.ModuleKey  == moduleKey       &&
            m.IsEnabled  &&
            (m.ExpiresAt == null || m.ExpiresAt > DateTime.UtcNow));

        if (!active)
        {
            context.Result = new ObjectResult(
                new { message = $"El módulo '{moduleKey}' no está habilitado para esta empresa." })
            { StatusCode = 403 };
            return;
        }

        await next();
    }
}

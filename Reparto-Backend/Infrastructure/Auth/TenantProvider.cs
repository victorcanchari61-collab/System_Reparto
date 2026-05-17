using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Reparto_Backend.Application.Abstractions.Auth;
using Reparto_Backend.Application.Authorization;

namespace Reparto_Backend.Infrastructure.Auth;

public sealed class TenantProvider : ITenantProvider
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private Guid? _tenantIdOverride;

    public TenantProvider(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid TenantId
    {
        get
        {
            if (_tenantIdOverride.HasValue)
            {
                return _tenantIdOverride.Value;
            }

            var companyIdClaim = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(PermissionClaimTypes.CompanyId);

            if (companyIdClaim is null || !Guid.TryParse(companyIdClaim, out var tenantId))
            {
                // Return empty GUID if not authenticated (e.g. during company registration or anonymous endpoints)
                return Guid.Empty;
            }

            return tenantId;
        }
    }

    public void SetTenantIdOverride(Guid tenantId)
    {
        _tenantIdOverride = tenantId;
    }
}

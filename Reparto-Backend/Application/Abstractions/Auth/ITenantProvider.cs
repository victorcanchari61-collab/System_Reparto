namespace Reparto_Backend.Application.Abstractions.Auth;

public interface ITenantProvider
{
    Guid TenantId { get; }
    void SetTenantIdOverride(Guid tenantId);
}

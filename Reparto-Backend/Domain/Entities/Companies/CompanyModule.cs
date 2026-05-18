namespace Reparto_Backend.Domain.Entities.Companies;

public sealed class CompanyModule
{
    public Guid Id         { get; set; } = Guid.NewGuid();
    public Guid CompanyId  { get; set; }
    public string ModuleKey { get; set; } = string.Empty;
    public bool IsEnabled  { get; set; }
    public DateTime? ExpiresAt    { get; set; }
    public DateTime CreatedAtUtc  { get; set; } = DateTime.UtcNow;

    public Company Company { get; set; } = null!;
}

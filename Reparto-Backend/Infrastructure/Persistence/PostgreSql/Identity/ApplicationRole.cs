using Microsoft.AspNetCore.Identity;
using Reparto_Backend.Domain.Entities.Companies;

namespace Reparto_Backend.Infrastructure.Persistence.PostgreSql.Identity;

public sealed class ApplicationRole : IdentityRole<Guid>
{
    public Guid? CompanyId { get; set; }

    public Company? Company { get; set; }

    public string Description { get; set; } = string.Empty;

    public bool IsSystem { get; set; }
}

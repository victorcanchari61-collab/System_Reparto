using Microsoft.AspNetCore.Identity;
using Reparto_Backend.Domain.Entities.Companies;
using Reparto_Backend.Infrastructure.Persistence.PostgreSql.Tokens;

namespace Reparto_Backend.Infrastructure.Persistence.PostgreSql.Identity;

public sealed class ApplicationUser : IdentityUser<Guid>
{
    public Guid CompanyId { get; set; }

    public Company Company { get; set; } = null!;

    public string FullName { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
}

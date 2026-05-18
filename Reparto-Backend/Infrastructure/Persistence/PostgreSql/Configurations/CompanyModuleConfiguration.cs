using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Reparto_Backend.Domain.Entities.Companies;

namespace Reparto_Backend.Infrastructure.Persistence.PostgreSql.Configurations;

public sealed class CompanyModuleConfiguration : IEntityTypeConfiguration<CompanyModule>
{
    public void Configure(EntityTypeBuilder<CompanyModule> entity)
    {
        entity.ToTable("company_modules");
        entity.HasKey(m => m.Id);
        entity.HasIndex(m => new { m.CompanyId, m.ModuleKey }).IsUnique();
        entity.Property(m => m.ModuleKey).HasMaxLength(50).IsRequired();
        entity.HasOne(m => m.Company)
              .WithMany(c => c.Modules)
              .HasForeignKey(m => m.CompanyId)
              .OnDelete(DeleteBehavior.Cascade);
    }
}

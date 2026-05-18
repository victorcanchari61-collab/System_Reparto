using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Reparto_Backend.Domain.Entities.Companies;

namespace Reparto_Backend.Infrastructure.Persistence.PostgreSql.Configurations;

public sealed class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> entity)
    {
        entity.ToTable("companies");
        entity.HasKey(c => c.Id);
        entity.HasIndex(c => c.Ruc).IsUnique();
        entity.Property(c => c.Ruc).HasMaxLength(11).IsRequired();
        entity.Property(c => c.BusinessName).HasMaxLength(200).IsRequired();
        entity.Property(c => c.TradeName).HasMaxLength(200);
        entity.Property(c => c.Address).HasMaxLength(300);
        entity.Property(c => c.Phone).HasMaxLength(30);
        entity.Property(c => c.Email).HasMaxLength(200);
        entity.Property(c => c.Logo).HasMaxLength(500);
        entity.Property(c => c.SunatSolUser).HasMaxLength(100);
        entity.Property(c => c.SunatSolPassword).HasMaxLength(200);
        entity.Property(c => c.IsOwner).HasDefaultValue(false);
    }
}

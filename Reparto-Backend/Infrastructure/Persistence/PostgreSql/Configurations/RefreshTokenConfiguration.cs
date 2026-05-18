using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Reparto_Backend.Infrastructure.Persistence.PostgreSql.Tokens;

namespace Reparto_Backend.Infrastructure.Persistence.PostgreSql.Configurations;

public sealed class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> entity)
    {
        entity.ToTable("refresh_tokens");
        entity.HasKey(t => t.Id);
        entity.HasIndex(t => t.TokenHash).IsUnique();
        entity.Property(t => t.TokenHash).HasMaxLength(128).IsRequired();
        entity.HasOne(t => t.User)
              .WithMany(u => u.RefreshTokens)
              .HasForeignKey(t => t.UserId)
              .OnDelete(DeleteBehavior.Cascade);
    }
}

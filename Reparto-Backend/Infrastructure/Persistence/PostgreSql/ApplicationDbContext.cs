using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Reparto_Backend.Application.Abstractions.Auth;
using Reparto_Backend.Application.Authorization;
using Reparto_Backend.Domain.Entities.Companies;
using Reparto_Backend.Domain.Entities.Permissions;
using Reparto_Backend.Infrastructure.Persistence.PostgreSql.Identity;
using Reparto_Backend.Infrastructure.Persistence.PostgreSql.Tokens;

namespace Reparto_Backend.Infrastructure.Persistence.PostgreSql;

public sealed class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options,
    ITenantProvider tenantProvider)
    : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>(options)
{
    public DbSet<Company> Companies => Set<Company>();

    public DbSet<Permission> Permissions => Set<Permission>();

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Company>(entity =>
        {
            entity.ToTable("companies");
            entity.HasKey(company => company.Id);
            entity.HasIndex(company => company.Ruc).IsUnique();
            entity.Property(company => company.Ruc).HasMaxLength(11).IsRequired();
            entity.Property(company => company.BusinessName).HasMaxLength(200).IsRequired();
            entity.Property(company => company.TradeName).HasMaxLength(200);
            entity.Property(company => company.Address).HasMaxLength(300);
            entity.Property(company => company.Phone).HasMaxLength(30);
            entity.Property(company => company.Email).HasMaxLength(200);
            entity.Property(company => company.Logo).HasMaxLength(500);
            entity.Property(company => company.SunatSolUser).HasMaxLength(100);
            entity.Property(company => company.SunatSolPassword).HasMaxLength(200);
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.ToTable("permissions");
            entity.HasKey(permission => permission.Id);
            entity.HasIndex(permission => permission.Code).IsUnique();
            entity.Property(permission => permission.Code).HasMaxLength(120).IsRequired();
            entity.Property(permission => permission.Name).HasMaxLength(160).IsRequired();
            entity.Property(permission => permission.Module).HasMaxLength(80).IsRequired();
            entity.Property(permission => permission.Description).HasMaxLength(300);
            entity.HasData(CreatePermissionSeed());
        });

        modelBuilder.Entity<ApplicationUser>(entity =>
        {
            entity.ToTable("users");
            entity.Property(user => user.FullName).HasMaxLength(180).IsRequired();
            entity.HasIndex(user => new { user.CompanyId, user.Email }).IsUnique();
            entity.HasOne(user => user.Company)
                .WithMany()
                .HasForeignKey(user => user.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasQueryFilter(user => user.CompanyId == tenantProvider.TenantId);
        });

        modelBuilder.Entity<ApplicationRole>(entity =>
        {
            entity.ToTable("roles");
            entity.Property(role => role.Description).HasMaxLength(300);
            entity.HasIndex(role => role.NormalizedName)
                .HasDatabaseName("RoleNameIndex")
                .IsUnique(false);
            entity.HasIndex(role => new { role.CompanyId, role.NormalizedName }).IsUnique();
            entity.HasOne(role => role.Company)
                .WithMany()
                .HasForeignKey(role => role.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasQueryFilter(role => role.CompanyId == tenantProvider.TenantId || role.CompanyId == null);
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("refresh_tokens");
            entity.HasKey(refreshToken => refreshToken.Id);
            entity.HasIndex(refreshToken => refreshToken.TokenHash).IsUnique();
            entity.Property(refreshToken => refreshToken.TokenHash).HasMaxLength(128).IsRequired();
            entity.HasOne(refreshToken => refreshToken.User)
                .WithMany(user => user.RefreshTokens)
                .HasForeignKey(refreshToken => refreshToken.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ApplicationRole>().ToTable("roles");
        modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserRole<Guid>>().ToTable("user_roles");
        modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserClaim<Guid>>().ToTable("user_claims");
        modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserLogin<Guid>>().ToTable("user_logins");
        modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityRoleClaim<Guid>>().ToTable("role_claims");
        modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserToken<Guid>>().ToTable("user_tokens");

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }

    private static Permission[] CreatePermissionSeed()
    {
        return SystemPermissions.All
            .Select((code, index) => new Permission
            {
                Id = Guid.Parse($"00000000-0000-0000-0000-{index + 1:000000000000}"),
                Code = code,
                Name = code,
                Module = code.Split('.')[0],
                Description = code
            })
            .ToArray();
    }
}

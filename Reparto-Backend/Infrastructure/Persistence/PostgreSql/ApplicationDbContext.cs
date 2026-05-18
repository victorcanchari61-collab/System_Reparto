using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Reparto_Backend.Application.Abstractions.Auth;
using Reparto_Backend.Domain.Entities.Companies;
using Reparto_Backend.Infrastructure.Persistence.PostgreSql.Identity;
using Reparto_Backend.Infrastructure.Persistence.PostgreSql.Tokens;

namespace Reparto_Backend.Infrastructure.Persistence.PostgreSql;

public sealed class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options,
    ITenantProvider tenantProvider)
    : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>(options)
{
    /* ── DbSets ──────────────────────────────────────────── */
    public DbSet<Company>       Companies      => Set<Company>();
    public DbSet<CompanyModule> CompanyModules => Set<CompanyModule>();
    public DbSet<RefreshToken>  RefreshTokens  => Set<RefreshToken>();

    /* ── Model ───────────────────────────────────────────── */
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        /* ── Renombrar tablas de Identity ─────────────────── */
        modelBuilder.Entity<ApplicationUser>().ToTable("users");
        modelBuilder.Entity<ApplicationRole>().ToTable("roles");
        modelBuilder.Entity<IdentityUserRole<Guid>>().ToTable("user_roles");
        modelBuilder.Entity<IdentityUserClaim<Guid>>().ToTable("user_claims");
        modelBuilder.Entity<IdentityUserLogin<Guid>>().ToTable("user_logins");
        modelBuilder.Entity<IdentityRoleClaim<Guid>>().ToTable("role_claims");
        modelBuilder.Entity<IdentityUserToken<Guid>>().ToTable("user_tokens");

        /* ── Query filters con TenantProvider (requieren DI) ─ */
        modelBuilder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(u => u.FullName).HasMaxLength(180).IsRequired();
            entity.HasIndex(u => new { u.CompanyId, u.Email }).IsUnique();
            entity.HasOne(u => u.Company)
                  .WithMany()
                  .HasForeignKey(u => u.CompanyId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasQueryFilter(u => u.CompanyId == tenantProvider.TenantId);
        });

        modelBuilder.Entity<ApplicationRole>(entity =>
        {
            entity.Property(r => r.Description).HasMaxLength(300);
            entity.HasIndex(r => r.NormalizedName)
                  .HasDatabaseName("RoleNameIndex")
                  .IsUnique(false);
            entity.HasIndex(r => new { r.CompanyId, r.NormalizedName }).IsUnique();
            entity.HasOne(r => r.Company)
                  .WithMany()
                  .HasForeignKey(r => r.CompanyId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasQueryFilter(r => r.CompanyId == tenantProvider.TenantId || r.CompanyId == null);
        });

        /* ── Configuraciones de entidades de dominio ─────── */
        /* Cargadas automáticamente desde Configurations/     */
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}

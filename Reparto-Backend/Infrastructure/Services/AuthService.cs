using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Reparto_Backend.Application.Abstractions.Auth;
using Reparto_Backend.Application.Authorization;
using Reparto_Backend.Application.DTOs.Auth;
using Reparto_Backend.Domain.Entities.Companies;
using Reparto_Backend.Infrastructure.Options;
using Reparto_Backend.Infrastructure.Persistence.PostgreSql;
using Reparto_Backend.Infrastructure.Persistence.PostgreSql.Identity;
using Reparto_Backend.Infrastructure.Persistence.PostgreSql.Tokens;

namespace Reparto_Backend.Infrastructure.Services;

public sealed class AuthService : IAuthService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IRefreshTokenService _refreshTokenService;
    private readonly IOptions<JwtOptions> _jwtOptions;
    private readonly ITenantProvider _tenantProvider;

    public AuthService(
        ApplicationDbContext dbContext,
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        IJwtTokenService jwtTokenService,
        IRefreshTokenService refreshTokenService,
        IOptions<JwtOptions> jwtOptions,
        ITenantProvider tenantProvider)
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _roleManager = roleManager;
        _jwtTokenService = jwtTokenService;
        _refreshTokenService = refreshTokenService;
        _jwtOptions = jwtOptions;
        _tenantProvider = tenantProvider;
    }

    public async Task<AuthResult> RegisterCompanyAsync(RegisterCompanyRequest request)
    {
        var normalizedEmail = request.AdminEmail.Trim().ToUpperInvariant();
        var emailExists = await _userManager.Users.AnyAsync(u => u.NormalizedEmail == normalizedEmail);
        if (emailExists)
            return AuthResult.Failure("Admin email is already registered.");

        var rucExists = await _dbContext.Companies.AnyAsync(c => c.Ruc == request.Ruc);
        if (rucExists)
            return AuthResult.Failure("Company RUC is already registered.");

        await using var transaction = await _dbContext.Database.BeginTransactionAsync();

        var company = new Company
        {
            Ruc = request.Ruc.Trim(),
            BusinessName = request.BusinessName.Trim(),
            TradeName = request.TradeName.Trim(),
            Address = request.Address.Trim(),
            Phone = request.Phone.Trim(),
            Email = request.CompanyEmail.Trim(),
            Logo = request.Logo?.Trim(),
            SunatSolUser = request.SunatSolUser?.Trim(),
            SunatSolPassword = request.SunatSolPassword?.Trim()
        };

        _dbContext.Companies.Add(company);
        await _dbContext.SaveChangesAsync();

        _tenantProvider.SetTenantIdOverride(company.Id);

        var user = new ApplicationUser
        {
            CompanyId = company.Id,
            FullName = request.AdminFullName.Trim(),
            UserName = request.AdminEmail.Trim(),
            Email = request.AdminEmail.Trim(),
            EmailConfirmed = true,
            PhoneNumber = request.AdminPhone.Trim()
        };

        var userResult = await _userManager.CreateAsync(user, request.AdminPassword);
        if (!userResult.Succeeded)
            return AuthResult.Failure(string.Join(", ", userResult.Errors.Select(e => e.Description)));

        var adminRole = new ApplicationRole
        {
            CompanyId = company.Id,
            Name = "Admin",
            Description = "Administrador principal de la empresa"
        };

        var roleResult = await _roleManager.CreateAsync(adminRole);
        if (!roleResult.Succeeded)
            return AuthResult.Failure(string.Join(", ", roleResult.Errors.Select(e => e.Description)));

        foreach (var permission in SystemPermissions.All)
            await _roleManager.AddClaimAsync(adminRole, new Claim(PermissionClaimTypes.Permission, permission));

        await _userManager.AddToRoleAsync(user, adminRole.Name!);

        var response = await BuildAuthResponseAsync(user);
        await transaction.CommitAsync();

        return AuthResult.Success(response);
    }

    public async Task<AuthResult> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.Users
            .IgnoreQueryFilters()
            .Include(u => u.Company)
            .FirstOrDefaultAsync(u => u.NormalizedEmail == request.Email.Trim().ToUpperInvariant());

        if (user is null || !user.IsActive || !user.Company.IsActive)
            return AuthResult.Failure("Invalid credentials.");

        var validPassword = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!validPassword)
            return AuthResult.Failure("Invalid credentials.");

        return AuthResult.Success(await BuildAuthResponseAsync(user));
    }

    public async Task<AuthResult> RefreshAsync(string refreshToken)
    {
        var tokenHash = _refreshTokenService.HashToken(refreshToken);
        var token = await _dbContext.RefreshTokens
            .IgnoreQueryFilters()
            .Include(t => t.User)
            .ThenInclude(u => u.Company)
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash);

        if (token is null || !token.IsActive || !token.User.IsActive || !token.User.Company.IsActive)
            return AuthResult.Failure("Invalid or expired refresh token.");

        token.RevokedAtUtc = DateTime.UtcNow;
        return AuthResult.Success(await BuildAuthResponseAsync(token.User));
    }

    public async Task LogoutAsync(string refreshToken)
    {
        var tokenHash = _refreshTokenService.HashToken(refreshToken);
        var token = await _dbContext.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == tokenHash);

        if (token is not null && token.RevokedAtUtc is null)
        {
            token.RevokedAtUtc = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();
        }
    }

    private async Task<AuthResponse> BuildAuthResponseAsync(ApplicationUser user)
    {
        var accessToken = await _jwtTokenService.CreateAccessTokenAsync(user);
        var rawRefreshToken = _refreshTokenService.CreateToken();

        _dbContext.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = _refreshTokenService.HashToken(rawRefreshToken),
            ExpiresAtUtc = DateTime.UtcNow.AddDays(_jwtOptions.Value.RefreshTokenDays)
        });

        await _dbContext.SaveChangesAsync();

        return new AuthResponse(
            accessToken.AccessToken,
            accessToken.ExpiresAtUtc,
            rawRefreshToken,
            user.Id,
            user.CompanyId,
            user.FullName,
            user.Email ?? string.Empty);
    }
}

using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Reparto_Backend.Application.Abstractions.Auth;
using Reparto_Backend.Application.Authorization;
using Reparto_Backend.Domain.Entities.Companies;
using Reparto_Backend.Infrastructure.Options;
using Reparto_Backend.Infrastructure.Persistence.PostgreSql;
using Reparto_Backend.Infrastructure.Persistence.PostgreSql.Identity;
using Reparto_Backend.Infrastructure.Persistence.PostgreSql.Tokens;

namespace Reparto_Backend.Presentation.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/register-company", RegisterCompanyAsync);
        group.MapPost("/login", LoginAsync);
        group.MapPost("/refresh", RefreshAsync);
        group.MapPost("/logout", LogoutAsync);
        group.MapGet("/me", Me).RequireAuthorization();

        return app;
    }

    private static async Task<IResult> RegisterCompanyAsync(
        RegisterCompanyRequest request,
        ApplicationDbContext dbContext,
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        IJwtTokenService jwtTokenService,
        IRefreshTokenService refreshTokenService,
        IOptions<JwtOptions> jwtOptions)
    {
        var normalizedEmail = request.AdminEmail.Trim().ToUpperInvariant();
        var emailExists = await userManager.Users.AnyAsync(user => user.NormalizedEmail == normalizedEmail);
        if (emailExists)
        {
            return Results.BadRequest(new { Message = "Admin email is already registered." });
        }

        var rucExists = await dbContext.Companies.AnyAsync(company => company.Ruc == request.Ruc);
        if (rucExists)
        {
            return Results.BadRequest(new { Message = "Company RUC is already registered." });
        }

        await using var transaction = await dbContext.Database.BeginTransactionAsync();

        var company = new Company
        {
            Ruc = request.Ruc.Trim(),
            BusinessName = request.BusinessName.Trim(),
            TradeName = request.TradeName.Trim(),
            Address = request.Address.Trim(),
            Phone = request.Phone.Trim(),
            Email = request.CompanyEmail.Trim()
        };

        dbContext.Companies.Add(company);
        await dbContext.SaveChangesAsync();

        var user = new ApplicationUser
        {
            CompanyId = company.Id,
            FullName = request.AdminFullName.Trim(),
            UserName = request.AdminEmail.Trim(),
            Email = request.AdminEmail.Trim(),
            EmailConfirmed = true,
            PhoneNumber = request.AdminPhone.Trim()
        };

        var userResult = await userManager.CreateAsync(user, request.AdminPassword);
        if (!userResult.Succeeded)
        {
            return Results.BadRequest(new { Errors = userResult.Errors.Select(error => error.Description) });
        }

        var adminRole = new ApplicationRole
        {
            CompanyId = company.Id,
            Name = "Admin",
            Description = "Administrador principal de la empresa"
        };

        var roleResult = await roleManager.CreateAsync(adminRole);
        if (!roleResult.Succeeded)
        {
            return Results.BadRequest(new { Errors = roleResult.Errors.Select(error => error.Description) });
        }

        foreach (var permission in SystemPermissions.All)
        {
            await roleManager.AddClaimAsync(adminRole, new Claim(PermissionClaimTypes.Permission, permission));
        }

        await userManager.AddToRoleAsync(user, adminRole.Name!);
        var response = await CreateAuthResponseAsync(user, dbContext, jwtTokenService, refreshTokenService, jwtOptions.Value);

        await transaction.CommitAsync();

        return Results.Created($"/api/companies/{company.Id}", response);
    }

    private static async Task<IResult> LoginAsync(
        LoginRequest request,
        ApplicationDbContext dbContext,
        UserManager<ApplicationUser> userManager,
        IJwtTokenService jwtTokenService,
        IRefreshTokenService refreshTokenService,
        IOptions<JwtOptions> jwtOptions)
    {
        var user = await userManager.Users
            .Include(applicationUser => applicationUser.Company)
            .FirstOrDefaultAsync(applicationUser => applicationUser.NormalizedEmail == request.Email.Trim().ToUpperInvariant());

        if (user is null || !user.IsActive || !user.Company.IsActive)
        {
            return Results.Unauthorized();
        }

        var validPassword = await userManager.CheckPasswordAsync(user, request.Password);
        if (!validPassword)
        {
            return Results.Unauthorized();
        }

        var response = await CreateAuthResponseAsync(user, dbContext, jwtTokenService, refreshTokenService, jwtOptions.Value);

        return Results.Ok(response);
    }

    private static async Task<IResult> RefreshAsync(
        RefreshTokenRequest request,
        ApplicationDbContext dbContext,
        IJwtTokenService jwtTokenService,
        IRefreshTokenService refreshTokenService,
        IOptions<JwtOptions> jwtOptions)
    {
        var tokenHash = refreshTokenService.HashToken(request.RefreshToken);
        var refreshToken = await dbContext.RefreshTokens
            .Include(token => token.User)
            .ThenInclude(user => user.Company)
            .FirstOrDefaultAsync(token => token.TokenHash == tokenHash);

        if (refreshToken is null || !refreshToken.IsActive || !refreshToken.User.IsActive || !refreshToken.User.Company.IsActive)
        {
            return Results.Unauthorized();
        }

        refreshToken.RevokedAtUtc = DateTime.UtcNow;
        var response = await CreateAuthResponseAsync(refreshToken.User, dbContext, jwtTokenService, refreshTokenService, jwtOptions.Value);

        return Results.Ok(response);
    }

    private static async Task<IResult> LogoutAsync(
        RefreshTokenRequest request,
        ApplicationDbContext dbContext,
        IRefreshTokenService refreshTokenService)
    {
        var tokenHash = refreshTokenService.HashToken(request.RefreshToken);
        var refreshToken = await dbContext.RefreshTokens.FirstOrDefaultAsync(token => token.TokenHash == tokenHash);

        if (refreshToken is not null && refreshToken.RevokedAtUtc is null)
        {
            refreshToken.RevokedAtUtc = DateTime.UtcNow;
            await dbContext.SaveChangesAsync();
        }

        return Results.NoContent();
    }

    private static IResult Me(ClaimsPrincipal user)
    {
        return Results.Ok(new
        {
            UserId = user.FindFirstValue(ClaimTypes.NameIdentifier),
            CompanyId = user.FindFirstValue(PermissionClaimTypes.CompanyId),
            Email = user.FindFirstValue(ClaimTypes.Email),
            FullName = user.FindFirstValue(ClaimTypes.Name),
            Roles = user.FindAll(ClaimTypes.Role).Select(claim => claim.Value).Distinct(),
            Permissions = user.FindAll(PermissionClaimTypes.Permission).Select(claim => claim.Value).Distinct()
        });
    }

    private static async Task<AuthResponse> CreateAuthResponseAsync(
        ApplicationUser user,
        ApplicationDbContext dbContext,
        IJwtTokenService jwtTokenService,
        IRefreshTokenService refreshTokenService,
        JwtOptions jwtOptions)
    {
        var accessToken = await jwtTokenService.CreateAccessTokenAsync(user);
        var refreshToken = refreshTokenService.CreateToken();

        dbContext.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = refreshTokenService.HashToken(refreshToken),
            ExpiresAtUtc = DateTime.UtcNow.AddDays(jwtOptions.RefreshTokenDays)
        });

        await dbContext.SaveChangesAsync();

        return new AuthResponse(
            accessToken.AccessToken,
            accessToken.ExpiresAtUtc,
            refreshToken,
            user.Id,
            user.CompanyId,
            user.FullName,
            user.Email ?? string.Empty);
    }
}

public sealed record RegisterCompanyRequest(
    string Ruc,
    string BusinessName,
    string TradeName,
    string Address,
    string Phone,
    string CompanyEmail,
    string AdminFullName,
    string AdminEmail,
    string AdminPhone,
    string AdminPassword);

public sealed record LoginRequest(
    string Email,
    string Password);

public sealed record RefreshTokenRequest(
    string RefreshToken);

public sealed record AuthResponse(
    string AccessToken,
    DateTime AccessTokenExpiresAtUtc,
    string RefreshToken,
    Guid UserId,
    Guid CompanyId,
    string FullName,
    string Email);

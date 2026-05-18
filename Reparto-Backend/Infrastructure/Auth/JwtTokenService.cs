using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Reparto_Backend.Application.Abstractions.Auth;
using Reparto_Backend.Application.Authorization;
using Reparto_Backend.Infrastructure.Options;
using Reparto_Backend.Infrastructure.Persistence.PostgreSql.Identity;

namespace Reparto_Backend.Infrastructure.Auth;

public sealed class JwtTokenService(
    UserManager<ApplicationUser> userManager,
    RoleManager<ApplicationRole> roleManager,
    IOptions<JwtOptions> jwtOptions) : IJwtTokenService
{
    public async Task<JwtTokenResult> CreateAccessTokenAsync(ApplicationUser user)
    {
        var options = jwtOptions.Value;
        var expiresAtUtc = DateTime.UtcNow.AddMinutes(options.AccessTokenMinutes);
        var roles = await userManager.GetRolesAsync(user);
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(ClaimTypes.Name, user.FullName),
            new(PermissionClaimTypes.CompanyId, user.CompanyId.ToString()),
            new("is_owner", (user.Company?.IsOwner ?? false).ToString().ToLowerInvariant())
        };

        foreach (var roleName in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, roleName));

            var role = await roleManager.FindByNameAsync(roleName);
            if (role is null)
            {
                continue;
            }

            var roleClaims = await roleManager.GetClaimsAsync(role);
            claims.AddRange(roleClaims.Where(claim => claim.Type == PermissionClaimTypes.Permission));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.SecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: options.Issuer,
            audience: options.Audience,
            claims: claims,
            expires: expiresAtUtc,
            signingCredentials: credentials);

        return new JwtTokenResult(
            new JwtSecurityTokenHandler().WriteToken(token),
            expiresAtUtc);
    }
}

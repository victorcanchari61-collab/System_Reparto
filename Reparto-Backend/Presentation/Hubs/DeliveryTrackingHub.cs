using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Reparto_Backend.Application.Authorization;
using System.Security.Claims;

namespace Reparto_Backend.Presentation.Hubs;

[Authorize]
public sealed class DeliveryTrackingHub : Hub
{
    // ── Grupos de empresa ─────────────────────────────────────

    /// <summary>
    /// El cliente se une al grupo de su empresa al conectar.
    /// Recibe todos los eventos company-scoped (stock, módulos, pedidos).
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        var companyId = Context.User?.FindFirstValue(PermissionClaimTypes.CompanyId);
        if (!string.IsNullOrEmpty(companyId))
            await Groups.AddToGroupAsync(Context.ConnectionId, GetCompanyGroupName(Guid.Parse(companyId)));

        await base.OnConnectedAsync();
    }

    // ── Tracking de pedidos ───────────────────────────────────

    public async Task JoinOrderTrackingAsync(Guid orderId)
        => await Groups.AddToGroupAsync(Context.ConnectionId, GetOrderGroupName(orderId));

    public async Task LeaveOrderTrackingAsync(Guid orderId)
        => await Groups.RemoveFromGroupAsync(Context.ConnectionId, GetOrderGroupName(orderId));

    // ── Tracking de conductores ───────────────────────────────

    public async Task JoinCourierTrackingAsync(Guid courierId)
        => await Groups.AddToGroupAsync(Context.ConnectionId, GetCourierGroupName(courierId));

    public async Task LeaveCourierTrackingAsync(Guid courierId)
        => await Groups.RemoveFromGroupAsync(Context.ConnectionId, GetCourierGroupName(courierId));

    // ── Nombres de grupo (estáticos, usados por el notifier) ─

    public static string GetCompanyGroupName(Guid companyId) => $"company:{companyId}";
    public static string GetOrderGroupName(Guid orderId)     => $"orders:{orderId}";
    public static string GetCourierGroupName(Guid courierId) => $"couriers:{courierId}";
}

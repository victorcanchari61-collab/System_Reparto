using Microsoft.AspNetCore.SignalR;
using Reparto_Backend.Application.Abstractions.Realtime;

namespace Reparto_Backend.Presentation.Hubs;

public sealed class SignalRRealtimeNotifier(IHubContext<DeliveryTrackingHub> hub) : IRealtimeNotifier
{
    // ── Delivery tracking ─────────────────────────────────────

    public Task NotifyOrderStatusChangedAsync(Guid orderId, string status, CancellationToken ct = default)
        => hub.Clients
            .Group(DeliveryTrackingHub.GetOrderGroupName(orderId))
            .SendAsync("OrderStatusChanged", new { OrderId = orderId, Status = status }, ct);

    public Task NotifyCourierLocationChangedAsync(Guid courierId, decimal lat, decimal lng, CancellationToken ct = default)
        => hub.Clients
            .Group(DeliveryTrackingHub.GetCourierGroupName(courierId))
            .SendAsync("CourierLocationChanged", new { CourierId = courierId, Latitude = lat, Longitude = lng }, ct);

    // ── Eventos de empresa ────────────────────────────────────

    public Task NotifyCompanyEventAsync(Guid companyId, string eventName, object payload, CancellationToken ct = default)
        => hub.Clients
            .Group(DeliveryTrackingHub.GetCompanyGroupName(companyId))
            .SendAsync(eventName, payload, ct);

    /// <summary>
    /// Todos los usuarios de la empresa reciben el stock actualizado en tiempo real.
    /// Previene doble venta: si stock llega a 0 todos lo ven de inmediato.
    /// </summary>
    public Task NotifyStockUpdatedAsync(Guid companyId, Guid productId, string productName, int newStock, CancellationToken ct = default)
        => hub.Clients
            .Group(DeliveryTrackingHub.GetCompanyGroupName(companyId))
            .SendAsync("StockUpdated", new
            {
                ProductId   = productId,
                ProductName = productName,
                NewStock    = newStock,
                UpdatedAt   = DateTime.UtcNow,
            }, ct);
}

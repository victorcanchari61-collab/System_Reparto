using Microsoft.AspNetCore.SignalR;
using Reparto_Backend.Application.Abstractions.Realtime;

namespace Reparto_Backend.Presentation.Hubs;

public sealed class SignalRRealtimeNotifier(IHubContext<DeliveryTrackingHub> hubContext) : IRealtimeNotifier
{
    public async Task NotifyOrderStatusChangedAsync(
        Guid orderId,
        string status,
        CancellationToken cancellationToken = default)
    {
        await hubContext
            .Clients
            .Group(DeliveryTrackingHub.GetOrderGroupName(orderId))
            .SendAsync("OrderStatusChanged", new
            {
                OrderId = orderId,
                Status = status
            }, cancellationToken);
    }

    public async Task NotifyCourierLocationChangedAsync(
        Guid courierId,
        decimal latitude,
        decimal longitude,
        CancellationToken cancellationToken = default)
    {
        await hubContext
            .Clients
            .Group(DeliveryTrackingHub.GetCourierGroupName(courierId))
            .SendAsync("CourierLocationChanged", new
            {
                CourierId = courierId,
                Latitude = latitude,
                Longitude = longitude
            }, cancellationToken);
    }
}

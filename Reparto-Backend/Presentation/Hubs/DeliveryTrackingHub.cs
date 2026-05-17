using Microsoft.AspNetCore.SignalR;

namespace Reparto_Backend.Presentation.Hubs;

public sealed class DeliveryTrackingHub : Hub
{
    public async Task JoinOrderTrackingAsync(Guid orderId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, GetOrderGroupName(orderId));
    }

    public async Task LeaveOrderTrackingAsync(Guid orderId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GetOrderGroupName(orderId));
    }

    public async Task JoinCourierTrackingAsync(Guid courierId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, GetCourierGroupName(courierId));
    }

    public async Task LeaveCourierTrackingAsync(Guid courierId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GetCourierGroupName(courierId));
    }

    public static string GetOrderGroupName(Guid orderId)
    {
        return $"orders:{orderId}";
    }

    public static string GetCourierGroupName(Guid courierId)
    {
        return $"couriers:{courierId}";
    }
}

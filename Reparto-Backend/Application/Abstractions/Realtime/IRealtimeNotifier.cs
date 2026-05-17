namespace Reparto_Backend.Application.Abstractions.Realtime;

public interface IRealtimeNotifier
{
    Task NotifyOrderStatusChangedAsync(
        Guid orderId,
        string status,
        CancellationToken cancellationToken = default);

    Task NotifyCourierLocationChangedAsync(
        Guid courierId,
        decimal latitude,
        decimal longitude,
        CancellationToken cancellationToken = default);
}

namespace Reparto_Backend.Application.Abstractions.Realtime;

public interface IRealtimeNotifier
{
    // ── Delivery tracking (ya existente) ─────────────────────
    Task NotifyOrderStatusChangedAsync(
        Guid orderId, string status,
        CancellationToken ct = default);

    Task NotifyCourierLocationChangedAsync(
        Guid courierId, decimal latitude, decimal longitude,
        CancellationToken ct = default);

    // ── Eventos de empresa (nuevo) ────────────────────────────
    /// <summary>
    /// Envía un evento genérico a todos los usuarios conectados de una empresa.
    /// Úsalo para: módulos actualizados, pedido creado, etc.
    /// </summary>
    Task NotifyCompanyEventAsync(
        Guid companyId, string eventName, object payload,
        CancellationToken ct = default);

    /// <summary>
    /// Stock actualizado en tiempo real — previene doble venta.
    /// Todos los usuarios de la empresa ven el cambio inmediatamente.
    /// </summary>
    Task NotifyStockUpdatedAsync(
        Guid companyId, Guid productId, string productName, int newStock,
        CancellationToken ct = default);
}

namespace Reparto_Backend.Domain.Entities.Companies;

public sealed class Company
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Ruc { get; set; } = string.Empty;

    public string BusinessName { get; set; } = string.Empty;

    public string TradeName { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

namespace Reparto_Backend.Infrastructure.Options;

public sealed class ExternalServicesOptions
{
    public const string SectionName = "ExternalServices";

    public WhatsAppOptions WhatsApp { get; init; } = new();

    public GmailOptions Gmail { get; init; } = new();

    public SunatOptions Sunat { get; init; } = new();

    public ReniecOptions Reniec { get; init; } = new();
}

public sealed class WhatsAppOptions
{
    public string BaseUrl { get; init; } = string.Empty;

    public string PhoneNumberId { get; init; } = string.Empty;

    public string AccessToken { get; init; } = string.Empty;
}

public sealed class GmailOptions
{
    public string ClientId { get; init; } = string.Empty;

    public string ClientSecret { get; init; } = string.Empty;

    public string RefreshToken { get; init; } = string.Empty;
}

public sealed class SunatOptions
{
    public string BaseUrl { get; init; } = string.Empty;

    public string ClientId { get; init; } = string.Empty;

    public string ClientSecret { get; init; } = string.Empty;
}

public sealed class ReniecOptions
{
    public string BaseUrl { get; init; } = string.Empty;

    public string ApiKey { get; init; } = string.Empty;
}

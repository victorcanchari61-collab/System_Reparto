namespace Reparto_Backend.Application.Constants;

public static class SaasModules
{
    public const string Orders  = "orders";
    public const string Drivers = "drivers";
    public const string Hr      = "hr";
    public const string Erp     = "erp";
    public const string Users   = "users";
    public const string Roles   = "roles";

    public static readonly IReadOnlyList<SaasModuleInfo> All =
    [
        new(Orders,  "Pedidos / Repartos", "Gestión de pedidos, asignación y seguimiento de entregas"),
        new(Drivers, "Conductores",        "Gestión de conductores y seguimiento GPS en tiempo real"),
        new(Hr,      "Recursos Humanos",   "Gestión de empleados, planilla y asistencia"),
        new(Erp,     "Facturación",        "Facturación electrónica SUNAT (comprobantes, notas)"),
        new(Users,   "Usuarios",           "Gestión de usuarios de la empresa y sus accesos"),
        new(Roles,   "Roles y Permisos",   "Configuración de roles y permisos por equipo"),
    ];
}

public sealed record SaasModuleInfo(string Key, string Label, string Description);

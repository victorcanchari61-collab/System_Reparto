using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Reparto_Backend.Application.Authorization;
using Reparto_Backend.Application.DTOs.Permissions.Responses;

namespace Reparto_Backend.Presentation.Controllers;

[ApiController]
[Route("api/permissions")]
[Authorize]
public class PermissionsController : ControllerBase
{
    private static readonly IReadOnlyList<PermissionGroupResponse> Groups =
    [
        new("companies", "Empresa", [
            new(SystemPermissions.CompaniesView,   "Ver datos de la empresa"),
            new(SystemPermissions.CompaniesUpdate, "Editar datos de la empresa"),
        ]),
        new("users", "Usuarios", [
            new(SystemPermissions.UsersView,   "Ver usuarios"),
            new(SystemPermissions.UsersCreate, "Crear usuarios"),
            new(SystemPermissions.UsersUpdate, "Editar / activar usuarios"),
        ]),
        new("roles", "Roles", [
            new(SystemPermissions.RolesView,   "Ver roles"),
            new(SystemPermissions.RolesCreate, "Crear roles"),
            new(SystemPermissions.RolesUpdate, "Editar / eliminar roles"),
        ]),
        new("permissions", "Permisos", [
            new(SystemPermissions.PermissionsView, "Ver permisos"),
        ]),
        new("orders", "Pedidos", [
            new(SystemPermissions.OrdersView,   "Ver pedidos"),
            new(SystemPermissions.OrdersCreate, "Crear pedidos"),
            new(SystemPermissions.OrdersAssign, "Asignar pedidos"),
            new(SystemPermissions.OrdersCancel, "Cancelar pedidos"),
        ]),
        new("drivers", "Conductores", [
            new(SystemPermissions.DriversView,   "Ver conductores"),
            new(SystemPermissions.DriversCreate, "Registrar conductores"),
            new(SystemPermissions.DriversUpdate, "Editar conductores"),
        ]),
        new("hr", "Recursos Humanos", [
            new(SystemPermissions.HrEmployeesView,   "Ver empleados"),
            new(SystemPermissions.HrEmployeesCreate, "Registrar empleados"),
        ]),
        new("erp", "Facturación ERP", [
            new(SystemPermissions.ErpInvoicesView, "Ver comprobantes"),
            new(SystemPermissions.ErpInvoicesEmit, "Emitir comprobantes"),
        ]),
    ];

    /* ── GET /api/permissions ────────────────────────────── */
    [HttpGet]
    [Authorize(Policy = SystemPermissions.PermissionsView)]
    public IActionResult GetAll() => Ok(Groups);
}

namespace Reparto_Backend.Application.Authorization;

public static class SystemPermissions
{
    public static readonly string[] All =
    [
        CompaniesView,
        CompaniesUpdate,
        UsersView,
        UsersCreate,
        UsersUpdate,
        RolesView,
        RolesCreate,
        RolesUpdate,
        PermissionsView,
        OrdersView,
        OrdersCreate,
        OrdersAssign,
        OrdersCancel,
        DriversView,
        DriversCreate,
        DriversUpdate,
        HrEmployeesView,
        HrEmployeesCreate,
        ErpInvoicesView,
        ErpInvoicesEmit
    ];

    public const string CompaniesView = "companies.view";
    public const string CompaniesUpdate = "companies.update";
    public const string UsersView = "users.view";
    public const string UsersCreate = "users.create";
    public const string UsersUpdate = "users.update";
    public const string RolesView = "roles.view";
    public const string RolesCreate = "roles.create";
    public const string RolesUpdate = "roles.update";
    public const string PermissionsView = "permissions.view";
    public const string OrdersView = "orders.view";
    public const string OrdersCreate = "orders.create";
    public const string OrdersAssign = "orders.assign";
    public const string OrdersCancel = "orders.cancel";
    public const string DriversView = "drivers.view";
    public const string DriversCreate = "drivers.create";
    public const string DriversUpdate = "drivers.update";
    public const string HrEmployeesView = "hr.employees.view";
    public const string HrEmployeesCreate = "hr.employees.create";
    public const string ErpInvoicesView = "erp.invoices.view";
    public const string ErpInvoicesEmit = "erp.invoices.emit";
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Reparto_Backend.Infrastructure.Persistence.PostgreSql.Migrations
{
    /// <inheritdoc />
    public partial class RemovePermissionsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "permissions");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "permissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Module = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Name = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_permissions", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "permissions",
                columns: new[] { "Id", "Code", "Description", "Module", "Name" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000001"), "companies.view", "companies.view", "companies", "companies.view" },
                    { new Guid("00000000-0000-0000-0000-000000000002"), "companies.update", "companies.update", "companies", "companies.update" },
                    { new Guid("00000000-0000-0000-0000-000000000003"), "users.view", "users.view", "users", "users.view" },
                    { new Guid("00000000-0000-0000-0000-000000000004"), "users.create", "users.create", "users", "users.create" },
                    { new Guid("00000000-0000-0000-0000-000000000005"), "users.update", "users.update", "users", "users.update" },
                    { new Guid("00000000-0000-0000-0000-000000000006"), "roles.view", "roles.view", "roles", "roles.view" },
                    { new Guid("00000000-0000-0000-0000-000000000007"), "roles.create", "roles.create", "roles", "roles.create" },
                    { new Guid("00000000-0000-0000-0000-000000000008"), "roles.update", "roles.update", "roles", "roles.update" },
                    { new Guid("00000000-0000-0000-0000-000000000009"), "permissions.view", "permissions.view", "permissions", "permissions.view" },
                    { new Guid("00000000-0000-0000-0000-000000000010"), "orders.view", "orders.view", "orders", "orders.view" },
                    { new Guid("00000000-0000-0000-0000-000000000011"), "orders.create", "orders.create", "orders", "orders.create" },
                    { new Guid("00000000-0000-0000-0000-000000000012"), "orders.assign", "orders.assign", "orders", "orders.assign" },
                    { new Guid("00000000-0000-0000-0000-000000000013"), "orders.cancel", "orders.cancel", "orders", "orders.cancel" },
                    { new Guid("00000000-0000-0000-0000-000000000014"), "drivers.view", "drivers.view", "drivers", "drivers.view" },
                    { new Guid("00000000-0000-0000-0000-000000000015"), "drivers.create", "drivers.create", "drivers", "drivers.create" },
                    { new Guid("00000000-0000-0000-0000-000000000016"), "drivers.update", "drivers.update", "drivers", "drivers.update" },
                    { new Guid("00000000-0000-0000-0000-000000000017"), "hr.employees.view", "hr.employees.view", "hr", "hr.employees.view" },
                    { new Guid("00000000-0000-0000-0000-000000000018"), "hr.employees.create", "hr.employees.create", "hr", "hr.employees.create" },
                    { new Guid("00000000-0000-0000-0000-000000000019"), "erp.invoices.view", "erp.invoices.view", "erp", "erp.invoices.view" },
                    { new Guid("00000000-0000-0000-0000-000000000020"), "erp.invoices.emit", "erp.invoices.emit", "erp", "erp.invoices.emit" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_permissions_Code",
                table: "permissions",
                column: "Code",
                unique: true);
        }
    }
}

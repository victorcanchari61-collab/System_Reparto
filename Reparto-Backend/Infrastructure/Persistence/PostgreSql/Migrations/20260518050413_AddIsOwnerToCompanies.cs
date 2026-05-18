using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Reparto_Backend.Infrastructure.Persistence.PostgreSql.Migrations
{
    /// <inheritdoc />
    public partial class AddIsOwnerToCompanies : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsOwner",
                table: "companies",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            // Marcar la empresa del dueño del SaaS (RUC del owner registrado en seed-owner.sh)
            migrationBuilder.Sql(
                "UPDATE companies SET \"IsOwner\" = true WHERE \"Ruc\" = '20000000001'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsOwner",
                table: "companies");
        }
    }
}

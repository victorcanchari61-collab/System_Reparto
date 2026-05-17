using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Reparto_Backend.Infrastructure.Persistence.PostgreSql.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyLogoAndSunat : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Logo",
                table: "companies",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SunatSolPassword",
                table: "companies",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SunatSolUser",
                table: "companies",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Logo",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "SunatSolPassword",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "SunatSolUser",
                table: "companies");
        }
    }
}

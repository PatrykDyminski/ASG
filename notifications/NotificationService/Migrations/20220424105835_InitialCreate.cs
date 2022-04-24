using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NotificationService.Migrations
{
  public partial class InitialCreate : Migration
  {
    protected override void Up(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.CreateTable(
          name: "Notifications",
          columns: table => new
          {
            PersonID = table.Column<int>(type: "int", nullable: true),
            LastName = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
            FirstName = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
            email = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
            eventName = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
            eventDate = table.Column<DateTime>(type: "date", nullable: true),
            eventLocation = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true)
          },
          constraints: table =>
          {
          });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.DropTable(
          name: "Notifications");
    }
  }
}

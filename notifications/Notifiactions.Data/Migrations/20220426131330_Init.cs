using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NotificationService.Migrations
{
  public partial class Init : Migration
  {
    protected override void Up(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.CreateTable(
          name: "Notifications",
          columns: table => new
          {
            Id = table.Column<int>(type: "int", nullable: false)
                  .Annotation("SqlServer:Identity", "1, 1"),
            LastName = table.Column<string>(type: "nvarchar(max)", nullable: false),
            FirstName = table.Column<string>(type: "nvarchar(max)", nullable: false),
            Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
            EventName = table.Column<string>(type: "nvarchar(max)", nullable: false),
            EventDate = table.Column<DateTime>(type: "datetime2", nullable: false),
            EventLocation = table.Column<string>(type: "nvarchar(max)", nullable: false),
            FirstNotifSent = table.Column<bool>(type: "bit", nullable: false),
            SecondNotifSent = table.Column<bool>(type: "bit", nullable: false)
          },
          constraints: table =>
          {
            table.PrimaryKey("PK_Notifications", x => x.Id);
          });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.DropTable(
          name: "Notifications");
    }
  }
}

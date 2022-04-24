using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NotificationService.Migrations
{
  public partial class NotifSentFieldsAdded : Migration
  {
    protected override void Up(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.AddColumn<bool>(
          name: "FirstNotifSent",
          table: "Notifications",
          type: "bit",
          nullable: true);

      migrationBuilder.AddColumn<bool>(
          name: "SecondNotifSent",
          table: "Notifications",
          type: "bit",
          nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.DropColumn(
          name: "FirstNotifSent",
          table: "Notifications");

      migrationBuilder.DropColumn(
          name: "SecondNotifSent",
          table: "Notifications");
    }
  }
}

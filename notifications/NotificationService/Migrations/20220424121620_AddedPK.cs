using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NotificationService.Migrations
{
  public partial class AddedPK : Migration
  {
    protected override void Up(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.DropColumn(name: "PersonID",
                table: "Notifications");

      migrationBuilder.AddColumn<int>(
          name: "PersonID",
          table: "Notifications",
          type: "int",
          nullable: false,
          defaultValue: 0)
          .Annotation("SqlServer:Identity", "1, 1");

      migrationBuilder.AddPrimaryKey(
          name: "PK_Notifications",
          table: "Notifications",
          column: "PersonID");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.DropPrimaryKey(
          name: "PK_Notifications",
          table: "Notifications");

      migrationBuilder.AlterColumn<int>(
          name: "PersonID",
          table: "Notifications",
          type: "int",
          nullable: true,
          oldClrType: typeof(int),
          oldType: "int")
          .OldAnnotation("SqlServer:Identity", "1, 1");
    }
  }
}

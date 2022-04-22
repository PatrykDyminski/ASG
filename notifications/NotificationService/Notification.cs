namespace NotificationService;

public partial class Notification
{
  public int? PersonId { get; set; }
  public string? LastName { get; set; }
  public string? FirstName { get; set; }
  public string? Email { get; set; }
  public string? EventName { get; set; }
  public DateTime? EventDate { get; set; }
  public string? EventLocation { get; set; }
}

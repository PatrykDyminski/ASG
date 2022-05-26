namespace Notifiactions.Data;

public class Notification
{
  public int Id { get; set; }
  public string LastName { get; set; }
  public string FirstName { get; set; }
  public string Email { get; set; }
  public string EventName { get; set; }
  public DateTime EventDate { get; set; }
  public string EventLocation { get; set; }
  public bool FirstNotifSent { get; set; }
  public bool SecondNotifSent { get; set; }
}

public class NotificationSchema
{
  public string LastName { get; set; }
  public string FirstName { get; set; }
  public string Email { get; set; }
  public string EventName { get; set; }
  public DateTime EventDate { get; set; }
  public string EventLocation { get; set; }
}

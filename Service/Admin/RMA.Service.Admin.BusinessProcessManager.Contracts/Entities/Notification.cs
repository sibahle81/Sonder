namespace RMA.Service.Admin.BusinessProcessManager.Contracts.Entities
{
    public class Notification
    {
        public string Title { get; set; }
        public string Message { get; set; }
        public string ActionLink { get; set; }
        public bool HasBeenReadAndUnderstood { get; set; }
    }
}
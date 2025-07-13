namespace RMA.Service.Admin.ScheduledTaskManager.Contracts.Entities
{
    public class ScheduledTaskType
    {
        public int ScheduledTaskTypeId { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public bool IsEnabled { get; set; }
        public int NumberOfRetriesRemaining { get; set; }
        public int Priority { get; set; }
        public string TaskHandler { get; set; }
    }
}

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.Admin.ScheduledTaskManager.Contracts.Entities
{
    public partial class ScheduledTask
    {
        public int ScheduledTaskId { get; set; }
        public int ScheduledTaskTypeId { get; set; }
        public TaskScheduleFrequencyEnum TaskScheduleFrequency { get; set; }
        public DateTime ScheduledDate { get; set; }
        public DateTime? LastRun { get; set; }
        public int? LastRunDurationSeconds { get; set; }
        public string LastStatus { get; set; }
        public string LastReason { get; set; }
        public string HostName { get; set; }
        public DateTime? DateTimeLockedToHost { get; set; }
        public int NumberOfRetriesRemaining { get; set; }
        public bool Priority { get; set; }

        public virtual ScheduledTaskType ScheduledTaskType { get; set; }
    }
}

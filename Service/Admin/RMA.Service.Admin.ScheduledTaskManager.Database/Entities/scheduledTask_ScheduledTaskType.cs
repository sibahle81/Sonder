//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//		
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using RMA.Common.Database.Contracts.Repository;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.ScheduledTaskManager.Database.Entities
{
    public partial class scheduledTask_ScheduledTaskType : ILazyLoadSafeEntity
    {
        public int ScheduledTaskTypeId { get; set; } // ScheduledTaskTypeId (Primary key)
        public string Description { get; set; } // Description (length: 255)
        public string Category { get; set; } // Category (length: 255)
        public bool IsEnabled { get; set; } // IsEnabled
        public int NumberOfRetriesRemaining { get; set; } // NumberOfRetriesRemaining
        public int? Priority { get; set; } // Priority
        public string TaskHandler { get; set; } // TaskHandler (length: 1000)

        // Reverse navigation

        /// <summary>
        /// Child scheduledTask_ScheduledTasks where [ScheduledTask].[ScheduledTaskTypeId] point to this entity (FK__Scheduled__Sched__216BEC9A)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<scheduledTask_ScheduledTask> ScheduledTasks { get; set; } // ScheduledTask.FK__Scheduled__Sched__216BEC9A

        public scheduledTask_ScheduledTaskType()
        {
            ScheduledTasks = new System.Collections.Generic.List<scheduledTask_ScheduledTask>();
            InitializePartial();
        }

        partial void InitializePartial();
    }

}

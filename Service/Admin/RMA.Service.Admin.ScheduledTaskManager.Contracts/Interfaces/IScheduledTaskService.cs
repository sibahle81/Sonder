using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.ScheduledTaskManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.ScheduledTaskManager.Contracts.Interfaces
{
    public interface IScheduledTaskService : IService
    {
        Task<List<ScheduledTask>> ScheduledTasks();
        Task<ScheduledTask> GetScheduledTask(int scheduleTaskId);
        Task<bool> RetryScheduledTask(ScheduledTask scheduledTask);
        Task<bool> DisableScheduledTask(int scheduleTaskId, bool scheduledTaskDisabled);
        Task EditScheduledTask(ScheduledTask scheduledTask);
        Task<bool> ResetToCurrentDateAndTime(int id);
        Task<bool> RescheduleScheduledTask(ScheduledTask scheduledTask);
    }
}

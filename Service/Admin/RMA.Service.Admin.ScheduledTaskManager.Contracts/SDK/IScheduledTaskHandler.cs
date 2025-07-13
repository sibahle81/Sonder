using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Threading.Tasks;

namespace RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK
{
    public interface IScheduledTaskHandler : IService
    {
        Task DeleteTask(int detailsScheduledTaskId);
        Task<bool> ExecuteTask(int scheduledTaskId);
        bool CanCompleteTask { get; }
        Task CompleteTask(int detailsScheduledTaskId, bool success, TaskScheduleFrequencyEnum detailsTaskScheduleFrequency, TimeSpan executionDuration);
    }
}

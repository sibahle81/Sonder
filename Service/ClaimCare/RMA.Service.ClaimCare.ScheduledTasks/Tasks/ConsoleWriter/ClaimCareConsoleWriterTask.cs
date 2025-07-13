using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.ScheduledTasks.Tasks.ConsoleWriter
{
    public class ClaimCareConsoleWriterTask : IScheduledTaskHandler
    {
        public Task<bool> ExecuteTask(int scheduledTaskId)
        {
            Console.WriteLine($"Scheduled task run successful {scheduledTaskId}");
            return Task.FromResult(true);
        }

        public bool CanCompleteTask => false;

        public Task CompleteTask(int detailsScheduledTaskId, bool success, TaskScheduleFrequencyEnum detailsTaskScheduleFrequency, TimeSpan executionDuration)
        {
            return Task.CompletedTask;
        }

        public Task DeleteTask(int detailsScheduledTaskId)
        {
            return Task.CompletedTask;
        }
    }
}

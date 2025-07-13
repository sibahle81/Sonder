using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.ScheduledTasks.Tasks.Policy
{
    public class LifeExtensionPremiumAdjustmentNotification : IScheduledTaskHandler
    {
        private const string taskHandlerName = "Annual Increase Notifications (Task 143)";
        private readonly ILifeExtensionService _lifeExtensionService;

        public bool CanCompleteTask => false;

        public LifeExtensionPremiumAdjustmentNotification(ILifeExtensionService lifeExtensionService)
        {
            _lifeExtensionService = lifeExtensionService;
        }

        public Task CompleteTask(int detailsScheduledTaskId, bool success, TaskScheduleFrequencyEnum detailsTaskScheduleFrequency, TimeSpan executionDuration)
        {
            return Task.CompletedTask;
        }

        public Task DeleteTask(int detailsScheduledTaskId)
        {
            return Task.CompletedTask;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            // Run in a background task, because the notifications just take too
            // long to run (about 3 or 4 notifications per minute). It will time out
            _ = Task.Run(() => _lifeExtensionService.SendAnnualIncreaseNotifications(taskHandlerName));
            return true;
        }
    }
}

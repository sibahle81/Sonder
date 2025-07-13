using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.ScheduledTasks.Tasks.Policy
{
    public class LifeExtensionPremiumAdjustment : IScheduledTaskHandler
    {
        private const string taskHandlerName = "Apply Annual Policy Increase (Task 144)";
        private readonly ILifeExtensionService _lifeExtensionService;

        public bool CanCompleteTask => false;

        public LifeExtensionPremiumAdjustment(ILifeExtensionService lifeExtensionService)
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
            var message = "";
            try
            {
                var count = await _lifeExtensionService.ApplyAnnualIncreases();
                // Send a message if increases have been applied
                if (count > 0)
                {
                    message = $"The scheduled task ran successfully and {count} policies were increased successfully.";
                    await _lifeExtensionService.SendAnnualIncreaseTaskNotification(taskHandlerName, message, true);
                }
                return count >= 0;
            }
            catch (Exception ex)
            {
                message = $"The scheduled task failed with the following error:\r\n{ex}";
                await _lifeExtensionService.SendAnnualIncreaseTaskNotification(taskHandlerName, message, false);
                throw;
            }

        }
    }
}

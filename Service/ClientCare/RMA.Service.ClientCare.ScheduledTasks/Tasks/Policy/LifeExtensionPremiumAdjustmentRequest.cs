using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.ScheduledTasks.Tasks.Policy
{
    public class LifeExtensionPremiumAdjustmentRequest : IScheduledTaskHandler
    {
        private readonly ILifeExtensionService _lifeExtensionService;
        private const string taskHandlerName = "Annual Increase Calculation and Qlink Transaction Task (Task 142)";

        public bool CanCompleteTask => false;

        public LifeExtensionPremiumAdjustmentRequest(ILifeExtensionService lifeExtensionService)
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
            string message;
            try
            {
                var count = await _lifeExtensionService.CalculateAnnualIncreases();
                _ = await _lifeExtensionService.SendQlinkUpdateTransactions();
                _ = await _lifeExtensionService.ProcessAnnualIncreaseTransactions();
                // Send a message if any policies due for increase were found
                if (count > 0)
                {
                    message = $"The scheduled task ran successfully and {count} policies are due for increase";
                    await _lifeExtensionService.SendAnnualIncreaseTaskNotification(taskHandlerName, message, true);
                }
                return true;
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

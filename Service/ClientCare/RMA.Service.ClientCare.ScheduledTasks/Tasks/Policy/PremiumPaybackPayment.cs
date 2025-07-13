using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.ScheduledTasks.Tasks.Policy
{
    public class PremiumPaybackPayment : IScheduledTaskHandler
    {
        private readonly ILifeExtensionService _lifeExtensionService;

        public bool CanCompleteTask => false;

        public PremiumPaybackPayment(ILifeExtensionService lifeExtensionService)
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
            var count = await _lifeExtensionService.ProcessPaybackPayments();
            return count >= 0;
        }
    }
}

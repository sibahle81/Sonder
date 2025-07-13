using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.ScheduledTasks.Tasks.Policy
{
    internal class PremiumListingPaymentTask : IScheduledTaskHandler
    {
        private readonly IPremiumListingService _premiumListingService;
        public PremiumListingPaymentTask(IPremiumListingService premiumListingService)
        {
            _premiumListingService = premiumListingService;
        }

        public bool CanCompleteTask => false;

        public Task CompleteTask(int detailsScheduledTaskId, bool success,
            TaskScheduleFrequencyEnum detailsTaskScheduleFrequency, TimeSpan executionDuration)
        {
            return Task.CompletedTask;
        }

        public Task DeleteTask(int detailsScheduledTaskId)
        {
            return Task.CompletedTask;
        }

        public Task<bool> ExecuteTask(int scheduledTaskId)
        {
            Task.Run(() => _premiumListingService.ProcessPendingPremiumListingPaymentFiles()).ConfigureAwait(true);
            return Task.FromResult(true);
        }
    }
}
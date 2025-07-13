using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.ScheduledTasks.Tasks.Policy
{
    public class PremiumListingPolicyPremiumMovement : IScheduledTaskHandler
    {
        private readonly IPremiumListingPolicyPremiumMovementService premiumListingPolicyPremiumMovementService;
        public PremiumListingPolicyPremiumMovement(IPremiumListingPolicyPremiumMovementService service)
        {
            premiumListingPolicyPremiumMovementService = service;
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

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            return await premiumListingPolicyPremiumMovementService.ProcessPremiumListingPolicyPremiumMovement();
        }
    }
}

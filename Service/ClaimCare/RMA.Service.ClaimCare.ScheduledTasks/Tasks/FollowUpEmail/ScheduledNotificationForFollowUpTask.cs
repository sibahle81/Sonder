using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.ScheduledTasks.Tasks.FollowUpEmail
{
    public class ScheduledNotificationForFollowUpTask : IScheduledTaskHandler
    {
        private readonly IClaimService _claimService;

        public ScheduledNotificationForFollowUpTask(IClaimService claimService)
        {
            _claimService = claimService;
        }

        public Task<bool> ExecuteTask(int scheduledTaskId)
        {
            Task.Run(() => _claimService.SendFollowUpEmail()).ConfigureAwait(true);
            return Task.FromResult(true);
        }

        public bool CanCompleteTask => true;

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

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.ScheduledTasks.Tasks.DocumentsFollowUp
{
    public class ScheduledNotificationForDocumentsFollowUpTask : IScheduledTaskHandler
    {
        private readonly IClaimCommunicationService _claimCommunicationService;

        public ScheduledNotificationForDocumentsFollowUpTask(IClaimCommunicationService claimCommunicationService)
        {
            _claimCommunicationService = claimCommunicationService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            /* SCHEDULE TASK TO BE DEPRECATED */
            //await _claimCommunicationService.SendFollowUpsForDocumentsRequired();

            return await Task.FromResult(true);
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

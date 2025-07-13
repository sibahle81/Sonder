using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using System;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.ScheduledTasks.Tasks.MmiHcpReminders
{
    public class MmiHcpReminderTask : IScheduledTaskHandler
    {
        private readonly IClaimService _claimService;

        public MmiHcpReminderTask(IClaimService claimService)
        {
            _claimService = claimService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            await _claimService.SendMMIHcpReminder();

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
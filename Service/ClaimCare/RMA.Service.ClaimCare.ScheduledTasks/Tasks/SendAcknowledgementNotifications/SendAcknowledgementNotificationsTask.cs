using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.ScheduledTasks.Tasks.SendAcknowledgementNotifications
{
    public class SendAcknowledgementNotificationsTask : IScheduledTaskHandler
    {
        private readonly IAccidentService _accidentService;

        public SendAcknowledgementNotificationsTask(IAccidentService accidentService)
        {
            _accidentService = accidentService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            //Check Performance, Revert if need arises
            await _accidentService.SendAckwonledgementNotifications();

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

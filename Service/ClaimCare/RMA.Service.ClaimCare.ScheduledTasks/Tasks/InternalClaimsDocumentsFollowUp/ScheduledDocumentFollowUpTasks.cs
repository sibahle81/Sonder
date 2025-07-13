using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.ScheduledTasks.Tasks.InternalClaimsDocumentsFollowUp
{
    public class ScheduledDocumentFollowUpTasks : IScheduledTaskHandler
    {
        private readonly IEventService _eventService;

        public ScheduledDocumentFollowUpTasks(IEventService eventService)
        {
            _eventService = eventService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            await _eventService.SendFollowUpsForInternalNotifications();

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

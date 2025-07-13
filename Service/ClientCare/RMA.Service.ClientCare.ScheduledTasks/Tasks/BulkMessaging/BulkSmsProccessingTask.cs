using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.ScheduledTasks.Tasks.BulkMessaging
{
    public class BulkSmsProccessingTask : IScheduledTaskHandler
    {
        private readonly ISendSmsService _sendSmsService;
        public BulkSmsProccessingTask(ISendSmsService sendSmsService)
        {
            _sendSmsService = sendSmsService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            await _sendSmsService.ProcessBulkSmsRequest();
            return true;
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
    }
}

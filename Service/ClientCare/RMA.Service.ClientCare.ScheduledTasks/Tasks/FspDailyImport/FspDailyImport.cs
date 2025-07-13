using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.ScheduledTasks.Tasks.FspDailyImport
{
    public class FspDailyImport : IScheduledTaskHandler
    {
        private readonly IBrokerageService _fspeService;

        public FspDailyImport(IBrokerageService service)
        {
            _fspeService = service;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            await _fspeService.RefreshFspData();
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

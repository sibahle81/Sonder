using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.ScheduledTasks.Tasks.Policy
{
    public class ProcessStagedQlinkTransactions : IScheduledTaskHandler
    {
        private readonly IQLinkService _qlinkService;

        public ProcessStagedQlinkTransactions(IQLinkService qlinkService)
        {
            _qlinkService = qlinkService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            await _qlinkService.ProcessStagedQlinkTransactions();
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


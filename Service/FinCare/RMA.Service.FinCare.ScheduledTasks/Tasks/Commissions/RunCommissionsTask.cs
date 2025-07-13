using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.FinCare.Contracts.Interfaces.Commissions;

using System;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.ScheduledTasks.Tasks.Commissions
{
    public class RunCommissionsTask : IScheduledTaskHandler
    {
        private ICommissionService _commissionService;

        public RunCommissionsTask(ICommissionService commissionService)
        {
            _commissionService = commissionService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            await _commissionService.DailyCommissionRun();
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


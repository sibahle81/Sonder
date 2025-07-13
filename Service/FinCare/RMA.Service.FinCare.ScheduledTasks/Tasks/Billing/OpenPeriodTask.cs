using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;

using System;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.ScheduledTasks.Tasks.Billing
{
    public class OpenPeriodTask : IScheduledTaskHandler
    {
        private readonly IPeriodService _periodService;

        public OpenPeriodTask(IPeriodService periodService)
        {
            _periodService = periodService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            var canAutoRollBillingPeriods = await _periodService.CanAutoRollBillingPeriods();
            if (canAutoRollBillingPeriods)
            {
                await _periodService.RollBillingPeriods(true);
            }
            return true;
        }

        public bool CanCompleteTask => false;

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

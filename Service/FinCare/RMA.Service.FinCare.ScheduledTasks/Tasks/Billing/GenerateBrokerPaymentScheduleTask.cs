using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.Billing.Contracts.Interfaces;

using System;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.ScheduledTasks.Tasks.Billing
{
    public class GenerateBrokerPaymentScheduleTask : IScheduledTaskHandler
    {
        private readonly IBrokerPaymentScheduleService _brokerPaymentScheduleService;

        public GenerateBrokerPaymentScheduleTask(IBrokerPaymentScheduleService brokerPaymentScheduleService)
        {
            _brokerPaymentScheduleService = brokerPaymentScheduleService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            var result = await _brokerPaymentScheduleService.SubmitBrokerPaymentSchedule();
            return result;
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

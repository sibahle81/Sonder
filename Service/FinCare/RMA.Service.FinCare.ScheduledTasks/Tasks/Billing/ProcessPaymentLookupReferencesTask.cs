using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.Billing.Contracts.Interfaces;

using System;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.ScheduledTasks.Tasks.Billing
{
    public class ProcessPaymentLookupReferencesTask : IScheduledTaskHandler
    {
        private readonly IPaymentAllocationLookupService _paymentAllocationLookupService;

        public ProcessPaymentLookupReferencesTask(IPaymentAllocationLookupService paymentAllocationLookupService)
        {
            _paymentAllocationLookupService = paymentAllocationLookupService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            await _paymentAllocationLookupService.AllocatePaymentsFromReferenceLookups();

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

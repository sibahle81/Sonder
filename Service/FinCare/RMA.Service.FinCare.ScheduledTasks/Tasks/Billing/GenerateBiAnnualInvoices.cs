using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.Billing.Contracts.Interfaces;

using System;
using System.Threading.Tasks;


namespace RMA.Service.FinCare.ScheduledTasks.Tasks.Billing
{
    public class GenerateBiAnnualInvoicesTask : IScheduledTaskHandler
    {
        private readonly IInvoiceService _invoiceService;

        public GenerateBiAnnualInvoicesTask(IInvoiceService invoiceService)
        {
            _invoiceService = invoiceService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            await _invoiceService.GenerateInvoices(ClientTypeEnum.Individual, PaymentFrequencyEnum.BiAnnually);
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

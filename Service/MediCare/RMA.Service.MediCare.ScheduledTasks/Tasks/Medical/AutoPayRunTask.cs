using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using System;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.ScheduledTasks.Tasks.Medical
{
    public class AutoPayRunTask : IScheduledTaskHandler
    {
        public bool CanCompleteTask => false;
        private readonly IInvoiceHelperService _invoiceHelperService;

        public AutoPayRunTask(IInvoiceHelperService invoiceHelperService)
        {
            _invoiceHelperService = invoiceHelperService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            var validatedInvoices = await _invoiceHelperService.GetValidatedSTPInvoicesNotMappedToPreAuth();
            var capturedInvoices = await _invoiceHelperService.GetCapturedInvoices();
            var capturedTebaInvoices = await _invoiceHelperService.GetCapturedTebaInvoices();

            foreach (var invoice in validatedInvoices)
            {
                try
                {
                    await _invoiceHelperService.AutoPayRun(invoice.InvoiceId, 0);
                }
                catch (Exception ex)
                {
                    ex.LogException();
                }
            }

            foreach (var invoice in capturedInvoices)
            {
                try
                {
                    await _invoiceHelperService.AutoPayRun(invoice.InvoiceId, 0);
                }
                catch (Exception ex)
                {
                    ex.LogException();
                }
            }

            foreach (var tebaInvoice in capturedTebaInvoices)
            {
                try
                {
                    await _invoiceHelperService.AutoPayRun(0, tebaInvoice.TebaInvoiceId);
                }
                catch (Exception ex)
                {
                    ex.LogException();
                }
            }

            return true;
        }

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

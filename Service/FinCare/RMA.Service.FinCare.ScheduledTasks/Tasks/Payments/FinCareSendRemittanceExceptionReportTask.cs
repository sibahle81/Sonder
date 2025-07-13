using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.FinCare.Contracts.Interfaces.Payments;

using System;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.ScheduledTasks.Tasks.Payments
{
    public class FinCareSendRemittanceExceptionReportTask : IScheduledTaskHandler
    {
        private readonly IPaymentCommunicationService _paymentCommunicationService;
        public FinCareSendRemittanceExceptionReportTask(IPaymentCommunicationService paymentCommunicationService)
        {
            _paymentCommunicationService = paymentCommunicationService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            await _paymentCommunicationService.SendRemittanceExceptionReport();
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

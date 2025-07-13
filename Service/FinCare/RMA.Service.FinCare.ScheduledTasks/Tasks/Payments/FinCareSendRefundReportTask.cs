using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.FinCare.Contracts.Interfaces.Payments;

using System;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.ScheduledTasks.Tasks.Payments
{
    internal class FinCareSendRefundReportTask : IScheduledTaskHandler
    {
        private readonly IPaymentCommunicationService _paymentCommunicationService;
        public FinCareSendRefundReportTask(IPaymentCommunicationService paymentCommunicationService)
        {
            _paymentCommunicationService = paymentCommunicationService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            await _paymentCommunicationService.SendRefundsReport();
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

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.FinCare.Contracts.Interfaces.Payments;

using System;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.ScheduledTasks.Tasks.Payments
{
    public class FinCareProcessBankStatementsTask : IScheduledTaskHandler
    {
        private readonly IPaymentService _paymentService;

        public FinCareProcessBankStatementsTask(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            await _paymentService.DoPaymentReconciliations();
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

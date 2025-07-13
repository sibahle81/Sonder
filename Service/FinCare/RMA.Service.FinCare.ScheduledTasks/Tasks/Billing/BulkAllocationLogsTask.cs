using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.Billing.Contracts.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.ScheduledTasks.Tasks.Billing
{
    internal class BulkAllocationLogsTask : IScheduledTaskHandler
    {
        private readonly IPaymentAllocationService _paymentAllocationService;
        public BulkAllocationLogsTask(IPaymentAllocationService paymentAllocationService)
        {
            _paymentAllocationService = paymentAllocationService;
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

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            await _paymentAllocationService.ProcessBulkAllocationsForTerms();
            return true;
        }
    }
}
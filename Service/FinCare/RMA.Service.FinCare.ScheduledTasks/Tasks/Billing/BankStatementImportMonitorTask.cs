using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.Billing.Contracts.Interfaces;

using System;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.ScheduledTasks.Tasks.Billing
{
    public class BankStatementImportMonitorTask : IScheduledTaskHandler
    {
        private readonly IBillingService _billingService;
        public BankStatementImportMonitorTask(IBillingService billingService)
        {
            _billingService = billingService;
        }
        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            await _billingService.MonitorBankStatementImport();
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

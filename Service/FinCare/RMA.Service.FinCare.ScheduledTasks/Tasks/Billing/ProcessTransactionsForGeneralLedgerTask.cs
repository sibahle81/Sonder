using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.Billing.Contracts.Interfaces;

using System;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.ScheduledTasks.Tasks.Billing
{
    public class ProcessTransactionsForGeneralLedgerTask : IScheduledTaskHandler
    {
        private readonly IAbilityTransactionsAuditService _abilityTransactionsAuditService;

        public ProcessTransactionsForGeneralLedgerTask(IAbilityTransactionsAuditService abilityTransactionsAuditService)
        {
            _abilityTransactionsAuditService = abilityTransactionsAuditService;
        }

        public Task<bool> ExecuteTask(int scheduledTaskId)
        {
            Task.Run(() => _abilityTransactionsAuditService.ProcessTransactionsForPosting()).ConfigureAwait(true);
            return Task.FromResult(true);
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

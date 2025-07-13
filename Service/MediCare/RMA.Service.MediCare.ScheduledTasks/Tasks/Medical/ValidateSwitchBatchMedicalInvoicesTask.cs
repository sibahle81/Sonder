using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using System;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.ScheduledTasks.Tasks.Medical
{
    public class ValidateSwitchBatchMedicalInvoicesTask : IScheduledTaskHandler
    {
        public bool CanCompleteTask => false;
        private readonly IInvoiceMedicalSwitchService _invoiceMedicalSwitchService;

        public ValidateSwitchBatchMedicalInvoicesTask(IInvoiceMedicalSwitchService invoiceMedicalSwitchService)
        {
            _invoiceMedicalSwitchService = invoiceMedicalSwitchService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            await _invoiceMedicalSwitchService.SendSwitchBatchValidationRequests(0);
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
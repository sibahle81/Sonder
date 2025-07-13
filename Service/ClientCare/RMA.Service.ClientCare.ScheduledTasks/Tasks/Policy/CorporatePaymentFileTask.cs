using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.ScheduledTasks.Tasks.Policy
{
    public class CorporatePaymentFileTask : IScheduledTaskHandler
    {
        private readonly IPolicyReportService _policyReportService;

        public bool CanCompleteTask => false;

        public CorporatePaymentFileTask(IPolicyReportService policyReportService)
        {
            _policyReportService = policyReportService;
        }

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
            return await _policyReportService.SendCorporatePaymentFiles();
        }
    }
}

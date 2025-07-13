using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.ScheduledTasks.Tasks.TTDsNearing18Months
{
    public class TTDsNearing18MonthsTask : IScheduledTaskHandler
    {
        private readonly IClaimInvoiceService _claimInvoiceService;

        public TTDsNearing18MonthsTask(IClaimInvoiceService claimInvoiceService)
        {
            _claimInvoiceService = claimInvoiceService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            var result = await _claimInvoiceService.GetTTDs18MonthsOld();
            return await Task.FromResult(true);
        }

        public bool CanCompleteTask => true;

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

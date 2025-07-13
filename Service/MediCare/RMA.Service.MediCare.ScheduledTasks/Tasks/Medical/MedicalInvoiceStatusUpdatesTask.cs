using RMA.Common.Database.Contracts.ContextScope;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database.Constants;

using System;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.ScheduledTasks.Tasks.Medical
{
    internal class MedicalInvoiceStatusUpdatesTask : IScheduledTaskHandler
    {
        public bool CanCompleteTask => false;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private IInvoiceService _invoiceService;

        public MedicalInvoiceStatusUpdatesTask(IDbContextScopeFactory dbContextScopeFactory,
            IInvoiceService invoiceService)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _invoiceService = invoiceService;
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
            await _invoiceService.MedicalInvoiceStatusUpdates(DatabaseConstants.MedicalInvoiceStatusUpdates);
            return true;
        }
    }
}

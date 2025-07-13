using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Interfaces.Lead;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.ScheduledTasks.Tasks.LeadReminder
{
    public class LeadRemindersTask : IScheduledTaskHandler
    {
        private readonly ILeadService _leadService;

        public LeadRemindersTask(ILeadService leadService)
        {
            _leadService = leadService;
        }

        public Task<bool> ExecuteTask(int scheduledTaskId)
        {
            // await _leadService.SendDailyLeadReminders();
            return Task.FromResult(true);
        }

        public bool CanCompleteTask => false;

        public Task CompleteTask(int detailsScheduledTaskId, bool success,
            TaskScheduleFrequencyEnum detailsTaskScheduleFrequency, TimeSpan executionDuration)
        {
            return Task.CompletedTask;
        }

        public Task DeleteTask(int detailsScheduledTaskId)
        {
            return Task.CompletedTask;
        }
    }
}


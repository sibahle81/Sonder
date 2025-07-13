using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;


namespace RMA.Service.ClientCare.ScheduledTasks.Tasks.Renewal
{
    public class RenewalLetterTask : IScheduledTaskHandler
    {
        private readonly IMemberService _memberService;
        private readonly IIndustryClassService _industryClassService;

        public RenewalLetterTask(IMemberService memberService, IIndustryClassService industryClassService)
        {
            _memberService = memberService;
            _industryClassService = industryClassService;
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            var industryClassEnums = new List<IndustryClassEnum>();
            var industryClasses = await _industryClassService.GetIndustryClasses();
            foreach (var item in industryClasses)
            {
                industryClassEnums.Add((IndustryClassEnum)item.Id);
            }

            await _memberService.SendRenewalLetters(industryClassEnums);
            return true;
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


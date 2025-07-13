using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.BusinessProcessTasks
{
    public class AddInjuredEmployeeWizard : IWizardProcess
    {
        private readonly IEventService _eventService;
        private readonly IAccidentService _accidentService;

        public AddInjuredEmployeeWizard(
              IEventService eventService
            , IAccidentService accidentService)
        {
            _eventService = eventService;
            _accidentService = accidentService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null)
                return 0;
            var eventSearchData = context.Deserialize<EventSearch>(context.Data);
            var wizardDescription = "New Injured Employee";

            var eventDetails = await _eventService.GetEventDetails(eventSearchData.EventId);

            var stepData = new ArrayList { eventDetails };
            return await context.CreateWizard(wizardDescription, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            if (context == null)
                return;
            var wizard = context.Deserialize<Wizard>(context.Data);
            await _accidentService.AddEmployeesToAccidentNotification(wizard);
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context), "The provided context is null.");
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var eventDetails = context.Deserialize<Event>(stepData[0].ToString());
            var ruleResults = new List<RuleResult>();
            var ruleResult = new RuleResult();
            var overallSuccess = true;
            if ((eventDetails.MemberSiteId == 0 || eventDetails.MemberSiteId == null) && eventDetails.PersonEvents.Count == 0)
            {
                ruleResult.Passed = false;
                overallSuccess = false;
                ruleResult.RuleName = "Employee Event Details";
                ruleResult.MessageList.Add("Employee Event Details have not been Captured");
                ruleResults.Add(ruleResult);
            }
            else if (eventDetails.PersonEvents.Count == 0)
            {
                ruleResult.Passed = false;
                overallSuccess = false;
                ruleResult.RuleName = "Employee Details";
                ruleResult.MessageList.Add("Employee Details have not been Captured");
                ruleResults.Add(ruleResult);
            }
            else
            {
                foreach (var personEvent in eventDetails.PersonEvents)
                {
                    if (personEvent.RolePlayer == null)
                    {
                        if (ruleResults.Any(a => a.RuleName == "Employee Details"))
                        {
                            var result = ruleResults.FirstOrDefault(a => a.RuleName == "Employee Details");
                            result.MessageList.Add("Employee Details have not been Captured");
                        }
                        else
                        {
                            ruleResult.Passed = false;
                            overallSuccess = false;
                            ruleResult.RuleName = "Employee Details";
                            ruleResult.MessageList.Add("Employee Details have not been Captured");

                            ruleResults.Add(ruleResult);
                        }
                    }

                    if (personEvent.ClaimType == null)
                    {
                        if (ruleResults.Any(a => a.RuleName == "Employee Insurance Details"))
                        {
                            ruleResult.MessageList.Add($"Employee {personEvent.RolePlayer.DisplayName} Insurance Details have not been Captured");
                        }
                        else
                        {
                            ruleResult.Passed = false;
                            overallSuccess = false;
                            ruleResult.RuleName = "Employee Insurance Details";
                            ruleResult.MessageList.Add($"Employee {personEvent.RolePlayer.DisplayName} Insurance Details have not been Captured");
                            ruleResults.Add(ruleResult);
                        }

                    }
                }
            }
            return await Task.FromResult(new RuleRequestResult()
            {
                OverallSuccess = overallSuccess,
                RequestId = Guid.NewGuid(),
                RuleResults = ruleResults
            });
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public Task<string> ChangeTheNameWizard(string data, int wizardId, string currentWizardName)
        {
            return Task.FromResult<string>(string.Empty);
        }

        public  Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public  Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public  Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public  Task OnApprove(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public  Task OnRequestForApproval(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public  Task OnSaveStep(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public  Task OverrideWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }
        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}

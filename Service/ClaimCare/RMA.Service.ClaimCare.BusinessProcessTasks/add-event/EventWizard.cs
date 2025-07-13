using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.BusinessProcessTasks
{
    public class EventWizard : IWizardProcess
    {
        private readonly IEventService _eventService;

        public EventWizard(
           IEventService eventService)
        {
            _eventService = eventService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));

            Event eventEntity;

            if (context.LinkedItemId <= 0)
            {
                eventEntity = new Event();
                var reference = await _eventService.GenerateEventUniqueReferenceNumber();
                eventEntity.EventReferenceNumber = reference;
            }
            else
            {
                eventEntity = await _eventService.GetEvent(context.LinkedItemId);
            }

            var wizardId = await AddWizard(context, eventEntity);

            return await Task.FromResult(wizardId);
        }

        private static async Task<int> AddWizard(IWizardContext context, Event eventEntity)
        {
            var stepData = new ArrayList()
            {
                eventEntity
            };

            var label = eventEntity.EventId == 0
                ? $"New Event: '{eventEntity.EventReferenceNumber}'"
                : $"Edit Event: '{eventEntity.EventReferenceNumber}'";

            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            if (context != null)
            {
                try
                {
                    var wizard = context.Deserialize<Wizard>(context.Data);
                    wizard.WizardStatusId = 4;
                    var stepData = context.Deserialize<ArrayList>(wizard.Data);
                    var eventEntity = context.Deserialize<Event>(stepData[0].ToString());

                    if (context.LinkedItemId <= 0)
                    {
                        var personEvents = eventEntity.PersonEvents;
                        eventEntity.PersonEvents = null;
                        await _eventService.AddEventAndPersonEventDetails(eventEntity, personEvents);
                    }
                    else
                    {
                        await _eventService.UpdateEvent(eventEntity);
                    }
                }
                catch (Exception ex)
                {
                    throw new InvalidOperationException(ex.Message,ex.InnerException);
                }
            }
            throw new ArgumentNullException(nameof(context), "The provided context is null.");
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var result = new RuleRequestResult()
            {
                OverallSuccess = true,
                RequestId = Guid.NewGuid(),
                RuleResults = new List<RuleResult>()
            };
            return Task.FromResult(result);
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public  Task<string> ChangeTheNameWizard(string data, int wizardId, string currentWizardName)
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

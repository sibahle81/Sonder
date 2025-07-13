using Newtonsoft.Json;

using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.BusinessProcessTasks
{
    public class MmiExpiryExtensionWizard : IWizardProcess
    {
        private readonly IEventService _eventService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IClaimService _claimService;
        private readonly ICommonSystemNoteService _commonSystemNoteService;

        public MmiExpiryExtensionWizard(
              IEventService eventService
            , IRolePlayerService rolePlayerService
            , IClaimService claimService
            , ICommonSystemNoteService commonSystemNoteService)
        {
            _eventService = eventService;
            _rolePlayerService = rolePlayerService;
            _claimService = claimService;
            _commonSystemNoteService = commonSystemNoteService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            var data = context.Deserialize<PersonEvent>(context.Data);

            var _event = await _eventService.GetEvent(data.EventId);
            var personEvent = await _eventService.GetPersonEvent(data.PersonEventId);

            var description = string.Empty;

            foreach (var injury in personEvent.PhysicalDamages[0].Injuries)
            {
                if (!injury.IsDeleted && injury.InjuryRank == 1)
                {
                    var mmiExpiryDate = _event.EventDate.AddDays((int)injury.MmiDays);
                    TimeSpan timeDifference = mmiExpiryDate - DateTime.Today;
                    double daysToExpiry = Math.Floor(timeDifference.TotalDays);

                    switch (daysToExpiry)
                    {
                        case 15:
                            description = "(15 days before expiry)";
                            break;
                        case 0:
                            description = "(expires today)";
                            break;
                        case -7:
                            description = "(expired 7 days ago)";
                            break;
                    }
                }
            }

            var label = $"MMI extension {description} for PEV reference number: ({data.PersonEventReferenceNumber})";

            var stepData = new ArrayList() { personEvent };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var personEvent = context.Deserialize<PersonEvent>(stepData[0].ToString());

            await _claimService.NotifyPersonEventOwnerOrDefaultRole(personEvent.PersonEventId, "MMI extension was completed", "Clinical Claims Adjudicator");

            await _commonSystemNoteService.CreateCommonSystemNote(new CommonSystemNote
            {
                ItemId = personEvent.PersonEventId,
                NoteCategory = NoteCategoryEnum.PersonEvent,
                NoteItemType = NoteItemTypeEnum.PersonEvent,
                NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                NoteType = NoteTypeEnum.SystemAdded,
                Text = "MMI extension was completed",
                IsActive = true
            });
        }

        #region not implimented
        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var ruleResults = new List<RuleResult>();

            return await Task.FromResult(new RuleRequestResult()
            {
                OverallSuccess = true,
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

        public async Task<string> ChangeTheNameWizard(string data, int wizardId, string currentWizardName)
        {
            return await Task.FromResult(string.Empty);
        }


        public Task UpdateStatus(IWizardContext context)
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
        #endregion
    }
}

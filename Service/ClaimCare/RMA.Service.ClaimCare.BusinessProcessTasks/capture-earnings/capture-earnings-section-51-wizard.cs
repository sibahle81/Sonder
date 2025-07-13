using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
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
    public class CaptureEarningsSection51Wizard : IWizardProcess
    {
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IEventService _eventService;
        private readonly IClaimService _claimService;
        private readonly IClaimInvoiceService _claimInvoiceService;
        private readonly ICommonSystemNoteService _commonSystemNoteService;
        private readonly IClaimRequirementService _claimRequirementService;
        private readonly IWizardService _wizardService;

        public CaptureEarningsSection51Wizard(
            IRolePlayerService rolePlayerService,
            IEventService eventService,
            IClaimService claimService,
            IClaimInvoiceService claimInvoiceService,
            ICommonSystemNoteService commonSystemNoteService,
            IClaimRequirementService claimRequirementService,
            IWizardService wizardService)
        {
            _rolePlayerService = rolePlayerService;
            _eventService = eventService;
            _claimService = claimService;
            _claimInvoiceService = claimInvoiceService;
            _commonSystemNoteService = commonSystemNoteService;
            _claimRequirementService = claimRequirementService;
            _wizardService = wizardService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var personEvent = context.Deserialize<PersonEvent>(context.Data);

            var employer = await _rolePlayerService.GetRolePlayer((int)personEvent.CompanyRolePlayerId);

            var label = $"SECTION 51: Capture earnings | Employer: ({employer.DisplayName}) Employee: ({personEvent.RolePlayer.DisplayName}) PEV: ({personEvent.PersonEventReferenceNumber})";

            var stepData = new ArrayList() { personEvent };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);

            var personEvent = await _eventService.GetPersonEvent(context.LinkedItemId);
            personEvent.Earnings = context.Deserialize<PersonEvent>(stepData[0].ToString()).Earnings;
            personEvent.PersonEventClaimRequirements = await _claimRequirementService.GetPersonEventRequirements(context.LinkedItemId);

            bool isFatal = personEvent.IsFatal ?? false;

            var noteText = string.Empty;
            var defaultRoleName = isFatal ? "Claims Management Consultant" : "Claims Assessor";

            var isOverride = IsOverrideRequired(personEvent);

            if (isOverride)
            {
                noteText += "Future Probable Earnings were captured. Override was required. Workflow sent to EA TL";
                await StartOverrideWizard(personEvent, context);
            }
            else
            {
                var index = personEvent.Earnings.FindIndex(s => s.EarningId <= 0);

                if (index > -1) // added
                {
                    personEvent.Earnings[index].IsVerified = true;
                    noteText += $"{personEvent.Earnings[index].EarningsType} earnings {personEvent.Earnings[index].Total:F2} captured and verified";

                }
                else // edited
                {
                    noteText += $"Previously verified {personEvent.Earnings[0].EarningsType} earnings {personEvent.Earnings[0].Total:F2} updated";
                }

                await _eventService.UpdatePersonEvent(personEvent);
                await _claimInvoiceService.ReCalculatePDClaimEstimates(personEvent);
            }

            if (!string.IsNullOrEmpty(noteText))
            {
                await _commonSystemNoteService.CreateCommonSystemNote(new CommonSystemNote
                {
                    ItemId = personEvent.PersonEventId,
                    NoteCategory = NoteCategoryEnum.PersonEvent,
                    NoteItemType = NoteItemTypeEnum.PersonEvent,
                    NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                    NoteType = NoteTypeEnum.Earnings,
                    Text = noteText,
                    IsActive = true
                });

                _ = Task.Run(() => _claimService.NotifyPersonEventOwnerOrDefaultRole(context.LinkedItemId, noteText, defaultRoleName));
            }
        }

        private static bool IsOverrideRequired(PersonEvent personEvent)
        {
            // if is edited then override needed
            if (personEvent.Earnings?.Count == 1)
            {
                var index = personEvent.Earnings.FindIndex(s => s.EarningId > 0 && s.IsVerified);
                if (index > -1)
                {
                    return true;
                }
            }

            // if is current earnings is less then accident then override needed
            var currentEarnings = personEvent.Earnings.Find(s => s.EarningsType == EarningsTypeEnum.Current);
            if (currentEarnings != null)
            {
                var accidentEarnings = personEvent.Earnings.Find(s => (s.EarningsType == EarningsTypeEnum.Accident && !s.IsEstimated));
                if (accidentEarnings != null && currentEarnings.Total < accidentEarnings.Total)
                {
                    return true;
                }
            }

            // if is variable earnings is more then non variable then override
            var newEarnings = personEvent.Earnings.Find(s => s.EarningId <= 0);
            if (newEarnings != null && newEarnings.VariableSubTotal > newEarnings.NonVariableSubTotal)
            {
                return true;
            }

            return false;
        }

        private async Task StartOverrideWizard(PersonEvent personEvent, IWizardContext context)
        {
            var startWizardRequest = new StartWizardRequest
            {
                LinkedItemId = personEvent.PersonEventId,
                Type = "capture-earnings-override",
                Data = context.Serialize(personEvent)
            };

            await _wizardService.StartWizard(startWizardRequest);
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            Contract.Requires(context != null);
            var ruleResults = new List<RuleResult>();

            var personEvent = await _eventService.GetPersonEvent(context.LinkedItemId);
            if (personEvent.Earnings?.Find(s => s.EarningsType == EarningsTypeEnum.Accident && s.IsVerified) == null)
            {
                var ruleResult = new RuleResult
                {
                    RuleName = "Accident Earnings Capture Required",
                    MessageList = { "Cannot submit section 51 earnings before accident earnings workflow has been completed" },
                    Passed = false
                };

                ruleResults.Add(ruleResult);
            }



            return await Task.FromResult(new RuleRequestResult()
            {
                OverallSuccess = ruleResults.Find(s => !s.Passed) == null,
                RequestId = Guid.NewGuid(),
                RuleResults = ruleResults
            });
        }

        #region not implimented

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

        public Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnApprove(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public  Task OnRequestForApproval(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnSaveStep(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OverrideWizard(IWizardContext context)
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
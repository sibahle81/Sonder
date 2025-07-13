using RMA.Common.Extensions;
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
using System.Text;

namespace RMA.Service.ClaimCare.BusinessProcessTasks
{
    public class CaptureEarningsOverrideWizard : IWizardProcess
    {
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IEventService _eventService;
        private readonly IClaimService _claimService;
        private readonly IClaimInvoiceService _claimInvoiceService;
        private readonly ICommonSystemNoteService _commonSystemNoteService;
        private readonly IClaimRequirementService _claimRequirementService;

        public CaptureEarningsOverrideWizard(
            IRolePlayerService rolePlayerService,
            IEventService eventService,
            IClaimService claimService,
            IClaimInvoiceService claimInvoiceService,
            ICommonSystemNoteService commonSystemNoteService,
            IClaimRequirementService claimRequirementService)
        {
            _rolePlayerService = rolePlayerService;
            _eventService = eventService;
            _claimService = claimService;
            _claimInvoiceService = claimInvoiceService;
            _commonSystemNoteService = commonSystemNoteService;
            _claimRequirementService = claimRequirementService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var personEvent = context.Deserialize<PersonEvent>(context.Data);

            var employer = await _rolePlayerService.GetRolePlayer((int)personEvent.CompanyRolePlayerId);

            var action = personEvent.IsFatal == true ? "FATAL: " : "";
            action += personEvent?.Earnings?.FindIndex(s => !s.IsEstimated) > -1 ? "Edit" : "Capture";

            var label = $"Override {action} earnings | Employer: ({employer.DisplayName}) Employee: ({personEvent.RolePlayer.DisplayName}) PEV: ({personEvent.PersonEventReferenceNumber})";

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

            var isFatal = (bool)personEvent.IsFatal;

            var noteText = "EA TL Override: ";
            var defaultRoleName = isFatal ? "Claims Management Consultant" : "Claims Assessor";
            var earningType = EarningsTypeEnum.NotApplicable;

            var index = personEvent.Earnings.FindIndex(s => s.EarningId <= 0);

            if (index > -1) // added
            {
                personEvent.Earnings[index].IsVerified = true;
                noteText += $"{personEvent.Earnings[index].EarningsType} earnings {personEvent.Earnings[index].Total:F2} captured and verified";
                earningType = personEvent.Earnings[index].EarningsType;
            }
            else // edited
            {
                noteText += $"Previously verified {personEvent.Earnings[0].EarningsType} earnings {personEvent.Earnings[0].Total:F2} updated";
                earningType = personEvent.Earnings[0].EarningsType;
            }

            if (earningType == EarningsTypeEnum.Accident)
            {
                if (personEvent?.Claims.Count > 0)
                {
                    Claim pensionClaim = null;

                    foreach (var claim in personEvent.Claims)
                    {
                        if (claim.ClaimLiabilityStatus == ClaimLiabilityStatusEnum.MedicalLiability)
                        {
                            claim.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.FullLiabilityAccepted;
                            noteText += ": Liability decision was updated from Medical Liability to Full Liability";
                        }

                        if ((bool)personEvent.IsFatal)
                        {
                            if (claim.ClaimLiabilityStatus == ClaimLiabilityStatusEnum.MedicalLiability || claim.ClaimLiabilityStatus == ClaimLiabilityStatusEnum.FullLiabilityAccepted)
                            {
                                claim.DisabilityPercentage = Convert.ToDecimal(100);
                                claim.PdVerified = true;
                                pensionClaim = personEvent.Claims[0];
                                noteText += ": Disibility percentage auto updated and verified (100%) because incident is fatal and liability was accepted";
                            }
                        }
                    }

                    HandleRequirementIfExists(personEvent);

                    await _eventService.UpdatePersonEvent(personEvent);
                    await _claimInvoiceService.ReCalculateAllClaimEstimates(personEvent, false);

                    if (Convert.ToInt32(personEvent.Claims[0].UnderwriterId) == (int)UnderwriterEnum.RMAMutualAssurance)
                    {
                        personEvent.Claims = (await _claimService.AcknowledgeVapsClaims(context.LinkedItemId)).Claims;
                    }
                }
                else
                {
                    HandleRequirementIfExists(personEvent);
                    await _eventService.UpdatePersonEvent(personEvent);
                }
            }
            else if (earningType == EarningsTypeEnum.Current)
            {
                await _eventService.UpdatePersonEvent(personEvent);
                await _claimInvoiceService.ReCalculateTTDClaimEstimates(personEvent);
            }
            else if (earningType == EarningsTypeEnum.FutureProbable)
            {
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

        private static void HandleRequirementIfExists(PersonEvent personEvent)
        {
            if (personEvent?.PersonEventClaimRequirements?.Count > 0)
            {
                var index = personEvent.PersonEventClaimRequirements.FindIndex(s => s?.ClaimRequirementCategory?.Name?.ToLower() == "capture accident earnings" && s.DateClosed == null);
                if (index > -1)
                {
                    personEvent.PersonEventClaimRequirements[index].DateClosed = DateTimeHelper.SaNow;
                }
            }
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

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return string.Empty;
        }

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
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
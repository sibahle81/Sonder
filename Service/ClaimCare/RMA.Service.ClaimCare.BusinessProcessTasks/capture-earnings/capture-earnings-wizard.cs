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
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.BusinessProcessTasks
{
    public class CaptureEarningsWizard : IWizardProcess
    {
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IEventService _eventService;
        private readonly IClaimService _claimService;
        private readonly IClaimInvoiceService _claimInvoiceService;
        private readonly ICommonSystemNoteService _commonSystemNoteService;
        private readonly IClaimRequirementService _claimRequirementService;
        private readonly IWizardService _wizardService;

        public CaptureEarningsWizard(
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
            var _event = await _eventService.GetEvent(personEvent.EventId);

            var employer = await _rolePlayerService.GetRolePlayer((int)personEvent.CompanyRolePlayerId);

            var action = personEvent.IsFatal == true ? "FATAL: " : "";
            action += personEvent?.Earnings?.FindIndex(s => !s.IsEstimated) > -1 ? "Edit" : "Capture";

            var label = $"{action} earnings | Employer: ({employer.DisplayName}) Employee: ({personEvent.RolePlayer.DisplayName}) PEV: ({personEvent.PersonEventReferenceNumber})";

            var age = GetAge(personEvent?.RolePlayer?.Person?.DateOfBirth, _event.EventDate);
            var isAgeUnder26 = age < 26;
            var isTrainee = personEvent?.RolePlayer?.Person?.PersonEmployments?[0]?.IsTraineeLearnerApprentice ?? false;

            if (isAgeUnder26 || isTrainee)
            {
                _ = Task.Run(() => StartSection51Wizard(personEvent, context));
            }

            var stepData = new ArrayList() { personEvent };
            return await context.CreateWizard(label, stepData);
        }

        // Replace the section where `noteText` is being concatenated with a StringBuilder.
        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);

            var personEvent = await _eventService.GetPersonEvent(context.LinkedItemId);
            personEvent.Earnings = context.Deserialize<PersonEvent>(stepData[0].ToString()).Earnings;
            personEvent.PersonEventClaimRequirements = await _claimRequirementService.GetPersonEventRequirements(context.LinkedItemId);

            bool isFatal = personEvent.IsFatal ?? false;

            var noteTextBuilder = new StringBuilder(); // Use StringBuilder instead of string concatenation.
            var defaultRoleName = isFatal ? "Claims Management Consultant" : "Claims Assessor";

            var isOverride = IsOverrideRequired(personEvent);

            if (isOverride)
            {
                noteTextBuilder.Append("Earnings were captured. Override was required. Workflow sent to EA TL");
                await StartOverrideWizard(personEvent, context);
            }
            else
            {
                var earningType = EarningsTypeEnum.NotApplicable;
                var index = personEvent.Earnings.FindIndex(s => s.EarningId <= 0);

                if (index > -1) // added
                {
                    personEvent.Earnings[index].IsVerified = true;
                    noteTextBuilder.AppendFormat("{0} earnings {1:F2} captured and verified", personEvent.Earnings[index].EarningsType, personEvent.Earnings[index].Total);
                    earningType = personEvent.Earnings[index].EarningsType;
                }
                else // edited
                {
                    noteTextBuilder.AppendFormat("Previously verified {0} earnings {1:F2} updated", personEvent.Earnings[0].EarningsType, personEvent.Earnings[0].Total);
                    earningType = personEvent.Earnings[0].EarningsType;
                }

                if (earningType != EarningsTypeEnum.Current)
                {
                    if (personEvent?.Claims.Count > 0)
                    {
                        Claim pensionClaim = null;

                        foreach (var claim in personEvent.Claims)
                        {
                            if (claim.ClaimLiabilityStatus == ClaimLiabilityStatusEnum.MedicalLiability)
                            {
                                claim.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.FullLiabilityAccepted;
                                noteTextBuilder.Append(": Liability decision was updated from Medical Liability to Full Liability");
                            }

                            if ((bool)personEvent.IsFatal && (claim.ClaimLiabilityStatus == ClaimLiabilityStatusEnum.MedicalLiability || claim.ClaimLiabilityStatus == ClaimLiabilityStatusEnum.FullLiabilityAccepted))
                            {
                                claim.DisabilityPercentage = Convert.ToDecimal(100);
                                claim.PdVerified = true;
                                pensionClaim = personEvent.Claims[0];
                                noteTextBuilder.Append(": Disability percentage auto updated and verified (100%) because incident is fatal and liability was accepted");
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
                else
                {
                    await _eventService.UpdatePersonEvent(personEvent);
                    await _claimInvoiceService.ReCalculateTTDClaimEstimates(personEvent);
                }
            }

            if (noteTextBuilder.Length > 0)
            {
                await _commonSystemNoteService.CreateCommonSystemNote(new CommonSystemNote
                {
                    ItemId = personEvent.PersonEventId,
                    NoteCategory = NoteCategoryEnum.PersonEvent,
                    NoteItemType = NoteItemTypeEnum.PersonEvent,
                    NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                    NoteType = NoteTypeEnum.Earnings,
                    Text = noteTextBuilder.ToString(),
                    IsActive = true
                });

                _ = Task.Run(() => _claimService.NotifyPersonEventOwnerOrDefaultRole(context.LinkedItemId, noteTextBuilder.ToString(), defaultRoleName));
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

        private async Task StartSection51Wizard(PersonEvent personEvent, IWizardContext context)
        {
            var startWizardRequest = new StartWizardRequest
            {
                LinkedItemId = personEvent.PersonEventId,
                Type = "capture-earnings-section-51",
                Data = context.Serialize(personEvent)
            };

            await _wizardService.StartWizard(startWizardRequest);
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

        private static int GetAge(DateTime? birthDate, DateTime referenceDate)
        {
            if (!birthDate.HasValue)
                return 0; // Default age if birthDate is null

            var age = referenceDate.Year - birthDate.Value.Year;

            // Adjust if the birthdate hasn't occurred yet in the current year
            if (referenceDate < birthDate.Value.AddYears(age))
            {
                age--;
            }

            return age;
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

        public  Task UpdateStatus(IWizardContext context)
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

        public Task OnRequestForApproval(IWizardContext context)
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
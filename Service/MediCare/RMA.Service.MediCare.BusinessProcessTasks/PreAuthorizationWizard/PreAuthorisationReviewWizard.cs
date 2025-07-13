using CommonServiceLocator;
using Newtonsoft.Json.Linq;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.RuleTasks;
using RMA.Service.ClaimCare.RuleTasks.PreAuthClaim;
using RMA.Service.ClaimCare.RuleTasks.PreAuthClaimInjury;
using RMA.Service.ClaimCare.RuleTasks.PreAuthClaimNotOlderThanTwoYears;
using RMA.Service.ClaimCare.RuleTasks.PreAuthClaimStpStatus;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.MediCare.BusinessProcessTasks.Notifications;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database.Constants;
using RMA.Service.MediCare.RuleTasks.PreAuthRules;
using RMA.Service.PensCare.Contracts.Interfaces.ClaimMap;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Linq.Dynamic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.BusinessProcessTasks
{
    public class PreAuthorisationReviewWizard : IWizardProcess
    {
        private readonly IPreAuthorisationService _preAuthorisationService;
        private readonly IPreAuthClaimService _preAuthClaimService;
        private readonly IWizardService _wizardService;
        private readonly IUserService _userService;
        private readonly IRoleService _roleService;
        private readonly IPensionClaimMapService _pensionClaimMapService;
        private IRuleContext _context;
        private DateTime? dateOfDeath;
        NotificationManagement notificationManagement;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly ISLAService _slaService;
        private readonly IMedicareCommunicationService _medicareCommunicationService;
        private readonly IClaimService _claimService;
        private readonly IHealthCareProviderService _healthCareProviderService;

        public PreAuthorisationReviewWizard(
             IPreAuthorisationService preAuthorisationService,
             IPreAuthClaimService preAuthClaimService,
             IUserService userService,
             IRoleService roleService,
             IWizardService wizardService,
            IPensionClaimMapService pensionClaimMapService,
             IRolePlayerService rolePlayerService,
             ISLAService slaService,
             IMedicareCommunicationService medicareCommunicationService,
             IClaimService claimService,
              IHealthCareProviderService healthCareProviderService
            )
        {
            _preAuthorisationService = preAuthorisationService;
            _preAuthClaimService = preAuthClaimService;
            _wizardService = wizardService;
            _userService = userService;
            _roleService = roleService;
            _pensionClaimMapService = pensionClaimMapService;
            _rolePlayerService = rolePlayerService;
            _slaService = slaService;
            _healthCareProviderService = healthCareProviderService;
            _context = ServiceLocator.Current.GetInstance<IRuleContext>();
            notificationManagement = new NotificationManagement(_wizardService, _userService, _roleService, _preAuthorisationService, _preAuthClaimService, _pensionClaimMapService);
            _medicareCommunicationService = medicareCommunicationService;
            _claimService = claimService;
                }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var preAuthorisation = context.Deserialize<PreAuthorisation>(context.Data);
            var claimReference = string.Empty;
            if (preAuthorisation.PersonEventId.HasValue)
                claimReference = await _preAuthClaimService.GetClaimReferenceNumberByPersonEventId(preAuthorisation.PersonEventId.Value);

            var label = string.Empty;
            if (!string.IsNullOrEmpty(claimReference))
                label = $"({preAuthorisation.PreAuthType.GetDescription().SplitCamelCaseText()}) Pre-Auth review ({claimReference})";
            else
                label = $"({preAuthorisation.PreAuthType.GetDescription().SplitCamelCaseText()}) Pre-Auth review";

            if (preAuthorisation.HealthCareProviderId > 0)
            {
                var hcp = await _rolePlayerService.GetRolePlayer(preAuthorisation.HealthCareProviderId);
                if (hcp != null)
                    label = $"{label} :{hcp.DisplayName}";
            }
            var stepData = new ArrayList { preAuthorisation };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            if (context == null) return;

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var preAuthForm = context.Deserialize<PreAuthorisation>(stepData[0].ToString());
            
            preAuthForm.ModifiedDate = DateTimeHelper.SaNow;
            await _preAuthorisationService.UpdatePreAuthorisation(preAuthForm).ConfigureAwait(false);

            var lastActivity = await _preAuthorisationService.GetPreAuthActivity(preAuthForm.PreAuthId, PreAuthStatusEnum.InfoRequired);
            if (lastActivity != null)
                await _wizardService.SendWizardNotification("review-preauth-notification", "PreAuthorisation Review", "More Information requested", $"medicare/preauth-view/{preAuthForm.PreAuthId}", preAuthForm.PreAuthId, preAuthForm.CreatedBy);

            var slaStatusChangeAudit = new SlaStatusChangeAudit
            {
                SLAItemType = SLAItemTypeEnum.WorkPoolWorkflows,
                ItemId = wizard.Id,
                Status = WizardStatusEnum.Completed.GetDescription(),
                EffectiveFrom = DateTimeHelper.SaNow,
                EffictiveTo = DateTimeHelper.SaNow,
                Reason = $"Preauth review completed by {RmaIdentity.Email}",
                CreatedBy = RmaIdentity.Email
            };
            _ = Task.Run(() => SendAuthorizedFormLetter(preAuthForm));
            await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);
        }

        public async Task OnSaveStep(IWizardContext context)
        {
            Contract.Requires(context != null);
            var medicalUserRole = await _roleService.GetRoleByName(MedicalRoles.MedicalAdminAssistant);
            var currentUser = await _userService.GetUserById(RmaIdentity.UserId);
            if (currentUser.RoleId == medicalUserRole.Id)
            {
                var wizard = context?.Deserialize<Wizard>(context.Data);
                wizard.WizardStatus = WizardStatusEnum.New;
                await context.UpdateWizard(wizard);
            }
        }

        public async Task UpdateStatus(IWizardContext context)
        {
            var medicalUserRole = await _roleService.GetRoleByName(MedicalRoles.MedicalAdminAssistant);
            var currentUser = await _userService.GetUserById(RmaIdentity.UserId);
            if (currentUser.RoleId == medicalUserRole.Id)
            {
                var wizard = context?.Deserialize<Wizard>(context.Data);
                wizard.WizardStatus = WizardStatusEnum.New;
                await context.UpdateWizard(wizard);

                var slaStatusChangeAudit = new SlaStatusChangeAudit
                {
                    SLAItemType = SLAItemTypeEnum.WorkPoolWorkflows,
                    ItemId = wizard.Id,
                    Status = "Assigned",
                    EffectiveFrom = DateTimeHelper.SaNow,
                    Reason = $"Preauth assigned by {medicalUserRole.Name}",
                    CreatedBy = RmaIdentity.Email
                };

                await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);
            }
            else
            {
                var wizard = context?.Deserialize<Wizard>(context.Data);

                var slaItems = await _slaService.GetSLAStatusChangeAudits(SLAItemTypeEnum.WorkPoolWorkflows, wizard.Id);
                if (!slaItems.Any(c => c.Status == WizardStatusEnum.InProgress.GetDescription()
                && c.CreatedBy == RmaIdentity.Email))
                {
                    var slaStatusChangeAudit = new SlaStatusChangeAudit
                    {
                        SLAItemType = SLAItemTypeEnum.WorkPoolWorkflows,
                        ItemId = wizard.Id,
                        Status = WizardStatusEnum.InProgress.GetDescription(),
                        EffectiveFrom = DateTimeHelper.SaNow,
                        Reason = $"Preauth review actioned by {RmaIdentity.Email}",
                        CreatedBy = RmaIdentity.Email
                    };

                    await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);
                }
            }

        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return string.Empty;
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            RuleRequestResult ruleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() };
            if (context == null) return null;

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var preAuthForm = context.Deserialize<PreAuthorisation>(stepData[0].ToString());

            IRule claimLiabilityStatusRule = new ClaimLiabilityStatusRule();
            IRule claimNotOlderThanTwoYearsRule = new ClaimNotOlderThanTwoYearsRule();
            IRule preAuthFromDateRule = new PreAuthFromDateRule();
            IRule preAuthToDateRule = new PreAuthToDateRule();
            IRule preAuthInjuryDateRule = new PreAuthInjuryDateRule();
            IRule preAuthFromDateDODRule = new AuthFromDateAfterDateOfDeathRule();
            IRule preAuthToDateDODRule = new AuthToDateNotAfterDateOfDeathRule();
            IRule preAuthClaimStpStatusRule = new PreAuthClaimStpStatusRule();
            IRule preAuthClaimInjuryRule = new PreAuthClaimInjuryRule();
            int personEventId = Convert.ToInt32(preAuthForm.PersonEventId);

            PreAuthRulesHelper preAuthRulesHelper = new PreAuthRulesHelper(_preAuthClaimService);

            //Validate Claim Liability Status
            _context.Data = await preAuthRulesHelper.GetClaimLiabilityStatus(personEventId);
            var claimLiabilityStatusResult = claimLiabilityStatusRule.Execute(_context);
            ruleRequestResult.RuleResults.Add(new RuleResult { Passed = claimLiabilityStatusResult.Passed, RuleName = claimLiabilityStatusResult.RuleName, MessageList = claimLiabilityStatusResult.MessageList });

            //Validate Claim is not older than 2 year
            _context.Data = await preAuthRulesHelper.GetClaimEventDateAndPreAuthFromDateAsRuleData(personEventId, preAuthForm.DateAuthorisedFrom);
            var claimNotOlderThanTwoYearsResult = claimNotOlderThanTwoYearsRule.Execute(_context);
            ruleRequestResult.RuleResults.Add(new RuleResult { Passed = claimNotOlderThanTwoYearsResult.Passed, RuleName = claimNotOlderThanTwoYearsResult.RuleName, MessageList = claimNotOlderThanTwoYearsResult.MessageList });

            //Validate Authorisation FromDate connot be before the date of Event Date
            _context.Data = await preAuthRulesHelper.GetPreAuthRuleData(personEventId, preAuthForm);
            var dateofDeath = JToken.Parse(_context.Data).Value<string>("DateOfDeath");
            if (dateofDeath != null)
                dateOfDeath = Convert.ToDateTime(dateofDeath);
            var preAuthFromDateRuleResult = preAuthFromDateRule.Execute(_context);
            ruleRequestResult.RuleResults.Add(new RuleResult { Passed = preAuthFromDateRuleResult.Passed, RuleName = preAuthFromDateRuleResult.RuleName, MessageList = preAuthFromDateRuleResult.MessageList });

            //Validate Authorisation ToDate connot be before the date of Event Date
            var preAuthToDateRuleResult = preAuthToDateRule.Execute(_context);
            ruleRequestResult.RuleResults.Add(new RuleResult { Passed = preAuthToDateRuleResult.Passed, RuleName = preAuthToDateRuleResult.RuleName, MessageList = preAuthToDateRuleResult.MessageList });

            //Validate Authorisation Injury Date connot be before the date of Event Date
            var preAuthInjuryDateRuleResult = preAuthInjuryDateRule.Execute(_context);
            if (preAuthForm.IsRequestFromHcp == true)
                ruleRequestResult.RuleResults.Add(new RuleResult { Passed = preAuthInjuryDateRuleResult.Passed, RuleName = preAuthInjuryDateRuleResult.RuleName, MessageList = preAuthInjuryDateRuleResult.MessageList });
            else
                preAuthInjuryDateRuleResult.Passed = true;

            if (dateOfDeath != null)
            {
                //Validate Authorisation FromDate connot be before the date of death
                var preAuthFromDateDODRuleResult = preAuthFromDateDODRule.Execute(_context);
                ruleRequestResult.RuleResults.Add(new RuleResult { Passed = preAuthFromDateDODRuleResult.Passed, RuleName = preAuthFromDateDODRuleResult.RuleName, MessageList = preAuthFromDateDODRuleResult.MessageList });

                //Validate Authorisation ToDate connot be before the date of death
                var preAuthToDateDODRuleResult = preAuthToDateDODRule.Execute(_context);
                ruleRequestResult.RuleResults.Add(new RuleResult { Passed = preAuthToDateDODRuleResult.Passed, RuleName = preAuthToDateDODRuleResult.RuleName, MessageList = preAuthToDateDODRuleResult.MessageList });
            }

            //Validate Claim STP Status
            _context.Data = await preAuthRulesHelper.GetClaimSTPStatusAsync(personEventId).ConfigureAwait(true);
            var claimSTPStatusResult = preAuthClaimStpStatusRule.Execute(_context);
            ruleRequestResult.RuleResults.Add(new RuleResult { Passed = claimSTPStatusResult.Passed, RuleName = claimSTPStatusResult.RuleName, MessageList = claimSTPStatusResult.MessageList });

            //Validate PreAuth Claim Injury Status
            _context.Data = await preAuthRulesHelper.GetPreAuthClaimInjuryStatusAsync(personEventId, preAuthForm?.PreAuthIcd10Codes).ConfigureAwait(true);
            var claimInjuryResult = preAuthClaimInjuryRule.Execute(_context);
            ruleRequestResult.RuleResults.Add(new RuleResult { Passed = claimInjuryResult.Passed, RuleName = claimInjuryResult.RuleName, MessageList = claimInjuryResult.MessageList });

            var rules = new List<RuleResult>();

            decimal? treatmentDoctorAutorizedAmont = 0;
            var hospitalAutorizedAmont = preAuthForm.AuthorisedAmount ?? 0;
            if (preAuthForm.SubPreAuthorisations?.Count > 0)
                treatmentDoctorAutorizedAmont = preAuthForm.SubPreAuthorisations[0].AuthorisedAmount ?? 0;

            var totalAutorizedAmont = hospitalAutorizedAmont + treatmentDoctorAutorizedAmont;

            var amountLimit = await _userService.GetAmountLimit((int)AmountLimitTypeEnum.PreAuthAuthorisationLimit);

            if (amountLimit < totalAutorizedAmont)
            {
                ruleRequestResult.RuleResults.Add(new RuleResult { RuleName = "Amount Limit", Passed = false, MessageList = new List<string> { "Unable to authorise. The total amount of this PreAuthorisation is above your limit." } });
            }

            ruleRequestResult.OverallSuccess = (claimLiabilityStatusResult.Passed && preAuthFromDateRuleResult.Passed
                                                && preAuthToDateRuleResult.Passed && preAuthInjuryDateRuleResult.Passed && claimSTPStatusResult.Passed) || true;


            return ruleRequestResult;
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public async Task OnApprove(IWizardContext context)
        {
            return;
        }

        public async Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return;
        }

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return;
        }

        public async Task OnRequestForApproval(IWizardContext context)
        {
            return;
        }

        public async Task OverrideWizard(IWizardContext context)
        {
            return;
        }

        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        private async Task SendAuthorizedFormLetter(PreAuthorisation preAuthForm)
        {
            try
            {
                var emailAddresses = new List<string>();

                var preAuth = await _preAuthorisationService.GetPreAuthorisationById(preAuthForm.PreAuthId);
                if (preAuth == null) return;

                var personEvent = await _claimService.GetPersonEventByClaimId((int)preAuthForm.ClaimId);
                if (personEvent?.CompanyRolePlayerId != null)
                {
                    AddPrimaryContactEmail(emailAddresses, await _rolePlayerService.GetRolePlayerContactDetails((int)personEvent.CompanyRolePlayerId));
                }

                var healthCareProvider = await _healthCareProviderService.GetHealthCareProviderById(preAuth.HealthCareProviderId);
                if (healthCareProvider?.RolePlayerId != null)
                {
                    AddPrimaryContactEmail(emailAddresses, await _rolePlayerService.GetRolePlayerContactDetails(healthCareProvider.RolePlayerId));
                }

                if (emailAddresses.Count > 0)
                {
                    await _medicareCommunicationService.SendAuthorizedFormLetter(preAuth.PreAuthNumber, preAuth.ClaimId.ToString(), emailAddresses, preAuth.PreAuthType);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SendAuthorizedFormLetter: {ex.Message}");
            }
        }

        private void AddPrimaryContactEmail(List<string> emailList, List<RolePlayerContact> contacts)
        {
            var contact = contacts
                ?.FirstOrDefault(c => c.ContactDesignationType == ContactDesignationTypeEnum.PrimaryContact);

            if (!string.IsNullOrWhiteSpace(contact?.EmailAddress))
            {
                emailList.Add(contact.EmailAddress);
            }
        }
    }
}

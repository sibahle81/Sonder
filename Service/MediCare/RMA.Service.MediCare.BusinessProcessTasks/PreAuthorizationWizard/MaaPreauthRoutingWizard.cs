using CommonServiceLocator;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.BusinessProcessTasks.PreAuthorizationWizard
{
    public class MaaPreauthRoutingWizard : IWizardProcess
    {
        private readonly IWizardService _wizardService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly ISerializerService _serializerService;
        private readonly IUserService _userService;
        private readonly IWizardConfigurationService _wizardConfigurationService;
        private readonly IPreAuthClaimService _preAuthClaimService;
        public MaaPreauthRoutingWizard(
             IWizardService wizardService,
             IRolePlayerService rolePlayerService,
             ISerializerService serializerService,
             IUserService userService,
             IWizardConfigurationService wizardConfigurationService,
             IPreAuthClaimService preAuthClaimService
            )
        {
            _wizardService = wizardService;
            _rolePlayerService = rolePlayerService;
            _serializerService = serializerService;
            _userService = userService;
            _wizardConfigurationService = wizardConfigurationService;
            _preAuthClaimService = preAuthClaimService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null) return await Task.FromResult(-1).ConfigureAwait(false);

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

            var stepData = new ArrayList() { preAuthorisation };
            var wizardId = await context.CreateWizard(label, stepData).ConfigureAwait(false);

            return await Task.FromResult(wizardId).ConfigureAwait(false);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            if (context == null) return;

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var preAuthorisation = context.Deserialize<PreAuthorisation>(stepData[0].ToString());

            await CreateReviewWizard(preAuthorisation);
        }

        public async Task OnSaveStep(IWizardContext context)
        {
            return;
        }

        public async Task UpdateStatus(IWizardContext context)
        {
            return;
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
            var ruleResults = new List<RuleResult>();

            return await Task.FromResult(new RuleRequestResult()
            {
                OverallSuccess = true,
                RequestId = Guid.NewGuid(),
                RuleResults = ruleResults
            });

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

        public async Task<bool> CreateReviewWizard(PreAuthorisation preAuthorisation)
        {
            if (preAuthorisation != null)
            {
                var data = _serializerService.Serialize(preAuthorisation);
                var type = "review-preauth";//hospital
                if (preAuthorisation.PreAuthType == PreAuthTypeEnum.Prosthetic)
                    type = "review-prosthetic-preauth";
                else if (preAuthorisation.PreAuthType == PreAuthTypeEnum.ChronicMedication)
                    type = "review-chronic-preauth";
                else if (preAuthorisation.PreAuthType == PreAuthTypeEnum.Treatment)
                    type = "review-treatment-preauth";
                var assignToUserId = 0;
                if (preAuthorisation.AssignToUserId.HasValue)
                    assignToUserId = preAuthorisation.AssignToUserId.Value;
                var lockToUser = "";
                if (assignToUserId > 0)
                {
                    var user = await _userService.GetUserById(assignToUserId);
                    if (user != null)
                    {
                        lockToUser = user.Email;
                    }
                }

                if (preAuthorisation.ReviewWizardConfigId.HasValue && preAuthorisation.ReviewWizardConfigId.Value > 0)
                {
                    var wizardConfiguration = await _wizardConfigurationService.GetWizardConfigurationById(preAuthorisation.ReviewWizardConfigId.Value);
                    type = wizardConfiguration.Name;
                }
                var reviewWizard = new StartWizardRequest()
                {
                    Data = data,
                    Type = type,
                    LinkedItemId = preAuthorisation.PreAuthId,
                    LockedToUser = string.IsNullOrEmpty(lockToUser) ? null : lockToUser,
                    RequestInitiatedByBackgroundProcess = true
                };

                await _wizardService.StartWizard(reviewWizard);
            }

            return await Task.FromResult(true);
        }
    }
}
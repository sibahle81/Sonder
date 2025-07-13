using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.PremiumListingSchedule
{
    public class PremiumListingSchedules : IWizardProcess
    {
        private readonly IPremiumListingService _premiumListingService;
        private readonly IPolicyCommunicationService _communicationService;
        private readonly IWizardService _wizardService;
        private readonly IConfigurationService _configurationService;
        private readonly IUserService _userService;
        private readonly IPremiumListingFileAuditService _premiumListingFileAuditService;
        private readonly IPolicyService _policyService;

        public PremiumListingSchedules(
            IPremiumListingService premiumListingService,
            IPolicyCommunicationService communicationService,
            IWizardService wizardService,
            IConfigurationService configurationService,
            IUserService userService,
            IPremiumListingFileAuditService premiumListingFileAuditService,
            IPolicyService policyService)
        {
            _premiumListingService = premiumListingService;
            _communicationService = communicationService;
            _wizardService = wizardService;
            _configurationService = configurationService;
            _userService = userService;
            _premiumListingFileAuditService = premiumListingFileAuditService;
            _policyService = policyService;
        }

        public Task<int> StartWizard(IWizardContext context)
        {
            //THIS WIZARD IS INJECTED BY THE SYSTEM USING STORED PROC [bpm].[CreatePremiumListingPolicyScheduleWizard]
            return Task.FromResult(-999);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var data = GetWizardData(context, wizard.Data);

            _ = Task.Run(() => SendGroupPolicyDocuments(
                new Guid(data.FileIdentifier),
                data.GroupWelcomeLetter,
                data.GroupPolicySchedule,
                data.GroupTermsAndConditions,
                data.MemberWelcomeLetter,
                data.MemberPolicySchedule,
                data.MemberTermsAndConditions));

            var memberPortalBroker = await _configurationService.GetModuleSetting(SystemSettings.MemberPortalRoleBroker);
            var isBrokerOnPortal = await _userService.GetUsersByRoleAndEmail(memberPortalBroker, wizard.CreatedBy);

            if (isBrokerOnPortal != null)
            {
                var approvedMessage = await _configurationService.GetModuleSetting(SystemSettings.PremiumListingApprovedMessage);
                var request = new RejectWizardRequest()
                {
                    WizardId = wizard.Id,
                    Comment = approvedMessage,
                    RejectedBy = wizard.CreatedBy
                };
                var fileIdentifier = wizard.Data;
                await _premiumListingFileAuditService.UpdatePremiumListingStatusByFileIdentifier(fileIdentifier, PremiumListingStatusEnum.Approved);
            }
        }

        private async Task SendGroupPolicyDocuments(
            Guid fileIdentifier,
            bool groupWelcomeLetter,
            bool groupPolicySchedule,
            bool groupTermsandConditions,
            bool memberWelcomeLetter,
            bool memberPolicySchedule,
            bool memberTermsAndConditions)
        {
            var parentPolicyId = await _premiumListingService.GetGroupPolicyId(fileIdentifier);

            if (parentPolicyId < 0)
            {
                throw new Exception($"Could not locate policy for file identifier {fileIdentifier}");
            }

            var parentPolicyNumber = await _premiumListingService.GetGroupPolicyNumber(fileIdentifier);
            var parentPolicyMember = await _premiumListingService.GetPolicyMemberDetails(parentPolicyNumber);
            var policy = await _policyService.GetPolicy(parentPolicyId);

            var policyEmail = new PolicyEmail
            {
                PolicyNumber = parentPolicyNumber,
                SendGroupPolicySchedule = true,
                Recipients = new List<string>()
            };

            await _communicationService.SendGroupOnboardingDocuments(
                policy,
                policyEmail,
                parentPolicyMember,
                groupWelcomeLetter,
                groupPolicySchedule,
                groupTermsandConditions);

            var policyMembers = await _premiumListingService.GetGroupOnboardedMemberDetails(fileIdentifier);
            await _communicationService.SendPremiumListingGroupPolicyMemberSchedules(
                policy,
                policyEmail,
                policyMembers,
                memberWelcomeLetter,
                memberPolicySchedule,
                memberTermsAndConditions);
        }

        private ImportInsuredLivesRequest GetWizardData(IWizardContext context, string json)
        {
            if (json.StartsWith("["))
            {
                var stepData = context.Deserialize<List<ImportInsuredLivesRequest>>(json);
                return stepData[0];
            }
            else
            {
                return context.Deserialize<ImportInsuredLivesRequest>(json);
            }
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

        public Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return Task.FromResult(string.Empty);
        }

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OverrideWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public Task OnApprove(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
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

        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}

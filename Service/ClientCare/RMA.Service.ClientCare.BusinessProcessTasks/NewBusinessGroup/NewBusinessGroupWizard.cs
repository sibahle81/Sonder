using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.NewBusinessGroup
{
    public class NewBusinessGroupWizard : IWizardProcess
    {
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IConfigurationService _configurationService;
        private readonly IUserService _userService;
        private readonly IPolicyCaseService _caseService;
        private readonly IWizardService _wizardService;
        private readonly IRepresentativeService _representativeService;

        public NewBusinessGroupWizard(
            IRolePlayerService rolePlayerService,
            IDocumentIndexService documentIndexService,
            IDocumentGeneratorService documentGeneratorService,
            IConfigurationService configurationService,
            IUserService userService,
            IPolicyCaseService caseService,
            IWizardService wizardService,
            IRepresentativeService representativeService
        )
        {
            _rolePlayerService = rolePlayerService;
            _documentIndexService = documentIndexService;
            _documentGeneratorService = documentGeneratorService;
            _configurationService = configurationService;
            _userService = userService;
            _caseService = caseService;
            _wizardService = wizardService;
            _representativeService = representativeService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            RmaIdentity.DemandPermission(Permissions.CreateNewBusinessGroupCaseWizard);
            var caseModel = new Case();

            caseModel = context.Deserialize<Case>(context.Data);
            var label = $"New Business (Group): {caseModel.Code}";
            caseModel.MainMember.Company = new Company();
            caseModel.MainMember.RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Company;
            var policy = new RolePlayerPolicy
            {
                RepresentativeId = caseModel.RepresentativeId,
                BrokerageId = caseModel.BrokerageId,
                PolicyInceptionDate = DateTimeHelper.StartOfNextMonth,
                PolicyNumber = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.PolicyNumber, "01"),
                PolicyStatus = PolicyStatusEnum.PendingFirstPremium
            };
            caseModel.MainMember.Policies = new List<RolePlayerPolicy> { policy };

            var stepData = new ArrayList() { caseModel };
            var wizardId = await context.CreateWizard(label, stepData);
            return await Task.FromResult(wizardId);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            if (context == null) return;
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var caseModel = context.Deserialize<Case>(stepData[0].ToString());

            Case parentPolicyCase = null;
            if (caseModel.MainMember.Policies[0].ParentPolicyId.HasValue)
            {
                parentPolicyCase = await _caseService.GetCaseByPolicyId(caseModel.MainMember.Policies[0].ParentPolicyId.Value);
            }

            caseModel.MainMember.Policies.First().PolicyStatus = caseModel.MainMember.Policies[0].PolicyInceptionDate < DateTimeHelper.SaNow ? PolicyStatusEnum.Active : PolicyStatusEnum.PendingFirstPremium;
            await _rolePlayerService.RolePlayerGroupWizardSubmit(caseModel);

            try
            {
                await UpdateDocumentKeyValues(caseModel.Code, caseModel.MainMember.Policies[0].PolicyNumber);
                caseModel.Representative = await _representativeService.GetRepresentativeWithNoRefData(caseModel.MainMember.Policies[0].RepresentativeId);
            }
            catch (Exception ex)
            {
                ex.LogException();
            }

            var memberPortalBroker = await _configurationService.GetModuleSetting(SystemSettings.MemberPortalRoleBroker);
            var isBrokerOnPortal = await _userService.GetUsersByRoleAndEmail(memberPortalBroker, wizard.ModifiedBy);

            if (isBrokerOnPortal != null)
            {
                var approvedMessage = await _configurationService.GetModuleSetting(SystemSettings.CaseApprovedMessage);
                var request = new RejectWizardRequest()
                {
                    WizardId = wizard.Id,
                    Comment = caseModel.Code + ":" + approvedMessage,
                    RejectedBy = wizard.CreatedBy
                };
                await SendNotification(wizard, request, $": New Case {caseModel.Code} was Approved");
            }
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            if (context == null) return null; //Sonar Cube fix, context should never  be null
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var newCase = context.Deserialize<Case>(stepData[0].ToString());

            var ruleResults = new List<RuleResult>();

            if (newCase.MainMember == null) return GetRuleRequestResult(false, "Main member has not been added", "Main Member");
            if (newCase.MainMember.Policies == null) return GetRuleRequestResult(false, "No policy information has been added", "Policy Information");
            if (newCase.MainMember.Policies.Count == 0) return GetRuleRequestResult(false, "No policy information has been added", "Policy Information");

            var company = await _rolePlayerService.GetCompanyByReferenceNumber(newCase.MainMember.Company.ReferenceNumber);
            if (company != null) return GetRuleRequestResult(false, "A company with this registration number already exists", "Duplicate Company");

            return GetRuleRequestResult(true, ruleResults);
        }

        private async Task<bool> UpdateDocumentKeyValues(string oldKeyValue, string newKeyValue)
        {
            return await _documentIndexService.UpdateDocumentKeyValues(oldKeyValue, newKeyValue);
        }

        private RuleRequestResult GetRuleRequestResult(bool success, List<RuleResult> results)
        {
            return new RuleRequestResult
            {
                RequestId = Guid.NewGuid(),
                RuleResults = results,
                OverallSuccess = success
            };
        }

        private RuleRequestResult GetRuleRequestResult(bool success, string message, string ruleName)
        {
            return new RuleRequestResult
            {
                RequestId = Guid.NewGuid(),
                RuleResults = new List<RuleResult>() { GetRuleResult(success, message, ruleName) },
                OverallSuccess = success
            };
        }

        private async Task SendNotification(Wizard wizard, RejectWizardRequest rejectWizardRequest, string title)
        {
            await _wizardService.SendWizardNotification("member-portal-notification", title,
                rejectWizardRequest.Comment, null, 0, wizard.ModifiedBy);
        }

        #region Not Implemented
        private RuleResult GetRuleResult(bool success, string message, string ruleName)
        {
            var messages = new List<string> { message };

            return new RuleResult
            {
                MessageList = messages,
                Passed = success,
                RuleName = ruleName
            };
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return await Task.FromResult<string>(string.Empty);
        }

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            Contract.Requires(context != null);
            if (rejectWizardRequest != null)
            {
                var wizard = context.Deserialize<Wizard>(context.Data);
                var stepData = context.Deserialize<ArrayList>(wizard.Data);
                var @case = context.Deserialize<Case>(stepData[0].ToString());
                var memberPortalBroker = await _configurationService.GetModuleSetting(SystemSettings.MemberPortalRoleBroker);
                var isBrokerOnPortal = await _userService.GetUsersByRoleAndEmail(memberPortalBroker, wizard.CreatedBy);
                if (isBrokerOnPortal != null)
                {
                    await SendNotification(wizard, rejectWizardRequest, $": New Case {@case.Code} was Rejected");
                }
            }
        }

        public async Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            Contract.Requires(context != null);
            if (rejectWizardRequest != null)
            {
                var wizard = context.Deserialize<Wizard>(context.Data);
                var stepData = context.Deserialize<ArrayList>(wizard.Data);
                var @case = context.Deserialize<Case>(stepData[0].ToString());
                var memberPortalBroker = await _configurationService.GetModuleSetting(SystemSettings.MemberPortalRoleBroker);
                var isBrokerOnPortal = await _userService.GetUsersByRoleAndEmail(memberPortalBroker, wizard.CreatedBy);
                if (isBrokerOnPortal != null)
                {
                    await SendNotification(wizard, rejectWizardRequest, $": New Case {@case.Code} was Disputed");
                    wizard.LockedToUser = wizard.CreatedBy;
                    wizard.WizardStatus = WizardStatusEnum.Disputed;
                    wizard.WizardStatusId = (int)WizardStatusEnum.Disputed;
                    await _wizardService.UpdateWizard(wizard);
                }
            }
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
        public async Task OverrideWizard(IWizardContext context)
        {
            return;
        }
        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
        #endregion
    }
}

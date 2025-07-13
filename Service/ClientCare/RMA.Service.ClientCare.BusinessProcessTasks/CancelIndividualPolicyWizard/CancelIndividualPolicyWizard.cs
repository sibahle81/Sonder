using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceBus.Producers;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.CancelIndividualPolicyWizard
{
    public class CancelIndividualPolicyWizard : IWizardProcess
    {
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IPolicyCaseService _caseService;
        private readonly IPolicyCommunicationService _policyCommunicationService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IRepresentativeService _representativeService;
        private readonly IPolicyService _policyService;
        private readonly IConsolidatedFuneralService _consolidatedFuneralService;
        private readonly IMyValuePlusService _myValuePlusService;
        private readonly IBillingFuneralPolicyChangeService _billingFuneralPolicyChangeService;

        public const string PolicyChangesQueueName = "mcc.fin.billingpolicychanges";

        public CancelIndividualPolicyWizard(
            IRolePlayerPolicyService rolePlayerPolicyService,
            IPolicyCaseService caseService,
            IPolicyCommunicationService policyCommunicationService,
            IDocumentIndexService documentIndexService,
            IRepresentativeService representativeService,
            IPolicyService policyService,
            IConsolidatedFuneralService consolidatedFuneralService,
            IMyValuePlusService myValuePlusService,
            IBillingFuneralPolicyChangeService billingFuneralPolicyChangeService
            )
        {
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _caseService = caseService;
            _policyCommunicationService = policyCommunicationService;
            _documentIndexService = documentIndexService;
            _representativeService = representativeService;
            _policyService = policyService;
            _consolidatedFuneralService = consolidatedFuneralService;
            _myValuePlusService = myValuePlusService;
            _billingFuneralPolicyChangeService = billingFuneralPolicyChangeService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            RmaIdentity.DemandPermission(Permissions.CreateCancelPolicyCaseWizard);

            var contextData = context.Deserialize<Case>(context.Data);
            var caseModel = await _caseService.GetCaseByPolicyId(context.LinkedItemId);
            caseModel.CaseTypeId = (int)CaseTypeEnum.CancelPolicy;
            caseModel.Code = contextData.Code;

            var label = $"Cancel Policy: {caseModel.Code} - {caseModel.MainMember.DisplayName}";
            var stepData = new ArrayList() { caseModel };
            var wizardId = await AddWizard(context, stepData, label);

            return await Task.FromResult(wizardId);
        }

        private async Task<int> AddWizard(IWizardContext context, ArrayList stepData, string label)
        {
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var policyCase = context.Deserialize<Case>(stepData[0].ToString());
            var policy = policyCase.MainMember.Policies[0];

            var existingPolicy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(policy.PolicyId);
            var existingChildMemberCount = await _policyService.GetChildPolicyCount(policy.PolicyId);
            Case parentPolicyCase = null;

            if (policyCase.MainMember.Policies[0].ParentPolicyId.HasValue)
            {
                parentPolicyCase = await _caseService.GetCaseByPolicyId(policyCase.MainMember.Policies[0].ParentPolicyId.Value);
            }

            await _rolePlayerPolicyService.SubmitPolicyCancellation(policyCase.MainMember, wizard.CreatedBy, wizard.CreatedDate);

            if (policyCase.MainMember.Policies[0].ParentPolicyId.HasValue)
            {
                await _rolePlayerPolicyService.UpdateChildPolicyPremiums(policyCase.MainMember.Policies[0].ParentPolicyId.Value);
            }

            try
            {
                await UpdateDocumentKeyValues(policyCase.Code, policyCase.MainMember.Policies[0].PolicyNumber);
                policyCase.Representative = await _representativeService.GetRepresentativeWithNoRefData(policyCase.MainMember.Policies[0].RepresentativeId);
                await _policyCommunicationService.SendFuneralPolicyDocuments(wizard.Id, policyCase, parentPolicyCase, PolicySendDocsProcessTypeEnum.SendIndividualFuneralPolicyCancellation);

                var newPolicy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(policy.PolicyId);
                var newChildMemberCount = await _policyService.GetChildPolicyCount(policy.PolicyId);

                decimal invoiceTotal = newPolicy.InstallmentPremium - existingPolicy.InstallmentPremium;

                if (newChildMemberCount != existingChildMemberCount && invoiceTotal != 0)
                {
                    var basePremiumAmount = Math.Abs(invoiceTotal);

                    var billingPolicyChangeMessage = new BillingPolicyChangeMessage()
                    {
                        OldPolicyDetails = new BillingPolicyChangeDetail
                        {
                            PolicyId = existingPolicy.PolicyId,
                            DecemberInstallmentDayOfMonth = existingPolicy.DecemberInstallmentDayOfMonth,
                            FirstInstallmentDate = existingPolicy.FirstInstallmentDate,
                            PolicyInceptionDate = existingPolicy.PolicyInceptionDate,
                            PolicyStatus = existingPolicy.PolicyStatus,
                            InstallmentPremium = existingPolicy.InstallmentPremium
                        },
                        NewPolicyDetails = new BillingPolicyChangeDetail
                        {
                            PolicyId = newPolicy.PolicyId,
                            DecemberInstallmentDayOfMonth = newPolicy.DecemberInstallmentDayOfMonth,
                            FirstInstallmentDate = newPolicy.FirstInstallmentDate,
                            PolicyInceptionDate = newPolicy.PolicyInceptionDate,
                            PolicyStatus = newPolicy.PolicyStatus,
                            InstallmentPremium = newPolicy.InstallmentPremium,
                            /* When cancelling a policy, the premium already include the fees, so make them zero */
                            AdministrationPercentage = 0M,
                            BinderFeePercentage = 0M,
                            CommissionPercentage = 0M,
                            PremiumAdjustmentPercentage = 0M
                        },
                        RequestedByUsername = SystemSettings.SystemUserAccount,
                        IsGroupPolicy = false,
                        PolicyChangeMessageType = PolicyChangeMessageTypeEnum.MemberCountChange,
                        SourceModule = SourceModuleEnum.ClientCare,
                        AdjustmentAmount = basePremiumAmount
                    };

                    await _billingFuneralPolicyChangeService.ProcessBillingPolicyChanges(billingPolicyChangeMessage);
                }
            }
            catch (Exception ex)
            {
                ex.LogException();
                throw;
            }
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

        private async Task<bool> UpdateDocumentKeyValues(string oldKeyValue, string newKeyValue)
        {
            return await _documentIndexService.UpdateDocumentKeyValues(oldKeyValue, newKeyValue);
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public Task<string> ChangeTheNameWizard(string data, int wizardId, string currentWizardName)
        {
            return Task.FromResult(string.Empty);
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
    }
}

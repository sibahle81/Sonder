using RMA.Common.Enums;
using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.Policy
{
    public class RMARMLMaintainPolicyWizard : IWizardProcess
    {
        private readonly IPolicyService _policyService;
        private readonly IPolicyCommunicationService _policyCommunicationService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IDeclarationService _declarationService;

        public RMARMLMaintainPolicyWizard(
            IPolicyService policyService,
            IPolicyCommunicationService policyCommunicationService,
            IRolePlayerService rolePlayerService,
            IDocumentIndexService documentIndexService,
            IDeclarationService declarationService)
        {
            _policyService = policyService;
            _policyCommunicationService = policyCommunicationService;
            _rolePlayerService = rolePlayerService;
            _documentIndexService = documentIndexService;
            _declarationService = declarationService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            var policy = context?.Deserialize<Contracts.Entities.Policy.Policy>(context.Data);

            policy = await _policyService.GetPolicyWithProductOptionByPolicyId(policy.PolicyId);

            policy.PolicyOwner = await _rolePlayerService.GetRolePlayer(policy.PolicyOwnerId);
            policy.TargetedPolicyInceptionDate = policy.PolicyInceptionDate.Value;

            var rolePlayerPolicyDeclarations = await _declarationService.GetRolePlayerPolicyDeclarations(policy.PolicyId);
            policy.RolePlayerPolicyDeclarations = rolePlayerPolicyDeclarations.GroupBy(x => x.DeclarationYear, (key, g) => g.OrderByDescending(e => e.CreatedDate).First()).ToList();

            if (policy.RolePlayerPolicyDeclarations?.Count > 0)
            {
                foreach (var rolePlayerPolicyDeclaration in policy.RolePlayerPolicyDeclarations)
                {
                    rolePlayerPolicyDeclaration.RolePlayerPolicyTransactions = await _declarationService.GetRolePlayerPolicyTransactionsForCoverPeriod(policy.PolicyId, rolePlayerPolicyDeclaration.DeclarationYear);
                    rolePlayerPolicyDeclaration.OriginalTotalPremium = rolePlayerPolicyDeclaration.RolePlayerPolicyTransactions.Sum(rolePlayerPolicyTransaction => rolePlayerPolicyTransaction.TotalAmount);
                }
            }

            policy.Covers = await _policyService.GetPolicyCover(policy.PolicyId);

            var productOptionName = policy.ProductOption.Name;

            var label = $"Maintain {productOptionName} policy {policy.PolicyNumber} for ({policy.PolicyOwner.FinPayee.FinPayeNumber}) {policy.PolicyOwner.DisplayName}";
            var stepData = new ArrayList() { policy };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var policy = context.Deserialize<Contracts.Entities.Policy.Policy>(stepData[0].ToString());

            if (policy.TargetedPolicyInceptionDate < policy.PolicyInceptionDate)
            {
                var currentCoverIndex = policy.Covers.FindIndex(s => s.EffectiveTo == null);
                if (currentCoverIndex > -1)
                {
                    if (policy.Covers.Count > 1 && policy.Covers[currentCoverIndex - 1].EffectiveFrom.Date == policy.TargetedPolicyInceptionDate.Value.Date)
                    {
                        policy.Covers[currentCoverIndex].IsDeleted = true;
                        policy.Covers[currentCoverIndex - 1].EffectiveTo = null;
                        policy.PolicyInceptionDate = policy.Covers[currentCoverIndex - 1].EffectiveFrom;
                    }
                    else
                    {
                        policy.Covers[currentCoverIndex].EffectiveFrom = policy.TargetedPolicyInceptionDate.Value;
                        policy.PolicyInceptionDate = policy.TargetedPolicyInceptionDate.Value;
                    }
                }
            }
            else
            {
                policy.PolicyInceptionDate = policy.TargetedPolicyInceptionDate;
            }

            var originalPaymentFrequency = (await _policyService.GetPolicy(policy.PolicyId))?.PaymentFrequency;
            var policyPaymentFrequency = policy.PaymentFrequency;

            for (int i = 0; i < policy.RolePlayerPolicyDeclarations.Count; i++)
            {
                if (!policy.RolePlayerPolicyDeclarations[i].RequiresTransactionModification && policy.RolePlayerPolicyDeclarations[i].RolePlayerPolicyTransactions?.Count > 0)
                {
                    policy.RolePlayerPolicyDeclarations[i].RequiresTransactionModification = originalPaymentFrequency != policyPaymentFrequency && policy.RolePlayerPolicyDeclarations[i].RolePlayerPolicyTransactions.Any(s => s.RolePlayerPolicyTransactionStatus == RolePlayerPolicyTransactionStatusEnum.Unauthorised);
                }
            }

            await _declarationService.RaiseTransactions(policy);
            await _policyService.EditPolicy(policy, false);

            try
            {
                await SendCommunication(policy);
            }
            catch (Exception ex)
            {
                ex.LogException();
            }

            await _documentIndexService.UpdateDocumentKeys(DocumentSystemNameEnum.PolicyManager, "WizardId", wizard.Id.ToString(), "PolicyId", policy.PolicyId.ToString());
        }

        private async Task SendCommunication(Contracts.Entities.Policy.Policy policy)
        {
            try
            {
                policy.PolicyOwner = await _rolePlayerService.GetRolePlayer(policy.PolicyOwnerId);
                _ = Task.Run(() => _policyCommunicationService.SendMaintainRMAAssurancePolicySchedule(policy));
            }
            catch (Exception ex)
            {
                ex.LogException();
            }
        }

        #region Not Implemented

        public async Task CancelWizard(IWizardContext context)
        {
            return;
        }

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return;
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var ruleResults = new List<RuleResult>();
            return GetRuleRequestResult(true, ruleResults);
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

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return await Task.FromResult<string>(string.Empty);
        }

        public async Task UpdateStatus(IWizardContext context)
        {
            return;
        }

        public async Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return;
        }

        public async Task OnApprove(IWizardContext context)
        {
            return;
        }

        public async Task OnRequestForApproval(IWizardContext context)
        {
            return;
        }

        public async Task OnSaveStep(IWizardContext context)
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
        #endregion
    }
}

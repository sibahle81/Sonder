using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Database.Constants;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.ExpenseBasedPolicyWizard
{
    public class MaintainExpenseBasedPolicyWizard : IWizardProcess
    {
        private readonly IPolicyService _policyService;
        private readonly IPolicyCommunicationService _policyCommunicationService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IProductOptionService _productOptionService;
        private readonly IDeclarationService _declarationService;

        public MaintainExpenseBasedPolicyWizard(
            IPolicyService policyService,
            IPolicyCommunicationService policyCommunicationService,
            IRolePlayerService rolePlayerService,
            IProductOptionService productOptionService,
            IDeclarationService declarationService)
        {
            _policyService = policyService;
            _policyCommunicationService = policyCommunicationService;
            _rolePlayerService = rolePlayerService;
            _productOptionService = productOptionService;
            _declarationService = declarationService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            var policy = context?.Deserialize<Contracts.Entities.Policy.Policy>(context.Data);

            policy.PolicyOwner = await _rolePlayerService.GetPolicyOwnerByPolicyId(policy.PolicyId);
            var productOptionName = (await _productOptionService.GetProductOption(policy.ProductOptionId)).Name;

            var label = $"Update {productOptionName} Policy: {policy.PolicyOwner.DisplayName}";
            var stepData = new ArrayList() { policy };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var policy = context.Deserialize<Contracts.Entities.Policy.Policy>(stepData[0].ToString());

            var currentDeclaration = policy.PolicyOwner.Declarations.FindLast(s => s.DeclarationStatus == DeclarationStatusEnum.Current && s.ProductOptionId == policy.ProductOptionId);

            policy.AnnualPremium = Convert.ToDecimal(currentDeclaration.Premium);

            var multiplier = CommonConstants.AnnuallyMultiplier;

            switch (policy.PaymentFrequency)
            {
                case PaymentFrequencyEnum.Monthly:
                    multiplier = CommonConstants.MonthlyMultiplier;
                    break;
                case PaymentFrequencyEnum.Quarterly:
                    multiplier = CommonConstants.QuarterlyMultiplier;
                    break;
                case PaymentFrequencyEnum.BiAnnually:
                    multiplier = CommonConstants.BiAnnuallyMultiplier;
                    break;
            }

            policy.InstallmentPremium = policy.AnnualPremium / multiplier;

            await _policyService.EditPolicy(policy, false);

            var declarations = await ApplyDeclarationBillingIntegration(policy.PolicyOwner.Declarations);
            await _declarationService.ManageDeclarations(declarations);

            var productOptionIds = new List<int>();
            foreach (var declaration in policy.PolicyOwner.Declarations)
            {
                if (declaration.DependentDeclarations != null && declaration.DependentDeclarations.Count > 0)
                {
                    foreach (var dependentDeclaration in declaration.DependentDeclarations)
                    {
                        if (!productOptionIds.Contains(Convert.ToInt32(dependentDeclaration.ProductOptionId)))
                        {
                            productOptionIds.Add(Convert.ToInt32(dependentDeclaration.ProductOptionId));
                        }
                    }

                    var dependentDeclarations = await ApplyDeclarationBillingIntegration(declaration.DependentDeclarations);
                    await _declarationService.ManageDeclarations(dependentDeclarations);
                }
            }

            var policies = await _policyService.GetPoliciesByPolicyOwner(policy.PolicyOwnerId);
            var dependentPolicies = policies.FindAll(s => productOptionIds.Contains(s.ProductOptionId));

            if (dependentPolicies != null)
            {
                foreach (var dependentPolicy in dependentPolicies)
                {
                    var currentDependentDeclaration = currentDeclaration.DependentDeclarations.FindLast(s => s.ProductOptionId == dependentPolicy.ProductOptionId && s.DeclarationStatus == DeclarationStatusEnum.Current);

                    dependentPolicy.AnnualPremium = Convert.ToDecimal(currentDependentDeclaration.Premium);
                    dependentPolicy.InstallmentPremium = dependentPolicy.AnnualPremium / multiplier;
                    dependentPolicy.PolicyInceptionDate = policy.PolicyInceptionDate;
                    await _policyService.EditPolicy(dependentPolicy, false);
                }
            }

            try
            {
                policy.PolicyOwner = await _rolePlayerService.GetRolePlayer(policy.PolicyOwnerId);
                _ = Task.Run(() => _policyCommunicationService.SendModifiedCOIDPolicySchedule(policy, wizard.Id));
            }
            catch (Exception ex)
            {
                ex.LogException();
            }
        }

        private async Task<List<Declaration>> ApplyDeclarationBillingIntegration(List<Declaration> declarations)
        {
            foreach (var declaration in declarations)
            {
                var declarationBillingIntegration = new DeclarationBillingIntegration();
                declarationBillingIntegration.DeclarationBillingIntegrationStatus = DeclarationBillingIntegrationStatusEnum.Pending;

                declarationBillingIntegration.DeclarationBillingIntegrationType = declaration.Adjustment > 0 ? DeclarationBillingIntegrationTypeEnum.Adjustment : DeclarationBillingIntegrationTypeEnum.Invoice;
                declarationBillingIntegration.Amount = declaration.Adjustment > 0 ? Convert.ToDecimal(declaration.Adjustment) : Convert.ToDecimal(declaration.Premium);

                if (declaration.DeclarationBillingIntegrations == null) { declaration.DeclarationBillingIntegrations = new List<DeclarationBillingIntegration>(); }
                declaration.DeclarationBillingIntegrations.Add(declarationBillingIntegration);
            }
            return declarations;
        }

        #region Not Implemented
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

        public async Task CancelWizard(IWizardContext context)
        {
            return;
        }

        public async Task UpdateStatus(IWizardContext context)
        {
            return;
        }

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
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

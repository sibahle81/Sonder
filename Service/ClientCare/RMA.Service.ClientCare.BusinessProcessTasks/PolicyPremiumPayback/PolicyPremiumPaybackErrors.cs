using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.PolicyPremiumPayback
{
    public class PolicyPremiumPaybackErrors : IWizardProcess
    {

        private readonly ILifeExtensionService _lifeExtensionService;

        public PolicyPremiumPaybackErrors(
            ILifeExtensionService lifeExtensionService
        )
        {
            _lifeExtensionService = lifeExtensionService;
        }

        public Task<int> StartWizard(IWizardContext context)
        {
            // Wizard created from scheduled task
            return Task.FromResult(-999);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var @case = context.Deserialize<PremiumPaybackCase>(stepData[0].ToString());

            // Create another payment approval wizard for the policies where the bank
            // account details have now been updated and verified
            await _lifeExtensionService.GeneratePolicyPremiumPaybackTask(@case);

            // Find the items that have not been verified yet
            var unverifiedBankAccounts = new List<PremiumPaybackItem>();
            foreach (var payback in @case.PaybackItems)
            {
                if (payback.PremiumPaybackStatus != PremiumPaybackStatusEnum.BankAccountVerified)
                {
                    unverifiedBankAccounts.Add(payback);
                }
            }

            // Create a new wizard with the still unverified bank accounts
            if (unverifiedBankAccounts.Count > 0)
            {
                var paybackItems = context.Serialize<List<PremiumPaybackItem>>(unverifiedBankAccounts);
                await _lifeExtensionService.GeneratePolicyPremiumPaybackErrorTask(paybackItems);
            }
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var @case = context.Deserialize<PremiumPaybackCase>(stepData[0].ToString());

            var errorList = new List<string>();

            var complete = @case.PaybackItems.Where(s => s.PremiumPaybackStatus == PremiumPaybackStatusEnum.BankAccountVerified).ToList();

            if (complete.Count == 0)
            {
                var incomplete = @case.PaybackItems.Where(s => s.PremiumPaybackStatus != PremiumPaybackStatusEnum.BankAccountVerified).ToList();
                errorList.Add($"0 of {incomplete.Count} bank account details have been verified");
            }

            var result = new RuleRequestResult
            {
                RequestId = new Guid(),
                OverallSuccess = errorList.Count == 0,
                RuleResults = new List<RuleResult> { GetRuleResults(errorList) }
            };
            return await Task.FromResult<RuleRequestResult>(result);
        }

        private RuleResult GetRuleResults(List<string> errorList)
        {
            if (errorList.Count == 0) { return new RuleResult(); }
            var result = new RuleResult
            {
                RuleName = "Invalid Payback Records",
                Passed = false,
                MessageList = errorList
            };
            return result;
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return Task.FromResult(string.Empty);
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

        public Task OverrideWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}

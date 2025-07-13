using DocumentFormat.OpenXml;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.PolicyPremiumPayback
{
    public class PolicyPremiumPayback : IWizardProcess
    {

        private readonly ILifeExtensionService _lifeExtensionService;

        public PolicyPremiumPayback(
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

            await _lifeExtensionService.SetupApprovedPremiumPayments(@case);
            await _lifeExtensionService.SendPremiumPaybackAmount();
            await _lifeExtensionService.SendPremiumPaybackNotifications();
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var @case = context.Deserialize<PremiumPaybackCase>(stepData[0].ToString());

            var errorList = new List<string>();
            var payBackItems = @case.PaybackItems
                .Where(s => s.PremiumPaybackStatus == PremiumPaybackStatusEnum.BankAccountVerified)
                .ToList();
            if (payBackItems.Count == 0)
            {
                errorList.Add("The wizard does not contain any policies ready for payment");
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

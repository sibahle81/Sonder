using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.BusinessProcessTasks.TermsArrangementsMissedPayments
{
    public class TermsArrangementsMissedPaymentsWizard : IWizardProcess
    {
        private readonly ITermsArrangementService _termsArrangementService;

        public TermsArrangementsMissedPaymentsWizard(ITermsArrangementService termsArrangementService)
        {
            _termsArrangementService = termsArrangementService;
        }
        public async Task<int> StartWizard(IWizardContext context)
        {
            var termArrangementSchedule = context.Deserialize<TermArrangementSchedule>(context.Data);

            var notification = new Admin.BusinessProcessManager.Contracts.Entities.Notification()
            {
                Title = $"Debtor:{termArrangementSchedule.MemberNumber}",
                Message = termArrangementSchedule.NotificationMessage,
                ActionLink = null,
                HasBeenReadAndUnderstood = false
            };

            var label = $"{notification.Title}";
            var stepData = new ArrayList() { notification };
            var wizardId = await context.CreateWizard(label, stepData);
            return await Task.FromResult(wizardId);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            try
            {
                _ = Task.Run(() => _termsArrangementService.SendMissedPaymentEmailNotification(context.LinkedItemId));
            }
            catch (Exception)
            {
                throw;
            }

            return;
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var ruleResults = new List<RuleResult>();
            return await GetRuleRequestResult(true, ruleResults);
        }


        public Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        private async Task<RuleRequestResult> GetRuleRequestResult(bool success, List<RuleResult> results)
        {
            return await Task.FromResult(new RuleRequestResult
            {
                RequestId = Guid.NewGuid(),
                RuleResults = results,
                OverallSuccess = success
            });
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return await Task.FromResult<string>(string.Empty);
        }

        public async Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return await Task.FromResult<int?>(null);
        }

        public Task OnApprove(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
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

        public Task OverrideWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}

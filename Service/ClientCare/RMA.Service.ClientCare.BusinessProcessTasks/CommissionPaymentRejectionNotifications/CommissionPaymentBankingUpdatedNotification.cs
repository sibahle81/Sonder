using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.RulesManager.Contracts.Entities;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.CommissionPaymentRejectionNotifications
{
    public class CommissionPaymentBankingUpdatedNotificationTask : IWizardProcess
    {
        public async Task<int> StartWizard(IWizardContext context)
        {
            var notification = context?.Deserialize<Notification>(context.Data);
            var label = $"{notification.Title}";
            var stepData = new ArrayList() { notification };
            var wizardId = await context.CreateWizard(label, stepData);
            return await Task.FromResult(wizardId);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            return;
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            return new RuleRequestResult
            {
                OverallSuccess = true,
                RuleResults = new List<RuleResult>(),
                RequestId = Guid.NewGuid()
            };
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return await Task.FromResult(string.Empty);
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
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
    }
}
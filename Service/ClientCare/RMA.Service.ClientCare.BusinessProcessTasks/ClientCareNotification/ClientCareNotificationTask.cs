using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.RulesManager.Contracts.Entities;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.ClientCareNotification
{
    public class ClientCareNotificationTask : IWizardProcess
    {
        public async Task<int> StartWizard(IWizardContext context)
        {
            var notification = context?.Deserialize<Notification>(context.Data);
            if (notification == null) return await Task.FromResult(0);
            var label = $"Notification: {notification.Title}";
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

        public Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var notification = context.Deserialize<Admin.BusinessProcessManager.Contracts.Entities.Notification>(stepData[0].ToString());
            var passed = notification.HasBeenReadAndUnderstood;
            var result = new RuleResult();
            if (!passed)
            {
                result.RuleName = "User has read and understood";
                result.MessageList = new List<string> { "Please mark this notification as read and understood before it can be closed" };
                result.Passed = false;
            }
            var ruleRequestResult = new RuleRequestResult
            {
                RequestId = Guid.NewGuid(),
                OverallSuccess = passed,
                RuleResults = new List<RuleResult> { result }
            };
            return Task.FromResult(ruleRequestResult);
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return await Task.FromResult(string.Empty);
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
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

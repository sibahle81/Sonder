using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.BusinessProcessTasks.Notification
{
    public class NotificationTask : IWizardProcess
    {
        public async Task<int> StartWizard(IWizardContext context)
        {
            var notification = context.Deserialize<Admin.BusinessProcessManager.Contracts.Entities.Notification>(context.Data);
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

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
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

            return new RuleRequestResult
            {
                RequestId = Guid.NewGuid(),
                OverallSuccess = passed,
                RuleResults = new List<RuleResult> { result }
            };
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return await Task.FromResult<string>(string.Empty);
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            throw new NotImplementedException();
        }
    }
}

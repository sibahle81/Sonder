using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.BusinessProcessTasks.CollectionRejectionNotifications
{
    public class CollectionRejectedNotificationTask : IWizardProcess
    {
        private readonly IWizardService _wizardService;
        private readonly IConfigurationService _configService;


        public CollectionRejectedNotificationTask(IWizardService wizardService, IConfigurationService configService)
        {
            _wizardService = wizardService;
            _configService = configService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            var notification = context?.Deserialize<Admin.BusinessProcessManager.Contracts.Entities.Notification>(context.Data);
            var label = $"{notification.Title}";
            var stepData = new ArrayList() { notification };
            var wizardId = await context.CreateWizard(label, stepData);
            return await Task.FromResult(wizardId);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            await SendNotificationOnCompletion(context);
            return;
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            return await Task.FromResult(new RuleRequestResult
            {
                OverallSuccess = true,
                RuleResults = new List<RuleResult>(),
                RequestId = Guid.NewGuid()
            });
        }

        private async Task SendNotificationOnCompletion(IWizardContext context)
        {
            try
            {
                var wizard = context?.Deserialize<Wizard>(context.Data);
                var stepData = context?.Deserialize<ArrayList>(wizard.Data);
                var notification = context?.Deserialize<Admin.BusinessProcessManager.Contracts.Entities.Notification>(stepData[0].ToString());

                var setting = await _configService.GetModuleSetting("UserNamesToReceiveCollectionRejectionNotifications");
                foreach (var userName in setting.Split('|'))
                {
                    var index = notification.Title.IndexOf(':');
                    var accountHolder = notification.Title.Substring(index);
                    await _wizardService.SendWizardNotification("collection-banking-updated-notification", $"Task successfully actioned: Banking details updated ({accountHolder})", "Please re-process the rejected collection", "fincare/billing-manager/collections-pool", -1, userName);
                }
            }
            catch (Exception e)
            {
                var errorMessage = e.Message; // Errors must not break process
            }
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
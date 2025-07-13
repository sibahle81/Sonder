using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.CommissionPaymentRejectionNotifications
{
    public class CommissionPaymentRejectedNotificationTask : IWizardProcess
    {
        private readonly IWizardService _wizardService;
        private readonly IConfigurationService _configService;


        public CommissionPaymentRejectedNotificationTask(IWizardService wizardService, IConfigurationService configService)
        {
            _wizardService = wizardService;
            _configService = configService;
        }

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
            if (context != null)
            {
                await SendNotificationOnCompletion(context);
                return;
            }
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

        private async Task SendNotificationOnCompletion(IWizardContext context)
        {
            try
            {
                var wizard = context.Deserialize<Wizard>(context.Data);
                var stepData = context.Deserialize<ArrayList>(wizard.Data);
                var notification = context.Deserialize<Notification>(stepData[0].ToString());

                var setting = await _configService.GetModuleSetting("UserNamesToReceiveCommissionRejectionNotifications");
                foreach (var userName in setting.Split('|'))
                {
                    var index = notification.Title.IndexOf(':');
                    var clientName = notification.Title.Substring(index);
                    await _wizardService.SendWizardNotification("commission-payment-banking-updated-notification", $"Task successfully actioned: Banking details updated ({clientName})", "Please re-process the rejected commission payment", "fincare/payment-manager/commission-release", -1, userName);
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
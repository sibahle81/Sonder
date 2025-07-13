using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.GroupRiskOnboarding
{
    public class GroupRiskOnboarding : IWizardProcess
    {
        private readonly IGroupRiskService _groupRiskService;

        public GroupRiskOnboarding(
            IGroupRiskService groupRiskService
        )
        {
            _groupRiskService = groupRiskService;
        }

        public Task<int> StartWizard(IWizardContext context)
        {
            return Task.FromResult(-999);
        }

        public Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var wizard = context.Deserialize<Wizard>(context.Data);
            var listing = GetWizardData(context, wizard.Data);
            _ = Task.Run(() => _groupRiskService.ImportGroupRiskPolicies(listing.FileIdentifier));
            return Task.CompletedTask;
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            Contract.Requires(context != null);
            var wizard = context.Deserialize<Wizard>(context.Data);
            var listing = GetWizardData(context, wizard.Data);

            if (wizard.WizardStatus == WizardStatusEnum.InProgress)
            {
                var ruleResult = await _groupRiskService.GetGroupRiskImportErrors(listing.FileIdentifier);
                return ruleResult;
            }
            else
            {
                var result = new RuleRequestResult()
                {
                    OverallSuccess = true,
                    RequestId = Guid.NewGuid(),
                    RuleResults = new List<RuleResult>()
                };
                return result;
            }
        }

        private ConsolidatedFuneralRequest GetWizardData(IWizardContext context, string json)
        {
            var stepData = context.Deserialize<List<ConsolidatedFuneralRequest>>(json);
            return stepData[0];
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

using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
namespace RMA.Service.ClientCare.BusinessProcessTasks.Agents
{
    public class ManageAgentWizard : IWizardProcess
    {
        private readonly IRepresentativeService _representativeService;

        public ManageAgentWizard(IRepresentativeService representativeService)
        {
            _representativeService = representativeService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Representative representative= new Representative();
            if (context != null)
            {
                representative = await _representativeService.GetRepresentative(context.LinkedItemId);
            }

            var label = $"Edit Representative: {representative.Code}";
            var stepData = new ArrayList { representative };

            return await context?.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context?.Deserialize<ArrayList>(wizard.Data);
            var representative = context.Deserialize<Representative>(stepData[0].ToString());

            await _representativeService.EditRepresentative(representative);
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var result = new RuleRequestResult()
            {
                OverallSuccess = true,
                RequestId = Guid.NewGuid(),
                RuleResults = new List<RuleResult>()
            };
            return Task.FromResult(result);
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public Task<bool> ChangeTheName(string data)
        {
            throw new NotImplementedException();
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return string.Empty;
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

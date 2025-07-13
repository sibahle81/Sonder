using CommonServiceLocator;

using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.CancelPolicy
{
    public class CancelPolicy : IWizardProcess
    {
        private readonly StartWizard _startWizard;
        private readonly SubmitWizard _submitWizard;

        public CancelPolicy()
        {
            _startWizard = ServiceLocator.Current.GetInstance<StartWizard>();
            _submitWizard = ServiceLocator.Current.GetInstance<SubmitWizard>();
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            var wizardId = await _startWizard.Process(context);
            return wizardId;
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            await _submitWizard.Process(context);
        }

        public Task CancelWizard(IWizardContext context)
        {
            throw new NotImplementedException();
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var policy = context.Deserialize<Contracts.Entities.Policy.Policy>(stepData[0].ToString());

            if (policy.PolicyStatus == PolicyStatusEnum.Cancelled)
            {
                return await Task.FromResult(new RuleRequestResult
                {
                    RequestId = Guid.NewGuid(),
                    OverallSuccess = false,
                    RuleResults = new List<RuleResult>
                    {
                        new RuleResult
                        {
                            Passed = false,
                            RuleName = "Policy Status",
                            MessageList = new List<string> {"The policy has already been cancelled"}
                        }
                    }
                });
            }

            return new RuleRequestResult()
            {
                OverallSuccess = true,
                RequestId = Guid.NewGuid(),
                RuleResults = new List<RuleResult>()
            };
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
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

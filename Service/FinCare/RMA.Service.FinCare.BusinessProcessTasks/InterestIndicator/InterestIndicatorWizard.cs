using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.BusinessProcessTasks.InterestIndicator
{
    public class InterestIndicatorWizard : IWizardProcess
    {
        private readonly IBillingService _billingService;
        private readonly IRolePlayerService _rolePlayerService;

        public InterestIndicatorWizard(IBillingService billingService, IRolePlayerService rolePlayerService)
        {
            _billingService = billingService;
            _rolePlayerService = rolePlayerService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context != null)
            {
                var interestIndicator = context.Deserialize<RMA.Service.Billing.Contracts.Entities.InterestIndicator>(context.Data);

                var rolePlayer = await _rolePlayerService.GetRolePlayer(interestIndicator.RolePlayerId);
                var label = $"Interest indicator for {rolePlayer?.DisplayName}";

                var stepData = new ArrayList() { interestIndicator };
                return await context.CreateWizard(label, stepData);
            }

            return await Task.FromResult(0);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            if (context != null)
            {
                var wizard = context.Deserialize<Wizard>(context.Data);
                var stepData = context.Deserialize<ArrayList>(wizard.Data);
                var interestIndicator = context.Deserialize<RMA.Service.Billing.Contracts.Entities.InterestIndicator>(stepData[0]?.ToString());

                var rolePlayer = await _rolePlayerService.GetRolePlayer(interestIndicator.RolePlayerId);
                var text = $"Interest indicator for {rolePlayer?.DisplayName}";

                var note = new BillingNote
                {
                    ItemId = interestIndicator.RolePlayerId,
                    ItemType = BillingNoteTypeEnum.InterestIndicatorNote.GetDescription().SplitCamelCaseText(),
                    Text = text
                };

                await _billingService.AddBillingInterestIndicator(interestIndicator);
                await _billingService.AddBillingNote(note);
            }
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var result = new RuleRequestResult()
            {
                OverallSuccess = true,
                RequestId = Guid.NewGuid(),
                RuleResults = new List<RuleResult>()
            };

            return await Task.FromResult(result);
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        private Task<int> AddWizard(IWizardContext context, Billing.Contracts.Entities.InterestIndicator interestIndicator)
        {
            //Code smell. Steps not needed by the wizard should not require an implementation.
            return Task.FromResult<int>(0);
        }

        public Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            //Code smell. Steps not needed by the wizard should not require an implementation.
            return Task.FromResult(string.Empty);
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
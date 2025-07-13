using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.BusinessProcessTasks.BadDebtWriteOff
{
    public class BadDebtWriteOffWizard : IWizardProcess
    {
        private readonly ITransactionService _transactionService;

        public BadDebtWriteOffWizard(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            var debtorDebtWriteOff = context?.Deserialize<DebtorDebtWriteOff>(context.Data);

            string label = $"Debt Write-Off {debtorDebtWriteOff?.FinpayeNumber}";
            var stepData = new ArrayList() { debtorDebtWriteOff };
            return await context?.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context?.Deserialize<Wizard>(context.Data);
            try
            {
                var stepData = context?.Deserialize<ArrayList>(wizard.Data);
                var debtorDebtWriteOff = context?.Deserialize<DebtorDebtWriteOff>(stepData[0].ToString());

                await _transactionService.WriteOffBadDebt(debtorDebtWriteOff.BadDebtWriteOffRequest);
            }
            catch (Exception ex)
            {
                ex.LogException($"Error occured submitting wizard :{wizard?.Id}");
            }
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

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        #region Unused interfaces for this wizard
        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return await Task.FromResult<string>(string.Empty);
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
        #endregion
    }
}
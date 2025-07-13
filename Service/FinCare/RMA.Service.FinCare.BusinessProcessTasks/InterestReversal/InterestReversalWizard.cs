using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.BusinessProcessTasks.InterestReversal
{
    public class InterestReversalWizard : IWizardProcess
    {
        private readonly ITransactionService _transactionService;
        private readonly IBillingService _billingService;

        public InterestReversalWizard(ITransactionService transactionService, IBillingService billingService)
        {
            _transactionService = transactionService;
            _billingService = billingService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            var interestReversal = context?.Deserialize<Billing.Contracts.Entities.InterestReversal>(context.Data);

            string label = $"Interest Reversal {interestReversal?.FinPayeeNumber}";
            var stepData = new ArrayList() { interestReversal };
            return await context?.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context?.Deserialize<Wizard>(context.Data);
            try
            {
                var stepData = context?.Deserialize<ArrayList>(wizard.Data);
                var interestReversals = context?.Deserialize<Billing.Contracts.Entities.InterestReversal>(stepData[0].ToString());

                var openPeriodTransactions = interestReversals?.Transactions.Where(t => t.Period.IndexOf("current", StringComparison.OrdinalIgnoreCase) >= 0
                || t.Period.IndexOf("future", StringComparison.OrdinalIgnoreCase) >= 0).ToList();

                var closedPeriodTransactions = interestReversals?.Transactions.Where(t => t.Period.IndexOf("history", StringComparison.OrdinalIgnoreCase) >= 0)
                    .ToList();

                if (openPeriodTransactions.Count > 0)
                {
                    foreach (var item in openPeriodTransactions)
                    {
                        await _transactionService.ReverseInterestInOpenPeriod(item, interestReversals.RolePlayerId, interestReversals.Note.Text);

                        var text = string.Empty;
                        text = (!string.IsNullOrEmpty(interestReversals.Note.Text)) ? $"Interest to amount of {item.Amount} reversed with comment: {interestReversals.Note.Text}" : "Interest to amount of {item.Amount} reversed";

                        var note = new BillingNote
                        {
                            ItemId = interestReversals.RolePlayerId,
                            ItemType = BillingNoteTypeEnum.InterestReversal.GetDescription(),
                            Text = text
                        };
                        await _billingService.AddBillingNote(note);
                    }
                }

                if (closedPeriodTransactions.Count > 0)
                {
                    foreach (var item in closedPeriodTransactions)
                    {
                        await _transactionService.ReverseInterestInClosedPeriod(item, interestReversals.RolePlayerId, interestReversals.Note.Text);
                        var text = string.Empty;
                        text = (!string.IsNullOrEmpty(interestReversals.Note.Text)) ? $"Interest to amount of {item.Amount} reversed with comment: {interestReversals.Note.Text}" : "Interest to amount of {item.Amount} reversed";

                        var note = new BillingNote
                        {
                            ItemId = interestReversals.RolePlayerId,
                            ItemType = BillingNoteTypeEnum.InterestReversal.GetDescription(),
                            Text = text
                        };
                        await _billingService.AddBillingNote(note);
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error occured submitting wizard :{wizard?.Id}");
            }
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
        #endregion
    }
}

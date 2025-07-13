using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.BusinessProcessTasks.CreditNoteReversal
{
    public class CreditNoteReversalWizard : IWizardProcess
    {
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IPaymentAllocationService _paymentAllocationService;
        private readonly IBillingService _billingService;

        public CreditNoteReversalWizard(IPaymentAllocationService paymentAllocationService, IDocumentIndexService documentIndexService, IBillingService billingService)
        {
            _paymentAllocationService = paymentAllocationService;
            _documentIndexService = documentIndexService;
            _billingService = billingService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));
            var creditNoteReversal = context.Deserialize<CreditNoteReversals>(context.Data);
            string label = $"Credit Note Reversal {creditNoteReversal.DebtorAccount.FinPayeNumber}";
            var stepData = new ArrayList() { creditNoteReversal };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var creditNoteReversals = context.Deserialize<CreditNoteReversals>(stepData[0].ToString());
            await _paymentAllocationService.AllocateDebitNotes(creditNoteReversals);
            try
            {
                foreach (var reversalNote in creditNoteReversals.Notes)
                {
                    var note = new BillingNote
                    {
                        ItemId = creditNoteReversals.DebtorAccount.RolePlayerId,
                        ItemType = "Debit Note",
                        Text = reversalNote.Text
                    };
                    await _billingService.AddBillingNote(note);
                }

                await _documentIndexService.UpdateDocumentKeyValues(creditNoteReversals.RequestCode, creditNoteReversals.DebtorAccount.FinPayeNumber);
            }
            catch (Exception ex)
            {
                ex.LogException();
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

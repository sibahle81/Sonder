using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.BusinessProcessTasks.CreditNoteDebitReversal
{
    public class CreditNoteDebitReversalWizard : IWizardProcess
    {
        private readonly IPaymentAllocationService _paymentAllocationService;
        private readonly IBillingService _billingService;

        public CreditNoteDebitReversalWizard(IBillingService billingService, IPaymentAllocationService paymentAllocationService)
        {
            _paymentAllocationService = paymentAllocationService;
            _billingService = billingService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            var data = context.Data;
            var finPayeNumber = data.Substring(data.IndexOf(":") + 1).Replace("\"", "").Replace("}", "");

            var result = await _billingService.GetFinPayeeAccountByFinPayeeNumber(finPayeNumber);

            var creditNoteAccount = new CreditNoteAccount
            {
                AuthorisedBy = result.AuthroisedBy,
                AuthorisedDate = result.AuthorisedDate,
                FinPayeeNumber = result.FinPayeNumber,
                IsAuthorised = result.IsAuthorised,
                RolePlayerId = result.RolePlayerId,
                Transactions = new List<Transaction>(),
                Note = new Common.Entities.Note()
            };

            string label = $"Credit Account {creditNoteAccount.FinPayeeNumber}";
            var stepData = new ArrayList() { creditNoteAccount };
            var wizardId = await context.CreateWizard(label, stepData);
            return await Task.FromResult(wizardId);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var creditNoteAccount = context.Deserialize<CreditNoteAccount>(stepData[0].ToString());
            await _paymentAllocationService.AllocateCreditNotes(creditNoteAccount);
            try
            {
                var note = new BillingNote
                {
                    ItemId = creditNoteAccount.RolePlayerId,
                    ItemType = "Credit Note",
                    Text = creditNoteAccount.Note.Text
                };
                await _billingService.AddBillingNote(note);
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
    }
}

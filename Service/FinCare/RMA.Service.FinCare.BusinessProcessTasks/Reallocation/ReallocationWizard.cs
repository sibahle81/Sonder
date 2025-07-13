using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.BusinessProcessTasks.Reallocation
{
    public class ReallocationWizard : IWizardProcess
    {
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IPaymentAllocationService _paymentAllocationService;
        private readonly IBillingService _billingService;
        private const string suspenseName = "Suspense";
        private const string reallocationItemType = "Reallocation";
        public ReallocationWizard(
            IDocumentIndexService documentIndexService,
            IPaymentAllocationService paymentAllocationService,
            IBillingService billingService)
        {
            _documentIndexService = documentIndexService;
            _paymentAllocationService = paymentAllocationService;
            _billingService = billingService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            var transactionTransfer = context.Deserialize<TransactionTransfer>(context.Data);

            string label = $"Reallocation {transactionTransfer.FromDebtorAccount.FinPayeNumber}";
            var stepData = new ArrayList() { transactionTransfer };
            return await context.CreateWizard(label, stepData);

        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var transactionTransfer = context.Deserialize<TransactionTransfer>(stepData[0].ToString());

            var creditNoteReversal = new CreditNoteReversals
            {
                Transactions = transactionTransfer.Transactions,
                RolePlayerId = transactionTransfer.FromDebtorAccount.RolePlayerId,
                FinPayeeNumber = transactionTransfer.FromDebtorAccount.FinPayeNumber,
                DebtorAccount = transactionTransfer.FromDebtorAccount,
                IsPaymentReAllocation = transactionTransfer.Transactions[0].TransactionType == TransactionTypeEnum.Payment,
                IsCreditNoteReAllocation = transactionTransfer.Transactions[0].TransactionType == TransactionTypeEnum.CreditNote,
                ReAllocationReceiverFinPayeeNumber = transactionTransfer.ToDebtorAccount.FinPayeNumber
            };
            if (transactionTransfer.InvoiceAllocations != null)
                creditNoteReversal.InvoiceAllocations = transactionTransfer.InvoiceAllocations;

            foreach (var tran in creditNoteReversal.Transactions)
                tran.InvoiceId = null;

            try
            {
                if (transactionTransfer.ToDebtorAccount.RolePlayerId > 0)
                {
                    creditNoteReversal.ReAllocationReceiverFinPayeeNumber = transactionTransfer.ToDebtorAccount.FinPayeNumber;

                    var creditNoteAccount = new CreditNoteAccount
                    {
                        Transactions = transactionTransfer.Transactions,
                        RolePlayerId = transactionTransfer.ToDebtorAccount.RolePlayerId,
                        FinPayeeNumber = transactionTransfer.ToDebtorAccount.FinPayeNumber,
                        IsPaymentReAllocation = transactionTransfer.Transactions[0].TransactionType == TransactionTypeEnum.Payment,
                        IsCreditNoteReAllocation = transactionTransfer.Transactions[0].TransactionType == TransactionTypeEnum.CreditNote,
                        ReAllocationOriginalFinPayeeNumber = transactionTransfer.FromDebtorAccount.FinPayeNumber
                    };

                    foreach (var tran in creditNoteAccount.Transactions)
                        tran.InvoiceId = null;

                    await _paymentAllocationService.DoReallocation(creditNoteReversal, creditNoteAccount);

                    var noteForSponsor = new BillingNote
                    {
                        ItemId = creditNoteReversal.RolePlayerId,
                        ItemType = reallocationItemType,
                        Text = transactionTransfer.Reason
                    };
                    await _billingService.AddBillingNote(noteForSponsor);

                    var noteForReceiver = new BillingNote
                    {
                        ItemId = creditNoteAccount.RolePlayerId,
                        ItemType = reallocationItemType,
                        Text = transactionTransfer.Reason
                    };
                    await _billingService.AddBillingNote(noteForReceiver);
                }
                else //no ToDebtor   //put back in suspense account
                {
                    creditNoteReversal.ReAllocationReceiverFinPayeeNumber = $"{suspenseName} : {transactionTransfer.FromDebtorAccount.FinPayeNumber}";
                    await _paymentAllocationService.DoDebitReallocation(creditNoteReversal);
                    foreach (var transaction in creditNoteReversal.Transactions)
                    {
                        if (transaction.BankStatementEntryId.HasValue)
                            _ = await _paymentAllocationService.AddPaymentToUnallocatedPaymentUsingBankstatementEntry(transaction.BankStatementEntryId.Value, transaction.ReallocatedAmount, transactionTransfer.FromDebtorAccount.RolePlayerId);
                    }
                }

                await _documentIndexService.UpdateDocumentKeyValues(transactionTransfer.RequestCode, transactionTransfer.FromDebtorAccount.FinPayeNumber);
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

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var transactionTransfer = context.Deserialize<TransactionTransfer>(stepData[0].ToString());

            if (!string.IsNullOrEmpty(transactionTransfer.FromDebtorAccount.FinPayeNumber))
            {
                var debtorAccount = await _billingService.GetFinPayeeAccountByFinPayeeNumber(transactionTransfer.FromDebtorAccount.FinPayeNumber);
                var note = new BillingNote
                {
                    ItemId = debtorAccount.RolePlayerId,
                    ItemType = "Reallocation Rejected",
                    Text = wizard.Name + ' ' + rejectWizardRequest.Comment
                };
                await _billingService.AddBillingNote(note);
            }
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

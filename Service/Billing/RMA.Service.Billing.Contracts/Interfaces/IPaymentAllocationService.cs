using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities.Payments;
using RMA.Service.Billing.Contracts.Entities.PolicyPaymentAllocation;
using RMA.Service.Billing.Database.Entities;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using FinPayee = RMA.Service.ClientCare.Contracts.Entities.RolePlayer.FinPayee;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface IPaymentAllocationService : IService
    {
        Task<UnallocatedBankImportPayment> GetUnallocatedPayment(int unallocatedPaymentId);
        Task<List<UnallocatedBankImport>> GetUnAllocatedPayments();
        Task<List<UnallocatedBankImport>> SearchUnAllocatedPayments(string query);
        Task AddUnallocatedPayments(List<finance_BankStatementEntry> statementEntries);
        Task<List<Transaction>> GetPaymentTransactionsAllocatedToDebtorAccount(int rolePlayerId);
        Task<Transaction> GetTransaction(int transactionId);
        Task<bool> UnallocateReversal(Transaction transaction);
        Task<Transaction> GetTransactionAllocatedToDebtorAccount(int transactionId);
        Task<bool> AllocatePaymentsToInvoices(List<ManualPaymentAllocation> manualPaymentAllocations);
        Task<bool> AllocatePaymentsToDebtor(List<ManualPaymentAllocation> manualPaymentAllocations);
        Task AllocateCreditNotes(CreditNoteAccount creditNoteAccount);
        Task AllocateDebitNotes(CreditNoteReversals creditNoteReversals);
        Task AllocateCreditTransaction(Transaction creditTransaction, int rolePlayerId, decimal amountToAllocate, int? invoiceId, int? claimRecoveryInvoiceId, List<int> policyIds);
        Task<int> AllocateDebitTransaction(Transaction debitTtransaction, int rolePlayerId, decimal amountToAllocate, int? linkedTransactionId);
        Task<string> AllocateInterDebtorTransaction(InterDebtorTransfer interDebtorTransfer, FinPayee fromDebtor);
        Task PerformCommissionClawbacks(List<Invoice> invoices);
        Task<DateTime> DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum periodStatus);
        Task<decimal> GetDebtorOutstandingTotalBalance(int rolePlayerId);
        Task<bool> DoesDebtorHaveOutstandingInvoices(int rolePlayerId);
        Task DoReallocation(CreditNoteReversals creditNoteReversals, CreditNoteAccount creditNoteAccount);

        Task<int> AllocateCreditTransactionToDebitTransaction(Transaction debitTransaction, Transaction creditTransaction, decimal amountToAllocate);
        Task<bool> DoDebitTransactionAllocations(List<ManualPaymentAllocation> manualPaymentAllocations);
        Task<bool> AutoAllocateRefund(decimal amount, int refundHeaderId, int bankStatementEntryId, string statementReference);
        Task<bool> BulkPremiumTransfer(BulkPremiumTransfer bulkPremiumTransfer);
        Task<bool> BulkManualAllocations(FileContentModel content);
        Task FinalizeBulkAllocation(BulkAllocationMessage message);
        Task<List<BulkAllocationFile>> GetBulkPaymentFiles();
        Task<List<BulkManualAllocation>> GetBulkPaymentFileDetails(int fileId);
        Task<int> DeleteBulkAllocations(List<int> content);
        Task<int> EditBulkAllocations(List<BulkManualAllocation> content);
        Task<int> AllocatePremiumPaymentToDebtorAndInvoice(PremiumPaymentRequest request);
        Task<decimal> GetTransactionBalance(int transactionId);
        Task<bool> AllocatePaymentTransactionToInvoice(Transaction paymentTransaction, decimal amountToAllocate, int invoiceId);
        Task ReduceUnallocatedBalance(int bankstatementEntryId, decimal allocatedAmount);
        Task<decimal> AllocateToTermsArrangement(int roleplayerId, decimal amount, DateTime statementdate, int transactionId);
        Task<bool> AddPaymentToUnallocatedPaymentUsingBankstatementEntry(int bankstatementEntryId, decimal amount, int rolePlayerId);
        Task DoDebitReallocation(CreditNoteReversals creditNoteReversals);
        Task<List<InvoiceAllocation>> GetTransactionInvoiceAllocations(int transactionId);
        Task<bool> ExceptionFailedlAllocations(FileContentModel content);
        Task<List<ExcptionAllocationFile>> GetExceptionAllocationFiles();
        Task<List<ExceptionAllocation>> GetExceptionAllocationDetails(int fileId);
        Task<List<UnallocatedPayment>> GetUnallocatedPaymentsByBankStatementEntry(int bankStatementEntryId);
        Task DoBouncedReallocation(List<Transaction> bouncedReversals, int? toRolePlayerId, string toFinpayeeNumber, string fromFinpayeeNumber);
        Task<PagedRequestResult<BulkAllocationFile>>  GetBulkPaymentAllocationFiles(string startDate, string endDate, int pageNumber, int pageSize
                                                                                    , string orderBy, string sort);
        Task ProcessBulkAllocationsForTerms();
        Task<bool> AllocatePaymentToPolicy(AllocatePaymentToPolicyRequest request);
        Task<bool> TransferPaymentFromPolicyToPolicy(TransferPaymentFromPolicyToPolicyRequest request);
        Task<PolicyPaymentTransaction> FetchPolicyPaymentTransactionsForBillingMonth(int policyId, DateTime billingMonth);
        Task<bool> ReversePaymentsAllocated(ReversePolicyPaymentRequest input);
    }
}
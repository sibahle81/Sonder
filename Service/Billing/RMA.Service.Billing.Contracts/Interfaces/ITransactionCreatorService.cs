using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface ITransactionCreatorService : IService
    {
        Task<Transaction> CreateCreditNoteByRolePlayerId(int rolePlayerId, decimal amount, string reason);
        Task<Transaction> CreateCreditNoteForPremiumPayback(int rolePlayerId, decimal amount, string reason, DateTime transactionDate);
        Task<List<Invoice>> GetInvoicesRaisedForContinuationOrReinstate(int policyId);
        Task<List<InvoiceAllocation>> GetPaymentMadeAfterSpecificDate(int policyId, DateTime paymentDate);
        Task<List<Invoice>> GetOutstandingInvoices(int policyId);
        Task<List<Invoice>> GetInvoicesByPolicyIdNoRefData(int policyId);
        Task<List<Invoice>> GetInvoicesInSpecificDateRange(int policyId, DateTime startDate, DateTime endDate);
        Task<bool> AllocateCreditNoteForRefundTransaction(Invoice invoice, int transactionId);
        Task<int> CreateCreditNoteForInvoicesSettlement(int rolePlayerId, decimal amount, string reason, List<Invoice> invoices);
        Task<decimal> GetPolicyNetBalance(int policyId);
        Task<List<Invoice>> GetFirstRaisedInvoice(int policyId);
        Task<List<Invoice>> GetLastRaisedInvoice(int policyId);
        Task<int> CreateCreditNoteForInvoice(int rolePlayerId, decimal amount, string reason, Invoice invoice);
        Task<bool> CreateBulkCreditNoteForInvoice(int policyId, int rolePlayerId);
        Task<decimal> GetDebtorNetBalance(int rolePlayerId);
        Task<List<Invoice>> GetPolicyInvoices(int policyId);
        Task<List<Invoice>> GetPolicyInvoicesAfterDate(int policyId, DateTime fromDate);
        Task<decimal> GetPolicyNettBalance(int policyId, DateTime fromDate);
        Task<List<Transaction>> GetCreditTransactionsWithBalances(int roleplayerId);
        Task<Transaction> CreateInvoiceTransaction(Policy policy, int invoiceId);
        Task<Transaction> CreateNewInvoice(string policyNumber, decimal amount, int rolePlayerId, int invoiceId);
        Task<Collection> GetCollectionForInvoice(int invoiceId);
        Task<Invoice> GetRaisedInvoiceByPolicyYearMonth(int policyId, int year, int month);
        Task<Transaction> CreateDebitNoteByRolePlayerId(int rolePlayerId, decimal amount, string reason);
        Task<Transaction> DoPayOutDebtAdjustment(int rolePlayerId, decimal amount, string reason, TransactionTypeEnum transactionType);
        Task<decimal> GetDebtorForPayOutBalanceByRolePlayerId(int rolePlayerId);
        Task<int> AddTransaction(Transaction transaction);
        Task<List<Invoice>> GetInvoicesByPolicyIdNumbersRefData(List<int> policyIds);
        Task<bool> PostItemToGeneralLedger(int roleplayerId, int itemId, decimal amount, int bankAccountId, string incomeStatementChart, string balanceSheetChart, bool isAllocated, IndustryClassEnum industryClass, int? contraTransactionId);
        Task CreateAdjustmentCreditNote(UpdatePolicyPremiumMessage updatePolicyPremiumMessage);
    }
}

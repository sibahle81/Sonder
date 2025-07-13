using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Database.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface IInvoiceService : IService
    {
        Task<List<Invoice>> GetInvoices();
        Task<Invoice> GetInvoice(int id);
        Task<List<Invoice>> GetInvoicesByIds(List<int> ids);
        Task<Invoice> GetInvoiceByInvoiceNumber(string invoiceNumber);
        Task<int> AddInvoice(Invoice invoice);
        Task AddInvoices(List<Invoice> invoices);
        Task ModifyInvoiceStatus(int invoiceId, InvoiceStatusEnum newStatus);
        Task<Invoice> GetInvoiceByPolicyId(int policyId);
        Task MonitorCancelledPolicyInvoices();
        Task<List<InvoiceSearchResult>> SearchInvoices(PagedRequest request, bool showActive);
        Task SendGroupInvoices();
        Task SendCoidInvoices();
        Task SendCoidCreditNotes();
        Task GenerateInvoices(ClientTypeEnum clientType, PaymentFrequencyEnum paymentFrequency);
        Task<List<InvoicePaymentAllocation>> GetUnPaidInvoices(int roleplayerId);
        Task SendInvoiceDocument(InvoiceSearchResult invoiceSearchResult);
        Task SendStatement(InvoiceSearchResult invoiceSearchResult);
        Task SendTransactionalStatement(InvoiceSearchResult invoiceSearchResult);
        Task AssignInvoiceNumbers();
        Task<PagedRequestResult<InvoicePaymentAllocation>> SearchUnPaidInvoices(PagedRequest request);
        Task GenerateInvoice(int policyId, ClientTypeEnum clientType);
        Task<List<Invoice>> GetInvoicesReadyToCollect();
        Task<PagedRequestResult<Invoice>> GetUnpaidInvoicesByPolicyId(PagedRequest request);
        Task<List<SearchAccountResults>> SearchAccounts(PagedRequest request, bool showActive);
        Task<List<SearchAccountResults>> SearchDebtors(string query);
        Task<List<InvoicePaymentAllocation>> GetUnPaidInvoicesByPolicy(int policyId);
        Task<List<Invoice>> GetPendingInvoicesByPolicy(int policyId);
        Task<List<Invoice>> GenerateContinuationInvoices(int policyId, DateTime effectiveDate);
        Task<List<Invoice>> GenerateReinstatementInvoices(int policyId, DateTime effectiveDate);
        Task<List<Invoice>> GetDebtorPendingInvoices(int policyId);
        Task<List<Invoice>> GetPaidInvoicesByPolicyId(int policyId);
        Task<List<DebitOrder>> GetDebitOrderReport(int periodYear, int periodMonth, string startDate, string endDate, int industryId, int productId, int debitOrderTypeId, string accountNumber);
        Task<PagedRequestResult<UnallocatedPayments>> GetUnallocatedPaymentsPaged(PaymentDateType dateType, DateTime dateFrom, DateTime dateTo, string bankAccNumber, PagedRequest request);
        Task<List<UnallocatedPayments>> GetUnallocatedPayments(PaymentDateType dateType, DateTime dateFrom, DateTime dateTo, string bankAccNumber, string search);
        Task<List<AllocatedPayment>> GetAllocatedPayments(string startDate, string endDate, int dateType, string bankAccNumber, int productId, int periodYear, int periodMonth);
        Task<List<AllocatedPayment>> GetEuropeAssistPremiums();
        Task<List<StatementAnalysis>> BankStatementAnalysis();
        Task<decimal> GetInvoiceBalance(int invoiceId);
        Task<List<Invoice>> GetUnsettledInvoices(int rolePlayerId, List<int> policyIds);
        Task<Invoice> GetInvoiceById(int id);
        Task<List<InvoiceAllocation>> GetRecoveryAllocationsByRecoveryId(int recoveryId);
        Task<List<Invoice>> GetPartiallyAndUnpaidInvoicesByPolicyId(int policyId);
        Task<decimal> GetTotalPendingRaisedForReinstatement(int policyId, DateTime effectiveDate);
        Task<decimal> GetTotalPendingRaisedForContinuation(int policyId, DateTime effectiveDate);
        Task<int> AddInvoiceItem(Invoice invoice);
        Task GenerateInvoicesForPeriod(DateTime periodStartDate);
        Task<List<Invoice>> GetUnpaidInvoicesForPeriod(DateTime periodStartDate);
        Task MonitorDuplicateInvoices();
        Task<bool> ReverseAllocation(int invoiceAllocationId);
        Task<PagedRequestResult<Invoice>> GetPolicyInvoices(int policyId, PagedRequest pagedRequest);
        Task<InvoiceTypeEnum> GetInvoiceTypeByInvoiceId(int invoiceId);
        Task RaiseInterestOnOverDueInvoices();
        Task<PagedRequestResult<Invoice>> SearchDebtorInvoices(int roleplayerId, int statusId, PagedRequest pagedRequest);
        Task<int> GenerateGroupInvoice(int policyId, DateTime collectionDate, DateTime invoiceDate, string reason, InvoiceStatusEnum invoiceStatus, SourceModuleEnum ? sourceModule, SourceProcessEnum  ?sourceProcess);
        Task<Invoice> GenerateInvoiceByPolicyAndMonth(RolePlayerPolicy policy, DateTime invoiceDate, string reason, InvoiceStatusEnum invoiceStatusEnum, SourceModuleEnum sourceModuleEnum, SourceProcessEnum sourceProcessEnum);
        Task<Invoice> GeneratePartialInvoice(RolePlayerPolicy policy, DateTime invoiceDate, decimal invoiceAmount, string reason, InvoiceStatusEnum invoiceStatusEnum, SourceModuleEnum sourceModuleEnum, SourceProcessEnum sourceProcessEnum);

        Task<string> CreateCreditNoteReferenceNumber();
        Task RaiseInterestForUnpaidInvoicesForDefaultedTerms();
        Task<bool> GenerateAdhocInvoice(int policyId, decimal amount, int monthNumber);
        Task<string> CreateDebitNoteReferenceNumber();
        Task<PagedRequestResult<Invoice>> SearchRolePlayerInvoices(int rolePlayerId, int invoiceStatusId, PagedRequest pagedRequest);
        Task<List<Invoice>> GetInvoicesReadyToCollectWithoutDataTransformationNeeded(DateTime effectiveDate);
        Task ProcessQueuedInvoicesAndCreditNotes();
        Task ProcessQueuedFuneralInvoicesAndCreditNotes();
        Task<bool> EmailDebtorInvoice(InvoiceSendRequest request);
        Task<bool> EmailDebtorCreditNote(CreditNoteSendRequest request);
        Task<List<CreditNoteSearchResult>> SearchCreditNotes(PagedRequest request, bool showActive);
        Task<List<InvoicePaymentAllocation>> GetUnPaidInvoicesByPolicies(int roleplayerId, List<int> policyIds);
        Task<InvoiceDocumentModel> GetInvoiceDocument(int invoiceId);
        Task<List<DebtorOpeningClosingDetail>> GetDebtorOpeningAndClosingBalances(int roleplayerId);
        Task<bool> RegenerateInvoiceNonFinancials(InvoiceNonFinancialReGenBusMessage invoiceNonFinancialReGenBusMessage);
        Task<List<InvoiceAllocation>> GetInvoiceAllocationsByTransaction(int transactionId);
        Task<List<InvoicePaymentAllocation>> GetUnPaidInvoicesForPolicies(int roleplayerId, List<int> policyIds);
        Task<Invoice> GenerateGroupPartialInvoice(RolePlayerPolicy policy,  DateTime invoiceDate, decimal invoiceTotal, string reason, InvoiceStatusEnum invoiceStatu, SourceModuleEnum sourceModule, SourceProcessEnum sourceProcess, Invoice linkedInvoice);
        Task<int> CreateCreditNoteForInvoice(int rolePlayerId, decimal amount, string reason, Invoice invoice, InvoiceStatusEnum invoiceStatus, SourceModuleEnum sourceModule, SourceProcessEnum sourceProcess);
        Task CreatePolicyCancellationInvoices(BillingPolicyChangeDetail policyChangeDetails, RolePlayerPolicy policy, InvoiceStatusEnum invoiceStatus, SourceModuleEnum sourceModule, SourceProcessEnum sourceProcess);
        Task<List<Invoice>> GetPaidInvoicesByDateAndPolicyId(int policyId, DateTime invoiceDate);
        Task<List<BenefitPayrollInvoice>> GetInvoicesForBenefitPayrolls(List<int> payrollIds);
    }
}
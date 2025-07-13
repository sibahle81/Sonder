using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.FinCare.Contracts.Entities.Payments;
using RMA.Service.FinCare.Contracts.Enums;
using RMA.Service.FinCare.Contracts.Integration.Hyphen;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Contracts.Interfaces.Payments
{
    public interface IPaymentService : IService
    {
        Task<PagedRequestResult<Payment>> Get(PaymentTypeEnum? paymentType, PaymentStatusEnum? paymentStatus, DateTime? startDate, DateTime? endDate, EntityType entityType, int pageSize, int pageIndex);
        Task<Payment> GetById(int paymentId);
        Task<Payment> GetPaymentByAllocationId(int allocationId);
        Task<List<Payment>> GetPaymentsByAllocationId(int allocationId);

        Task<List<Payment>> Search(string query, int searchFilterTypeId);
        Task<bool> Update(Payment payment);
        Task<bool> ReversePayment(Payment payment);
        Task ProcessBankResponse(HyphenFACSResponse bankResponse);
        Task DoPaymentReconciliations();
        Task SubmitPayment(PaymentMessage message);
        Task<Payment> UpdateFsbAccreditation(int paymentId, bool fsbAccredited);
        Task<bool> SendPaymentNotification(Payment payment, bool updateNotificationDate);
        Task SendRemittance(int paymentId);
        Task<bool> SendPaymentRejectionNotification(Payment payment, bool updateNotificationDate);
        Task<List<Payment>> GetAllPayments();
        Task<PolicyPayment> GetGoldWagePayments();

        Task QueuePendingPayments();
        Task<Payment> QueuePayment(int paymentId, string batchReference);
        Task QueuePayments(List<Payment> payments, string batchReference);
        Task ImportBankStatement(RootHyphenFACSStatementReference bankStatement);
        Task ImportMissingBankStatement();

        Task<PolicyPayment> GetPaymentsOverview(CoverTypeModel coverTypes);
        Task<PolicyPayment> GetClaimPaymentOverview(CoverTypeModel coverTypes);
        Task<PolicyPayment> GetPaymentsOverviewByPaymentType(PaymentTypeEnum paymentType);
        Task<PolicyPayment> GetDailyEstimates(string startDate, string endDate);
        Task<PolicyPayment> GetCorporateClaimPayments(CoverTypeModel coverTypeModel);
        Task<PolicyPayment> GetSchemePaymentsByProductOptionId(int productOptionId, PaymentTypeEnum paymentType);
        Task<List<EmailAudit>> GetPaymentNotificationAudit(int paymentId);
        Task<Payment> GetPaymentByClaimId(int id);
        Task<DateTime> GetBankStatementDate(int? paymentId);
        Task<int> CreatePaymentAllocation(Allocation paymentAllocation);
        Task<Allocation> GetAllocationsByMedicalInvoiceId(int medicalInvoiceId, PaymentTypeEnum paymentType);
        Task<int> UpdateAllocation(Allocation allocation);
        Task<Allocation> GetAllocationByAllocationId(int allocationId);
        Task MonitorDailyBankstatementImports();
        Task<int> PaymentRecall(List<Contracts.Entities.Payments.Payment> paymentList);
        Task<int> BatchPaymentRecall(string batchPaymentNumber);

        Task<PagedRequestResult<Payment>> SearchPaymentsPaged(int paymentStatusId, List<PaymentTypeEnum> paymentTypes, PagedRequest pagedRequest);

        Task<PagedRequestResult<Payment>> GetPaymentWorkPool(PagedRequest request, bool reAllocate, int userLoggedIn, int workpoolId);
        Task<PaymentPagedRequestResult<Payment>> GetPaymentsPaged(PaymentPoolSearchParams searchParams);
        Task<List<BankBalance>> GetBankBalanceAsync();
        Task EmailCommissionStatementToBroker(EmailCommissionStatementRequest emailCommissionStatementRequest);
        Task<EstimatePaymentResponse> GetEstimatePayments();
        Task<Allocation> GetAllocationsByClaimInvoiceId(int claimInvoiceId);
        Task<bool> ProcessPaymentForGeneral(int paymentId);
        Task<Payment> GetByPolicyId(int policyId);
        Task<bool> ProcessQueue(int paymentId);
        Task<List<Payment>> GetPaymentsByPolicyId(int policyId);
        Task<PagedRequestResult<Payment>> PolicyPaymentsSearchPaged(int policyId, PagedRequest pagedRequest);
        Task ProcessTaxPayments(List<Payment> payments, string batchReference);
        Task<List<GetRemittanceTransactionsListResponse>> GetRemittanceTransactionsList(GetRemittanceTransactionsListRequest request);
        Task<List<GetRemittanceTransactionsListDetailsResponse>> GetRemittanceTransactionsListDetails(string batchReferenceNumber);
        Task<List<GetMSPGroupsResponse>> GetMSPGroups();
        Task<PolicyBasedPayments> GetPolicyPaymentDetails(int policyId, string startDate, string endDate);
        Task<bool> UpdateEmailAddress(int paymentId, string emailAddress);
        Task<bool> SendNotification(int payment);
        Task SubmitAllPayments(PaymentPoolSearchParams searchParams);
        Task<List<PaymentEstimate>> GetDailyPaymentEstimates(string startDate, string endDate);
        Task<PagedRequestResult<PaymentsOverview>> GetPaymentsOverviewPaged(DateTime startDate, DateTime endDate, PagedRequest pagedRequest);
        Task<List<PaymentsProductOverview>> GetPaymentsProductOverview(DateTime startDate, DateTime endDate, int paymentStatusId, string product, string query);
        Task<bool> ProcessPaymentResponse(int paymentId);
    }
}
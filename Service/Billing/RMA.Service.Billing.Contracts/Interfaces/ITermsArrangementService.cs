using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Billing.Contracts.Entities;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface ITermsArrangementService : IService
    {
        Task<TermArrangement> GetTermsArrangement(int termsArrangementId);
        Task ApproveTermsArrangement(TermArrangement termsArrangement, int wizardId);
        Task<List<TermArrangementSchedule>> GetTermsArrangementsSchedule();
        Task CreateTermsArrangementsInadequatePaymentWizard();
        Task ProcessPaidTermAccounts();
        Task SendEmailNotification(int LinkedItemId);
        Task CreateTermsArrangementsMissedPaymentWizard();
        Task<int> AddUnsuccessfulInitiation(UnsuccessfulInitiation item);
        Task UpdateTermsArrangementsMissedPaymentsStatus();
        Task SendMissedPaymentEmailNotification(int LinkedItemId);
        Task UpdateTermsArrangementsInadequatePaymentRole();
        Task<List<string>> CanAutoApproveTermArrangementApplication(int roleplayerId, TermArrangement termsArrangement);
        Task MissedTwoPayments();
        Task<List<TermArrangement>> GetTermArrangementsByRolePlayerId(int roleplayerId);
        Task<PagedRequestResult<TermsArrangementNote>> GetAllTermNotesByTermArrangementId(PagedRequest pagedRequest);
        Task<int> AddTermArrangementNote(TermsArrangementNote note);
        Task AddTermArrangementNotes(TermsArrangementNote notes);
        Task<decimal> GetDebtorNetBalance(int rolePlayerId);
        Task RaiseInterestForUnpaidInvoicesForDefaultedTerms();
        Task<bool> SendMemoOfAgreementEmail(TermsMemoOfAgreementEmail termsMemoOfAgreementEmail);
        Task<int> RejectTermApplication(TermArrangement termArrangement, string comment);
        Task<List<DebtorProductBalance>> GetDebtorTermProductBalances(int roleplayerId, int termBillingCycleId);
        Task SendLogsForAllocatedInvoices();
        Task<TermsDebitOrderDetail> GetTermsDebitOrderDetailsByTermSchedule(int termarrangementScheduleId);
        Task<List<TermArrangement>> GetActiveArrangementsByRoleplayer(int roleplayerId, int financialYearPeriodId);
        Task<List<DebtorProductBalance>> GetProductBalancesByPolicyIds(TermProductBalanceRequest request);
        Task EditTermArrangementSechedulesCollectionFlags(List<TermArrangementSchedule> termArrangementSchedules);
        Task<TermsDebitOrderDetail> GetTermsDebitOrderDetailsByTermArrangementId(int termArrangementId);
        Task DiscardUnactionedTerms();
        Task<int> GetCurrentTermArrangementInPlace(int roleplayerId);
        Task<bool> ReverseTermScheduleAllocations(int termarrangementId, decimal amount, int transactionId, DateTime debitTransactionDate);
        Task<List<TermArrangementProductOption>> GetActiveTermArrangementsProductOptionsByRolePlayerId(int roleplayerId);
        Task<List<TermScheduleRefundBreakDown>> GetTermScheduleRefundBreakDown(int roleplayerId);
        Task<decimal> RefundTermSchedulesAllocations(int refundTransactionId, TermScheduleRefundBreakDown termScheduleRefundBreakDown, decimal fullRefundAmountRemaining);
        Task SendInCompleteApplicationsEmailNotification(TermArrangement termArrangement);
        Task ProcessTermsArrangementsIncompleteApplications();
        Task ProcessTermsArrangementsPaymentsDueSoonReminders();
    }
}
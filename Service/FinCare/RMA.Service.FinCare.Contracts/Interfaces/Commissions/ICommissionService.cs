using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.FinCare.Contracts.Entities.Commissions;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Contracts.Interfaces.Commissions
{
    public interface ICommissionService : IService
    {
        Task<bool> DailyCommissionRun();
        Task<bool> ReleaseCommission(List<CommissionHeader> commissions);
        Task<List<CommissionAccount>> GetCommissionAccounts();
        Task<List<CommissionHeader>> GetCommissions();
        Task<List<CommissionHeader>> GetCommissionsByStatus(List<CommissionStatusEnum> statusEnums);
        Task<List<CommissionHeader>> GetCommissionsByAccount(int accountTypeId, int accountId, int headerStatusId);
        Task<bool> AutoSendCommissionStatements();
        Task<List<CommissionDetail>> GetCommissionDetailsByHeaderId(int headerId);
        Task<CommissionDetail> GetCommissionDetailById(int detailId);
        Task<PagedRequestResult<CommissionAccount>> SearchCommissionAccounts(PagedRequest pagedRequest);
        Task<bool> AddCommissions(List<CommissionInvoicePaymentAllocation> invoicePayments);
        Task ProcessCommissionPaymentSuccess(int paymentInstructionId);
        Task ProcessCommissionPaymentRejection(int paymentInstructionId, string rejectionReason);
        Task<bool> CommissionBrokerFitAndProperCheck();
        Task<List<CommissionPaymentInstruction>> GetCommissionPaymentInstructionsByHeaderId(int headerId);
        Task<CommissionPaymentInstruction> GetCommissionPaymentInstructionById(int paymentInstructionId);
        Task<List<CommissionStatementModel>> GetBrokerCommissionStatementByPeriod(int accountTypeId, int accountId, int periodId);
        Task<List<CommissionPeriod>> GetCommissionPeriodsByAccountAndType(int accountTypeId, int accountId);
        Task<bool> ReSubmitBankRejectedCommissions(List<CommissionHeader> commissions);
        Task<List<CommissionAuditTrailModel>> GetCommissionAuditTrail(DateTime startDate, DateTime endDate);
        Task<List<MailAttachment>> GetCommissionEmailAttachments(CommissionHeader commissionHeader);
        Task<List<CommissionAuditTrailModel>> GetCommissionAuditTrailByAccountId(DateTime startDate, DateTime endDate, int accountId, int accountTypeId);
        Task<int> ResendCommissionStatment(ReSendStatementRequest reSendStatementRequest);
        Task<List<EmailAudit>> GetCommissionPeriodicCommunicationSent(int accountTypeId, int accountId, int periodId);
        Task<bool> SendBrokerageStatement(CommissionStatementCommunicationModel communicationModel);
        Task<List<CommissionPeriod>> GetCommissionPeriodsForReports();
        Task<CommissionAccount> GetCommissionAccountByAccountId(int accountTypeId, int accountId);
        Task<CommissionClawBackAccount> GetCommissionClawBackAccountSummary(int accountTypeId, int accountId);
        Task<List<CommissionClawBackAccountMovement>> GetCommissionClawBackAccountMovementByHeaderId(int headerId);
        Task<PagedRequestResult<CommissionHeader>> CommissionPoolSearch(CommissionPoolSearchParams commissionPoolSearchParams);
        Task<List<CommissionPeriod>> GetCommissionPeriodByPeriod(int periodId);
        Task<int> AddCommissionPeriod(CommissionPeriod commissionPeriod);
        Task EditCommissionPeriod(CommissionPeriod commissionPeriod);
        Task UpdateCommissionHeader(CommissionHeader commissionHeader);
    }
}

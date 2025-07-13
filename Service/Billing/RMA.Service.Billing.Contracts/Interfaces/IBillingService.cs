using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities.Payments;
using RMA.Service.Billing.Entities;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface IBillingService : IService
    {
        Task<FinPayee> GetFinPayeeAccountByFinPayeeNumber(string FinPayeeNumber);
        Task<List<BillingNote>> GetAllBillingNotesByRoleplayerId(int rolePlayerId);
        Task<int> AddBillingNote(BillingNote billingNote);
        Task AddBillingNotes(List<BillingNote> billingNotes);
        Task MonitorBankStatementImport();
        Task SetBundleRaiseStatusToAwaitingApproval(int wizardId);
        Task<bool> ImportQLinkPremiumTransactionsAsync(string claimCheckReference);
        Task<FileUploadResponse> ImportSpreadsheetPremiumTransactionsAsync(FileContentImport fileContent);
        Task<QLinkStatementResponse> GetQLinkPaymentRecordsAsync(string claimCheckReference);
        Task<List<BillingNote>> GetBillingNotesByRoleplayerId(int rolePlayerId);
        Task<List<BillingNote>> GetBillingNotesByRoleplayerIdAndType(int rolePlayerId, BillingNoteTypeEnum noteType);
        Task<List<PolicyProductCategory>> GetPolicyProductCategoriesByRoleplayerId(int rolePlayerId);
        Task<bool> CheckStagePaymentRecordsAreStagedAsync(string claimCheckReference);
        Task<List<DebtorProductBalance>> GetProductBalancesByPolicyIds(DebtorProductBalanceRequest request);
        Task<List<AutoAllocationAccount>> GetAutoAllocationAccounts();
        Task<bool> AddAllocationAccounts(List<AutoAllocationAccount> bankAccounts);
        Task<InterestIndicator> AddBillingInterestIndicator(InterestIndicator interestIndicator);
        Task<InterestIndicator> GetBillingInterestIndicatorByRolePlayerId(int rolePlayerId);
        Task<List<RefundRoleLimit>> GetRefundRoleLimits();
        Task<decimal> GetDebtorNetBalance(int rolePlayerId);
        Task<List<DebtorProductCategoryBalance>> GetDebtorProductCategoryBalances(int roleplayerId);
        Task<bool> UpdateDebtorStatus(DebtorStatusModel debtorStatusModel);
        Task<List<DebtorOpenCreditTransaction>> GetDebtorOpenCreditTransactions(int roleplayerId);
        Task<IndustryBillingCycle> GetCurrentBillingCycleByIndustryClass(IndustryClassEnum industryClass);
        Task<bool> UpdateTheDebtorStatus(UpdateDebtorStatusRequest updateDebtorStatusRequest);
        Task<List<DebtorCompanyAndBranchModel>> GetDebtorsByCompanyBranch(int industryClassId, int companyNumber, int branchNumber);
        Task<List<BranchModel>> GetBrachesByCompany(int companyNumber);
        Task<List<CompanyModel>> GetCompanies();
        Task<List<DebtorCompanyAndBranchModel>> GetDebtorsByCompanyBranchAndDate(int companyNumber, int branchNumber, DateTime startDate, DateTime endDate);
        Task<ProductCategoryTypeEnum> GetProductCategoryByRmaBankAccount(string bankAccountDescription);
        Task<bool> WriteOffBulkPremiums(BulkWriteOffRequest content);
        Task<bool> UpdateDebtorProductCategoryStatus(DebtorProductCategoryStatusRequest debtorProductCategoryStatusRequest);
        Task<List<ForecastRates>> GetAllForecastRates();
        Task<int> UpdateForecastRate(ForecastRates forecastRates);
        Task<List<string>> SearchAllowedAllocationToDebtorAccount(string finPayeNumber);
        Task<bool> UpdateRefundHeader(RefundHeader header);
        Task<bool> SendRefundFailedNotification(int refundHeaderId, string reason);
        Task<bool> UploadHandoverRecon(List<LegalCommissionRecon> recons);
        Task<bool> BulkDebtorHandover(BulkHandOverRequest content);
        Task<List<string>> GetAttorneysForRecon();
    }
}

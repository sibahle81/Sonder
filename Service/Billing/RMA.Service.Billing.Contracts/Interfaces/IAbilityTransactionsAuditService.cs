using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Billing.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface IAbilityTransactionsAuditService : IService
    {
        Task<List<AbilityTransactionsAudit>> GetAbilityPostingAudits();
        Task<List<AbilityTransactionsAudit>> GetAbilityPostingAuditsToProcess();
        Task<AbilityTransactionsAudit> GetAbilityPostingAudit(int id);
        Task EditAbilityPostingAudit(AbilityTransactionsAudit abilityPostingAudit);
        Task<int> AddAbilityPostingAudit(AbilityTransactionsAudit abilityPostingAudit);
        Task ProcessTransactionsForPosting();
        Task AddRefundTransactionAudit(int paymentId);
        Task<List<AbilityTransactionsAudit>> GetAbilityPostingAuditByRef(string reference);
        Task<bool> PostItemToGeneralLedger(int roleplayerId, int itemId, decimal amount, int bankAccountId, string incomeStatementChart, string balanceSheetChart, bool isAllocated, IndustryClassEnum industryClass, int? contraTransactionId );
        Task ProcessMonthlyEarnedIncome();
    }
}

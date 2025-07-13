using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.FinCare.Contracts.Entities.Finance;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Contracts.Interfaces.Finance
{
    public interface IAbilityPostingAuditService : IService
    {
        Task<List<AbilityPostingAudit>> GetAbilityPostingAudits();
        Task<AbilityPostingAudit> GetAbilityPostingAudit(int id);
        Task<List<AbilityPostingAudit>> GetAuditDetailsByReference(string reference);
        Task<int> AddAbilityPostingAudit(AbilityPostingAudit abilityPostingAudit);
        Task RemoveAbilityPostingAudit(int id);
        Task EditAbilityPostingAudit(AbilityPostingAudit abilityPostingAudit);
        Task<List<AbilityPostingAudit>> GetAbilityPostingAuditsToProcess();
        Task UpdateAbilityAudit(AbilityPostingAudit abilityPostingAudit);
        Task UpdateAbilityAuditWithBranch(AbilityPostingWithPaymentBranch abilityPostingAudit);
        Task<bool> CheckIfPaymentAlreadyCreated(int paymentId, bool isReversalOrRejection);
        Task<AbilityPostingAudit> GetAuditDetailsByPaymentId(int PaymentId);
        Task<List<AbilityPostingAudit>> GetCOIDAbilityPostingAuditsToProcess();
    }
}

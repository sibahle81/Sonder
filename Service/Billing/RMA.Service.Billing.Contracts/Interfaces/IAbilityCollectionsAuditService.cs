using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Billing.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface IAbilityCollectionsAuditService : IService
    {
        Task<List<AbilityCollectionsAudit>> GetAbilityPostingAudits();
        Task<List<AbilityCollectionsAudit>> GetAbilityPostingAuditsToProcess();
        Task<AbilityCollectionsAudit> GetAbilityPostingAudit(int id);
        Task EditAbilityPostingAudit(AbilityCollectionsAudit abilityPostingAudit);
        Task<int> AddAbilityPostingAudit(AbilityCollectionsAudit abilityPostingAudit);
        Task RemoveAbilityPostingAudit(int id);
        Task<int> AddAbilityCollectionsAudit(int invoiceId, string batchReference);
    }
}

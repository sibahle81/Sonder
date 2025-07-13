using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.FinCare.Contracts.Entities.Finance;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Contracts.Interfaces.Finance
{
    public interface IAbilityPostingService : IService
    {
        Task<List<AbilityPosting>> GetAbilityPostings();
        Task<AbilityPosting> GetAbilityPostingByTranSysNo(int TranSysNo);
        Task<AbilityPosting> GetAbilityPosting(int id);
        Task<int> AddAbilityPosting(AbilityPosting abilityPosting);
        Task EditAbilityPosting(AbilityPosting abilityPosting);
        Task RemoveAbilityPosting(int id);
        Task<List<AbilityPosting>> GetAbilityPostingsToProcess();
        Task ProcessAbilityPostingItems();
        Task ProcessCOIDAbilityPostingItems();
    }
}
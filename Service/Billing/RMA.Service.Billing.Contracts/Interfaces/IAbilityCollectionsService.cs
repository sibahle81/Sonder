using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Billing.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface IAbilityCollectionsService : IService
    {
        Task<List<AbilityCollections>> GetAbilityPostings(int companyNo , int branchNo);
        Task<List<AbilityCollections>> GetRecoveryAbilityPostings();
        Task<AbilityCollections> GetAbilityPosting(int id);
        Task<int> AddAbilityPosting(AbilityCollections abilityCollections);
        Task EditAbilityPosting(AbilityCollections abilityCollections);
        Task<List<AbilityCollections>> GetAbilityPostingsToProcess();
        Task<List<AbilityCollections>> GetRecoveriesPostingsToProcess();
        Task ProcessAbilityPostingItems();
        Task<List<AbilityChart>> GetAbilityIncomeAndBalanceSheetCharts();
        Task<bool> PostCollectionSummaryToAbility(AbilityCollectionPostingRequest request);
    }
}

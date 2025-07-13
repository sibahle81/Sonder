using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClientCare.Contracts.Entities.Product;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Product
{
    public interface IBenefitSetService : IService
    {
        Task<int> AddBenefitSet(BenefitSet benefitSet);
        Task EditBenefitSet(BenefitSet benefitSet);
        Task<List<BenefitSet>> GetBenefitSetsForProduct(int productId);
        Task<List<Benefit>> GetBenefitsForBenefitSet(int benefitSetId);
        Task<BenefitSet> GetBenefitSet(int id);
        Task<List<BenefitSet>> GetBenefitSets();
        Task<List<BenefitSet>> SearchBenefitSets(string query);
        Task<List<int>> GetBenefitIdByBenefitSetId(int id);
    }
}
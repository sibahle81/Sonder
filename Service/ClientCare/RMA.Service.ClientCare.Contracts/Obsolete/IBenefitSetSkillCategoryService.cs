using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClientCare.Contracts.Entities.Product;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Product
{
    public interface IBenefitSetSkillCategoryService : IService
    {
        Task<List<BenefitSetSkillCategory>> GetBenefitSetSkillCategories(int benefitSetId);
        Task AddBenefitSetSkillCategory(BenefitSkillCategoryRequest benefitSkillCategoryRequest);
        Task EditBenefitSetSkillCategories(int benefitSetId, List<int> skillCategoryIds);
        Task AddBenefitSetSkillCategories(int benefitSetId, List<int> skillCategoryIds);
        Task<List<int>> GetSkillCategoryIdsByBenefitSet(int benefitSetId);
    }
}
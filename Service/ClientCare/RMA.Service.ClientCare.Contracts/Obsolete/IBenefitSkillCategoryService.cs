using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClientCare.Contracts.Entities.Product;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Product
{
    public interface IBenefitSkillCategoryService : IService
    {
        Task<List<BenefitSkillCategory>> GetBenefitSkillCategories(int benefitId);
        Task AddBenefitSkillCategory(BenefitSkillCategoryRequest benefitSkillCategoryRequest);
        Task EditBenefitSkillCategory(BenefitSkillCategoryRequest benefitSkillCategoryRequest);
    }
}
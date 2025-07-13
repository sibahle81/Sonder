using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClientCare.Contracts.Entities.Product;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Product
{
    public interface IProductSkillCategoryService : IService
    {
        Task<List<ProductSkillCategory>> GetProductSkillCategories(int productId);
        Task<List<int>> GetProductSkillCategoryIdsAsync(int productId);
        Task AddProductSkillCategory(ProductSkillCategoryRequest productSkillCategoryRequest);
        Task EditProductSkillCategory(ProductSkillCategoryRequest productSkillCategoryRequest);
    }
}
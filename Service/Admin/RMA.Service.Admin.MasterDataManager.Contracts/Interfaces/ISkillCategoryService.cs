using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface ISkillCategoryService : IService
    {
        Task<List<SkillCategory>> GetSkillCategories();
        Task<SkillCategory> GetSkillCategoryByName(string name);
    }
}
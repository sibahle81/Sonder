using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IRateIndustryService : IService
    {
        Task<List<RateIndustry>> GetIndustryRates(string industryGroup, SkillSubCategoryEnum skillSubCategory);
        Task<List<RateIndustry>> GetRateIndustries(string industryGroup);
        Task<List<RateIndustry>> GetIndustryGroup();
        Task<List<RateIndustry>> GetEmployeeCategories(string industry);
        Task<RateIndustry> GetRate(int id);
        Task<List<RateIndustry>> GetPremium(string industry, string empCategory);
        Task<List<RateIndustry>> GetRates(string IndustryName, string IndustryGroup, int ratingYear);
        Task<List<RateIndustry>> GetRatesForIndustry(string industryName, string IndustryGroup);
    }
}
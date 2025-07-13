using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IConfigurationService : IService
    {
        Task<string> GetModuleSetting(string key);
        Task SetModuleSetting(ModuleSetting setting);
        Task<List<ModuleSetting>> GetModuleSettingByKeyList(ModuleSetting moduleSetting);
        Task<bool> IsFeatureFlagSettingEnabled(string key);
        Task<List<string>> GetAllActiveEnabledFeatureFlagKeys();
        Task<string> GetModuleAmountToleranceByKey(string key);
    }
}

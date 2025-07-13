using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IValidityCheckSetService : IService
    {
        Task<List<ValidityCheckSet>> GetValidityChecks(ValidityCheckTypeEnum checkType);
        Task<List<ValidityCheckCategory>> GetValidityCheckCategories(ValidityCheckTypeEnum checkType);
    }
}

using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface INatureOfBusinessService : IService
    {
        Task<List<NatureOfBusiness>> GetNatureOfBusinesses();
        Task<List<NatureOfBusiness>> GetNatureOfBusinessesAuditLogLookUp();
        Task<NatureOfBusiness> GetNatureOfBusinessById(int natureOfBusinessId);
        Task<NatureOfBusiness> GetNatureOfBusinessByCode(string code);
        Task<string> GetNatureOfBusinessDescription(string code);
    }
}
using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.SecurityManager.Contracts.Entities;

using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Contracts.Interfaces
{
    public interface ITenantPreferenceService : IService
    {
        Task<TenantPreference> GetTenantPreference(int id);
        Task<TenantPreference> GetTenantPreferenceByTenantId(int tenantId);
        Task ResetTenantPreference(int id);
        Task<int> SaveTenantPreference(TenantPreference TenantPreference);
    }
}
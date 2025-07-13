using Microsoft.ServiceFabric.Services.Remoting;

using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IPolicyMonitoringService : IService
    {
        Task<bool> MonitorAnniversary();
        Task<bool> MonitorChildAge();
        Task<bool> MonitorPremiumWaivedChildren();
    }
}

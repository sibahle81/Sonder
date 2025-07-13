using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Integrations.Contracts.Entities;

using System.Threading.Tasks;


namespace RMA.Service.Integrations.Contracts.Interfaces.EuropAssistNotification
{
    public interface IEuropAssistNotificationService : IService
    {
        Task<string> SendClaimRegistration(EuropAssistClaimDetails request);
    }
}

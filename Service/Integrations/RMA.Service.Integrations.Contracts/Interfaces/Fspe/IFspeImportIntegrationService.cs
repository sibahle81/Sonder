using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Integrations.Contracts.Entities.Fspe;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Integrations.Contracts.Interfaces.Fspe
{
    public interface IFspeImportIntegrationService : IService
    {
        Task<RootSubmitSubscriptionListResponse> SubmitSubscriptionListAsync(List<FSPSubscription> subscriptions);
        Task<RootGetAllFromSubscriptionListResponse> GetAllFromSubscriptionListAsync();
        Task<List<Fsp>> ProcessFSPDataImportResponseAsync(string claimCheckReference);
    }
}

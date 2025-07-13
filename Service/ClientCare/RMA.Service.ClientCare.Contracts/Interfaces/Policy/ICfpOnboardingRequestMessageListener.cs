using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClientCare.Contracts.Entities.Policy;

using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface ICfpOnboardingRequestMessageListener : IService
    {
        Task ReceiveMessageAsync(PolicyRequestReferenceMessage policyRequestReferenceMessage, CancellationToken cancellationToken);
    }
}

using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Integrations.Contracts.Entities.Vopd;

using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.Integrations.Contracts.Interfaces.Vopd
{
    public interface IVopdRequestProcessorService : IService
    {
        Task<VopdResponse> ReceiveMessageAsync(VopdRequestMessage message, CancellationToken cancellationToken);
    }
}
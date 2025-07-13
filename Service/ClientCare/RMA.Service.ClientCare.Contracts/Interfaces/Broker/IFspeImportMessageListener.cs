using RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration;

using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Broker
{
    public interface IFspeImportMessageListener
    {
        Task ReceiveMessageAsync(RootFSPEResponseReference response, CancellationToken cancellationToken);
    }
}
using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer
{
    public interface IVopdQuickTransactRequestMessageListener : IService
    {
        Task ReceiveMessageAsync(VopdQuickTransactRequestMessage vopdQuickTransactRequestMessage, CancellationToken cancellationToken);
    }
}

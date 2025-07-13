using RMA.Service.Integrations.Contracts.Entities.Vopd;

using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer
{
    public interface IVopdRequestMessageListener
    {
        Task ReceiveMessageAsync(VopdRequestMessage message, CancellationToken cancellationToken);
    }
}

using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer
{
    public interface IVopdUpdateMessageListener
    {
        Task ReceiveMessageAsync(VopdUpdateResponse vopdUpdateResponse, CancellationToken cancellationToken);
    }
}

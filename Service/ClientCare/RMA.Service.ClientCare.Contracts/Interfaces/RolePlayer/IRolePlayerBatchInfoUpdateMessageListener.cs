using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer
{
    public interface IRolePlayerBatchInfoUpdateMessageListener
    {
        Task ReceiveMessageAsync(RolePlayerBatchInfoUpdate rolePlayerBatchInfoUpdate, CancellationToken cancellationToken);
    }
}

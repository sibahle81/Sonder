using RMA.Service.MediCare.Contracts.Entities.Medical;

using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface ISwitchBatchReferenceListener
    {
        Task ReceiveMessageAsync(SwitchBatchReference switchBatchReference, CancellationToken cancellationToken);
    }
}

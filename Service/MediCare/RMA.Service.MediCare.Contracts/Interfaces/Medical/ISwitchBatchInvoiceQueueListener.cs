using RMA.Service.MediCare.Contracts.Entities.Medical;

using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface ISwitchBatchInvoiceQueueListener
    {
        Task ReceiveMessageAsync(SwitchBatchInvoiceMessage message, CancellationToken cancellationToken);
    }
}

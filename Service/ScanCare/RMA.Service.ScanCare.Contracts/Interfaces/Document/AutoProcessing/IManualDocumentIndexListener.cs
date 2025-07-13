using RMA.Service.ScanCare.Contracts.Entities.AutoProcessing;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing
{
    public interface IManualDocumentIndexListener
    {
        Task ReceiveMessageAsync(ManualDocumentIndexMessage message, CancellationToken cancellationToken);
    }
}

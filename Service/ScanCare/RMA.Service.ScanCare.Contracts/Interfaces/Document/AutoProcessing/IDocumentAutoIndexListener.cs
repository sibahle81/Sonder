using RMA.Service.ScanCare.Contracts.Entities.AutoProcessing;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing
{
    public interface IDocumentAutoIndexListener
    {
        Task ReceiveMessageAsync(DocumentAutoIndexMessage message, CancellationToken cancellationToken);
    }
}

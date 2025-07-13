using RMA.Service.ScanCare.Contracts.Entities.AutoProcessing;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing
{
    public interface IDocumentSaveListener
    {
        Task ReceiveMessageAsync(DocumentSaveMessage message, CancellationToken cancellationToken);
    }
}

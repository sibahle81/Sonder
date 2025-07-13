using System.Threading;
using System.Threading.Tasks;
using RMA.Service.ScanCare.Contracts.Entities.AutoProcessing;

namespace RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing
{
    public interface IDocumentDownloadListener
    {
        Task ReceiveMessageAsync(DocumentDownloadMessage message, CancellationToken cancellationToken);
    }
}
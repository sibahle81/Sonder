using Microsoft.ServiceFabric.Services.Remoting;
using System.Threading.Tasks;
using RMA.Service.ScanCare.Contracts.Entities.AutoProcessing;

namespace RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing
{
   public interface IDocumentAutoProcessingService : IService
   {
       Task IndexDocuments(DocumentAutoIndexMessage indexMessage);
   }
}
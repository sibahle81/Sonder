using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Service.ScanCare.Contracts.Entities.AutoProcessing;
using System.Threading.Tasks;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing
{
    public interface IDocumentClassifierService : IService
    {
        Task<DocumentTypeEnum> ClassifyDocument(DocumentClassificationInput input);
    }
}

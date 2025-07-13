using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Service.ScanCare.Contracts.Entities.AutoProcessing;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing
{
    public interface IDocumentSplitterService : IService
    {
        Task<List<DocumentPart>> Split(byte[] fileBytes, string fileName, string contentType);
    }
}

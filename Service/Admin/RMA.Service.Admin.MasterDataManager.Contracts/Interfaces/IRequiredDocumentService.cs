using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IRequiredDocumentService : IService
    {
        Task<List<RequiredDocument>> GetRequiredDocuments();
        Task<RequiredDocument> GetRequiredDocument(int id);
        Task<int> AddRequiredDocument(RequiredDocument requiredDocument);
        Task EditRequiredDocument(RequiredDocument requiredDocument);
        Task RemoveRequiredDocument(int id);
        Task<List<RequiredDocument>> GetRequiredDocumentsByModuleCategory(int moduleId, DocumentCategoryEnum documentCategory);
    }
}
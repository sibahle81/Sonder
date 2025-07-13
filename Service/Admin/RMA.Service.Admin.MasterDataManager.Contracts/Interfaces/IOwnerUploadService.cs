using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IOwnerUploadService : IService
    {
        Task<List<OwnerUpload>> GetOwnerUploads();
        Task<List<OwnerUpload>> GetOwnerUploadsByIdAndType(int ownerId, string ownerTypeName);
        Task<OwnerUpload> GetOwnerUpload(int uploadId);
        Task<List<int>> AddOwnerUpload(List<OwnerUpload> ownerUpload);
        Task<OwnerUpload> SaveOwnerUpload(OwnerUpload ownerUpload);
        Task DeleteOwnerUploads(int uploadId);
    }
}
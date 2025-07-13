using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IUploadsService : IService
    {
        Task<List<Uploads>> GetUploads();
        Task<Uploads> GetUploadByToken(Guid token);
        Task<Uploads> SaveUpload(Uploads upload);
        Task DeleteUpload(int id);
        Task<Uploads> GetUploadById(int id);
    }
}
using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.CampaignManager.Contracts.Entities;

using System;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Contracts.Interfaces
{
    public interface IImportFileService : IService
    {
        Task<ImportFile> GetImportFileById(int id);
        Task<ImportFile> GetImportFile(Guid fileToken);
        Task<int> AddImportFile(ImportFile importFile);
        Task EditImportFile(ImportFile importFile);
    }
}
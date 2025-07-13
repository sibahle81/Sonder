using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Contracts.Interfaces
{
    public interface ICampaignService : IService
    {
        Task<List<Campaign>> GetCampaigns();
        Task<List<Campaign>> GetCampaignsByOwner(string owner);
        Task<List<Campaign>> GetCampaignsByOwners(string[] owners);
        Task<PagedRequestResult<Campaign>> SearchCampaigns(PagedRequest request);
        Task<Campaign> GetCampaign(int id);
        Task<int> AddCampaign(Campaign campaign);
        Task EditCampaign(Campaign campaign);
        Task ReviewCampaign(Campaign campaign);
        Task Delete(int id);
        Task<int> CopyCampaign(int id);
        Task<List<Campaign>> GetCampaignsByRole(string role);
        Task<List<Campaign>> GetCampaignsByName(string name);
    }
}
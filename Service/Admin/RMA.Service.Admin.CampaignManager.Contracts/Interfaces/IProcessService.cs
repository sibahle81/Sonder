using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.CampaignManager.Contracts.Entities;

using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Contracts.Interfaces
{
    public interface IProcessService : IService
    {
        Task<bool> AddEnquiryCampaign(CallbackCampaign callback);
        Task<bool> AddCallbackCampaign(CallbackCampaign callback);
        Task<int> AddBillingCampaign(string owner, int[] clientIds);
    }
}
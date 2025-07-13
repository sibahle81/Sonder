using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.CampaignManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Contracts.Interfaces
{
    public interface ILastViewedService : IService
    {
        Task<List<Campaign>> GetLastViewedCampaigns(string user);
        Task<List<EmailTemplate>> GetLastViewedEmailTemplates(string user);
        Task<List<SmsTemplate>> GetLastViewedSmsTemplates(string user);
        Task<List<CampaignTemplate>> GetLastViewedTemplates(string user);
    }
}
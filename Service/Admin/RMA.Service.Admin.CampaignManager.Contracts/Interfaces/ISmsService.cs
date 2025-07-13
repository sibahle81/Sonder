using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.CampaignManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Contracts.Interfaces
{
    public interface ISmsService : IService
    {
        Task<MessageContent> GetSmsContent(Sms sms);
        Task<MessageContent> GetSmsContentById(int smsId);
        Task<Sms> GetSms(int id);
        Task<Sms> GetCampaignSms(int campaignId);
        Task<int> AddSms(Sms sms);
        Task EditSms(Sms sms);
        Task CopySmses(int campaignId, int newCampaignId);
        Task ModifyCampaignSmses(List<Sms> campaignSmses);
        Task<bool> CheckIfSmsSent(int itemId, string itemType, string message, string cellNumber);
    }
}
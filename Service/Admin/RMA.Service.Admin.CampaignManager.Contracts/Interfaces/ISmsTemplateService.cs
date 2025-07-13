using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Contracts.Interfaces
{
    public interface ISmsTemplateService : IService
    {
        Task<List<SmsTemplate>> GetSmsTemplates();
        Task<List<SmsTemplate>> GetSmsTemplatesByIds(List<int> ids);
        Task<List<SmsTemplate>> SearchTemplates(string query);
        Task<List<SmsTemplate>> GetCampaignTemplates(int campaignId);
        Task<SmsTemplate> GetSmsTemplate(int id);
        Task<int> AddSmsTemplate(SmsTemplate template);
        Task EditSmsTemplate(SmsTemplate template);
        Task<SmsTemplate> GetSmsTemplateByTemplateId(TemplateTypeEnum templateType);
    }
}
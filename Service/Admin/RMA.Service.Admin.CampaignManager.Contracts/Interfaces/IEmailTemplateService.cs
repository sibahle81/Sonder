using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Contracts.Interfaces
{
    public interface IEmailTemplateService : IService
    {
        Task<List<EmailTemplate>> SearchTemplates(string query, bool stripMarkup);
        Task<List<EmailTemplate>> GetEmailTemplates();
        Task<List<EmailTemplate>> GetMarketingEmailTemplates();
        Task<List<EmailTemplate>> GetCampaignTemplates(int campaignId);
        Task<EmailTemplate> GetEmailTemplate(int id);
        Task<int> AddEmailTemplate(EmailTemplate template);
        Task EditEmailTemplate(EmailTemplate template);
        Task<MessageContent> GenerateTemplateContent(TemplateTypeEnum templateType, Dictionary<string, string> markers);
        Task<MessageContent> GenerateSmsContent(TemplateTypeEnum templateType, Dictionary<string, string> markers);
    }
}
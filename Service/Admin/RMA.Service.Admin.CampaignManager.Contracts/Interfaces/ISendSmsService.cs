using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Contracts.Interfaces
{
    public interface ISendSmsService : IService
    {
        Task<int> SendSmsMessage(SendSmsRequest request);
        Task<int> SendTemplateSms(TemplateSmsRequest request);
        Task<PagedRequestResult<SmsAudit>> GetSmsAudit(PagedRequest request);
        Task<bool> SmsAlreadySent(int itemId, string itemType, string message, string numbers);
        Task SendBulkSms(List<SendSmsRequest> bulkSms);
        Task<bool> ProcessBulkSmsRequest();
        Task<int> AddSmsStatusAuditDetail(SmsAuditDetail smsAuditDetail);
    }
}
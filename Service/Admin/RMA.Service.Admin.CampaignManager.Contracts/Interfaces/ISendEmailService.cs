using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;

using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Contracts.Interfaces
{
    public interface ISendEmailService : IService
    {
        Task<int> SendEmail(SendMailRequest request);
        Task<int> SendCampaign(int campaignId);
        Task<bool> Resend(int emailAuditId);
        Task<int> ResendEmail(EmailAudit emailAudit);
    }
}

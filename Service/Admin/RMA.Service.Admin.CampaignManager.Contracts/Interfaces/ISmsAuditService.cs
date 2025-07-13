using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Contracts.Interfaces
{
    public interface ISmsAuditService : IService
    {
        Task<PagedRequestResult<SmsAudit>> GetPagedSmsAudits(int itemId, string itemType, PagedRequest pagedRequest);
        Task<PagedRequestResult<SmsAudit>> GetSmsAuditForPolicy(int policyId, PagedRequest pagedRequest);
    }
}

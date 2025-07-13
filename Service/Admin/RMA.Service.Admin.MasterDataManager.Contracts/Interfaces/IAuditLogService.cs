using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IAuditLogService : IService
    {
        Task<AuditResult> GetAuditLog(int id);
        Task<List<AuditResult>> GetAuditLogs(string itemType, int itemId);
        Task<List<AuditResult>> GetAuditLogsByToken(string correlationToken);
        Task CreateReportViewedAudit(ReportViewedAudit reportViewedAudit);
        Task<PagedRequestResult<ReportViewedAudit>> GetPagedReportViewedAudit(ReportViewedAuditPagedRequest reportViewedAuditPagedRequest);
    }
}

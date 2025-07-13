using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Contracts.Interfaces
{
    public interface IAuditLogService : IService
    {
        Task<AuditResult> GetAuditLog(int id);
        Task<List<AuditResult>> GetAuditLogs(string itemTypeName, int itemId);
        Task<List<AuditResult>> GetAuditLogsByToken(string correlationToken);
        Task<PagedRequestResult<AuditResult>> GetAuditLogsPaged(string itemTypeName, PagedRequest request);

    }
}
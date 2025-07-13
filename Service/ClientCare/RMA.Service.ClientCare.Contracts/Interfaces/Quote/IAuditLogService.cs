using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Quote
{
    public interface IAuditLogService : IService
    {
        Task<AuditResult> GetAuditLog(int id);
        Task<List<AuditResult>> GetAuditLogs(string itemType, int itemId);
        Task<List<AuditResult>> GetAuditLogsByToken(string correlationToken);
        Task<PagedRequestResult<AuditResult>> GetAuditLogsPaged(string itemTypeName, PagedRequest request);
    }
}
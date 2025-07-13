using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Audit;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface IAuditLogService : IService
    {
        Task<List<Billing.Contracts.Entities.AuditResult>> GetAuditLogs(string itemTypeName, int itemId);
        Task<int> AddAudit(AuditResult auditResult);
    }
}

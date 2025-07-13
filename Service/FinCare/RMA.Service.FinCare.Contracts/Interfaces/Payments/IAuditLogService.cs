using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Audit;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Contracts.Interfaces.Payments
{
    public interface IAuditLogService : IService
    {
        Task<AuditResult> GetAuditLog(int id);
        Task<List<AuditResult>> GetAuditLogs(string itemType, int itemId);
        Task<List<AuditResult>> GetAuditLogsByToken(string correlationToken);
        Task<List<AuditResult>> GetAuditLogsByItemAndDate(string itemType, DateTime startDate, DateTime endDate);
        Task<List<AuditResult>> GetAuditLogsByItemIdAndDate(List<int> itemIds, DateTime startDate, DateTime endDate, string itemType);
    }
}

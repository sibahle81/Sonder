using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface ISLAService : IService
    {
        Task HandleSLAStatusChangeAudit(SlaStatusChangeAudit slaStatusChangeAudit);
        Task<SlaItemTypeConfiguration> GetSLAItemTypeConfiguration(SLAItemTypeEnum slaItemType);
        Task<List<SlaItemTypeConfiguration>> GetSLAItemTypeConfigurations();
        Task<List<SlaStatusChangeAudit>> GetSLAStatusChangeAudits(SLAItemTypeEnum slaItemType, int itemId);
        Task<PagedRequestResult<SlaStatusChangeAudit>> GetPagedSLAStatusChangeAudits(SlaStatusChangeAuditSearchRequest slaStatusChangeAuditSearchRequest);
        Task EscalateOverdueSlas();
    }
}
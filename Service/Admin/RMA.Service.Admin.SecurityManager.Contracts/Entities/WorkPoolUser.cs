using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class WorkPoolUser : AuditDetails
    {
        public int TenantId { get; set; } // TenantId
        public int UserId { get; set; } // UserId
        public WorkPoolEnum WorkPool { get; set; } // WorkPoolId
        public bool IsPoolSuperUser { get; set; } // IsPoolSuperUser
        public bool PoolAccess { get; set; } // PoolAccess
    }
}

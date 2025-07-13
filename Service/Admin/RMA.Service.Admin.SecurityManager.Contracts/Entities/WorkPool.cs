using RMA.Common.Entities;

namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class WorkPool : AuditDetails
    {
        public int TenantId { get; set; }
        public string Name { get; set; }
        public int? Parent { get; set; }
    }
}
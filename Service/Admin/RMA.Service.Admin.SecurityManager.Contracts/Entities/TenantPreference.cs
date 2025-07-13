using RMA.Common.Entities;

namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class TenantPreference : AuditDetails
    {
        public int TenantId { get; set; } // TenantId
        public string Preferences { get; set; } // Preferences
    }
}

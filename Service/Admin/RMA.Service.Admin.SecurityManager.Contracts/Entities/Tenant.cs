using RMA.Common.Entities;

namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class Tenant : AuditDetails
    {
        public string Name { get; set; }
    }
}
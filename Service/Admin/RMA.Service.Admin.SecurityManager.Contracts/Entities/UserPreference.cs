using RMA.Common.Entities;

namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class UserPreference : AuditDetails
    {
        public int UserId { get; set; }
        public string Preferences { get; set; }
    }
}
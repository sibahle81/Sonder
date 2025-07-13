using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class SearchAccountResults : AuditDetails
    {
        public int RolePlayerId { get; set; }
        public string DisplayName { get; set; }
        public string EmailAddress { get; set; }
        public string FinPayeNumber { get; set; }
        public string ClientReference { get; set; }
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public string IndustryClassName { get; set; }
        public IndustryClassEnum? IndustryClass { get; set; }
    }
}

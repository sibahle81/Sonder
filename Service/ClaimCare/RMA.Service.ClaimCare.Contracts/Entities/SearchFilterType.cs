using RMA.Common.Entities;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class SearchFilterType : AuditDetails
    {
        public string Name { get; set; } // Name (length: 50)
    }
}
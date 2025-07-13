using RMA.Common.Entities;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class EarningType : AuditDetails
    {
        public int EarningTypeId { get; set; } // EarningTypeId (Primary key)
        public string Name { get; set; } // Name (length: 50)
        public bool IsVariable { get; set; } // IsVariable
        public bool IsRequired { get; set; } // IsRequired
    }
}

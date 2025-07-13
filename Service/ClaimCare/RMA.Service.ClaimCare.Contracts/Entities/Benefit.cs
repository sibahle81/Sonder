using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class Benefit : AuditDetails
    {
        public new int Id { get; set; } // Id (Primary key)
        public string Name { get; set; } // Name (length: 50)
        public string Code { get; set; } // Code (length: 50)
        public decimal CoverAmount { get; set; } // Code (length: 50)
        public decimal Premium { get; set; } // Code (length: 50)
        public BenefitTypeEnum BenefitType { get; set; } // BenefitTypeId
    }
}

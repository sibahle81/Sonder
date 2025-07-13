

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimEstimateGroup
    {
        public int ClaimEstimateGroupId { get; set; } // ClaimEstimateGroupId (Primary key)
        public string Name { get; set; } // Name (length: 50)
        public string Description { get; set; } // Description (length: 50)
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        public EstimateType EstimateTypes { get; set; }

    }
}

using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimDetailsForSTPIntegration
    {
        public string ClaimLiabilityStatus { get; set; }
        public DateTime? DateOfDeath { get; set; }
        public DateTime? EventDate { get; set; }
        public bool IsStraightThroughProcess { get; set; }

    }
}

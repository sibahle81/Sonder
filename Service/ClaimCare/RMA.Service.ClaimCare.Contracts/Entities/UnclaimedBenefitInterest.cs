using RMA.Common.Entities;

using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class UnclaimedBenefitInterest : AuditDetails
    {
        public int UnclaimedBenefitInterestId { get; set; } // UnclaimedBenefitInterestId (Primary key)
        public DateTime StartDate { get; set; } // StartDate
        public DateTime EndDate { get; set; } // EndDate
        public decimal Naca { get; set; } // NACA
        public int InvestmentPeriod { get; set; } // InvestmentPeriod
        public decimal CumulativeRate { get; set; } // CumulativeRate
        public decimal IncrementalRate { get; set; } // IncrementalRate
        public int? UnclaimedBenefitHeaderId { get; set; } // UnclaimedBenefitHeaderId
    }
}

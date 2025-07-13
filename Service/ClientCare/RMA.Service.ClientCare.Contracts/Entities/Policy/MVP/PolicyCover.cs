using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy.MVP
{
    public class PolicyCover
    {
        public string BenefitName { get; set; } = "";
        public DateTime? CommencementDate { get; set; } = null;
        public decimal LifePremium { get; set; } = 0;
        public decimal FuneralPremium { get; set; } = 0;
        public decimal LifeCoverAmount { get; set; } = 0;
        public decimal FuneralCoverAmount { get; set; } = 0;
    }
}

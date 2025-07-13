using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy.Common
{
    public class PolicyCover
    {
        public string BenefitName { get; set; } = "";
        public DateTime? CommencementDate { get; set; } = null;
        public decimal Premium { get; set; } = 0;
        public decimal CoverAmount { get; set; } = 0;
    }
}

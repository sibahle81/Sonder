using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyChangeDetail
    {
        public int PolicyId { get; set; }
        public DateTime PolicyInceptionDate { get; set; }
        public int? DecemberInstallmentDayOfMonth { get; set; }
        public DateTime FirstInstallmentDate { get; set; }
    }
}

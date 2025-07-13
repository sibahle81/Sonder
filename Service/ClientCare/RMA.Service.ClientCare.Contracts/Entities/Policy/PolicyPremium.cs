using RMA.Common.Entities;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyPremium : AuditDetails
    {
        public int ClientCoverId { get; set; }
        public decimal CoverPremium { get; set; }
    }
}
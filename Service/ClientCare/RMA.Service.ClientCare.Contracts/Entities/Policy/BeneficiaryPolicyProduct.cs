using RMA.Common.Entities;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class BeneficiaryPolicyProduct : AuditDetails
    {
        public int BeneficiaryId { get; set; }
        public int PolicyId { get; set; }
        public int ProductId { get; set; }
    }
}
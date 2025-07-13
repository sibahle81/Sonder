using RMA.Common.Entities;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class InsuredLifePolicyProduct : AuditDetails
    {
        public int InsuredLifeId { get; set; }
        public int PolicyId { get; set; }
        public int ProductId { get; set; }
        public int? ProductCoverOptionId { get; set; }
    }
}
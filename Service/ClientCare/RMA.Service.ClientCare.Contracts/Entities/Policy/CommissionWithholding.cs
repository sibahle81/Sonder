using RMA.Common.Entities;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class CommissionWithholding : AuditDetails
    {
        public int CommissionDetailId { get; set; }
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public int ClientId { get; set; }
        public string ClientName { get; set; }
        public string ClientReference { get; set; }
        public int BrokerId { get; set; }
        public string BrokerName { get; set; }
        public string Period { get; set; }
        public decimal WithholdingPercentage { get; set; }
        public decimal WithholdingAmount { get; set; }
    }
}

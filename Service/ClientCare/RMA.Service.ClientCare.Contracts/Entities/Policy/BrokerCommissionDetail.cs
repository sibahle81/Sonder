using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class BrokerCommissionDetail
    {
        public string PolicyNumber { get; set; }
        public PolicyBroker Broker { get; set; }
        public string MemberName { get; set; }
        public string MemberIdentityNumber { get; set; }
        public DateTime MemberJoinDate { get; set; }
        public string PaidForMonth { get; set; }
        public decimal Premium { get; set; }
        public decimal Clawback { get; set; }
        public decimal Commission { get; set; }
        public decimal CommissionPercentage { get; set; }
        public decimal RetentionPercentage { get; set; }
        public decimal RetentionAmount { get; set; }
    }
}
